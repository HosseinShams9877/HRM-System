'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Briefcase, Search, Plus, Edit, Trash2, Eye, MoreVertical,
  Users, Loader2, AlertCircle, Building2,
  LayoutGrid, List,
  UserCheck, UserX, BarChart3,
  Layers, Hash
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/core/components/ui/dropdown-menu'
import { Progress } from '@/core/components/ui/progress'
import { Separator } from '@/core/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { ToggleGroup, ToggleGroupItem } from '@/core/components/ui/toggle-group'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'

import { PositionFormDialog } from '../positions/components/position-form-dialog'
import { PositionDetailDialog, PositionStatusBadge, LevelBadge } from '../positions/components/position-detail-dialog'
import { StatisticsTab } from '../positions/components/statistics-tab'
import { LEVEL_COLORS, LEVEL_BORDER_COLORS } from '../positions/constants'
import type { Department, Position } from '../positions/types/types'

// ============================================
// Fill Rate Progress
// ============================================

function FillRateProgress({ occupied, total }: { occupied: number; total: number }) {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0
  const colorClass =
    pct >= 90 ? 'bg-red-500' :
    pct >= 70 ? 'bg-amber-500' :
    'bg-emerald-500'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">
          {toPersianDigits(occupied)} از {toPersianDigits(total)} نفر
        </span>
        <span className="font-medium">{toPersianDigits(pct)}٪</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// Stat Card Component
// ============================================

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
}: {
  title: string
  value: string
  icon: React.ElementType
  gradient: string
  iconBg: string
  iconColor: string
}) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden relative">
      <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`} />
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-[11px] text-muted-foreground">{title}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Main Positions Module
// ============================================

export function PositionsModule() {
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [viewingPosition, setViewingPosition] = useState<Position | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Position | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [activeTab, setActiveTab] = useState('positions')
  const { toast } = useToast()

  const fetchPositions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (levelFilter && levelFilter !== 'all') params.set('level', levelFilter)

      const res = await fetch(`/api/positions?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setPositions(data)
      }
    } catch (err) {
      console.error('Fetch positions error:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, levelFilter])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        setDepartments(data)
      }
    } catch (err) {
      console.error('Fetch departments error:', err)
    }
  }, [])

  useEffect(() => {
    fetchPositions()
    fetchDepartments()
  }, [fetchPositions, fetchDepartments])

  // Stats
  const totalActive = positions.filter(p => p.status === 'active').length
  const totalOccupied = positions.reduce((sum, p) => sum + p.occupiedCount, 0)
  const totalCapacity = positions.reduce((sum, p) => sum + p.headcount, 0)
  const totalVacant = totalCapacity - totalOccupied

  // Chart data - by department
  const departmentChartData = useMemo(() => {
    const deptMap: Record<string, { name: string; فعال: number; خالی: number }> = {}
    positions.forEach(p => {
      const deptName = p.department?.name || 'بدون دپارتمان'
      if (!deptMap[deptName]) {
        deptMap[deptName] = { name: deptName, فعال: 0, خالی: 0 }
      }
      deptMap[deptName].فعال += p.occupiedCount
      deptMap[deptName].خالی += p.availableCount
    })
    return Object.values(deptMap)
  }, [positions])

  // Chart data - by level
  const levelChartData = useMemo(() => {
    const levelMap: Record<string, number> = { 'ارشد': 0, 'میانره': 0, 'مبتدی': 0, 'بدون سطح': 0 }
    positions.forEach(p => {
      const key = p.level || 'بدون سطح'
      levelMap[key] = (levelMap[key] || 0) + 1
    })
    return Object.entries(levelMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  }, [positions])

  // Fill rate per position for chart
  const fillRateChartData = useMemo(() => {
    return positions
      .filter(p => p.status === 'active')
      .map(p => ({
        name: p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title,
        fillRate: p.headcount > 0 ? Math.round((p.occupiedCount / p.headcount) * 100) : 0,
        occupied: p.occupiedCount,
        capacity: p.headcount,
      }))
      .sort((a, b) => b.fillRate - a.fillRate)
      .slice(0, 10)
  }, [positions])

  // Edit
  const handleEdit = (pos: Position) => {
    setEditingPosition(pos)
    setShowForm(true)
  }

  // Delete
  const handleDelete = useCallback(async (pos: Position) => {
    try {
      const res = await fetch(`/api/positions/${pos.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'پست سازمانی غیرفعال شد' })
        fetchPositions()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'خطا در حذف', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'خطا در حذف پست', variant: 'destructive' })
    }
    setDeleteConfirm(null)
  }, [fetchPositions, toast])

  // Submit form
  const handleFormSubmit = useCallback(async (data: Record<string, unknown>) => {
    try {
      if (editingPosition) {
        const res = await fetch(`/api/positions/${editingPosition.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          toast({ title: 'پست سازمانی بروزرسانی شد' })
          setShowForm(false)
          setEditingPosition(null)
          fetchPositions()
        } else {
          const result = await res.json()
          toast({ title: result.error || 'خطا در بروزرسانی', variant: 'destructive' })
        }
      } else {
        const res = await fetch('/api/positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          toast({ title: 'پست سازمانی جدید ثبت شد' })
          setShowForm(false)
          fetchPositions()
        } else {
          const result = await res.json()
          toast({ title: result.error || 'خطا در ثبت', variant: 'destructive' })
        }
      }
    } catch (err) {
      toast({ title: 'خطا در ثبت اطلاعات', variant: 'destructive' })
    }
  }, [editingPosition, fetchPositions, toast])

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">در حال بارگذاری پست‌های سازمانی...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            پست‌های سازمانی
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت و تعریف پست‌های سازمانی و ساختار شغلی
          </p>
        </div>
        <Button onClick={() => { setEditingPosition(null); setShowForm(true) }} className="gap-2">
          <Plus className="w-4 h-4" />
          ثبت پست جدید
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="کل پست‌ها"
          value={toPersianDigits(positions.length)}
          icon={Layers}
          gradient="bg-gradient-to-r from-emerald-400 to-teal-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="فعال"
          value={toPersianDigits(totalActive)}
          icon={UserCheck}
          gradient="bg-gradient-to-r from-sky-400 to-blue-500"
          iconBg="bg-sky-50 dark:bg-sky-950/30"
          iconColor="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title="پر شده"
          value={toPersianDigits(totalOccupied)}
          icon={Users}
          gradient="bg-gradient-to-r from-purple-400 to-violet-500"
          iconBg="bg-purple-50 dark:bg-purple-950/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="خالی"
          value={toPersianDigits(totalVacant)}
          icon={UserX}
          gradient="bg-gradient-to-r from-amber-400 to-orange-500"
          iconBg="bg-amber-50 dark:bg-amber-950/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="positions" className="gap-1.5">
            <Briefcase className="w-4 h-4" />
            پست‌های سازمانی
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="gap-1.5">
            <Users className="w-4 h-4" />
            اشغال
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-1.5">
            <BarChart3 className="w-4 h-4" />
            آمار
          </TabsTrigger>
        </TabsList>

        {/* ============ Tab 1: Positions ============ */}
        <TabsContent value="positions" className="space-y-4">
          {/* Search & Filters + View Toggle */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجو عنوان یا کد پست..."
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
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="inactive">غیرفعال</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="سطح" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه سطوح</SelectItem>
                    <SelectItem value="ارشد">ارشد</SelectItem>
                    <SelectItem value="میانره">میانره</SelectItem>
                    <SelectItem value="مبتدی">مبتدی</SelectItem>
                  </SelectContent>
                </Select>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(v) => { if (v) setViewMode(v as 'card' | 'table') }}
                  variant="outline"
                  size="sm"
                >
                  <ToggleGroupItem value="card" aria-label="نمای کارت">
                    <LayoutGrid className="w-4 h-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="table" aria-label="نمای جدول">
                    <List className="w-4 h-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>

          {/* Positions Content */}
          {positions.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="text-sm font-medium text-muted-foreground">پست سازمانی یافت نشد</h3>
                <p className="text-xs text-muted-foreground mt-1">فیلتر جستجو را تغییر دهید یا پست جدید ثبت کنید</p>
                <Button onClick={() => { setEditingPosition(null); setShowForm(true) }} className="mt-4 gap-2" size="sm">
                  <Plus className="w-4 h-4" />
                  ثبت پست جدید
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'card' ? (
            /* ===== Card View ===== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map(pos => {
                const levelGradient = LEVEL_BORDER_COLORS[pos.level || ''] || 'bg-gradient-to-r from-emerald-400 to-teal-500'
                return (
                  <Card
                    key={pos.id}
                    className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm cursor-pointer overflow-hidden"
                    onClick={() => setViewingPosition(pos)}
                  >
                    {/* Gradient top border by level */}
                    <div className={`h-1.5 w-full ${levelGradient}`} />

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${LEVEL_COLORS[pos.level || ''] || 'from-emerald-400 to-teal-500'} flex items-center justify-center`}>
                            <Briefcase className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">{pos.title}</h3>
                            <p className="text-[11px] text-muted-foreground font-mono" dir="ltr">{pos.code}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="min-w-[140px]">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewingPosition(pos) }}>
                              <Eye className="w-3.5 h-3.5 ml-2" /> مشاهده
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(pos) }}>
                              <Edit className="w-3.5 h-3.5 ml-2" /> ویرایش
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteConfirm(pos) }} className="text-red-600">
                              <Trash2 className="w-3.5 h-3.5 ml-2" /> حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Info rows */}
                      <div className="space-y-1.5 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          <span>{pos.department?.name || 'بدون دپارتمان'}</span>
                        </div>
                        {pos.jobGrade && (
                          <div className="flex items-center gap-2">
                            <Hash className="w-3 h-3" />
                            <span>گروه شغلی: {pos.jobGrade}</span>
                          </div>
                        )}
                      </div>

                      {/* Level Badge */}
                      <div className="mt-2 flex items-center gap-2">
                        <LevelBadge level={pos.level} />
                        {pos.availableCount > 0 && (
                          <Badge variant="outline" className="text-[10px] text-emerald-600">
                            {toPersianDigits(pos.availableCount)} جای خالی
                          </Badge>
                        )}
                      </div>

                      {/* Fill Rate */}
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <FillRateProgress occupied={pos.occupiedCount} total={pos.headcount} />
                        {pos.minSalary && pos.maxSalary && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-muted-foreground">
                              {formatCurrency(pos.minSalary)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">تا</span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatCurrency(pos.maxSalary)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* ===== Table View ===== */
            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">عنوان پست</TableHead>
                    <TableHead className="text-right">کد</TableHead>
                    <TableHead className="text-right">دپارتمان</TableHead>
                    <TableHead className="text-right">سطح</TableHead>
                    <TableHead className="text-right">گروه شغلی</TableHead>
                    <TableHead className="text-right">ظرفیت</TableHead>
                    <TableHead className="text-right">نرخ اشغال</TableHead>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map(pos => (
                    <TableRow
                      key={pos.id}
                      className="cursor-pointer"
                      onClick={() => setViewingPosition(pos)}
                    >
                      <TableCell className="font-medium">{pos.title}</TableCell>
                      <TableCell className="font-mono text-xs" dir="ltr">{pos.code}</TableCell>
                      <TableCell>{pos.department?.name || '—'}</TableCell>
                      <TableCell><LevelBadge level={pos.level} /></TableCell>
                      <TableCell>{pos.jobGrade || '—'}</TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {toPersianDigits(pos.occupiedCount)} / {toPersianDigits(pos.headcount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-20">
                          <Progress
                            value={pos.headcount > 0 ? (pos.occupiedCount / pos.headcount) * 100 : 0}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell><PositionStatusBadge status={pos.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setViewingPosition(pos)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEdit(pos)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            onClick={() => setDeleteConfirm(pos)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* ============ Tab 2: Occupancy ============ */}
        <TabsContent value="occupancy" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-emerald-600" />
                وضعیت اشغال پست‌های سازمانی
              </h3>
              {positions.filter(p => p.status === 'active').length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  پست فعالی یافت نشد
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {positions
                    .filter(p => p.status === 'active')
                    .sort((a, b) => {
                      const rateA = a.headcount > 0 ? a.occupiedCount / a.headcount : 0
                      const rateB = b.headcount > 0 ? b.occupiedCount / b.headcount : 0
                      return rateB - rateA
                    })
                    .map(pos => {
                      const fillPct = pos.headcount > 0 ? Math.round((pos.occupiedCount / pos.headcount) * 100) : 0
                      const barColor =
                        fillPct >= 90 ? 'bg-red-500' :
                        fillPct >= 70 ? 'bg-amber-500' :
                        'bg-emerald-500'

                      return (
                        <div
                          key={pos.id}
                          className="p-4 rounded-xl border border-border hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer"
                          onClick={() => setViewingPosition(pos)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${LEVEL_COLORS[pos.level || ''] || 'from-emerald-400 to-teal-500'} flex items-center justify-center`}>
                                <Briefcase className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold">{pos.title}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] text-muted-foreground">{pos.department?.name || 'بدون دپارتمان'}</span>
                                  <LevelBadge level={pos.level} />
                                </div>
                              </div>
                            </div>
                            <div className="text-left">
                              <span className={`text-lg font-bold ${fillPct >= 90 ? 'text-red-600' : fillPct >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {toPersianDigits(fillPct)}٪
                              </span>
                            </div>
                          </div>

                          {/* Fill bar */}
                          <div className="h-3 w-full rounded-full bg-muted overflow-hidden mb-3">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-emerald-600">
                                <UserCheck className="w-3 h-3" />
                                {toPersianDigits(pos.occupiedCount)} اشغال
                              </span>
                              <span className="flex items-center gap-1 text-amber-600">
                                <UserX className="w-3 h-3" />
                                {toPersianDigits(pos.availableCount)} خالی
                              </span>
                            </div>
                            <span className="text-muted-foreground">
                              ظرفیت کل: {toPersianDigits(pos.headcount)} نفر
                            </span>
                          </div>

                          {/* Employees list */}
                          {pos.appointments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="flex flex-wrap gap-2">
                                {pos.appointments.map((apt, i) => (
                                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50">
                                    <Avatar className="w-5 h-5">
                                      <AvatarFallback className="text-[8px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                        {apt.employee.firstName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] font-medium">
                                      {apt.employee.firstName} {apt.employee.lastName}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Tab 3: Statistics ============ */}
        <TabsContent value="statistics">
          <StatisticsTab
            positions={positions}
            totalOccupied={totalOccupied}
            totalVacant={totalVacant}
            totalCapacity={totalCapacity}
            departmentChartData={departmentChartData}
            levelChartData={levelChartData}
            fillRateChartData={fillRateChartData}
          />
        </TabsContent>
      </Tabs>

      {/* Position Form Dialog */}
      <PositionFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingPosition(null) }}
        onSubmit={handleFormSubmit}
        position={editingPosition}
        departments={departments}
      />

      {/* Position Detail Dialog */}
      <PositionDetailDialog
        open={!!viewingPosition}
        onClose={() => setViewingPosition(null)}
        position={viewingPosition}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              تایید حذف
            </DialogTitle>
            <DialogDescription>
              آیا از غیرفعال کردن پست «{deleteConfirm?.title}» اطمینان دارید؟
              {deleteConfirm && deleteConfirm.occupiedCount > 0 && (
                <span className="block mt-2 text-amber-600 text-xs">
                  این پست دارای {toPersianDigits(deleteConfirm.occupiedCount)} نیروی مشغول است.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>انصراف</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              غیرفعال کردن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
