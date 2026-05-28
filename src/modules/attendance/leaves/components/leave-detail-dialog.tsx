'use client'

import { CheckCircle2, XCircle, FileText } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Separator } from '@/core/components/ui/separator'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { LEAVE_TYPE_CONFIG, DEFAULT_LEAVE_TYPE } from '../constants'
import { LeaveTypeBadge } from './leave-type-badge'
import { LeaveStatusBadge } from './leave-status-badge'
import type { LeaveRecord } from '../index'

export function LeaveDetailDialog({
  leave,
  onClose,
  onApprove,
  onReject,
}: {
  leave: LeaveRecord | null
  onClose: () => void
  onApprove: (leave: LeaveRecord) => void
  onReject: (leave: LeaveRecord) => void
}) {
  if (!leave) return null

  const fullName = `${leave.employee.firstName} ${leave.employee.lastName}`
  const initials = `${leave.employee.firstName[0]}${leave.employee.lastName[0]}`
  const typeConf = LEAVE_TYPE_CONFIG[leave.type] || DEFAULT_LEAVE_TYPE

  return (
    <Dialog open={!!leave} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            جزئیات مرخصی
          </DialogTitle>
          <DialogDescription>اطلاعات کامل درخواست مرخصی</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Employee Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-violet-500 text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-semibold">{fullName}</h4>
              <p className="text-[11px] text-muted-foreground">
                {leave.employee.position || leave.employee.department || `کد: ${toPersianDigits(leave.employee.personnelCode)}`}
              </p>
            </div>
          </div>

          <Separator />

          {/* Leave Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">نوع مرخصی</span>
              <div><LeaveTypeBadge type={leave.type} /></div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">وضعیت</span>
              <div><LeaveStatusBadge status={leave.status} /></div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">تاریخ شروع</span>
              <div className="text-sm font-medium">{formatShamsi(leave.startDate)}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">تاریخ پایان</span>
              <div className="text-sm font-medium">{formatShamsi(leave.endDate)}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">تعداد روز</span>
              <div className="text-sm font-bold">{toPersianDigits(leave.totalDays)} روز</div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">تاریخ ثبت</span>
              <div className="text-sm">{formatShamsi(leave.createdAt?.split('T')[0] || '')}</div>
            </div>
          </div>

          {/* Reason */}
          {leave.reason && (
            <>
              <Separator />
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">دلیل مرخصی</span>
                <p className="text-sm bg-muted/50 rounded-md p-3">{leave.reason}</p>
              </div>
            </>
          )}

          {/* Type Color Indicator */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${typeConf.gradientFrom} ${typeConf.gradientTo}`} />
            <span className="text-[11px] text-muted-foreground">نشانگر رنگ نوع مرخصی</span>
          </div>
        </div>

        {/* Actions */}
        {leave.status === 'pending' && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose}>بستن</Button>
            <Button
              variant="outline"
              className="gap-1 text-red-500 hover:bg-red-50 border-red-200"
              onClick={() => onReject(leave)}
            >
              <XCircle className="w-4 h-4" />
              رد کردن
            </Button>
            <Button
              className="gap-1"
              onClick={() => onApprove(leave)}
            >
              <CheckCircle2 className="w-4 h-4" />
              تایید
            </Button>
          </DialogFooter>
        )}
        {leave.status !== 'pending' && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>بستن</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
