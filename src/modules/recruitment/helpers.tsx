// src/modules/recruitment/components/helpers.ts
import { ReactNode } from 'react'
import { Badge } from '@/core/components/ui/badge'

export const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)])
}

export const formatDate = (date: string | Date): string => {
  try {
    return new Date(date).toLocaleDateString('fa-IR')
  } catch {
    return '—'
  }
}

export const formatDateTime = (date: string | Date): string => {
  try {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export const formatCurrency = (amount: number): string => {
  return toPersianNumber(amount.toLocaleString('en-US')) + ' ریال'
}

export const safeArray = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data) {
    const d = (data as { data: unknown }).data
    return Array.isArray(d) ? d : []
  }
  return []
}

export const getSourceLabel = (source: string): string => {
  const sources: Record<string, string> = {
    website: 'وب‌سایت',
    referral: 'معرفی',
    job_site: 'سایت کاریابی',
    linkedin: 'لینکدین',
    other: 'سایر',
  }
  return sources[source] || source
}

export const getStageLabel = (stage: string): string => {
  const stages: Record<string, string> = {
    applied: 'ثبت شده',
    screening: 'غربالگری',
    interview: 'مصاحبه',
    testing: 'آزمون',
    offer: 'پیشنهاد',
    hired: 'استخدام شده',
    rejected: 'رد شده',
    withdrawn: 'انصراف',
  }
  return stages[stage] || stage
}

export const getInterviewTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    phone: 'تلفنی',
    video: 'تصویری',
    onsite: 'حضوری',
    technical: 'فنی',
    hr: 'منابع انسانی',
    manager: 'مدیریتی',
  }
  return types[type] || type
}

export const getAssessmentTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    written_test: 'آزمون کتبی',
    practical_task: 'تکلیف عملی',
    psychological: 'آزمون روان‌شناختی',
    technical_exam: 'آزمون فنی',
  }
  return types[type] || type
}

export const getStatusBadge = (status: string): ReactNode => {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: 'پیش‌نویس', cls: 'bg-gray-500' },
    new: { label: 'جدید', cls: 'bg-cyan-500' },
    open: { label: 'فعال', cls: 'bg-emerald-500' },
    paused: { label: 'متوقف', cls: 'bg-amber-500' },
    closed: { label: 'بسته', cls: 'bg-red-500' },
    filled: { label: 'پر شده', cls: 'bg-blue-500' },
    applied: { label: 'ثبت شده', cls: 'bg-blue-500' },
    screening: { label: 'غربالگری', cls: 'bg-amber-500' },
    interview: { label: 'مصاحبه', cls: 'bg-purple-500' },
    testing: { label: 'آزمون', cls: 'bg-violet-500' },
    offer: { label: 'پیشنهاد', cls: 'bg-teal-500' },
    hired: { label: 'استخدام', cls: 'bg-emerald-600' },
    rejected: { label: 'رد شده', cls: 'bg-red-500' },
    scheduled: { label: 'برنامه‌ریزی', cls: 'bg-blue-500' },
    completed: { label: 'انجام شده', cls: 'bg-emerald-500' },
    cancelled: { label: 'لغو شده', cls: 'bg-red-500' },
    no_show: { label: 'حاضر نشد', cls: 'bg-orange-500' },
    active: { label: 'فعال', cls: 'bg-emerald-500' },
    archived: { label: 'بایگانی', cls: 'bg-gray-500' },
    pending: { label: 'در انتظار', cls: 'bg-amber-500' },
    passed: { label: 'قبول', cls: 'bg-emerald-500' },
    failed: { label: 'مردود', cls: 'bg-red-500' },
    accepted: { label: 'پذیرفته شده', cls: 'bg-emerald-500' },
    declined: { label: 'رد شده', cls: 'bg-red-500' },
    revoked: { label: 'ابطال شده', cls: 'bg-gray-500' },
    assigned: { label: 'تعیین شده', cls: 'bg-blue-500' },
    in_progress: { label: 'در حال انجام', cls: 'bg-amber-500' },
  }
  const info = map[status]
  if (!info) return <Badge variant="outline">{status}</Badge>
  return <Badge className={`${info.cls} text-white border-0`}>{info.label}</Badge>
}

export const getStageColor = (stage: string): string => {
  const colors: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-800 border-blue-200',
    screening: 'bg-amber-100 text-amber-800 border-amber-200',
    interview: 'bg-purple-100 text-purple-800 border-purple-200',
    testing: 'bg-violet-100 text-violet-800 border-violet-200',
    offer: 'bg-teal-100 text-teal-800 border-teal-200',
    hired: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200'
}