"""
Tests for the Resume Analyzer API.
Run with: pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.models.schemas import AnalysisResult, StrengthBreakdown

client = TestClient(app)

MOCK_RESULT = AnalysisResult(
    match_score=82,
    verdict="STRONG MATCH",
    summary="Strong candidate with relevant Python and ML experience.",
    matched_skills=["Python", "FastAPI", "Machine Learning"],
    missing_skills=["Kubernetes", "AWS"],
    suggestions=["Add cloud certifications.", "Mention Kubernetes experience."],
    strengths=StrengthBreakdown(
        experience="5+ years relevant",
        education="CS Degree",
        keywords="Good density",
        formatting="Clean structure",
    ),
    cosine_similarity=0.81,
)

SAMPLE_RESUME = """
John Doe | john@example.com | Python Developer
Experience: 5 years building REST APIs with FastAPI and Django.
Skills: Python, FastAPI, scikit-learn, PostgreSQL, Docker.
Education: B.S. Computer Science, MIT 2018.
"""

SAMPLE_JD = """
Senior Python Backend Engineer. Requirements: FastAPI, Python 3.10+,
Machine Learning experience, Docker, PostgreSQL. Nice to have: Kubernetes, AWS.
"""


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@patch("app.routers.resume.compute_similarity", return_value=0.81)
@patch("app.routers.resume.analyze_resume", return_value=MOCK_RESULT)
def test_analyze_text(mock_llm, mock_sim):
    resp = client.post(
        "/api/v1/analyze/text",
        json={"resume_text": SAMPLE_RESUME, "job_description": SAMPLE_JD},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["match_score"] == 82
    assert data["verdict"] == "STRONG MATCH"
    assert "Python" in data["matched_skills"]
    assert data["cosine_similarity"] == 0.81


def test_analyze_text_too_short():
    resp = client.post(
        "/api/v1/analyze/text",
        json={"resume_text": "short", "job_description": SAMPLE_JD},
    )
    assert resp.status_code == 422


@patch("app.routers.resume.compute_similarity", return_value=0.81)
@patch("app.routers.resume.analyze_resume", return_value=MOCK_RESULT)
def test_analyze_upload_txt(mock_llm, mock_sim):
    file_content = SAMPLE_RESUME.encode("utf-8")
    resp = client.post(
        "/api/v1/analyze/upload",
        files={"resume": ("resume.txt", file_content, "text/plain")},
        data={"job_description": SAMPLE_JD},
    )
    assert resp.status_code == 200
    assert resp.json()["match_score"] == 82


def test_analyze_upload_bad_type():
    resp = client.post(
        "/api/v1/analyze/upload",
        files={"resume": ("resume.xlsx", b"fake", "application/vnd.ms-excel")},
        data={"job_description": SAMPLE_JD},
    )
    assert resp.status_code == 415
