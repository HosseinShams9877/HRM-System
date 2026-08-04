'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  BarChart3, Search, Plus, Edit2, Trash2, Star, User,
  LayoutGrid, List, Eye, CheckCircle2, Clock, Target,ChevronRight, ChevronLeft
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Progress } from '@/core/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Skeleton } from '@/core/components/ui/skeleton'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { toast } from 'sonner'
import { toPersianDigits } from '@/core/lib/utils-fa'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import type { Employee, Performance, FormData } from '../index'
import { STATUS_MAP, KPI_LABELS, scoreColor, initialForm } from '../constants'
import { PerformanceFormDialog } from './performance-form-dialog'
import { PerformanceDetailDialog } from './performance-detail-dialog'
import { StatisticsTab } from './statistics-tab'

// ============================================
// Component
// ============================================

export function PerformanceModule() {
  const [items, setItems] = useState<Performance[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Performance | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [detailItem, setDetailItem] = useState<Performance | null>(null)
  const [form, setForm] = useState<FormData>({ ...initialForm })
  const [employees, setEmployees] = useState<Employee[]>([])

  // Filters & View
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')
  const [kpiEmployeeId, setKpiEmployeeId] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 7

  // ---- Data Fetching ----

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/performance')
      if (res.ok) {
        const result = await res.json()
        // Handle both old (array) and new ({ data, pagination }) format
        const items = Array.isArray(result) ? result : (result.data || [])
        setItems(items)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchItems()
    fetch('/api/employees?status=active')
      .then(r => r.ok ? r.json() : [])
      .then(result => {
        const d = Array.isArray(result) ? result : (result.data || result.employees || [])
        setEmployees(d)
      })
      .catch(() => {})
  }, [fetchItems])
useEffect(() => {
  setCurrentPage(1)
}, [search, statusFilter, periodFilter])
  // ---- Computed Data ----

  const periods = useMemo(() => {
    const set = new Set(items.map(i => i.period))
    return Array.from(set).sort().reverse()
  }, [items])

  const filtered = useMemo(() => {
    return items.filter(i => {
      const name = `${i.employee?.firstName} ${i.employee?.lastName}`
      const matchSearch = name.includes(search) || i.period.includes(search)
      const matchStatus = statusFilter === 'all' || i.status === statusFilter
      const matchPeriod = periodFilter === 'all' || i.period === periodFilter
      return matchSearch && matchStatus && matchPeriod
    })
  }, [items, search, statusFilter, periodFilter])

const paginatedItems = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filtered.slice(startIndex, endIndex)
}, [filtered, currentPage, itemsPerPage])

