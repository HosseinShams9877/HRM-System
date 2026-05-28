import type { Employee } from './types/types'

// ============================================
// Constants — Employee List Module
// ============================================

export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'فعال', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  inactive: { label: 'غیرفعال', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  suspended: { label: 'معلق', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  probation: { label: 'آزمایشی', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
}

export const CSV_COLUMNS = [
  { key: 'firstName', label: 'نام' },
  { key: 'lastName', label: 'نام خانوادگی' },
  { key: 'nationalCode', label: 'کد ملی' },
  { key: 'personnelCode', label: 'کد پرسنلی' },
  { key: 'department', label: 'دپارتمان' },
  { key: 'position', label: 'پست سازمانی' },
  { key: 'status', label: 'وضعیت' },
  { key: 'hireDate', label: 'تاریخ استخدام' },
  { key: 'phone', label: 'تلفن' },
  { key: 'email', label: 'ایمیل' },
] as const

export function getEmployeeCSVData(employees: Employee[]) {
  return employees.map(e => ({
    firstName: e.firstName,
    lastName: e.lastName,
    nationalCode: e.nationalCode,
    personnelCode: e.personnelCode,
    department: e.department || '',
    position: e.position || '',
    status: e.status,
    hireDate: e.hireDate,
    phone: e.phone || '',
    email: e.email || '',
  }))
}
