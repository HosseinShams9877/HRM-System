// src/modules/payroll/components/settings/components/payroll-item-form-dialog.tsx

'use client'

import { useState } from 'react'
import { Edit3, Save } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/core/components/ui/dialog'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { EMPLOYEE_FIELDS } from '../types'
import type { PayrollItemDefinition } from '../../../../payroll/index'

const CALCULATION_TYPES = [
  { value: 'fixed', label: 'مبلغ ثابت' },
  { value: 'percentage', label: 'درصدی' },
  { value: 'formula', label: 'فرمول' },
  { value: 'employee_field', label: 'از اطلاعات کارمند' },
]

const CATEGORIES = [
  { value: 'allowance', label: 'مزایا' },
  { value: 'deduction', label: 'کسورات' },
]

interface PayrollItemFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>) => void
  initialData?: PayrollItemDefinition | null
  year: number
}

export function PayrollItemFormDialog({
  open,
  onClose,
  onSave,
  initialData,
  year,
}: PayrollItemFormDialogProps) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    title: initialData?.title || '',
    code: initialData?.code || '',
    category: initialData?.category || 'allowance',
    calculationType: initialData?.calculationType || 'fixed',
    value: String(initialData?.value || 0),
    formulaId: initialData?.formulaId || '',
    employeeField: initialData?.employeeField || '',
    isInsurable: initialData?.isInsurable ?? true,
    isTaxable: initialData?.isTaxable ?? true,
    isEditable: initialData?.isEditable ?? true,
    isSystem: initialData?.isSystem ?? false,
    sortOrder: String(initialData?.sortOrder || 0),
    description: initialData?.description || '',
    includeInEidi: initialData?.includeInEidi ?? false,
    includeInSanavat: initialData?.includeInSanavat ?? false,
    affectsOvertime: initialData?.affectsOvertime ?? false,
    includeInLeaveBuyback: initialData?.includeInLeaveBuyback ?? false,
    includeInLeaveBalance: initialData?.includeInLeaveBalance ?? false,
  })

  const handleSubmit = () => {
    if (!form.title || !form.code) return
    const data: Record<string, unknown> = {
      ...form,
      year,
      value: Number(form.value || 0),
      sortOrder: Number(form.sortOrder || 0),
      formulaId: form.calculationType === 'formula' && form.formulaId ? form.formulaId : null,
      employeeField: form.calculationType === 'employee_field' ? form.employeeField : null,
    }
    onSave(data)
  }

  const getValueLabel = () => {
    switch (form.calculationType) {
      case 'fixed': return 'مبلغ ثابت (ریال)'
      case 'percentage': return 'درصد (مثلاً ۷)'
      case 'formula': return 'مبلغ پایه فرمول (ریال)'
      default: return 'مقدار'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            {isEdit ? 'ویرایش آیتم حقوقی' : 'آیتم حقوقی جدید'}
          </DialogTitle>
          <DialogDescription>سال: {toPersianDigits(year)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* عنوان و کد */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>عنوان *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثلاً: حق مسکن"
              />
            </div>
            <div className="space-y-2">
              <Label>کد *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="مثلاً: HOUSING"
                dir="ltr"
                disabled={isEdit}
              />
            </div>
          </div>

          {/* دسته‌بندی و نوع محاسبه */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>دسته‌بندی</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع محاسبه</Label>
              <Select
                value={form.calculationType}
                onValueChange={(v) => setForm({ ...form, calculationType: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CALCULATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* مقدار */}
          <div className="space-y-2">
            <Label>{getValueLabel()}</Label>
            <Input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              dir="ltr"
            />
          </div>

          {/* فیلد کارمند */}
          {form.calculationType === 'employee_field' && (
            <div className="space-y-2">
              <Label>فیلد اطلاعات کارمند</Label>
              <Select
                value={form.employeeField}
                onValueChange={(v) => setForm({ ...form, employeeField: v })}
              >
                <SelectTrigger><SelectValue placeholder="انتخاب فیلد" /></SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* توضیحات */}
          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="اختیاری"
            />
          </div>

          {/* ترتیب نمایش */}
          <div className="space-y-2">
            <Label>ترتیب نمایش</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              dir="ltr"
            />
          </div>

          {/* چک‌باکس‌ها */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'isInsurable', label: 'مشمول بیمه' },
              { key: 'isTaxable', label: 'مشمول مالیات' },
              { key: 'isEditable', label: 'قابل ویرایش' },
              { key: 'isSystem', label: 'سیستمی' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>

          {/* چک‌باکس‌های محاسباتی */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            {[
              { key: 'includeInEidi', label: 'در محاسبه عیدی لحاظ شود' },
              { key: 'includeInSanavat', label: 'در محاسبه سنوات لحاظ شود' },
              { key: 'affectsOvertime', label: 'در محاسبه اضافه‌کاری اثر داشته باشد' },
              { key: 'includeInLeaveBuyback', label: 'در محاسبه بازخرید مرخصی لحاظ شود' },
              { key: 'includeInLeaveBalance', label: 'در محاسبه مانده مرخصی لحاظ شود' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.title || !form.code}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isEdit ? 'بروزرسانی' : 'ایجاد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}