'use client'

import {
  MapPin, PlaneTakeoff, Clock, CalendarDays, FileText
} from 'lucide-react'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Separator } from '@/core/components/ui/separator'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import type { MissionRecord } from '../index'
import { STATUS_CONFIG } from '../constants'

// ============================================
// Status Badge
// ============================================
// اضافه کن به helpers یا همون فایل
const formatShamsiDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '—'
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(date.getTime())) return '—'
    
    const persianDate = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
    
    // تبدیل اعداد به فارسی
    return persianDate.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
  } catch (error) {
    return '—'
  }
}

export function MissionStatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return <Badge className={`text-[11px] font-medium ${c.badgeClass}`}>{c.label}</Badge>
}

// ============================================
// Mission Detail Dialog
// ============================================

export function MissionDetailDialog({
  open,
  onClose,
  mission,
}: {
  open: boolean
  onClose: () => void
  mission: MissionRecord | null
}) {
  if (!mission) return null

  const statusConf = STATUS_CONFIG[mission.status] || STATUS_CONFIG.pending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlaneTakeoff className="w-5 h-5 text-sky-600" />
            جزئیات مأموریت
          </DialogTitle>
          <DialogDescription>مشاهده اطلاعات کامل مأموریت</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-5">
          {/* Title + Status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">{mission.title}</h3>
              {mission.destination && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {mission.destination}
                </p>
              )}
            </div>
            <MissionStatusBadge status={mission.status} />
          </div>

          <Separator />

          {/* Employee */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-teal-500 text-white text-sm font-bold">
                {mission.employee.firstName[0]}
                {mission.employee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {mission.employee.firstName} {mission.employee.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {mission.employee.personnelCode}
                {mission.employee.department ? ` · ${mission.employee.department}` : ''}
              </p>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                تاریخ شروع
              </p>
              <p className="font-medium text-sm">{formatShamsi(mission.startDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                تاریخ پایان
              </p>
              <p className="font-medium text-sm">{formatShamsi(mission.endDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                مدت مأموریت
              </p>
              <p className="font-bold text-sky-600">{toPersianDigits(mission.totalDays)} روز</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                وضعیت
              </p>
              <div className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium bg-gradient-to-r ${statusConf.gradientClass} text-white`}>
                {statusConf.label}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">تاریخ ثبت درخواست</p>
            <p className="text-sm font-medium">
              {mission.createdAt ? formatShamsiDate(mission.createdAt.split('T')[0]?.replace(/-/g, '/') || '') : '—'}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
