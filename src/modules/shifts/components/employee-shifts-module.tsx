// modules/shifts/components/employee-shifts-module.tsx

'use client'

import { useState, useEffect } from 'react'
import { Clock, Calendar, Loader2, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toPersianDigits, formatShamsi, getTodayShamsi } from '@/core/lib/utils-fa'
import { WorkShiftData } from '../types'

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

export function EmployeeShiftsModule({ 
  employeeId 
}: { 
  employeeId: string 
}) {
  const [employee, setEmployee] = useState<EmployeeBasic | null>(null)
  const [assignments, setAssignments] = useState<EmployeeShiftAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedShift, setSelectedShift] = useState<WorkShiftData | null>(null)

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

  // گرفتن شیفت‌های منتسب به کارمند
  useEffect(() => {
    if (!employeeId) return
    
    const fetchAssignments = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/shift-assignments?employeeId=${employeeId}&status=active`)
        if (res.ok) {
          const json = await res.json()
          const data = json.data || json
          setAssignments(data.assignments || [])
        }
      } catch (err) {
        console.error('Error fetching shift assignments:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [employeeId])

  // محاسبه وضعیت شیفت امروز
  const getTodayShiftStatus = () => {
    const today = getTodayShamsi()
    const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
    
    // پیدا کردن شیفت فعال امروز
    const activeAssignment = assignments.find(a => 
      a.status === 'active' && 
      a.startDate <= todayStr && 
      (!a.endDate || a.endDate >= todayStr)
    )
    
    if (!activeAssignment) return null
    
    const schedule = activeAssignment.shift.schedules.find(s => {
      // پیدا کردن روز هفته امروز (0=شنبه)
      const dayOfWeek = today.dayOfWeek || 0
      return s.dayOfWeek === dayOfWeek && s.isWorkingDay
    })
    
    return {
      shift: activeAssignment.shift,
      schedule: schedule || null,
      isWorkingDay: !!schedule,
    }
  }

  const todayStatus = getTodayShiftStatus()

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
            مشاهده شیفت‌های کاری منتسب به شما
          </p>
        </div>
      </div>

      {/* Employee Info */}
      {employee && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-lg font-bold">
                  {employee.firstName?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-base font-semibold">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  کد پرسنلی: {toPersianDigits(employee.personnelCode)}
                  {employee.department && ` • ${employee.department}`}
                  {employee.position && ` • ${employee.position}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Shift Status */}
      {todayStatus && (
        <Card className={`border-2 ${todayStatus.isWorkingDay ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${todayStatus.isWorkingDay ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
                  <UserCheck className={`w-5 h-5 ${todayStatus.isWorkingDay ? 'text-emerald-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">
                    وضعیت امروز
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {todayStatus.isWorkingDay ? (
                      <>امروز روز کاری است</>
                    ) : (
                      <>امروز تعطیل است</>
                    )}
                  </p>
                </div>
              </div>
              <Badge className={todayStatus.isWorkingDay ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                {todayStatus.shift.name}
              </Badge>
            </div>
            {todayStatus.schedule && (
              <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">ساعت کاری:</span>
                  <span className="font-medium mr-1">
                    {todayStatus.schedule.startTime} - {todayStatus.schedule.endTime}
                  </span>
                </div>
                {todayStatus.schedule.breakStart && todayStatus.schedule.breakEnd && (
                  <div>
                    <span className="text-muted-foreground text-xs">استراحت:</span>
                    <span className="font-medium mr-1">
                      {todayStatus.schedule.breakStart} - {todayStatus.schedule.breakEnd}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shift Assignments List */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          شیفت‌های منتسب به من
        </h3>
        
        {assignments.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <h4 className="text-sm font-medium text-muted-foreground">
                هیچ شیفتی به شما منتسب نشده است
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                برای مشاهده شیفت‌ها با مدیریت تماس بگیرید
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(assignment => {
              const workingDays = assignment.shift.schedules.filter(s => s.isWorkingDay)
              const totalHours = workingDays.reduce((sum, s) => {
                const [sh, sm] = s.startTime.split(':').map(Number)
                const [eh, em] = s.endTime.split(':').map(Number)
                return sum + ((eh * 60 + em - sh * 60 - sm) / 60)
              }, 0)
              
              return (
                <Card 
                  key={assignment.id} 
                  className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedShift(assignment.shift)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: assignment.shift.color }}
                        >
                          {assignment.shift.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold">{assignment.shift.name}</h3>
                            <Badge variant="outline" className="text-[10px]">
                              {assignment.shift.code}
                            </Badge>
                            {assignment.isDefault && (
                              <Badge className="text-[10px] bg-emerald-100 text-emerald-700">
                                پیش‌فرض
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {toPersianDigits(workingDays.length)} روز کاری ·{' '}
                            {toPersianDigits(Math.round(totalHours * 10) / 10)} ساعت هفتگی
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mini weekly view */}
                    <div className="flex gap-1 items-end mt-2">
                      {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => {
                        const s = assignment.shift.schedules.find(sc => sc.dayOfWeek === index)
                        const isWork = s?.isWorkingDay
                        return (
                          <div key={index} className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] text-muted-foreground">{day}</span>
                            <div
                              className={`w-6 rounded-sm text-[8px] font-mono text-center ${
                                isWork ? 'text-white' : 'bg-muted/30 text-muted-foreground'
                              }`}
                              style={isWork ? { backgroundColor: assignment.shift.color } : undefined}
                            >
                              {isWork ? s?.startTime?.slice(0, 2) : '—'}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Assignment dates */}
                    <div className="mt-3 pt-3 border-t text-[10px] text-muted-foreground flex items-center gap-3">
                      <span>
                        از: {formatShamsi(assignment.startDate)}
                      </span>
                      {assignment.endDate && (
                        <span>
                          تا: {formatShamsi(assignment.endDate)}
                        </span>
                      )}
                      {!assignment.endDate && (
                        <Badge variant="outline" className="text-[10px] text-emerald-600">
                          جاری
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Shift Detail Dialog */}
      {selectedShift && (
        <ShiftDetailDialog
          open={!!selectedShift}
          onClose={() => setSelectedShift(null)}
          shift={selectedShift}
        />
      )}
    </div>
  )
}

// ShiftDetailDialog - نمایش جزئیات شیفت (میتونی از همون کامپوننت موجود استفاده کنی یا اینجا تعریف کنی)
function ShiftDetailDialog({ open, onClose, shift }: { open: boolean; onClose: () => void; shift: WorkShiftData | null }) {
  if (!shift) return null
  
  // ... از ShiftDetailDialog موجود استفاده کن یا کپی کن
  // برای سادگی، اینجا فقط یک placeholder میذارم
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">{shift.name}</h2>
        <p className="text-sm text-muted-foreground">{shift.description}</p>
        <Button className="mt-4" onClick={onClose}>بستن</Button>
      </div>
    </div>
  )
}