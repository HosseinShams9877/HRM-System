'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  UserCheck, Search, Plus, Edit, Trash2, Eye,
  Loader2, AlertCircle, Briefcase, Calendar,
  FileText, ArrowUpDown, LayoutGrid, List,
  BarChart3, Activity, Clock, CheckCircle2, XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits, formatShamsi, getTodayShamsi } from '@/core/lib/utils-fa'
import { TYPE_BORDER_MAP, TYPE_BG_MAP, TYPE_GRADIENT_MAP } from '../constants'
import { AppointmentTypeBadge } from './appointment-type-badge'
import { AppointmentCardView } from './appointment-card-view'
import { AppointmentTableView } from './appointment-table-view'
import { AppointmentFormDialog } from './appointment-form-dialog'
import { AppointmentDetailDialog } from './appointment-detail-dialog'
import { StatisticsTab } from './statistics-tab'
import type { Appointment, EmployeeBasic, PositionBasic } from '../index'

// ============================================
// Stat Card (local to this module)
// ============================================

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconBg,
}: {
  title: string
  value: number
  icon: React.ElementType
  gradient: string
  iconBg: string
}) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden relative">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-l ${gradient}`} />
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{toPersianDigits(value)}</div>
          <div className="text-[11px] text-muted-foreground">{title}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Active Tab Component (local)
// ============================================

