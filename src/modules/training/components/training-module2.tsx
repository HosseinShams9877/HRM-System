'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  GraduationCap, Search, Plus, Edit2, Trash2, Users, MapPin, Calendar,
  LayoutGrid, List, Eye, BarChart3, UserPlus, Clock, Award, BookOpen,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/core/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Progress } from '@/core/components/ui/progress'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Skeleton } from '@/core/components/ui/skeleton'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { toast } from 'sonner'
import { toPersianDigits } from '@/core/lib/utils-fa'
import type { Training, EmployeeBasic } from '../index'
import { STATUS_MAP, CATEGORY_MAP, PARTICIPANT_STATUS_MAP } from '../constants'
import { CourseFormDialog } from './course-form-dialog'
import { AddParticipantDialog } from './add-participant-dialog'
import { CourseDetailDialog } from './course-detail-dialog'
import { StatisticsTab } from './statistics-tab'

// ============================================
// Main Training Module
// ============================================

export function TrainingModule() {
  const [items, setItems] = useState<Training[]>([])
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('courses')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Training | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [detailCourse, setDetailCourse] = useState<Training | null>(null)
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [participantCourseId, setParticipantCourseId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Participants tab
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')

  // ============================================
  // Fetch functions
  // ============================================

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      const res = await fetch(`/api/training?${params.toString()}`)
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
  }, [statusFilter, categoryFilter])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?status=active')
      if (res.ok) {
        const result = await res.json()
        const empList = Array.isArray(result) ? result : (result.data || [])
        setEmployees(empList.map((e: EmployeeBasic) => ({
          id: e.id, firstName: e.firstName, lastName: e.lastName,
          personnelCode: e.personnelCode, department: e.department, position: e.position,
        })))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    fetchItems()
    fetchEmployees()
  }, [fetchItems, fetchEmployees])

  // ============================================
  // Course CRUD
  // ============================================

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const url = editingCourse ? `/api/training/${editingCourse.id}` : '/api/training'
      const method = editingCourse ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) {
        toast.success(editingCourse ? 'دوره بروزرسانی شد' : 'دوره با موفقیت ایجاد شد')
        setShowFormDialog(false)
        setEditingCourse(null)
        fetchItems()
      } else {
        const err = await res.json()
        toast.error(err.error || 'خطا')
      }
    } catch {
      toast.error('خطا در ارتباط')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const id = deleteDialog.id
    if (!id) return
    try {
      const res = await fetch(`/api/training/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('دوره حذف شد')
        fetchItems()
      } else {
        toast.error('خطا در حذف')
      }
    } catch {
      toast.error('خطا در ارتباط')
    } finally {
      setDeleteDialog({ open: false, id: null })
    }
  }

  // ============================================
  // Participant operations
  // ============================================

  const handleAddParticipant = async (employeeId: string) => {
    const courseId = participantCourseId || selectedCourseId || detailCourse?.id
    if (!courseId) return

    try {
      const res = await fetch(`/api/training/${courseId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      })
      if (res.ok) {
        toast.success('شرکت‌کننده اضافه شد')
        setShowAddParticipant(false)
        fetchItems()
        // Update detail view if open
        if (detailCourse?.id === courseId) {
          const detailRes = await fetch(`/api/training/${courseId}`)
          if (detailRes.ok) setDetailCourse(await detailRes.json())
        }
      } else {
        const err = await res.json()
        toast.error(err.error || 'خطا')
      }
    } catch {
      toast.error('خطا در ارتباط')
    }
  }

  const handleUpdateParticipant = async (participantId: string, data: { status?: string; score?: number | null }) => {
    const courseId = detailCourse?.id
    if (!courseId) return

    try {
      const res = await fetch(`/api/training/${courseId}/participants/${participantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('بروزرسانی شد')
        fetchItems()
        // Update detail view
        const detailRes = await fetch(`/api/training/${courseId}`)
        if (detailRes.ok) setDetailCourse(await detailRes.json())
      } else {
        toast.error('خطا')
      }
    } catch {
      toast.error('خطا در ارتباط')
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    const courseId = detailCourse?.id
    if (!courseId) return

    try {
      const res = await fetch(`/api/training/${courseId}/participants?participantId=${participantId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('شرکت‌کننده حذف شد')
        fetchItems()
        // Update detail view
        const detailRes = await fetch(`/api/training/${courseId}`)
        if (detailRes.ok) setDetailCourse(await detailRes.json())
      } else {
        toast.error('خطا')
      }
    } catch {
      toast.error('خطا در ارتباط')
    }
  }

  // Participants tab: update participant
  const handleUpdateParticipantTab = async (participantId: string, courseId: string, data: { status?: string; score?: number | null }) => {
    try {
      const res = await fetch(`/api/training/${courseId}/participants/${participantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('بروزرسانی شد')
        fetchItems()
      } else {
        toast.error('خطا')
      }
    } catch {
      toast.error('خطا در ارتباط')
    }
  }

  const handleRemoveParticipantTab = async (participantId: string, courseId: string) => {
    try {
      const res = await fetch(`/api/training/${courseId}/participants?participantId=${participantId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('شرکت‌کننده حذف شد')
        fetchItems()
      } else {
        toast.error('خطا')
      }
    } catch {
      toast.error('خطا در ارتباط')
    }
  }

  // ============================================
  // Filtering
  // ============================================

  const filtered = items.filter(i => i.title.includes(search) || (i.instructor || '').includes(search))

  // ============================================
  // Stats for header cards
  // ============================================

  const inProgressCount = items.filter(i => i.status === 'in_progress').length
  const completedCourseCount = items.filter(i => i.status === 'completed').length
  const totalParticipants = items.reduce((sum, i) => sum + i.participants.length, 0)

  // Selected course for participants tab
  const selectedCourse = items.find(i => i.id === selectedCourseId)
  const selectedCourseScores = selectedCourse?.participants.filter(p => p.score !== null).map(p => p.score as number) || []
  const selectedCourseAvgScore = selectedCourseScores.length > 0 ? (selectedCourseScores.reduce((a, b) => a + b, 0) / selectedCourseScores.length) : null

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">آموزش</h2>
            <p className="text-xs text-muted-foreground">مدیریت دوره‌های آموزشی و شرکت‌کنندگان</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => { setEditingCourse(null); setShowFormDialog(true) }}>
          <Plus className="w-3.5 h-3.5" />
          افزودن دوره
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{toPersianDigits(items.length)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">کل دوره‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{toPersianDigits(inProgressCount)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">در حال برگزاری</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{toPersianDigits(completedCourseCount)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">تکمیل شده</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{toPersianDigits(totalParticipants)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">کل شرکت‌کنندگان</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
           <TabsTrigger value="statistics" className="gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" />
            آمار
          </TabsTrigger>
            <TabsTrigger value="participants" className="gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" />
            شرکت‌کنندگان
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-1.5 text-xs">
            <BookOpen className="w-3.5 h-3.5" />
            دوره‌ها ({toPersianDigits(items.length)})
          </TabsTrigger>
        
         
        </TabsList>

        {/* ===== COURSES TAB ===== */}
        <TabsContent value="courses" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 w-[200px] text-xs pr-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="وضعیت" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  {Object.entries(STATUS_MAP).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="دسته‌بندی" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دسته‌ها</SelectItem>
                  {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 border rounded-lg p-0.5">
              <Button variant={viewMode === 'card' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('card')}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('table')}>
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">دوره‌ای یافت نشد</h3>
              <p className="text-sm mt-1">فیلتر را تغییر دهید یا دوره جدید ایجاد کنید</p>
              <Button className="mt-4" onClick={() => setShowFormDialog(true)}>
                <Plus className="w-4 h-4 ml-2" />
                ایجاد دوره جدید
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
           <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs text-center">اقدامات</TableHead>
                    <TableHead className="text-xs text-center">شرکت‌کننده</TableHead>
                    <TableHead className="text-xs">وضعیت</TableHead>
                    <TableHead className="text-xs">تاریخ پایان</TableHead>
                    <TableHead className="text-xs">تاریخ شروع</TableHead>
                    <TableHead className="text-xs">محل برگزاری</TableHead>
                    <TableHead className="text-xs">مدرس</TableHead>
                    <TableHead className="text-xs">عنوان دوره</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(item => {
                    const st = STATUS_MAP[item.status] || STATUS_MAP.planned
                    const cat = item.category ? CATEGORY_MAP[item.category] : null
                    return (
                      <TableRow key={item.id} className="cursor-pointer" onClick={() => setDetailCourse(item)}>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDetailCourse(item)}><Eye className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingCourse(item); setShowFormDialog(true) }}><Edit2 className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDeleteDialog({ open: true, id: item.id })}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {toPersianDigits(item.participants.length)}
                          {item.capacity ? <span className="text-muted-foreground"> / {toPersianDigits(item.capacity)}</span> : ''}
                        </TableCell>
                        <TableCell><Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge></TableCell>
                        <TableCell className="text-xs" dir="ltr">{toPersianDigits(item.endDate || '—')}</TableCell>
                        <TableCell className="text-xs" dir="ltr">{toPersianDigits(item.startDate)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.location || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.instructor || '—'}</TableCell>
                        <TableCell className="text-xs font-medium">
                          <div className="flex items-center gap-2">
                            {cat && <cat.icon className="w-3.5 h-3.5 text-muted-foreground" />}
                            {item.title}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(item => {
                const st = STATUS_MAP[item.status] || STATUS_MAP.planned
                const cat = item.category ? CATEGORY_MAP[item.category] : null
                const CatIcon = cat?.icon
                return (
                  <Card
                    key={item.id}
                    className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setDetailCourse(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge className={`text-[10px] shrink-0 ${st.color}`}>{st.label}</Badge>
                          {cat && <Badge className={`text-[10px] shrink-0 ${cat.color}`}>{cat.label}</Badge>}
                          <h3 className="text-sm font-medium truncate">{item.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 mr-2" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingCourse(item); setShowFormDialog(true) }}><Edit2 className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDeleteDialog({ open: true, id: item.id })}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {item.instructor && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.instructor}</span>}
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.startDate}</span>
                        {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                        {item.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{toPersianDigits(item.duration)} ساعت</span>}
                      </div>
                      {item.participants?.length > 0 && (
                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">شرکت‌کنندگان: {toPersianDigits(item.participants.length)} نفر{item.capacity ? ` از ${toPersianDigits(item.capacity)}` : ''}</span>
                          <div className="w-[80px]">
                            <Progress
                              value={item.capacity ? Math.min(Math.round((item.participants.length / item.capacity) * 100), 100) : 0}
                              className="h-1.5"
                            />
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

        {/* ===== PARTICIPANTS TAB ===== */}
        <TabsContent value="participants" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs">انتخاب دوره:</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="h-8 w-[250px] text-xs"><SelectValue placeholder="یک دوره انتخاب کنید" /></SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title} — {toPersianDigits(item.participants.length)} شرکت‌کننده
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCourseId && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => { setParticipantCourseId(selectedCourseId); setShowAddParticipant(true) }}>
                <UserPlus className="w-3.5 h-3.5" />
                افزودن شرکت‌کننده
              </Button>
            )}
          </div>

          {!selectedCourseId ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">لطفاً یک دوره انتخاب کنید</h3>
            </div>
          ) : !selectedCourse ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">دوره یافت نشد</h3>
            </div>
          ) : selectedCourse.participants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">هنوز شرکت‌کننده‌ای ثبت نشده</h3>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs" onClick={() => { setParticipantCourseId(selectedCourseId); setShowAddParticipant(true) }}>
                <UserPlus className="w-3.5 h-3.5" />
                افزودن اولین شرکت‌کننده
              </Button>
            </div>
          ) : (
            <>
              {/* Course info */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium">{selectedCourse.title}</span>
                      <Badge className={`text-[10px] ${(STATUS_MAP[selectedCourse.status] || STATUS_MAP.planned).color}`}>
                        {(STATUS_MAP[selectedCourse.status] || STATUS_MAP.planned).label}
                      </Badge>
                    </div>
                    {selectedCourseAvgScore !== null && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>میانگین نمره:</span>
                        <span className="font-bold text-emerald-600">{toPersianDigits(selectedCourseAvgScore.toFixed(1))}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {selectedCourse.instructor && <span>مدرس: {selectedCourse.instructor}</span>}
                    <span>تعداد: {toPersianDigits(selectedCourse.participants.length)} نفر</span>
                  </div>
                </CardContent>
              </Card>

              {/* Participants table */}
             <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs text-center">اقدامات</TableHead>
                      <TableHead className="text-xs">نمره</TableHead>
                      <TableHead className="text-xs">وضعیت</TableHead>
                      <TableHead className="text-xs">دپارتمان</TableHead>
                      <TableHead className="text-xs">نام کارمند</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCourse.participants.map(p => {
                      const pSt = PARTICIPANT_STATUS_MAP[p.status] || PARTICIPANT_STATUS_MAP.registered
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleRemoveParticipantTab(p.id, selectedCourseId)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={p.score !== null ? p.score : ''}
                              onChange={e => {
                                const val = e.target.value
                                handleUpdateParticipantTab(p.id, selectedCourseId, { score: val ? parseFloat(val) : null })
                              }}
                              placeholder="—"
                              className="h-7 text-xs w-[60px] text-center"
                              dir="ltr"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={p.status}
                              onValueChange={v => handleUpdateParticipantTab(p.id, selectedCourseId, { status: v })}
                            >
                              <SelectTrigger className="h-7 text-[10px] w-[110px]">
                                <Badge className={`text-[9px] ${pSt.color}`}>{pSt.label}</Badge>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(PARTICIPANT_STATUS_MAP).map(([key, val]) => (
                                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.employee.department || '—'}</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[8px] font-bold">
                                  {p.employee.firstName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{p.employee.firstName} {p.employee.lastName}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== STATISTICS TAB ===== */}
        <TabsContent value="statistics">
          <StatisticsTab items={items} />
        </TabsContent>
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* Create/Edit Dialog */}
      <CourseFormDialog
        open={showFormDialog}
        onClose={() => { setShowFormDialog(false); setEditingCourse(null) }}
        onSubmit={handleSave}
        initialData={editingCourse}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(o) => setDeleteDialog({ open: o, id: null })}
        title="حذف دوره آموزشی"
        description="آیا از حذف این دوره و تمام شرکت‌کنندگان آن اطمینان دارید؟ این عمل قابل بازگشت نیست."
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="حذف"
      />

      {/* Course Detail Dialog */}
      <CourseDetailDialog
        open={!!detailCourse}
        onClose={() => setDetailCourse(null)}
        course={detailCourse}
        onEdit={() => {
          const course = detailCourse
          setDetailCourse(null)
          setEditingCourse(course)
          setShowFormDialog(true)
        }}
        onDelete={() => {
          const id = detailCourse?.id
          setDetailCourse(null)
          if (id) setDeleteDialog({ open: true, id })
        }}
        onAddParticipant={() => {
          setParticipantCourseId(detailCourse?.id || null)
          setShowAddParticipant(true)
        }}
        onUpdateParticipant={handleUpdateParticipant}
        onRemoveParticipant={handleRemoveParticipant}
        employees={employees}
      />

      {/* Add Participant Dialog */}
      <AddParticipantDialog
        open={showAddParticipant}
        onClose={() => { setShowAddParticipant(false); setParticipantCourseId(null) }}
        onSubmit={handleAddParticipant}
        employees={employees}
        existingParticipants={participantCourseId ? (items.find(i => i.id === participantCourseId)?.participants || []) : (selectedCourse?.participants || [])}
      />
    </div>
  )
}
