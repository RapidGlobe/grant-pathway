---
id: ADR-AI-005
category: AI Integration
status: Decided
---

# ADR-AI-005 — AI Response Mode (Streaming vs Batch)

## Context

Amazon Bedrock (the platform through which Claude is accessed — ADR-AI-001) supports two response modes:

1. **Streaming:** Tokens are returned incrementally as they are generated. The UI can display text appearing progressively.
2. **Batch (non-streaming):** The full response is returned when generation is complete.

Grant Pathway's AI generation steps can take 30–60 seconds (NFR-01). A loading state with progress indicators and staged messages is specified in the design requirements (DDR-CS-005). The response mode affects how the loading state is implemented and the complexity of the API route.

## Options Considered

- **Option A — Streaming responses:** The API route streams Claude's response to the client. The UI renders tokens as they arrive.
  - Strengths: User sees progress immediately. Feels faster even if total time is the same.
  - Weaknesses: Streaming in Next.js API routes requires specific implementation (ReadableStream). More complex client-side handling. The progress bar design (DDR-CS-005) is a time-based illusion — streaming does not improve the accuracy of the progress bar. Streaming partial JSON (for Step 4 multi-answer output) is complex to parse incrementally.

- **Option B — Batch (non-streaming) response with animated progress bar:** The API call waits for the full response. The client shows a time-based animated progress bar with staged messages during the wait.
  - Strengths: Simpler API route implementation. The progress bar is already a UX timing construct (DDR-CS-005) — batch vs streaming does not affect its behaviour. Step 4 JSON response is parsed once when complete. No partial parse complexity.
  - Weaknesses: No incremental content display. User sees nothing until generation is complete.

## Decision

**Option B — Batch (non-streaming) response with animated progress bar.**

AI API routes return the full response as a single JSON payload. During generation, the client displays a teal animated progress bar with staged text messages as specified in DDR-CS-005.

## Rationale

- The progress bar design (DDR-CS-005) is time-based regardless of streaming — it does not react to actual AI output. Streaming provides no UX benefit given this design.
- Batch responses simplify the API route and the client significantly.
- Step 4 outputs multiple answers as a JSON array — parsing streaming JSON incrementally is significantly more complex than parsing a complete response.
- Product Decision PDR-AI-003 specifies batch responses.
- The extended function timeout (ADR-AI-006) ensures the batch response can return within Vercel's `maxDuration`.

## Consequences

- AI API routes call the Bedrock Claude endpoint without streaming (using `AnthropicBedrock` client or AWS SDK equivalent).
- The client polls or awaits the API route response with `fetch` (no EventSource or WebSocket needed).
- The progress bar advances on a timer, independently of API response timing.
- If the API returns before the bar reaches 100%, the bar immediately advances to 100% and content appears.
- If the API is slow, the bar holds at ~90% until the response arrives (DDR-CS-005 edge case).

## Source

Product Decision PDR-AI-003, Design Decision DDR-CS-005.

## Date Decided

2026-04-17
