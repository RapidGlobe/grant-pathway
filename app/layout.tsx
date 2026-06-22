import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import AxeProvider from '@/components/axe-provider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://grantpathway.org.uk'),
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
    url: 'https://grantpathway.org.uk',
  },
  twitter: {
    card: 'summary',
    title: 'Grant Pathway',
    description: 'Your free grant writing companion for UK charities',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <AxeProvider />
      </body>
    </html>
  )
}
