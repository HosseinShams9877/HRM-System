// modules/shifts/components/employee-shifts-module.tsx

'use client'

import { useState, useEffect } from 'react'
import {
  Clock, Loader2, UserCheck, Eye,
  Coffee, AlertTriangle, CheckCircle2,
  CalendarOff
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Separator } from '@/core/components/ui/separator'
import { toPersianDigits, formatShamsi, getTodayShamsi } from '@/core/lib/utils-fa'
import { WorkShiftData, ShiftSchedule, HolidayData } from '../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/core/components/ui/dialog'

// ============================================
// Types
// ============================================

interface EmployeeShiftAssignment {
  id: string
  employeeId: string
  shiftId: string
  startDate: string
  endDate: string | null
  isDefault: boolean
  status: string
  shift: WorkShiftData
}

interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  avatar: string | null
  department: string | null
  position: string | null
}

// ============================================
// Constants
// ============================================

const DAYS_OF_WEEK = [
  { value: 0, label: 'شنبه', short: 'ش' },
  { value: 1, label: 'یکشنبه', short: 'ی' },
  { value: 2, label: 'دوشنبه', short: 'د' },
  { value: 3, label: 'سه‌شنبه', short: 'س' },
  { value: 4, label: 'چهارشنبه', short: 'چ' },
  { value: 5, label: 'پنجشنبه', short: 'پ' },
  { value: 6, label: 'جمعه', short: 'ج' },
]

function formatTimeToPersian(time: string | undefined): string {
  if (!time) return '--:--'
  const parts = time.split(':')
  if (parts.length !== 2) return time
  return `${toPersianDigits(parts[0])}:${toPersianDigits(parts[1])}`
}

// ============================================
// Helper Functions
// ============================================

// محاسبه روز هفته شمسی: 0=شنبه, 1=یکشنبه, ..., 6=جمعه
function getShamsiDayOfWeek(year: number, month: number, day: number): number {
  function isLeapYear(y: number): boolean {
    const remainders = [1, 5, 9, 13, 17, 22, 26, 30]
    return remainders.includes(y % 33)
  }
  
  function getDaysInMonth(y: number, m: number): number {
    if (m <= 6) return 31
    if (m <= 11) return 30
    return isLeapYear(y) ? 30 : 29
  }
  
  function getDayOfYear(y: number, m: number, d: number): number {
    let days = 0
    for (let i = 1; i < m; i++) {
      days += getDaysInMonth(y, i)
    }
    return days + d
  }
  
  let totalDays = 0
  for (let y = 1400; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365
  }
  totalDays += getDayOfYear(year, month, day) - 1
  
  const baseDayOfWeek = 1
  const dayOfWeek = (baseDayOfWeek + totalDays) % 7
  return dayOfWeek
}

// اضافه کردن تابع برای چک کردن تعطیلی یک تاریخ خاص
function isHolidayDate(dateStr: string, holidays: HolidayData[]): { isHoliday: boolean; title: string } {
  const found = holidays.find(h => h.date === dateStr)
  return {
    isHoliday: !!found,
    title: found?.title || ''
  }
}

// ============================================
// Day Status Component
// ============================================

