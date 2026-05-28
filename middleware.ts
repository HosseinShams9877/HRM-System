// middleware.ts
import { NextResponse, NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔴 MIDDLEWARE EXECUTED for:', request.nextUrl.pathname)
  const pathname = request.nextUrl.pathname
  
  // لاگین و APIهای عمومی را مجاز کنید
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }
  
  // دریافت سشن از کوکی
  const sessionCookie = request.cookies.get('hr-session')
  let session = null
  
  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value)
    } catch (e) {
      console.error('Failed to parse session cookie:', e)
    }
  }
  
  // اگر سشن ندارید -> برو لاگین
  if (!session || !session.userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  const response = NextResponse.next()
  
  // ست کردن هدرها از سشن
  response.headers.set('x-user-id', session.userId)
  response.headers.set('x-user-role', session.role)
  response.headers.set('x-user-email', session.email || '')
  response.headers.set('x-user-employee-id', session.employeeId || '')

console.log('🔍 MIDDLEWARE - Setting headers:')
console.log('  x-user-id:', session.userId)
console.log('  x-user-role:', session.role)
console.log('  x-user-employee-id:', session.employeeId)

  return response
}

export const config = {
  matcher: [
/*
    '/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)'
    */
    
    '/dashboard',
    '/dashboard/:path*',
    '/employees/:path*',
    '/attendance/:path*',
    '/payroll/:path*',
    '/contracts/:path*',
    '/performance/:path*',
    '/training/:path*',
    '/welfare/:path*',
    '/settings/:path*',
    '/api/:path*',
    
  ],
}