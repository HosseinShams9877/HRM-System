// components/Shifts/components/shift-detail-dialog.tsx

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
  } from '@/core/components/ui/dialog'
  import { Button } from '@/core/components/ui/button'
  import { Badge } from '@/core/components/ui/badge'
  import { Card, CardContent } from '@/core/components/ui/card'
  import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
  import { toPersianDigits } from '@/core/lib/utils-fa'
  import { WorkShiftData } from '../types'
  import { WeeklyScheduleGrid } from './weekly-schedule-grid'
  
  interface ShiftDetailDialogProps {
    open: boolean
    onClose: () => void
    shift: WorkShiftData | null
  }
  
  export function ShiftDetailDialog({
    open,
    onClose,
    shift,
  }: ShiftDetailDialogProps) {
    if (!shift) return null
  
    const workingDays = shift.schedules.filter(s => s.isWorkingDay)
    const totalWeeklyHours = workingDays.reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number)
      const [eh, em] = s.endTime.split(':').map(Number)
      return sum + ((eh * 60 + em - sh * 60 - sm) / 60)
    }, 0)
  
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: shift.color }}
              />
              {shift.name}
              <Badge variant="outline" className="text-xs">
                {shift.code}
              </Badge>
              {!shift.isActive && (
                <Badge className="text-[10px] bg-red-100 text-red-700">
                  غیرفعال
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {shift.description || 'بدون توضیحات'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    {toPersianDigits(workingDays.length)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    روز کاری
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {toPersianDigits(Math.round(totalWeeklyHours * 10) / 10)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    ساعت هفتگی
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {toPersianDigits(shift._count?.assignments || 0)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    کارمند فعال
                  </div>
                </CardContent>
              </Card>
            </div>
  
            <div className="border rounded-lg overflow-hidden">
              <WeeklyScheduleGrid schedules={shift.schedules} readOnly />
            </div>
  
            {shift.assignments && shift.assignments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  کارکنان منتسب
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {shift.assignments.map(a => (
                    <div
                      key={a.employee.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                    >
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[9px] font-bold">
                          {a.employee.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-xs font-medium">
                          {a.employee.firstName} {a.employee.lastName}
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          {a.employee.department || '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>بستن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }