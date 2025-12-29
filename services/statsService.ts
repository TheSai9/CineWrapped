
import { DiaryEntry, RatingEntry, ProcessedStats, DailyEntryDetail, SimpleMovie } from '../types';

export const processData = (diary: DiaryEntry[], ratings: RatingEntry[]): ProcessedStats | null => {
  if (diary.length === 0) return null;

  // Filter for the most recent complete year present in the data or the current year
  const sortedDiary = [...diary].sort((a, b) => {
      const dateA = new Date(a["Watched Date"]);
      const dateB = new Date(b["Watched Date"]);
      return (isNaN(dateB.getTime()) ? 0 : dateB.getTime()) - (isNaN(dateA.getTime()) ? 0 : dateA.getTime());
  });
  
  // Find first valid date
  const latestEntry = sortedDiary.find(d => !isNaN(new Date(d["Watched Date"]).getTime()));
  if (!latestEntry) return null;

  const latestDate = new Date(latestEntry["Watched Date"]);
  const targetYear = latestDate.getFullYear();

  const yearDiary = sortedDiary.filter(d => d["Watched Date"].startsWith(targetYear.toString()));
  
  if (yearDiary.length === 0) return null;

  // 1. Basic Counts
  const totalWatched = yearDiary.length;
  // Estimate runtime: approx 105 mins per movie
  const totalRuntimeHours = Math.round((totalWatched * 105) / 60);

  // 2. Temporal Analysis & Aggregation Buckets
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const monthData: Record<string, { count: number; movies: SimpleMovie[] }> = {};
  months.forEach(m => monthData[m] = { count: 0, movies: [] });

  const dayData: Record<string, { count: number; movies: SimpleMovie[] }> = {};
  days.forEach(d => dayData[d] = { count: 0, movies: [] });

  const decadeData: Record<string, { count: number; movies: SimpleMovie[] }> = {};
  
  const dateCounts: Record<string, number> = {};
  const dailyEntries: Record<string, DailyEntryDetail[]> = {}; // Store details per day

  // Prepare list for enrichment
  const allFilms: SimpleMovie[] = [];
  const rewatchedFilms: SimpleMovie[] = [];

  yearDiary.forEach(entry => {
    const date = new Date(entry["Watched Date"]);
    if (isNaN(date.getTime())) return;

    const month = months[date.getMonth()];
    const day = days[date.getDay()];
    const dateStr = entry["Watched Date"];

    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;

    // Year extraction logic
    let yearStr: string | undefined = entry.Year;
    if (!yearStr) {
        const key = Object.keys(entry).find(k => k.toLowerCase() === 'year');
        if (key) yearStr = (entry as any)[key];
    }
    if (!yearStr) {
        const vals = Object.values(entry);
        if (vals.length > 2) yearStr = vals[2];
    }
    let cleanYear = "";
    if (yearStr) {
        const match = yearStr.toString().match(/(\d{4})/);
        if (match) cleanYear = match[1];
    }
    
    const simpleMovie: SimpleMovie = {
        title: entry.Name,
        year: cleanYear,
        rating: entry.Rating
    };

    // Add to allFilms list
    allFilms.push(simpleMovie);

    // Add to Rewatches
    if (entry.Rewatch === "Yes") {
        rewatchedFilms.push(simpleMovie);
    }

    // Add to Monthly/Daily Aggregations
    if (monthData[month]) {
        monthData[month].count++;
        monthData[month].movies.push(simpleMovie);
    }
    if (dayData[day]) {
        dayData[day].count++;
        dayData[day].movies.push(simpleMovie);
    }

    // Add to daily entries
    if (!dailyEntries[dateStr]) {
        dailyEntries[dateStr] = [];
    }
    dailyEntries[dateStr].push({
        name: entry.Name,
        rating: entry.Rating,
        year: cleanYear,
        uri: entry["Letterboxd URI"]
    });
    
    // Decade Logic
    if (cleanYear) {
        const releaseYear = parseInt(cleanYear);
        if (releaseYear > 1880 && releaseYear <= new Date().getFullYear() + 2) {
            const decade = Math.floor(releaseYear / 10) * 10;
            const decadeStr = `${decade}s`;
            if (!decadeData[decadeStr]) {
                decadeData[decadeStr] = { count: 0, movies: [] };
            }
            decadeData[decadeStr].count++;
            decadeData[decadeStr].movies.push(simpleMovie);
        }
    }
  });

  const monthlyDistribution = months.map(m => ({ 
      month: m, 
      count: monthData[m].count,
      movies: monthData[m].movies 
  }));

  const dayOfWeekDistribution = days.map(d => ({ 
      day: d, 
      count: dayData[d].count,
      movies: dayData[d].movies 
  }));
  
  const decadeDistribution = Object.entries(decadeData)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([decade, data]) => ({ 
        decade, 
        count: data.count,
        movies: data.movies 
    }));

  const topMonth = Object.entries(monthData).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || "None";
  const topDayOfWeek = Object.entries(dayData).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || "None";
  
  const busyDayEntry = Object.entries(dateCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestDay = { date: busyDayEntry?.[0] || "", count: busyDayEntry?.[1] || 0 };

  const dailyActivity = Object.entries(dateCounts).map(([date, count]) => ({ date, count }));

  // 3. Streak Calculation
  const dates = Object.keys(dateCounts).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;

  dates.forEach(d => {
    const currDate = new Date(d);
    if (prevDate) {
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    prevDate = currDate;
  });

  // 4. Ratings Analysis
  // Improved: Fallback to diary ratings if ratings CSV is not provided
  let sourceRatings = ratings;
  if (sourceRatings.length === 0) {
     sourceRatings = diary.filter(d => d.Rating).map(d => ({
         Date: d["Watched Date"],
         Name: d.Name,
         Year: d.Year,
         "Letterboxd URI": d["Letterboxd URI"],
         Rating: d.Rating
     }));
  }

  const yearRatings = sourceRatings.filter(r => r.Date.startsWith(targetYear.toString()));
  
  let ratingSum = 0;
  const ratingData: Record<string, { count: number; movies: SimpleMovie[] }> = {};
  
  yearRatings.forEach(r => {
    const val = parseFloat(r.Rating);
    if (!isNaN(val)) {
      ratingSum += val;
      if (!ratingData[r.Rating]) {
          ratingData[r.Rating] = { count: 0, movies: [] };
      }
      ratingData[r.Rating].count++;
      
      // Create SimpleMovie from RatingEntry
      ratingData[r.Rating].movies.push({
          title: r.Name,
          year: r.Year,
          rating: r.Rating
      });
    }
  });

  const averageRating = yearRatings.length > 0 ? parseFloat((ratingSum / yearRatings.length).toFixed(2)) : 0;
  const ratingDistribution = Object.entries(ratingData)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([rating, data]) => ({ 
        rating, 
        count: data.count, 
        movies: data.movies 
    }));

  // 5. Rewatches
  const rewatchCount = yearDiary.filter(d => d.Rewatch === "Yes").length;

  // 6. Top Rated
  // Logic update: If >5 films are 5 stars, show all. Else top 5.
  const fiveStarFilms = yearRatings.filter(r => parseFloat(r.Rating) === 5);
  let topRatedFilms: RatingEntry[] = [];

  if (fiveStarFilms.length > 5) {
      // If we have more than 5 five-star films, show all of them (sorted alphabetically for stability)
      topRatedFilms = fiveStarFilms.sort((a, b) => a.Name.localeCompare(b.Name));
  } else {
      // Otherwise fallback to top 5 sorted by rating
      topRatedFilms = [...yearRatings]
        .sort((a, b) => parseFloat(b.Rating) - parseFloat(a.Rating))
        .slice(0, 5);
  }
  
  // Fallback for first/last film
  const firstFilm = yearDiary.length > 0 ? yearDiary[yearDiary.length - 1].Name : "N/A";
  const lastFilm = yearDiary.length > 0 ? yearDiary[0].Name : "N/A";

  return {
    year: targetYear,
    totalWatched,
    totalRuntimeHours,
    topMonth,
    topDayOfWeek,
    averageRating,
    ratingDistribution,
    monthlyDistribution,
    dailyActivity,
    dailyEntries,
    dayOfWeekDistribution,
    decadeDistribution,
    rewatchCount,
    rewatchedFilms,
    topRatedFilms,
    longestStreak: maxStreak,
    busiestDay,
    firstFilm,
    lastFilm,
    uniqueFilmsCount: totalWatched - rewatchCount,
    moviesPerWeekAvg: parseFloat((totalWatched / 52).toFixed(1)),
    allFilms: allFilms
  };
};
