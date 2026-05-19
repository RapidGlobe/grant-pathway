import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 5 requests per 60 seconds per user — applied to both AI routes
// (generate-summary and generate-draft). This is the burst control layer;
// the monthly 20 req/month cap is enforced via ai_usage_log.
export const aiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: false,
  prefix: 'grant-pathway:ai',
})
