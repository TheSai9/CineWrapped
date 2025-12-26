
import { TMDB_API_KEY } from '../config';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getMoviePoster = async (title: string, year: string): Promise<string | null> => {
  const apiKey = TMDB_API_KEY;
  if (!apiKey) return null;

  try {
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

// New interfaces for internal TMDB use
interface TMDBMovieDetail {
  id: number;
  title: string;
  genres: { id: number; name: string }[];
  credits: {
    cast: { id: number; name: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; profile_path: string | null }[];
  };
}

/**
 * Fetches details for a single movie by title/year.
 * Includes Credits and Genres.
 */
const getMovieDetails = async (title: string, year: string): Promise<TMDBMovieDetail | null> => {
  const apiKey = TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    // 1. Search to get ID
    const searchUrl = `${BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) return null;
    const movieId = searchData.results[0].id;

    // 2. Get Details with Append to Response for Credits
    const detailUrl = `${BASE_URL}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    return detailData as TMDBMovieDetail;
  } catch (error) {
    return null;
  }
};

/**
 * Batches requests to avoid rate limiting. 
 * Processes a list of films and returns aggregated stats.
 */
export const fetchEnrichedData = async (
  films: { title: string; year: string }[], 
  onProgress?: (count: number, total: number) => void
) => {
  const actorCounts: Record<string, { count: number; image: string | null }> = {};
  const directorCounts: Record<string, { count: number; image: string | null }> = {};
  const genreCounts: Record<string, number> = {};
  
  let processed = 0;
  const total = films.length;

  // Process in chunks of 5 to be nice to the API
  const CHUNK_SIZE = 5;
  
  for (let i = 0; i < films.length; i += CHUNK_SIZE) {
    const chunk = films.slice(i, i + CHUNK_SIZE);
    
    const promises = chunk.map(async (film) => {
      const details = await getMovieDetails(film.title, film.year);
      if (details) {
        // Aggregate Genres
        details.genres.forEach(g => {
          genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
        });

        // Aggregate Actors (Limit to top 5 billed cast per movie to avoid extras)
        details.credits.cast.slice(0, 5).forEach(actor => {
          if (!actorCounts[actor.name]) {
            actorCounts[actor.name] = { count: 0, image: actor.profile_path };
          }
          actorCounts[actor.name].count++;
        });

        // Aggregate Directors
        details.credits.crew.forEach(member => {
            if (member.job === 'Director') {
                if (!directorCounts[member.name]) {
                    directorCounts[member.name] = { count: 0, image: member.profile_path };
                }
                directorCounts[member.name].count++;
            }
        });
      }
    });

    await Promise.all(promises);
    processed += chunk.length;
    if (onProgress) onProgress(Math.min(processed, total), total);
    
    // Small delay between chunks
    await new Promise(r => setTimeout(r, 200));
  }

  // Format and sort results
  const topActors = Object.entries(actorCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, data]) => ({ 
        name, 
        count: data.count, 
        image: data.image ? `${IMAGE_BASE_URL}${data.image}` : undefined 
    }));

  const topDirectors = Object.entries(directorCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, data]) => ({ 
        name, 
        count: data.count, 
        image: data.image ? `${IMAGE_BASE_URL}${data.image}` : undefined 
    }));

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  return { topActors, topDirectors, topGenres };
};
