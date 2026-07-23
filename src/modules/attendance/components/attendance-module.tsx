'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Clock, Search, UserCheck, UserX, CalendarOff, MapPin,
  LogIn, LogOut, Users, LayoutGrid, List,
  TrendingUp, BarChart3, ChevronRight, ChevronLeft
} from 'lucide-react'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/core/components/ui/table'
import { Separator } from '@/core/components/ui/separator'
import { Skeleton } from '@/core/components/ui/skeleton'
import { toast } from 'sonner'
import { toPersianDigits, formatShamsi, getTodayShamsi, getWeekDaysShamsi } from '@/core/lib/utils-fa'
import type { EmployeeBasic, AttendanceRecord, AttendanceStats, TrendDataPoint } from '../attendance/index'
import { STATUS_CONFIG } from '../attendance/constants'
import { CheckInDialog } from '../attendance/components/attendance-form-dialog'
import { StatisticsTab } from '../attendance/components/statistics-tab'
import moment from 'moment-jalaali'


// ============================================
// Status Badge Component
// ============================================

function AttendanceStatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.present
  const Icon = c.icon
  return (
    <Badge className={`text-[10px] gap-1 ${c.badgeClass}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </Badge>
  )
}
// ============================================
// توابع تبدیل تاریخ (مثل دیالوگ)
// ============================================
const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)])
}

const toEnglishNumber = (str: string): string => {
  const map: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  }
  return str.replace(/[۰-۹]/g, (d) => map[d] || d)
}

// تبدیل تاریخ شمسی به میلادی (Date)
const toMiladi = (shamsiDate: string): Date | null => {
  if (!shamsiDate) return null
  try {
    const englishDate = toEnglishNumber(shamsiDate)
    const parts = englishDate.split('/').map(Number)
    if (parts.length !== 3) return null
    // استفاده از moment-jalaali
    const m = moment(`${parts[0]}/${parts[1]}/${parts[2]}`, 'jYYYY/jMM/jDD')
    if (!m.isValid()) return null
    return m.toDate()
  } catch {
    return null
  }
}

// تبدیل تاریخ میلادی به شمسی (رشته)
const toShamsi = (date: Date): string => {
  if (!date) return ''
  try {
    const m = moment(date)
    const shamsiStr = m.format('jYYYY/jMM/jDD')
    return toPersianNumber(shamsiStr)
  } catch {
    return ''
  }
}

// تبدیل رشته زمان به عدد اعشاری ساعت
const timeStrToHours = (time: string): number => {
  if (!time || !time.includes(':')) return 0
  const [h, m] = time.split(':').map(Number)
  return (h || 0) + (m || 0) / 60
}
// ============================================
// تبدیل عدد اعشاری به ساعت:دقیقه
// ============================================
const hoursToTimeStr = (hours: number): string => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
// ============================================
// Stat Card Component
// ============================================

function StatCard({
  icon: Icon,
  label,
  value,
  gradientFrom,
  gradientTo,
  barColor,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  gradientFrom: string
  gradientTo: string
  barColor: string
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow-sm`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold tracking-tight">{toPersianDigits(value)}</div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
      <div className={`h-1 w-full ${barColor}`} />
    </Card>
  )
}

// ============================================
// Employee Card (Card View)
// ============================================
// ============================================
// توابع محاسبه کارکرد
// ============================================

// تبدیل ساعت به دقیقه
const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(':')) return 0
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

// تبدیل دقیقه به ساعت
const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// محاسبه کارکرد و اضافه کار
const calculateWorkAndOvertime = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) {
    return { work: '00:00', overtime: '00:00', total: '00:00' }
  }
  
  const inMinutes = timeToMinutes(checkIn)
  const outMinutes = timeToMinutes(checkOut)
  
  let diff = outMinutes - inMinutes
  if (diff < 0) diff += 24 * 60 // شیفت شب
  
  const normalWork = Math.min(diff, 8 * 60) // حداکثر ۸ ساعت
  const overtime = Math.max(0, diff - 8 * 60)
  
  return {
    work: minutesToTime(normalWork),
    overtime: minutesToTime(overtime),
    total: minutesToTime(diff)
  }
}


