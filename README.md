# ResumeAI Analyzer — Backend

FastAPI backend for AI-powered resume analysis. Uses BERT embeddings + FAISS for semantic similarity and Claude LLM for deep structured analysis.

## Architecture

```
resume-analyzer-backend/
├── app/
│   ├── main.py                  # FastAPI app + CORS
│   ├── routers/
│   │   ├── resume.py            # POST /analyze/upload  &  /analyze/text
│   │   └── health.py            # GET  /health
│   ├── services/
│   │   ├── extractor.py         # PDF / DOCX / TXT text extraction
│   │   ├── similarity.py        # BERT + FAISS cosine similarity
│   │   └── llm_analyzer.py      # Claude LLM deep analysis
│   └── models/
│       └── schemas.py           # Pydantic request/response models
├── tests/
│   └── test_api.py              # pytest test suite
├── requirements.txt
├── .env.example
└── README.md
```

## ML Pipeline

```
User uploads resume (PDF/DOCX/TXT)
         │
         ▼
  Text Extraction (pdfplumber / python-docx)
         │
         ├──────────────────────────────────────────┐
         ▼                                          ▼
BERT Embeddings (all-MiniLM-L6-v2)         Job Description
         │
         ▼
FAISS IndexFlatIP (cosine on normalized vectors)
         │
         ▼
  Cosine Similarity Score (0.0 – 1.0)
         │
         ▼
Claude LLM (calibrated with similarity score)
         │
         ▼
  AnalysisResult (match_score, skills, suggestions, …)
```

## Quick Start

### 1. Clone & install

```bash
cd resume-analyzer-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set your API key

```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

### 3. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## API Endpoints

### `POST /api/v1/analyze/upload`
Upload a resume file + job description form field.

```bash
curl -X POST http://localhost:8000/api/v1/analyze/upload \
  -F "resume=@my_resume.pdf" \
  -F "job_description=Senior Python Engineer, requires FastAPI, ML..."
```

### `POST /api/v1/analyze/text`
Send both resume and JD as JSON text.

```bash
curl -X POST http://localhost:8000/api/v1/analyze/text \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "John Doe, Python developer with 5 years...",
    "job_description": "We need a FastAPI expert with ML experience..."
  }'
```

### Sample Response

```json
{
  "match_score": 82,
  "verdict": "STRONG MATCH",
  "summary": "Strong candidate with highly relevant Python and ML experience...",
  "matched_skills": ["Python", "FastAPI", "scikit-learn", "Docker"],
  "missing_skills": ["Kubernetes", "AWS", "Terraform"],
  "suggestions": [
    "Add AWS or GCP certification to boost cloud credibility.",
    "Quantify achievements with metrics (e.g., 'reduced latency by 40%').",
    "Mention Kubernetes experience or add it as a learning goal.",
    "Include links to GitHub projects demonstrating ML work.",
    "Tailor your summary section to mirror the job title."
  ],
  "strengths": {
    "experience": "5+ years directly relevant backend experience",
    "education": "CS degree from top university",
    "keywords": "Good ATS keyword density",
    "formatting": "Clean, readable structure"
  },
  "cosine_similarity": 0.8134
}
```

## Connecting to the React Frontend

In your React app, update the API base URL:

```javascript
// Replace the direct Anthropic API calls with:
const BASE = "http://localhost:8000/api/v1";

// For file upload:
const formData = new FormData();
formData.append("resume", file);
formData.append("job_description", jobDesc);
const res = await fetch(`${BASE}/analyze/upload`, { method: "POST", body: formData });

// For text:
const res = await fetch(`${BASE}/analyze/text`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resume_text: resumeText, job_description: jobDesc }),
});
const result = await res.json();
```

## Running Tests

```bash
pytest tests/ -v
```

## Dependencies

| Package | Purpose |
|---|---|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `anthropic` | Claude LLM API |
| `sentence-transformers` | BERT embeddings (all-MiniLM-L6-v2) |
| `faiss-cpu` | Fast vector similarity search |
| `scikit-learn` | TF-IDF fallback similarity |
| `pdfplumber` | PDF text extraction |
| `python-docx` | DOCX text extraction |
| `pydantic` | Data validation |
