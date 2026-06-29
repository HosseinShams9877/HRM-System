// src/modules/orders/components/order-badges.tsx
'use client'

import { Badge } from '@/core/components/ui/badge'

export const ORDER_TYPES = [
  { value: 'employment', label: 'استخدام', icon: '📋', color: 'bg-emerald-100 text-emerald-600' },
  { value: 'extension', label: 'تمدید قرارداد', icon: '📄', color: 'bg-blue-100 text-blue-600' },
  { value: 'salary_increase', label: 'افزایش حقوق', icon: '💰', color: 'bg-amber-100 text-amber-600' },
  { value: 'position_change', label: 'تغییر سمت', icon: '🔄', color: 'bg-purple-100 text-purple-600' },
  { value: 'department_change', label: 'تغییر واحد', icon: '🏢', color: 'bg-indigo-100 text-indigo-600' },
  { value: 'promotion', label: 'ارتقاء شغلی', icon: '⬆️', color: 'bg-emerald-100 text-emerald-600' },
  { value: 'transfer', label: 'انتقال', icon: '🚚', color: 'bg-teal-100 text-teal-600' },
  { value: 'suspension', label: 'تعلیق', icon: '⏸️', color: 'bg-orange-100 text-orange-600' },
  { value: 'termination', label: 'پایان همکاری', icon: '🚪', color: 'bg-rose-100 text-rose-600' },
  { value: 'other', label: 'سایر', icon: '📄', color: 'bg-gray-100 text-gray-600' },
]

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'پیش‌نویس', color: 'bg-gray-100 text-gray-600' },
  { value: 'pending', label: 'در انتظار تأیید', color: 'bg-amber-100 text-amber-600' },
  { value: 'approved', label: 'تأیید شده', color: 'bg-blue-100 text-blue-600' },
  { value: 'active', label: 'فعال', color: 'bg-emerald-100 text-emerald-600' },
  { value: 'cancelled', label: 'ابطال شده', color: 'bg-rose-100 text-rose-600' },
  { value: 'replaced', label: 'جایگزین شده', color: 'bg-gray-100 text-gray-600' },
]

export function OrderTypeBadge({ type }: { type: string }) {
  const found = ORDER_TYPES.find(t => t.value === type)
  return (
    <Badge className={found?.color || 'bg-gray-100 text-gray-600'}>
      {found?.icon} {found?.label || type}
    </Badge>
  )
}

export function OrderStatusBadge({ status }: { status: string }) {
  const found = STATUS_OPTIONS.find(s => s.value === status)
  return (
    <Badge className={found?.color || 'bg-gray-100 text-gray-600'}>
      {found?.label || status}
    </Badge>
  )
}