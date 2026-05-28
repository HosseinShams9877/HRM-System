// core/config/permissions.ts

export type UserRole = 'admin' | 'hr_manager' | 'department_manager' | 'employee' | 'intern'

export const ROLE_LEVELS: Record<UserRole, number> = {
  admin: 5,
  hr_manager: 4,
  department_manager: 3,
  employee: 2,
  intern: 1,
}

// ماژول‌های اصلی سیستم
export type Module = 
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'payroll'
  | 'contracts'
  | 'performance'
  | 'training'
  | 'welfare'
  | 'settings'

// ماتریس دسترسی: هر نقش چه دسترسی‌هایی به هر ماژول دارد
export const PERMISSION_MATRIX: Record<Module, Record<UserRole, boolean>> = {
  dashboard: {
    admin: true,
    hr_manager: true,
    department_manager: true,
    employee: true,
    intern: true,
  },
  employees: {
    admin: true,
    hr_manager: true,
    department_manager: true,
    employee: false,
    intern: false,
  },
  attendance: {
    admin: true,
    hr_manager: true,
    department_manager: true,
    employee: true,
    intern: true,
  },
  payroll: {
    admin: true,
    hr_manager: true,
    department_manager: false,
    employee: false,
    intern: false,
  },
  contracts: {
    admin: true,
    hr_manager: true,
    department_manager: false,
    employee: false,
    intern: false,
  },
  performance: {
    admin: true,
    hr_manager: true,
    department_manager: true,
    employee: false,
    intern: false,
  },
  training: {
    admin: true,
    hr_manager: true,
    department_manager: true,
    employee: true,
    intern: true,
  },
  welfare: {
    admin: true,
    hr_manager: true,
    department_manager: true,
    employee: true,
    intern: false,
  },
  settings: {
    admin: true,
    hr_manager: true,
    department_manager: false,
    employee: false,
    intern: false,
  },
}

// تابع بررسی دسترسی
export function hasModuleAccess(role: UserRole, module: Module): boolean {
  return PERMISSION_MATRIX[module]?.[role] ?? false
}

// گرفتن لیست ماژول‌های قابل دسترسی برای یک نقش
export function getAccessibleModules(role: UserRole): Module[] {
  return (Object.keys(PERMISSION_MATRIX) as Module[]).filter(
    module => PERMISSION_MATRIX[module][role]
  )
}