'use client'

import {
  Briefcase, Calendar, Edit, Trash2, Eye, Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { TYPE_GRADIENT_MAP, TYPE_BORDER_MAP, TYPE_BG_MAP, TYPE_TEXT_MAP } from '../constants'
import { AppointmentStatusBadge } from './appointment-status-badge'
import { AppointmentTypeBadge } from './appointment-type-badge'
import type { Appointment } from '../index'

export function AppointmentCardView({
  appointments,
  onView,
  onEdit,
  onEnd,
  onDelete,
}: {
  appointments: Appointment[]
  onView: (apt: Appointment) => void
  onEdit: (apt: Appointment) => void
  onEnd: (apt: Appointment) => void
  onDelete: (apt: Appointment) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((apt) => {
        const borderClass = TYPE_BORDER_MAP[apt.type] || 'border-t-gray-500'
        const bgClass = TYPE_BG_MAP[apt.type] || 'bg-muted/50'
        const textClass = TYPE_TEXT_MAP[apt.type] || 'text-muted-foreground'

        return (
          <Card
            key={apt.id}
            className={`border-0 shadow-sm border-t-4 ${borderClass} cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => onView(apt)}
          >
            <CardContent className="p-4 space-y-3">
              {/* Employee header */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={`bg-gradient-to-br ${TYPE_GRADIENT_MAP[apt.type] || 'from-gray-400 to-gray-500'} text-white text-sm font-bold`}>
                    {apt.employee.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">
                    {apt.employee.firstName} {apt.employee.lastName}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    کد پرسنلی: {toPersianDigits(apt.employee.personnelCode)}
                  </p>
                </div>
                <AppointmentStatusBadge status={apt.status} />
              </div>

              {/* Position info */}
              <div className={`p-2.5 rounded-lg ${bgClass}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase className={`w-3.5 h-3.5 ${textClass}`} />
                  <span className="text-xs font-medium truncate">{apt.position.title}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {apt.position.department?.name || 'بدون دپارتمان'}
                  {apt.position.jobGrade && ` | گروه ${apt.position.jobGrade}`}
                </div>
              </div>

              {/* Date range */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatShamsi(apt.startDate)}</span>
                </div>
                <span>تا</span>
                <div>
                  <span>{apt.endDate ? formatShamsi(apt.endDate) : 'فعلی'}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <AppointmentTypeBadge type={apt.type} />
                {apt.status === 'active' && (
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onView(apt)}
                      title="مشاهده"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onEdit(apt)}
                      title="ویرایش"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
                      onClick={() => onEnd(apt)}
                      title="پایان انتصاب"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      onClick={() => onDelete(apt)}
                      title="لغو انتصاب"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
