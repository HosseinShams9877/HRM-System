'use client'

import { useState } from 'react'
import {
  Code, Loader2, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
import { Textarea } from '@/core/components/ui/textarea'
import { Checkbox } from '@/core/components/ui/checkbox'
import { VariableEditor } from './variable-editor'
import { EMPTY_FORMULA } from '../constants'
import type { FormulaFormData, VariableFormData, SalaryFormula } from '../index'

// ============================================
// Formula Create/Edit Dialog
// ============================================

export function FormulaFormDialog({
  open,
  onClose,
  onSave,
  initialData,
  year,
  saving,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: FormulaFormData) => void
  initialData: SalaryFormula | null
  year: number
  saving: boolean
}) {
  const isEdit = !!initialData

  const [form, setForm] = useState<FormulaFormData>(EMPTY_FORMULA)
  const [prevOpen, setPrevOpen] = useState(open)
  const [prevInitialData, setPrevInitialData] = useState(initialData)

  // Reset form when dialog opens or initialData changes
  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open)
    setPrevInitialData(initialData)
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          code: initialData.code,
          expression: initialData.expression,
          description: initialData.description || '',
          isActive: initialData.isActive,
          variables: initialData.variables.map((v) => ({
            varName: v.varName,
            sourceType: v.sourceType,
            sourceId: v.sourceId || '',
            label: v.label,
          })),
        })
      } else {
        setForm({ ...EMPTY_FORMULA })
      }
    }
  }

  const updateField = <K extends keyof FormulaFormData>(key: K, value: FormulaFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addVariable = () => {
    setForm((prev) => ({
      ...prev,
      variables: [...prev.variables, { ...EMPTY_VARIABLE }],
    }))
  }

  const removeVariable = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }))
  }

  const updateVariable = (index: number, field: keyof VariableFormData, value: string) => {
    setForm((prev) => {
      const vars = [...prev.variables]
      vars[index] = { ...vars[index], [field]: value }
      return { ...prev, variables: vars }
    })
  }

  const isValid = form.name.trim() && form.code.trim() && form.expression.trim()

  const handleSubmit = () => {
    if (!isValid) return
    onSave(form)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            {isEdit ? 'ویرایش فرمول' : 'فرمول جدید'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات فرمول محاسباتی را بروزرسانی کنید' : 'فرمول محاسباتی جدید تعریف کنید'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* اطلاعات پایه */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              اطلاعات پایه
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formula-name">
                  نام فرمول <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="formula-name"
                  placeholder="مثلاً: محاسبه بیمه سهم کارمند"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formula-code">
                  کد فرمول <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="formula-code"
                  placeholder="مثلاً: insurance_employee"
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  dir="ltr"
                  className="font-mono"
                  disabled={isEdit}
                />
                {isEdit && (
                  <p className="text-[10px] text-muted-foreground">کد فرمول قابل تغییر نیست</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="formula-expression">
                  عبارت محاسباتی <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="formula-expression"
                  placeholder="مثلاً: {cappedInsurable} * {totalEmpInsRate} / 100"
                  value={form.expression}
                  onChange={(e) => updateField('expression', e.target.value)}
                  dir="ltr"
                  className="font-mono text-sm min-h-[80px]"
                />
                <p className="text-[10px] text-muted-foreground">
                  متغیرها را داخل آکولاد قرار دهید: {'{variableName}'}
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="formula-description">توضیحات</Label>
                <Textarea
                  id="formula-description"
                  placeholder="توضیحات اختیاری درباره فرمول..."
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Checkbox
                  id="formula-active"
                  checked={form.isActive}
                  onCheckedChange={(checked) => updateField('isActive', !!checked)}
                />
                <Label htmlFor="formula-active" className="cursor-pointer">
                  فعال
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* متغیرها */}
          <VariableEditor
            variables={form.variables}
            onAdd={addVariable}
            onRemove={removeVariable}
            onUpdate={updateVariable}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {isEdit ? 'بروزرسانی' : 'ایجاد فرمول'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
