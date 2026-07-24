// modules/shifts/components/weekly-schedule-grid.tsx

import { Switch } from '@/core/components/ui/switch'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Copy } from 'lucide-react'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { DAYS_OF_WEEK } from '../constants'
import { ShiftSchedule } from '../types'
import { TimeInput24H } from './time-input-24h'

interface WeeklyScheduleGridProps {
  schedules: ShiftSchedule[]
  onChange?: (schedules: ShiftSchedule[]) => void
  readOnly?: boolean
}

export function WeeklyScheduleGrid({ schedules, onChange, readOnly }: WeeklyScheduleGridProps) {
  const toggleWorkingDay = (dayOfWeek: number) => {
    if (readOnly || !onChange) return
    onChange(schedules.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, isWorkingDay: !s.isWorkingDay } : s
    ))
  }

  const updateSchedule = (dayOfWeek: number, field: keyof ShiftSchedule, value: unknown) => {
    if (readOnly || !onChange) return
    onChange(schedules.map(s =>
      s.dayOfWeek === dayOfWeek ? { 
        ...s, 
        [field]: field === 'minWorkHours' ? Number(value) : value 
      } : s
    ))
  }

  const copyToAll = (sourceDay: number) => {
    if (readOnly || !onChange) return
    const source = schedules.find(s => s.dayOfWeek === sourceDay)
    if (!source) return
    onChange(schedules.map(s =>
      s.isWorkingDay ? {
        ...s,
        startTime: source.startTime,
        endTime: source.endTime,
        breakStart: source.breakStart,
        breakEnd: source.breakEnd,
        lateThreshold: source.lateThreshold,
        earlyLeaveThreshold: source.earlyLeaveThreshold,
        minWorkHours: source.minWorkHours,
      } : s
    ))
  }

  // فرمت کردن عدد با دو رقم اعشار یا بدون اعشار
  const formatNumber = (num: number) => {
    // اگر عدد صحیح است، بدون اعشار نمایش بده
    if (Number.isInteger(num)) {
      return num.toString()
    }
    // در غیر این صورت با یک رقم اعشار
    return num.toFixed(1)
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[100px_60px_1fr_1fr_1fr_80px] gap-2 px-2 py-2 text-[10px] font-medium text-muted-foreground bg-muted/30 rounded-t-lg">
        <div>روز</div>
        <div>کاری</div>
        <div>ساعت کاری</div>
        <div>استراحت</div>
        <div>سقف تاخیر / خروج زودرس</div>
        <div>حداقل کارکرد</div>
      </div>
      {DAYS_OF_WEEK.map(day => {
        const schedule = schedules.find(s => s.dayOfWeek === day.value)
        if (!schedule) return null
        return (
          <div
            key={day.value}
            className={`grid grid-cols-[100px_60px_1fr_1fr_1fr_80px] gap-2 px-2 py-2.5 items-center rounded-lg transition-colors ${
              !schedule.isWorkingDay ? 'bg-muted/20 opacity-50' : day.value === 6 ? 'bg-red-50/50 dark:bg-red-950/10' : day.value === 5 ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{day.label}</span>
              {!readOnly && schedule.isWorkingDay && (
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToAll(day.value)} title="کپی به همه روزها">
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex justify-center">
              <Switch checked={schedule.isWorkingDay} onCheckedChange={() => toggleWorkingDay(day.value)} disabled={readOnly} className="scale-75" />
            </div>
            {schedule.isWorkingDay ? (
              <div className="flex items-center gap-1">
                <TimeInput24H
                  value={schedule.startTime}
                  onChange={(val) => updateSchedule(day.value, 'startTime', val)}
                  disabled={readOnly}
                />
                <span className="text-muted-foreground text-xs">تا</span>
                <TimeInput24H
                  value={schedule.endTime}
                  onChange={(val) => updateSchedule(day.value, 'endTime', val)}
                  disabled={readOnly}
                />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">تعطیل</div>
            )}
            {schedule.isWorkingDay ? (
              <div className="flex items-center gap-1">
                <TimeInput24H
                  value={schedule.breakStart}
                  onChange={(val) => updateSchedule(day.value, 'breakStart', val)}
                  disabled={readOnly}
                  placeholder="--:--"
                />
                <span className="text-muted-foreground text-xs">تا</span>
                <TimeInput24H
                  value={schedule.breakEnd}
                  onChange={(val) => updateSchedule(day.value, 'breakEnd', val)}
                  disabled={readOnly}
                  placeholder="--:--"
                />
              </div>
            ) : (<div>—</div>)}
            {schedule.isWorkingDay ? (
              <div className="flex items-center gap-1">
                <TimeInput24H
                  value={schedule.lateThreshold}
                  onChange={(val) => updateSchedule(day.value, 'lateThreshold', val)}
                  disabled={readOnly}
                  placeholder="تاخیر"
                />
                <span className="text-muted-foreground text-xs">/</span>
                <TimeInput24H
                  value={schedule.earlyLeaveThreshold}
                  onChange={(val) => updateSchedule(day.value, 'earlyLeaveThreshold', val)}
                  disabled={readOnly}
                  placeholder="خروج"
                />
              </div>
            ) : (<div>—</div>)}
            {schedule.isWorkingDay ? (
              <div className="flex items-center gap-1">
                <div className="relative">
                  <Input 
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(schedule.minWorkHours)}
                    onChange={(e) => {
                      // فقط اعداد و نقطه رو قبول کن
                      const val = e.target.value.replace(/[^0-9.]/g, '')
                      // جلوگیری از چند نقطه
                      const parts = val.split('.')
                      if (parts.length > 2) return
                      // جلوگیری از بیش از یک رقم اعشار
                      if (parts.length === 2 && parts[1].length > 1) return
                      
                      const num = parseFloat(val)
                      if (val === '' || val === '.') {
                        updateSchedule(day.value, 'minWorkHours', 0)
                        return
                      }
                      if (!isNaN(num) && num >= 0 && num <= 24) {
                        updateSchedule(day.value, 'minWorkHours', num)
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value)
                      if (e.target.value === '' || e.target.value === '.' || isNaN(val)) {
                        updateSchedule(day.value, 'minWorkHours', 8)
                      } else if (val < 0) {
                        updateSchedule(day.value, 'minWorkHours', 0)
                      } else if (val > 24) {
                        updateSchedule(day.value, 'minWorkHours', 24)
                      }
                    }}
                    disabled={readOnly}
                    className="h-7 text-xs w-[70px] font-mono text-center"
                    dir="ltr"
                    placeholder="۰۸"
                  />
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/50 pointer-events-none">
                    {toPersianDigits(formatNumber(schedule.minWorkHours))}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">ساعت</span>
              </div>
            ) : (<div>—</div>)}
          </div>
        )
      })}
    </div>
  )
}