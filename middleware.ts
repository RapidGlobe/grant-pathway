// Next.js edge middleware entry point.
// All route protection logic lives in proxy.ts — this file wires it into the
// Next.js middleware pipeline. proxy.ts was written correctly at P3.4 but was
// never connected because the bootstrap comment incorrectly claimed Next.js 16
// renamed middleware.ts to proxy.ts (it did not). Fixed 2026-06-21.
export { proxy as middleware, config } from '@/proxy'
