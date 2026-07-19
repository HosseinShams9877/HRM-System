'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  CalendarOff, Search, Plus, CheckCircle2, XCircle,
  Clock, Eye, LayoutGrid, List,
  BarChart3, FileText,
  CalendarDays, TrendingUp, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Progress } from '@/core/components/ui/progress'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Separator } from '@/core/components/ui/separator'
import { useToast } from '@/core/hooks/use-toast'
import { toast as sonnerToast } from 'sonner'
import { Skeleton } from '@/core/components/ui/skeleton'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { LEAVE_TYPE_CONFIG, DEFAULT_LEAVE_TYPE, STATUS_CONFIG } from '../leaves/constants'
import { LeaveStatusBadge } from '../leaves/components/leave-status-badge'
import { LeaveTypeBadge } from '../leaves/components/leave-type-badge'
import { LeaveCard } from '../leaves/components/leave-card'
import { LeaveFormDialog } from '../leaves/components/leave-form-dialog'
import { LeaveDetailDialog } from '../leaves/components/leave-detail-dialog'
import { LeavesStatsTab } from '../leaves/components/leaves-stats-tab'
import type { EmployeeBasic, LeaveRecord, LeaveStats } from '../leaves/index'

// ============================================
// Stat Card (local to this module)
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
// Main Leaves Module
// ============================================

