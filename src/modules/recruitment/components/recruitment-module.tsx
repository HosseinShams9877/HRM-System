'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  UserPlus, Search, Plus, Edit2, Trash2, Briefcase, Users, Building2,
  LayoutGrid, List, BarChart3, Kanban, Loader2, TrendingUp,
  CheckCircle2, AlertTriangle, CalendarDays, Eye, X
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
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

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

const STATUS_MAP: Record<string, { label: string; color: string; headerBg: string; headerText: string; dotColor: string }> = {
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

const STATUS_FILTER_OPTIONS = [
  { key: 'all', label: 'همه' },
  { key: 'open', label: 'باز' },
  { key: 'interviewing', label: 'مصاحبه' },
  { key: 'offered', label: 'پیشنهاد شغل' },
  { key: 'hired', label: 'استخدام شده' },
  { key: 'closed', label: 'بسته شده' },
]

const PIPELINE_COLUMNS = ['open', 'interviewing', 'offered', 'hired', 'closed'] as const

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#0ea5e9', '#6b7280']

// ============================================
// Position Form Dialog
// ============================================

function PositionFormDialog({
  open, onClose, onSubmit, initialData,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  initialData?: Recruitment | null
}) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    title: '', department: '', position: '', status: 'open', applicants: '0',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          title: initialData.title,
          department: initialData.department || '',
          position: initialData.position || '',
          status: initialData.status,
          applicants: initialData.applicants.toString(),
        })
      } else {
        setForm({ title: '', department: '', position: '', status: 'open', applicants: '0' })
      }
    }
  }, [open, initialData])

  const handleSubmit = async () => {
    if (!form.title) return
    setSaving(true)
    try {
      await onSubmit({
        title: form.title,
        department: form.department || null,
        position: form.position || null,
        status: form.status,
        applicants: parseInt(form.applicants) || 0,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            {isEdit ? 'ویرایش موقعیت شغلی' : 'افزودن موقعیت شغلی جدید'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات موقعیت را بروزرسانی کنید' : 'موقعیت شغلی جدید را ثبت کنید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* اطلاعات پایه */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              اطلاعات پایه
            </h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>عنوان موقعیت *</Label>
                <Input
                  placeholder="مثلاً: توسعه‌دهنده ارشد فرانت‌اند"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>دپارتمان</Label>
                  <Input
                    placeholder="مثلاً: فناوری اطلاعات"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>سمت</Label>
                  <Input
                    placeholder="مثلاً: ارشد"
                    value={form.position}
                    onChange={e => setForm({ ...form, position: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* وضعیت و متقاضیان */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              وضعیت و متقاضیان
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${val.dotColor}`} />
                          {val.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تعداد متقاضی</Label>
                <Input
                  type="number"
                  placeholder="۰"
                  value={form.applicants}
                  onChange={e => setForm({ ...form, applicants: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.title} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {saving ? 'در حال ذخیره...' : isEdit ? 'بروزرسانی' : 'ذخیره'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Delete Confirmation Dialog
// ============================================

function DeleteConfirmDialog({
  open, onClose, onConfirm, item,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  item: Recruitment | null
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            تایید حذف
          </DialogTitle>
          <DialogDescription>
            این عمل قابل بازگشت نیست.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm">
              آیا از حذف موقعیت شغلی
              <span className="font-bold mx-1">&laquo;{item?.title}&raquo;</span>
              اطمینان دارید؟
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              پس از حذف، تمام اطلاعات مربوط به این موقعیت به صورت دائمی پاک خواهد شد.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button variant="destructive" onClick={onConfirm} className="gap-2">
            <Trash2 className="w-4 h-4" />
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Statistics Tab
// ============================================

function StatisticsTab({ items }: { items: Recruitment[] }) {
  const totalPositions = items.length
  const openCount = items.filter(i => i.status === 'open').length
  const interviewingCount = items.filter(i => i.status === 'interviewing').length
  const offeredCount = items.filter(i => i.status === 'offered').length
  const hiredCount = items.filter(i => i.status === 'hired').length
  const closedCount = items.filter(i => i.status === 'closed').length

  const totalApplicants = items.reduce((s, i) => s + i.applicants, 0)
  const activePositions = items.filter(i => ['open', 'interviewing', 'offered'].includes(i.status)).length
  const conversionRate = totalPositions > 0 ? Math.round((hiredCount / totalPositions) * 100) : 0
  const avgApplicants = totalPositions > 0 ? Math.round(totalApplicants / totalPositions) : 0

  // Bar chart data: positions by status
  const barData = [
    { name: 'باز', value: openCount, fill: 'var(--color-open)' },
    { name: 'مصاحبه', value: interviewingCount, fill: 'var(--color-interviewing)' },
    { name: 'پیشنهاد شغل', value: offeredCount, fill: 'var(--color-offered)' },
    { name: 'استخدام شده', value: hiredCount, fill: 'var(--color-hired)' },
    { name: 'بسته شده', value: closedCount, fill: 'var(--color-closed)' },
  ]

  const barConfig: ChartConfig = {
    open: { label: 'باز', color: '#10b981' },
    interviewing: { label: 'مصاحبه', color: '#3b82f6' },
    offered: { label: 'پیشنهاد شغل', color: '#8b5cf6' },
    hired: { label: 'استخدام شده', color: '#0ea5e9' },
    closed: { label: 'بسته شده', color: '#6b7280' },
  }

  // Pie chart data: status distribution
  const pieData = [
    { name: 'باز', value: openCount, fill: 'var(--color-pOpen)' },
    { name: 'مصاحبه', value: interviewingCount, fill: 'var(--color-pInterviewing)' },
    { name: 'پیشنهاد شغل', value: offeredCount, fill: 'var(--color-pOffered)' },
    { name: 'استخدام شده', value: hiredCount, fill: 'var(--color-pHired)' },
    { name: 'بسته شده', value: closedCount, fill: 'var(--color-pClosed)' },
  ].filter(d => d.value > 0)

  const pieConfig: ChartConfig = {
    pOpen: { label: 'باز', color: '#10b981' },
    pInterviewing: { label: 'مصاحبه', color: '#3b82f6' },
    pOffered: { label: 'پیشنهاد شغل', color: '#8b5cf6' },
    pHired: { label: 'استخدام شده', color: '#0ea5e9' },
    pClosed: { label: 'بسته شده', color: '#6b7280' },
  }

  const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#0ea5e9', '#6b7280']

  if (totalPositions === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-sm">داده‌ای برای نمایش آمار موجود نیست</p>
        <p className="text-xs mt-1">ابتدا یک موقعیت شغلی ایجاد کنید</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{toPersianDigits(totalPositions)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">کل موقعیت‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-sky-600">{toPersianDigits(conversionRate)}٪</div>
            <div className="text-[10px] text-muted-foreground mt-1">نرخ تبدیل</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{toPersianDigits(avgApplicants)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">میانگین متقاضیان</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{toPersianDigits(activePositions)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">موقعیت‌های فعال</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              تعداد موقعیت به تفکیک وضعیت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[250px] w-full">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(v: number) => toPersianDigits(v)} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              توزیع وضعیت موقعیت‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ChartContainer config={pieConfig} className="h-[250px] w-full">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${toPersianDigits(Math.round(percent * 100))}٪`}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                داده‌ای موجود نیست
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// Pipeline Tab
// ============================================

function PipelineTab({
  items, onEdit,
}: {
  items: Recruitment[]
  onEdit: (item: Recruitment) => void
}) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {PIPELINE_COLUMNS.map(statusKey => {
          const st = STATUS_MAP[statusKey]
          const columnItems = items.filter(i => i.status === statusKey)
          return (
            <div key={statusKey} className="flex-shrink-0 w-[260px]">
              {/* Column header */}
              <div className={`${st.headerBg} ${st.headerText} rounded-t-lg px-3 py-2.5 flex items-center justify-between`}>
                <span className="text-sm font-medium">{st.label}</span>
                <Badge className="bg-white/20 text-white border-0 text-[10px] hover:bg-white/30">
                  {toPersianDigits(columnItems.length)}
                </Badge>
              </div>
              {/* Column body */}
              <div className="bg-muted/30 dark:bg-muted/20 rounded-b-lg p-2 min-h-[300px] space-y-2">
                {columnItems.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-xs opacity-50">
                    موقعیتی وجود ندارد
                  </div>
                ) : (
                  columnItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-background rounded-lg p-3 shadow-sm border border-border/50 cursor-pointer hover:shadow-md hover:border-border transition-all"
                      onClick={() => onEdit(item)}
                    >
                      <h4 className="text-sm font-medium mb-1.5 truncate">{item.title}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          {item.department && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {item.department}
                            </span>
                          )}
                        </div>
                        {item.applicants > 0 && (
                          <Badge variant="secondary" className="text-[9px] h-5 gap-1">
                            <Users className="w-2.5 h-2.5" />
                            {toPersianDigits(item.applicants)}
                          </Badge>
                        )}
                      </div>
                      {item.position && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Briefcase className="w-3 h-3" />
                          {item.position}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Main Recruitment Module
// ============================================

export function RecruitmentModule() {
  const [items, setItems] = useState<Recruitment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('positions')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dialog states
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
        // Handle both old (array) and new ({ data, pagination }) format
        const items = Array.isArray(result) ? result : (result.data || [])
        setItems(items)
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
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
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
  // Filtering
  // ============================================

  const filtered = items.filter(i =>
    i.title.includes(search) ||
    (i.department || '').includes(search) ||
    (i.position || '').includes(search)
  )

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === 'open').length,
    interviewing: items.filter(i => i.status === 'interviewing').length,
    totalApplicants: items.reduce((s, i) => s + i.applicants, 0),
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const shamsi = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
      return formatShamsi(shamsi)
    } catch {
      return dateStr
    }
  }

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
            <List className="w-3.5 h-3.5" />
            موقعیت‌ها
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-1.5 text-xs">
            <Kanban className="w-3.5 h-3.5" />
            پایپ‌لاین
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" />
            آمار
          </TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* Positions Tab */}
        {/* ============================================ */}
        <TabsContent value="positions" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="جستجو..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 w-[200px] text-xs pr-9"
                />
              </div>
              {/* Status filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map(opt => (
                    <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* View toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-l-none"
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-r-none"
                  onClick={() => setViewMode('table')}
                >
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => openFormDialog()}>
              <Plus className="w-3.5 h-3.5" /> افزودن موقعیت
            </Button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">موقعیت شغلی یافت نشد</p>
            </div>
          ) : viewMode === 'card' ? (
            /* Card view */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(item => {
                const st = STATUS_MAP[item.status] || STATUS_MAP.open
                return (
                  <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge className={`text-[10px] shrink-0 ${st.color}`}>{st.label}</Badge>
                          <h3 className="text-sm font-medium truncate">{item.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openFormDialog(item)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDeleteItem(item)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {item.department && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />{item.department}
                          </span>
                        )}
                        {item.position && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />{item.position}
                          </span>
                        )}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {toPersianDigits(item.applicants)} متقاضی
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* Table view */
            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">عنوان موقعیت</TableHead>
                    <TableHead className="text-xs">دپارتمان</TableHead>
                    <TableHead className="text-xs">سمت</TableHead>
                    <TableHead className="text-xs">وضعیت</TableHead>
                    <TableHead className="text-xs text-center">تعداد متقاضی</TableHead>
                    <TableHead className="text-xs">تاریخ ایجاد</TableHead>
                    <TableHead className="text-xs text-center">اقدامات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(item => {
                    const st = STATUS_MAP[item.status] || STATUS_MAP.open
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.department || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.position || '—'}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center">{toPersianDigits(item.applicants)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openFormDialog(item)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDeleteItem(item)}>
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
        </TabsContent>

        {/* ============================================ */}
        {/* Pipeline Tab */}
        {/* ============================================ */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">موقعیت‌ها بر اساس وضعیت در ستون‌های مختلف نمایش داده می‌شوند. برای ویرایش روی هر کارت کلیک کنید.</p>
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => openFormDialog()}>
              <Plus className="w-3.5 h-3.5" /> افزودن موقعیت
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Kanban className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">موقعیتی برای نمایش پایپ‌لاین وجود ندارد</p>
            </div>
          ) : (
            <PipelineTab items={items} onEdit={openFormDialog} />
          )}
        </TabsContent>

        {/* ============================================ */}
        {/* Statistics Tab */}
        {/* ============================================ */}
        <TabsContent value="statistics">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
          ) : (
            <StatisticsTab items={items} />
          )}
        </TabsContent>
      </Tabs>

      {/* ============================================ */}
      {/* Dialogs */}
      {/* ============================================ */}

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
