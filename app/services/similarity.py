"""
ML Similarity Service
- Uses sentence-transformers (BERT-based) to embed resume & job description
- Computes cosine similarity via FAISS (fast vector search)
- Falls back to TF-IDF + sklearn cosine_similarity if transformers unavailable
"""

import logging
import numpy as np

logger = logging.getLogger(__name__)

# Lazy-loaded globals (loaded once on first use)
_sentence_model = None
_use_transformers = None


def _load_sentence_model():
    global _sentence_model, _use_transformers
    if _use_transformers is not None:
        return _use_transformers

    try:
        from sentence_transformers import SentenceTransformer
        _sentence_model = SentenceTransformer("all-MiniLM-L6-v2")  # Fast & accurate
        _use_transformers = True
        logger.info("Loaded sentence-transformers model: all-MiniLM-L6-v2")
    except ImportError:
        logger.warning("sentence-transformers not available. Falling back to TF-IDF.")
        _use_transformers = False

    return _use_transformers


def compute_similarity(text_a: str, text_b: str) -> float:
    """
    Returns cosine similarity score between 0.0 and 1.0.
    Uses BERT embeddings via FAISS if available, else TF-IDF fallback.
    """
    use_transformers = _load_sentence_model()

    if use_transformers:
        return _bert_faiss_similarity(text_a, text_b)
    else:
        return _tfidf_similarity(text_a, text_b)


def _bert_faiss_similarity(text_a: str, text_b: str) -> float:
    """BERT embeddings + FAISS inner product (equivalent to cosine on normalized vectors)."""
    try:
        import faiss

        embeddings = _sentence_model.encode(
            [text_a, text_b],
            normalize_embeddings=True,  # L2-normalize for cosine via dot product
            show_progress_bar=False,
        )

        dim = embeddings.shape[1]
        index = faiss.IndexFlatIP(dim)  # Inner Product on normalized = cosine similarity
        index.add(np.array([embeddings[0]]))

        distances, _ = index.search(np.array([embeddings[1]]), k=1)
        similarity = float(np.clip(distances[0][0], 0.0, 1.0))
        logger.info(f"BERT+FAISS cosine similarity: {similarity:.4f}")
        return similarity

    except ImportError:
        # FAISS not installed — use numpy dot product directly
        logger.warning("FAISS not installed. Using numpy dot product.")
        embeddings = _sentence_model.encode(
            [text_a, text_b],
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        similarity = float(np.dot(embeddings[0], embeddings[1]))
        return float(np.clip(similarity, 0.0, 1.0))

    except Exception as e:
        logger.error(f"BERT similarity failed: {e}. Falling back to TF-IDF.")
        return _tfidf_similarity(text_a, text_b)


def _tfidf_similarity(text_a: str, text_b: str) -> float:
    """TF-IDF + cosine similarity fallback (sklearn)."""
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=5000,
        )
        tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        logger.info(f"TF-IDF cosine similarity: {similarity:.4f}")
        return float(similarity)

    except Exception as e:
        logger.error(f"TF-IDF similarity also failed: {e}")
        return 0.5  # Neutral fallback
