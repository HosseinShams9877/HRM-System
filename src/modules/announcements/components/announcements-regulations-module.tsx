'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Megaphone, BookOpen, Plus, Search, AlertCircle,
  BarChart3
} from 'lucide-react'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/core/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { toPersianDigits, getTodayShamsi } from '@/core/lib/utils-fa'

import type { Announcement, Regulation, ViewMode, AnnStats, RegStats } from '../index'
import { AnnouncementsTab } from './announcements-tab'
import { RegulationsTab } from './regulations-tab'
import { StatisticsTab } from './statistics-tab'
import { AnnouncementFormDialog } from './announcement-form-dialog'
import { RegulationFormDialog } from './regulation-form-dialog'

// ============================================
// Helpers
// ============================================

function getRegStatus(reg: Regulation): 'active' | 'draft' | 'revoked' {
  if (!reg.isActive) return 'revoked'
  return 'active'
}

function getTodayShamsiStr(): string {
  const today = getTodayShamsi()
  return `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
}

function isRecent(dateStr: string, days: number = 7): boolean {
  if (!dateStr) return false
  try {
    const parts = dateStr.split('/').map(Number)
    if (parts.length !== 3) return false
    const [y, m, d] = parts
    const today = getTodayShamsi()
    // Simple approximation: compare year/month/day
    const itemDays = y * 365 + m * 30 + d
    const todayDays = today.year * 365 + today.month * 30 + today.day
    return (todayDays - itemDays) <= days
  } catch {
    return false
  }
}

// ============================================
// Main Component
// ============================================

export function AnnouncementsRegulationsModule({ initialTab = 'announcements' }: { initialTab?: string }) {
  // ─── Core State ───
  const [activeTab, setActiveTab] = useState(initialTab)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [loading, setLoading] = useState(true)

  // ─── View State ───
  const [annView, setAnnView] = useState<ViewMode>('card')
  const [regView, setRegView] = useState<ViewMode>('card')
  const [searchQuery, setSearchQuery] = useState('')

  // ─── Filter State ───
  const [annPriorityFilter, setAnnPriorityFilter] = useState<string>('all')
  const [annCategoryFilter, setAnnCategoryFilter] = useState<string>('all')
  const [regStatusFilter, setRegStatusFilter] = useState<string>('all')
  const [regCategoryFilter, setRegCategoryFilter] = useState<string>('all')

  // ─── Dialog states ───
  const [showAnnDialog, setShowAnnDialog] = useState(false)
  const [showRegDialog, setShowRegDialog] = useState(false)
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null)
  const [editingReg, setEditingReg] = useState<Regulation | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'ann' | 'reg'; id: string } | null>(null)

  // ─── Form states — Announcement ───
  const [annForm, setAnnForm] = useState({
    title: '', content: '', priority: 'normal', targetAudience: 'all',
    department: '', isActive: true, publishDate: '', expiryDate: '',
  })

  // ─── Form states — Regulation ───
  const [regForm, setRegForm] = useState({
    title: '', content: '', category: 'استخدام', version: '1.0',
    filePath: '', isActive: true, publishDate: '',
  })

  // ─── Fetch data ───
  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements')
      if (res.ok) {
        const json = await res.json()
        setAnnouncements(Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [])
      }
    } catch (e) { console.error(e) }
  }, [])

  const fetchRegulations = useCallback(async () => {
    try {
      const res = await fetch('/api/regulations')
      if (res.ok) {
        const json = await res.json()
        setRegulations(Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [])
      }
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchAnnouncements(), fetchRegulations()])
      setLoading(false)
    }
    load()
  }, [fetchAnnouncements, fetchRegulations])

  // ─── Computed Stats ───
  const annStats = useMemo((): AnnStats => ({
    total: announcements.length,
    high: announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length,
    normal: announcements.filter(a => a.priority === 'normal' || a.priority === 'low').length,
    recent: announcements.filter(a => isRecent(a.publishDate, 7)).length,
    active: announcements.filter(a => a.isActive).length,
  }), [announcements])

  const regStats = useMemo((): RegStats => {
    const statuses = regulations.map(r => getRegStatus(r))
    return {
      total: regulations.length,
      active: statuses.filter(s => s === 'active').length,
      draft: statuses.filter(s => s === 'draft').length,
      revoked: statuses.filter(s => s === 'revoked').length,
    }
  }, [regulations])

  // ─── Filtered Lists ───
  const filteredAnn = useMemo(() => {
    return announcements.filter(a => {
      const matchesSearch = a.title.includes(searchQuery) || a.content.includes(searchQuery)
      const matchesPriority = annPriorityFilter === 'all' || a.priority === annPriorityFilter
      const matchesAudience = annCategoryFilter === 'all' || a.targetAudience === annCategoryFilter
      return matchesSearch && matchesPriority && matchesAudience
    })
  }, [announcements, searchQuery, annPriorityFilter, annCategoryFilter])

  const filteredReg = useMemo(() => {
    return regulations.filter(r => {
      const matchesSearch = r.title.includes(searchQuery) || r.content.includes(searchQuery)
      const matchesCategory = regCategoryFilter === 'all' || r.category === regCategoryFilter
      const matchesStatus = regStatusFilter === 'all' || getRegStatus(r) === regStatusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [regulations, searchQuery, regStatusFilter, regCategoryFilter])

  // ─── Chart Data ───
  const annPriorityChartData = useMemo(() => [
    { name: 'فوری', value: announcements.filter(a => a.priority === 'urgent').length, fill: '#ef4444' },
    { name: 'مهم', value: announcements.filter(a => a.priority === 'high').length, fill: '#f59e0b' },
    { name: 'عادی', value: announcements.filter(a => a.priority === 'normal').length, fill: '#3b82f6' },
    { name: 'کم‌اهمیت', value: announcements.filter(a => a.priority === 'low').length, fill: '#6b7280' },
  ], [announcements])

  const regStatusChartData = useMemo(() => [
    { name: 'فعال', value: regStats.active },
    { name: 'پیش‌نویس', value: regStats.draft },
    { name: 'منسوخ', value: regStats.revoked },
  ], [regStats])

  const recentActivity = useMemo(() => {
    const items: { type: 'ann' | 'reg'; title: string; date: string; icon: React.ElementType; color: string }[] = []
    announcements.forEach(a => {
      items.push({ type: 'ann', title: a.title, date: a.publishDate, icon: Megaphone, color: 'text-sky-500' })
    })
    regulations.forEach(r => {
      items.push({ type: 'reg', title: r.title, date: r.publishDate, icon: BookOpen, color: 'text-violet-500' })
    })
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
  }, [announcements, regulations])

  // ─── Reset announcement form ───
  const resetAnnForm = () => {
    setAnnForm({
      title: '', content: '', priority: 'normal', targetAudience: 'all',
      department: '', isActive: true, publishDate: getTodayShamsiStr(),
      expiryDate: '',
    })
    setEditingAnn(null)
  }

  // ─── Reset regulation form ───
  const resetRegForm = () => {
    setRegForm({
      title: '', content: '', category: 'استخدام', version: '1.0',
      filePath: '', isActive: true, publishDate: getTodayShamsiStr(),
    })
    setEditingReg(null)
  }

  // ─── Open dialog for new/edit announcement ───
  const openAnnDialog = (ann?: Announcement) => {
    if (ann) {
      setEditingAnn(ann)
      setAnnForm({
        title: ann.title,
        content: ann.content,
        priority: ann.priority,
        targetAudience: ann.targetAudience,
        department: ann.department || '',
        isActive: ann.isActive,
        publishDate: ann.publishDate,
        expiryDate: ann.expiryDate || '',
      })
    } else {
      resetAnnForm()
    }
    setShowAnnDialog(true)
  }

  // ─── Open dialog for new/edit regulation ───
  const openRegDialog = (reg?: Regulation) => {
    if (reg) {
      setEditingReg(reg)
      setRegForm({
        title: reg.title,
        content: reg.content,
        category: reg.category,
        version: reg.version,
        filePath: reg.filePath || '',
        isActive: reg.isActive,
        publishDate: reg.publishDate,
      })
    } else {
      resetRegForm()
    }
    setShowRegDialog(true)
  }

  // ─── Save announcement ───
  const saveAnnouncement = async () => {
    if (!annForm.title || !annForm.content || !annForm.publishDate) return
    setSaving(true)
    try {
      const payload = {
        ...annForm,
        department: annForm.department || null,
        expiryDate: annForm.expiryDate || null,
      }
      const url = editingAnn ? `/api/announcements/${editingAnn.id}` : '/api/announcements'
      const method = editingAnn ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        await fetchAnnouncements()
        setShowAnnDialog(false)
        resetAnnForm()
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  // ─── Save regulation ───
  const saveRegulation = async () => {
    if (!regForm.title || !regForm.content || !regForm.publishDate) return
    setSaving(true)
    try {
      const payload = {
        ...regForm,
        filePath: regForm.filePath || null,
      }
      const url = editingReg ? `/api/regulations/${editingReg.id}` : '/api/regulations'
      const method = editingReg ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        await fetchRegulations()
        setShowRegDialog(false)
        resetRegForm()
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  // ─── Delete handler ───
  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const url = deleteConfirm.type === 'ann'
        ? `/api/announcements/${deleteConfirm.id}`
        : `/api/regulations/${deleteConfirm.id}`
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) {
        if (deleteConfirm.type === 'ann') await fetchAnnouncements()
        else await fetchRegulations()
      }
    } catch (e) { console.error(e) }
    finally { setDeleteConfirm(null) }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">اطلاعیه و آیین‌نامه‌ها</h2>
            <p className="text-xs text-muted-foreground">
              مدیریت اطلاعیه‌ها و آیین‌نامه‌های سازمانی
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Megaphone className="w-3 h-3" />
            {toPersianDigits(annStats.active)} اطلاعیه فعال
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <BookOpen className="w-3 h-3" />
            {toPersianDigits(regStats.active)} آیین‌نامه فعال
          </Badge>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-[400px] grid-cols-3">
            <TabsTrigger value="announcements" className="gap-2 text-xs">
              <Megaphone className="w-3.5 h-3.5" />
              اطلاعیه‌ها
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {toPersianDigits(announcements.length)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="regulations" className="gap-2 text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              آیین‌نامه‌ها
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {toPersianDigits(regulations.length)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              آمار
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجو..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 w-[200px] text-xs pr-9"
              />
            </div>
            {activeTab === 'announcements' && (
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => openAnnDialog()}>
                <Plus className="w-3.5 h-3.5" />
                افزودن اطلاعیه
              </Button>
            )}
            {activeTab === 'regulations' && (
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => openRegDialog()}>
                <Plus className="w-3.5 h-3.5" />
                افزودن آیین‌نامه
              </Button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* ANNOUNCEMENTS TAB */}
        {/* ═══════════════════════════════════════════ */}
        <TabsContent value="announcements">
          <AnnouncementsTab
            items={filteredAnn}
            loading={loading}
            annStats={annStats}
            viewMode={annView}
            priorityFilter={annPriorityFilter}
            categoryFilter={annCategoryFilter}
            onViewModeChange={setAnnView}
            onPriorityFilterChange={setAnnPriorityFilter}
            onCategoryFilterChange={setAnnCategoryFilter}
            onEdit={(ann) => openAnnDialog(ann)}
            onDelete={(id) => setDeleteConfirm({ type: 'ann', id })}
          />
        </TabsContent>

        {/* ═══════════════════════════════════════════ */}
        {/* REGULATIONS TAB */}
        {/* ═══════════════════════════════════════════ */}
        <TabsContent value="regulations">
          <RegulationsTab
            items={filteredReg}
            loading={loading}
            regStats={regStats}
            viewMode={regView}
            statusFilter={regStatusFilter}
            categoryFilter={regCategoryFilter}
            onViewModeChange={setRegView}
            onStatusFilterChange={setRegStatusFilter}
            onCategoryFilterChange={setRegCategoryFilter}
            onEdit={(reg) => openRegDialog(reg)}
            onDelete={(id) => setDeleteConfirm({ type: 'reg', id })}
          />
        </TabsContent>

        {/* ═══════════════════════════════════════════ */}
        {/* STATISTICS TAB */}
        {/* ═══════════════════════════════════════════ */}
        <TabsContent value="statistics">
          <StatisticsTab
            announcements={announcements}
            regulations={regulations}
            annStats={annStats}
            regStats={regStats}
            annPriorityChartData={annPriorityChartData}
            regStatusChartData={regStatusChartData}
            recentActivity={recentActivity}
          />
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════ */}
      {/* ANNOUNCEMENT DIALOG */}
      {/* ═══════════════════════════════════════════ */}
      <AnnouncementFormDialog
        open={showAnnDialog}
        editingAnn={editingAnn}
        annForm={annForm}
        saving={saving}
        onFormChange={setAnnForm}
        onSave={saveAnnouncement}
        onClose={() => setShowAnnDialog(false)}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* REGULATION DIALOG */}
      {/* ═══════════════════════════════════════════ */}
      <RegulationFormDialog
        open={showRegDialog}
        editingReg={editingReg}
        regForm={regForm}
        saving={saving}
        onFormChange={setRegForm}
        onSave={saveRegulation}
        onClose={() => setShowRegDialog(false)}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ═══════════════════════════════════════════ */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-red-500" />
              تایید حذف
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              آیا از حذف این {deleteConfirm?.type === 'ann' ? 'اطلاعیه' : 'آیین‌نامه'} اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} className="text-xs">
              انصراف
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="text-xs">
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
