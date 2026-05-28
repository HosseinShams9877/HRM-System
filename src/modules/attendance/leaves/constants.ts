import type { ChartConfig } from '@/core/components/ui/chart'

// ============================================
// Leave Type Configuration
// ============================================

export const LEAVE_TYPE_CONFIG: Record<string, {
  label: string
  badgeClass: string
  gradientBorder: string
  gradientFrom: string
  gradientTo: string
  color: string
}> = {
  'استحقاقی': {
    label: 'استحقاقی',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    gradientBorder: 'bg-gradient-to-r from-sky-400 to-sky-500',
    gradientFrom: 'from-sky-400',
    gradientTo: 'to-sky-500',
    color: '#0ea5e9',
  },
  'استعلاجی': {
    label: 'استعلاجی',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    gradientBorder: 'bg-gradient-to-r from-rose-400 to-rose-500',
    gradientFrom: 'from-rose-400',
    gradientTo: 'to-rose-500',
    color: '#f43f5e',
  },
  'بدون حقوق': {
    label: 'بدون حقوق',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
    gradientBorder: 'bg-gradient-to-r from-slate-400 to-slate-500',
    gradientFrom: 'from-slate-400',
    gradientTo: 'to-slate-500',
    color: '#64748b',
  },
  'ازدواج': {
    label: 'ازدواج',
    badgeClass: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    gradientBorder: 'bg-gradient-to-r from-pink-400 to-pink-500',
    gradientFrom: 'from-pink-400',
    gradientTo: 'to-pink-500',
    color: '#ec4899',
  },
  'فوت': {
    label: 'فوت',
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
    gradientBorder: 'bg-gradient-to-r from-gray-400 to-gray-500',
    gradientFrom: 'from-gray-400',
    gradientTo: 'to-gray-500',
    color: '#9ca3af',
  },
}

export const DEFAULT_LEAVE_TYPE = {
  label: 'سایر',
  badgeClass: 'bg-muted text-muted-foreground',
  gradientBorder: 'bg-gradient-to-r from-violet-400 to-violet-500',
  gradientFrom: 'from-violet-400',
  gradientTo: 'to-violet-500',
  color: '#8b5cf6',
}

// ============================================
// Status Configuration
// ============================================

export const STATUS_CONFIG: Record<string, {
  label: string
  badgeClass: string
  color: string
}> = {
  pending: {
    label: 'در انتظار',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    color: '#f59e0b',
  },
  approved: {
    label: 'تایید شده',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    color: '#10b981',
  },
  rejected: {
    label: 'رد شده',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    color: '#ef4444',
  },
}

// ============================================
// Chart Configs
// ============================================

export const barChartConfig: ChartConfig = {
  count: { label: 'تعداد', color: '#a855f7' },
  'استحقاقی': { label: 'استحقاقی', color: '#0ea5e9' },
  'استعلاجی': { label: 'استعلاجی', color: '#f43f5e' },
  'بدون حقوق': { label: 'بدون حقوق', color: '#64748b' },
  'ازدواج': { label: 'ازدواج', color: '#ec4899' },
  'فوت': { label: 'فوت', color: '#9ca3af' },
}

export const pieChartConfig: ChartConfig = {
  pending: { label: 'در انتظار', color: '#f59e0b' },
  approved: { label: 'تایید شده', color: '#10b981' },
  rejected: { label: 'رد شده', color: '#ef4444' },
}
