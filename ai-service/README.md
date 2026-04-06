# AI Service

Python service scaffold for retrieval-augmented generation, embeddings, and vector database integration.

## Intended responsibilities

- Build embeddings for claim documents
- Retrieve policy and claim context from the vector database
- Orchestrate prompts to the LLM
- Return structured summaries and recommended actions

## Suggested next steps

1. Plug in OpenAI embeddings and responses APIs.
2. Connect a vector store such as Qdrant, Weaviate, or pgvector.
3. Add Kafka consumers for async claim enrichment jobs.
4. Add OCR and document parsing pipelines.
