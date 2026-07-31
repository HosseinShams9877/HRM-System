'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Plus, Loader2, Edit3, Save, X, Info, Lock, Trash2,
  Settings, TrendingUp, TrendingDown, Shield, Gift,
  ShieldCheck, Sparkles, Zap, Receipt, FileText,
  Calculator, Wallet,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Switch } from '@/core/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { RIALS_TO_TOMANS, FORMULA_DESCRIPTIONS } from '../constants'
import type { PayrollSettingRecord, PayrollItemDefinition, TaxBracketRecord } from '../index'

// ============================================
// PayrollItemFormDialog — Add/Edit PayrollItem
// ============================================

function PayrollItemFormDialog({
  open,
  onClose,
  onSave,
  initialData,
  year,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>) => void
  initialData?: PayrollItemDefinition | null
  year: number
}) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    title: '',
    code: '',
    category: 'allowance',
    calculationType: 'fixed',
    value: '',
    formulaId: '',
    isInsurable: true,
    includeInEidi: false,
    includeInSanavat: false,
    affectsOvertime: false,
    includeInLeaveBuyback: false,
    includeInLeaveBalance: false,
    isTaxable: true,
    isEditable: true,
    isSystem: false,
    sortOrder: '0',
    description: '',
  })
  const [formulas, setFormulas] = useState<{ id: string; code: string; name: string; expression: string }[]>([])
  const [prevOpen, setPrevOpen] = useState(open)
  const [prevInitialData, setPrevInitialData] = useState(initialData)

  // Adjust state when dialog opens or initialData changes (React 19 pattern)
  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open)
    setPrevInitialData(initialData)
    if (open) {
      // بارگذاری فرمول‌ها از دیتابیس
      fetch(`/api/payroll/formulas?year=${year}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setFormulas(Array.isArray(data) ? data : []))
        .catch(() => setFormulas([]))

      if (initialData) {
        setForm({
          title: initialData.title,
          code: initialData.code,
          category: initialData.category,
          calculationType: initialData.calculationType,
          value: String(initialData.value),
          formulaId: initialData.formulaId || (initialData.formula?.id) || '',
          isInsurable: initialData.isInsurable,
          isTaxable: initialData.isTaxable,
          isEditable: initialData.isEditable,
          isSystem: initialData.isSystem,
          sortOrder: String(initialData.sortOrder),
          description: initialData.description || '',
          includeInEidi: initialData.includeInEidi ?? false,
          includeInSanavat: initialData.includeInSanavat ?? false,
          affectsOvertime: initialData.affectsOvertime ?? false,
          includeInLeaveBuyback: initialData.includeInLeaveBuyback ?? false,
          includeInLeaveBalance: initialData.includeInLeaveBalance ?? false,
        })
      } else {
        setForm({
          title: '',
          code: '',
          category: 'allowance',
          calculationType: 'fixed',
          value: '',
          formulaId: '',
          isInsurable: true,
          isTaxable: true,
          isEditable: true,
          isSystem: false,
          sortOrder: '0',
          description: '',
          includeInEidi: false,
          includeInSanavat: false,
          affectsOvertime: false,
          includeInLeaveBuyback: false,
          includeInLeaveBalance: false,
        })
      }
    }
  }

  const handleSubmit = () => {
    if (!form.title || !form.code) return
    const data: Record<string, unknown> = {
      ...form,
      year,
      value: Number(form.value || 0),
      sortOrder: Number(form.sortOrder || 0),
      formulaId: form.calculationType === 'formula' && form.formulaId ? form.formulaId : null,
    }
    onSave(data)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            {isEdit ? 'ویرایش آیتم حقوقی' : 'آیتم حقوقی جدید'}
          </DialogTitle>
          <DialogDescription>
            سال: {toPersianDigits(year)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>عنوان *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثلاً: حق مسکن" />
            </div>
            <div className="space-y-2">
              <Label>کد *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثلاً: HOUSING" dir="ltr" disabled={isEdit} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>دسته‌بندی</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowance">مزایا</SelectItem>
                  <SelectItem value="deduction">کسورات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع محاسبه</Label>
              <Select value={form.calculationType} onValueChange={(v) => setForm({ ...form, calculationType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  <SelectItem value="percentage">درصدی</SelectItem>
                  <SelectItem value="formula">فرمول</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {form.calculationType === 'fixed' ? 'مبلغ ثابت (ریال)' :
                 form.calculationType === 'percentage' ? 'درصد (مثلاً ۷)' :
                 'مبلغ پایه فرمول (ریال)'}
              </Label>
              <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} dir="ltr" />
            </div>
            {form.calculationType === 'formula' && (
              <div className="space-y-2">
                <Label>فرمول محاسباتی</Label>
                <Select value={form.formulaId} onValueChange={(v) => {
                  const selectedFormula = formulas.find(f => f.id === v)
                  setForm({ ...form, formulaId: v })
                }}>
                  <SelectTrigger><SelectValue placeholder="انتخاب فرمول" /></SelectTrigger>
                  <SelectContent>
                    {formulas.length > 0 ? (
                      formulas.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name} ({f.code})</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_none" disabled>فرمولی تعریف نشده — ابتدا از تب فرمول‌ها ایجاد کنید</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {form.formulaId && formulas.find(f => f.id === form.formulaId) && (
                  <div className="text-[11px] text-muted-foreground font-mono bg-muted/50 p-2 rounded mt-1" dir="ltr">
                    {formulas.find(f => f.id === form.formulaId)?.expression}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="اختیاری" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ترتیب نمایش</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isInsurable} onChange={(e) => setForm({ ...form, isInsurable: e.target.checked })} className="rounded" />
              مشمول بیمه
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isTaxable} onChange={(e) => setForm({ ...form, isTaxable: e.target.checked })} className="rounded" />
              مشمول مالیات
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isEditable} onChange={(e) => setForm({ ...form, isEditable: e.target.checked })} className="rounded" />
              قابل ویرایش
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isSystem} onChange={(e) => setForm({ ...form, isSystem: e.target.checked })} className="rounded" />
              سیستمی
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t">
  <label className="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={form.includeInEidi}
      onChange={(e) => setForm({ ...form, includeInEidi: e.target.checked })}
      className="rounded"
    />
    در محاسبه عیدی لحاظ شود
  </label>
  <label className="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={form.includeInSanavat}
      onChange={(e) => setForm({ ...form, includeInSanavat: e.target.checked })}
      className="rounded"
    />
    در محاسبه سنوات لحاظ شود
  </label>
  <label className="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={form.affectsOvertime}
      onChange={(e) => setForm({ ...form, affectsOvertime: e.target.checked })}
      className="rounded"
    />
    در محاسبه اضافه‌کاری اثر داشته باشد
  </label>
  <label className="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={form.includeInLeaveBuyback}
      onChange={(e) => setForm({ ...form, includeInLeaveBuyback: e.target.checked })}
      className="rounded"
    />
    در محاسبه بازخرید مرخصی لحاظ شود
  </label>
  <label className="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={form.includeInLeaveBalance}
      onChange={(e) => setForm({ ...form, includeInLeaveBalance: e.target.checked })}
      className="rounded"
    />
    در محاسبه مانده مرخصی لحاظ شود
  </label>
</div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!form.title || !form.code} className="gap-2">
            <Save className="w-4 h-4" />
            {isEdit ? 'بروزرسانی' : 'ایجاد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Settings Tab
// ============================================

export function SettingsTab({ year }: { year: number }) {
  const { toast } = useToast()
  const [setting, setSetting] = useState<PayrollSettingRecord | null>(null)
  const [payrollItems, setPayrollItems] = useState<PayrollItemDefinition[]>([])
  const [taxBrackets, setTaxBrackets] = useState<TaxBracketRecord[]>([])
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [editingSettings, setEditingSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null)
  const [itemDialog, setItemDialog] = useState<{ open: boolean; item: PayrollItemDefinition | null }>({ open: false, item: null })
  const [bracketForm, setBracketForm] = useState<{ orderNum: string; minAmount: string; maxAmount: string; rate: string }>({
    orderNum: '', minAmount: '', maxAmount: '', rate: ''
  })
  const [editingBracketId, setEditingBracketId] = useState<string | null>(null)
  const [editingBracketForm, setEditingBracketForm] = useState<{ orderNum: string; minAmount: string; maxAmount: string; rate: string }>({
    orderNum: '', minAmount: '', maxAmount: '', rate: ''
  })

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true)
    try {
      const res = await fetch(`/api/payroll/settings?year=${year}`)
      if (res.ok) {
        const json = await res.json()
        const s = json.setting
        setSetting(s)
        if (s) {
          setSettingsForm({
            minDailyWage: String(RIALS_TO_TOMANS(s.minDailyWage)),
            minMonthlyWage: String(RIALS_TO_TOMANS(s.minMonthlyWage || s.minDailyWage * (s.workDaysPerMonth || 30))),
            baseSalaryDefault: String(RIALS_TO_TOMANS(s.baseSalaryDefault || 0)),
            insuranceRate: String(s.insuranceRate),
            employerInsRate: String(s.employerInsRate),
            unemploymentInsRate: String(s.unemploymentInsRate || 1),
            insuranceCeilingMultiplier: String(s.insuranceCeilingMultiplier),
            overtimeMultiplier: String(s.overtimeMultiplier),
            nightShiftMultiplier: String(s.nightShiftMultiplier),
            mixedNightMultiplier: String(s.mixedNightMultiplier),
            fridayWorkMultiplier: String(s.fridayWorkMultiplier),
            holidayWorkMultiplier: String(s.holidayWorkMultiplier),
            eidiMinDays: String(s.eidiMinDays),
            eidiMaxDays: String(s.eidiMaxDays),
            sanavatRate: String(s.sanavatRate || 0),
            sanavatMaxYears: String(s.sanavatMaxYears || 30),
            taxExemptAmount: String(s.taxExemptAmount),
            workHoursPerDay: String(s.workHoursPerDay),
            workDaysPerMonth: String(s.workDaysPerMonth),
          })
        }
      }
    } catch (err) {
      console.error('Fetch settings error:', err)
    } finally {
      setLoadingSettings(false)
    }
  }, [year])

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/payroll/items?year=${year}`)
      if (res.ok) {
        const json = await res.json()
        setPayrollItems(json.items || [])
      }
    } catch (err) {
      console.error('Fetch items error:', err)
    }
  }, [year])

  const fetchTaxBrackets = useCallback(async () => {
    try {
      const res = await fetch(`/api/payroll/tax-brackets?year=${year}`)
      if (res.ok) {
        const json = await res.json()
        setTaxBrackets(json.brackets || [])
      }
    } catch (err) {
      console.error('Fetch tax brackets error:', err)
    }
  }, [year])

  useEffect(() => {
    fetchSettings()
    fetchItems()
    fetchTaxBrackets()
  }, [fetchSettings, fetchItems, fetchTaxBrackets])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = { year }
      // بخش دستمزد
      body.minDailyWage = Number(settingsForm.minDailyWage || 0) * 10 // Tomans -> Rials
      body.minMonthlyWage = Number(settingsForm.minMonthlyWage || 0) * 10
      body.baseSalaryDefault = Number(settingsForm.baseSalaryDefault || 0) * 10
      body.workHoursPerDay = Number(settingsForm.workHoursPerDay || 8)
      body.workDaysPerMonth = Number(settingsForm.workDaysPerMonth || 30)
      // بخش بیمه
      body.insuranceRate = Number(settingsForm.insuranceRate || 7)
      body.employerInsRate = Number(settingsForm.employerInsRate || 23)
      body.unemploymentInsRate = Number(settingsForm.unemploymentInsRate || 1)
      body.insuranceCeilingMultiplier = Number(settingsForm.insuranceCeilingMultiplier || 7)
      // ضرایب
      body.overtimeMultiplier = Number(settingsForm.overtimeMultiplier || 1.4)
      body.nightShiftMultiplier = Number(settingsForm.nightShiftMultiplier || 1.15)
      body.mixedNightMultiplier = Number(settingsForm.mixedNightMultiplier || 1.35)
      body.fridayWorkMultiplier = Number(settingsForm.fridayWorkMultiplier || 1.4)
      body.holidayWorkMultiplier = Number(settingsForm.holidayWorkMultiplier || 1.4)
      // عیدی و سنوات
      body.eidiMinDays = Number(settingsForm.eidiMinDays || 60)
      body.eidiMaxDays = Number(settingsForm.eidiMaxDays || 90)
      body.sanavatRate = Number(settingsForm.sanavatRate || 0)
      body.sanavatMaxYears = Number(settingsForm.sanavatMaxYears || 30)
      // مالیات
      body.taxExemptAmount = Number(settingsForm.taxExemptAmount || 0) // Already in Tomans

      let res
      if (setting) {
        res = await fetch('/api/payroll/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/payroll/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (res.ok) {
        toast({ title: 'تنظیمات ذخیره شد' })
        setEditingSettings(false)
        fetchSettings()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا در ذخیره تنظیمات', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveItem = async (data: Record<string, unknown>) => {
    try {
      const existing = itemDialog.item
      let res
      if (existing) {
        res = await fetch(`/api/payroll/items/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        res = await fetch('/api/payroll/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      if (res.ok) {
        toast({ title: existing ? 'آیتم بروزرسانی شد' : 'آیتم ایجاد شد' })
        setItemDialog({ open: false, item: null })
        fetchItems()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('آیا از حذف این آیتم اطمینان دارید؟')) return
    try {
      const res = await fetch(`/api/payroll/items/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'آیتم حذف شد' })
        fetchItems()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleAddTaxBracket = async () => {
    try {
      const res = await fetch('/api/payroll/tax-brackets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          orderNum: Number(bracketForm.orderNum),
          minAmount: Number(bracketForm.minAmount),
          maxAmount: Number(bracketForm.maxAmount),
          rate: Number(bracketForm.rate),
        }),
      })
      if (res.ok) {
        toast({ title: 'پله مالیاتی اضافه شد' })
        setBracketForm({ orderNum: '', minAmount: '', maxAmount: '', rate: '' })
        fetchTaxBrackets()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleDeleteBracket = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/tax-brackets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'پله مالیاتی حذف شد' })
        fetchTaxBrackets()
      }
    } catch {
      toast({ title: 'خطا', variant: 'destructive' })
    }
  }

  const handleToggleItemActive = async (itemId: string, isActive: boolean) => {
    setTogglingItemId(itemId)
    try {
      const res = await fetch(`/api/payroll/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      if (res.ok) {
        toast({ title: isActive ? 'آیتم فعال شد' : 'آیتم غیرفعال شد' })
        fetchItems()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    } finally {
      setTogglingItemId(null)
    }
  }

  const handleUpdateBracket = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/tax-brackets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNum: Number(editingBracketForm.orderNum),
          minAmount: Number(editingBracketForm.minAmount),
          maxAmount: Number(editingBracketForm.maxAmount),
          rate: Number(editingBracketForm.rate),
        }),
      })
      if (res.ok) {
        toast({ title: 'پله مالیاتی بروزرسانی شد' })
        setEditingBracketId(null)
        fetchTaxBrackets()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const startEditBracket = (bracket: TaxBracketRecord) => {
    setEditingBracketId(bracket.id)
    setEditingBracketForm({
      orderNum: String(bracket.orderNum),
      minAmount: String(bracket.minAmount),
      maxAmount: String(bracket.maxAmount),
      rate: String(bracket.rate),
    })
  }

  // Group payroll items by category
  const allowanceItems = useMemo(() =>
    payrollItems.filter(i => i.category === 'allowance').sort((a, b) => a.sortOrder - b.sortOrder),
    [payrollItems]
  )
  const deductionItems = useMemo(() =>
    payrollItems.filter(i => i.category === 'deduction').sort((a, b) => a.sortOrder - b.sortOrder),
    [payrollItems]
  )

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* تنظیمات حقوقی */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              تنظیمات حقوقی سال {toPersianDigits(year)}
            </CardTitle>
            <Button
              variant={editingSettings ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (editingSettings) {
                  handleSaveSettings()
                } else {
                  setEditingSettings(true)
                }
              }}
              disabled={saving}
              className="gap-1"
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : editingSettings ? (
                <Save className="w-3 h-3" />
              ) : (
                <Edit3 className="w-3 h-3" />
              )}
              {editingSettings ? 'ذخیره' : 'ویرایش'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!setting && !editingSettings ? (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 border border-emerald-200 dark:border-emerald-800/50 p-6">
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-200/30 dark:bg-emerald-700/10 rounded-full -translate-x-8 -translate-y-8" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-teal-200/30 dark:bg-teal-700/10 rounded-full translate-x-6 translate-y-6" />
              <div className="relative flex flex-col items-center text-center">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-1">
                  تنظیمات حقوقی سال {toPersianDigits(year)}
                </h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4 max-w-md">
                  با شروع سریع، تنظیمات حقوقی، آیتم‌های حقوقی (مزایا و کسورات) و پله‌های مالیاتی سال {toPersianDigits(year)} به‌صورت خودکار ایجاد خواهند شد.
                </p>
                <div className="flex items-center gap-4 mb-5 text-xs text-emerald-600 dark:text-emerald-400">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{toPersianDigits(6)} آیتم مزایا</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>{toPersianDigits(4)} آیتم کسورات</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calculator className="w-4 h-4" />
                    <span>{toPersianDigits(5)} پله مالیاتی</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={async () => {
                    try {
                      const res = await fetch('/api/payroll/seed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ year }),
                      })
                      if (res.ok) {
                        const json = await res.json()
                        toast({ title: json.message || 'داده‌های پیش‌فرض ایجاد شد' })
                        fetchSettings()
                        fetchItems()
                        fetchTaxBrackets()
                      } else {
                        const err = await res.json()
                        toast({ title: err.error || 'خطا', variant: 'destructive' })
                      }
                    } catch {
                      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
                    }
                  }} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md px-6">
                    <Zap className="w-4 h-4" />
                    شروع سریع
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSettings(true)} className="gap-1 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                    <Plus className="w-3 h-3" />
                    ایجاد دستی
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* بخش دستمزد */}
              <div>
                <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> بخش دستمزد
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">حداقل دستمزد روزانه (تومان)</Label>
                    <Input type="number" value={settingsForm.minDailyWage || ''} onChange={(e) => setSettingsForm(f => ({ ...f, minDailyWage: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">حداقل دستمزد ماهانه (تومان)</Label>
                    <Input type="number" value={settingsForm.minMonthlyWage || ''} onChange={(e) => setSettingsForm(f => ({ ...f, minMonthlyWage: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">حقوق پایه پیش‌فرض (تومان)</Label>
                    <Input type="number" value={settingsForm.baseSalaryDefault || ''} onChange={(e) => setSettingsForm(f => ({ ...f, baseSalaryDefault: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ساعات کار در روز</Label>
                    <Input type="number" value={settingsForm.workHoursPerDay || ''} onChange={(e) => setSettingsForm(f => ({ ...f, workHoursPerDay: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">روزهای کار در ماه</Label>
                    <Input type="number" value={settingsForm.workDaysPerMonth || ''} onChange={(e) => setSettingsForm(f => ({ ...f, workDaysPerMonth: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                </div>
              </div>

              {/* بخش بیمه */}
              <div>
                <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" /> بخش بیمه
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">نرخ بیمه سهم کارمند (٪)</Label>
                    <Input type="number" step="0.1" value={settingsForm.insuranceRate || ''} onChange={(e) => setSettingsForm(f => ({ ...f, insuranceRate: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">نرخ بیمه سهم کارفرما (٪)</Label>
                    <Input type="number" step="0.1" value={settingsForm.employerInsRate || ''} onChange={(e) => setSettingsForm(f => ({ ...f, employerInsRate: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">بیمه بیکاری سهم کارمند (٪)</Label>
                    <Input type="number" step="0.1" value={settingsForm.unemploymentInsRate || ''} onChange={(e) => setSettingsForm(f => ({ ...f, unemploymentInsRate: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ضریب سقف بیمه</Label>
                    <Input type="number" step="0.1" value={settingsForm.insuranceCeilingMultiplier || ''} onChange={(e) => setSettingsForm(f => ({ ...f, insuranceCeilingMultiplier: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                </div>
              </div>

              {/* بخش ضرایب */}
              <div>
                <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> بخش ضرایب
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">اضافه‌کاری</Label>
                    <Input type="number" step="0.05" value={settingsForm.overtimeMultiplier || ''} onChange={(e) => setSettingsForm(f => ({ ...f, overtimeMultiplier: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">شب‌کاری نوبتی</Label>
                    <Input type="number" step="0.05" value={settingsForm.nightShiftMultiplier || ''} onChange={(e) => setSettingsForm(f => ({ ...f, nightShiftMultiplier: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">شب‌کاری مختلط</Label>
                    <Input type="number" step="0.05" value={settingsForm.mixedNightMultiplier || ''} onChange={(e) => setSettingsForm(f => ({ ...f, mixedNightMultiplier: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">جمعه‌کاری</Label>
                    <Input type="number" step="0.05" value={settingsForm.fridayWorkMultiplier || ''} onChange={(e) => setSettingsForm(f => ({ ...f, fridayWorkMultiplier: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">تعطیل‌کاری</Label>
                    <Input type="number" step="0.05" value={settingsForm.holidayWorkMultiplier || ''} onChange={(e) => setSettingsForm(f => ({ ...f, holidayWorkMultiplier: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                </div>
              </div>

              {/* بخش عیدی و سنوات */}
              <div>
                <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                  <Gift className="w-3 h-3" /> بخش عیدی و سنوات
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">حداقل روز عیدی</Label>
                    <Input type="number" value={settingsForm.eidiMinDays || ''} onChange={(e) => setSettingsForm(f => ({ ...f, eidiMinDays: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">حداکثر روز عیدی</Label>
                    <Input type="number" value={settingsForm.eidiMaxDays || ''} onChange={(e) => setSettingsForm(f => ({ ...f, eidiMaxDays: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">نرخ سنوات (٪ حقوق پایه/سال)</Label>
                    <Input type="number" step="0.1" value={settingsForm.sanavatRate || ''} onChange={(e) => setSettingsForm(f => ({ ...f, sanavatRate: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">حداکثر سال سابقه مشمول</Label>
                    <Input type="number" value={settingsForm.sanavatMaxYears || ''} onChange={(e) => setSettingsForm(f => ({ ...f, sanavatMaxYears: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                </div>
              </div>

              {/* بخش مالیات */}
              <div>
                <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" /> بخش مالیات
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">معافیت مالیاتی ماهانه (تومان)</Label>
                    <Input type="number" value={settingsForm.taxExemptAmount || ''} onChange={(e) => setSettingsForm(f => ({ ...f, taxExemptAmount: e.target.value }))} dir="ltr" disabled={!editingSettings} className={editingSettings ? '' : 'bg-muted'} />
                  </div>
                </div>
              </div>

              {editingSettings && (
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingSettings(false); fetchSettings() }}>انصراف</Button>
                  <Button size="sm" onClick={handleSaveSettings} disabled={saving} className="gap-1">
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    ذخیره تنظیمات
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* آیتم‌های حقوقی */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              آیتم‌های حقوقی
              <Badge variant="outline" className="text-[10px]">{toPersianDigits(payrollItems.length)} آیتم</Badge>
            </CardTitle>
            <Button size="sm" onClick={() => setItemDialog({ open: true, item: null })} className="gap-1">
              <Plus className="w-3 h-3" />
              آیتم جدید
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payrollItems.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              آیتم حقوقی برای سال {toPersianDigits(year)} تعریف نشده است
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-4">
              {/* مزایا */}
              {allowanceItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">مزایا و پرداختی</span>
                    <Badge className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">{toPersianDigits(allowanceItems.length)} آیتم</Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50/50 dark:bg-emerald-950/20">
                        <TableHead className="text-right text-xs">عنوان</TableHead>
                        <TableHead className="text-right text-xs">کد</TableHead>
                        <TableHead className="text-right text-xs">نوع محاسبه</TableHead>
                        <TableHead className="text-right text-xs">مقدار/فرمول</TableHead>
                        <TableHead className="text-right text-xs">پرچم‌ها</TableHead>
                        <TableHead className="text-center text-xs">وضعیت</TableHead>
                        <TableHead className="text-center text-xs">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allowanceItems.map(item => (
                        <TableRow key={item.id} className={!item.isActive ? 'opacity-50' : ''}>
                          <TableCell className="text-sm font-medium">{item.title}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono" dir="ltr">{item.code}</TableCell>
                          <TableCell>
                            <Badge className={`text-[9px] border-0 ${
                              item.calculationType === 'fixed' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                              item.calculationType === 'percentage' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                              'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                            }`}>
                              {item.calculationType === 'fixed' ? 'ثابت' : item.calculationType === 'percentage' ? 'درصدی' : 'فرمول'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.calculationType === 'fixed' && (
                              <span className="font-mono" dir="ltr">{formatCurrency(RIALS_TO_TOMANS(item.value))}</span>
                            )}
                            {item.calculationType === 'percentage' && (
                              <span className="font-mono">{toPersianDigits(item.value)}٪ حقوق پایه</span>
                            )}
                            {item.calculationType === 'formula' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 cursor-help text-violet-600 dark:text-violet-400">
                                      {item.formula?.name || 'فرمول'}
                                      <Info className="w-3 h-3" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs" dir="rtl">
                                    <p className="font-semibold mb-1">{item.formula?.name || 'فرمول'}</p>
                                    {item.formula?.expression && (
                                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded block mt-1" dir="ltr">{item.formula.expression}</code>
                                    )}
                                    {FORMULA_DESCRIPTIONS[item.formula?.code || ''] && (
                                      <p className="text-xs mt-1 text-muted-foreground">{FORMULA_DESCRIPTIONS[item.formula?.code || '']}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {item.isInsurable && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-0.5 rounded bg-blue-100 dark:bg-blue-900/30">
                                        <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>مشمول بیمه</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {item.isTaxable && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-0.5 rounded bg-amber-100 dark:bg-amber-900/30">
                                        <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>مشمول مالیات</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {item.isSystem && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                        <Lock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>سیستمی</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {!item.isInsurable && !item.isTaxable && !item.isSystem && (
                                <span className="text-[10px] text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {togglingItemId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                            ) : (
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={(checked) => handleToggleItemActive(item.id, checked)}
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setItemDialog({ open: true, item })}>
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>ویرایش</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {!item.isSystem && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 hover:text-rose-700" onClick={() => handleDeleteItem(item.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>حذف</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* کسورات */}
              {deductionItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">کسورات</span>
                    <Badge className="text-[9px] bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-0">{toPersianDigits(deductionItems.length)} آیتم</Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-rose-50/50 dark:bg-rose-950/20">
                        <TableHead className="text-right text-xs">عنوان</TableHead>
                        <TableHead className="text-right text-xs">کد</TableHead>
                        <TableHead className="text-right text-xs">نوع محاسبه</TableHead>
                        <TableHead className="text-right text-xs">مقدار/فرمول</TableHead>
                        <TableHead className="text-right text-xs">پرچم‌ها</TableHead>
                        <TableHead className="text-center text-xs">وضعیت</TableHead>
                        <TableHead className="text-center text-xs">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deductionItems.map(item => (
                        <TableRow key={item.id} className={!item.isActive ? 'opacity-50' : ''}>
                          <TableCell className="text-sm font-medium">{item.title}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono" dir="ltr">{item.code}</TableCell>
                          <TableCell>
                            <Badge className={`text-[9px] border-0 ${
                              item.calculationType === 'fixed' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                              item.calculationType === 'percentage' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                              'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                            }`}>
                              {item.calculationType === 'fixed' ? 'ثابت' : item.calculationType === 'percentage' ? 'درصدی' : 'فرمول'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.calculationType === 'fixed' && (
                              <span className="font-mono" dir="ltr">{formatCurrency(RIALS_TO_TOMANS(item.value))}</span>
                            )}
                            {item.calculationType === 'percentage' && (
                              <span className="font-mono">{toPersianDigits(item.value)}٪ حقوق پایه</span>
                            )}
                            {item.calculationType === 'formula' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 cursor-help text-violet-600 dark:text-violet-400">
                                      {item.formula?.name || 'فرمول'}
                                      <Info className="w-3 h-3" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs" dir="rtl">
                                    <p className="font-semibold mb-1">{item.formula?.name || 'فرمول'}</p>
                                    {item.formula?.expression && (
                                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded block mt-1" dir="ltr">{item.formula.expression}</code>
                                    )}
                                    {FORMULA_DESCRIPTIONS[item.formula?.code || ''] && (
                                      <p className="text-xs mt-1 text-muted-foreground">{FORMULA_DESCRIPTIONS[item.formula?.code || '']}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {item.isInsurable && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-0.5 rounded bg-blue-100 dark:bg-blue-900/30">
                                        <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>مشمول بیمه</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {item.isTaxable && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-0.5 rounded bg-amber-100 dark:bg-amber-900/30">
                                        <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>مشمول مالیات</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {item.isSystem && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                        <Lock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>سیستمی</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {!item.isInsurable && !item.isTaxable && !item.isSystem && (
                                <span className="text-[10px] text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {togglingItemId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                            ) : (
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={(checked) => handleToggleItemActive(item.id, checked)}
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setItemDialog({ open: true, item })}>
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>ویرایش</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {!item.isSystem && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 hover:text-rose-700" onClick={() => handleDeleteItem(item.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>حذف</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* پله‌های مالیاتی */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            پله‌های مالیاتی
            <Badge variant="outline" className="text-[10px]">{toPersianDigits(taxBrackets.length)} پله</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taxBrackets.length > 0 && (
            <div className="mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50/50 to-orange-50/50 dark:from-rose-950/10 dark:to-orange-950/10 border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-rose-100/80 to-orange-100/80 dark:from-rose-950/30 dark:to-orange-950/30 hover:bg-gradient-to-r hover:from-rose-100/80 hover:to-orange-100/80">
                    <TableHead className="text-right text-xs">پله</TableHead>
                    <TableHead className="text-right text-xs">حداقل (تومان)</TableHead>
                    <TableHead className="text-right text-xs">حداکثر (تومان)</TableHead>
                    <TableHead className="text-right text-xs">نرخ (٪)</TableHead>
                    <TableHead className="text-center text-xs">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxBrackets.map(bracket => (
                    <TableRow key={bracket.id}>
                      {editingBracketId === bracket.id ? (
                        <>
                          <TableCell>
                            <Input type="number" value={editingBracketForm.orderNum} onChange={(e) => setEditingBracketForm(f => ({ ...f, orderNum: e.target.value }))} dir="ltr" className="h-7 text-sm w-16" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={editingBracketForm.minAmount} onChange={(e) => setEditingBracketForm(f => ({ ...f, minAmount: e.target.value }))} dir="ltr" className="h-7 text-sm w-32" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={editingBracketForm.maxAmount} onChange={(e) => setEditingBracketForm(f => ({ ...f, maxAmount: e.target.value }))} dir="ltr" className="h-7 text-sm w-32" placeholder="0 = بی‌نهایت" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" step="0.5" value={editingBracketForm.rate} onChange={(e) => setEditingBracketForm(f => ({ ...f, rate: e.target.value }))} dir="ltr" className="h-7 text-sm w-20" />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={() => handleUpdateBracket(bracket.id)}>
                                <Save className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingBracketId(null)}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-sm font-medium">{toPersianDigits(bracket.orderNum)}</TableCell>
                          <TableCell className="text-sm font-mono" dir="ltr">{formatCurrency(bracket.minAmount)}</TableCell>
                          <TableCell className="text-sm font-mono" dir="ltr">
                            {bracket.maxAmount === 0 ? (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-[10px]">بدون سقف</Badge>
                            ) : (
                              formatCurrency(bracket.maxAmount)
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-0 text-[10px]">{toPersianDigits(bracket.rate)}٪</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditBracket(bracket)}>
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>ویرایش</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 hover:text-rose-700" onClick={() => handleDeleteBracket(bracket.id)}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>حذف</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="space-y-1 flex-1">
              <Label className="text-xs">پله</Label>
              <Input type="number" value={bracketForm.orderNum} onChange={(e) => setBracketForm(f => ({ ...f, orderNum: e.target.value }))} dir="ltr" className="h-8 text-sm" />
            </div>
            <div className="space-y-1 flex-1">
              <Label className="text-xs">حداقل (تومان)</Label>
              <Input type="number" value={bracketForm.minAmount} onChange={(e) => setBracketForm(f => ({ ...f, minAmount: e.target.value }))} dir="ltr" className="h-8 text-sm" />
            </div>
            <div className="space-y-1 flex-1">
              <Label className="text-xs">حداکثر (تومان)</Label>
              <Input type="number" value={bracketForm.maxAmount} onChange={(e) => setBracketForm(f => ({ ...f, maxAmount: e.target.value }))} dir="ltr" className="h-8 text-sm" placeholder="0 = بی‌نهایت" />
            </div>
            <div className="space-y-1 flex-1">
              <Label className="text-xs">نرخ (٪)</Label>
              <Input type="number" step="0.5" value={bracketForm.rate} onChange={(e) => setBracketForm(f => ({ ...f, rate: e.target.value }))} dir="ltr" className="h-8 text-sm" />
            </div>
            <Button size="sm" onClick={handleAddTaxBracket} className="gap-1 h-8">
              <Plus className="w-3 h-3" />
              افزودن
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PayrollItem Form Dialog */}
      <PayrollItemFormDialog
        open={itemDialog.open}
        onClose={() => setItemDialog({ open: false, item: null })}
        onSave={handleSaveItem}
        initialData={itemDialog.item}
        year={year}
      />
    </div>
  )
}
