// modules/training/components/training-module.tsx

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
import { TrainingStats } from './training-stats'
import { TrainingToolbar } from './training-toolbar'
import { CoursesList } from './courses-list'
import { ParticipantsTab } from './participants-tab'

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
        const detailRes = await fetch(`/api/training/${courseId}`)
        if (detailRes.ok) setDetailCourse(await detailRes.json())
      } else {
        toast.error('خطا')
      }
    } catch {
      toast.error('خطا در ارتباط')
    }
  }

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
  // Filtering & Stats
  // ============================================

  const filtered = items.filter(i => i.title.includes(search) || (i.instructor || '').includes(search))

  const inProgressCount = items.filter(i => i.status === 'in_progress').length
  const completedCourseCount = items.filter(i => i.status === 'completed').length
  const totalParticipants = items.reduce((sum, i) => sum + i.participants.length, 0)

  const selectedCourse = items.find(i => i.id === selectedCourseId)
  const selectedCourseScores = selectedCourse?.participants
  .filter(p => p.score !== null && p.score >= 0 && p.score <= (selectedCourse?.maxScore || 5))
  .map(p => p.score as number) || []
  const selectedCourseAvgScore = selectedCourseScores.length > 0 ? (selectedCourseScores.reduce((a, b) => a + b, 0) / selectedCourseScores.length) : null

  if (loading) {
    return <TrainingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <TrainingHeader onAdd={() => { setEditingCourse(null); setShowFormDialog(true) }} />

      {/* Stats cards */}
      <TrainingStats
        totalCourses={items.length}
        inProgressCount={inProgressCount}
        completedCount={completedCourseCount}
        totalParticipants={totalParticipants}
      />

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

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <TrainingToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <CoursesList
            items={filtered}
            viewMode={viewMode}
            onViewDetail={setDetailCourse}
            onEdit={(item) => { setEditingCourse(item); setShowFormDialog(true) }}
            onDelete={(id) => setDeleteDialog({ open: true, id })}
            onAddParticipant={(courseId) => { setParticipantCourseId(courseId); setShowAddParticipant(true) }}
          />
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <ParticipantsTab
            items={items}
            selectedCourseId={selectedCourseId}
            onSelectCourse={setSelectedCourseId}
            selectedCourse={selectedCourse}
            selectedCourseAvgScore={selectedCourseAvgScore}
            onAddParticipant={(courseId) => { setParticipantCourseId(courseId); setShowAddParticipant(true) }}
            onUpdateParticipant={handleUpdateParticipantTab}
            onRemoveParticipant={handleRemoveParticipantTab}
          />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <StatisticsTab items={items} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CourseFormDialog
        open={showFormDialog}
        onClose={() => { setShowFormDialog(false); setEditingCourse(null) }}
        onSubmit={handleSave}
        initialData={editingCourse}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(o) => setDeleteDialog({ open: o, id: null })}
        title="حذف دوره آموزشی"
        description="آیا از حذف این دوره و تمام شرکت‌کنندگان آن اطمینان دارید؟ این عمل قابل بازگشت نیست."
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="حذف"
      />

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

// ============================================
// Sub-components
// ============================================

function TrainingHeader({ onAdd }: { onAdd: () => void }) {
  return (
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
      <Button size="sm" className="gap-1.5 text-xs" onClick={onAdd}>
        <Plus className="w-3.5 h-3.5" />
        افزودن دوره
      </Button>
    </div>
  )
}

function TrainingSkeleton() {
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