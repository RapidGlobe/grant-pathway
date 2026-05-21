import { createApplication } from '@/actions/applications'

/**
 * /applications/new — creation intermediary (S2.2).
 *
 * Navigating here creates a new empty application row in the database
 * and immediately redirects to that application's Step 1 page.
 * No UI is rendered — this page exists only to give the dashboard
 * Link buttons a stable href that triggers server-side creation.
 */
export default async function NewApplicationPage() {
  // createApplication() always calls redirect() — never returns normally.
  await createApplication()
}
