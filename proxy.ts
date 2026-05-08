// proxy.ts — pass-through stub for Phase 1
// Next.js 16: "middleware" is renamed to "proxy". Functionality is identical.
// Replaced with real auth proxy in Phase 3 (P3.4).
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
