
# CineWrapped: Letterboxd Year in Review

![CineWrapped Banner](<img width="1668" height="661" alt="image" src="https://github.com/user-attachments/assets/771f9d38-9333-43e5-beca-0780fd95af4a" />)

A cinematic, data-driven storytelling experience that visualizes your Letterboxd movie watching history. Influenced by the "Spotify Wrapped" format and designed with a bold **Bauhaus** aesthetic, this application turns your raw CSV exports into a beautiful, interactive presentation.

## ✨ Features

*   **📊 Volume Analysis**: Visualizes total films watched, hours spent, and the distribution of film eras (decades).
*   **📅 Rhythm & Patterns**: Interactive calendar heatmap showing daily activity, watching streaks, and monthly/weekly breakdowns.
*   **⭐ Critical Analysis**: Deep dive into your rating habits, average scores, and rating distributions.
*   **🏆 Favorites & Rewatches**: Highlights your highest-rated films, rewatch statistics, and "new vs. old" discovery rates.
*   **🎬 A-List Insights**: (Powered by TMDB) Identifies your most-watched actors, directors, and genres through background data enrichment.
*   **🤖 AI Persona**: Generates a witty, personalized "Cinema Persona" based on your specific stats (e.g., "The Dedicated Cinephile").
*   **🎨 Bauhaus Design**: A strict, high-contrast design system using primary colors (Red, Blue, Yellow) and geometric layouts.
*   **🖱️ Interactive Drill-downs**: Click on chart bars, heatmap squares, or stats to reveal a dropdown list of specific movies associated with that data point.

## 📸 Visuals

| Volume Analysis | Rhythm Heatmap |
|:---:|:---:|
| ![Volume Slide](<img width="1317" height="676" alt="image" src="https://github.com/user-attachments/assets/286e6d8a-8eea-4bfd-9d76-5c7954565723" />) | ![Heatmap Slide](<img width="1225" height="691" alt="image" src="https://github.com/user-attachments/assets/b43b4897-aba6-42c7-b341-ee104dca41a0" />) |

| A-List Cast & Crew | Interactive Dropdowns |
|:---:|:---:|
| ![Cast Slide](<img width="1356" height="698" alt="image" src="https://github.com/user-attachments/assets/6a09864c-ae60-48ef-a625-00adb363e36e" />) | ![Dropdown UI](<img width="1361" height="649" alt="image" src="https://github.com/user-attachments/assets/e10937a3-2655-433e-81ec-c1c626c0ee8b" />) |

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS, Framer Motion (for animations)
*   **Charts**: Recharts
*   **Data Parsing**: Custom CSV Parser (Client-side)
*   **Enrichment API**: The Movie Database (TMDB)
*   **AI Generation**: Google Gemini API

## 🚀 Setup Instructions

### Prerequisites
*   Node.js (v18 or higher)
*   A TMDB API Key (Free)
*   A Google Gemini API Key (Free tier available)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/TheSai9/cinewrapped.git
    cd cinewrapped
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Keys**
    *   **TMDB**: Open `config.ts` and replace the placeholder with your TMDB API Key.
        ```typescript
        export const TMDB_API_KEY = 'your_tmdb_api_key_here';
        ```
    *   **Gemini AI**: Create a `.env` file in the root directory and add your key.
        ```env
        API_KEY=your_google_gemini_api_key
        ```

4.  **Run the application**
    ```bash
    npm start
    ```

## 📂 How to use

1.  **Export your data from Letterboxd**:
    *   Go to Letterboxd Settings > Import & Export.
    *   Click "Export Your Data".
    *   Download and unzip the file.
2.  **Launch CineWrapped**:
    *   Open the app in your browser (usually `http://localhost:3000` or `5173`).
3.  **Upload Files**:
    *   Select `diary.csv` for the main log.
    *   (Optional) Select `ratings.csv` for deeper rating analysis.
4.  **Enjoy**:
    *   Click "Construct Analysis" and navigate through your year in review using the arrows or keyboard.

## 📄 License

MIT
