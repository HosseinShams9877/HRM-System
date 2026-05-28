// ============================================
// Constants — ارزیابی عملکرد
// ============================================

import { Clock, CheckCircle2, Eye } from 'lucide-react'
import type { FormData } from './types/types'

export const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  completed: { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  reviewed: { label: 'بررسی شده', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Eye },
}

export const KPI_LABELS: Record<string, string> = {
  kpi1: 'توانایی فنی',
  kpi2: 'روابط انسانی',
  kpi3: 'نوآوری',
  kpi4: 'رهبری',
}

export const CHART_COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899']
export const PIE_COLORS = ['#f59e0b', '#10b981', '#8b5cf6']

export const scoreColor = (score: number, target: number) => {
  if (score >= target) return 'text-emerald-600'
  if (score >= target * 0.7) return 'text-amber-600'
  return 'text-red-600'
}

export const scoreBgColor = (score: number, target: number) => {
  if (score >= target) return 'bg-emerald-500'
  if (score >= target * 0.7) return 'bg-amber-500'
  return 'bg-red-500'
}

export const initialForm: FormData = {
  employeeId: '',
  period: '',
  score: 0,
  target: 3,
  kpi1: null,
  kpi2: null,
  kpi3: null,
  kpi4: null,
  comments: '',
  status: 'pending',
}
