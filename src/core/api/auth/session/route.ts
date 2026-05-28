import { NextRequest, NextResponse } from 'next/server'
import { getRolePermissions, type UserRole } from '@/core/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('hr-session')
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    
    // Get permissions for the user's role
    const permissions = getRolePermissions(session.role as UserRole)
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        employeeId: session.employeeId,
        name: session.name,
        department: session.department,
        position: session.position,
      },
      permissions,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
