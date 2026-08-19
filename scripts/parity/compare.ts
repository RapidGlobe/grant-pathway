/**
 * Environment parity comparator — D-020, P5.5
 * ---------------------------------------------------------------------------
 * Diffs two snapshots produced by `scripts/parity/snapshot.sql` and reports
 * every difference between a reference project (normally `grant-pathway-dev`,
 * where the suite's results were earned) and a target project (normally
 * `grant-pathway-prod`, where they must hold).
 *
 * WHY THIS EXISTS
 * On 2026-08-18, production had no DML privileges for the `authenticated` role
 * on five tables, so **no signed-in user could read or write anything**. The
 * code was right, the RLS policies were right, and the migration history
 * recorded all 32 versions as applied. `RT-00` passed that morning because it
 * compares the *set* of applied versions — a version row proves bookkeeping,
 * not execution (`D-020`).
 *
 * Three of the four defects found in `P5.5`'s first session were environment
 * divergences invisible to code review, to CI and to the migration history:
 * a mismatched AWS secret (`D-018`), missing grants (`D-020`), and errors being
 * swallowed so neither could be seen (`D-016`, `D-019`).
 *
 * WHAT IT IS FOR, and this is the point
 * Not a one-off audit. **A script, so the audit is repeatable at launch, after
 * any migration, and after any change to a Supabase project — for the cost of a
 * minute.** A manual audit answers the question once; this answers it whenever
 * it is asked again.
 *
 * WHAT IT DOES NOT COVER — read this before trusting a clean run
 *   * **Credential validity.** No snapshot can tell you an AWS secret is wrong.
 *     `DEPLOYMENT-CHECKLIST.md` v1.6 carries the real-call checks for that.
 *   * **Supabase Auth settings** (password rules, leaked-password protection,
 *     SMTP, redirect URLs) — dashboard state, not database state.
 *   * **Vercel configuration** — environment variables, function regions, cron.
 *   * **Row data.** Deliberately: seeded funders are compared as a table, not as
 *     rows, and user data must never leave production.
 *
 * USAGE
 * Save each snapshot as `scripts/parity/dev.json` and `scripts/parity/prod.json`
 * (both gitignored — a snapshot is environment state, not source), then:
 *
 *   npm run parity
 *   npx tsx scripts/parity/compare.ts --reference a.json --target b.json
 *   npx tsx scripts/parity/compare.ts --json    (machine-readable output)
 *
 * Paths are relative to the directory the command is run from.
 *
 * Exit codes: 0 = no differences, 1 = differences found, 2 = could not run.
 * Findings marked `note` do not affect the exit code.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** A section of the snapshot, and how to identify one row within it. */
type Section = {
  key: string
  /** Human label used in the report. */
  label: string
  /** Fields that together identify a row (the "which thing is this"). */
  identity: string[]
  /**
   * Severity drives report order. `blocker` sections are the ones that have
   * actually broken production: a difference here means the app cannot work.
   */
  severity: 'blocker' | 'high' | 'medium'
  /**
   * Fields holding a comma-separated list whose *membership* is what matters,
   * not the order it happens to be stored in. Compared as sets; a pure
   * ordering difference is reported as a `note`, not as a finding.
   *
   * WHY: on 2026-08-19 the first clean parity run still printed a HIGH finding
   * because production's `ai_request_type` had gained `refine_answer` and
   * `assemble_draft` that morning (D-020) while dev had held them since May,
   * so the same five labels were stored in a different order. A tool that
   * cries wolf in its HIGH section trains you to stop reading the HIGH
   * section, which is the one place a real defect would appear.
   */
  setFields?: string[]
  /** Why a difference here matters — printed with the findings, not buried. */
  why: string
}

