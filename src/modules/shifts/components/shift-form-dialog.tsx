// modules/shifts/components/shift-form-dialog.tsx

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Separator } from '@/core/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { SHIFT_COLORS, DEFAULT_SCHEDULES, DAYS_OF_WEEK } from '../constants'
import { WorkShiftData, ShiftSchedule } from '../types'
import { WeeklyScheduleGrid } from './weekly-schedule-grid'

interface ShiftFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  initialData?: WorkShiftData | null
}

export function ShiftFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: ShiftFormDialogProps) {
  const isEdit = !!initialData
  const [form, setForm] = useState({ 
    name: '', 
    code: '', 
    color: '#10b981', 
    description: '', 
    isActive: true 
  })
  const [schedules, setSchedules] = useState<ShiftSchedule[]>(DEFAULT_SCHEDULES)
  const [copySourceDay, setCopySourceDay] = useState<number | null>(null)

  useEffect(() => {
    if (initialData) {
      setForm({ 
        name: initialData.name, 
        code: initialData.code, 
        color: initialData.color, 
        description: initialData.description || '', 
        isActive: initialData.isActive 
      })
      setSchedules(initialData.schedules.length > 0
        ? DAYS_OF_WEEK.map(d => { 
            const existing = initialData.schedules.find(s => s.dayOfWeek === d.value)
            return existing || { 
              dayOfWeek: d.value, 
              dayName: d.label, 
              isWorkingDay: d.value < 6, 
              startTime: '08:00', 
              endTime: '17:00', 
              breakStart: '12:00', 
              breakEnd: '13:00', 
              lateThreshold: '08:15', 
              earlyLeaveThreshold: '16:45', 
              minWorkHours: 8 
            }
          })
        : DEFAULT_SCHEDULES
      )
    } else {
      setForm({ name: '', code: '', color: '#10b981', description: '', isActive: true })
      setSchedules(DEFAULT_SCHEDULES)
    }
    setCopySourceDay(null)
  }, [open, initialData])

  const handleCopyDay = (sourceDay: number) => {
    const source = schedules.find(s => s.dayOfWeek === sourceDay)
    if (!source) return
    setSchedules(prev => prev.map(s => 
      s.isWorkingDay ? { 
        ...s, 
        startTime: source.startTime, 
        endTime: source.endTime, 
        breakStart: source.breakStart, 
        breakEnd: source.breakEnd, 
        lateThreshold: source.lateThreshold, 
        earlyLeaveThreshold: source.earlyLeaveThreshold, 
        minWorkHours: source.minWorkHours 
      } : s
    ))
  }

  const handleSubmit = () => {
    if (!form.name || !form.code) return
    onSubmit({ ...form, schedules })
  }

  const workingDaysCount = schedules.filter(s => s.isWorkingDay).length
  const holidaysCount = schedules.filter(s => !s.isWorkingDay).length
  const firstWorkingDay = schedules.find(s => s.isWorkingDay)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            {isEdit ? 'ویرایش شیفت کاری' : 'تعریف شیفت کاری جدید'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'برنامه هفتگی و تنظیمات شیفت را بروزرسانی کنید' : 'شیفت جدید با برنامه هفتگی دینامیک تعریف کنید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              اطلاعات پایه
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>نام شیفت *</Label>
                <Input 
                  placeholder="مثلاً: شیفت صبح" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>کد شیفت *</Label>
                <Input 
                  placeholder="SH-۰۰۱" 
                  value={form.code} 
                  onChange={(e) => setForm({ ...form, code: e.target.value })} 
                  dir="ltr" 
                />
              </div>
              <div className="space-y-2">
                <Label>رنگ</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {SHIFT_COLORS.map(c => (
                    <button
                      key={c}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setForm({ ...form, color: c })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <Label>توضیحات</Label>
              <Input 
                placeholder="توضیحات اختیاری..." 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
              />
            </div>
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                برنامه هفتگی
              </h4>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">کپی تنظیمات روز:</Label>
                <Select 
                  value={copySourceDay !== null ? String(copySourceDay) : ''} 
                  onValueChange={(v) => { 
                    if (v) { 
                      handleCopyDay(parseInt(v))
                      setCopySourceDay(null) 
                    } 
                  }}
                >
                  <SelectTrigger className="w-[130px] h-7 text-xs">
                    <SelectValue placeholder="انتخاب روز" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(d => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <WeeklyScheduleGrid schedules={schedules} onChange={setSchedules} />
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                روزهای کاری: {toPersianDigits(workingDaysCount)}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                روزهای تعطیل: {toPersianDigits(holidaysCount)}
              </div>
              {firstWorkingDay && (
                <div>
                  ساعات کاری: {firstWorkingDay.startTime} تا {firstWorkingDay.endTime}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!form.name || !form.code} 
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            {isEdit ? 'بروزرسانی' : 'ایجاد شیفت'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}