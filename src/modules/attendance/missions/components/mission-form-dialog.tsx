'use client'

import { useState } from 'react'
import {
  MapPin, Search, CheckCircle2, XCircle, Loader2,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { getTodayShamsi ,toPersianDigits } from '@/core/lib/utils-fa'
import type { EmployeeBasic, MissionRecord } from '../index'

// ============================================
// Mission Form Dialog
// ============================================

export function MissionFormDialog({
  open, onClose, onSubmit, employees,currentUser
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
    title: '',
    destination: '',
    startDate: todayStr,
    endDate: todayStr,
    totalDays: '1',
  })
  const [empSearch, setEmpSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filtered = isEmployee
  ? employees.filter(e => e.id === currentUser?.employeeId)
  : empSearch
    ? employees.filter(e => `${e.firstName} ${e.lastName}`.includes(empSearch) || e.personnelCode.includes(empSearch))
    : employees

  const handleSubmit = async () => {
    setSubmitting(true)
    await onSubmit({
      employeeId: form.employeeId,
      title: form.title,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays: Number(form.totalDays), 
    })
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-600" />
            ثبت درخواست مأموریت
          </DialogTitle>
          <DialogDescription>فرم درخواست مأموریت جدید را تکمیل کنید</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isEmployee && (
          <div className="space-y-2">
            <Label>کارمند *</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی نام یا کد پرسنلی..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select
              value={form.employeeId}
              onValueChange={(v) => {
                setForm({ ...form, employeeId: v })
                setEmpSearch('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کارمند" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {filtered.map((emp) => (
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
          <div className="space-y-2">
            <Label>عنوان مأموریت *</Label>
            <Input
              placeholder="مثال: مأموریت اصفهان"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>مقصد</Label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="مثال: اصفهان"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="pr-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>تاریخ شروع *</Label>
              <Input
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>تاریخ پایان *</Label>
              <Input
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                dir="ltr"
              />
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
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.employeeId || !form.title || submitting}
            className="gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            ثبت مأموریت
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Confirm Action Dialog
// ============================================

export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  mission,
  action,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  mission: MissionRecord | null
  action: 'approved' | 'rejected'
}) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'approved' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            {action === 'approved' ? 'تایید مأموریت' : 'رد مأموریت'}
          </DialogTitle>
          <DialogDescription>
            آیا از {action === 'approved' ? 'تایید' : 'رد'} مأموریت «{mission?.title}» اطمینان دارید؟
          </DialogDescription>
        </DialogHeader>
        {mission && (
          <div className="py-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">کارمند:</span>
              <span className="font-medium">{mission.employee.firstName} {mission.employee.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">مقصد:</span>
              <span className="font-medium">{mission.destination || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">مدت:</span>
              <span className="font-medium">{toPersianDigits(mission.totalDays)} روز</span>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            انصراف
          </Button>
          <Button
            variant={action === 'approved' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {action === 'approved' ? 'تایید' : 'رد کردن'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
