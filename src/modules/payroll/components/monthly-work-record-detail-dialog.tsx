'use client'

import {
  Calendar, User, Clock, AlertTriangle, X,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { PERSIAN_MONTHS } from '../constants'
import type { MonthlyWorkRecord } from '../types/monthly-work-record'

// ============================================
// MonthlyWorkRecordDetailDialog
// ============================================

export function MonthlyWorkRecordDetailDialog({
  open,
  onClose,
  record,
}: {
  open: boolean
  onClose: () => void
  record: MonthlyWorkRecord | null
}) {
  if (!record) return null

  const emp = record.employee
  const monthName = PERSIAN_MONTHS[record.month - 1] || ''
  const shiftLabel = record.shiftType
    ? SHIFT_TYPES.find(s => s.value === record.shiftType)?.label || record.shiftType
    : '—'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">پیش‌نویس</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">تأیید شده</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400">بسته شده</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // آیتم‌های کارکرد
  const items = [
    { label: 'روزهای کارکرد', value: record.workDays, color: 'text-emerald-600' },
    { label: 'ساعات کار عادی', value: record.normalHours, color: 'text-blue-600' },
    { label: 'اضافه‌کاری', value: record.overtimeHours, color: 'text-amber-600' },
    { label: 'شب‌کاری', value: record.nightShiftHours, color: 'text-indigo-600' },
    { label: 'نوبت‌کاری', value: shiftLabel, color: 'text-purple-600', isString: true },
    { label: 'جمعه‌کاری', value: record.fridayWorkHours, color: 'text-rose-600' },
    { label: 'تعطیل‌کاری', value: record.holidayWorkHours, color: 'text-orange-600' },
    { label: 'مأموریت', value: record.missionDays, color: 'text-blue-600' },
    { label: 'مرخصی استحقاقی', value: record.leaveDays, color: 'text-emerald-600' },
    { label: 'مرخصی بدون حقوق', value: record.unpaidLeaveDays, color: 'text-rose-600' },
    { label: 'غیبت', value: record.absenceDays, color: 'text-red-600' },
    { label: 'تأخیر', value: record.delayHours, color: 'text-orange-600' },
    { label: 'تعجیل', value: record.earlyLeaveHours, color: 'text-amber-600' },
    { label: 'کسرکار', value: record.shortWorkHours, color: 'text-slate-600' },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              جزئیات کارکرد ماهانه
            </div>
            {getStatusBadge(record.status)}
          </DialogTitle>
          <DialogDescription>
            {toPersianDigits(record.year)} / {monthName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* اطلاعات کارمند */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold">
                {emp?.firstName?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{emp?.firstName} {emp?.lastName}</h3>
              <p className="text-sm text-muted-foreground">
                کد پرسنلی: {toPersianDigits(emp?.personnelCode || '')}
                {emp?.department && ` — ${emp.department}`}
                {emp?.position && ` — ${emp.position}`}
              </p>
            </div>
          </div>

          {/* جدول کارکرد */}
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted/50 px-4 py-2.5 font-semibold text-sm border-b">
              اطلاعات کارکرد
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-0">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-2.5 flex items-center justify-between border-b ${idx % 2 === 0 ? 'bg-muted/10' : ''}`}
                >
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className={`font-mono font-semibold text-sm ${item.color}`}>
                    {item.isString ? item.value : toPersianDigits(item.value || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* توضیحات */}
          {record.notes && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span className="text-amber-700 dark:text-amber-300">{record.notes}</span>
              </div>
            </div>
          )}

          {/* خلاصه */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">روزهای کارکرد</div>
              <div className="font-bold text-emerald-700 dark:text-emerald-300">{toPersianDigits(record.workDays)}</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">اضافه‌کاری</div>
              <div className="font-bold text-amber-700 dark:text-amber-300">{toPersianDigits(record.overtimeHours)}</div>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">شب‌کاری</div>
              <div className="font-bold text-indigo-700 dark:text-indigo-300">{toPersianDigits(record.nightShiftHours)}</div>
            </div>
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">غیبت</div>
              <div className="font-bold text-rose-700 dark:text-rose-300">{toPersianDigits(record.absenceDays)}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>بستن</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// SHIFT_TYPES برای نمایش
const SHIFT_TYPES = [
  { value: 'none', label: 'بدون نوبت‌کاری' },
  { value: 'morning_evening', label: 'صبح و عصر' },
  { value: 'morning_evening_night', label: 'صبح، عصر و شب' },
  { value: 'morning_night', label: 'صبح و شب' },
  { value: 'evening_night', label: 'عصر و شب' },
]