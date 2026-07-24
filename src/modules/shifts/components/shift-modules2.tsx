'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Clock, Plus, Search, Eye, Edit3, Trash2, Users,
  Loader2, Calendar, Sun, Moon, Coffee, AlertTriangle,
  CheckCircle2, XCircle, ArrowUpDown, Copy, ChevronLeft,
  Settings2, UserCheck, MoreVertical, CalendarOff, Star, RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Switch } from '@/core/components/ui/switch'
import { Separator } from '@/core/components/ui/separator'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Textarea } from '@/core/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/core/components/ui/dropdown-menu'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits, getTodayShamsi, formatShamsi } from '@/core/lib/utils-fa'

// ============================================
// Types
// ============================================

interface ShiftSchedule {
  id?: string
  dayOfWeek: number
  dayName: string
  isWorkingDay: boolean
  startTime: string
  endTime: string
  breakStart: string | null
  breakEnd: string | null
  lateThreshold: string | null
  earlyLeaveThreshold: string | null
  minWorkHours: number
}

interface WorkShiftData {
  id: string
  name: string
  code: string
  color: string
  description: string | null
  isActive: boolean
  schedules: ShiftSchedule[]
  _count?: { assignments: number }
  assignments?: { employee: { id: string; firstName: string; lastName: string; personnelCode: string; department: string | null } }[]
}

interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  department: string | null
  position: string | null
}

interface HolidayData {
  id: string
  title: string
  date: string
  type: string
  isRecurring: boolean
  description: string | null
}

// ============================================
// Constants
// ============================================

const DAYS_OF_WEEK = [
  { value: 0, label: 'شنبه', short: 'ش' },
  { value: 1, label: 'یکشنبه', short: 'ی' },
  { value: 2, label: 'دوشنبه', short: 'د' },
  { value: 3, label: 'سه‌شنبه', short: 'س' },
  { value: 4, label: 'چهارشنبه', short: 'چ' },
  { value: 5, label: 'پنجشنبه', short: 'پ' },
  { value: 6, label: 'جمعه', short: 'ج' },
]

const SHIFT_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
]

const HOLIDAY_TYPES = [
  { value: 'official', label: 'رسمی', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: Star },
  { value: 'agreed', label: 'توافقی', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: CalendarOff },
  { value: 'occasional', label: 'موقت', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: Clock },
]

const DEFAULT_SCHEDULES: ShiftSchedule[] = DAYS_OF_WEEK.map(d => ({
  dayOfWeek: d.value,
  dayName: d.label,
  isWorkingDay: d.value < 6,
  startTime: '08:00',
  endTime: '17:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  lateThreshold: '08:15',
  earlyLeaveThreshold: '16:45',
  minWorkHours: 8,
}))

// ============================================
// Weekly Schedule Grid
// ============================================

