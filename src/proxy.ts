import { NextRequest, NextResponse } from 'next/server'

// Paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/change-password', '/forgot-password', '/api/auth']
const SEED_PATH = '/api/seed'
const API_PREFIX = '/api/'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths (auth routes, change-password, forgot-password)
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow seed route without authentication
  if (pathname.startsWith(SEED_PATH)) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Check session cookie
  const sessionCookie = req.cookies.get('hr-session')

  if (!sessionCookie?.value) {
    // API routes: return 401 JSON
    if (pathname.startsWith(API_PREFIX)) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز - ابتدا وارد سیستم شوید' },
        { status: 401 }
      )
    }
    // Pages: redirect to login
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Validate session cookie has required fields
  try {
    const session = JSON.parse(sessionCookie.value)

    // Verify the session has userId and role fields
    if (!session.userId || !session.role) {
      if (pathname.startsWith(API_PREFIX)) {
        return NextResponse.json(
          { error: 'نشست نامعتبر' },
          { status: 401 }
        )
      }
      // Pages: clear invalid session and redirect to login
      const loginUrl = new URL('/login', req.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.set('hr-session', '', { maxAge: 0, path: '/' })
      return response
    }

    // Add session info to request headers for downstream use
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', String(session.userId))
    requestHeaders.set('x-user-role', String(session.role))
    requestHeaders.set('x-user-email', String(session.email || ''))
    requestHeaders.set('x-user-mobile', String(session.mobile || ''))

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  } catch {
    // Invalid JSON in session cookie
    if (pathname.startsWith(API_PREFIX)) {
      return NextResponse.json(
        { error: 'نشست نامعتبر' },
        { status: 401 }
      )
    }
    // Pages: clear invalid session and redirect to login
    const loginUrl = new URL('/login', req.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.set('hr-session', '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