function ActiveTab({
  appointments,
  onView,
  onEdit,
  onEnd,
  onDelete,
}: {
  appointments: Appointment[]
  onView: (apt: Appointment) => void
  onEdit: (apt: Appointment) => void
  onEnd: (apt: Appointment) => void
  onDelete: (apt: Appointment) => void
}) {
  const [searchActive, setSearchActive] = useState('')
  const [typeFilterActive, setTypeFilterActive] = useState('all')

  const activeApts = appointments.filter(a => a.status === 'active')

  const filtered = activeApts.filter(apt => {
    const matchSearch = !searchActive ||
      `${apt.employee.firstName} ${apt.employee.lastName}`.includes(searchActive) ||
      apt.employee.personnelCode.includes(searchActive) ||
      (apt.decreeNumber || '').includes(searchActive)
    const matchType = typeFilterActive === 'all' || apt.type === typeFilterActive
    return matchSearch && matchType
  })

  return (
    <div className="space-y-4">
      {/* Active count badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">
            {toPersianDigits(filtered.length)} انتصاب فعال
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="جستجو..."
              value={searchActive}
              onChange={(e) => setSearchActive(e.target.value)}
              className="pr-10 h-8 w-[200px] text-xs"
            />
          </div>
          <Select value={typeFilterActive} onValueChange={setTypeFilterActive}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="نوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه انواع</SelectItem>
              <SelectItem value="اصلی">اصلی</SelectItem>
              <SelectItem value="سرپرست">سرپرست</SelectItem>
              <SelectItem value="موقت">موقت</SelectItem>
              <SelectItem value="Acting">سرپرست موقت</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick actions cards */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">انتصاب فعالی یافت نشد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(apt => {
            const borderClass = TYPE_BORDER_MAP[apt.type] || 'border-t-gray-500'
            const bgClass = TYPE_BG_MAP[apt.type] || 'bg-muted/50'

            return (
              <Card
                key={apt.id}
                className={`border-0 shadow-sm border-t-4 ${borderClass} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => onView(apt)}
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className={`bg-gradient-to-br ${TYPE_GRADIENT_MAP[apt.type] || 'from-gray-400 to-gray-500'} text-white text-xs font-bold`}>
                        {apt.employee.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold truncate">
                        {apt.employee.firstName} {apt.employee.lastName}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        {apt.position.title}
                      </p>
                    </div>
                  </div>

                  <div className={`p-2 rounded-md ${bgClass}`}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">
                        {apt.position.department?.name || ''}
                      </span>
                      <AppointmentTypeBadge type={apt.type} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      از {formatShamsi(apt.startDate)}
                    </span>
                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(apt)} title="ویرایش">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-amber-600" onClick={() => onEnd(apt)} title="پایان">
                        <Clock className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => onDelete(apt)} title="لغو">
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Appointments Module
// ============================================

export function AppointmentModule() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])
  const [positions, setPositions] = useState<PositionBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Appointment | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const { toast } = useToast()

  const fetchAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/appointments?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } catch (err) {
      console.error('Fetch appointments error:', err)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, statusFilter])

  const fetchOptions = useCallback(async () => {
    try {
      const [empRes, posRes] = await Promise.all([
        fetch('/api/employees?status=active'),
        fetch('/api/positions?status=active'),
      ])
      if (empRes.ok) {
        const empData = await empRes.json()
        setEmployees(empData.map((e: { id: string; firstName: string; lastName: string; personnelCode: string; department: string | null }) => ({
          id: e.id,
          firstName: e.firstName,
          lastName: e.lastName,
          personnelCode: e.personnelCode,
          avatar: null,
          department: e.department,
        })))
      }
      if (posRes.ok) {
        const posData = await posRes.json()
        setPositions(posData.map((p: { id: string; title: string; code: string; level: string | null; jobGrade: string | null; department: { id: string; name: string } | null }) => ({
          id: p.id,
          title: p.title,
          code: p.code,
          level: p.level,
          jobGrade: p.jobGrade,
          department: p.department,
        })))
      }
    } catch (err) {
      console.error('Fetch options error:', err)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
    fetchOptions()
  }, [fetchAppointments, fetchOptions])

  const handleEdit = (apt: Appointment) => {
    setEditingAppointment(apt)
    setShowForm(true)
  }

  const handleDelete = useCallback(async (apt: Appointment) => {
    try {
      const res = await fetch(`/api/appointments/${apt.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'انتصاب لغو شد' })
        fetchAppointments()
      }
    } catch (err) {
      toast({ title: 'خطا در لغو انتصاب', variant: 'destructive' })
    }
    setDeleteConfirm(null)
  }, [fetchAppointments, toast])

  const handleEndAppointment = useCallback(async (apt: Appointment) => {
    try {
      const today = getTodayShamsi()
      const endDate = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
      const res = await fetch(`/api/appointments/${apt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...apt, status: 'ended', endDate }),
      })
      if (res.ok) {
        toast({ title: 'انتصاب پایان یافت' })
        fetchAppointments()
      }
    } catch (err) {
      toast({ title: 'خطا در پایان انتصاب', variant: 'destructive' })
    }
  }, [fetchAppointments, toast])

  const handleFormSubmit = useCallback(async (data: Record<string, unknown>) => {
    try {
      if (editingAppointment) {
        const res = await fetch(`/api/appointments/${editingAppointment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          toast({ title: 'انتصاب بروزرسانی شد' })
          setShowForm(false)
          setEditingAppointment(null)
          fetchAppointments()
        } else {
          const result = await res.json()
          toast({ title: result.error || 'خطا در بروزرسانی', variant: 'destructive' })
        }
      } else {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          toast({ title: 'انتصاب جدید ثبت شد' })
          setShowForm(false)
          fetchAppointments()
        } else {
          const result = await res.json()
          toast({ title: result.error || 'خطا در ثبت انتصاب', variant: 'destructive' })
        }
      }
    } catch (err) {
      toast({ title: 'خطا در ثبت اطلاعات', variant: 'destructive' })
    }
  }, [editingAppointment, fetchAppointments, toast])

  // Stats
  const activeAppointments = appointments.filter(a => a.status === 'active')
  const endedAppointments = appointments.filter(a => a.status === 'ended')
  const mainAppointments = activeAppointments.filter(a => a.type === 'اصلی')
  const tempAppointments = activeAppointments.filter(a => a.type === 'موقت' || a.type === 'Acting')
  const supervisorAppointments = activeAppointments.filter(a => a.type === 'سرپرست')

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">در حال بارگذاری انتصابات...</span>
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
            <UserCheck className="w-5 h-5 text-emerald-600" />
            احکام شغلی
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت انتصاب کارکنان در پست‌های سازمانی
          </p>
        </div>
        <Button onClick={() => { setEditingAppointment(null); setShowForm(true) }} className="gap-2">
          <Plus className="w-4 h-4" />
          ثبت انتصاب جدید
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="انتصاب فعال"
          value={activeAppointments.length}
          icon={UserCheck}
          gradient="from-emerald-500 to-teal-500"
          iconBg="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="اصلی"
          value={mainAppointments.length}
          icon={Briefcase}
          gradient="from-sky-500 to-blue-500"
          iconBg="bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title="سرپرست / موقت"
          value={supervisorAppointments.length + tempAppointments.length}
          icon={ArrowUpDown}
          gradient="from-amber-500 to-orange-500"
          iconBg="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="پایان‌یافته"
          value={endedAppointments.length}
          icon={Calendar}
          gradient="from-slate-400 to-slate-500"
          iconBg="bg-slate-100 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="appointments" className="space-y-4" dir="rtl">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="appointments" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            احکام شغلی
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            فعال
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            آمار
          </TabsTrigger>
        </TabsList>

        {/* ===================== احکام شغلی Tab ===================== */}
        <TabsContent value="appointments" className="space-y-4">
          {/* Search & Filters + View Toggle */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجو نام کارمند، شماره حکم..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="نوع انتصاب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه انواع</SelectItem>
                    <SelectItem value="اصلی">اصلی</SelectItem>
                    <SelectItem value="سرپرست">سرپرست</SelectItem>
                    <SelectItem value="موقت">موقت</SelectItem>
                    <SelectItem value="Acting">سرپرست موقت</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="ended">پایان‌یافته</SelectItem>
                    <SelectItem value="cancelled">لغوشده</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setViewMode('table')}
                    title="نمایش جدول"
                  >
                    <List className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setViewMode('card')}
                    title="نمایش کارت"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <UserCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="text-sm font-medium text-muted-foreground">انتصابی یافت نشد</h3>
                <p className="text-xs text-muted-foreground mt-1">فیلتر جستجو را تغییر دهید یا انتصاب جدید ثبت کنید</p>
                <Button onClick={() => { setEditingAppointment(null); setShowForm(true) }} className="mt-4 gap-2" size="sm">
                  <Plus className="w-4 h-4" />
                  ثبت انتصاب جدید
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'card' ? (
            <AppointmentCardView
              appointments={appointments}
              onView={setViewingAppointment}
              onEdit={handleEdit}
              onEnd={handleEndAppointment}
              onDelete={setDeleteConfirm}
            />
          ) : (
            <AppointmentTableView
              appointments={appointments}
              onView={setViewingAppointment}
              onEdit={handleEdit}
              onEnd={handleEndAppointment}
              onDelete={setDeleteConfirm}
            />
          )}
        </TabsContent>

        {/* ===================== فعال Tab ===================== */}
        <TabsContent value="active">
          <ActiveTab
            appointments={appointments}
            onView={setViewingAppointment}
            onEdit={handleEdit}
            onEnd={handleEndAppointment}
            onDelete={setDeleteConfirm}
          />
        </TabsContent>

        {/* ===================== آمار Tab ===================== */}
        <TabsContent value="statistics">
          <StatisticsTab appointments={appointments} />
        </TabsContent>
      </Tabs>

      {/* Appointment Form Dialog */}
      <AppointmentFormDialog
        key={editingAppointment?.id || 'new'}
        open={showForm}
        onClose={() => { setShowForm(false); setEditingAppointment(null) }}
        onSubmit={handleFormSubmit}
        appointment={editingAppointment}
        employees={employees}
        positions={positions}
      />

      {/* Appointment Detail Dialog */}
      <AppointmentDetailDialog
        open={!!viewingAppointment}
        onClose={() => setViewingAppointment(null)}
        appointment={viewingAppointment}
        onEdit={handleEdit}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              تایید لغو انتصاب
            </DialogTitle>
            <DialogDescription>
              آیا از لغو انتصاب {deleteConfirm?.employee.firstName} {deleteConfirm?.employee.lastName} در پست {deleteConfirm?.position.title} اطمینان دارید؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>انصراف</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              لغو انتصاب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
