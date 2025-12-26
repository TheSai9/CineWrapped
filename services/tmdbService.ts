
import { TMDB_API_KEY } from '../config';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getMoviePoster = async (title: string, year: string): Promise<string | null> => {
  // Use the imported key from config.ts
  const apiKey = TMDB_API_KEY;

  if (!apiKey) {
    console.debug("TMDB API Key missing. Posters will not load.");
    return null;
  }

  try {
    // Search for the movie
    const searchUrl = `${BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0 && data.results[0].poster_path) {
      return `${IMAGE_BASE_URL}${data.results[0].poster_path}`;
    }
    return null;
  } catch (error) {
    console.warn(`Failed to fetch poster for ${title}`, error);
    return null;
  }
};
