# ResumeAI — Frontend

React + Vite frontend for the AI Resume Analyzer. Connects to the FastAPI backend.

## Project Structure

```
resume-frontend/
├── index.html
├── vite.config.js          # Proxies /api → localhost:8000
├── src/
│   ├── main.jsx
│   ├── App.jsx             # Root: state, layout, analyze flow
│   ├── index.css           # Design tokens, animations
│   ├── services/
│   │   └── api.js          # fetch wrappers for backend endpoints
│   └── components/
│       ├── Header.jsx      # Nav + live backend status indicator
│       ├── UploadZone.jsx  # Drag-and-drop resume uploader
│       ├── LoadingState.jsx # Animated progress stages
│       ├── ScoreRing.jsx   # SVG circular score gauge
│       ├── SkillTags.jsx   # Matched / missing skill chips
│       └── ResultsPanel.jsx # Full results layout
```

## Quick Start

```bash
cd resume-frontend
npm install
npm run dev
```

App runs at: **http://localhost:5173**

Make sure the backend is running at `http://localhost:8000` first.

## How It Connects to the Backend

`vite.config.js` proxies all `/api` requests to `http://localhost:8000`:

```js
proxy: {
  '/api': { target: 'http://localhost:8000', changeOrigin: true }
}
```

`src/services/api.js` exposes two functions:
- `analyzeUpload(file, jobDescription)` → `POST /api/v1/analyze/upload`
- `analyzeText(resumeText, jobDescription)` → `POST /api/v1/analyze/text`

## Features

- **Drag-and-drop upload** for PDF, DOCX, TXT (max 10 MB)
- **Paste text mode** as an alternative
- **Live backend status** indicator in header
- **Animated loading** with real ML stage labels (BERT → FAISS → Claude)
- **Score ring** with SVG gauge colored by score range
- **BERT similarity bar** showing raw cosine similarity from backend
- **Skill chips** for matched (green) and missing (red) skills
- **Numbered AI recommendations** from Claude
- **Profile breakdown** cards (experience, education, keywords, formatting)

## Build for Production

```bash
npm run build
# Output in dist/
```

To deploy alongside the FastAPI backend, serve `dist/` as static files or use Nginx.
