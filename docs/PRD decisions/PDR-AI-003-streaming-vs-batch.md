---
id: PDR-AI-003
category: AI Integration
status: Decided
---

# PDR-AI-003 — Streaming vs Batch AI Responses

## Question
Should AI-generated content stream to the screen word by word as it is generated, or appear all at once when the full response is complete?

## Context
Amazon Bedrock (the platform through which Claude is accessed — see DR-AI-002) supports both streaming (text appears progressively as it is generated) and batch (the full response is returned when complete). Streaming creates a more dynamic, engaging experience and gives the user immediate feedback that something is happening — reducing perceived wait time, which matters given the 30-60 second generation targets in NFR-01. However, streaming is more complex to implement and requires careful handling in the UI — particularly around the mandatory review step (FR-32 to FR-36), where the user must not be able to approve content that has not fully loaded. Batch is simpler to implement but requires a clear loading indicator to manage the wait.

## Options
- **Option A — Streaming:** Text appears progressively on screen as Claude generates it. Engaging and reduces perceived wait time, but more complex to implement and requires careful handling to prevent premature approval during the mandatory review step.
- **Option B — Batch (all at once):** Full response returned in one go with a loading spinner. Simpler to implement and safer for the review step, but a 30–60 second bare spinner feels uncertain and unresponsive.
- **Option C — Batch with a progress indicator:** Full batch response with meaningful staged progress messages rather than a plain spinner (e.g. *"Reading your funder guidelines…"* → *"Generating your draft…"*). Simple, safe, and provides reassurance during the wait.

## Decision
**Option C — Batch response with a staged progress indicator.**

AI responses (both summarisation and draft generation) will be returned as a complete batch response. During generation, the user will see a staged progress indicator with plain-language messages describing what is happening, for example:

- Summarisation: *"Reading your funder guidelines…"* → *"Almost there…"* → content appears
- Draft generation: *"Reviewing your guidelines and charity profile…"* → *"Writing your draft answers…"* → *"Almost there…"* → content appears

The review and approval controls (FR-32 to FR-36) will only be enabled once the full response has loaded and been displayed. Streaming can be introduced in a future phase without architectural change if user feedback indicates it is valued.

## Rationale
The mandatory human review step (FR-32 to FR-36) is a non-negotiable requirement — users must not be able to approve content that has not fully loaded. Streaming complicates enforcement of this requirement and adds implementation complexity that is not warranted for v1. Batch with staged progress messaging closes most of the user experience gap by giving clear, reassuring feedback during the wait — which is preferable to a bare spinner for the 30–60 second generation window (NFR-01). Streaming remains a viable future enhancement with no architectural change required.

## Date Decided
2026-04-16