const SECTIONS: Section[] = [
  {
    key: 'table_grants',
    label: 'Table grants',
    identity: ['table_name', 'grantee'],
    severity: 'blocker',
    why: 'This is D-020. A missing DML privilege yields 42501 for every signed-in read or write, while RLS and the migration history both look correct.',
  },
  {
    key: 'tables',
    label: 'Tables',
    identity: ['table_name'],
    severity: 'blocker',
    why: 'A missing table breaks every feature that touches it. RLS flags are included: an unprotected table is a confidentiality failure, not a bug.',
  },
  {
    key: 'functions',
    label: 'Functions',
    identity: ['function_name', 'arguments'],
    severity: 'blocker',
    why: 'Identity includes the argument list, because a function present under a different signature makes supabase.rpc return PGRST202 and the app show a generic error. The ACL is included: RT-00 proved these existed, not that they could be executed.',
  },
  {
    key: 'policies',
    label: 'RLS policies',
    identity: ['table_name', 'policy_name'],
    severity: 'high',
    why: 'A policy that differs in its USING or WITH CHECK expression can expose another user’s rows. Compare the expressions, not just the names.',
  },
  {
    key: 'columns',
    label: 'Columns',
    identity: ['table_name', 'column_name'],
    severity: 'high',
    why: 'A missing column fails only the code path that writes it — the failure mode behind the missing word_limit column that AGENTS.md records.',
  },
  {
    key: 'enums',
    label: 'Enum types',
    identity: ['enum_name'],
    severity: 'high',
    setFields: ['labels'],
    why: 'A missing label fails only for that value, only at runtime. Nothing else notices.',
  },
  {
    key: 'storage_policies',
    label: 'Storage policies',
    identity: ['policy_name'],
    severity: 'high',
    why: 'Storage sits outside the database backups (ADR-DATA-005) and outside most reviews. GAP-48 was a storage policy that silently granted nothing for eleven weeks.',
  },
  {
    key: 'buckets',
    label: 'Storage buckets',
    identity: ['bucket_id'],
    severity: 'high',
    why: 'A public bucket where the other project has a private one is a disclosure, not a difference.',
  },
  {
    key: 'constraints',
    label: 'Constraints',
    identity: ['table_name', 'constraint_name'],
    severity: 'medium',
    why: 'Cascade behaviour lives here (ADR-DATA-003). A missing ON DELETE rule leaves orphaned rows after account deletion.',
  },
  {
    key: 'triggers',
    label: 'Triggers',
    identity: ['table_name', 'trigger_name'],
    severity: 'medium',
    why: 'The handle_new_user trigger is what creates a profile row on registration; without it registration half-succeeds.',
  },
  {
    key: 'indexes',
    label: 'Indexes',
    identity: ['table_name', 'index_name'],
    severity: 'medium',
    why: 'Performance only — unless the index is unique, in which case it is a correctness difference.',
  },
]

type Row = Record<string, unknown>
type Snapshot = Record<string, unknown>

type Finding = {
  section: string
  /**
   * `note` is not one of the section severities: it is assigned per finding,
   * for a difference that is real but carries no consequence for this codebase
   * (see `setFields`). Notes are printed, but do not fail the run.
   */
  severity: Section['severity'] | 'note'
  kind: 'missing-in-target' | 'extra-in-target' | 'different'
  identity: string
  detail: string
}

function parseArgs(argv: string[]) {
  const get = (flag: string, fallback: string) => {
    const i = argv.indexOf(flag)
    return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
  }
  return {
    reference: get('--reference', 'scripts/parity/dev.json'),
    target: get('--target', 'scripts/parity/prod.json'),
    json: argv.includes('--json'),
  }
}