function DayStatusCard({
  day,
  schedule,
  isToday,
  shiftColor,
  isHoliday,
  holidayTitle,
}: {
  day: { value: number; label: string; short: string }
  schedule: ShiftSchedule | undefined
  isToday: boolean
  shiftColor: string
  isHoliday?: boolean
  holidayTitle?: string
}) {
  const isWork = schedule?.isWorkingDay ?? false
  const isDayOff = !isWork || isHoliday

  return (
    <div
      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
        isToday
          ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900 bg-emerald-50 dark:bg-emerald-950/30'
          : isDayOff
          ? 'bg-red-50/50 dark:bg-red-950/10 opacity-60'
          : 'bg-muted/30 hover:bg-muted/50'
      }`}
    >
      <span className={`text-xs font-medium ${isToday ? 'text-emerald-600 dark:text-emerald-400' : isDayOff ? 'text-red-500' : 'text-muted-foreground'}`}>
        {day.label}
      </span>
      {isToday && (
        <Badge className="text-[8px] bg-emerald-500 text-white mt-0.5 px-1 py-0 h-4">
          امروز
        </Badge>
      )}
      {isHoliday && holidayTitle && (
        <div className="text-[8px] text-red-500 font-medium mt-0.5 truncate max-w-[60px]">
          {holidayTitle}
        </div>
      )}
      <div className="mt-2 text-center">
        {isWork && !isHoliday ? (
          <>
            <div className="text-sm font-bold font-mono" style={{ color: shiftColor }}>
              {formatTimeToPersian(schedule?.startTime)}
            </div>
            <div className="text-[10px] text-muted-foreground">تا</div>
            <div className="text-sm font-bold font-mono" style={{ color: shiftColor }}>
              {formatTimeToPersian(schedule?.endTime)}
            </div>
            {schedule?.breakStart && schedule?.breakEnd && (
              <div className="text-[9px] text-muted-foreground mt-1 flex items-center gap-0.5 justify-center">
                <Coffee className="w-2.5 h-2.5" />
                {formatTimeToPersian(schedule.breakStart)}-{formatTimeToPersian(schedule.breakEnd)}
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-red-500 italic">
            {isHoliday ? holidayTitle || 'تعطیل' : 'تعطیل'}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function EmployeeShiftsModule({ 
  employeeId 
}: { 
  employeeId: string 
}) {
  const [employee, setEmployee] = useState<EmployeeBasic | null>(null)
  const [assignments, setAssignments] = useState<EmployeeShiftAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedShift, setSelectedShift] = useState<WorkShiftData | null>(null)
  const [holidays, setHolidays] = useState<HolidayData[]>([])

  // گرفتن اطلاعات کارمند
  useEffect(() => {
    if (!employeeId) return
    
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${employeeId}`)
        if (res.ok) {
          const json = await res.json()
          const data = json.data || json
          setEmployee({
            id: data.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            personnelCode: data.personnelCode || data.code || '—',
            avatar: data.avatar || null,
            department: data.department || null,
            position: data.position || null,
          })
        }
      } catch (err) {
        console.error('Error fetching employee:', err)
      }
    }
    fetchEmployee()
  }, [employeeId])

  // گرفتن شیفت‌های منتسب به کارمند با اطلاعات کامل
  useEffect(() => {
    if (!employeeId) return
    
    const fetchAssignments = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/shift-assignments?employeeId=${employeeId}&status=active`)
        if (res.ok) {
          const json = await res.json()
          const data = json.data || json
          const assignmentsData = data.assignments || []
          
          const enrichedAssignments = await Promise.all(
            assignmentsData.map(async (assignment: any) => {
              const shiftRes = await fetch(`/api/shifts/${assignment.shiftId}`)
              if (shiftRes.ok) {
                const shiftData = await shiftRes.json()
                return {
                  ...assignment,
                  shift: shiftData.data || shiftData
                }
              }
              return assignment
            })
          )
          
          setAssignments(enrichedAssignments)
        }
      } catch (err) {
        console.error('Error fetching shift assignments:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [employeeId])

  // گرفتن تعطیلات
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch('/api/holidays')
        if (res.ok) {
          const json = await res.json()
          const data = json.data || json
          setHolidays(data.data || data.holidays || [])
        }
      } catch (err) {
        console.error('Error fetching holidays:', err)
      }
    }
    fetchHolidays()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      </div>
    )
  }

  // پیدا کردن شیفت فعال امروز برای نمایش
  const today = getTodayShamsi()
  const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
  const todayDayOfWeek = getShamsiDayOfWeek(today.year, today.month, today.day)
  
  const activeAssignmentToday = assignments.find(a => 
    a.status === 'active' && 
    a.startDate <= todayStr && 
    (!a.endDate || a.endDate >= todayStr)
  )

  const todaySchedule = activeAssignmentToday?.shift?.schedules?.find(
    s => s.dayOfWeek === todayDayOfWeek
  )
  const isWorkingToday = todaySchedule?.isWorkingDay ?? false
  const holidayInfoToday = isHolidayDate(todayStr, holidays)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            شیفت‌های کاری من
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            مشاهده برنامه کاری و شیفت‌های منتسب به شما
          </p>
        </div>
        {activeAssignmentToday && (
          <Badge 
            className="text-sm px-4 py-2"
            style={{ backgroundColor: activeAssignmentToday.shift.color + '30', color: activeAssignmentToday.shift.color }}
          >
            {activeAssignmentToday.shift.name}
          </Badge>
        )}
      </div>

      {/* Employee Info */}
      {employee && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-2 ring-emerald-500/30">
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xl font-bold">
                  {employee.firstName?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {employee.firstName} {employee.lastName}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>کد پرسنلی: {toPersianDigits(employee.personnelCode)}</span>
                  {employee.department && <span>• {employee.department}</span>}
                  {employee.position && <span>• {employee.position}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Status */}
      {activeAssignmentToday && (
        <Card className={`border-2 ${
          isWorkingToday && !holidayInfoToday.isHoliday
            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10' 
            : 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  isWorkingToday && !holidayInfoToday.isHoliday
                    ? 'bg-emerald-100 dark:bg-emerald-900/40' 
                    : 'bg-red-100 dark:bg-red-900/40'
                }`}>
                  {isWorkingToday && !holidayInfoToday.isHoliday ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CalendarOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold">وضعیت امروز</h4>
                  <p className="text-xs text-muted-foreground">
                    {isWorkingToday && !holidayInfoToday.isHoliday ? (
                      <>✅ امروز روز کاری است</>
                    ) : holidayInfoToday.isHoliday ? (
                      <>📅 امروز تعطیل است ({holidayInfoToday.title})</>
                    ) : (
                      <>⛔ امروز تعطیل است</>
                    )}
                  </p>
                </div>
              </div>
              <Badge 
                className="text-xs px-3 py-1.5"
                style={{ 
                  backgroundColor: activeAssignmentToday.shift.color + '30', 
                  color: activeAssignmentToday.shift.color 
                }}
              >
                {activeAssignmentToday.shift.name}
              </Badge>
            </div>
            {todaySchedule && isWorkingToday && !holidayInfoToday.isHoliday && (
              <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs block">⏰ شروع</span>
                  <span className="font-medium">{formatTimeToPersian(todaySchedule.startTime)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">⏰ پایان</span>
                  <span className="font-medium">{formatTimeToPersian(todaySchedule.endTime)}</span>
                </div>
                {todaySchedule.breakStart && todaySchedule.breakEnd && (
                  <>
                    <div>
                      <span className="text-muted-foreground text-xs block">🍽️ شروع استراحت</span>
                      <span className="font-medium">{formatTimeToPersian(todaySchedule.breakStart)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">🍽️ پایان استراحت</span>
                      <span className="font-medium">{formatTimeToPersian(todaySchedule.breakEnd)}</span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-muted-foreground text-xs block">📊 حداقل کارکرد</span>
                  <span className="font-medium">{toPersianDigits(todaySchedule.minWorkHours)} ساعت</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      {assignments.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              برنامه هفتگی
            </h3>
            
            {assignments.map(assignment => {
              const schedules = assignment.shift?.schedules || []
              const shiftColor = assignment.shift?.color || '#10b981'
              
              const workingDays = schedules.filter(s => s.isWorkingDay)
              const totalHours = workingDays.reduce((sum, s) => {
                const [sh, sm] = s.startTime.split(':').map(Number)
                const [eh, em] = s.endTime.split(':').map(Number)
                return sum + ((eh * 60 + em - sh * 60 - sm) / 60)
              }, 0)
              
              return (
                <Card key={assignment.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: shiftColor }}
                        >
                          {assignment.shift?.name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">{assignment.shift?.name || 'نامشخص'}</h4>
                            <Badge variant="outline" className="text-[10px]">
                              {assignment.shift?.code || '—'}
                            </Badge>
                            {assignment.isDefault && (
                              <Badge className="text-[10px] bg-emerald-100 text-emerald-700">
                                پیش‌فرض
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                            <span>از {formatShamsi(assignment.startDate)}</span>
                            {assignment.endDate ? (
                              <span>تا {formatShamsi(assignment.endDate)}</span>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-emerald-600">جاری</Badge>
                            )}
                            <span>• {toPersianDigits(workingDays.length)} روز کاری</span>
                            <span>• {toPersianDigits(Math.round(totalHours * 10) / 10)} ساعت</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedShift(assignment.shift)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Weekly Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS_OF_WEEK.map(day => {
                        const schedule = schedules.find(s => s.dayOfWeek === day.value)
                        
                        const today = getTodayShamsi()
                        const todayDayOfWeek = getShamsiDayOfWeek(today.year, today.month, today.day)
                        const isToday = day.value === todayDayOfWeek
                        
                        const todayDate = new Date(today.year, today.month - 1, today.day)
                        const dayOffset = day.value - todayDayOfWeek
                        const targetDate = new Date(todayDate)
                        targetDate.setDate(todayDate.getDate() + dayOffset)
                        
                        const targetYear = targetDate.getFullYear()
                        const targetMonth = targetDate.getMonth() + 1
                        const targetDay = targetDate.getDate()
                        const dateStr = `${targetYear}/${String(targetMonth).padStart(2, '0')}/${String(targetDay).padStart(2, '0')}`
                        
                        const holidayInfo = isHolidayDate(dateStr, holidays)
                        
                        return (
                          <DayStatusCard
                            key={day.value}
                            day={day}
                            schedule={schedule}
                            isToday={isToday}
                            isHoliday={holidayInfo.isHoliday}
                            holidayTitle={holidayInfo.title}
                            shiftColor={shiftColor}
                          />
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {assignments.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-sm font-medium text-muted-foreground">
              هیچ شیفتی به شما منتسب نشده است
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              برای مشاهده شیفت‌ها با مدیریت تماس بگیرید
            </p>
          </CardContent>
        </Card>
      )}

      {/* Shift Detail Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedShift && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedShift.color || '#10b981' }}
                  />
                  {selectedShift.name || 'نامشخص'}
                  <Badge variant="outline" className="text-xs">
                    {selectedShift.code || '—'}
                  </Badge>
                  {!selectedShift.isActive && (
                    <Badge className="text-[10px] bg-red-100 text-red-700">غیرفعال</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedShift.description || 'بدون توضیحات'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-3">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-emerald-600">
                        {toPersianDigits(selectedShift.schedules?.filter(s => s.isWorkingDay).length || 0)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">روز کاری</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {toPersianDigits(
                          (selectedShift.schedules?.reduce((sum, s) => {
                            if (!s.isWorkingDay) return sum
                            const [sh, sm] = s.startTime.split(':').map(Number)
                            const [eh, em] = s.endTime.split(':').map(Number)
                            return sum + ((eh * 60 + em - sh * 60 - sm) / 60)
                          }, 0) || 0).toFixed(1)
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">ساعت هفتگی</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {toPersianDigits(selectedShift._count?.assignments || 0)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">کارمند منتسب</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 bg-muted/30 border-b">
                    <h4 className="text-sm font-semibold">برنامه هفتگی کامل</h4>
                  </div>
                  <div className="grid grid-cols-7 gap-1 p-4">
                    {DAYS_OF_WEEK.map(day => {
                      const schedule = selectedShift.schedules?.find(s => s.dayOfWeek === day.value)
                      const isWork = schedule?.isWorkingDay ?? false
                      
                      return (
                        <div
                          key={day.value}
                          className={`p-3 rounded-lg text-center ${
                            isWork 
                              ? 'bg-emerald-50 dark:bg-emerald-950/20' 
                              : 'bg-red-50/50 dark:bg-red-950/10'
                          }`}
                        >
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            {day.label}
                          </div>
                          {isWork && schedule ? (
                            <>
                              <div className="text-sm font-bold font-mono" style={{ color: selectedShift.color }}>
                                {formatTimeToPersian(schedule.startTime)}
                              </div>
                              <div className="text-[10px] text-muted-foreground">تا</div>
                              <div className="text-sm font-bold font-mono" style={{ color: selectedShift.color }}>
                                {formatTimeToPersian(schedule.endTime)}
                              </div>
                              {schedule.breakStart && schedule.breakEnd && (
                                <div className="text-[8px] text-muted-foreground mt-0.5 flex items-center gap-0.5 justify-center">
                                  <Coffee className="w-2.5 h-2.5" />
                                  {formatTimeToPersian(schedule.breakStart)}-{formatTimeToPersian(schedule.breakEnd)}
                                </div>
                              )}
                              <div className="text-[8px] text-muted-foreground mt-0.5">
                                {toPersianDigits(schedule.minWorkHours)} ساعت
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-red-500 italic">تعطیل</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedShift(null)}>
                  بستن
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}