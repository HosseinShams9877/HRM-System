// components/shifts/components/shifts-module.tsx

'use client'

import { useState } from 'react'
import { Search, Plus, UserCheck, Settings2, CalendarOff, Loader2 } from 'lucide-react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { useShiftsData } from '../hooks/use-shifts-data'
import { StatsCards } from '../stats/stats-cards'
import { ShiftsList } from './shifts-list'
import { AssignmentsList } from './assignments-list'
import { HolidaysList } from './holidays-list'
import { ShiftFormDialog } from './shift-form-dialog'
import { AssignShiftDialog } from './assign-shift-dialog'
import { HolidayFormDialog } from './holiday-form-dialog'
import { ShiftDetailDialog } from './shift-detail-dialog'
import { WorkShiftData, HolidayData } from '../types'
import { HOLIDAY_TYPES } from '../constants'

export function ShiftsModule() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments' | 'holidays'>('shifts')
  const [holidayTypeFilter, setHolidayTypeFilter] = useState('all')
  
  // Dialog states
  const [showCreate, setShowCreate] = useState(false)
  const [editShift, setEditShift] = useState<WorkShiftData | null>(null)
  const [detailShift, setDetailShift] = useState<WorkShiftData | null>(null)
  const [showAssign, setShowAssign] = useState(false)
  const [showHolidayForm, setShowHolidayForm] = useState(false)
  const [editHoliday, setEditHoliday] = useState<HolidayData | null>(null)

  const {
    shifts,
    employees,
    holidays,
    assignments,
    stats,
    holidayStats,
    loading,
    fetchShifts,
    fetchAssignments,
    fetchHolidays,
    createShift,
    updateShift,
    deleteShift,
    assignShift,
    endAssignment,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  } = useShiftsData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
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
            <Settings2 className="w-5 h-5 text-emerald-600" />
            شیفت کاری و تعطیلات
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            تعریف شیفت‌های کاری دینامیک و مدیریت تعطیلات
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'holidays' && (
            <Button
              onClick={() => { setEditHoliday(null); setShowHolidayForm(true) }}
              variant="outline"
              className="gap-2"
            >
              <CalendarOff className="w-4 h-4" />
              تعریف تعطیلی
            </Button>
          )}
          <Button
            onClick={() => setShowAssign(true)}
            variant="outline"
            className="gap-2"
          >
            <UserCheck className="w-4 h-4" />
            انتساب به کارمند
          </Button>
          <Button
            onClick={() => setShowCreate(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            تعریف شیفت جدید
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards shifts={stats} holidays={holidayStats} />

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'shifts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('shifts')}
        >
          شیفت‌ها ({shifts.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('assignments')}
        >
          انتساب‌ها ({assignments.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'holidays'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('holidays')}
        >
          تعطیلات ({holidays.length})
        </button>
      </div>

      {/* Search & Filters */}
      {activeTab === 'shifts' && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="جستجو نام یا کد شیفت..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              fetchShifts(e.target.value)
            }}
            className="pr-10"
          />
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="flex items-center gap-2">
          <Select value={holidayTypeFilter} onValueChange={(v) => {
            setHolidayTypeFilter(v)
            fetchHolidays(v)
          }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="نوع تعطیلی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه انواع</SelectItem>
              {HOLIDAY_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content */}
      {activeTab === 'shifts' && (
        <ShiftsList
          shifts={shifts}
          onView={setDetailShift}
          onEdit={setEditShift}
          onDelete={async (id) => {
            if (confirm('آیا از حذف این شیفت اطمینان دارید؟')) {
              const success = await deleteShift(id)
              if (success) fetchShifts(search)
            }
          }}
        />
      )}

      {activeTab === 'assignments' && (
        <AssignmentsList
          assignments={assignments as any}
          onEndAssignment={async (id) => {
            if (confirm('آیا از پایان این انتساب اطمینان دارید؟')) {
              const success = await endAssignment(id)
              if (success) {
                fetchAssignments()
                fetchShifts(search)
              }
            }
          }}
        />
      )}

      {activeTab === 'holidays' && (
        <HolidaysList
          holidays={holidays}
          onEdit={(h) => { setEditHoliday(h); setShowHolidayForm(true) }}
          onDelete={async (id) => {
            if (confirm('آیا از حذف این تعطیلی اطمینان دارید؟')) {
              const success = await deleteHoliday(id)
              if (success) fetchHolidays(holidayTypeFilter)
            }
          }}
        />
      )}

      {/* Dialogs */}
      <ShiftFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
          const success = await createShift(data)
          if (success) {
            setShowCreate(false)
            fetchShifts(search)
          }
        }}
      />

      <ShiftFormDialog
        open={!!editShift}
        onClose={() => setEditShift(null)}
        onSubmit={async (data) => {
          if (editShift) {
            const success = await updateShift(editShift.id, data)
            if (success) {
              setEditShift(null)
              fetchShifts(search)
            }
          }
        }}
        initialData={editShift}
      />

      <ShiftDetailDialog
        open={!!detailShift}
        onClose={() => setDetailShift(null)}
        shift={detailShift}
      />

      <AssignShiftDialog
        open={showAssign}
        onClose={() => setShowAssign(false)}
        onSubmit={async (data) => {
          const success = await assignShift(data)
          if (success) {
            setShowAssign(false)
            fetchShifts(search)
            fetchAssignments()
          }
        }}
        employees={employees}
        shifts={shifts}
      />

      <HolidayFormDialog
        open={showHolidayForm || !!editHoliday}
        onClose={() => { setShowHolidayForm(false); setEditHoliday(null) }}
        onSubmit={async (data) => {
          let success = false
          if (editHoliday) {
            success = await updateHoliday(editHoliday.id, data)
          } else {
            success = await createHoliday(data)
          }
          if (success) {
            setShowHolidayForm(false)
            setEditHoliday(null)
            fetchHolidays(holidayTypeFilter)
          }
        }}
        initialData={editHoliday}
      />
    </div>
  )
}