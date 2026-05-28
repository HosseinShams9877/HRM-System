'use client'

import { Badge } from '@/core/components/ui/badge'

// ---- Employee Status Badge ----
export function EmployeeStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    active: { label: 'فعال', variant: 'default', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200' },
    inactive: { label: 'غیرفعال', variant: 'secondary', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200' },
    suspended: { label: 'معلق', variant: 'secondary', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200' },
    probation: { label: 'آزمایشی', variant: 'outline', className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200' },
  }
  const c = config[status] || { label: status, variant: 'secondary' as const }
  return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>
}

// ---- Leave Status Badge ----
export function LeaveStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'در انتظار', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200' },
    approved: { label: 'تأیید شده', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200' },
    rejected: { label: 'رد شده', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200' },
  }
  const c = config[status] || { label: status, className: '' }
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

// ---- Leave Type Badge ----
export function LeaveTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    'استحقاقی': { label: 'استحقاقی', className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200' },
    'استعلاجی': { label: 'استعلاجی', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200' },
    'بدون حقوق': { label: 'بدون حقوق', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200' },
    'ازدواج': { label: 'ازدواج', className: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200' },
    'فوت': { label: 'فوت', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200' },
  }
  const c = config[type] || { label: type, className: '' }
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

// ---- Contract Status Badge ----
export function ContractStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'فعال', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200' },
    expired: { label: 'منقضی', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200' },
    terminated: { label: 'فسخ شده', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200' },
    draft: { label: 'پیش‌نویس', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200' },
  }
  const c = config[status] || { label: status, className: '' }
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

// ---- PaySlip Status Badge ----
export function PaySlipStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'پیش‌نویس', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200' },
    confirmed: { label: 'تأیید شده', className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200' },
    paid: { label: 'پرداخت شده', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200' },
    closed: { label: 'بسته شده', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200' },
  }
  const c = config[status] || { label: status, className: '' }
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

// ---- Performance Status Badge ----
export function PerformanceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'در انتظار', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200' },
    completed: { label: 'تکمیل شده', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200' },
    reviewed: { label: 'بازبینی شده', className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200' },
  }
  const c = config[status] || { label: status, className: '' }
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

// ---- General Status Badge (for any custom status) ----
export function GeneralStatusBadge({ status, label }: { status: string; label?: string }) {
  const normalized = status.toLowerCase()
  let className = ''
  
  if (['active', 'completed', 'approved', 'paid', 'confirmed'].includes(normalized)) {
    className = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200'
  } else if (['pending', 'draft', 'planned', 'in_progress', 'registered'].includes(normalized)) {
    className = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200'
  } else if (['rejected', 'expired', 'terminated', 'inactive', 'absent'].includes(normalized)) {
    className = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200'
  } else {
    className = 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200'
  }

  return <Badge variant="outline" className={className}>{label || status}</Badge>
}
