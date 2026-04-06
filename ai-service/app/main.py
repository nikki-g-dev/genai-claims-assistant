from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(title="genai-claims-ai-service")


class QueryRequest(BaseModel):
    claim_id: str
    prompt: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service"}


@app.get("/architecture")
def architecture() -> dict[str, str]:
    return {
        "flow": "User -> API -> Kafka -> Services -> LLM -> Vector DB -> Response",
        "role": "RAG, embeddings, retrieval, and LLM orchestration",
    }


@app.post("/rag/query")
def rag_query(payload: QueryRequest) -> dict[str, object]:
    return {
        "claim_id": payload.claim_id,
        "summary": "Scaffold response from the AI service.",
        "retrieved_context": [],
        "next_actions": [
            "Connect the vector database",
            "Add embeddings generation",
            "Integrate your preferred LLM provider",
        ],
    }
