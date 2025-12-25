import { DiaryEntry, RatingEntry, ProcessedStats } from '../types';

export const processData = (diary: DiaryEntry[], ratings: RatingEntry[]): ProcessedStats | null => {
  if (diary.length === 0) return null;

  // Filter for the most recent complete year present in the data or the current year
  // For simplicity, we'll take the year of the most recent entry
  const sortedDiary = [...diary].sort((a, b) => new Date(b["Watched Date"]).getTime() - new Date(a["Watched Date"]).getTime());
  const latestDate = new Date(sortedDiary[0]["Watched Date"]);
  const targetYear = latestDate.getFullYear();

  const yearDiary = sortedDiary.filter(d => d["Watched Date"].startsWith(targetYear.toString()));
  
  if (yearDiary.length === 0) return null;

  // 1. Basic Counts
  const totalWatched = yearDiary.length;
  // Estimate runtime: approx 105 mins per movie
  const totalRuntimeHours = Math.round((totalWatched * 105) / 60);

  // 2. Temporal Analysis
  const monthCounts: Record<string, number> = {};
  const dayCounts: Record<string, number> = {};
  const dateCounts: Record<string, number> = {};

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  yearDiary.forEach(entry => {
    const date = new Date(entry["Watched Date"]);
    const month = months[date.getMonth()];
    const day = days[date.getDay()];
    const dateStr = entry["Watched Date"];

    monthCounts[month] = (monthCounts[month] || 0) + 1;
    dayCounts[day] = (dayCounts[day] || 0) + 1;
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
  });

  const monthlyDistribution = months.map(m => ({ month: m, count: monthCounts[m] || 0 }));
  const topMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
  const topDayOfWeek = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
  
  const busyDayEntry = Object.entries(dateCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestDay = { date: busyDayEntry?.[0] || "", count: busyDayEntry?.[1] || 0 };

  // Prepare Daily Activity for Heatmap
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
  const yearRatings = ratings.filter(r => r.Date.startsWith(targetYear.toString()));
  
  let ratingSum = 0;
  const ratingDistMap: Record<string, number> = {};
  
  yearRatings.forEach(r => {
    const val = parseFloat(r.Rating);
    if (!isNaN(val)) {
      ratingSum += val;
      ratingDistMap[r.Rating] = (ratingDistMap[r.Rating] || 0) + 1;
    }
  });

  const averageRating = yearRatings.length > 0 ? parseFloat((ratingSum / yearRatings.length).toFixed(2)) : 0;
  const ratingDistribution = Object.entries(ratingDistMap)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([rating, count]) => ({ rating, count }));

  // 5. Rewatches
  const rewatchCount = yearDiary.filter(d => d.Rewatch === "Yes").length;

  // 6. Top Rated
  const topRatedFilms = [...yearRatings]
    .sort((a, b) => parseFloat(b.Rating) - parseFloat(a.Rating))
    .slice(0, 5);

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
    rewatchCount,
    topRatedFilms,
    longestStreak: maxStreak,
    busiestDay,
    firstFilm: yearDiary[yearDiary.length - 1].Name,
    lastFilm: yearDiary[0].Name,
    uniqueFilmsCount: totalWatched - rewatchCount,
    moviesPerWeekAvg: parseFloat((totalWatched / 52).toFixed(1)),
  };
};