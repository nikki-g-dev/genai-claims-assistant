# Backend

Spring Boot service scaffold for the claims platform backend.

## Intended responsibilities

- Expose claim APIs
- Publish and consume Kafka events
- Coordinate business workflows
- Call the AI service for retrieval and LLM orchestration

## Suggested next steps

1. Add Spring Web, Spring Kafka, and Actuator dependencies.
2. Implement claim intake and retrieval endpoints.
3. Add Kafka producers for claim-submitted and document-uploaded events.
4. Add integration with the Python AI service.
