'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  MapPin, Search, Plus, CheckCircle2, XCircle,
  PlaneTakeoff, LayoutGrid, List, ChevronDown,
  ChevronUp, Eye, Clock, CheckCheck, X as XIcon, BarChart3,
  FileText
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Separator } from '@/core/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/core/components/ui/toggle-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Skeleton } from '@/core/components/ui/skeleton'
import { toast } from 'sonner'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import type { EmployeeBasic, MissionRecord, MissionStats } from '../missions/index'
import { STATUS_CONFIG } from '../missions/constants'
import { MissionStatusBadge } from '../missions/components/mission-detail-dialog'
import { MissionFormDialog, ConfirmActionDialog } from '../missions/components/mission-form-dialog'
import { MissionDetailDialog } from '../missions/components/mission-detail-dialog'
import { StatisticsTab } from '../missions/components/statistics-tab'

// ============================================
// Stat Card
// ============================================

function StatCard({
  icon: Icon,
  label,
  value,
  gradientFrom,
  gradientTo,
  iconBg,
}: {
  icon: React.ElementType
  label: string
  value: number
  gradientFrom: string
  gradientTo: string
  iconBg: string
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 px-4 py-3">
            <p className="text-2xl font-bold">{toPersianDigits(value)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
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
// Main Missions Module
// ============================================

export function MissionsModule({ currentUser }: { currentUser?: { role: string; employeeId?: string } }) {
  const [missions, setMissions] = useState<MissionRecord[]>([])
  const [stats, setStats] = useState<MissionStats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('missions')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [showForm, setShowForm] = useState(false)
  const [actionConfirm, setActionConfirm] = useState<{ mission: MissionRecord; action: 'approved' | 'rejected' } | null>(null)
  const [detailMission, setDetailMission] = useState<MissionRecord | null>(null)
  const [expandedPending, setExpandedPending] = useState<string | null>(null)
  

  const debouncedSearch = useDebounce(search, 300)

  // ---- Fetch missions ----
  const fetchMissions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/missions?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setMissions(json.data || [])
        setStats(json.stats || { total: 0, pending: 0, approved: 0, rejected: 0 })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter])

  // ---- Fetch employees ----
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?status=active&limit=100')
      if (res.ok) {
        const json = await res.json()
        const list = json.data || json
        setEmployees(
          Array.isArray(list)
            ? list.map((e: EmployeeBasic) => ({
                id: e.id,
                firstName: e.firstName,
                lastName: e.lastName,
                personnelCode: e.personnelCode,
                avatar: e.avatar,
                department: e.department,
                position: e.position,
              }))
            : []
        )
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchMissions()
    fetchEmployees()
  }, [fetchMissions, fetchEmployees])

  // ---- Create mission ----
  const handleSubmit = async (formData: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast.success('درخواست مأموریت ثبت شد')
        setShowForm(false)
        fetchMissions()
      } else {
        const d = await res.json()
        toast.error(d.error || 'خطا در ثبت')
      }
    } catch {
      toast.error('خطا در ثبت')
    }
  }

  // ---- Approve / Reject ----
  const handleAction = useCallback(async () => {
    if (!actionConfirm) return
    try {
      const res = await fetch(`/api/missions/${actionConfirm.mission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actionConfirm.action }),
      })
      if (res.ok) {
        toast.success(actionConfirm.action === 'approved' ? 'مأموریت تایید شد' : 'مأموریت رد شد')
        fetchMissions()
      }
    } catch {
      toast.error('خطا در عملیات')
    }
    setActionConfirm(null)
  }, [actionConfirm, fetchMissions])

  // ---- Derived data ----
  const pendingMissions = missions.filter((m) => m.status === 'pending')
  const totalPendingDays = pendingMissions.reduce((acc, m) => acc + m.totalDays, 0)

  // ---- Loading ----
  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[60px] rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PlaneTakeoff className="w-5 h-5 text-sky-600" />
            مدیریت مأموریت‌ها
          </h2>
          <p className="text-sm text-muted-foreground mt-1">مدیریت و پیگیری درخواست‌های مأموریت کارکنان</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          ثبت مأموریت جدید
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="کل مأموریت‌ها"
          value={stats.total}
          gradientFrom="from-sky-500"
          gradientTo="to-sky-700"
          iconBg="bg-sky-600"
        />
        <StatCard
          icon={Clock}
          label="در انتظار تایید"
          value={stats.pending}
          gradientFrom="from-amber-500"
          gradientTo="to-amber-700"
          iconBg="bg-amber-600"
        />
        <StatCard
          icon={CheckCheck}
          label="تایید شده"
          value={stats.approved}
          gradientFrom="from-emerald-500"
          gradientTo="to-emerald-700"
          iconBg="bg-emerald-600"
        />
        <StatCard
          icon={XIcon}
          label="رد شده"
          value={stats.rejected}
          gradientFrom="from-red-500"
          gradientTo="to-red-700"
          iconBg="bg-red-600"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="missions" className="gap-1.5">
            <PlaneTakeoff className="w-4 h-4" />
            مأموریت‌ها
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5 relative">
            <Clock className="w-4 h-4" />
            در انتظار تایید
            {stats.pending > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                {toPersianDigits(stats.pending)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-1.5">
            <BarChart3 className="w-4 h-4" />
            آمار
          </TabsTrigger>
        </TabsList>

        {/* ======================== */}
        {/* TAB 1: Missions List    */}
        {/* ======================== */}
        <TabsContent value="missions" className="space-y-4 mt-4">
          {/* Filters + View Toggle */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجو نام، عنوان، مقصد..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="approved">تایید شده</SelectItem>
                    <SelectItem value="rejected">رد شده</SelectItem>
                  </SelectContent>
                </Select>
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(v) => { if (v) setViewMode(v as 'card' | 'table') }}
                  variant="outline"
                  className="border rounded-md"
                >
                  <ToggleGroupItem value="card" className="px-3">
                    <LayoutGrid className="w-4 h-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="table" className="px-3">
                    <List className="w-4 h-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          {missions.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <PlaneTakeoff className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium text-muted-foreground">مأموریتی یافت نشد</h3>
                <p className="text-xs text-muted-foreground mt-1">با تغییر فیلترها جستجو کنید</p>
              </CardContent>
            </Card>
          )}

          {/* Card View */}
          {missions.length > 0 && viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {missions.map((mission) => {
                const statusConf = STATUS_CONFIG[mission.status] || STATUS_CONFIG.pending
                return (
                  <Card
                    key={mission.id}
                    className="group hover:shadow-md transition-all border-0 shadow-sm overflow-hidden cursor-pointer"
                    onClick={() => setDetailMission(mission)}
                  >
                    {/* Gradient top border */}
                    <div className={`h-1.5 bg-gradient-to-r ${statusConf.gradientClass}`} />
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-sky-400 to-teal-500 text-white text-xs font-bold">
                              {mission.employee.firstName[0]}
                              {mission.employee.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold">{mission.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {mission.employee.firstName} {mission.employee.lastName}
                            </p>
                          </div>
                        </div>
                        <MissionStatusBadge status={mission.status} />
                      </div>

                      {/* Destination */}
                      {mission.destination && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-sky-500" />
                          {mission.destination}
                        </p>
                      )}

                      {/* Date Range + Days */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <PlaneTakeoff className="w-3.5 h-3.5" style={{ display: 'inline' }} />
                          <span>{toPersianDigits(mission.startDate)}</span>
                          <span className="text-muted-foreground/50">تا</span>
                          <span>{toPersianDigits(mission.endDate)}</span>
                        </div>
                        <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 text-[11px]">
                          {toPersianDigits(mission.totalDays)} روز
                        </Badge>
                      </div>

                      {/* Quick Actions for Pending */}
                      {mission.status === 'pending' && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs gap-1"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActionConfirm({ mission, action: 'approved' })
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            تایید
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs gap-1"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActionConfirm({ mission, action: 'rejected' })
                            }}
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            رد
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetailMission(mission)
                            }}
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Table View */}
          {missions.length > 0 && viewMode === 'table' && (
           <Card className="border-0 shadow-sm">
  <CardContent className="p-0">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">اقدامات</TableHead>
          <TableHead className="text-right">وضعیت</TableHead>
          <TableHead className="text-right">روزها</TableHead>
          <TableHead className="text-right">پایان</TableHead>
          <TableHead className="text-right">شروع</TableHead>
          <TableHead className="text-right">مقصد</TableHead>
          <TableHead className="text-right">عنوان</TableHead>
          <TableHead className="text-right">کارمند</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {missions.map((mission) => (
          <TableRow key={mission.id} className="cursor-pointer" onClick={() => setDetailMission(mission)}>
            {/* ستون ۱: اقدامات */}
            <TableCell className="text-right">
              <div className="flex items-center gap-1 justify-end">
                {mission.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActionConfirm({ mission, action: 'approved' })
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActionConfirm({ mission, action: 'rejected' })
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDetailMission(mission)
                  }}
                >
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </TableCell>

            {/* ستون ۲: وضعیت */}
            <TableCell className="text-right">
              <MissionStatusBadge status={mission.status} />
            </TableCell>

            {/* ستون ۳: روزها */}
            <TableCell className="text-right">
              <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 text-[11px]">
                {toPersianDigits(mission.totalDays)} روز
              </Badge>
            </TableCell>

            {/* ستون ۴: پایان */}
            <TableCell className="text-sm text-right whitespace-nowrap">
              {toPersianDigits(mission.endDate)}
            </TableCell>

            {/* ستون ۵: شروع */}
            <TableCell className="text-sm text-right whitespace-nowrap">
              {toPersianDigits(mission.startDate)}
            </TableCell>

            {/* ستون ۶: مقصد */}
            <TableCell className="text-sm text-right">
              {mission.destination ? (
                <span className="flex items-center gap-1 justify-end">
                  {mission.destination}
                  <MapPin className="w-3 h-3 text-sky-500" />
                </span>
              ) : (
                '—'
              )}
            </TableCell>

            {/* ستون ۷: عنوان */}
            <TableCell className="font-medium text-sm text-right">
              {mission.title}
            </TableCell>

            {/* ستون ۸: کارمند */}
            <TableCell className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <div>
                  <p className="text-sm font-medium whitespace-nowrap text-right">
                    {mission.employee.firstName} {mission.employee.lastName}
                  </p>
                  <p className="text-[10px] text-muted-foreground text-right">{mission.employee.personnelCode}</p>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-sky-400 to-teal-500 text-white text-[10px] font-bold">
                    {mission.employee.firstName[0]}
                    {mission.employee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
          )}
        </TabsContent>

        {/* ======================== */}
        {/* TAB 2: Pending          */}
        {/* ======================== */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          {/* Pending Summary */}
          <Card className="border-0 shadow-sm" dir='rtl'>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3" >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{toPersianDigits(pendingMissions.length)} درخواست در انتظار</p>
                    <p className="text-xs text-muted-foreground">مجموع {toPersianDigits(totalPendingDays)} روز مأموریت</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">روزهای در انتظار:</span>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-sm px-3 py-1">
                    {toPersianDigits(totalPendingDays)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending List */}
          {pendingMissions.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <CheckCheck className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-muted-foreground">مأموریتی در انتظار تایید نیست</h3>
                <p className="text-xs text-muted-foreground mt-1">همه درخواست‌ها بررسی شده‌اند</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingMissions.map((mission) => {
                const isExpanded = expandedPending === mission.id
                return (
                  <Card
                    key={mission.id}
                    className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Gradient top */}
                    <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
                    <CardContent className="p-0">
                      {/* Collapsed Header */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedPending(isExpanded ? null : mission.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold">
                              {mission.employee.firstName[0]}
                              {mission.employee.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold">{mission.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {mission.employee.firstName} {mission.employee.lastName}
                              {mission.employee.department ? ` · ${mission.employee.department}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[11px]">
                            {toPersianDigits(mission.totalDays)} روز
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          <Separator />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">مقصد</p>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                                {mission.destination || '—'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">شروع</p>
                              <p className="text-sm font-medium">{toPersianDigits(mission.startDate)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">پایان</p>
                              <p className="text-sm font-medium">{toPersianDigits(mission.endDate)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">کد پرسنلی</p>
                              <p className="text-sm font-medium">{toPersianDigits(mission.employee.personnelCode)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              className="flex-1 h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => setActionConfirm({ mission, action: 'approved' })}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              تایید مأموریت
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 h-9 gap-1.5"
                              onClick={() => setActionConfirm({ mission, action: 'rejected' })}
                            >
                              <XCircle className="w-4 h-4" />
                              رد مأموریت
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 gap-1.5"
                              onClick={() => setDetailMission(mission)}
                            >
                              <Eye className="w-4 h-4" />
                              جزئیات
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ======================== */}
        {/* TAB 3: Statistics        */}
        {/* ======================== */}
        <TabsContent value="statistics" className="mt-4">
          <StatisticsTab stats={stats} missions={missions} />
        </TabsContent>
      </Tabs>

      {/* Mission Form Dialog - key forces remount to reset state */}
      <MissionFormDialog
        key={showForm ? 'open' : 'closed'}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        employees={employees}
        currentUser={currentUser}
      />

      {/* Confirm Action Dialog */}
      <ConfirmActionDialog
        open={!!actionConfirm}
        onClose={() => setActionConfirm(null)}
        onConfirm={handleAction}
        mission={actionConfirm?.mission || null}
        action={actionConfirm?.action || 'approved'}
      />

      {/* Mission Detail Dialog */}
      <MissionDetailDialog
        open={!!detailMission}
        onClose={() => setDetailMission(null)}
        mission={detailMission}
      />
    </div>
  )
}
