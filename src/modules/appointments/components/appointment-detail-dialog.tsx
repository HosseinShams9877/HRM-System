'use client'

import { UserCheck, Edit, Briefcase, Building2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { TYPE_GRADIENT_MAP } from '../constants'
import { AppointmentTypeBadge } from './appointment-type-badge'
import { AppointmentStatusBadge } from './appointment-status-badge'
import type { Appointment } from '../index'

export function AppointmentDetailDialog({
  open,
  onClose,
  appointment,
  onEdit,
}: {
  open: boolean
  onClose: () => void
  appointment: Appointment | null
  onEdit: (apt: Appointment) => void
}) {
  if (!appointment) return null

  const gradientClass = TYPE_GRADIENT_MAP[appointment.type] || 'from-gray-400 to-gray-500'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            جزئیات انتصاب
          </DialogTitle>
          <DialogDescription>
            حکم شماره {appointment.decreeNumber || '—'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* کارمند */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <Avatar className="w-12 h-12">
              <AvatarFallback className={`bg-gradient-to-br ${gradientClass} text-white text-lg font-bold`}>
                {appointment.employee.firstName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold">{appointment.employee.firstName} {appointment.employee.lastName}</h3>
              <p className="text-xs text-muted-foreground">کد پرسنلی: {toPersianDigits(appointment.employee.personnelCode)}</p>
              {appointment.employee.department && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3" />
                  {appointment.employee.department}
                </p>
              )}
            </div>
          </div>

          {/* پست سازمانی */}
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-medium">{appointment.position.title}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {appointment.position.department?.name || 'بدون دپارتمان'}
              {appointment.position.jobGrade && ` | گروه ${appointment.position.jobGrade}`}
              {appointment.position.level && ` | سطح ${appointment.position.level}`}
            </div>
          </div>

          {/* اطلاعات */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">نوع انتصاب</span>
              <div className="mt-1"><AppointmentTypeBadge type={appointment.type} /></div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">وضعیت</span>
              <div className="mt-1"><AppointmentStatusBadge status={appointment.status} /></div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">تاریخ شروع</span>
              <div className="mt-1 text-sm font-medium">{formatShamsi(appointment.startDate)}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">تاریخ پایان</span>
              <div className="mt-1 text-sm font-medium">{appointment.endDate ? formatShamsi(appointment.endDate) : 'فعلی'}</div>
            </div>
          </div>

          {appointment.notes && (
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">توضیحات</span>
              <p className="text-sm mt-1 whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>بستن</Button>
          <Button onClick={() => { onEdit(appointment); onClose() }} className="gap-2">
            <Edit className="w-4 h-4" />
            ویرایش
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
