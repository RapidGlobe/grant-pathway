import type { MetadataRoute } from 'next'
import { SITE_URL, ALLOW_INDEXING } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  // Indexing is opt-in (see lib/site-url.ts). Until NEXT_PUBLIC_ALLOW_INDEXING
  // is 'true', disallow everything — this keeps the pre-launch vercel.app host
  // and every preview deployment out of search results. Opus audit M5.
  if (!ALLOW_INDEXING) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/account/', '/dashboard/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
