'use client'

import {
  CheckCircle2, XCircle, Clock, Eye,
  FileText, CalendarDays,
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Separator } from '@/core/components/ui/separator'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { LEAVE_TYPE_CONFIG, DEFAULT_LEAVE_TYPE } from '../constants'
import { LeaveTypeBadge } from './leave-type-badge'
import { LeaveStatusBadge } from './leave-status-badge'
import type { LeaveRecord } from '../index'

export function LeaveCard({
  leave,
  onApprove,
  onReject,
  onView,
}: {
  leave: LeaveRecord
  onApprove: (leave: LeaveRecord) => void
  onReject: (leave: LeaveRecord) => void
  onView: (leave: LeaveRecord) => void
}) {
  const typeConf = LEAVE_TYPE_CONFIG[leave.type] || DEFAULT_LEAVE_TYPE
  const fullName = `${leave.employee.firstName} ${leave.employee.lastName}`
  const initials = `${leave.employee.firstName[0]}${leave.employee.lastName[0]}`

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all group">
      {/* Gradient top border by type */}
      <div className={`h-1.5 ${typeConf.gradientBorder}`} />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-11 h-11 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-violet-500 text-white text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-sm font-semibold truncate">{fullName}</h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  {leave.employee.position || leave.employee.department || toPersianDigits(leave.employee.personnelCode)}
                </p>
              </div>
              <LeaveTypeBadge type={leave.type} />
            </div>

            <Separator className="my-2" />

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-muted-foreground">شروع:</span>
                <span className="font-medium">{formatShamsi(leave.startDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-violet-500" />
                <span className="text-muted-foreground">پایان:</span>
                <span className="font-medium">{formatShamsi(leave.endDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-muted-foreground">روزها:</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                  {toPersianDigits(leave.totalDays)} روز
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-muted-foreground">وضعیت:</span>
                <LeaveStatusBadge status={leave.status} />
              </div>
            </div>

            {leave.reason && (
              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-1">دلیل: {leave.reason}</p>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] gap-1"
                onClick={() => onView(leave)}
              >
                <Eye className="w-3 h-3" />
                جزئیات
              </Button>
              {leave.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] gap-1 text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                    onClick={() => onApprove(leave)}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    تایید
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] gap-1 text-red-500 hover:bg-red-50 border-red-200"
                    onClick={() => onReject(leave)}
                  >
                    <XCircle className="w-3 h-3" />
                    رد
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
