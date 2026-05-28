// ============================================
// Constants — قرارداد و احکام
// ============================================

import { FileText, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export const CONTRACT_TYPES = [
  { value: 'قرارداد', label: 'قرارداد', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'حکم کارگزینی', label: 'حکم کارگزینی', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { value: 'حکم انتقال', label: 'حکم انتقال', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { value: 'حکم تغییر سمت', label: 'حکم تغییر سمت', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { value: 'حکم تمدید', label: 'حکم تمدید', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
]

export const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'فعال', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  expired: { label: 'منقضی', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: AlertTriangle },
  terminated: { label: 'فسخ شده', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', icon: XCircle },
  draft: { label: 'پیش‌نویس', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300', icon: FileText },
}
