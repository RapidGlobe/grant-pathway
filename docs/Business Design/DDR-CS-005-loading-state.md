---
id: DDR-CS-005
category: Component Style
status: Decided
---

# DDR-CS-005 — Loading State During AI Generation

## Question

What visual treatment should be shown to the user during the 30--60 second AI processing periods in Steps 3 and 4?

## Context

AI content generation is the longest wait a user experiences in Grant Pathway. The targets are:

- Step 3 (AI summary): up to 30 seconds (NFR-01)
- Step 4 (Draft answers): up to 60 seconds (NFR-01)

The screen requirements specify staged text messages to be shown during generation:

- Step 3: "Reading your funder guidelines..." then "Almost there..."
- Step 4: "Reviewing your guidelines and charity profile..." then "Writing your draft answers..." then "Almost there..."

The loading state must be informative and reassuring -- users must not feel the app has crashed or stalled. For the primary persona Margaret, who has no prior AI experience, an unexplained wait with no feedback would be confusing and alarming.

The visual treatment wraps around the staged text messages. The text messages themselves are fixed (screen-requirements.md); this decision is about the surrounding visual component.

## Options

- **Option A -- Spinner with staged text:** A circular animated spinner (CSS animation) centred on the screen or in the content area, with the staged message text below it. Simple to implement. Universally understood as "loading". Does not suggest the extent of progress.
- **Option B -- Animated progress bar with staged text:** A horizontal progress bar that advances in stages corresponding to the text messages. Each text message transition also advances the bar. Gives a stronger sense of forward progress. The bar does not reflect real API progress -- it is purely a UX illusion timed to the expected duration.
- **Option C -- Pulsing skeleton loader:** Placeholder content blocks (grey animated shapes) that mimic the layout of the content about to appear. Used extensively in social media feeds and modern SaaS tools. Signals that content is coming and approximately what it will look like. More complex to build. Can feel slightly deceptive if the actual layout differs significantly from the skeleton.
- **Option D -- Spinner + progress bar + staged text:** Combines a spinner with a progress bar and the staged text messages. Provides maximum reassurance but may feel over-engineered for a simple loading state.
- **Option E -- Minimal: staged text only, no animation:** Just the staged text messages, updating at timed intervals, with no spinner or bar. Relies entirely on the copy to reassure the user. The simplest option to build but provides least visual confirmation that processing is happening.

## Decision

**Option B -- Animated progress bar with staged text.**

A teal (#0D6E6E) horizontal progress bar advances in timed stages, accompanied by the staged text messages defined in screen-requirements.md. The bar and text transitions are coordinated -- each text message change triggers a bar advance.

**Step 3 progress stages (target: up to 30 seconds):**

| Stage    | Bar position | Text message                        |
| -------- | ------------ | ----------------------------------- |
| Start    | 0%           | "Reading your funder guidelines..." |
| Mid      | 60%          | "Almost there..."                   |
| Complete | 100%         | Content appears                     |

**Step 4 progress stages (target: up to 60 seconds):**

| Stage    | Bar position | Text message                                       |
| -------- | ------------ | -------------------------------------------------- |
| Start    | 0%           | "Reviewing your guidelines and charity profile..." |
| Early    | 35%          | "Writing your draft answers..."                    |
| Late     | 75%          | "Almost there..."                                  |
| Complete | 100%         | Content appears                                    |

**Edge cases:**

- If the API response arrives before the bar reaches 100%, the bar jumps to 100% and content appears immediately.
- If the API response is slower than expected, the bar holds at approximately 90% and the final staged message remains displayed until the response arrives.

The progress bar is a UX timing construct -- it does not reflect real API progress. This is standard practice for AI-generation loading states.

## Date Decided

2026-04-17

---

_Status: Decided_
_Created: 2026-04-17_
