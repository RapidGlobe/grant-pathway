// Word-export text helpers (GAP-41).
//
// Lives here rather than inside app/api/export/[applicationId]/route.ts so it
// can be tested directly. That is not incidental tidiness: GAP-41 shipped and
// survived a passing RT-09 precisely because the only thing exercising this
// code was a manual test whose "no corrupted or missing content" check is
// satisfied by single-paragraph answers.

import { TextRun } from 'docx'

/** Convert points to half-points (docx size unit) */
function pt(points: number): number {
  return points * 2
}

/**
 * Split an answer into one `TextRun` per line, joined by soft line breaks.
 *
 * **Why this exists.** The `docx` library **ignores `\n` inside a TextRun** —
 * a documented footgun of that library, not a subtle interaction. Passing a
 * whole answer as a single run therefore silently discarded every paragraph
 * break, blank line and hyphen bullet the applicant had typed, delivering
 * their work as one continuous block of prose.
 *
 * Found 2026-08-06 in a real Stony Stratford Town Council application, whose
 * author had deliberately laid out a 215-word answer with blank lines, a
 * bulleted list of facilities and a worked calculation — all of it flattened
 * in the file she downloaded.
 *
 * `break: 1` on every run after the first reproduces the textarea exactly:
 * soft line breaks *within* one paragraph, so the caller's paragraph spacing
 * is untouched. A blank line in the source becomes an empty run carrying its
 * own break, which is what renders the gap.
 *
 * Nothing else in the pipeline was ever affected — the textarea stores `\n`,
 * Step 5's preview renders it via `whitespace-pre-wrap`, and the plain-text
 * export builds its output by joining an array of lines.
 */
export function answerRuns(text: string, opts: { color: string; italics: boolean }): TextRun[] {
  // Normalise CRLF/CR first, so an answer pasted from a Windows-authored
  // document doesn't gain a stray empty line between every real one.
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(
      (line, i) =>
        new TextRun({
          text: line,
          font: 'Calibri',
          size: pt(11),
          color: opts.color,
          italics: opts.italics,
          // First run must not carry a break, or every answer would start with
          // a blank line under its question heading.
          ...(i > 0 ? { break: 1 } : {}),
        }),
    )
}
