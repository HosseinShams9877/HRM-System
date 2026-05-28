'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  PlaneTakeoff, LogOut, Search, Plus, BarChart3
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { OnboardItem, OffboardItem, TaskItem } from '../index'
import { ONBOARDING_TEMPLATES, OFFBOARDING_TEMPLATES } from '../constants'
import { parseTasks, calcProgress, tasksToString } from '../lib/utils'
import { OnboardingTab } from './onboarding-tab'
import { OffboardingTab } from './offboarding-tab'
import { StatisticsTab } from './statistics-tab'
import { OnboardingDialogs } from './onboarding-dialogs'
import { OffboardingDialogs } from './offboarding-dialogs'

// ============================================
// Main Component
// ============================================

export function OnboardingOffboardingModule() {
  const [activeTab, setActiveTab] = useState('onboarding')
  const [onboards, setOnboards] = useState<OnboardItem[]>([])
  const [offboards, setOffboards] = useState<OffboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [onStatusFilter, setOnStatusFilter] = useState<string>('all')
  const [offStatusFilter, setOffStatusFilter] = useState<string>('all')
  const [offReasonFilter, setOffReasonFilter] = useState<string>('all')
  const [saving, setSaving] = useState(false)
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([])

  // Dialog states
  const [showOnDialog, setShowOnDialog] = useState(false)
  const [showOffDialog, setShowOffDialog] = useState(false)
  const [showOnEditDialog, setShowOnEditDialog] = useState(false)
  const [showOffEditDialog, setShowOffEditDialog] = useState(false)
  const [showOnDetailDialog, setShowOnDetailDialog] = useState(false)
  const [showOffDetailDialog, setShowOffDetailDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'on' | 'off'; id: string } | null>(null)

  // Form states
  const [onForm, setOnForm] = useState({
    employeeId: '', startDate: '', endDate: '', tasks: '', template: 'پیش‌فرض'
  })
  const [offForm, setOffForm] = useState({
    employeeId: '', reason: 'استعفا', lastDate: '', tasks: '', template: 'پیش‌فرض'
  })
  const [editOnForm, setEditOnForm] = useState<OnboardItem | null>(null)
  const [editOffForm, setEditOffForm] = useState<OffboardItem | null>(null)
  const [detailOnItem, setDetailOnItem] = useState<OnboardItem | null>(null)
  const [detailOffItem, setDetailOffItem] = useState<OffboardItem | null>(null)

  // ============================================
  // Data fetching
  // ============================================

  const fetchOnboards = useCallback(async () => {
    try {
      const r = await fetch('/api/onboarding')
      if (r.ok) {
        const result = await r.json()
        // Handle both old (array) and new ({ data, pagination }) format
        const items = Array.isArray(result) ? result : (result.data || [])
        setOnboards(items)
      }
    } catch (e) { console.error(e) }
  }, [])

  const fetchOffboards = useCallback(async () => {
    try {
      const r = await fetch('/api/offboarding')
      if (r.ok) {
        const result = await r.json()
        // Handle both old (array) and new ({ data, pagination }) format
        const items = Array.isArray(result) ? result : (result.data || [])
        setOffboards(items)
      }
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await Promise.all([fetchOnboards(), fetchOffboards()])
      setLoading(false)
    })()
    fetch('/api/employees')
      .then(r => r.ok ? r.json() : [])
      .then(result => {
        const d = Array.isArray(result) ? result : (result.data || result.employees || [])
        setEmployees(d)
      })
      .catch(() => {})
  }, [fetchOnboards, fetchOffboards])

  // ============================================
  // Computed data
  // ============================================

  const filteredOnboards = useMemo(() => {
    let list = onboards
    if (search) {
      list = list.filter(i => `${i.employee?.firstName} ${i.employee?.lastName}`.includes(search))
    }
    if (onStatusFilter !== 'all') {
      list = list.filter(i => i.status === onStatusFilter)
    }
    return list
  }, [onboards, search, onStatusFilter])

  const filteredOffboards = useMemo(() => {
    let list = offboards
    if (search) {
      list = list.filter(i => `${i.employee?.firstName} ${i.employee?.lastName}`.includes(search))
    }
    if (offStatusFilter !== 'all') {
      list = list.filter(i => i.status === offStatusFilter)
    }
    if (offReasonFilter !== 'all') {
      list = list.filter(i => i.reason === offReasonFilter)
    }
    return list
  }, [offboards, search, offStatusFilter, offReasonFilter])

  const onStats = useMemo(() => {
    const total = onboards.length
    const inProgress = onboards.filter(i => i.status === 'in_progress').length
    const completed = onboards.filter(i => i.status === 'completed').length
    const avgProgress = total > 0 ? Math.round(onboards.reduce((a, b) => a + b.progress, 0) / total) : 0
    return { total, inProgress, completed, avgProgress }
  }, [onboards])

  const offStats = useMemo(() => {
    const total = offboards.length
    const inProgress = offboards.filter(i => i.status === 'in_progress').length
    const completed = offboards.filter(i => i.status === 'completed').length
    const reasonBreakdown: Record<string, number> = {}
    offboards.forEach(i => {
      reasonBreakdown[i.reason] = (reasonBreakdown[i.reason] || 0) + 1
    })
    return { total, inProgress, completed, reasonBreakdown }
  }, [offboards])

  // ============================================
  // Task toggle handler
  // ============================================

  const toggleTask = async (type: 'on' | 'off', id: string, taskIndex: number) => {
    const list = type === 'on' ? onboards : offboards
    const item = list.find(i => i.id === id)
    if (!item) return

    const tasks = parseTasks(item.tasks)
    if (taskIndex < 0 || taskIndex >= tasks.length) return

    tasks[taskIndex].done = !tasks[taskIndex].done
    const newProgress = calcProgress(tasks)
    const newStatus = newProgress === 100 ? 'completed' : (item.status === 'completed' && newProgress < 100 ? 'in_progress' : item.status)
    const newTasksStr = tasksToString(tasks)

    // Optimistic update
    if (type === 'on') {
      setOnboards(prev => prev.map(i => i.id === id ? { ...i, tasks: newTasksStr, progress: newProgress, status: newStatus } : i))
    } else {
      setOffboards(prev => prev.map(i => i.id === id ? { ...i, tasks: newTasksStr, progress: newProgress, status: newStatus } : i))
    }

    try {
      await fetch(type === 'on' ? `/api/onboarding/${id}` : `/api/offboarding/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: newTasksStr, progress: newProgress, status: newStatus })
      })
    } catch (e) {
      console.error(e)
      // Revert on error
      if (type === 'on') await fetchOnboards()
      else await fetchOffboards()
    }
  }

  // ============================================
  // Save handlers
  // ============================================

  const saveOnboard = async () => {
    if (!onForm.employeeId) return
    setSaving(true)
    try {
      const taskLines = onForm.tasks.split('\n').filter(Boolean)
      const taskItems: TaskItem[] = taskLines.map(t => ({ text: t.trim(), done: false }))
      const tasksStr = taskItems.length > 0 ? tasksToString(taskItems) : null
      const progress = taskItems.length > 0 ? 0 : 0

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: onForm.employeeId,
          tasks: tasksStr,
          startDate: onForm.startDate || null,
          endDate: onForm.endDate || null,
          progress
        })
      })
      if (res.ok) {
        await fetchOnboards()
        setShowOnDialog(false)
        setOnForm({ employeeId: '', startDate: '', endDate: '', tasks: '', template: 'پیش‌فرض' })
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const saveOffboard = async () => {
    if (!offForm.employeeId) return
    setSaving(true)
    try {
      const taskLines = offForm.tasks.split('\n').filter(Boolean)
      const taskItems: TaskItem[] = taskLines.map(t => ({ text: t.trim(), done: false }))
      const tasksStr = taskItems.length > 0 ? tasksToString(taskItems) : null

      const res = await fetch('/api/offboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: offForm.employeeId,
          reason: offForm.reason,
          tasks: tasksStr,
          lastDate: offForm.lastDate || null,
        })
      })
      if (res.ok) {
        await fetchOffboards()
        setShowOffDialog(false)
        setOffForm({ employeeId: '', reason: 'استعفا', lastDate: '', tasks: '', template: 'پیش‌فرض' })
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const saveEditOnboard = async () => {
    if (!editOnForm) return
    setSaving(true)
    try {
      const res = await fetch(`/api/onboarding/${editOnForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: editOnForm.startDate || null,
          endDate: editOnForm.endDate || null,
        })
      })
      if (res.ok) {
        await fetchOnboards()
        setShowOnEditDialog(false)
        setEditOnForm(null)
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const saveEditOffboard = async () => {
    if (!editOffForm) return
    setSaving(true)
    try {
      const res = await fetch(`/api/offboarding/${editOffForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: editOffForm.reason,
          lastDate: editOffForm.lastDate || null,
        })
      })
      if (res.ok) {
        await fetchOffboards()
        setShowOffEditDialog(false)
        setEditOffForm(null)
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const url = deleteTarget.type === 'on' ? `/api/onboarding/${deleteTarget.id}` : `/api/offboarding/${deleteTarget.id}`
      await fetch(url, { method: 'DELETE' })
      if (deleteTarget.type === 'on') await fetchOnboards()
      else await fetchOffboards()
    } catch (e) { console.error(e) }
    finally { setDeleteTarget(null) }
  }

  const applyOnTemplate = (template: string) => {
    const tmpl = ONBOARDING_TEMPLATES[template]
    if (tmpl) {
      setOnForm(prev => ({
        ...prev,
        template,
        tasks: tmpl.map(t => t.text).join('\n')
      }))
    }
  }

  const applyOffTemplate = (template: string) => {
    const tmpl = OFFBOARDING_TEMPLATES[template]
    if (tmpl) {
      setOffForm(prev => ({
        ...prev,
        template,
        tasks: tmpl.map(t => t.text).join('\n')
      }))
    }
  }

  // ============================================
  // Callbacks for tab components
  // ============================================

  const handleEditOn = (item: OnboardItem) => {
    setEditOnForm({ ...item })
    setShowOnEditDialog(true)
  }

  const handleDeleteOn = (id: string) => {
    setDeleteTarget({ type: 'on', id })
  }

  const handleDetailOn = (item: OnboardItem) => {
    setDetailOnItem(item)
    setShowOnDetailDialog(true)
  }

  const handleEditOff = (item: OffboardItem) => {
    setEditOffForm({ ...item })
    setShowOffEditDialog(true)
  }

  const handleDeleteOff = (id: string) => {
    setDeleteTarget({ type: 'off', id })
  }

  const handleDetailOff = (item: OffboardItem) => {
    setDetailOffItem(item)
    setShowOffDetailDialog(true)
  }

  // ============================================
  // Main render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
          <PlaneTakeoff className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">آنبوردینگ و آفبوردینگ</h2>
          <p className="text-xs text-muted-foreground">مدیریت ورود و خروج کارکنان</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <TabsList className="grid w-auto grid-cols-3">
            <TabsTrigger value="onboarding" className="gap-1.5 text-xs px-3">
              <PlaneTakeoff className="w-3.5 h-3.5" />
              آنبوردینگ
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">{toPersianDigits(onboards.length)}</Badge>
            </TabsTrigger>
            <TabsTrigger value="offboarding" className="gap-1.5 text-xs px-3">
              <LogOut className="w-3.5 h-3.5" />
              آفبوردینگ
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">{toPersianDigits(offboards.length)}</Badge>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-1.5 text-xs px-3">
              <BarChart3 className="w-3.5 h-3.5" />
              آمار
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {activeTab !== 'statistics' && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="جستجو..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 w-[200px] text-xs pr-9"
                />
              </div>
            )}
            {activeTab === 'onboarding' && (
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowOnDialog(true)}>
                <Plus className="w-3.5 h-3.5" />آنبوردینگ جدید
              </Button>
            )}
            {activeTab === 'offboarding' && (
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowOffDialog(true)}>
                <Plus className="w-3.5 h-3.5" />آفبوردینگ جدید
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="onboarding">
          <OnboardingTab
            items={filteredOnboards}
            loading={loading}
            onStatusFilter={onStatusFilter}
            viewMode={viewMode}
            onStats={onStats}
            onStatusFilterChange={setOnStatusFilter}
            onViewModeChange={setViewMode}
            onToggleTask={toggleTask}
            onEdit={handleEditOn}
            onDelete={handleDeleteOn}
            onDetail={handleDetailOn}
          />
        </TabsContent>
        <TabsContent value="offboarding">
          <OffboardingTab
            items={filteredOffboards}
            loading={loading}
            offStatusFilter={offStatusFilter}
            offReasonFilter={offReasonFilter}
            viewMode={viewMode}
            offStats={offStats}
            onStatusFilterChange={setOffStatusFilter}
            onReasonFilterChange={setOffReasonFilter}
            onViewModeChange={setViewMode}
            onToggleTask={toggleTask}
            onEdit={handleEditOff}
            onDelete={handleDeleteOff}
            onDetail={handleDetailOff}
          />
        </TabsContent>
        <TabsContent value="statistics">
          <StatisticsTab
            onStats={onStats}
            offStats={offStats}
            onboards={onboards}
            offboards={offboards}
          />
        </TabsContent>
      </Tabs>

      {/* ============================================ */}
      {/* DIALOGS */}
      {/* ============================================ */}

      <OnboardingDialogs
        showOnDialog={showOnDialog}
        setShowOnDialog={setShowOnDialog}
        onForm={onForm}
        setOnForm={setOnForm}
        employees={employees}
        saving={saving}
        saveOnboard={saveOnboard}
        applyOnTemplate={applyOnTemplate}
        showOnEditDialog={showOnEditDialog}
        setShowOnEditDialog={setShowOnEditDialog}
        editOnForm={editOnForm}
        setEditOnForm={setEditOnForm}
        saveEditOnboard={saveEditOnboard}
        showOnDetailDialog={showOnDetailDialog}
        setShowOnDetailDialog={setShowOnDetailDialog}
        detailOnItem={detailOnItem}
        onboards={onboards}
        onToggleTask={toggleTask}
        setOnboards={setOnboards}
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        handleDelete={handleDelete}
      />

      <OffboardingDialogs
        showOffDialog={showOffDialog}
        setShowOffDialog={setShowOffDialog}
        offForm={offForm}
        setOffForm={setOffForm}
        employees={employees}
        saving={saving}
        saveOffboard={saveOffboard}
        applyOffTemplate={applyOffTemplate}
        showOffEditDialog={showOffEditDialog}
        setShowOffEditDialog={setShowOffEditDialog}
        editOffForm={editOffForm}
        setEditOffForm={setEditOffForm}
        saveEditOffboard={saveEditOffboard}
        showOffDetailDialog={showOffDetailDialog}
        setShowOffDetailDialog={setShowOffDetailDialog}
        detailOffItem={detailOffItem}
        offboards={offboards}
        onToggleTask={toggleTask}
        setOffboards={setOffboards}
      />
    </div>
  )
}