function EmployeeCard({
  record,
  onQuickCheckIn,
  onQuickCheckOut,
}: {
  record: AttendanceRecord
  onQuickCheckIn: (emp: EmployeeBasic, date: string) => void
  onQuickCheckOut: (emp: EmployeeBasic, date: string) => void
}) {
  const statusConf = STATUS_CONFIG[record.status] || STATUS_CONFIG.present
  const fullName = `${record.employee.firstName} ${record.employee.lastName}`
  const initials = `${record.employee.firstName[0]}${record.employee.lastName[0]}`

  return (
    <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-all ${statusConf.borderClass}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-11 h-11 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-sm font-semibold truncate">{fullName}</h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  {record.employee.position || record.employee.department || toPersianDigits(record.employee.personnelCode)}
                </p>
              </div>
              <AttendanceStatusBadge status={record.status} />
            </div>

            <Separator className="my-2" />

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-muted-foreground">ورود:</span>
                <span className="font-mono font-medium" dir="ltr">
                  {record.checkIn ? <span className="text-emerald-600">{toPersianDigits(record.checkIn)}</span> : <span className="text-muted-foreground">—</span>}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-muted-foreground">خروج:</span>
                <span className="font-mono font-medium" dir="ltr">
                  {record.checkOut ? <span className="text-sky-600">{toPersianDigits(record.checkOut)}</span> : <span className="text-muted-foreground">—</span>}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
  <Clock className="w-3.5 h-3.5 text-violet-500" />
  <span className="text-muted-foreground">کارکرد:</span>
  {record.checkIn && record.checkOut ? (
    (() => {
      const result = calculateWorkAndOvertime(record.checkIn, record.checkOut)
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
          {toPersianDigits(result.total)} ساعت
        </Badge>
      )
    })()
  ) : (
    <span className="text-muted-foreground">—</span>
  )}
</div>
<div className="flex items-center gap-1.5">
  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
  <span className="text-muted-foreground">اضافه‌کاری:</span>
  {record.checkIn && record.checkOut ? (
    (() => {
      const result = calculateWorkAndOvertime(record.checkIn, record.checkOut)
      return result.overtime !== '00:00' ? (
        <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          {toPersianDigits(result.overtime)} ساعت
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    })()
  ) : (
    <span className="text-muted-foreground">—</span>
  )}
</div>
            </div>

            <div className="flex gap-2 mt-3">
              {!record.checkIn && (
                <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 flex-1" onClick={() => onQuickCheckIn(record.employee, record.date)}>
                  <LogIn className="w-3 h-3" />
                  ثبت ورود
                </Button>
              )}
              {record.checkIn && !record.checkOut && (
                <Button size="sm" className="h-7 text-[11px] gap-1 flex-1" onClick={() => onQuickCheckOut(record.employee, record.date)}>
                  <LogOut className="w-3 h-3" />
                  ثبت خروج
                </Button>
              )}
              {record.checkIn && record.checkOut && (
                <Badge variant="secondary" className="text-[10px] px-2 py-1">
                  تکمیل شده
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Debounce Hook
// ============================================

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// ============================================
// Main Attendance Module
// ============================================

export function AttendanceModule({ currentUser: propUser }: { currentUser?: { role: string; employeeId?: string } }) {
  const [localUser, setLocalUser] = useState(propUser)
  const [data, setData] = useState<{ records: AttendanceRecord[]; stats: AttendanceStats } | null>(null)
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showCheckOut, setShowCheckOut] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [activeTab, setActiveTab] = useState('today')
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7
  const debouncedSearch = useDebounce(search, 300)

  // تاریخ امروز
  const today = getTodayShamsi()
  const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [historyDate, setHistoryDate] = useState(todayStr)

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      const dateToUse = activeTab === 'history' ? historyDate : selectedDate
      const englishDate = dateToUse ? toEnglishNumber(dateToUse) : ''
      params.set('date', englishDate)
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
  
      const res = await fetch(`/api/attendance?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        const payload = json.data || json
        
        let records = []
        let statsData = { total: 0, present: 0, absent: 0, late: 0, leave: 0, mission: 0 }
        
        if (Array.isArray(payload)) {
          records = payload
          statsData = {
            total: records.length,
            present: records.filter((r: AttendanceRecord) => r.status === 'present').length,
            absent: records.filter((r: AttendanceRecord) => r.status === 'absent').length,
            late: records.filter((r: AttendanceRecord) => r.status === 'late').length,
            leave: records.filter((r: AttendanceRecord) => r.status === 'leave').length,
            mission: records.filter((r: AttendanceRecord) => r.status === 'mission').length,
          }
        } else {
          records = payload.records || []
          statsData = payload.stats || statsData
        }
  
        // ✅ برای هر رکورد، اطلاعات کامل دپارتمان و سمت رو بگیر
        const enrichedRecords = await Promise.all(
          records.map(async (record: AttendanceRecord) => {
            let departmentName = record.employee?.department || '—'
            let positionName = record.employee?.position || '—'
            
            // اگر department id هست، نامش رو بگیر
            if (record.employee?.department && !record.employee.department.startsWith('_')) {
              try {
                const deptRes = await fetch(`/api/departments/${record.employee.department}`)
                if (deptRes.ok) {
                  const deptData = await deptRes.json()
                  departmentName = deptData.name || deptData.title || record.employee.department
                }
              } catch (e) {
                console.error('Error fetching department:', e)
              }
            }
            
            // اگر position id هست، نامش رو بگیر
            if (record.employee?.position && !record.employee.position.startsWith('_')) {
              try {
                const posRes = await fetch(`/api/positions/${record.employee.position}`)
                if (posRes.ok) {
                  const posData = await posRes.json()
                  positionName = posData.title || posData.name || record.employee.position
                }
              } catch (e) {
                console.error('Error fetching position:', e)
              }
            }
            
            return {
              ...record,
              employee: {
                ...record.employee,
                department: departmentName,
                position: positionName,
              }
            }
          })
        )
  
        setData({ records: enrichedRecords, stats: statsData })
      }
    } catch (err) {
      console.error('Fetch attendance error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, historyDate, debouncedSearch, statusFilter, activeTab])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?status=active')
      if (res.ok) {
        const result = await res.json()
        const empList = Array.isArray(result) ? result : (result.data || [])
        setEmployees(empList.map((e: EmployeeBasic) => ({
          id: e.id, firstName: e.firstName, lastName: e.lastName,
          personnelCode: e.personnelCode, avatar: e.avatar,
          department: e.department, position: e.position,
        })))
      }
    } catch (err) {
      console.error('Fetch employees error:', err)
    }
  }, [])

  useEffect(() => {
    fetchAttendance()
    fetchEmployees()
  }, [fetchAttendance, fetchEmployees])

  // Fetch attendance stats for 7-day trend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/attendance/stats')
        if (res.ok) {
          const json = await res.json()
          const weekDays = getWeekDaysShamsi()
          const formatted = (json.trend || []).map((item: TrendDataPoint, i: number) => ({
            ...item,
            day: weekDays[i] || item.date,
          }))
          setTrendData(formatted)
        }
      } catch (err) {
        console.error('Fetch attendance stats error:', err)
      }
    }
    fetchStats()
  }, [data])
  useEffect(() => {
    if (propUser) {
      setLocalUser(propUser)
    } else {
      // اگر از والد نیامد، خودش از API بگیرد
      fetch('/api/auth/session').then(res => res.ok ? res.json() : {}).then((d: any) => {
        if (d?.authenticated) {
          setLocalUser(d.user)
        }
      }).catch(() => {})
    }
  }, [propUser])

 // ثبت ورود/خروج
const handleCheckInOut = async (formData: Record<string, unknown>, type: 'checkIn' | 'checkOut') => {
  try {
    let targetEmployeeId = formData.employeeId as string
    
    // اگر کاربر عادی است، employeeId خودش را جایگزین کن
    if (localUser?.role === 'employee') {
      targetEmployeeId = localUser?.employeeId || ''
      if (!targetEmployeeId) {
        toast.error('شناسه کارمند یافت نشد')
        return
      }
    }

    const checkRes = await fetch(`/api/attendance?date=${formData.date}&search=`)
    let existingRecord: AttendanceRecord | null = null
    if (checkRes.ok) {
      const checkResult = await checkRes.json()
      const checkData = checkResult.data || checkResult
      const records = Array.isArray(checkData) ? checkData : checkData.records
      existingRecord = records?.find(
        (r: AttendanceRecord) => r.employeeId === targetEmployeeId
      ) || null
    }

    // ✅ مهم: اینجا باید از targetEmployeeId استفاده شود، نه formData.employeeId
    const payload: Record<string, unknown> = {
      employeeId: targetEmployeeId,  // ← این خط کلیدی است
      date: formData.date,
      status: existingRecord?.status || (type === 'checkIn' ? 'present' : existingRecord?.status),
    }

    if (type === 'checkIn') {
      payload.checkIn = formData.checkIn
      if (existingRecord?.checkOut) {
        const cin = formData.checkIn as string
        const cout = existingRecord.checkOut
        const [h1, m1] = cin.split(':').map(Number)
        const [h2, m2] = cout.split(':').map(Number)
        payload.workHours = Math.round(((h2 * 60 + m2 - h1 * 60 - m1) / 60) * 100) / 100
      }
    } else {
      payload.checkOut = formData.checkOut
      if (existingRecord?.checkIn) {
        const cin = existingRecord.checkIn
        const cout = formData.checkOut as string
        const [h1, m1] = cin.split(':').map(Number)
        const [h2, m2] = cout.split(':').map(Number)
        const wh = Math.round(((h2 * 60 + m2 - h1 * 60 - m1) / 60) * 100) / 100
        payload.workHours = wh
        payload.overtime = wh > 9 ? Math.round((wh - 9) * 100) / 100 : 0
      }
    }

    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast.success(type === 'checkIn' ? 'ورود ثبت شد' : 'خروج ثبت شد')
      fetchAttendance()
    } else {
      const error = await res.json()
      toast.error(error.error || 'خطا در ثبت')
    }
  } catch {
    toast.error('خطا در ثبت')
  }
  setShowCheckIn(false)
  setShowCheckOut(false)
}
  // Quick check-in/out for card view
  // Quick check-in/out for card view
const handleQuickCheckIn = (emp: EmployeeBasic, date: string) => {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const employeeId = localUser?.role === 'employee' ? localUser?.employeeId : emp.id
  handleCheckInOut({ employeeId, date, checkIn: time }, 'checkIn')  // ← استفاده از employeeId (نه emp.id)
}

const handleQuickCheckOut = (emp: EmployeeBasic, date: string) => {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const employeeId = localUser?.role === 'employee' ? localUser?.employeeId : emp.id
  handleCheckInOut({ employeeId, date, checkOut: time }, 'checkOut')  // ← استفاده از employeeId (نه emp.id)
}

  const stats = data?.stats || { total: 0, present: 0, absent: 0, late: 0, leave: 0, mission: 0 }

  // History summary
const historySummary = useMemo(() => {
  if (!data?.records) return { totalWork: 0, totalOvertime: 0, presentCount: 0 }

  let totalWork = 0
  let totalOvertime = 0

  data.records.forEach(r => {
    if (r.checkIn && r.checkOut) {
      const result = calculateWorkAndOvertime(r.checkIn, r.checkOut)
      totalWork += timeStrToHours(result.total)
      totalOvertime += timeStrToHours(result.overtime)
    } else if (r.workHours || r.overtime) {
      // ✅ اگر از API اومده و کارکرد و اضافه‌کار عددی هست
      totalWork += r.workHours || 0
      totalOvertime += r.overtime || 0
    }
  })

  return {
    totalWork,
    totalOvertime,
    presentCount: data.records.filter(r => r.status === 'present' || r.status === 'late').length,
  }
}, [data])
const totalItems = data?.records?.length || 0
const totalPages = Math.ceil(totalItems / itemsPerPage)

const paginatedRecords = useMemo(() => {
  const records = data?.records || []
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return records.slice(startIndex, endIndex)
}, [data?.records, currentPage, itemsPerPage])

// وقتی فیلترها تغییر میکنن، به صفحه اول برو
useEffect(() => {
  setCurrentPage(1)
}, [search, statusFilter, selectedDate, historyDate, activeTab])

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page)
  }
}
  // ============================================
  // Loading State
  // ============================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[60px] rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            تردد
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            ثبت و مشاهده ورود و خروج کارکنان — {formatShamsi(todayStr)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCheckIn(true)} className="gap-2" variant="outline" size="sm">
            <LogIn className="w-4 h-4" />
            ثبت ورود
          </Button>
          <Button onClick={() => setShowCheckOut(true)} className="gap-2" size="sm">
            <LogOut className="w-4 h-4" />
            ثبت خروج
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Users} label="کل کارکنان" value={stats.total} gradientFrom="from-blue-500" gradientTo="to-blue-600" barColor="bg-blue-500" />
        <StatCard icon={UserCheck} label="حاضر" value={stats.present} gradientFrom="from-emerald-500" gradientTo="to-emerald-600" barColor="bg-emerald-500" />
        <StatCard icon={UserX} label="غایب" value={stats.absent} gradientFrom="from-red-500" gradientTo="to-red-600" barColor="bg-red-500" />
        <StatCard icon={Clock} label="تاخیر" value={stats.late} gradientFrom="from-amber-500" gradientTo="to-amber-600" barColor="bg-amber-500" />
        <StatCard icon={CalendarOff} label="مرخصی" value={stats.leave} gradientFrom="from-purple-500" gradientTo="to-purple-600" barColor="bg-purple-500" />
        <StatCard icon={MapPin} label="مأموریت" value={stats.mission} gradientFrom="from-sky-500" gradientTo="to-sky-600" barColor="bg-sky-500" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="today" className="gap-1.5 text-xs">
            <Clock className="w-4 h-4" />
            تردد امروز
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs">
            <CalendarOff className="w-4 h-4" />
            تاریخچه
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 text-xs">
            <BarChart3 className="w-4 h-4" />
            آمار
          </TabsTrigger>
        </TabsList>

        {/* ============================
            Tab 1: Today's Attendance
            ============================ */}
        <TabsContent value="today" className="space-y-4">
          {/* Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
              <div className="space-y-1">
  <Label className="text-xs">تاریخ</Label>
  <PersianDatePicker
    value={selectedDate ? toMiladi(selectedDate) : new Date()}
    onChange={(date) => {
      if (date) {
        const shamsiDate = toShamsi(date)
        setSelectedDate(shamsiDate)
      }
    }}
    placeholder="۱۴۰۴/۰۴/۱۶"
    className="w-[180px]"
  />
</div>
                <div className="relative flex-1 min-w-[200px]">
                  <Label className="text-xs">جستجو</Label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="جستجو نام یا کد پرسنلی..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">وضعیت</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                      <SelectItem value="present">حاضر</SelectItem>
                      <SelectItem value="absent">غایب</SelectItem>
                      <SelectItem value="late">تاخیر</SelectItem>
                      <SelectItem value="leave">مرخصی</SelectItem>
                      <SelectItem value="mission">مأموریت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">نمایش</Label>
                  <div className="inline-flex items-center rounded-lg border bg-muted p-[3px]">
                    <Button
                      size="sm"
                      variant={viewMode === 'card' ? 'default' : 'ghost'}
                      className="h-7 px-2.5 gap-1 text-xs"
                      onClick={() => setViewMode('card')}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      کارت
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      className="h-7 px-2.5 gap-1 text-xs"
                      onClick={() => setViewMode('table')}
                    >
                      <List className="w-3.5 h-3.5" />
                      جدول
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records */}
          {!data?.records || data.records.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <Clock className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">رکوردی یافت نشد</h3>
                <p className="text-sm text-muted-foreground mt-1">تاریخ یا فیلتر را تغییر دهید</p>
                <Button className="mt-4" onClick={() => setShowCheckIn(true)}>
                  <LogIn className="w-4 h-4 ml-2" />
                  ثبت ورود جدید
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {paginatedRecords.map(record => (
                <EmployeeCard
                  key={record.id}
                  record={record}
                  onQuickCheckIn={handleQuickCheckIn}
                  onQuickCheckOut={handleQuickCheckOut}
                />
              ))}
            </div>
          ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
 <Table>
  <TableHeader>
    <TableRow className="bg-muted/30">
      <TableHead className="text-right text-xs font-medium">اقدامات</TableHead>
      <TableHead className="text-right text-xs font-medium">وضعیت</TableHead>
      <TableHead className="text-right text-xs font-medium">اضافه‌کاری</TableHead>
      <TableHead className="text-right text-xs font-medium">ساعات کار</TableHead>
      <TableHead className="text-right text-xs font-medium">ساعت خروج</TableHead>
      <TableHead className="text-right text-xs font-medium">ساعت ورود</TableHead>
      <TableHead className="text-right text-xs font-medium">کارمند</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginatedRecords.map(record => (
      <TableRow key={record.id}>
        <TableCell className="text-right">
          <div className="flex gap-1 justify-end">
            {!record.checkIn && (
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => handleQuickCheckIn(record.employee, record.date)}>
                <LogIn className="w-3 h-3" />
                ورود
              </Button>
            )}
            {record.checkIn && !record.checkOut && (
              <Button size="sm" className="h-7 text-[10px] gap-1" onClick={() => handleQuickCheckOut(record.employee, record.date)}>
                <LogOut className="w-3 h-3" />
                خروج
              </Button>
            )}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <AttendanceStatusBadge status={record.status} />
        </TableCell>
        <TableCell className="text-right text-xs">
          {record.checkIn && record.checkOut ? (
            (() => {
              const result = calculateWorkAndOvertime(record.checkIn, record.checkOut)
              return result.overtime !== '00:00' ? (
                <Badge className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-mono">
                  {toPersianDigits(result.overtime)} ساعت
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )
            })()
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="text-right text-xs">
          {record.checkIn && record.checkOut ? (
            (() => {
              const result = calculateWorkAndOvertime(record.checkIn, record.checkOut)
              return (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-mono">
                  {toPersianDigits(result.total)} ساعت
                </Badge>
              )
            })()
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="font-mono text-xs text-right" dir="ltr">
          {record.checkOut ? <span className="text-sky-600">{record.checkOut}</span> : '—'}
        </TableCell>
        <TableCell className="font-mono text-xs text-right" dir="ltr">
          {record.checkIn ? <span className="text-emerald-600">{record.checkIn}</span> : '—'}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center gap-3 justify-end">
            <div>
              <span className="text-sm font-medium">{record.employee.firstName} {record.employee.lastName}</span>
              <p className="text-[10px] text-muted-foreground">{toPersianDigits(record.employee.personnelCode)}</p>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[10px] font-bold">
                {record.employee.firstName[0]}{record.employee.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
</Card>
          )}
          {/* ✅ Pagination - برای تب‌های today و history */}
{(activeTab === 'today' || activeTab === 'history') && totalItems > itemsPerPage && (
  <div className="flex items-center justify-center gap-4 px-2 py-3">
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }
          
          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? 'default' : 'outline'}
              size="sm"
              onClick={() => goToPage(pageNum)}
              className={`h-8 w-8 p-0 text-sm ${
                currentPage === pageNum 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {toPersianDigits(pageNum)}
            </Button>
          )
        }).reverse()}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
    
    <p className="text-sm text-gray-500 dark:text-gray-400">
      نمایش {toPersianDigits(paginatedRecords.length)} از {toPersianDigits(totalItems)} رکورد
    </p>
  </div>
)}
        </TabsContent>

        {/* ============================
            Tab 2: History
            ============================ */}
        <TabsContent value="history" className="space-y-4">
          {/* Date Selector */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
  <Label className="text-xs">تاریخ</Label>
  <PersianDatePicker
    value={historyDate ? toMiladi(historyDate) : new Date()}
    onChange={(date) => {
      if (date) {
        const shamsiDate = toShamsi(date)
        setHistoryDate(shamsiDate)
      }
    }}
    placeholder="۱۴۰۴/۰۴/۱۶"
    className="w-[200px]"
  />
</div>
                <div className="relative flex-1 min-w-[200px]">
                  <Label className="text-xs">جستجو</Label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="جستجو نام یا کد پرسنلی..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">وضعیت</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                      <SelectItem value="present">حاضر</SelectItem>
                      <SelectItem value="absent">غایب</SelectItem>
                      <SelectItem value="late">تاخیر</SelectItem>
                      <SelectItem value="leave">مرخصی</SelectItem>
                      <SelectItem value="mission">مأموریت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          {!data?.records || data.records.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <CalendarOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium text-muted-foreground">رکوردی یافت نشد</h3>
                <p className="text-sm text-muted-foreground mt-1">تاریخ دیگری را انتخاب کنید</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarOff className="w-4 h-4 text-purple-500" />
                  سابقه تردد — {formatShamsi(historyDate)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
            <Table>
  <TableHeader>
    <TableRow className="bg-muted/30">
      <TableHead className="text-right text-xs font-medium">وضعیت</TableHead>
      <TableHead className="text-right text-xs font-medium">اضافه‌کاری</TableHead>
      <TableHead className="text-right text-xs font-medium">کارکرد</TableHead>
      <TableHead className="text-right text-xs font-medium">خروج</TableHead>
      <TableHead className="text-right text-xs font-medium">ورود</TableHead>
      <TableHead className="text-right text-xs font-medium">دپارتمان</TableHead>
      <TableHead className="text-right text-xs font-medium">کارمند</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginatedRecords.map(record => {
      const workResult = record.checkIn && record.checkOut 
        ? calculateWorkAndOvertime(record.checkIn, record.checkOut)
        : null
      
      return (
        <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
          {/* ستون ۱: وضعیت */}
          <TableCell className="text-right">
            <AttendanceStatusBadge status={record.status} />
          </TableCell>

          {/* ستون ۲: اضافه‌کاری */}
          <TableCell className="text-right text-xs">
            {record.checkIn && record.checkOut && workResult.overtime !== '00:00' ? (
              <Badge className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-mono">
                {toPersianDigits(workResult.overtime)} ساعت
              </Badge>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>

          {/* ستون ۳: کارکرد */}
          <TableCell className="text-right text-xs">
            {record.checkIn && record.checkOut ? (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-mono">
                {toPersianDigits(workResult.total)} ساعت
              </Badge>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>

          {/* ستون ۴: خروج */}
          <TableCell className="font-mono text-xs text-right" dir="ltr">
            {record.checkOut ? (
              <span className="text-sky-600 font-medium">{toPersianDigits(record.checkOut)}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>

          {/* ستون ۵: ورود */}
          <TableCell className="font-mono text-xs text-right" dir="ltr">
            {record.checkIn ? (
              <span className="text-emerald-600 font-medium">{toPersianDigits(record.checkIn)}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>

          {/* ستون ۶: دپارتمان */}
          <TableCell className="text-right text-xs text-muted-foreground">
            {record.employee.department || '—'}
          </TableCell>

          {/* ستون ۷: کارمند */}
          <TableCell className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <div className="text-right">
                <span className="text-xs font-medium">{record.employee.firstName} {record.employee.lastName}</span>
                <p className="text-[10px] text-muted-foreground">{toPersianDigits(record.employee.personnelCode)}</p>
              </div>
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[9px] font-bold">
                  {record.employee.firstName[0]}{record.employee.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </TableCell>
        </TableRow>
      )
    })}
  </TableBody>
 <TableFooter>
  <TableRow className="bg-muted/20">
    <TableCell colSpan={7} className="text-right">
      <div dir="rtl" className="flex items-center justify-between text-xs py-1">
        <div className="flex items-center gap-6">
         
<span className="flex items-center gap-1">
  <span className="text-muted-foreground">کل کارکرد:</span>
  <strong className="text-violet-600">
    {toPersianDigits(hoursToTimeStr(historySummary.totalWork))}
  </strong>
</span>
<span className="flex items-center gap-1">
  <span className="text-muted-foreground">اضافه‌کاری:</span>
  <strong className="text-amber-600">
    {toPersianDigits(hoursToTimeStr(historySummary.totalOvertime))}
  </strong>
</span>
          <span className="flex items-center gap-1">
            <span className="text-muted-foreground">حاضر/تاخیر:</span>
            <strong className="text-emerald-600">
              {toPersianDigits(historySummary.presentCount)}
            </strong>
          </span>
        </div>
        <span className="text-muted-foreground">
          مجموع {toPersianDigits(data.records.length)} رکورد
        </span>
      </div>
    </TableCell>
  </TableRow>
</TableFooter>
</Table>
              </CardContent>
            </Card>
          )}
{/* ✅ Pagination مشترک برای تب‌های today و history */}
{(activeTab === 'today' || activeTab === 'history') && totalItems > itemsPerPage && (
  <div className="flex items-center justify-center gap-4 px-2 py-3">
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }
          
          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? 'default' : 'outline'}
              size="sm"
              onClick={() => goToPage(pageNum)}
              className={`h-8 w-8 p-0 text-sm ${
                currentPage === pageNum 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {toPersianDigits(pageNum)}
            </Button>
          )
        }).reverse()}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
    
    <p className="text-sm text-gray-500 dark:text-gray-400">
      نمایش {toPersianDigits(paginatedRecords.length)} از {toPersianDigits(totalItems)} رکورد
    </p>
  </div>
)}
        </TabsContent>

        {/* ============================
            Tab 3: Statistics
            ============================ */}
        <TabsContent value="stats" className="space-y-4">
          <StatisticsTab stats={stats} data={data} trendData={trendData} />
        </TabsContent>
      </Tabs>

      {/* Check-In Dialog */}
      <CheckInDialog
        open={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={(d) => handleCheckInOut(d, 'checkIn')}
        employees={employees}
        type="checkIn"
        currentUser={localUser} 
      />

      {/* Check-Out Dialog */}
      <CheckInDialog
        open={showCheckOut}
        onClose={() => setShowCheckOut(false)}
        onSubmit={(d) => handleCheckInOut(d, 'checkOut')}
        employees={employees}
        type="checkOut"
        currentUser={localUser} 
      />
    </div>
  )
}
