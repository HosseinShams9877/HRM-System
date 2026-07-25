// modules/attendance/components/employee-leave-balance.tsx

'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp, CalendarOff, Loader2, 
  ChevronRight, ChevronLeft
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

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
}

// ============================================
// Leave Type Definitions
// ============================================

const LEAVE_TYPES = [
  { type: 'استحقاقی', label: 'استحقاقی (سالانه)', totalDays: 26, isOneTime: false, color: 'emerald' as const },
  { type: 'استعلاجی', label: 'استعلاجی', totalDays: 15, isOneTime: false, color: 'sky' as const },
  { type: 'بدون حقوق', label: 'بدون حقوق', totalDays: -1, isOneTime: false, color: 'slate' as const },
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

  let barColor = 'bg-emerald-500'
  let barBg = 'bg-emerald-100 dark:bg-emerald-950/30'
  let textColor = 'text-emerald-600 dark:text-emerald-400'
  let bgColor = 'bg-emerald-50 dark:bg-emerald-950/20'

  if (!isUnlimited && remaining !== null && totalDays > 0) {
    const remainingPercentage = Math.round((remaining / totalDays) * 100)
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

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
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

        {!isUnlimited && totalDays > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>مصرف: {toPersianDigits(percentage ?? 0)}٪</span>
              <span>باقی: {toPersianDigits(100 - (percentage ?? 0))}٪</span>
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
// Main Employee Leave Balance Module
// ============================================

export function EmployeeLeaveBalanceModule({ 
  employeeId 
}: { 
  employeeId: string 
}) {
  const [employee, setEmployee] = useState<EmployeeBasic | null>(null)
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1)
  const historyItemsPerPage = 7

  // Fetch employee data
 // modules/attendance/components/employee-leave-balance.tsx

// Fetch employee data
useEffect(() => {
  if (!employeeId) return
  
  const fetchEmployee = async () => {
    try {
      const res = await fetch(`/api/employees/${employeeId}`)
      if (res.ok) {
        const json = await res.json()
        // ✅ اصلاح: دیتا توی json.data هست
        const data = json.data || json
        
        setEmployee({
          id: data.id || employeeId,
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

  // Fetch employee leaves
  useEffect(() => {
    if (!employeeId) return
    
    const fetchLeaves = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/leaves?employeeId=${employeeId}`)
        if (res.ok) {
          const json = await res.json()
          const arr = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []
          setLeaves(arr)
        }
      } catch (err) {
        console.error('Error fetching leaves:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaves()
  }, [employeeId])

  // Calculate used days per leave type
  const leaveBalances = useMemo(() => {
    return LEAVE_TYPES.map(lt => {
      const usedDays = leaves
        .filter(l => l.type === lt.type && l.status === 'approved')
        .reduce((sum, l) => sum + l.totalDays, 0)
      return { ...lt, usedDays }
    })
  }, [leaves])

  // Pagination
  const historyTotalItems = leaves.length
  const historyTotalPages = Math.ceil(historyTotalItems / historyItemsPerPage)
  const paginatedHistory = useMemo(() => {
    const startIndex = (historyCurrentPage - 1) * historyItemsPerPage
    const endIndex = startIndex + historyItemsPerPage
    return leaves.slice(startIndex, endIndex)
  }, [leaves, historyCurrentPage, historyItemsPerPage])

  useEffect(() => {
    setHistoryCurrentPage(1)
  }, [employeeId])

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
              مشاهده موجودی و سوابق مرخصی شما
            </p>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      {employee && (
  <Card className="border-0 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-lg font-bold">
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

      {/* Leave Balance Cards */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          موجودی مرخصی شما
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
          سوابق مرخصی شما
        </h3>
        {leaves.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <CalendarOff className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <h4 className="text-sm font-medium text-muted-foreground">
                سابقه مرخصی یافت نشد
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                شما تاکنون مرخصی ثبت نکرده‌اید
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
    </div>
  )
}