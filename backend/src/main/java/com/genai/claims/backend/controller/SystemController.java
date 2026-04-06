package com.genai.claims.backend.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
public class SystemController {

  @GetMapping("/architecture")
  public Map<String, Object> architecture() {
    return Map.of(
        "flow", "User -> API -> Kafka -> Services -> LLM -> Vector DB -> Response",
        "backend", "Spring Boot services",
        "aiService", "Python RAG + embeddings service",
        "frontend", "Next.js dashboard");
  }
}
