
import { GoogleGenAI } from "@google/genai";
import { ProcessedStats, PersonaResult } from '../types';

// Fallback if API key is not present
const FALLBACK_PERSONA: PersonaResult = {
  title: "The Dedicated Cinephile",
  description: "You watched a ton of movies this year. Your stats show a consistent love for the medium, exploring various genres and eras. Without an AI connection, we can't roast you specifically, but know that you have excellent taste!"
};

export const generatePersona = async (stats: ProcessedStats): Promise<PersonaResult> => {
  // Safely check for process.env to avoid crashing in browser-only environments
  let apiKey: string | undefined;
  try {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    // Ignore reference errors
  }
  
  if (!apiKey) {
    console.warn("API Key not found, using fallback persona.");
    return FALLBACK_PERSONA;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Based on the following movie watching statistics for the year ${stats.year}, generate a creative "Cinema Persona" title and a short, witty, slightly roasting but ultimately celebratory description (max 60 words).
      
      Stats:
      - Total Watched: ${stats.totalWatched}
      - Top Month: ${stats.topMonth}
      - Average Rating: ${stats.averageRating}
      - Rewatches: ${stats.rewatchCount}
      - Longest Streak: ${stats.longestStreak} days
      - Busiest Day: ${stats.busiestDay.count} movies on one day
      - First Film: ${stats.firstFilm}
      - Last Film: ${stats.lastFilm}
      - Favorite Day to Watch: ${stats.topDayOfWeek}

      Format the output as JSON with keys "title" and "description".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");

    const result = JSON.parse(text);
    return {
      title: result.title || "The Mystery Viewer",
      description: result.description || "An error occurred generating your description, but your stats speak for themselves."
    };

  } catch (error) {
    console.error("Gemini generation failed:", error);
    return FALLBACK_PERSONA;
  }
};
