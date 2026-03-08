from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import resume, health

app = FastAPI(
    title="ResumeAI Analyzer API",
    description="AI-powered resume analysis using BERT embeddings and Claude LLM",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(resume.router, prefix="/api/v1", tags=["Resume"])
