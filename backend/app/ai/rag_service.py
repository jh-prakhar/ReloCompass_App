"""
ReloCompass AI - RAG (Retrieval-Augmented Generation) Service
Combines vector search + LLM to answer questions using the knowledge base.
"""
import logging
import uuid
from typing import Optional

from app.ai.llm_service import llm_service
from app.ai.vector_store import vector_store
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are ReloCompass Assistant, an AI-powered guide helping international students, job seekers, and professionals from India and Nepal who are relocating abroad.

Your role:
- Provide accurate, practical, and empathetic guidance on relocation, accommodation, transportation, employment, and cultural adaptation.
- When knowledge base context is provided, use it to answer questions. Cite the source document name when you use information from it.
- If you don't know the answer or the knowledge base doesn't cover the topic, say so honestly — never invent information.
- Always recommend that users verify visa, immigration, and legal information with official government sources.
- Be concise but thorough. Use bullet points and numbered lists for clarity.
- Tailor your response to the user's role (student, job seeker, employer) if known.

Important guidelines:
- Never fabricate URLs, statistics, prices, or specific recommendations not grounded in the provided context.
- If a question is outside your scope (e.g., medical diagnosis, legal advice), politely redirect.
- Encourage users to check official sources for critical decisions."""


def build_rag_messages(
    user_message: str,
    conversation_history: list[dict],
    context_chunks: list[dict],
    user_context: Optional[str] = None,
) -> list[dict]:
    """Build the message list for the LLM including RAG context and history."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add user-specific context
    if user_context:
        messages.append({
            "role": "system",
            "content": f"User context: {user_context}",
        })

    # Add retrieved knowledge base context
    if context_chunks:
        context_text = "\n\n---\n\n".join(
            f"[Source: {c['source']}]\n{c['text']}" for c in context_chunks
        )
        messages.append({
            "role": "system",
            "content": f"Knowledge base context (use this information to answer the user's question. Cite sources when relevant):\n\n{context_text}",
        })
    else:
        messages.append({
            "role": "system",
            "content": "No specific knowledge base context was found for this question. Answer based on your general knowledge, but clearly state when you are uncertain.",
        })

    # Add conversation history (last 10 turns for context window)
    for msg in conversation_history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current user message
    messages.append({"role": "user", "content": user_message})

    return messages


def chat_with_rag(
    user_message: str,
    conversation_history: list[dict] = None,
    user_context: Optional[str] = None,
) -> dict:
    """
    Process a chat message using RAG.
    1. Search the knowledge base for relevant chunks
    2. Build a context-augmented prompt
    3. Call the LLM
    Returns: {reply, session_id, sources, model_used}
    """
    conversation_history = conversation_history or []
    session_id = str(uuid.uuid4())

    # Step 1: Retrieve relevant knowledge
    context_chunks = []
    sources = []
    try:
        if vector_store.is_ready():
            context_chunks = vector_store.search(user_message, top_k=settings.RAG_TOP_K)
            sources = [
                {"source": c["source"], "category": c["category"], "score": round(c["score"], 3)}
                for c in context_chunks
            ]
            logger.info(f"RAG retrieved {len(context_chunks)} chunks for query")
    except Exception as e:
        logger.error(f"Vector search error: {e}")

    # Step 2: Build RAG messages
    messages = build_rag_messages(
        user_message=user_message,
        conversation_history=conversation_history,
        context_chunks=context_chunks,
        user_context=user_context,
    )

    # Step 3: Call LLM
    result = llm_service.chat(messages)

    return {
        "reply": result["reply"],
        "session_id": session_id,
        "sources": sources,
        "model_used": result.get("model"),
        "usage": result.get("usage"),
        "latency_ms": result.get("latency_ms"),
    }
