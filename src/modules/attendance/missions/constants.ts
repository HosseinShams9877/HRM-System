// ============================================
// Constants — Missions Module
// ============================================

export const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; gradientClass: string; color: string }> = {
  pending: {
    label: 'در انتظار',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    gradientClass: 'from-amber-400 to-amber-600',
    color: '#f59e0b',
  },
  approved: {
    label: 'تایید شده',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    gradientClass: 'from-emerald-400 to-emerald-600',
    color: '#10b981',
  },
  rejected: {
    label: 'رد شده',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    gradientClass: 'from-red-400 to-red-600',
    color: '#ef4444',
  },
}

export const PIE_COLORS = ['#f59e0b', '#10b981', '#ef4444']