export function LeavesModule({ currentUser }: { currentUser?: { role: string; employeeId?: string } }) {
  const [data, setData] = useState<{ leaves: LeaveRecord[]; stats: LeaveStats } | null>(null)
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [activeTab, setActiveTab] = useState('requests')
  const [actionConfirm, setActionConfirm] = useState<{ leave: LeaveRecord; action: 'approved' | 'rejected' } | null>(null)
  const [detailLeave, setDetailLeave] = useState<LeaveRecord | null>(null)
  const { toast } = useToast()
  const [calendarView, setCalendarView] = useState(false)

  // ============================================
  // Fetch Data
  // ============================================

  const fetchLeaves = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)

      const res = await fetch(`/api/leaves?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        // API returns { data, pagination, stats } or { leaves, stats }
        if (json.data && json.stats) {
          setData({ leaves: json.data, stats: json.stats })
        } else if (json.leaves && json.stats) {
          setData(json)
        } else if (Array.isArray(json.data)) {
          const leavesArr = json.data
          setData({
            leaves: leavesArr,
            stats: {
              total: leavesArr.length,
              pending: leavesArr.filter((l: LeaveRecord) => l.status === 'pending').length,
              approved: leavesArr.filter((l: LeaveRecord) => l.status === 'approved').length,
              rejected: leavesArr.filter((l: LeaveRecord) => l.status === 'rejected').length,
            },
          })
        } else {
          setData({ leaves: [], stats: { total: 0, pending: 0, approved: 0, rejected: 0 } })
        }
      }
    } catch (err) {
      console.error('Fetch leaves error:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, typeFilter])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?status=active')
      if (res.ok) {
        const result = await res.json()
        const empList = Array.isArray(result) ? result : (result.data || [])
        setEmployees(empList.map((e: EmployeeBasic) => ({
          id: e.id,
          firstName: e.firstName,
          lastName: e.lastName,
          personnelCode: e.personnelCode,
          avatar: e.avatar,
          department: e.department,
          position: e.position,
        })))
      }
    } catch (err) {
      console.error('Fetch employees error:', err)
    }
  }, [])

  useEffect(() => {
    fetchLeaves()
    fetchEmployees()
  }, [fetchLeaves, fetchEmployees])

  // ============================================
  // Handlers
  // ============================================

  const handleSubmit = useCallback(async (formData: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        sonnerToast.success('درخواست مرخصی ثبت شد')
        setShowForm(false)
        fetchLeaves()
      } else {
        const d = await res.json()
        sonnerToast.error(d.error || 'خطا در ثبت')
      }
    } catch {
      sonnerToast.error('خطا در ثبت')
    }
  }, [fetchLeaves, toast])

  const handleAction = useCallback(async () => {
    if (!actionConfirm) return
    try {
      const res = await fetch(`/api/leaves/${actionConfirm.leave.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actionConfirm.action }),
      })
      if (res.ok) {
        sonnerToast.success(actionConfirm.action === 'approved' ? 'مرخصی تایید شد' : 'مرخصی رد شد')
        fetchLeaves()
      }
    } catch {
      sonnerToast.error('خطا در انجام عملیات')
    }
    setActionConfirm(null)
  }, [actionConfirm, fetchLeaves, toast])

  const handleQuickApprove = useCallback((leave: LeaveRecord) => {
    setActionConfirm({ leave, action: 'approved' })
  }, [])

  const handleQuickReject = useCallback((leave: LeaveRecord) => {
    setActionConfirm({ leave, action: 'rejected' })
  }, [])

  // ============================================
  // Computed Data
  // ============================================

  const stats = data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
  const leaves = data?.leaves || []
  const pendingLeaves = leaves.filter(l => l.status === 'pending')

  // Type breakdown for pending tab
  const typeBreakdown = useMemo(() => {
    const breakdown: Record<string, { total: number; pending: number; approved: number; rejected: number }> = {}
    leaves.forEach(l => {
      if (!breakdown[l.type]) {
        breakdown[l.type] = { total: 0, pending: 0, approved: 0, rejected: 0 }
      }
      breakdown[l.type].total++
      if (l.status === 'pending') breakdown[l.type].pending++
      if (l.status === 'approved') breakdown[l.type].approved++
      if (l.status === 'rejected') breakdown[l.type].rejected++
    })
    return breakdown
  }, [leaves])

  // Approval rate
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0

  // ============================================
  // Loading State
  // ============================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-sm">
              <CardContent className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-8" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
              <Skeleton className="h-1 w-full" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-sm">
              <Skeleton className="h-1.5 w-full" />
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-px w-full my-2" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-7 w-14" />
                      <Skeleton className="h-7 w-10" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            <CalendarOff className="w-5 h-5 text-purple-600" />
            مرخصی
          </h2>
          <p className="text-sm text-muted-foreground mt-1">مدیریت درخواست‌های مرخصی کارکنان</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={calendarView ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => setCalendarView(!calendarView)}
          >
            <CalendarDays className="w-4 h-4 ml-1" />
            {calendarView ? 'لیست' : 'تقویم'}
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            ثبت مرخصی
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={FileText}
          label="کل درخواست‌ها"
          value={stats.total}
          gradientFrom="from-purple-500"
          gradientTo="to-purple-600"
          barColor="bg-purple-500"
        />
        <StatCard
          icon={Clock}
          label="در انتظار تایید"
          value={stats.pending}
          gradientFrom="from-amber-500"
          gradientTo="to-amber-600"
          barColor="bg-amber-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="تایید شده"
          value={stats.approved}
          gradientFrom="from-emerald-500"
          gradientTo="to-emerald-600"
          barColor="bg-emerald-500"
        />
        <StatCard
          icon={XCircle}
          label="رد شده"
          value={stats.rejected}
          gradientFrom="from-red-500"
          gradientTo="to-red-600"
          barColor="bg-red-500"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="requests" className="gap-1.5 text-xs">
            <FileText className="w-4 h-4" />
            درخواست‌ها
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5 text-xs">
            <Clock className="w-4 h-4" />
            در انتظار تایید
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 text-xs">
            <BarChart3 className="w-4 h-4" />
            آمار
          </TabsTrigger>
        </TabsList>

        {/* ============================
            Tab 1: Requests
            ============================ */}
        <TabsContent value="requests" className="space-y-4">
          {/* Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="relative flex-1 min-w-[140px] sm:min-w-[200px]">
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
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                      <SelectItem value="pending">در انتظار</SelectItem>
                      <SelectItem value="approved">تایید شده</SelectItem>
                      <SelectItem value="rejected">رد شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">نوع</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="نوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه انواع</SelectItem>
                      <SelectItem value="استحقاقی">استحقاقی</SelectItem>
                      <SelectItem value="استعلاجی">استعلاجی</SelectItem>
                      <SelectItem value="بدون حقوق">بدون حقوق</SelectItem>
                      <SelectItem value="ازدواج">ازدواج</SelectItem>
                      <SelectItem value="فوت">فوت</SelectItem>
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

          {/* Content */}
          {calendarView ? (
            /* Calendar View */
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-600" />
                  نمای تقویمی مرخصی‌ها
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaves.length === 0 ? (
                  <div className="py-12 text-center">
                    <CalendarOff className="w-14 h-14 mx-auto mb-3 text-muted-foreground/20" />
                    <h3 className="text-sm font-medium text-muted-foreground">مرخصی‌ای ثبت نشده</h3>
                    <p className="text-xs text-muted-foreground mt-1">با ثبت اولین مرخصی، تقویم نمایش داده می‌شود</p>
                    <Button onClick={() => setShowForm(true)} className="mt-4 gap-2" size="sm">
                      <Plus className="w-4 h-4" />
                      ثبت مرخصی
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] text-muted-foreground font-medium py-2">{day}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i + 1
                      const dayLeaves = leaves.filter(l => {
                        try {
                          const startParts = l.startDate.split('/')
                          const startDay = parseInt(startParts[2] || '0')
                          const endParts = l.endDate.split('/')
                          const endDay = parseInt(endParts[2] || '0')
                          return day >= startDay && day <= endDay
                        } catch { return false }
                      })
                      return (
                        <div
                          key={i}
                          className={`min-h-[48px] p-1 rounded-md text-[10px] border ${
                            dayLeaves.length > 0
                              ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
                              : 'border-transparent'
                          }`}
                        >
                          <span className={`font-medium ${dayLeaves.length > 0 ? 'text-purple-700 dark:text-purple-300' : 'text-muted-foreground'}`}>
                            {toPersianDigits(day)}
                          </span>
                          {dayLeaves.slice(0, 2).map(leave => (
                            <div
                              key={leave.id}
                              className={`mt-0.5 px-1 rounded text-[8px] truncate cursor-pointer ${
                                leave.status === 'approved'
                                  ? 'bg-emerald-200 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                  : leave.status === 'rejected'
                                  ? 'bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                  : 'bg-amber-200 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                              }`}
                              onClick={() => setDetailLeave(leave)}
                            >
                              {leave.employee.firstName}
                            </div>
                          ))}
                          {dayLeaves.length > 2 && (
                            <div className="text-[8px] text-muted-foreground">+{toPersianDigits(dayLeaves.length - 2)}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : leaves.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-purple-50 dark:bg-purple-950/30">
                    <CalendarOff className="w-12 h-12 text-purple-300 dark:text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">مرخصی‌ای یافت نشد</h3>
                    <p className="text-xs text-muted-foreground mt-1">فیلترها را تغییر دهید یا درخواست جدید ثبت کنید</p>
                  </div>
                  <Button onClick={() => setShowForm(true)} className="gap-2" size="sm">
                    <Plus className="w-4 h-4" />
                    ثبت مرخصی جدید
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {leaves.map(leave => (
                <LeaveCard
                  key={leave.id}
                  leave={leave}
                  onApprove={handleQuickApprove}
                  onReject={handleQuickReject}
                  onView={setDetailLeave}
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
      <TableHead className="text-right text-xs font-medium">دلیل</TableHead>
      <TableHead className="text-right text-xs font-medium">روزها</TableHead>
      <TableHead className="text-right text-xs font-medium">تاریخ پایان</TableHead>
      <TableHead className="text-right text-xs font-medium">تاریخ شروع</TableHead>
      <TableHead className="text-right text-xs font-medium">نوع</TableHead>
      <TableHead className="text-right text-xs font-medium">کارمند</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {leaves.map(leave => (
      <TableRow key={leave.id}>
        {/* ستون ۱: اقدامات */}
        <TableCell className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDetailLeave(leave)}
            >
              <Eye className="w-4 h-4 text-muted-foreground" />
            </Button>
            {leave.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => handleQuickApprove(leave)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                  onClick={() => handleQuickReject(leave)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </TableCell>

        {/* ستون ۲: وضعیت */}
        <TableCell className="text-right">
          <LeaveStatusBadge status={leave.status} />
        </TableCell>

        {/* ستون ۳: دلیل */}
        <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate text-right">
          {leave.reason || '—'}
        </TableCell>

        {/* ستون ۴: روزها */}
        <TableCell className="text-xs font-medium text-right">
          {toPersianDigits(leave.totalDays)} روز
        </TableCell>

        {/* ستون ۵: تاریخ پایان */}
        <TableCell className="text-xs text-right">
          {toPersianDigits(leave.endDate)}
        </TableCell>

        {/* ستون ۶: تاریخ شروع */}
        <TableCell className="text-xs text-right">
          {toPersianDigits(leave.startDate)}
        </TableCell>

        {/* ستون ۷: نوع */}
        <TableCell className="text-right">
          <LeaveTypeBadge type={leave.type} />
        </TableCell>

        {/* ستون ۸: کارمند */}
        <TableCell className="text-right">
          <div className="flex items-center gap-3 justify-end">
            <div>
              <span className="text-sm font-medium">{leave.employee.firstName} {leave.employee.lastName}</span>
              <p className="text-[10px] text-muted-foreground">{leave.employee.department || '—'}</p>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-violet-500 text-white text-[10px] font-bold">
                {leave.employee.firstName[0]}{leave.employee.lastName[0]}
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
        </TabsContent>

        {/* ============================
            Tab 2: Pending
            ============================ */}
        <TabsContent value="pending" className="space-y-4">
          {pendingLeaves.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                <h3 className="text-sm font-medium text-muted-foreground">درخواست در انتظاری وجود ندارد</h3>
                <p className="text-xs text-muted-foreground mt-1">همه درخواست‌ها بررسی شده‌اند</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pending List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold">
                    {toPersianDigits(pendingLeaves.length)} درخواست در انتظار
                  </h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {pendingLeaves.map(leave => {
                    const typeConf = LEAVE_TYPE_CONFIG[leave.type] || DEFAULT_LEAVE_TYPE
                    const fullName = `${leave.employee.firstName} ${leave.employee.lastName}`
                    const initials = `${leave.employee.firstName[0]}${leave.employee.lastName[0]}`
                    return (
                      <Card key={leave.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className={`h-1 ${typeConf.gradientBorder}`} />
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10 shadow-sm">
                              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold truncate">{fullName}</h4>
                                <LeaveTypeBadge type={leave.type} />
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {leave.employee.position || leave.employee.department || toPersianDigits(leave.employee.personnelCode)}
                              </p>
                              <Separator className="my-2" />
                              <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3 text-purple-400" />
                                  {toPersianDigits(leave.startDate)} — {toPersianDigits(leave.endDate)}
                                </span>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                  {toPersianDigits(leave.totalDays)} روز
                                </Badge>
                              </div>
                              {leave.reason && (
                                <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-1">
                                  {leave.reason}
                                </p>
                              )}
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  className="h-8 text-[11px] gap-1 flex-1"
                                  onClick={() => handleQuickApprove(leave)}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  تایید
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8 text-[11px] gap-1 flex-1"
                                  onClick={() => handleQuickReject(leave)}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  رد کردن
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-[11px] gap-1"
                                  onClick={() => setDetailLeave(leave)}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Summary Panel */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-semibold">خلاصه وضعیت</h3>
                </div>

                {/* Approval Rate */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">نرخ تایید</span>
                      <span className="text-sm font-bold">{toPersianDigits(approvalRate)}٪</span>
                    </div>
                    <Progress value={approvalRate} className="h-2" />
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">آمار کلی</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                          <span className="text-sm">در انتظار</span>
                        </div>
                        <span className="text-sm font-bold">{toPersianDigits(stats.pending)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-sm">تایید شده</span>
                        </div>
                        <span className="text-sm font-bold">{toPersianDigits(stats.approved)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm">رد شده</span>
                        </div>
                        <span className="text-sm font-bold">{toPersianDigits(stats.rejected)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending by Type */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">در انتظار بر اساس نوع</h4>
                    <div className="space-y-2">
                      {Object.entries(typeBreakdown).map(([type, counts]) => {
                        const typeConf = LEAVE_TYPE_CONFIG[type] || DEFAULT_LEAVE_TYPE
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${typeConf.gradientFrom} ${typeConf.gradientTo}`} />
                              <span className="text-sm">{type}</span>
                            </div>
                            <span className="text-sm font-bold">{toPersianDigits(counts.pending)}</span>
                          </div>
                        )
                      })}
                      {Object.keys(typeBreakdown).length === 0 && (
                        <p className="text-xs text-muted-foreground">داده‌ای موجود نیست</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================
            Tab 3: Statistics
            ============================ */}
        <TabsContent value="stats" className="space-y-4">
          <LeavesStatsTab stats={stats} leaves={leaves} />
        </TabsContent>
      </Tabs>

      {/* Leave Form Dialog */}
      <LeaveFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        employees={employees}
        currentUser={currentUser}
      />

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        open={!!actionConfirm}
        onOpenChange={(open) => !open && setActionConfirm(null)}
        title={actionConfirm?.action === 'approved' ? 'تایید مرخصی' : 'رد مرخصی'}
        description={actionConfirm
          ? `آیا از ${actionConfirm.action === 'approved' ? 'تایید' : 'رد'} مرخصی ${actionConfirm.leave.employee.firstName} ${actionConfirm.leave.employee.lastName} (${toPersianDigits(actionConfirm.leave.totalDays)} روز - ${actionConfirm.leave.type} از ${toPersianDigits(actionConfirm.leave.startDate)} تا ${toPersianDigits(actionConfirm.leave.endDate)}) اطمینان دارید؟`
          : ''
        }
        confirmText={actionConfirm?.action === 'approved' ? 'تایید' : 'رد کردن'}
        variant={actionConfirm?.action === 'rejected' ? 'destructive' : 'default'}
        onConfirm={handleAction}
      />

      {/* Leave Detail Dialog */}
      <LeaveDetailDialog
        leave={detailLeave}
        onClose={() => setDetailLeave(null)}
        onApprove={(leave) => { setDetailLeave(null); handleQuickApprove(leave) }}
        onReject={(leave) => { setDetailLeave(null); handleQuickReject(leave) }}
      />
    </div>
  )
}
