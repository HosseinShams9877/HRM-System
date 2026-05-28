'use client'

import { useEffect, useState } from 'react'
import {
  Search, FileBadge, FilePlus, XCircle, RefreshCcw
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Label } from '@/core/components/ui/label'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Separator } from '@/core/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import type { EmployeeBasic, ContractRecord } from '../index'
import { CONTRACT_TYPES } from '../constants'

// ============================================
// Create/Edit Contract Dialog
// ============================================

export function ContractFormDialog({
  open,
  onClose,
  onSubmit,
  employees,
  departments,
  initialData,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  employees: EmployeeBasic[]
  departments: string[]
  initialData?: ContractRecord | null
}) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    employeeId: '',
    type: 'قرارداد',
    contractNumber: '',
    title: '',
    startDate: '',
    endDate: '',
    amount: '',
    department: '',
    notes: '',
    status: 'active',
  })
  const [empSearch, setEmpSearch] = useState('')

  useEffect(() => {
    if (initialData) {
      setForm({
        employeeId: initialData.employeeId,
        type: initialData.type,
        contractNumber: initialData.contractNumber || '',
        title: initialData.title,
        startDate: initialData.startDate,
        endDate: initialData.endDate || '',
        amount: initialData.amount ? String(initialData.amount) : '',
        department: initialData.department || '',
        notes: initialData.notes || '',
        status: initialData.status,
      })
    } else {
      const today = getTodayShamsi()
      setForm({
        employeeId: '',
        type: 'قرارداد',
        contractNumber: '',
        title: '',
        startDate: `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`,
        endDate: '',
        amount: '',
        department: '',
        notes: '',
        status: 'active',
      })
    }
    setEmpSearch('')
  }, [open, initialData])

  const filteredEmployees = empSearch
    ? employees.filter(e =>
        `${e.firstName} ${e.lastName}`.includes(empSearch) ||
        e.personnelCode.includes(empSearch)
      )
    : employees

  const handleSubmit = () => {
    if (!form.employeeId || !form.type || !form.title || !form.startDate) return
    onSubmit({
      ...form,
      amount: form.amount || null,
      endDate: form.endDate || null,
      department: form.department || null,
      notes: form.notes || null,
      contractNumber: form.contractNumber || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-blue-600" />
            {isEdit ? 'ویرایش قرارداد/حکم' : 'ایجاد قرارداد/حکم جدید'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات قرارداد یا حکم را بروزرسانی کنید' : 'اطلاعات قرارداد یا حکم جدید را وارد کنید'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* بخش ۱: اطلاعات پایه */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              اطلاعات پایه
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع سند *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>شماره قرارداد/حکم</Label>
                  <Input
                    placeholder="خودکار تولید می‌شود..."
                    value={form.contractNumber}
                    onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>عنوان *</Label>
                <Input
                  placeholder="مثلاً: قرارداد استخدام یک‌ساله"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>کارمند *</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجو نام یا کد پرسنلی..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="pr-10 mb-2"
                  />
                </div>
                <Select value={form.employeeId} onValueChange={(v) => { setForm({ ...form, employeeId: v }); setEmpSearch('') }}>
                  <SelectTrigger><SelectValue placeholder="انتخاب کارمند" /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {filteredEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.personnelCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* بخش ۲: تاریخ و مدت */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              تاریخ و مدت
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاریخ شروع *</Label>
                <Input
                  placeholder="1405/01/01"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>تاریخ پایان</Label>
                <Input
                  placeholder="1406/01/01 (خالی = نامحدود)"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* بخش ۳: مالی و توضیحات */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              مالی و توضیحات
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>مبلغ (تومان)</Label>
                  <Input
                    type="number"
                    placeholder="مبلغ قرارداد"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>دپارتمان</Label>
                  <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                    <SelectTrigger><SelectValue placeholder="انتخاب دپارتمان" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {isEdit && (
                <div className="space-y-2">
                  <Label>وضعیت</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">پیش‌نویس</SelectItem>
                      <SelectItem value="active">فعال</SelectItem>
                      <SelectItem value="expired">منقضی</SelectItem>
                      <SelectItem value="terminated">فسخ شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>توضیحات</Label>
                <Textarea
                  placeholder="توضیحات اختیاری..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.employeeId || !form.title || !form.startDate}
            className="gap-2"
          >
            <FilePlus className="w-4 h-4" />
            {isEdit ? 'بروزرسانی' : 'ایجاد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Renew Dialog
// ============================================

export function RenewDialog({
  open,
  onClose,
  onSubmit,
  contract,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  contract: ContractRecord | null
}) {
  const today = getTodayShamsi()
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    amount: '',
    notes: '',
  })

  useEffect(() => {
    if (contract) {
      setForm({
        startDate: contract.endDate || `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`,
        endDate: '',
        amount: contract.amount ? String(contract.amount) : '',
        notes: `تمدید قرارداد ${contract.contractNumber || ''}`,
      })
    }
  }, [open, contract])

  if (!contract) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-emerald-600" />
            تمدید قرارداد
          </DialogTitle>
          <DialogDescription>
            قرارداد «{contract.title}» برای {contract.employee.firstName} {contract.employee.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاریخ شروع جدید *</Label>
              <Input
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>تاریخ پایان جدید</Label>
              <Input
                placeholder="1406/01/01"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>مبلغ جدید (تومان)</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button
            onClick={() => onSubmit(form)}
            disabled={!form.startDate}
            className="gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            تمدید
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Terminate Dialog
// ============================================

export function TerminateDialog({
  open,
  onClose,
  onSubmit,
  contract,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  contract: ContractRecord | null
}) {
  const [reason, setReason] = useState('')

  if (!contract) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            فسخ قرارداد
          </DialogTitle>
          <DialogDescription>
            آیا از فسخ قرارداد «{contract.title}» برای {contract.employee.firstName} {contract.employee.lastName} اطمینان دارید؟
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-sm text-red-700 dark:text-red-300">
            این عمل غیرقابل بازگشت است و وضعیت قرارداد به «فسخ شده» تغییر خواهد کرد.
          </div>
          <div className="space-y-2">
            <Label>دلیل فسخ *</Label>
            <Textarea
              placeholder="دلیل فسخ قرارداد را وارد کنید..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button
            variant="destructive"
            onClick={() => onSubmit({ notes: reason })}
            disabled={!reason}
            className="gap-2"
          >
            <XCircle className="w-4 h-4" />
            فسخ قرارداد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
