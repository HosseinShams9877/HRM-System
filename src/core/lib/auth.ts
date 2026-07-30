
import { headers } from 'next/headers'

export type UserRole = 'admin' | 'hr_manager' | 'department_manager' | 'employee' | 'intern'

export interface SessionUser {
  userId: string
  email: string
  role: UserRole
  employeeId: string | null
}

/**
 * Get the current session user from middleware-injected headers
 */
export async function getSessionUser(): Promise<SessionUser | null> {

  const headersList = await headers()
  
  const userId = headersList.get('x-user-id')
  const role = headersList.get('x-user-role') as UserRole
  const email = headersList.get('x-user-email')
  const employeeId = headersList.get('x-user-employee-id')

  console.log('🔍 getSessionUser - ALL HEADERS:', {
    'x-user-id': headersList.get('x-user-id'),
    'x-user-role': headersList.get('x-user-role'),
    'x-user-employee-id': headersList.get('x-user-employee-id'),
  })

  if (!userId || !role) return null

  return { userId, email: email || '', role,   employeeId: employeeId || null  }
}

/**
 * Check if the current user has the required role(s)
 */
 export async function requireRole(...roles: any[]): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  if (!roles.includes(user.role)) {
    throw new Error('FORBIDDEN')
  }
  return user
}

/**
 * Permission matrix: which roles can perform which actions
 */
export const PERMISSIONS = {
  // Employee management
  'employee:create': ['admin', 'hr_manager'],
  'employee:update': ['admin', 'hr_manager'],
  'employee:delete': ['admin'],
  'employee:view': ['admin', 'hr_manager', 'department_manager'], 
  // Leave management
  'leave:approve': ['admin', 'hr_manager', 'department_manager'],
  'leave:reject': ['admin', 'hr_manager', 'department_manager'],
  'leave:view': ['admin', 'hr_manager', 'department_manager', 'employee'], 
  // Mission management
  'mission:approve': ['admin', 'hr_manager', 'manager'],
  'mission:reject': ['admin', 'hr_manager', 'manager'],
  'mission:view': ['admin', 'hr_manager', 'department_manager', 'employee'],  
  // Payroll
  'payroll:manage': ['admin', 'hr_manager'], 
  'payroll:generate': ['admin', 'hr_manager'],
  'payroll:confirm': ['admin'],
  'payroll:settings': ['admin', 'hr_manager'],
  'payroll:view': ['admin', 'hr_manager', 'employee'],
  // Contracts
  'contract:create': ['admin', 'hr_manager'],
  'contract:update': ['admin', 'hr_manager'],
  'contract:delete': ['admin'],
  'contract:view': ['admin', 'hr_manager', 'employee'],
  // ========== Performance ==========
  'performance:view': ['admin', 'hr_manager', 'department_manager'], 
  'performance:create': ['admin', 'hr_manager'],
  'performance:update': ['admin', 'hr_manager'],
  // Loans & Rewards
  'loan:approve': ['admin', 'hr_manager'],
  'loan:view': ['admin', 'hr_manager', 'employee'],
  'reward:create': ['admin', 'hr_manager'],
  'reward:view': ['admin', 'hr_manager', 'department_manager', 'employee'],
  // Training
  'training:create': ['admin', 'hr_manager'],
  'training:update': ['admin', 'hr_manager'],
  'training:view': ['admin', 'hr_manager', 'department_manager', 'employee', 'intern'],
  // Recruitment
  'recruitment:create': ['admin', 'hr_manager'],
  'recruitment:update': ['admin', 'hr_manager'],
  'recruitment:view': ['admin', 'hr_manager', 'department_manager'],
  // ========== Welfare (رفاهی) ==========
  'welfare:view': ['admin', 'hr_manager', 'department_manager', 'employee'],  // ← اضافه شد
  'welfare:create': ['admin', 'hr_manager'],
  'welfare:update': ['admin', 'hr_manager'],
  // Announcements
  'announcement:create': ['admin', 'hr_manager'],
  'announcement:delete': ['admin'],
  'announcement:view': ['admin', 'hr_manager', 'department_manager', 'employee', 'intern'],
  // Settings
  'settings:manage': ['admin'],
  'settings:view': ['admin', 'hr_manager'],
  // Reports
  'reports:view': ['admin', 'hr_manager', 'manager'],
} as const

export type Permission = keyof typeof PERMISSIONS

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: any, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission]
  return allowed ? allowed.includes(role) : false
}

/**
 * Get all permissions for a given role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter(
    (permission) => hasPermission(role, permission)
  )
}

/**
 * Require a specific permission for the current user
 */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new Error('UNAUTHORIZED')
  if (!hasPermission(user.role, permission)) throw new Error('FORBIDDEN')
  return user
}