const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const stats = useMemo(() => {
    const total = items.length
    const metTarget = items.filter(i => i.score >= i.target).length
    const needImprovement = items.filter(i => i.score < i.target * 0.7).length
    const avgScore = total ? items.reduce((s, i) => s + i.score, 0) / total : 0
    const maxScore = total ? Math.max(...items.map(i => i.score)) : 0
    const minScore = total ? Math.min(...items.map(i => i.score)) : 0
    const targetRate = total ? Math.round((metTarget / total) * 100) : 0
    return { total, metTarget, needImprovement, avgScore, maxScore, minScore, targetRate }
  }, [items])

  // ---- Radar chart data for KPI tab ----

  const kpiChartData = useMemo(() => {
    const selectedItems = kpiEmployeeId === 'all'
      ? items
      : items.filter(i => i.employeeId === kpiEmployeeId)

    if (selectedItems.length === 0) return []

    // Average of all KPIs
    const avgKpi = (key: 'kpi1' | 'kpi2' | 'kpi3' | 'kpi4') => {
      const vals = selectedItems.map(i => i[key]).filter((v): v is number => v !== null)
      return vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : 0
    }

    const avgTarget = selectedItems.reduce((s, i) => s + i.target, 0) / selectedItems.length

    return [
      { dimension: 'توانایی فنی', score: avgKpi('kpi1'), target: avgTarget, fullMark: 5 },
      { dimension: 'روابط انسانی', score: avgKpi('kpi2'), target: avgTarget, fullMark: 5 },
      { dimension: 'نوآوری', score: avgKpi('kpi3'), target: avgTarget, fullMark: 5 },
      { dimension: 'رهبری', score: avgKpi('kpi4'), target: avgTarget, fullMark: 5 },
    ]
  }, [items, kpiEmployeeId])

  const kpiComparisonTable = useMemo(() => {
    const selectedItems = kpiEmployeeId === 'all'
      ? items
      : items.filter(i => i.employeeId === kpiEmployeeId)

    if (selectedItems.length === 0) return []

    const avgKpi = (key: 'kpi1' | 'kpi2' | 'kpi3' | 'kpi4') => {
      const vals = selectedItems.map(i => i[key]).filter((v): v is number => v !== null)
      return vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : null
    }

    const avgTarget = selectedItems.reduce((s, i) => s + i.target, 0) / selectedItems.length

    const keys: ('kpi1' | 'kpi2' | 'kpi3' | 'kpi4')[] = ['kpi1', 'kpi2', 'kpi3', 'kpi4']
    return keys.map(key => {
      const score = avgKpi(key)
      const gap = score !== null ? +(score - avgTarget).toFixed(2) : null
      return {
        key,
        label: KPI_LABELS[key],
        score,
        target: +avgTarget.toFixed(2),
        gap,
        status: gap !== null ? (gap >= 0 ? 'تحقق' : gap >= -1 ? 'نزدیک به هدف' : 'نیاز به بهبود') : 'بدون داده',
      }
    })
  }, [items, kpiEmployeeId])

  // ---- Dialogs ----

  const openDialog = (item?: Performance) => {
    if (item) {
      setEditing(item)
      setForm({
        employeeId: item.employeeId,
        period: item.period,
        score: item.score,
        target: item.target,
        kpi1: item.kpi1,
        kpi2: item.kpi2,
        kpi3: item.kpi3,
        kpi4: item.kpi4,
        comments: item.comments || '',
        status: item.status,
      })
    } else {
      setEditing(null)
      setForm({ ...initialForm })
    }
    setShowDialog(true)
  }

  const save = async () => {
    if (!form.employeeId || !form.period) return
    setSaving(true)
    try {
      // Auto-calculate score from KPIs if any KPI is filled
      const kpiValues = [form.kpi1, form.kpi2, form.kpi3, form.kpi4].filter((v): v is number => v !== null && v > 0)
      const finalScore = kpiValues.length > 0
        ? +(kpiValues.reduce((s, v) => s + v, 0) / kpiValues.length).toFixed(2)
        : form.score

      const payload = {
        employeeId: form.employeeId,
        period: form.period,
        score: finalScore,
        target: form.target,
        kpi1: form.kpi1,
        kpi2: form.kpi2,
        kpi3: form.kpi3,
        kpi4: form.kpi4,
        comments: form.comments || null,
        status: form.status,
      }
      const url = editing ? `/api/performance/${editing.id}` : '/api/performance'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) { await fetchItems(); setShowDialog(false); toast.success(editing ? 'ارزیابی بروزرسانی شد' : 'ارزیابی ایجاد شد') }
    } catch (e) { console.error(e); toast.error('خطا در ذخیره‌سازی') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    const id = deleteDialog.id
    if (!id) return
    try { await fetch(`/api/performance/${id}`, { method: 'DELETE' }); await fetchItems(); toast.success('ارزیابی حذف شد') }
    catch (e) { console.error(e); toast.error('خطا در حذف') }
    finally { setDeleteDialog({ open: false, id: null }) }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/performance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
        if (res.ok) {
        await fetchItems()
        if (detailItem?.id === id) {
          const updated = await fetch(`/api/performance/${id}`).then(r => r.json())
          setDetailItem(updated)
        }
        toast.success('وضعیت بروزرسانی شد')
      }
    } catch (e) { console.error(e); toast.error('خطا در تغییر وضعیت') }
  }

  // ============================================
  // Loading State
  // ============================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[60px] rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">ارزیابی عملکرد</h2>
            <p className="text-xs text-muted-foreground">مدیریت شاخص‌ها و ارزیابی کارکنان</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => openDialog()}>
          <Plus className="w-3.5 h-3.5" /> ارزیابی جدید
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" dir="rtl" className="w-full">
        <TabsList className="w-fit">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5" /> نمای کلی
          </TabsTrigger>
          <TabsTrigger value="kpi" className="text-xs gap-1.5">
            <Target className="w-3.5 h-3.5" /> جزئیات KPI
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> آمار
          </TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* Overview Tab */}
        {/* ============================================ */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{toPersianDigits(stats.total)}</div>
                <div className="text-[10px] text-muted-foreground mt-1">کل ارزیابی‌ها</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{toPersianDigits(stats.metTarget)}</div>
                <div className="text-[10px] text-muted-foreground mt-1">تحقق هدف</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{toPersianDigits(stats.needImprovement)}</div>
                <div className="text-[10px] text-muted-foreground mt-1">نیاز به بهبود</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{toPersianDigits(+stats.avgScore.toFixed(1))}</div>
                <div className="text-[10px] text-muted-foreground mt-1">میانگین نمره</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="جستجوی نام یا دوره..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 w-[200px] text-xs pr-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="completed">تکمیل شده</SelectItem>
                  <SelectItem value="reviewed">بررسی شده</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="دوره" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دوره‌ها</SelectItem>
                  {periods.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('table')}
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-xl" />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">ارزیابی‌ای یافت نشد</h3>
              <p className="text-sm text-muted-foreground mt-1">فیلتر را تغییر دهید یا ارزیابی جدید ایجاد کنید</p>
              <Button className="mt-4" onClick={() => openDialog()}>
                <Plus className="w-4 h-4 ml-2" />
                ایجاد ارزیابی جدید
              </Button>
            </div>
          ) : viewMode === 'card' ? (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedItems.map(item => {
                const progressPct = Math.min((item.score / 5) * 100, 100)
                const targetPct = Math.min((item.target / 5) * 100, 100)
                const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.pending
                const StatusIcon = statusInfo.icon
                return (
                  <Card
                    key={item.id}
                    className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setDetailItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.employee?.firstName} {item.employee?.lastName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {item.employee?.department && `${item.employee.department} · `}دوره: {item.period}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {/* Score & Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Star className={`w-4 h-4 ${scoreColor(item.score, item.target)}`} />
                            <span className={`text-lg font-bold ${scoreColor(item.score, item.target)}`}>
                              {toPersianDigits(item.score)}
                            </span>
                            <span className="text-xs text-muted-foreground">/ {toPersianDigits(item.target)}</span>
                          </div>
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openDialog(item)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDeleteDialog({ open: true, id: item.id })}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={progressPct} className="h-2" />
                          {targetPct > 0 && (
                            <div
                              className="absolute top-0 h-2 w-0.5 bg-gray-800 dark:bg-gray-300"
                              style={{ left: `${targetPct}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* Table View */
            <Card className="border-0 shadow-sm">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs text-right w-[22%]">کارمند</TableHead>
                    <TableHead className="text-xs text-right w-[13%]">دوره</TableHead>
                    <TableHead className="text-xs text-right w-[13%]">نمره کل</TableHead>
                    <TableHead className="text-xs text-right w-[13%]">هدف</TableHead>
                    <TableHead className="text-xs text-right w-[19%]">وضعیت</TableHead>
                    <TableHead className="text-xs text-right w-[20%]">اقدامات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map(item => {
                    const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.pending
                    const StatusIcon = statusInfo.icon
                    return (
                      <TableRow key={item.id} className="cursor-pointer" onClick={() => setDetailItem(item)}>
                        <TableCell className="text-xs w-[22%]">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{item.employee?.firstName} {item.employee?.lastName}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{item.employee?.department || '-'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs w-[13%]">{item.period}</TableCell>
                        <TableCell className="text-xs w-[13%]">
                          <span className={`font-bold ${scoreColor(item.score, item.target)}`}>
                            {toPersianDigits(item.score)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs w-[13%]">{toPersianDigits(item.target)}</TableCell>
                        <TableCell className="text-xs w-[19%]">
                          <Badge variant="outline" className={`text-[10px] ${statusInfo.color} whitespace-nowrap`}>
                            <StatusIcon className="w-3 h-3 ml-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs w-[20%]">
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDetailItem(item)}>
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openDialog(item)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDeleteDialog({ open: true, id: item.id })}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        {/* Pagination */}
{filtered.length > itemsPerPage && (
  <div className="flex items-center justify-center gap-4 px-2 py-3">
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage(pageNum)}
              className={`h-8 w-8 p-0 text-sm ${
                currentPage === pageNum 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {toPersianDigits(pageNum)}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage >= totalPages}
        className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
    
    <p className="text-sm text-gray-500 dark:text-gray-400">
      نمایش {toPersianDigits(paginatedItems.length)} از {toPersianDigits(filtered.length)} ارزیابی
    </p>
  </div>
)}
        </TabsContent>

        {/* ============================================ */}
        {/* KPI Details Tab */}
        {/* ============================================ */}
        <TabsContent value="kpi" className="space-y-4">
          {/* Employee Selector */}
          <div className="flex items-center gap-3">
            <Label className="text-xs font-medium whitespace-nowrap">انتخاب کارمند:</Label>
            <Select value={kpiEmployeeId} onValueChange={setKpiEmployeeId}>
              <SelectTrigger className="h-8 w-[220px] text-xs">
                <SelectValue placeholder="همه کارکنان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه کارکنان</SelectItem>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {kpiChartData.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground mb-2">داده KPI موجود نیست</p>
                <p className="text-xs text-muted-foreground">برای نمایش نمودار رادار، لطفاً نمرات شاخص‌های کلیدی را در ارزیابی وارد کنید.</p>
                <Button size="sm" className="mt-4 gap-1.5 text-xs" onClick={() => openDialog()}>
                  <Plus className="w-3.5 h-3.5" /> افزودن ارزیابی با KPI
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Radar Chart */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-purple-600" />
                    نمودار رادار شاخص‌های کلیدی
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={kpiChartData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                      <Radar name="نمره" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      <Radar name="هدف" dataKey="target" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeDasharray="5 5" />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* KPI Comparison Table */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm font-medium flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    مقایسه شاخص‌ها با هدف
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs text-right">شاخص</TableHead>
                        <TableHead className="text-xs text-right">نمره</TableHead>
                        <TableHead className="text-xs text-right">هدف</TableHead>
                        <TableHead className="text-xs text-right">شکاف</TableHead>
                        <TableHead className="text-xs text-right">وضعیت</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpiComparisonTable.map(row => (
                        <TableRow key={row.key}>
                          <TableCell className="text-xs font-medium">{row.label}</TableCell>
                          <TableCell className="text-xs">
                            {row.score !== null ? (
                              <span className={scoreColor(row.score, row.target)}>
                                {toPersianDigits(row.score)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">{toPersianDigits(row.target)}</TableCell>
                          <TableCell className="text-xs">
                            {row.gap !== null ? (
                              <span className={row.gap >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {row.gap >= 0 ? '+' : ''}{toPersianDigits(row.gap)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                row.status === 'تحقق' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                row.status === 'نزدیک به هدف' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                row.status === 'نیاز به بهبود' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-gray-100 text-gray-500 border-gray-200'
                              }`}
                            >
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        
        </TabsContent>

        {/* ============================================ */}
        {/* Statistics Tab */}
        {/* ============================================ */}
        <TabsContent value="stats" className="space-y-4">
          <StatisticsTab items={items} />
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog */}
      <PerformanceFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editing={editing}
        form={form}
        onFormChange={setForm}
        employees={employees}
        saving={saving}
        onSave={save}
      />

      {/* Detail Dialog */}
      <PerformanceDetailDialog
        open={!!detailItem}
        onOpenChange={(open) => { if (!open) setDetailItem(null) }}
        detailItem={detailItem}
        onEdit={(item) => openDialog(item)}
        onStatusChange={handleStatusChange}
        onDelete={(id) => setDeleteDialog({ open: true, id })}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(o) => setDeleteDialog({ open: o, id: null })}
        title="حذف ارزیابی"
        description="آیا از حذف این ارزیابی اطمینان دارید؟ این عمل قابل بازگشت نیست."
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="حذف"
      />
    </div>
  )
}