function load(file: string): Snapshot {
  // Resolved against the working directory, not against this file's directory.
  // `npm run parity` is run from the repository root, and a path typed on the
  // command line is naturally read as relative to where it was typed.
  const path = resolve(process.cwd(), file)
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    console.error(`Could not read ${path}`)
    console.error(
      'Run scripts/parity/snapshot.sql in each Supabase project and save the JSON value here.',
    )
    process.exit(2)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    console.error(`${file} is not valid JSON: ${error instanceof Error ? error.message : error}`)
    console.error(
      'Copy the cell value only — not the surrounding table markup the SQL editor renders.',
    )
    process.exit(2)
  }
  // The Supabase editor may hand back the row wrapper rather than the value.
  if (Array.isArray(parsed)) parsed = parsed[0]
  const obj = parsed as Record<string, unknown>
  if (obj && typeof obj === 'object' && 'parity_snapshot' in obj) {
    return obj.parity_snapshot as Snapshot
  }
  return obj as Snapshot
}

const identityOf = (row: Row, fields: string[]) =>
  fields.map((f) => String(row[f] ?? '')).join(' · ')

const asSet = (value: unknown) =>
  new Set(
    String(value ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
  )

/**
 * Fields that differ between two rows with the same identity.
 *
 * `diffs` are differences that matter. `notes` are differences that are real
 * but consequence-free here — currently only a set field whose membership
 * matches while its stored order does not. Notes are deliberately still
 * reported rather than discarded: enum ordering does drive `ORDER BY` on an
 * enum column, so ignoring it outright would be the wrong default for a parity
 * tool. Nothing in this codebase orders by an enum today, which is why it is a
 * note and not a finding.
 */
function fieldDiffs(
  a: Row,
  b: Row,
  identity: string[],
  setFields: string[] = [],
): { diffs: string[]; notes: string[] } {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const diffs: string[] = []
  const notes: string[] = []
  for (const k of keys) {
    if (identity.includes(k)) continue
    const av = a[k] ?? ''
    const bv = b[k] ?? ''
    if (String(av) === String(bv)) continue

    if (setFields.includes(k)) {
      const refSet = asSet(av)
      const tgtSet = asSet(bv)
      const missing = [...refSet].filter((v) => !tgtSet.has(v))
      const extra = [...tgtSet].filter((v) => !refSet.has(v))
      if (missing.length === 0 && extra.length === 0) {
        notes.push(
          `${k}: same ${refSet.size} value(s), stored in a different order — reference=${JSON.stringify(av)} target=${JSON.stringify(bv)}`,
        )
        continue
      }
      const parts: string[] = []
      if (missing.length > 0) parts.push(`absent in target: ${missing.join(', ')}`)
      if (extra.length > 0) parts.push(`extra in target: ${extra.join(', ')}`)
      diffs.push(`${k}: ${parts.join('; ')}`)
      continue
    }

    diffs.push(`${k}: reference=${JSON.stringify(av)} target=${JSON.stringify(bv)}`)
  }
  return { diffs, notes }
}

function compareSection(section: Section, reference: Snapshot, target: Snapshot): Finding[] {
  const refRows = (reference[section.key] as Row[] | undefined) ?? []
  const tgtRows = (target[section.key] as Row[] | undefined) ?? []
  const refMap = new Map(refRows.map((r) => [identityOf(r, section.identity), r]))
  const tgtMap = new Map(tgtRows.map((r) => [identityOf(r, section.identity), r]))
  const findings: Finding[] = []

  for (const [id, refRow] of refMap) {
    const tgtRow = tgtMap.get(id)
    if (!tgtRow) {
      findings.push({
        section: section.label,
        severity: section.severity,
        kind: 'missing-in-target',
        identity: id,
        detail: 'present in reference, absent in target',
      })
      continue
    }
    const { diffs, notes } = fieldDiffs(refRow, tgtRow, section.identity, section.setFields)
    if (diffs.length > 0) {
      findings.push({
        section: section.label,
        severity: section.severity,
        kind: 'different',
        identity: id,
        detail: diffs.join('; '),
      })
    }
    if (notes.length > 0) {
      findings.push({
        section: section.label,
        severity: 'note',
        kind: 'different',
        identity: id,
        detail: notes.join('; '),
      })
    }
  }

  for (const id of tgtMap.keys()) {
    if (!refMap.has(id)) {
      findings.push({
        section: section.label,
        severity: section.severity,
        kind: 'extra-in-target',
        identity: id,
        detail: 'present in target, absent in reference',
      })
    }
  }

  return findings
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const reference = load(args.reference)
  const target = load(args.target)

  const findings = SECTIONS.flatMap((s) => compareSection(s, reference, target))

  // Migration history is reported separately and never as a pass: it is
  // bookkeeping, and D-020 is the case of it being right while reality was not.
  const refMigrations = new Set((reference.migrations as string[] | undefined) ?? [])
  const tgtMigrations = new Set((target.migrations as string[] | undefined) ?? [])
  const migrationsOnlyInRef = [...refMigrations].filter((m) => !tgtMigrations.has(m))
  const migrationsOnlyInTgt = [...tgtMigrations].filter((m) => !refMigrations.has(m))

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          findings,
          migrationsOnlyInRef,
          migrationsOnlyInTgt,
          referenceCapturedAt: reference.captured_at,
          targetCapturedAt: target.captured_at,
        },
        null,
        2,
      ),
    )
    process.exit(findings.length > 0 ? 1 : 0)
  }

  console.log('Environment parity report')
  console.log('-------------------------')
  console.log(
    `reference : ${String(reference.database ?? '?')} captured ${String(reference.captured_at ?? '?')}`,
  )
  console.log(
    `target    : ${String(target.database ?? '?')} captured ${String(target.captured_at ?? '?')}`,
  )
  console.log('')

  const order: Finding['severity'][] = ['blocker', 'high', 'medium', 'note']
  for (const severity of order) {
    const forSeverity = findings.filter((f) => f.severity === severity)
    if (forSeverity.length === 0) continue
    console.log(`## ${severity.toUpperCase()} — ${forSeverity.length} finding(s)`)
    const bySection = new Map<string, Finding[]>()
    for (const f of forSeverity) {
      if (!bySection.has(f.section)) bySection.set(f.section, [])
      bySection.get(f.section)!.push(f)
    }
    for (const [sectionLabel, rows] of bySection) {
      const why = SECTIONS.find((s) => s.label === sectionLabel)?.why
      console.log(`\n### ${sectionLabel}`)
      if (why) console.log(`   why it matters: ${why}`)
      for (const r of rows) {
        console.log(`   [${r.kind}] ${r.identity}`)
        console.log(`      ${r.detail}`)
      }
    }
    console.log('')
  }

  if (migrationsOnlyInRef.length > 0 || migrationsOnlyInTgt.length > 0) {
    console.log('## Migration history (bookkeeping only — not evidence of execution)')
    if (migrationsOnlyInRef.length > 0)
      console.log(`   recorded in reference but not target: ${migrationsOnlyInRef.join(', ')}`)
    if (migrationsOnlyInTgt.length > 0)
      console.log(`   recorded in target but not reference: ${migrationsOnlyInTgt.join(', ')}`)
    console.log('')
  }

  const notes = findings.filter((f) => f.severity === 'note')
  const failures = findings.filter((f) => f.severity !== 'note')

  if (failures.length === 0) {
    console.log(
      notes.length === 0
        ? 'No structural differences found.'
        : `No structural differences found. The ${notes.length} note(s) above are consequence-free — read them, but they do not block a test run.`,
    )
    console.log('')
    console.log('This does NOT mean the environments match. Not covered here:')
    console.log('  * credential validity — exercise each one (DEPLOYMENT-CHECKLIST.md v1.6)')
    console.log('  * Supabase Auth settings, SMTP and redirect URLs')
    console.log('  * Vercel environment variables, function regions and cron')
    process.exit(0)
  }

  const blockers = failures.filter((f) => f.severity === 'blocker').length
  console.log(
    `${failures.length} difference(s) found, ${blockers} at blocker severity. Fix blockers before running any test plan against the target.`,
  )
  process.exit(1)
}

main()
