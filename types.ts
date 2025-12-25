export interface DiaryEntry {
  Date: string; // "YYYY-MM-DD"
  Name: string;
  Year: string;
  "Letterboxd URI": string;
  Rating: string; // "3.5"
  Rewatch: string; // "Yes" or ""
  Tags: string;
  "Watched Date": string;
}

export interface RatingEntry {
  Date: string;
  Name: string;
  Year: string;
  "Letterboxd URI": string;
  Rating: string;
}

export interface ProcessedStats {
  totalWatched: number;
  totalRuntimeHours: number; // Est
  topMonth: string;
  topDayOfWeek: string;
  averageRating: number;
  ratingDistribution: { rating: string; count: number }[];
  monthlyDistribution: { month: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
  dayOfWeekDistribution: { day: string; count: number }[];
  decadeDistribution: { decade: string; count: number }[];
  rewatchCount: number;
  topRatedFilms: RatingEntry[]; // Top 5
  longestStreak: number;
  busiestDay: { date: string; count: number };
  firstFilm: string;
  lastFilm: string;
  uniqueFilmsCount: number;
  moviesPerWeekAvg: number;
  year: number; // The analysis year
}

export interface PersonaResult {
    title: string;
    description: string;
}