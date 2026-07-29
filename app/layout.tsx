import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { TooltipProvider } from '@/components/ui/tooltip'
import AxeProvider from '@/components/axe-provider'
import { SITE_URL } from '@/lib/site-url'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s — Grant Pathway',
    default: 'Grant Pathway',
  },
  description: 'Your free grant writing companion for UK charities',
  openGraph: {
    type: 'website',
    siteName: 'Grant Pathway',
    title: 'Grant Pathway',
    description: 'Your free grant writing companion for UK charities',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary',
    title: 'Grant Pathway',
    description: 'Your free grant writing companion for UK charities',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Calling headers() makes this layout dynamic (rendered fresh per request).
  // Next.js reads x-nonce from the incoming request headers at the framework level
  // and stamps it on its own inline hydration scripts, satisfying the CSP
  // without 'unsafe-inline' (item 22, F-08-02).
  await headers()

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <AxeProvider />
      </body>
    </html>
  )
}
