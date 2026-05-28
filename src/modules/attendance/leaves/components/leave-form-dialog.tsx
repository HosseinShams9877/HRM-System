'use client'

import { useState } from 'react'
import { CalendarOff, Search, FileText } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Textarea } from '@/core/components/ui/textarea'
import { toPersianDigits, getTodayShamsi } from '@/core/lib/utils-fa'
import type { EmployeeBasic } from '../index'

export function LeaveFormDialog({
  open,
  onClose,
  onSubmit,
  employees,
  currentUser
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  employees: EmployeeBasic[]
  currentUser?: { role: string; employeeId?: string }  
}) {
  const isEmployee = currentUser?.role === 'employee'
  const today = getTodayShamsi()
  const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`

  const defaultEmployeeId = isEmployee ? currentUser?.employeeId || '' : ''

  const [form, setForm] = useState({
    employeeId: defaultEmployeeId || "",
    type: 'استحقاقی',
    startDate: todayStr,
    endDate: todayStr,
    totalDays: '1',
    reason: '',
  })
  const [empSearch, setEmpSearch] = useState('')
  const [prevOpen, setPrevOpen] = useState(false)

  if (open && !prevOpen) {
    setPrevOpen(true)
    setForm({
      employeeId: defaultEmployeeId || '',
      type: 'استحقاقی',
      startDate: todayStr,
      endDate: todayStr,
      totalDays: '1',
      reason: '',
    })
    setEmpSearch('')
  } else if (!open && prevOpen) {
    setPrevOpen(false)
  }

  const filtered = isEmployee 
  ? employees.filter(e => e.id === currentUser?.employeeId)
  : empSearch
    ? employees.filter(e => `${e.firstName} ${e.lastName}`.includes(empSearch) || e.personnelCode.includes(empSearch))
    : employees
  // این تابع را در داخل LeaveFormDialog اضافه کنید (مثلاً بعد از تعریف filtered)
const handleSubmit = () => {
  if (!form.employeeId) return
  
  onSubmit({
    employeeId: form.employeeId,
    type: form.type,
    startDate: form.startDate,
    endDate: form.endDate,
    totalDays: Number(form.totalDays),  // ← تبدیل string به number
    reason: form.reason,
  })
}

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-purple-600" />
            ثبت درخواست مرخصی
          </DialogTitle>
          <DialogDescription>فرم درخواست مرخصی جدید را تکمیل کنید</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isEmployee && (
          <div className="space-y-2">
            <Label>کارمند *</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجو نام یا کد پرسنلی..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={form.employeeId} onValueChange={(v) => { setForm({ ...form, employeeId: v }); setEmpSearch('') }}>
              <SelectTrigger><SelectValue placeholder="انتخاب کارمند" /></SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {filtered.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.personnelCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>)}
          {isEmployee && (
            <div className="space-y-2">
              <Label>کارمند</Label>
              <div className="p-2 rounded-md bg-muted text-center font-medium">
                {employees.find(e => e.id === currentUser?.employeeId)?.firstName} {employees.find(e => e.id === currentUser?.employeeId)?.lastName}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع مرخصی *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="استحقاقی">استحقاقی</SelectItem>
                  <SelectItem value="استعلاجی">استعلاجی</SelectItem>
                  <SelectItem value="بدون حقوق">بدون حقوق</SelectItem>
                  <SelectItem value="ازدواج">ازدواج</SelectItem>
                  <SelectItem value="فوت">فوت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تعداد روز *</Label>
              <Input
                type="number"
                min="1"
                value={form.totalDays}
                onChange={(e) => setForm({ ...form, totalDays: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>تاریخ شروع *</Label>
              <Input
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                dir="ltr"
                placeholder="1405/01/01"
              />
            </div>
            <div className="space-y-2">
              <Label>تاریخ پایان *</Label>
              <Input
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                dir="ltr"
                placeholder="1405/01/03"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>دلیل</Label>
            <Textarea
              placeholder="دلیل مرخصی..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={2}
            />
          </div>

          {/* Leave Balance Info */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-medium">مانده مرخصی</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-md bg-sky-50 dark:bg-sky-950/30">
                <div className="text-sm font-bold text-sky-700 dark:text-sky-300">{toPersianDigits(26)}</div>
                <div className="text-[10px] text-muted-foreground">استحقاقی</div>
              </div>
              <div className="p-2 rounded-md bg-rose-50 dark:bg-rose-950/30">
                <div className="text-sm font-bold text-rose-700 dark:text-rose-300">{toPersianDigits(5)}</div>
                <div className="text-[10px] text-muted-foreground">استعلاجی</div>
              </div>
              <div className="p-2 rounded-md bg-slate-50 dark:bg-slate-950/30">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{toPersianDigits(0)}</div>
                <div className="text-[10px] text-muted-foreground">بدون حقوق</div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!form.employeeId} className="gap-2">
            <CalendarOff className="w-4 h-4" />
            ثبت درخواست
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
