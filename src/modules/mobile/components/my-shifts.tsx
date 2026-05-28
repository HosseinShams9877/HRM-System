'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  Clock, Loader2, Calendar, MapPin,
  Sun, Moon, Sunrise, Settings2
} from 'lucide-react'
import { toPersianDigits, getTodayShamsi, getShamsiMonthName } from '@/core/lib/utils-fa'
import jalaali from 'jalaali-js'

interface ShiftSchedule {
  dayOfWeek: number
  dayName: string
  isWorkingDay: boolean
  startTime: string
  endTime: string
  breakStart: string | null
  breakEnd: string | null
  lateThreshold: string | null
  earlyLeaveThreshold: string | null
  minWorkHours: number
}

interface ShiftAssignment {
  id: string
  startDate: string
  endDate: string | null
  status: string
  shift: {
    id: string
    name: string
    code: string
    color: string
    schedules: ShiftSchedule[]
  }
}

const WEEKDAY_NAMES = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

const SHIFT_ICON_MAP: Record<string, React.ElementType> = {
  'صبح': Sunrise,
  'عصر': Sun,
  'شب': Moon,
  'اداری': Clock,
}

function getShiftIcon(name: string): React.ElementType {
  for (const [key, icon] of Object.entries(SHIFT_ICON_MAP)) {
    if (name.includes(key)) return icon
  }
  return Clock
}

export default function MyShifts() {
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([])
  const [currentShift, setCurrentShift] = useState<ShiftAssignment | null>(null)

  const today = getTodayShamsi()
  const todayDayOfWeek = (() => {
    // Calculate day of week from today
    const greg = jalaali.toGregorian(today.year, today.month, today.day)
    const d = new Date(greg.gy, greg.gm - 1, greg.gd)
    const jsDay = d.getDay()
    return jsDay === 6 ? 0 : jsDay + 1 // شمسی: شنبه=0
  })()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/shift-assignments?status=active')
        if (res.ok) {
          const data = await res.json()
          const allAssignments = data.assignments || []
          setAssignments(allAssignments)
          if (allAssignments.length > 0) {
            setCurrentShift(allAssignments[0])
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    )
  }

  const currentSchedules = currentShift?.shift.schedules || []
  const todaySchedule = currentSchedules.find(s => s.dayOfWeek === todayDayOfWeek)
  const ShiftIcon = currentShift ? getShiftIcon(currentShift.shift.name) : Clock

  // Generate week dates for weekly view
  const weekDates = (() => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      // Calculate the date for each day of current week
      const greg = jalaali.toGregorian(today.year, today.month, today.day)
      const d = new Date(greg.gy, greg.gm - 1, greg.gd)
      // Find start of week (Saturday)
      const currentDow = d.getDay() // 0=Sun
      const saturdayOffset = currentDow === 6 ? 0 : -(currentDow + 1)
      const targetDate = new Date(d)
      targetDate.setDate(d.getDate() + saturdayOffset + i)
      const { jy, jm, jd } = jalaali.toJalaali(targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate())
      dates.push({
        dayOfWeek: i,
        dayName: WEEKDAY_NAMES[i],
        date: `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`,
        day: jd,
      })
    }
    return dates
  })()

  return (
    <div className="space-y-4">
      {/* Current Shift Card */}
      {currentShift ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30">
                <Settings2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              شیفت فعلی من
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div
                className="p-2.5 rounded-xl"
                style={{ backgroundColor: currentShift.shift.color + '20' }}
              >
                <ShiftIcon
                  className="w-5 h-5"
                  style={{ color: currentShift.shift.color }}
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{currentShift.shift.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  کد شیفت: {toPersianDigits(currentShift.shift.code)}
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 text-[10px]">
                فعال
              </Badge>
            </div>

            {/* Today's Schedule */}
            {todaySchedule && (
              <>
                <Separator />
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">برنامه امروز</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
                      <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                      <div className="text-[10px] text-muted-foreground">شروع</div>
                      <div className="text-sm font-bold" dir="ltr">{toPersianDigits(todaySchedule.startTime)}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-center">
                      <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-red-600 dark:text-red-400" />
                      <div className="text-[10px] text-muted-foreground">پایان</div>
                      <div className="text-sm font-bold" dir="ltr">{toPersianDigits(todaySchedule.endTime)}</div>
                    </div>
                  </div>
                  {todaySchedule.breakStart && todaySchedule.breakEnd && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                      <span className="text-xs text-amber-700 dark:text-amber-300">استراحت</span>
                      <span className="text-xs font-medium" dir="ltr">
                        {toPersianDigits(todaySchedule.breakStart)} - {toPersianDigits(todaySchedule.breakEnd)}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
            {!todaySchedule?.isWorkingDay && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
                <span className="text-sm text-emerald-700 dark:text-emerald-300">امروز تعطیل است 🎉</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">شیفت کاری تعریف نشده است</p>
          </CardContent>
        </Card>
      )}

      {/* Weekly View */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            برنامه هفتگی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {weekDates.map((day) => {
              const schedule = currentSchedules.find(s => s.dayOfWeek === day.dayOfWeek)
              const isToday = day.dayOfWeek === todayDayOfWeek
              return (
                <div
                  key={day.dayOfWeek}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    isToday
                      ? 'bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isToday
                      ? 'bg-sky-500 text-white'
                      : schedule?.isWorkingDay
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                  }`}>
                    {toPersianDigits(day.day)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${isToday ? 'text-sky-700 dark:text-sky-300' : ''}`}>
                        {day.dayName}
                        {isToday && <span className="mr-1 text-[10px]">(امروز)</span>}
                      </span>
                      {schedule?.isWorkingDay ? (
                        <span className="text-[11px] text-muted-foreground" dir="ltr">
                          {toPersianDigits(schedule.startTime)} - {toPersianDigits(schedule.endTime)}
                        </span>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 text-[10px]">
                          تعطیل
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
