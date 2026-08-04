"""
ReloCompass AI - Vector Store
FAISS-based vector index for knowledge base retrieval.
Manages document embeddings, similarity search, and index persistence.
"""
import json
import logging
import os
from pathlib import Path
from typing import Optional

import faiss
import numpy as np

from app.config import settings
from app.ai.llm_service import llm_service

logger = logging.getLogger(__name__)

# FAISS uses float32
EMBEDDING_DIM = 384  # BAAI/bge-small-en-v1.5 dimension (local fastembed)


class VectorStore:
    """
    Manages a FAISS index for RAG retrieval.
    Stores embeddings + metadata (chunk text, source, category).
    """

    def __init__(self):
        self.index_dir = Path(settings.FAISS_INDEX_DIR)
        self.index_dir.mkdir(parents=True, exist_ok=True)
        self.index_path = self.index_dir / "relocompass.index"
        self.meta_path = self.index_dir / "relocompass_meta.json"

        self.index: Optional[faiss.IndexFlatIP] = None
        self.metadata: list[dict] = []  # parallel array to FAISS vectors
        self._dimension = EMBEDDING_DIM

    def _create_index(self):
        """Create a fresh FAISS inner-product (cosine similarity) index."""
        self.index = faiss.IndexFlatIP(self._dimension)
        self.metadata = []

    def load(self) -> bool:
        """Load the FAISS index and metadata from disk. Returns True if loaded."""
        if self.index_path.exists() and self.meta_path.exists():
            try:
                self.index = faiss.read_index(str(self.index_path))
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.metadata = data.get("chunks", [])
                self._dimension = self.index.d
                logger.info(f"Loaded FAISS index: {self.index.ntotal} vectors, {len(self.metadata)} chunks")
                return True
            except Exception as e:
                logger.error(f"Failed to load FAISS index: {e}")
        return False

    def save(self):
        """Persist the FAISS index and metadata to disk."""
        if self.index is None:
            return
        faiss.write_index(self.index, str(self.index_path))
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump({"chunks": self.metadata}, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved FAISS index: {self.index.ntotal} vectors")

    def add_chunks(self, chunks: list[dict]):
        """
        Add text chunks to the index.
        Each chunk: {text, source, category, chunk_index}
        """
        if not chunks:
            return

        # Generate embeddings
        texts = [c["text"] for c in chunks]
        embeddings = llm_service.embeddings(texts)
        vectors = np.array(embeddings, dtype=np.float32)

        # Normalize for cosine similarity
        faiss.normalize_L2(vectors)

        if self.index is None:
            self._create_index()

        self.index.add(vectors)

        # Store metadata
        for chunk in chunks:
            self.metadata.append({
                "text": chunk["text"],
                "source": chunk.get("source", "unknown"),
                "category": chunk.get("category", "general"),
                "chunk_index": chunk.get("chunk_index", 0),
            })

    def search(self, query: str, top_k: int = None) -> list[dict]:
        """
        Search the index for the most similar chunks.
        Returns list of {text, source, category, score}.
        """
        if not self.is_ready():
            return []

        top_k = top_k or settings.RAG_TOP_K
        top_k = min(top_k, self.index.ntotal)

        if top_k == 0:
            return []

        # Generate query embedding
        query_vec = np.array([llm_service.embedding(query)], dtype=np.float32)
        faiss.normalize_L2(query_vec)

        scores, indices = self.index.search(query_vec, top_k)

        results = []
        for rank, (score, idx) in enumerate(zip(scores[0], indices[0])):
            if idx == -1 or idx >= len(self.metadata):
                continue
            meta = self.metadata[idx]
            results.append({
                "text": meta["text"],
                "source": meta["source"],
                "category": meta["category"],
                "score": float(score),
                "rank": rank + 1,
            })
        return results

    def clear(self):
        """Remove all vectors and metadata."""
        self._create_index()
        self.save()

    def is_ready(self) -> bool:
        """Check if the index is loaded and has vectors."""
        return self.index is not None and self.index.ntotal > 0

    @property
    def size(self) -> int:
        """Number of vectors in the index."""
        return self.index.ntotal if self.index else 0

    @property
    def num_chunks(self) -> int:
        """Number of metadata chunks."""
        return len(self.metadata)


# Singleton
vector_store = VectorStore()
