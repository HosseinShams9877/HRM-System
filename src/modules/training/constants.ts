// ============================================
// Constants — Training Module
// ============================================

import { BookOpen, Briefcase, Heart, Shield, Star } from 'lucide-react'

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  planned: { label: 'برنامه‌ریزی شده', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  in_progress: { label: 'در حال برگزاری', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  completed: { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
}

export const PARTICIPANT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  registered: { label: 'ثبت‌نام', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  attending: { label: 'در حال شرکت', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  completed: { label: 'تکمیل', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  absent: { label: 'عدم حضور', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
}

export const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  technical: { label: 'فنی', icon: BookOpen, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  management: { label: 'مدیریت', icon: Briefcase, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  soft: { label: 'نرم', icon: Heart, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
  safety: { label: 'ایمنی', icon: Shield, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  other: { label: 'دیگر', icon: Star, color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300' },
}

export const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
