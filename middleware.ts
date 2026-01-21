import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Domain to funnel mapping
const DOMAIN_MAP: Record<string, string> = {
  'acnescope.com': 'acnescope',
  'www.acnescope.com': 'acnescope',
  'nailscope.com': 'nailscope',
  'www.nailscope.com': 'nailscope',
  'eczemap.com': 'eczemap',
  'www.eczemap.com': 'eczemap',
  // Add more domains as funnels are created
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes, static files, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // Static files like favicon.ico
  ) {
    return NextResponse.next()
  }

  // Check if this is a custom domain
  const funnel = DOMAIN_MAP[hostname]

  if (funnel) {
    // Don't rewrite if already on a funnel path
    if (pathname.startsWith(`/${funnel}`)) {
      return NextResponse.next()
    }

    // Rewrite to funnel-specific route
    const url = request.nextUrl.clone()
    url.pathname = `/${funnel}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
