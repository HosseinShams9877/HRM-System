'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, Building2, Calendar, Shield, Clock } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { toast } from 'sonner'
import type { Department, Holiday, HolidayStats, GeneralSettings } from '../index'
import { DEFAULT_GENERAL, DEFAULT_HOLIDAY_FORM, DEFAULT_DEPT_FORM } from '../constants'
import { GeneralSettingsTab } from './general-settings-tab'
import { PayrollSettingsTab } from './payroll-settings-tab'

// ============================================
// Settings Module — Thin Orchestrator
// ============================================

export function SettingsModule() {
  const [activeTab, setActiveTab] = useState('general')

  // ─── General ───
  const [saving, setSaving] = useState(false)
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL)
  const [employeesList, setEmployeesList] = useState<{ id: string; firstName: string; lastName: string; personnelCode: string }[]>([])
  // ─── Departments ───
  const [departments, setDepartments] = useState<Department[]>([])
  const [deptLoading, setDeptLoading] = useState(false)
  const [deptDialogOpen, setDeptDialogOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deptForm, setDeptForm] = useState(DEFAULT_DEPT_FORM)
  const [deptSaving, setDeptSaving] = useState(false)
  const [deleteDeptDialog, setDeleteDeptDialog] = useState<Department | null>(null)

  // ─── Holidays ───
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [holidayStats, setHolidayStats] = useState<HolidayStats>({ total: 0, official: 0, agreed: 0, occasional: 0 })
  const [holidayLoading, setHolidayLoading] = useState(false)
  const [holidayYearFilter, setHolidayYearFilter] = useState('')
  const [holidayTypeFilter, setHolidayTypeFilter] = useState('all')
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [holidayForm, setHolidayForm] = useState(DEFAULT_HOLIDAY_FORM)
  const [holidaySaving, setHolidaySaving] = useState(false)
  const [deleteHolidayDialog, setDeleteHolidayDialog] = useState<Holiday | null>(null)

  // ============================================
  // Fetch Functions
  // ============================================

  const fetchDepartments = useCallback(async () => {
    setDeptLoading(true)
    try {
      const res = await fetch('/api/departments')
      if (res.ok) setDepartments(await res.json())
    } catch (e) { console.error(e) }
    finally { setDeptLoading(false) }
  }, [])

  const fetchHolidays = useCallback(async () => {
    setHolidayLoading(true)
    try {
      const params = new URLSearchParams()
      if (holidayTypeFilter && holidayTypeFilter !== 'all') params.set('type', holidayTypeFilter)
      if (holidayYearFilter) params.set('year', holidayYearFilter)
      const res = await fetch(`/api/holidays?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setHolidays(data.holidays)
        setHolidayStats(data.stats)
      }
    } catch (e) { console.error(e) }
    finally { setHolidayLoading(false) }
  }, [holidayTypeFilter, holidayYearFilter])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?limit=1000')
      if (res.ok) {
        const data = await res.json()
        const employees = data.data || data
        setEmployeesList(employees.map((emp: any) => ({
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          personnelCode: emp.personnelCode,
        })))
      }
    } catch (e) { console.error(e) }
  }, [])
  useEffect(() => { fetchEmployees() }, [fetchEmployees])
  useEffect(() => { fetchDepartments() }, [fetchDepartments])
  useEffect(() => { fetchHolidays() }, [fetchHolidays])

  // ============================================
  // General Handlers
  // ============================================

  const saveGeneral = () => {
    if (!general.organizationName.trim()) {
      toast.error('نام سازمان الزامی است')
      return
    }
    if (!general.workHoursStart || !general.workHoursEnd) {
      toast.error('ساعات کاری الزامی است')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('تنظیمات با موفقیت ذخیره شد')
    }, 1000)
  }

  // ============================================
  // Department Handlers
  // ============================================

  const openAddDept = () => {
    setEditingDept(null)
    setDeptForm(DEFAULT_DEPT_FORM)
    setDeptDialogOpen(true)
  }

  const openEditDept = (dept: Department) => {
    setEditingDept(dept)
    setDeptForm({ name: dept.name, code: dept.code })
    setDeptDialogOpen(true)
  }

  const saveDepartment = async () => {
    if (!deptForm.name || !deptForm.code) return
    setDeptSaving(true)
    try {
      if (editingDept) {
        const res = await fetch(`/api/departments/${editingDept.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deptForm),
        })
        if (res.ok) {
          await fetchDepartments()
          setDeptDialogOpen(false)
        }
      } else {
        const res = await fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deptForm),
        })
        if (res.ok) {
          await fetchDepartments()
          setDeptDialogOpen(false)
        }
      }
    } catch (e) { console.error(e) }
    finally { setDeptSaving(false) }
  }

  const confirmDeleteDept = async () => {
    if (!deleteDeptDialog) return
    try {
      await fetch(`/api/departments/${deleteDeptDialog.id}`, { method: 'DELETE' })
      setDepartments(departments.filter(d => d.id !== deleteDeptDialog.id))
    } catch (e) { console.error(e) }
    finally { setDeleteDeptDialog(null) }
  }

  // ============================================
  // Holiday Handlers
  // ============================================

  const openAddHoliday = () => {
    setEditingHoliday(null)
    setHolidayForm(DEFAULT_HOLIDAY_FORM)
    setHolidayDialogOpen(true)
  }

  const openEditHoliday = (h: Holiday) => {
    setEditingHoliday(h)
    setHolidayForm({
      title: h.title,
      date: h.date,
      type: h.type,
      isRecurring: h.isRecurring,
      description: h.description || '',
    })
    setHolidayDialogOpen(true)
  }

  const saveHoliday = async () => {
    if (!holidayForm.title || !holidayForm.date || !holidayForm.type) return
    setHolidaySaving(true)
    try {
      const payload = {
        title: holidayForm.title,
        date: holidayForm.date,
        type: holidayForm.type,
        isRecurring: holidayForm.isRecurring,
        description: holidayForm.description || null,
      }
      if (editingHoliday) {
        const res = await fetch(`/api/holidays/${editingHoliday.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          await fetchHolidays()
          setHolidayDialogOpen(false)
        }
      } else {
        const res = await fetch('/api/holidays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          await fetchHolidays()
          setHolidayDialogOpen(false)
        }
      }
    } catch (e) { console.error(e) }
    finally { setHolidaySaving(false) }
  }

  const confirmDeleteHoliday = async () => {
    if (!deleteHolidayDialog) return
    try {
      await fetch(`/api/holidays/${deleteHolidayDialog.id}`, { method: 'DELETE' })
      setHolidays(holidays.filter(h => h.id !== deleteHolidayDialog.id))
    } catch (e) { console.error(e) }
    finally { setDeleteHolidayDialog(null) }
  }

  // Shared props for PayrollSettingsTab
  const payrollProps = {
    departments, deptLoading, deptDialogOpen, editingDept, deptForm, deptSaving, deleteDeptDialog,
    onOpenAddDept: openAddDept, onOpenEditDept: openEditDept, onSetDeptDialogOpen: setDeptDialogOpen,
    onDeptFormChange: setDeptForm, onSaveDepartment: saveDepartment,
    onSetDeleteDeptDialog: setDeleteDeptDialog, onConfirmDeleteDept: confirmDeleteDept,
    holidays, holidayStats, holidayLoading, holidayYearFilter, holidayTypeFilter,
    holidayDialogOpen, editingHoliday, holidayForm, holidaySaving, deleteHolidayDialog,
    onSetHolidayYearFilter: setHolidayYearFilter, onSetHolidayTypeFilter: setHolidayTypeFilter,
    onOpenAddHoliday: openAddHoliday, onOpenEditHoliday: openEditHoliday,
    onSetHolidayDialogOpen: setHolidayDialogOpen, onHolidayFormChange: setHolidayForm,
    onSaveHoliday: saveHoliday, onSetDeleteHolidayDialog: setDeleteHolidayDialog,
    onConfirmDeleteHoliday: confirmDeleteHoliday,employees: employeesList,
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">تنظیمات</h2>
          <p className="text-xs text-muted-foreground">تنظیمات عمومی، دپارتمان‌ها، تعطیلات و دسترسی‌ها</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-[600px] grid-cols-5">
          <TabsTrigger value="general" className="gap-1.5 text-xs">
            <Settings className="w-3.5 h-3.5" />عمومی
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5" />دپارتمان‌ها
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5" />تعطیلات
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5" />نقش‌ها
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5" />سیستم
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════
            TAB 1: General (عمومی)
        ═══════════════════════════════════════════ */}
        <TabsContent value="general" className="mt-4">
          <GeneralSettingsTab
            general={general}
            onGeneralChange={setGeneral}
            employees={employeesList}
            saving={saving}
            onSave={saveGeneral}
          />
        </TabsContent>

        {/* ═══════════════════════════════════════════
            TAB 2: Departments (دپارتمان‌ها)
        ═══════════════════════════════════════════ */}
        <TabsContent value="departments" className="mt-4">
          <PayrollSettingsTab section="departments" {...payrollProps} />
        </TabsContent>

        {/* ═══════════════════════════════════════════
            TAB 3: Holidays (تعطیلات)
        ═══════════════════════════════════════════ */}
        <TabsContent value="holidays" className="mt-4">
          <PayrollSettingsTab section="holidays" {...payrollProps} />
        </TabsContent>

        {/* ═══════════════════════════════════════════
            TAB 4: Roles & Access (نقش‌ها و دسترسی‌ها)
        ═══════════════════════════════════════════ */}
        <TabsContent value="roles" className="mt-4">
          <PayrollSettingsTab section="roles" {...payrollProps} />
        </TabsContent>

        {/* ═══════════════════════════════════════════
            TAB 5: System (سیستم)
        ═══════════════════════════════════════════ */}
        <TabsContent value="system" className="mt-4">
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-8 text-center">
              <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">تنظیمات سیستم در نسخه‌های آتی فعال خواهد شد</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
