'use client'

import { useState } from 'react'
import {
  Search, Loader2, LogIn, LogOut,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import type { EmployeeBasic } from '../index'

// ============================================
// Check-In/Out Dialog
// ============================================

export function CheckInDialog({
  open,
  onClose,
  onSubmit,
  employees,
  type,
  currentUser
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  employees: EmployeeBasic[]
  type: 'checkIn' | 'checkOut'
  currentUser?: { role: string; employeeId?: string } 
}) {
  const isEmployee = currentUser?.role === 'employee'
  const isManager = currentUser?.role === 'admin' || currentUser?.role === 'hr_manager' || currentUser?.role === 'department_manager'

  function getDefaultForm() {
    const today = getTodayShamsi()
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')

    const defaultEmployeeId = isEmployee ? currentUser?.employeeId || '' : ''
    return {
      employeeId: defaultEmployeeId,
      date: `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`,
      time: `${hours}:${minutes}`,
    }
  }

  const [form, setForm] = useState(getDefaultForm)
  const [empSearch, setEmpSearch] = useState('')
  const [prevOpen, setPrevOpen] = useState(false)

  if (open && !prevOpen) {
    setPrevOpen(true)
    setForm(getDefaultForm())
    setEmpSearch('')
  } else if (!open && prevOpen) {
    setPrevOpen(false)
  }
  const filtered = isEmployee 
  ? employees.filter(e => e.id === currentUser?.employeeId)
  : empSearch
    ? employees.filter(e => `${e.firstName} ${e.lastName}`.includes(empSearch) || e.personnelCode.includes(empSearch))
    : employees

  const handleSubmit = () => {
    if (!form.employeeId || !form.date || !form.time) return
    onSubmit({
      employeeId: form.employeeId,
      date: form.date,
      checkIn: type === 'checkIn' ? form.time : undefined,
      checkOut: type === 'checkOut' ? form.time : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'checkIn' ? (
              <LogIn className="w-5 h-5 text-emerald-600" />
            ) : (
              <LogOut className="w-5 h-5 text-sky-600" />
            )}
            {type === 'checkIn' ? 'ثبت ورود' : 'ثبت خروج'}
          </DialogTitle>
          <DialogDescription>
            {type === 'checkIn' ? 'ساعت ورود کارمند را ثبت کنید' : 'ساعت خروج کارمند را ثبت کنید'}
          </DialogDescription>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاریخ</Label>
              <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>ساعت</Label>
              <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} dir="ltr" />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!form.employeeId} className="gap-2">
            {type === 'checkIn' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
            {type === 'checkIn' ? 'ثبت ورود' : 'ثبت خروج'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
