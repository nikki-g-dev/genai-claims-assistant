# genai-claims-assistant

GenAI Claims Assistant is now structured as a multi-service repository with a React frontend, Spring Boot backend scaffolding, a Python AI service for RAG workflows, and dedicated architecture docs.

## Repository structure

```text
genai-claims-assistant/
├── backend/            Spring Boot services
├── ai-service/         Python RAG + embeddings service
├── frontend/           Next.js / React dashboard
├── docs/               Architecture and diagrams
├── README.md
└── docker-compose.yml
```

## Architecture

The target request flow is:

`User -> API -> Kafka -> Services -> LLM -> Vector DB -> Response`

See [docs/architecture.md](/Users/rahul/Desktop/Nikki%20docs/genai-claims-assistant/docs/architecture.md) for the full diagram and service notes.

## Services

### `frontend/`

- Next.js 15
- React 19
- TypeScript
- Claims dashboard, intake flow, AI summarization UI

Run locally:

```bash
cd frontend
npm install
npm run dev
```

### `backend/`

- Spring Boot scaffold
- Intended home for claims APIs, orchestration, Kafka producers/consumers, and business services

### `ai-service/`

- Python FastAPI scaffold
- Intended home for retrieval, embeddings, vector search, and LLM orchestration

### `docs/`

- Architecture diagram
- Repo-level design documentation

## Frontend environment

Create `frontend/.env.local` to enable OpenAI-powered claim summaries and document parsing:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## Optional local orchestration

A starter [docker-compose.yml](/Users/rahul/Desktop/Nikki%20docs/genai-claims-assistant/docker-compose.yml) is included for bringing up Kafka, Zookeeper, the backend, the AI service, and the frontend together.
