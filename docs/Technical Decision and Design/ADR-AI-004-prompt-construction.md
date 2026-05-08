---
id: ADR-AI-004
category: AI Integration
status: Decided
---

# ADR-AI-004 — Prompt Construction Strategy

## Context

Grant Pathway uses two AI prompts (ADR-AI-003). The prompts must be constructed carefully to produce high-quality, consistently structured outputs. Key considerations:

1. **Step 3 Summary prompt:** Takes funder guidelines text (variable length, up to thousands of words) and must return a structured summary covering eligibility, priorities, restrictions, word limits, and key criteria.

2. **Step 4 Draft prompt:** Takes the AI summary + full charity profile + a list of questions (each with word limit) and must return draft answers — one per question — written in a warm, professional tone that reflects the charity's work.

The prompt construction strategy determines how context is organised, how the model is instructed, and how outputs are structured.

## Options Considered

### Option A — Unstructured natural language prompts
- **What it is:** Prompts written as flowing instructions without explicit structure markers or output format specifications.
- **Strengths:** Simple to write. Works for basic cases.
- **Weaknesses:** Inconsistent output format. Harder to parse programmatically. Less reliable for multi-question drafts.

### Option B — XML-tagged structured prompts (Anthropic recommended pattern)
- **What it is:** Input context is wrapped in XML-like tags (e.g., `<guidelines>`, `<charity_profile>`, `<questions>`). Output format is specified explicitly (e.g., "Return your answers as a JSON array with keys `question` and `answer`").
- **Strengths:** Claude responds well to structured inputs. XML tags clearly delineate different context types. Output format specification allows reliable programmatic parsing. Anthropic's prompt engineering guide recommends this pattern.
- **Weaknesses:** More verbose prompts. Requires output parsing logic.

### Option C — JSON input/output prompts
- **What it is:** Input context is provided as a JSON string embedded in the prompt. Output is requested as JSON.
- **Strengths:** Consistent with programmatic workflows.
- **Weaknesses:** JSON encoding adds overhead. Claude's instruction-following is better with natural language + XML than with raw JSON.

### Option D — System prompt + user message split
- **What it is:** Use Claude's system prompt field for persona/instructions and the user message for context data.
- **Strengths:** Cleaner separation of instructions from data. System prompt is reusable across calls.
- **Weaknesses:** Requires more careful design. Must decide what goes in system vs user message.

## Decision

**Option B — XML-tagged structured prompts with system/user message split and explicit output format specification.**

Input context is wrapped in XML tags. System prompts carry fixed persona and tone instructions. User messages carry per-request data. Output format is specified explicitly — Step 3 returns structured sections, Step 4 returns a JSON array for reliable programmatic parsing.

This is an initial implementation to be validated and refined during testing. Prompt wording, section headings, and tag structure may be adjusted based on real Claude output quality.

**Step 3 — AI Summary:**

*System prompt (constant in `lib/prompts.ts`):*
> You are an expert grant writer helping UK charities. Your task is to read funder guidelines and produce a structured summary that helps a charity understand exactly what the funder is looking for. Be precise, practical, and write in plain English.

*User message (built by `buildSummaryPrompt(guidelinesText)`):*
```
<guidelines>
[extracted guidelines text]
</guidelines>

Summarise these funder guidelines under the following headings:
- Who can apply
- What they fund
- What they don't fund
- Key priorities
- Word limits and format requirements
- Deadline and submission notes

Write each section clearly. If information is not stated in the guidelines, write "Not specified".
```

**Step 4 — Draft Answers:**

*System prompt (constant in `lib/prompts.ts`):*
> You are an expert grant writer helping UK charities write compelling grant applications. Write in a warm, professional tone. Be specific about the charity's work. Stay within word limits.

*User message (built by `buildDraftPrompt(summary, charityProfile, questions)`):*
```
<charity_profile>
Name: [charity_name]
Mission: [mission_statement]
Beneficiaries: [beneficiaries]
Programmes: [programmes]
Impact: [impact]
</charity_profile>

<funder_summary>
[ai_summary from Step 3]
</funder_summary>

<questions>
[{"id": "1", "question": "...", "word_limit": 300}, ...]
</questions>

Write a draft answer for each question. Use the charity profile and funder summary to inform each answer. Stay within the word limit for each question.

Return your answers as a JSON array in this exact format:
[{"id": "1", "answer": "..."}, {"id": "2", "answer": "..."}, ...]

Return only the JSON array. No preamble, no explanation.
```

**Parsing:** Step 4 JSON is parsed with `JSON.parse()` inside a `try/catch`. A parse failure triggers a single retry (ADR-AI-009) before returning an error to the user.

## Consequences

- Step 4 API route must parse the JSON response from Claude to populate `application_answers` rows.
- JSON parsing errors from Claude responses must be handled gracefully (ADR-AI-009).
- Prompts should include few-shot examples if initial quality testing shows inconsistent outputs.
- `lib/prompts.ts` functions accept typed parameters and return fully constructed prompt strings.

## Source

ADR-AI-003, PDR-AI-002, design-requirements.md (Tone & Voice).

## Date Decided

2026-04-21
