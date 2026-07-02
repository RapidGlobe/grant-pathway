// App version for support/audit traceability (PDR-DH-003).
//
// Auto-derived at build time from Vercel's Git commit metadata -- see
// next.config.ts (`APP_VERSION`) -- rather than a manually-bumped number.
// This project deploys continuously rather than on a release cadence, so a
// manual version has no reliable resolution and depends on remembering to
// bump it (the previous hardcoded "v1" never once changed since the export
// feature was built). Format: YYYY.MM.DD-<short git SHA>, e.g.
// "2026.07.02-a2ca520". Falls back to "dev" outside Vercel (e.g. local dev).

export function getAppVersion(): string {
  return process.env.APP_VERSION ?? 'dev'
}
