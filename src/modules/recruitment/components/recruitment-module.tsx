// src/modules/recruitment/components/recruitment-module.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  UserPlus, Search, Plus, Edit2, Trash2, Briefcase, Users, Building2, 
  LayoutGrid, List, BarChart3, Kanban, Loader2, TrendingUp, CheckCircle2, 
  AlertTriangle, CalendarDays, Eye, X 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/core/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Separator } from '@/core/components/ui/separator'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/core/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { PositionFormDialog } from './position-form-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { StatisticsTab } from './statistics-tab'
import { PipelineTab } from './pipeline-tab'
import { PositionsTab } from './positions-tab'

// ============================================
// Types
// ============================================

interface Recruitment {
  id: string
  title: string
  department: string | null
  position: string | null
  status: string
  applicants: number
  createdAt: string
  updatedAt: string
}

// ============================================
// Constants
// ============================================

export const STATUS_MAP: Record<string, { label: string; color: string; headerBg: string; headerText: string; dotColor: string }> = {
  open: {
    label: 'باز',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    headerBg: 'bg-emerald-500',
    headerText: 'text-white',
    dotColor: 'bg-emerald-500',
  },
  interviewing: {
    label: 'مصاحبه',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    headerBg: 'bg-blue-500',
    headerText: 'text-white',
    dotColor: 'bg-blue-500',
  },
  offered: {
    label: 'پیشنهاد شغل',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    headerBg: 'bg-purple-500',
    headerText: 'text-white',
    dotColor: 'bg-purple-500',
  },
  hired: {
    label: 'استخدام شده',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    headerBg: 'bg-sky-500',
    headerText: 'text-white',
    dotColor: 'bg-sky-500',
  },
  closed: {
    label: 'بسته شده',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300',
    headerBg: 'bg-gray-500',
    headerText: 'text-white',
    dotColor: 'bg-gray-500',
  },
}

export const STATUS_FILTER_OPTIONS = [
  { key: 'all', label: 'همه' },
  { key: 'open', label: 'باز' },
  { key: 'interviewing', label: 'مصاحبه' },
  { key: 'offered', label: 'پیشنهاد شغل' },
  { key: 'hired', label: 'استخدام شده' },
  { key: 'closed', label: 'بسته شده' },
]

export const PIPELINE_COLUMNS = ['open', 'interviewing', 'offered', 'hired', 'closed'] as const
export const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#0ea5e9', '#6b7280']

// ============================================
// Main Component
// ============================================

export function RecruitmentModule() {
  const [items, setItems] = useState<Recruitment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('positions')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<Recruitment | null>(null)
  const [deleteItem, setDeleteItem] = useState<Recruitment | null>(null)
  const [saving, setSaving] = useState(false)

  const { toast } = useToast()

  // ============================================
  // Fetch
  // ============================================

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/recruitment?${params.toString()}`)
      if (res.ok) {
        const result = await res.json()
        setItems(Array.isArray(result) ? result : (result.data || []))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchItems() }, [fetchItems])

  // ============================================
  // CRUD
  // ============================================

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const url = editingItem ? `/api/recruitment/${editingItem.id}` : '/api/recruitment'
      const method = editingItem ? 'PUT' : 'POST'
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      })
      if (res.ok) {
        toast({ title: editingItem ? 'موقعیت بروزرسانی شد' : 'موقعیت با موفقیت ایجاد شد' })
        setShowFormDialog(false)
        setEditingItem(null)
        fetchItems()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(`/api/recruitment/${deleteItem.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'موقعیت حذف شد' })
        fetchItems()
      } else {
        toast({ title: 'خطا در حذف', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط', variant: 'destructive' })
    } finally {
      setDeleteItem(null)
    }
  }

  const openFormDialog = (item?: Recruitment) => {
    setEditingItem(item || null)
    setShowFormDialog(true)
  }

  
  // ============================================
  // Stats
  // ============================================

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === 'open').length,
    interviewing: items.filter(i => i.status === 'interviewing').length,
    totalApplicants: items.reduce((s, i) => s + i.applicants, 0),
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">جذب و استخدام</h2>
            <p className="text-xs text-muted-foreground">مدیریت فرآیند جذب نیروی جدید</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{toPersianDigits(stats.open)} موقعیت باز</Badge>
          <Badge variant="outline" className="text-xs">{toPersianDigits(stats.totalApplicants)} متقاضی</Badge>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'کل موقعیت‌ها', value: stats.total, icon: Briefcase, iconColor: 'text-emerald-600' },
          { label: 'باز', value: stats.open, icon: Eye, iconColor: 'text-blue-600' },
          { label: 'در مصاحبه', value: stats.interviewing, icon: Users, iconColor: 'text-purple-600' },
          { label: 'کل متقاضیان', value: stats.totalApplicants, icon: UserPlus, iconColor: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <div className="text-2xl font-bold">{toPersianDigits(s.value)}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="positions" className="gap-1.5 text-xs">
            <span>📋</span> موقعیت‌ها
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-1.5 text-xs">
            <span>📊</span> پایپ‌لاین
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-1.5 text-xs">
            <span>📈</span> آمار
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <PositionsTab
            items={items}
            loading={loading}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAdd={() => openFormDialog()}
            onEdit={openFormDialog}
            onDelete={setDeleteItem}
          />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              موقعیت‌ها بر اساس وضعیت در ستون‌های مختلف نمایش داده می‌شوند. برای ویرایش روی هر کارت کلیک کنید.
            </p>
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => openFormDialog()}>
              <span>➕</span> افزودن موقعیت
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-4xl block mb-3 opacity-30">📊</span>
              <p className="text-sm">موقعیتی برای نمایش پایپ‌لاین وجود ندارد</p>
            </div>
          ) : (
            <PipelineTab items={items} onEdit={openFormDialog} />
          )}
        </TabsContent>

        <TabsContent value="statistics">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
          ) : (
            <StatisticsTab items={items} />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PositionFormDialog
        open={showFormDialog}
        onClose={() => { setShowFormDialog(false); setEditingItem(null) }}
        onSubmit={handleSave}
        initialData={editingItem}
      />

      <DeleteConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        item={deleteItem}
      />
    </div>
  )
}

export default RecruitmentModule