import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { LegalDocument } from '@/components/legal-document'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that apply when you use Grant Pathway, the free grant writing companion for UK charities.',
}

export default async function TermsPage() {
  const markdown = await readFile(
    path.join(process.cwd(), 'docs', 'legal', 'terms-of-service.md'),
    'utf-8',
  )

  return <LegalDocument markdown={markdown} />
}
