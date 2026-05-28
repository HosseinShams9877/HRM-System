// ============================================
// Constants — Announcements & Regulations Module
// ============================================

export const PRIORITY_MAP: Record<string, { label: string; color: string; iconColor: string }> = {
  urgent: {
    label: 'فوری',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    iconColor: 'text-red-500',
  },
  high: {
    label: 'مهم',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    iconColor: 'text-amber-500',
  },
  normal: {
    label: 'عادی',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    iconColor: 'text-blue-500',
  },
  low: {
    label: 'کم‌اهمیت',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300',
    iconColor: 'text-gray-500',
  },
}

export const AUDIENCE_MAP: Record<string, string> = {
  all: 'همه',
  managers: 'مدیران',
  employees: 'کارکنان',
  department: 'دپارتمان',
}

export const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  'استخدام': { label: 'استخدام', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  'حقوق': { label: 'حقوق', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  'حضورغیاب': { label: 'حضور و غیاب', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  'آموزش': { label: 'آموزش', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  'ایمنی': { label: 'ایمنی', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
}

export const REG_STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'فعال', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  draft: { label: 'پیش‌نویس', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  revoked: { label: 'منسوخ', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
}

export const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444']
