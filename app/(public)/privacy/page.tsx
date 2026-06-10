import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { LegalDocument } from '@/components/legal-document'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How RapidGlobe Ltd collects, uses, and protects your personal data when you use Grant Pathway.',
}

export default async function PrivacyPage() {
  const markdown = await readFile(path.join(process.cwd(), 'docs', 'privacy-policy.md'), 'utf-8')

  return <LegalDocument markdown={markdown} />
}
