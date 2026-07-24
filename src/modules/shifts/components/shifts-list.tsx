// components/shifts/components/shifts-list.tsx

import { MoreVertical, Eye, Edit3, Trash2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { WorkShiftData } from '../types'
import { MiniWeeklyView } from './mini-weekly-view'

interface ShiftsListProps {
  shifts: WorkShiftData[]
  onView: (shift: WorkShiftData) => void
  onEdit: (shift: WorkShiftData) => void
  onDelete: (id: string) => void
}

export function ShiftsList({ shifts, onView, onEdit, onDelete }: ShiftsListProps) {
  if (shifts.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-16 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-sm font-medium text-muted-foreground">
            شیفت تعریف نشده
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            اولین شیفت کاری را تعریف کنید
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {shifts.map(shift => {
        const workingDays = shift.schedules.filter(s => s.isWorkingDay)
        const totalHours = workingDays.reduce((sum, s) => {
          const [sh, sm] = s.startTime.split(':').map(Number)
          const [eh, em] = s.endTime.split(':').map(Number)
          return sum + ((eh * 60 + em - sh * 60 - sm) / 60)
        }, 0)

        return (
          <Card key={shift.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: shift.color }}
                  >
                    {shift.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{shift.name}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {shift.code}
                      </Badge>
                      {!shift.isActive && (
                        <Badge className="text-[10px] bg-red-100 text-red-700">
                          غیرفعال
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {toPersianDigits(workingDays.length)} روز کاری ·{' '}
                      {toPersianDigits(Math.round(totalHours * 10) / 10)} ساعت هفتگی ·{' '}
                      {toPersianDigits(shift._count?.assignments || 0)} نفر
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(shift)}>
                      <Eye className="w-3.5 h-3.5 ml-2" />
                      مشاهده
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(shift)}>
                      <Edit3 className="w-3.5 h-3.5 ml-2" />
                      ویرایش
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(shift.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-2" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <MiniWeeklyView schedules={shift.schedules} color={shift.color} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}