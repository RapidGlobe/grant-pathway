import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 5 requests per 60 seconds per user — applied to all AI routes
// (generate-summary and refine-answer). This is the burst control layer;
// the monthly 50 req/month cap is enforced via ai_usage_log.
export const aiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: false,
  prefix: 'grant-pathway:ai',
})

// 3 resend requests per hour per email address — AC-FR-03-06.
// Keyed by email address so the limit applies per user regardless of IP.
export const resendRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: false,
  prefix: 'grant-pathway:resend',
})