function WeeklyScheduleGrid({
  schedules,
  onChange,
  readOnly,
}: {
  schedules: ShiftSchedule[]
  onChange?: (schedules: ShiftSchedule[]) => void
  readOnly?: boolean
}) {
  const toggleWorkingDay = (dayOfWeek: number) => {
    if (readOnly || !onChange) return
    onChange(schedules.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, isWorkingDay: !s.isWorkingDay } : s
    ))
  }

  const updateSchedule = (dayOfWeek: number, field: keyof ShiftSchedule, value: unknown) => {
    if (readOnly || !onChange) return
    onChange(schedules.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
    ))
  }

  const copyToAll = (sourceDay: number) => {
    if (readOnly || !onChange) return
    const source = schedules.find(s => s.dayOfWeek === sourceDay)
    if (!source) return
    onChange(schedules.map(s =>
      s.isWorkingDay ? {
        ...s,
        startTime: source.startTime,
        endTime: source.endTime,
        breakStart: source.breakStart,
        breakEnd: source.breakEnd,
        lateThreshold: source.lateThreshold,
        earlyLeaveThreshold: source.earlyLeaveThreshold,
        minWorkHours: source.minWorkHours,
      } : s
    ))
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[100px_60px_1fr_1fr_1fr_80px] gap-2 px-2 py-2 text-[10px] font-medium text-muted-foreground bg-muted/30 rounded-t-lg">
        <div>روز</div>
        <div>کاری</div>
        <div>ساعت کاری</div>
        <div>استراحت</div>
        <div>سقف تاخیر / خروج زودرس</div>
        <div>حداقل کارکرد</div>
      </div>
      {DAYS_OF_WEEK.map(day => {
        const schedule = schedules.find(s => s.dayOfWeek === day.value)
        if (!schedule) return null
        return (
          <div
            key={day.value}
            className={`grid grid-cols-[100px_60px_1fr_1fr_1fr_80px] gap-2 px-2 py-2.5 items-center rounded-lg transition-colors ${
              !schedule.isWorkingDay ? 'bg-muted/20 opacity-50' : day.value === 6 ? 'bg-red-50/50 dark:bg-red-950/10' : day.value === 5 ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{day.label}</span>
              {!readOnly && schedule.isWorkingDay && (
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToAll(day.value)} title="کپی به همه روزها">
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex justify-center">
              <Switch checked={schedule.isWorkingDay} onCheckedChange={() => toggleWorkingDay(day.value)} disabled={readOnly} className="scale-75" />
            </div>
            {schedule.isWorkingDay ? (
              <div className="flex items-center gap-1">
                <Input type="time" value={schedule.startTime} onChange={(e) => updateSchedule(day.value, 'startTime', e.target.value)} disabled={readOnly} className="h-7 text-xs w-[85px] font-mono" dir="ltr" />
                <span className="text-muted-foreground text-xs">تا</span>
                <Input type="time" value={schedule.endTime} onChange={(e) => updateSchedule(day.value, 'endTime', e.target.value)} disabled={readOnly} className="h-7 text-xs w-[85px] font-mono" dir="ltr" />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">تعطیل</div>
            )}
            {schedule.isWorkingDay ? (
              <div className="flex items-center gap-1">
                <Input type="time" value={schedule.breakStart || ''} onChange={(e) => updateSchedule(day.value, 'breakStart', e.target.value || null)} disabled={readOnly} className="h-7 text-xs w-[85px] font-mono" dir="ltr" placeholder="--:--" />
                <span className="text-muted-foreground text-xs">تا</span>
                <Input type="time" value={schedule.breakEnd || ''} onChange={(e) => updateSchedule(day.value, 'breakEnd', e.target.value || null)} disabled={readOnly} className="h-7 text-xs w-[85px] font-mono" dir="ltr" placeholder="--:--" />
              </div>
            ) : (<div>—</div>)}
            {schedule.isWorkingDay ? (
              <div className="flex items-center gap-1">
                <Input type="time" value={schedule.lateThreshold || ''} onChange={(e) => updateSchedule(day.value, 'lateThreshold', e.target.value || null)} disabled={readOnly} className="h-7 text-xs w-[85px] font-mono" dir="ltr" placeholder="تاخیر" />
                <span className="text-muted-foreground text-xs">/</span>
                <Input type="time" value={schedule.earlyLeaveThreshold || ''} onChange={(e) => updateSchedule(day.value, 'earlyLeaveThreshold', e.target.value || null)} disabled={readOnly} className="h-7 text-xs w-[85px] font-mono" dir="ltr" placeholder="خروج زودرس" />
              </div>
            ) : (<div>—</div>)}
            {schedule.isWorkingDay ? (
              <div className="flex items-center gap-1">
                <Input type="number" value={schedule.minWorkHours} onChange={(e) => updateSchedule(day.value, 'minWorkHours', parseFloat(e.target.value) || 8)} disabled={readOnly} className="h-7 text-xs w-[60px] font-mono" dir="ltr" min={0} max={24} step={0.5} />
                <span className="text-[10px] text-muted-foreground">ساعت</span>
              </div>
            ) : (<div>—</div>)}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// Mini Weekly View
// ============================================

function MiniWeeklyView({ schedules, color }: { schedules: ShiftSchedule[]; color: string }) {
  return (
    <div className="flex gap-1 items-end">
      {DAYS_OF_WEEK.map(day => {
        const s = schedules.find(sc => sc.dayOfWeek === day.value)
        const isWork = s?.isWorkingDay
        return (
          <div key={day.value} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-muted-foreground">{day.short}</span>
            <div
              className={`w-6 rounded-sm text-[8px] font-mono text-center ${isWork ? 'text-white' : 'bg-muted/30 text-muted-foreground'}`}
              style={isWork ? { backgroundColor: color } : undefined}
            >
              {isWork ? s?.startTime?.slice(0, 2) : '—'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// Shift Form Dialog
// ============================================

function ShiftFormDialog({
  open, onClose, onSubmit, initialData,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  initialData?: WorkShiftData | null
}) {
  const isEdit = !!initialData
  const [form, setForm] = useState({ name: '', code: '', color: '#10b981', description: '', isActive: true })
  const [schedules, setSchedules] = useState<ShiftSchedule[]>(DEFAULT_SCHEDULES)
  const [copySourceDay, setCopySourceDay] = useState<number | null>(null)

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, code: initialData.code, color: initialData.color, description: initialData.description || '', isActive: initialData.isActive })
      setSchedules(initialData.schedules.length > 0
        ? DAYS_OF_WEEK.map(d => { const existing = initialData.schedules.find(s => s.dayOfWeek === d.value); return existing || { dayOfWeek: d.value, dayName: d.label, isWorkingDay: d.value < 6, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', lateThreshold: '08:15', earlyLeaveThreshold: '16:45', minWorkHours: 8 } })
        : DEFAULT_SCHEDULES
      )
    } else {
      setForm({ name: '', code: '', color: '#10b981', description: '', isActive: true })
      setSchedules(DEFAULT_SCHEDULES)
    }
    setCopySourceDay(null)
  }, [open, initialData])

  const handleCopyDay = (sourceDay: number) => {
    const source = schedules.find(s => s.dayOfWeek === sourceDay)
    if (!source) return
    setSchedules(prev => prev.map(s => s.isWorkingDay ? { ...s, startTime: source.startTime, endTime: source.endTime, breakStart: source.breakStart, breakEnd: source.breakEnd, lateThreshold: source.lateThreshold, earlyLeaveThreshold: source.earlyLeaveThreshold, minWorkHours: source.minWorkHours } : s))
  }

  const handleSubmit = () => {
    if (!form.name || !form.code) return
    onSubmit({ ...form, schedules })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            {isEdit ? 'ویرایش شیفت کاری' : 'تعریف شیفت کاری جدید'}
          </DialogTitle>
          <DialogDescription>{isEdit ? 'برنامه هفتگی و تنظیمات شیفت را بروزرسانی کنید' : 'شیفت جدید با برنامه هفتگی دینامیک تعریف کنید'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />اطلاعات پایه</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>نام شیفت *</Label><Input placeholder="مثلاً: شیفت صبح" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>کد شیفت *</Label><Input placeholder="SH-001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} dir="ltr" /></div>
              <div className="space-y-2"><Label>رنگ</Label><div className="flex gap-1.5 flex-wrap">{SHIFT_COLORS.map(c => (<button key={c} className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} onClick={() => setForm({ ...form, color: c })} />))}</div></div>
            </div>
            <div className="mt-3 space-y-2"><Label>توضیحات</Label><Input placeholder="توضیحات اختیاری..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" />برنامه هفتگی</h4>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">کپی تنظیمات روز:</Label>
                <Select value={copySourceDay !== null ? String(copySourceDay) : ''} onValueChange={(v) => { if (v) { handleCopyDay(parseInt(v)); setCopySourceDay(null) } }}>
                  <SelectTrigger className="w-[130px] h-7 text-xs"><SelectValue placeholder="انتخاب روز" /></SelectTrigger>
                  <SelectContent>{DAYS_OF_WEEK.map(d => (<SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden"><WeeklyScheduleGrid schedules={schedules} onChange={setSchedules} /></div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" />روزهای کاری: {toPersianDigits(schedules.filter(s => s.isWorkingDay).length)}</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" />روزهای تعطیل: {toPersianDigits(schedules.filter(s => !s.isWorkingDay).length)}</div>
              {schedules.find(s => s.isWorkingDay) && (<div>ساعات کاری: {schedules.find(s => s.isWorkingDay)?.startTime} تا {schedules.find(s => s.isWorkingDay)?.endTime}</div>)}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!form.name || !form.code} className="gap-2"><Clock className="w-4 h-4" />{isEdit ? 'بروزرسانی' : 'ایجاد شیفت'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Assign Shift Dialog
// ============================================

function AssignShiftDialog({ open, onClose, onSubmit, employees, shifts }: {
  open: boolean; onClose: () => void; onSubmit: (data: Record<string, unknown>) => void; employees: EmployeeBasic[]; shifts: WorkShiftData[]
}) {
  const today = getTodayShamsi()
  const [form, setForm] = useState({ employeeId: '', shiftId: '', startDate: `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`, isDefault: false })
  const [empSearch, setEmpSearch] = useState('')

  useEffect(() => {
    setForm({ employeeId: '', shiftId: '', startDate: `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`, isDefault: false })
    setEmpSearch('')
  }, [open])

  const filteredEmployees = empSearch ? employees.filter(e => `${e.firstName} ${e.lastName}`.includes(empSearch) || e.personnelCode.includes(empSearch)) : employees
  const selectedShift = shifts.find(s => s.id === form.shiftId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" />انتساب شیفت به کارمند</DialogTitle>
          <DialogDescription>شیفت کاری مورد نظر را به کارمند اختصاص دهید</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>شیفت کاری *</Label><Select value={form.shiftId} onValueChange={(v) => setForm({ ...form, shiftId: v })}><SelectTrigger><SelectValue placeholder="انتخاب شیفت" /></SelectTrigger><SelectContent>{shifts.filter(s => s.isActive).map(s => (<SelectItem key={s.id} value={s.id}><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />{s.name} ({s.code})</div></SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>تاریخ شروع *</Label><Input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} dir="ltr" placeholder="1405/01/01" /></div>
          </div>
          {selectedShift && (<Card className="border-0 shadow-sm bg-muted/30"><CardContent className="p-3"><div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedShift.color }} /><span className="text-sm font-medium">{selectedShift.name}</span><Badge variant="outline" className="text-[10px]">{selectedShift.code}</Badge></div><MiniWeeklyView schedules={selectedShift.schedules} color={selectedShift.color} /></CardContent></Card>)}
          <div className="space-y-2">
            <Label>کارمند *</Label>
            <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="جستجو نام یا کد پرسنلی..." value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} className="pr-10 mb-2" /></div>
            <div className="max-h-[200px] overflow-y-auto border rounded-lg">
              {filteredEmployees.map(emp => (<button key={emp.id} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${form.employeeId === emp.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`} onClick={() => { setForm({ ...form, employeeId: emp.id }); setEmpSearch('') }}><Avatar className="w-7 h-7"><AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[9px] font-bold">{emp.firstName[0]}</AvatarFallback></Avatar><div className="flex-1 text-right"><span className="text-xs font-medium">{emp.firstName} {emp.lastName}</span><p className="text-[10px] text-muted-foreground">{emp.department || '—'}</p></div><Badge variant="outline" className="text-[10px]">{toPersianDigits(emp.personnelCode)}</Badge></button>))}
            </div>
          </div>
          <div className="flex items-center gap-2"><Switch checked={form.isDefault} onCheckedChange={(v) => setForm({ ...form, isDefault: v })} /><Label className="text-xs">تنظیم به‌عنوان شیفت پیش‌فرض</Label></div>
        </div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={onClose}>انصراف</Button><Button onClick={() => onSubmit(form)} disabled={!form.employeeId || !form.shiftId} className="gap-2"><UserCheck className="w-4 h-4" />انتساب</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Holiday Form Dialog
// ============================================

function HolidayFormDialog({ open, onClose, onSubmit, initialData }: {
  open: boolean; onClose: () => void; onSubmit: (data: Record<string, unknown>) => void; initialData?: HolidayData | null
}) {
  const isEdit = !!initialData
  const [form, setForm] = useState({ title: '', date: '', type: 'official', isRecurring: false, description: '' })

  useEffect(() => {
    if (initialData) {
      setForm({ title: initialData.title, date: initialData.date, type: initialData.type, isRecurring: initialData.isRecurring, description: initialData.description || '' })
    } else {
      const today = getTodayShamsi()
      setForm({ title: '', date: `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`, type: 'official', isRecurring: false, description: '' })
    }
  }, [open, initialData])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarOff className="w-5 h-5 text-red-600" />{isEdit ? 'ویرایش تعطیلی' : 'تعریف تعطیلی جدید'}</DialogTitle>
          <DialogDescription>{isEdit ? 'اطلاعات تعطیلی را بروزرسانی کنید' : 'تعطیلی رسمی یا توافقی ثبت کنید'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>عنوان تعطیلی *</Label><Input placeholder="مثلاً: عید فطر" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>تاریخ *</Label><Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} dir="ltr" placeholder="1405/01/01" /></div>
            <div className="space-y-2"><Label>نوع تعطیلی *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HOLIDAY_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2"><Switch checked={form.isRecurring} onCheckedChange={(v) => setForm({ ...form, isRecurring: v })} /><Label className="text-xs">تکرار هر سال (رسمی ماندگار)</Label></div>
          <div className="space-y-2"><Label>توضیحات</Label><Textarea placeholder="توضیحات اختیاری..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={() => onSubmit(form)} disabled={!form.title || !form.date} className="gap-2"><CalendarOff className="w-4 h-4" />{isEdit ? 'بروزرسانی' : 'ثبت تعطیلی'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Shift Detail Dialog
// ============================================

function ShiftDetailDialog({ open, onClose, shift }: { open: boolean; onClose: () => void; shift: WorkShiftData | null }) {
  if (!shift) return null
  const workingDays = shift.schedules.filter(s => s.isWorkingDay)
  const totalWeeklyHours = workingDays.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number)
    const [eh, em] = s.endTime.split(':').map(Number)
    return sum + ((eh * 60 + em - sh * 60 - sm) / 60)
  }, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: shift.color }} />{shift.name}<Badge variant="outline" className="text-xs">{shift.code}</Badge>{!shift.isActive && <Badge className="text-[10px] bg-red-100 text-red-700">غیرفعال</Badge>}</DialogTitle>
          <DialogDescription>{shift.description || 'بدون توضیحات'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-emerald-600">{toPersianDigits(workingDays.length)}</div><div className="text-[10px] text-muted-foreground">روز کاری</div></CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-blue-600">{toPersianDigits(Math.round(totalWeeklyHours * 10) / 10)}</div><div className="text-[10px] text-muted-foreground">ساعت هفتگی</div></CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-purple-600">{toPersianDigits(shift._count?.assignments || 0)}</div><div className="text-[10px] text-muted-foreground">کارمند فعال</div></CardContent></Card>
          </div>
          <div className="border rounded-lg overflow-hidden"><WeeklyScheduleGrid schedules={shift.schedules} readOnly /></div>
          {shift.assignments && shift.assignments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">کارکنان منتسب</h4>
              <div className="grid grid-cols-2 gap-2">{shift.assignments.map(a => (<div key={a.employee.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"><Avatar className="w-7 h-7"><AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[9px] font-bold">{a.employee.firstName[0]}</AvatarFallback></Avatar><div><span className="text-xs font-medium">{a.employee.firstName} {a.employee.lastName}</span><p className="text-[10px] text-muted-foreground">{a.employee.department || '—'}</p></div></div>))}</div>
            </div>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>بستن</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Main Shifts Module
// ============================================

export function ShiftsModule() {
  const [shifts, setShifts] = useState<WorkShiftData[]>([])
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, totalEmployees: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editShift, setEditShift] = useState<WorkShiftData | null>(null)
  const [detailShift, setDetailShift] = useState<WorkShiftData | null>(null)
  const [showAssign, setShowAssign] = useState(false)
  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments' | 'holidays'>('shifts')
  const [assignments, setAssignments] = useState<unknown[]>([])

  // تعطیلات
  const [holidays, setHolidays] = useState<HolidayData[]>([])
  const [holidayStats, setHolidayStats] = useState({ total: 0, official: 0, agreed: 0, occasional: 0 })
  const [showHolidayForm, setShowHolidayForm] = useState(false)
  const [editHoliday, setEditHoliday] = useState<HolidayData | null>(null)
  const [holidayTypeFilter, setHolidayTypeFilter] = useState('all')

  const { toast } = useToast()

  const fetchShifts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/shifts?${params.toString()}`)
      if (res.ok) { const json = await res.json(); const payload = json.data || json; setShifts(payload.shifts); setStats(payload.stats) }
    } catch (err) { console.error('Fetch shifts error:', err) }
    finally { setLoading(false) }
  }, [search])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?status=active')
      if (res.ok) { const result = await res.json(); const empList = Array.isArray(result) ? result : (result.data || []); setEmployees(empList.map((e: EmployeeBasic) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName, personnelCode: e.personnelCode, department: e.department, position: e.position }))) }
    } catch (err) { console.error('Fetch employees error:', err) }
  }, [])

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/shift-assignments')
      if (res.ok) { const json = await res.json(); const payload = json.data || json; setAssignments(payload.assignments || []) }
    } catch (err) { console.error('Fetch assignments error:', err) }
  }, [])

  const fetchHolidays = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (holidayTypeFilter && holidayTypeFilter !== 'all') params.set('type', holidayTypeFilter)
      const res = await fetch(`/api/holidays?${params.toString()}`)
      if (res.ok) { const json = await res.json(); const payload = json.data || json; setHolidays(payload.holidays); setHolidayStats(payload.stats) }
    } catch (err) { console.error('Fetch holidays error:', err) }
  }, [holidayTypeFilter])

  useEffect(() => { fetchShifts(); fetchEmployees(); fetchAssignments(); fetchHolidays() }, [fetchShifts, fetchEmployees, fetchAssignments, fetchHolidays])

  // شیفت CRUD
  const handleCreate = async (data: Record<string, unknown>) => {
    try { const res = await fetch('/api/shifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (res.ok) { toast({ title: 'شیفت کاری با موفقیت ایجاد شد' }); setShowCreate(false); fetchShifts() } else { const err = await res.json(); toast({ title: err.error || 'خطا', variant: 'destructive' }) } } catch { toast({ title: 'خطا در ارتباط', variant: 'destructive' }) }
  }

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editShift) return
    try { const res = await fetch(`/api/shifts/${editShift.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (res.ok) { toast({ title: 'شیفت بروزرسانی شد' }); setEditShift(null); fetchShifts() } else { const err = await res.json(); toast({ title: err.error || 'خطا', variant: 'destructive' }) } } catch { toast({ title: 'خطا در ارتباط', variant: 'destructive' }) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این شیفت اطمینان دارید؟')) return
    try { const res = await fetch(`/api/shifts/${id}`, { method: 'DELETE' }); if (res.ok) { toast({ title: 'شیفت حذف شد' }); fetchShifts() } else { const err = await res.json(); toast({ title: err.error || 'خطا', variant: 'destructive' }) } } catch { toast({ title: 'خطا در ارتباط', variant: 'destructive' }) }
  }

  const handleAssign = async (data: Record<string, unknown>) => {
    try { const res = await fetch('/api/shift-assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (res.ok) { toast({ title: 'شیفت با موفقیت به کارمند انتساب شد' }); setShowAssign(false); fetchShifts(); fetchAssignments() } else { const err = await res.json(); toast({ title: err.error || 'خطا', variant: 'destructive' }) } } catch { toast({ title: 'خطا در ارتباط', variant: 'destructive' }) }
  }

  const handleEndAssignment = async (id: string) => {
    if (!confirm('آیا از پایان این انتساب اطمینان دارید؟')) return
    try { const today = getTodayShamsi(); const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`; await fetch(`/api/shift-assignments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'end', endDate: todayStr }) }); toast({ title: 'انتساب پایان یافت' }); fetchAssignments(); fetchShifts() } catch { toast({ title: 'خطا', variant: 'destructive' }) }
  }

  // تعطیلات CRUD
  const handleHolidaySubmit = async (data: Record<string, unknown>) => {
    try {
      if (editHoliday) {
        const res = await fetch(`/api/holidays/${editHoliday.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        if (res.ok) { toast({ title: 'تعطیلی بروزرسانی شد' }); setEditHoliday(null); fetchHolidays() }
        else { const err = await res.json(); toast({ title: err.error || 'خطا', variant: 'destructive' }) }
      } else {
        const res = await fetch('/api/holidays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        if (res.ok) { toast({ title: 'تعطیلی با موفقیت ثبت شد' }); setShowHolidayForm(false); fetchHolidays() }
        else { const err = await res.json(); toast({ title: err.error || 'خطا', variant: 'destructive' }) }
      }
    } catch { toast({ title: 'خطا در ارتباط', variant: 'destructive' }) }
  }

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('آیا از حذف این تعطیلی اطمینان دارید؟')) return
    try { const res = await fetch(`/api/holidays/${id}`, { method: 'DELETE' }); if (res.ok) { toast({ title: 'تعطیلی حذف شد' }); fetchHolidays() } } catch { toast({ title: 'خطا', variant: 'destructive' }) }
  }

  if (loading) {
    return (<div className="flex items-center justify-center h-[60vh]"><div className="flex flex-col items-center gap-3 text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin" /><span className="text-sm">در حال بارگذاری...</span></div></div>)
  }

  // گرفتن نوع تعطیلی فارسی
  const getHolidayTypeBadge = (type: string) => {
    const t = HOLIDAY_TYPES.find(h => h.value === type)
    if (!t) return <Badge variant="outline" className="text-[10px]">{type}</Badge>
    const Icon = t.icon
    return <Badge className={`text-[10px] gap-1 ${t.color}`}><Icon className="w-3 h-3" />{t.label}</Badge>
  }

  // گروه‌بندی تعطیلات بر اساس ماه
  const holidaysByMonth = holidays.reduce<Record<string, HolidayData[]>>((acc, h) => {
    const parts = h.date.split('/')
    const monthKey = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : h.date
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(h)
    return acc
  }, {})

  const SHAMSI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Settings2 className="w-5 h-5 text-emerald-600" />شیفت کاری و تعطیلات</h2>
          <p className="text-sm text-muted-foreground mt-1">تعریف شیفت‌های کاری دینامیک و مدیریت تعطیلات</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'holidays' && (
            <Button onClick={() => { setEditHoliday(null); setShowHolidayForm(true) }} variant="outline" className="gap-2"><CalendarOff className="w-4 h-4" />تعریف تعطیلی</Button>
          )}
          <Button onClick={() => setShowAssign(true)} variant="outline" className="gap-2"><UserCheck className="w-4 h-4" />انتساب به کارمند</Button>
          <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="w-4 h-4" />تعریف شیفت جدید</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center"><div className="text-lg font-bold">{toPersianDigits(stats.total)}</div><div className="text-[10px] text-muted-foreground">کل شیفت‌ها</div></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-emerald-600">{toPersianDigits(stats.active)}</div><div className="text-[10px] text-muted-foreground">شیفت فعال</div></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-blue-600">{toPersianDigits(stats.totalEmployees)}</div><div className="text-[10px] text-muted-foreground">کارمند منتسب</div></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-red-600">{toPersianDigits(holidayStats.official)}</div><div className="text-[10px] text-muted-foreground">تعطیلی رسمی</div></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-amber-600">{toPersianDigits(holidayStats.agreed)}</div><div className="text-[10px] text-muted-foreground">تعطیلی توافقی</div></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-purple-600">{toPersianDigits(holidayStats.occasional)}</div><div className="text-[10px] text-muted-foreground">تعطیلی موقت</div></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'shifts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('shifts')}>شیفت‌ها ({toPersianDigits(shifts.length)})</button>
        <button className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assignments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('assignments')}>انتساب‌ها ({toPersianDigits(assignments.length)})</button>
        <button className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'holidays' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('holidays')}>تعطیلات ({toPersianDigits(holidays.length)})</button>
      </div>

      {/* Search for shifts */}
      {activeTab === 'shifts' && (
        <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="جستجو نام یا کد شیفت..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" /></div>
      )}

      {/* Holiday type filter */}
      {activeTab === 'holidays' && (
        <div className="flex items-center gap-2">
          <Select value={holidayTypeFilter} onValueChange={setHolidayTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="نوع تعطیلی" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه انواع</SelectItem>
              {HOLIDAY_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ===== SHIFTS TAB ===== */}
      {activeTab === 'shifts' && (
        shifts.length === 0 ? (
          <Card className="border-0 shadow-sm"><CardContent className="py-16 text-center"><Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" /><h3 className="text-sm font-medium text-muted-foreground">شیفت تعریف نشده</h3><p className="text-xs text-muted-foreground mt-1">اولین شیفت کاری را تعریف کنید</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {shifts.map(shift => {
              const workingDays = shift.schedules.filter(s => s.isWorkingDay)
              const totalHours = workingDays.reduce((sum, s) => { const [sh, sm] = s.startTime.split(':').map(Number); const [eh, em] = s.endTime.split(':').map(Number); return sum + ((eh * 60 + em - sh * 60 - sm) / 60) }, 0)
              return (
                <Card key={shift.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: shift.color }}>{shift.name[0]}</div>
                        <div>
                          <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{shift.name}</h3><Badge variant="outline" className="text-[10px]">{shift.code}</Badge>{!shift.isActive && <Badge className="text-[10px] bg-red-100 text-red-700">غیرفعال</Badge>}</div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{toPersianDigits(workingDays.length)} روز کاری · {toPersianDigits(Math.round(totalHours * 10) / 10)} ساعت هفتگی · {toPersianDigits(shift._count?.assignments || 0)} نفر</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailShift(shift)}><Eye className="w-3.5 h-3.5 ml-2" />مشاهده</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditShift(shift)}><Edit3 className="w-3.5 h-3.5 ml-2" />ویرایش</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(shift.id)}><Trash2 className="w-3.5 h-3.5 ml-2" />حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <MiniWeeklyView schedules={shift.schedules} color={shift.color} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* ===== ASSIGNMENTS TAB ===== */}
      {activeTab === 'assignments' && (
        (assignments as Record<string, unknown>[]).length === 0 ? (
          <Card className="border-0 shadow-sm"><CardContent className="py-16 text-center"><UserCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" /><h3 className="text-sm font-medium text-muted-foreground">انتسابی ثبت نشده</h3></CardContent></Card>
        ) : (
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">کارمند</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">شیفت</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">تاریخ شروع</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">وضعیت</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">عملیات</th>
                </tr></thead>
                <tbody>
                  {(assignments as Record<string, unknown>[]).map((a: Record<string, unknown>) => {
                    const emp = a.employee as Record<string, string> | undefined
                    const shift = a.shift as Record<string, string> | undefined
                    return (
                      <tr key={String(a.id)} className="hover:bg-muted/50 transition-colors border-b last:border-0">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar className="w-7 h-7"><AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[9px] font-bold">{emp?.firstName?.[0] || '?'}</AvatarFallback></Avatar><span className="text-xs font-medium">{emp?.firstName} {emp?.lastName}</span></div></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2">{shift?.color && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: String(shift.color) }} />}<span className="text-xs">{shift?.name}</span></div></td>
                        <td className="px-4 py-3"><span className="text-xs font-mono" dir="ltr">{String(a.startDate)}</span></td>
                        <td className="px-4 py-3"><Badge className={String(a.status) === 'active' ? 'text-[10px] bg-emerald-100 text-emerald-700' : 'text-[10px] bg-gray-100 text-gray-700'}>{String(a.status) === 'active' ? 'فعال' : 'پایان یافته'}</Badge></td>
                        <td className="px-4 py-3">{String(a.status) === 'active' && (<Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700" onClick={() => handleEndAssignment(String(a.id))}>پایان</Button>)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* ===== HOLIDAYS TAB ===== */}
      {activeTab === 'holidays' && (
        holidays.length === 0 ? (
          <Card className="border-0 shadow-sm"><CardContent className="py-16 text-center"><CalendarOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" /><h3 className="text-sm font-medium text-muted-foreground">تعطیلی ثبت نشده</h3><p className="text-xs text-muted-foreground mt-1">اولین تعطیلی را تعریف کنید</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(holidaysByMonth).sort(([a], [b]) => a.localeCompare(b)).map(([monthKey, monthHolidays]) => {
              const parts = monthKey.split('/')
              const monthNum = parseInt(parts[1] || '1')
              const monthName = `${parts[0]} - ${SHAMSI_MONTHS[monthNum - 1] || ''}`
              return (
                <Card key={monthKey} className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-500" />
                      {monthName}
                      <Badge variant="outline" className="text-[10px]">{toPersianDigits(monthHolidays.length)} تعطیلی</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {monthHolidays.map(h => (
                      <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-red-600" dir="ltr">{h.date.split('/').pop()}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{h.title}</span>
                              {getHolidayTypeBadge(h.type)}
                              {h.isRecurring && <Badge variant="outline" className="text-[10px] gap-1"><RotateCcw className="w-2.5 h-2.5" />سالانه</Badge>}
                            </div>
                            {h.description && <p className="text-[10px] text-muted-foreground mt-0.5">{h.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditHoliday(h); setShowHolidayForm(true) }}><Edit3 className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDeleteHoliday(h.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* Dialogs */}
      <ShiftFormDialog open={showCreate} onClose={() => setShowCreate(false)} onSubmit={handleCreate} />
      <ShiftFormDialog open={!!editShift} onClose={() => setEditShift(null)} onSubmit={handleEdit} initialData={editShift} />
      <ShiftDetailDialog open={!!detailShift} onClose={() => setDetailShift(null)} shift={detailShift} />
      <AssignShiftDialog open={showAssign} onClose={() => setShowAssign(false)} onSubmit={handleAssign} employees={employees} shifts={shifts} />
      <HolidayFormDialog open={showHolidayForm || !!editHoliday} onClose={() => { setShowHolidayForm(false); setEditHoliday(null) }} onSubmit={handleHolidaySubmit} initialData={editHoliday} />
    </div>
  )
}
