'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  TrendingUp, Search, Users, CalendarOff, Clock,
  Loader2, ChevronDown, Building2, ChevronRight, ChevronLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Separator } from '@/core/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toPersianDigits, formatShamsi, getTodayShamsi } from '@/core/lib/utils-fa'
import { Department } from '@/modules/settings/index'

// ============================================
// Types
// ============================================

interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  avatar: string | null
  department: string | null
  position: string | null
}

interface LeaveRecord {
  id: string
  employeeId: string
  type: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string | null
  status: string
  createdAt: string
  employee?: EmployeeBasic
}

interface DepartmentStat {
  department: string
  totalEmployees: number
  onLeaveToday: number
  daysUsedThisMonth: number
}

// ============================================
// Leave Type Definitions
// ============================================

const LEAVE_TYPES = [
  { type: 'استحقاقی', label: 'استحقاقی (سالانه)', totalDays: 26, isOneTime: false, color: 'emerald' as const },
  { type: 'استعلاجی', label: 'استعلاجی', totalDays: 15, isOneTime: false, color: 'sky' as const },
  { type: 'بدون حقوق', label: 'بدون حقوق', totalDays: -1, isOneTime: false, color: 'slate' as const }, // -1 = unlimited
  { type: 'ازدواج', label: 'ازدواج', totalDays: 3, isOneTime: true, color: 'pink' as const },
  { type: 'فوت', label: 'فوت (فوت خویشاوند)', totalDays: 5, isOneTime: true, color: 'gray' as const },
]

// ============================================
// Status Badge
// ============================================

function LeaveStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'در انتظار', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    approved: { label: 'تایید شده', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    rejected: { label: 'رد شده', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  }
  const c = config[status] || config.pending
  return <Badge className={`text-[10px] ${c.className}`}>{c.label}</Badge>
}

// ============================================
// Type Badge
// ============================================

function LeaveTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    'استحقاقی': { label: 'استحقاقی', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
    'استعلاجی': { label: 'استعلاجی', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    'بدون حقوق': { label: 'بدون حقوق', className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' },
    'ازدواج': { label: 'ازدواج', className: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
    'فوت': { label: 'فوت', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300' },
  }
  const c = config[type] || { label: type, className: 'bg-muted text-muted-foreground' }
  return <Badge variant="outline" className={`text-[10px] ${c.className}`}>{c.label}</Badge>
}

// ============================================
// Balance Card
// ============================================

function BalanceCard({
  label,
  totalDays,
  usedDays,
  isUnlimited,
  colorScheme,
}: {
  label: string
  totalDays: number
  usedDays: number
  isUnlimited: boolean
  colorScheme: string
}) {
  const remaining = isUnlimited ? null : totalDays - usedDays
  const percentage = isUnlimited ? null : totalDays > 0 ? Math.round((usedDays / totalDays) * 100) : 0
  const remainingPercentage = isUnlimited ? null : totalDays > 0 ? Math.round(((totalDays - usedDays) / totalDays) * 100) : 100

  // Color coding based on remaining percentage
  let barColor = 'bg-emerald-500'
  let barBg = 'bg-emerald-100 dark:bg-emerald-950/30'
  let textColor = 'text-emerald-600 dark:text-emerald-400'
  let bgColor = 'bg-emerald-50 dark:bg-emerald-950/20'

  if (!isUnlimited && remainingPercentage !== null) {
    if (remainingPercentage < 25) {
      barColor = 'bg-red-500'
      barBg = 'bg-red-100 dark:bg-red-950/30'
      textColor = 'text-red-600 dark:text-red-400'
      bgColor = 'bg-red-50 dark:bg-red-950/20'
    } else if (remainingPercentage < 50) {
      barColor = 'bg-amber-500'
      barBg = 'bg-amber-100 dark:bg-amber-950/30'
      textColor = 'text-amber-600 dark:text-amber-400'
      bgColor = 'bg-amber-50 dark:bg-amber-950/20'
    }
  }

  const colorMap: Record<string, { icon: string; border: string }> = {
    emerald: { icon: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800' },
    sky: { icon: 'text-sky-600', border: 'border-sky-200 dark:border-sky-800' },
    slate: { icon: 'text-slate-600', border: 'border-slate-200 dark:border-slate-800' },
    pink: { icon: 'text-pink-600', border: 'border-pink-200 dark:border-pink-800' },
    gray: { icon: 'text-gray-600', border: 'border-gray-200 dark:border-gray-800' },
  }
  const colorInfo = colorMap[colorScheme] || colorMap.slate

  return (
    <Card className={`border-0 shadow-sm overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">{label}</h4>
          {isUnlimited ? (
            <Badge variant="outline" className="text-[10px]">نامحدود</Badge>
          ) : (
            <span className={`text-xs font-bold ${textColor}`}>
              {toPersianDigits(remaining ?? 0)} روز مانده
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-sm font-bold">{isUnlimited ? '∞' : toPersianDigits(totalDays)}</div>
            <div className="text-[10px] text-muted-foreground">کل</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-sm font-bold text-amber-600">{toPersianDigits(usedDays)}</div>
            <div className="text-[10px] text-muted-foreground">استفاده شده</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${bgColor}`}>
            <div className={`text-sm font-bold ${isUnlimited ? '' : textColor}`}>
              {isUnlimited ? '∞' : toPersianDigits(remaining ?? 0)}
            </div>
            <div className="text-[10px] text-muted-foreground">باقی‌مانده</div>
          </div>
        </div>

        {!isUnlimited && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>مصرف: {toPersianDigits(percentage ?? 0)}٪</span>
              <span>باقی: {toPersianDigits(remainingPercentage ?? 0)}٪</span>
            </div>
            <div className={`h-2 rounded-full ${barBg} overflow-hidden`}>
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-500`}
                style={{ width: `${percentage ?? 0}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Department Summary Component
// ============================================

function DepartmentSummary({
  employees,
  allLeaves,
  departments
}: {
  employees: EmployeeBasic[]
  allLeaves: LeaveRecord[]
  departments: { id: string; name: string }[]
}) {
  const today = getTodayShamsi()
  const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
  const currentMonth = `${today.year}/${String(today.month).padStart(2, '0')}`

  // Calculate stats
  const totalEmployees = employees.length
  const employeesOnLeaveToday = allLeaves.filter(l =>
    l.status === 'approved' && l.startDate <= todayStr && l.endDate >= todayStr
  ).length

  const daysUsedThisMonth = allLeaves
    .filter(l => l.status === 'approved' && l.startDate.startsWith(currentMonth))
    .reduce((sum, l) => sum + l.totalDays, 0)

  // Build department map with name as key
  const departmentMap = new Map<string, { name: string; employees: number; leaveToday: number; daysUsed: number }>()
  
  departments.forEach(dept => {
    departmentMap.set(dept.name, { 
      name: dept.name, 
      employees: 0, 
      leaveToday: 0, 
      daysUsed: 0 
    })
  })
  
  departmentMap.set('بدون دپارتمان', { 
    name: 'بدون دپارتمان', 
    employees: 0, 
    leaveToday: 0, 
    daysUsed: 0 
  })

  employees.forEach(emp => {
    const deptName = emp.department || 'بدون دپارتمان'
    const entry = departmentMap.get(deptName)
    if (entry) {
      entry.employees++
    } else {
      departmentMap.set(deptName, { 
        name: deptName, 
        employees: 1, 
        leaveToday: 0, 
        daysUsed: 0 
      })
    }
  })

  allLeaves.forEach(leave => {
    if (!leave.employee) return
    const deptName = leave.employee.department || 'بدون دپارتمان'
    const entry = departmentMap.get(deptName)
    if (!entry) return
    
    if (leave.status === 'approved' && leave.startDate <= todayStr && leave.endDate >= todayStr) {
      entry.leaveToday++
    }
    if (leave.status === 'approved' && leave.startDate.startsWith(currentMonth)) {
      entry.daysUsed += leave.totalDays
    }
  })

  const departmentStats = Array.from(departmentMap.values())

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {toPersianDigits(totalEmployees)}
              </div>
              <div className="text-xs text-muted-foreground">کل کارکنان</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <CalendarOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {toPersianDigits(employeesOnLeaveToday)}
              </div>
              <div className="text-xs text-muted-foreground">امروز مرخصی</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-sky-700 dark:text-sky-300">
                {toPersianDigits(daysUsedThisMonth)}
              </div>
              <div className="text-xs text-muted-foreground">روز مرخصی این ماه</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            خلاصه مصرف مرخصی به تفکیک دپارتمان
          </CardTitle>
        </CardHeader>
        <CardContent>
          {departmentStats.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              داده‌ای موجود نیست
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right text-xs">دپارتمان</TableHead>
                    <TableHead className="text-center text-xs">تعداد کارکنان</TableHead>
                    <TableHead className="text-center text-xs">مرخصی امروز</TableHead>
                    <TableHead className="text-center text-xs">روز مصرفی این ماه</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStats.map(dept => (
                    <TableRow key={dept.name}>
                      <TableCell className="text-sm font-medium">{dept.name}</TableCell>
                      <TableCell className="text-center text-sm">{toPersianDigits(dept.employees)}</TableCell>
                      <TableCell className="text-center">
                        {dept.leaveToday > 0 ? (
                          <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            {toPersianDigits(dept.leaveToday)} نفر
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {dept.daysUsed > 0 ? toPersianDigits(dept.daysUsed) + ' روز' : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Main Leave Balance Module
// ============================================

export function LeaveBalanceModule({ currentUser }: { currentUser?: { role: string; employeeId?: string } }) {
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [allLeaves, setAllLeaves] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [empSearch, setEmpSearch] = useState('')
  const isEmployee = currentUser?.role === 'employee'
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1)
const historyItemsPerPage = 7
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    return isEmployee ? currentUser?.employeeId || '' : ''
  })
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      
      if (res.ok) {
        const data = await res.json()
        console.log('📋 Departments from API:', data)
        setDepartments(data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }, [])
  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?status=active')
      if (res.ok) {
        const json = await res.json()
        const arr = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []
        
        // ✅ برای هر کارمند، نام دپارتمان و سمت رو بگیر
        const enrichedEmployees = await Promise.all(
          arr.map(async (e: EmployeeBasic) => {
            let departmentName = e.department || null
            let positionName = e.position || null
            
            // گرفتن نام دپارتمان
            if (e.department && !e.department.startsWith('_')) {
              try {
                const deptRes = await fetch(`/api/departments/${e.department}`)
                if (deptRes.ok) {
                  const deptData = await deptRes.json()
                  departmentName = deptData.name || deptData.title || e.department
                } else {
                  // ❌ اگه پیدا نشد، null بذار (نه id)
                  departmentName = null
                }
              } catch {
                departmentName = null
              }
            }
            
            // گرفتن نام سمت
            if (e.position && !e.position.startsWith('_')) {
              try {
                const posRes = await fetch(`/api/positions/${e.position}`)
                if (posRes.ok) {
                  const posData = await posRes.json()
                  positionName = posData.title || posData.name || e.position
                } else {
                  positionName = null
                }
              } catch {
                positionName = null
              }
            }
            
            return {
              ...e,
              department: departmentName,
              position: positionName,
            }
          })
        )
        
        setEmployees(enrichedEmployees)
      }
    } catch (err) {
      console.error('Fetch employees error:', err)
    }
  }, [])

  // Fetch all leaves (for department summary)
  const fetchAllLeaves = useCallback(async () => {
    try {
      const res = await fetch('/api/leaves')
      if (res.ok) {
        const json = await res.json()
        const arr = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []
        
        // ✅ برای هر مرخصی، نام دپارتمان و سمت رو بگیر
        const enrichedLeaves = await Promise.all(
          arr.map(async (leave: LeaveRecord) => {
            let departmentName = leave.employee?.department || null
            let positionName = leave.employee?.position || null
            
            // گرفتن نام دپارتمان
            if (leave.employee?.department && !leave.employee.department.startsWith('_')) {
              try {
                const deptRes = await fetch(`/api/departments/${leave.employee.department}`)
                if (deptRes.ok) {
                  const deptData = await deptRes.json()
                  departmentName = deptData.name || deptData.title || leave.employee.department
                }
              } catch {
                // keep original
              }
            }
            
            // گرفتن نام سمت
            if (leave.employee?.position && !leave.employee.position.startsWith('_')) {
              try {
                const posRes = await fetch(`/api/positions/${leave.employee.position}`)
                if (posRes.ok) {
                  const posData = await posRes.json()
                  positionName = posData.title || posData.name || leave.employee.position
                }
              } catch {
                // keep original
              }
            }
            
            return {
              ...leave,
              employee: leave.employee ? {
                ...leave.employee,
                department: departmentName,
                position: positionName,
              } : leave.employee,
            }
          })
        )
        
        setAllLeaves(enrichedLeaves)
      }
    } catch (err) {
      console.error('Fetch all leaves error:', err)
    }
  }, [])

  // Initial data load
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchEmployees()
      await fetchDepartments()
      if (!isEmployee) {
        await fetchAllLeaves()
      }
      setLoading(false)
    }
    load()
  }, [])

  // Fetch employee leaves when selection changes
  useEffect(() => {
    let cancelled = false
    if (!selectedEmployeeId) return
    fetch(`/api/leaves?employeeId=${selectedEmployeeId}`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (!cancelled && json) {
          const arr = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []
          setLeaves(arr)
        }
      })
      .catch(err => console.error('Fetch employee leaves error:', err))
    return () => { cancelled = true }
  }, [selectedEmployeeId])

  // برای کارمند عادی، اطلاعات کارمند را از employees بگیر
useEffect(() => {
  if (isEmployee && currentUser?.employeeId && employees.length > 0) {
    const emp = employees.find(e => e.id === currentUser.employeeId)
    if (emp && !selectedEmployeeId) {
      setSelectedEmployeeId(emp.id)
    }
  }
}, [isEmployee, currentUser?.employeeId, employees, selectedEmployeeId])

  // Calculate used days per leave type (only approved)
  const leaveBalances = useMemo(() => {
    const balances = LEAVE_TYPES.map(lt => {
      const usedDays = leaves
        .filter(l => l.type === lt.type && l.status === 'approved')
        .reduce((sum, l) => sum + l.totalDays, 0)
      return { ...lt, usedDays }
    })
    return balances
  }, [leaves])

  // Selected employee info
  const selectedEmployee = useMemo(() => {
    return employees.find(e => e.id === selectedEmployeeId) || null
  }, [employees, selectedEmployeeId])

  // Filter employees for search
  const filteredEmployees = empSearch
    ? employees.filter(e =>
        `${e.firstName} ${e.lastName}`.includes(empSearch) ||
        e.personnelCode.includes(empSearch) ||
        (e.department && e.department.includes(empSearch))
      )
    : employees

    const historyTotalItems = leaves.length
const historyTotalPages = Math.ceil(historyTotalItems / historyItemsPerPage)

const paginatedHistory = useMemo(() => {
  const startIndex = (historyCurrentPage - 1) * historyItemsPerPage
  const endIndex = startIndex + historyItemsPerPage
  return leaves.slice(startIndex, endIndex)
}, [leaves, historyCurrentPage, historyItemsPerPage])

// وقتی کارمند عوض میشه، به صفحه اول برو
useEffect(() => {
  setHistoryCurrentPage(1)
}, [selectedEmployeeId])

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
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">موجودی مرخصی</h2>
            <p className="text-xs text-muted-foreground">
              مشاهده موجودی و سوابق مرخصی کارکنان
            </p>
          </div>
        </div>
      </div>

      {/* Employee Selector */}
      {!isEmployee &&  (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                انتخاب کارمند
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجوی نام، کد پرسنلی یا دپارتمان..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={(v) => {
                    setSelectedEmployeeId(v)
                    setEmpSearch('')
                    setLeaves([])
                  }}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="انتخاب کارمند" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {filteredEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex items-center gap-2">
                          <span>{emp.firstName} {emp.lastName}</span>
                          <span className="text-muted-foreground text-[10px]">
                            ({emp.personnelCode})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedEmployeeId && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-5 text-xs"
                onClick={() => {
                  setSelectedEmployeeId('')
                  setEmpSearch('')
                  setLeaves([])
                }}
              >
                پاک کردن انتخاب
              </Button>
            )}
          </div>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="mt-3 p-3 rounded-xl bg-muted/50 flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-sm font-bold">
                  {selectedEmployee.firstName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-medium">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  کد پرسنلی: {toPersianDigits(selectedEmployee.personnelCode)}
                  {selectedEmployee.department && ` • ${selectedEmployee.department}`}
                  {selectedEmployee.position && ` • ${selectedEmployee.position}`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>)}

      

      {/* Content based on selection */}
      {selectedEmployeeId ? (
        <>
          {/* Leave Balance Cards */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              موجودی مرخصی
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveBalances.map(lb => (
                <BalanceCard
                  key={lb.type}
                  label={lb.label}
                  totalDays={lb.totalDays}
                  usedDays={lb.usedDays}
                  isUnlimited={lb.totalDays === -1}
                  colorScheme={lb.color}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Leave History Table */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              سوابق مرخصی
            </h3>
            {leaves.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <CalendarOff className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    سابقه مرخصی یافت نشد
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    این کارمند تاکنون مرخصی ثبت نکرده است
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-right text-xs">نوع مرخصی</TableHead>
                        <TableHead className="text-right text-xs">از تاریخ</TableHead>
                        <TableHead className="text-right text-xs">تا تاریخ</TableHead>
                        <TableHead className="text-center text-xs">تعداد روز</TableHead>
                        <TableHead className="text-right text-xs">دلیل</TableHead>
                        <TableHead className="text-center text-xs">وضعیت</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedHistory.map(leave => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <LeaveTypeBadge type={leave.type} />
                          </TableCell>
                          <TableCell className="text-xs">{formatShamsi(leave.startDate)}</TableCell>
                          <TableCell className="text-xs">{formatShamsi(leave.endDate)}</TableCell>
                          <TableCell className="text-center text-xs font-medium">
                            {toPersianDigits(leave.totalDays)} روز
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                            {leave.reason || '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <LeaveStatusBadge status={leave.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
             {historyTotalItems > historyItemsPerPage && (
    <div className="flex items-center justify-center gap-4 px-2 py-3">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHistoryCurrentPage(p => Math.max(1, p - 1))}
          disabled={historyCurrentPage <= 1}
          className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(historyTotalPages, 5) }, (_, i) => {
            let pageNum
            if (historyTotalPages <= 5) {
              pageNum = i + 1
            } else if (historyCurrentPage <= 3) {
              pageNum = i + 1
            } else if (historyCurrentPage >= historyTotalPages - 2) {
              pageNum = historyTotalPages - 4 + i
            } else {
              pageNum = historyCurrentPage - 2 + i
            }
            
            return (
              <Button
                key={pageNum}
                variant={historyCurrentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHistoryCurrentPage(pageNum)}
                className={`h-8 w-8 p-0 text-sm ${
                  historyCurrentPage === pageNum 
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
          onClick={() => setHistoryCurrentPage(p => Math.min(historyTotalPages, p + 1))}
          disabled={historyCurrentPage >= historyTotalPages}
          className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        نمایش {toPersianDigits(paginatedHistory.length)} از {toPersianDigits(historyTotalItems)} مرخصی
      </p>
    </div>
  )}
          </div>
        </>
      ) : (
        /* Department Summary when no employee selected */
        <DepartmentSummary employees={employees} allLeaves={allLeaves}departments={departments}  />
      )}
    </div>
  )
}
