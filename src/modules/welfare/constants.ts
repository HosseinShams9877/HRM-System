// ============================================
// Constants — رفاهی
// ============================================

export const REWARD_TYPES = ['نقدی', 'غیرنقدی', 'تقدیر'] as const

export const REWARD_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  'نقدی': { label: 'نقدی', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: '💰' },
  'غیرنقدی': { label: 'غیرنقدی', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: '🎁' },
  'تقدیر': { label: 'تقدیر', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: '🏆' },
}

export const LOAN_TYPES = ['وام', 'مساعده'] as const

export const LOAN_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  'وام': { label: 'وام', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  'مساعده': { label: 'مساعده', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
}

export const LOAN_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  approved: { label: 'تایید شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  rejected: { label: 'رد شده', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  paid: { label: 'پرداخت شده', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
}

export const CHART_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

// Helper: empty form states
export const emptyRewardForm = { employeeId: '', type: 'نقدی', title: '', amount: 0, reason: '', date: '' }
export const emptyLoanForm = { employeeId: '', type: 'وام', amount: 0, reason: '', installments: 12 }
