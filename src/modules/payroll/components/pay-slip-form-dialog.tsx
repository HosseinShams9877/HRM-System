'use client'

import { useState, useMemo } from 'react'
import {
  Search, Plus, Receipt, AlertTriangle, Info, Lock,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip'
import { toPersianDigits, formatCurrency, getTodayShamsi } from '@/core/lib/utils-fa'
import { PERSIAN_MONTHS, RIALS_TO_TOMANS, FORMULA_DESCRIPTIONS } from '../constants'
import type { PaySlipFormDialogProps } from '../index'

// ============================================
// PaySlipFormDialog
// ============================================

export function PaySlipFormDialog({
  open,
  onClose,
  onSubmit,
  employees,
  initialData,
  payrollItems,
  year,
}: PaySlipFormDialogProps) {
  const isEdit = !!initialData
  const today = getTodayShamsi()
  const [formYear, setFormYear] = useState(year || today.year)
  const [formMonth, setFormMonth] = useState(today.month)
  const [employeeId, setEmployeeId] = useState('')
  const [baseSalary, setBaseSalary] = useState('')
  const [workDays, setWorkDays] = useState('30')
  const [overtimeHours, setOvertimeHours] = useState('0')
  const [notes, setNotes] = useState('')
  const [empSearch, setEmpSearch] = useState('')
  const [itemAmounts, setItemAmounts] = useState<Record<string, string>>({})
  const [prevOpen, setPrevOpen] = useState(open)
  const [prevInitialData, setPrevInitialData] = useState(initialData)

  // Adjust state when dialog opens or initialData changes (React 19 pattern)
  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open)
    setPrevInitialData(initialData)
    if (open) {
      if (initialData) {
        setFormYear(initialData.year)
        setFormMonth(initialData.month)
        setEmployeeId(initialData.employeeId)
        setBaseSalary(String(RIALS_TO_TOMANS(initialData.baseSalary)))
        setWorkDays(String(initialData.workDays))
        setOvertimeHours(String(initialData.overtimeHours))
        setNotes(initialData.notes || '')
        const amounts: Record<string, string> = {}
        for (const item of initialData.items) {
          if (item.payrollItemId) {
            amounts[item.payrollItemId] = String(RIALS_TO_TOMANS(item.amount))
          } else {
            amounts[`manual_${item.id}`] = String(RIALS_TO_TOMANS(item.amount))
          }
        }
        setItemAmounts(amounts)
      } else {
        setFormYear(year || today.year)
        setFormMonth(today.month)
        setEmployeeId('')
        setBaseSalary('')
        setWorkDays('30')
        setOvertimeHours('0')
        setNotes('')
        const amounts: Record<string, string> = {}
        for (const item of payrollItems) {
          if (item.calculationType === 'fixed') {
            amounts[item.id] = String(RIALS_TO_TOMANS(item.value))
          } else if (item.calculationType === 'percentage') {
            amounts[item.id] = '0'
          } else if (item.calculationType === 'formula') {
            amounts[item.id] = '0'
          }
        }
        setItemAmounts(amounts)
      }
      setEmpSearch('')
    }
  }

  // Filter payroll items for the selected year
  const relevantItems = useMemo(() => {
    return payrollItems
      .filter(item => item.year === formYear && item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [payrollItems, formYear])

  const allowanceItems = relevantItems.filter(item => item.category === 'allowance')
  const deductionItems = relevantItems.filter(item => item.category === 'deduction')

  const filteredEmployees = empSearch
    ? employees.filter(e =>
        `${e.firstName} ${e.lastName}`.includes(empSearch) ||
        e.personnelCode.includes(empSearch)
      )
    : employees

  // Calculate amounts dynamically
  const baseSalaryNum = Number(baseSalary || 0)

  const calculatedAmounts = useMemo(() => {
    const calc: Record<string, number> = {}
    for (const item of relevantItems) {
      if (item.calculationType === 'fixed') {
        const userVal = Number(itemAmounts[item.id] || 0)
        calc[item.id] = item.isEditable ? userVal : RIALS_TO_TOMANS(item.value)
      } else if (item.calculationType === 'percentage') {
        calc[item.id] = Math.round(baseSalaryNum * item.value / 100)
      } else if (item.calculationType === 'formula') {
        // Formulas auto-calculate; show read-only
        calc[item.id] = Number(itemAmounts[item.id] || 0)
      }
    }
    return calc
  }, [relevantItems, itemAmounts, baseSalaryNum])

  const totalAllowances = useMemo(() => {
    return allowanceItems.reduce((sum, item) => sum + (calculatedAmounts[item.id] || 0), 0)
  }, [allowanceItems, calculatedAmounts])

  const totalDeductions = useMemo(() => {
    return deductionItems.reduce((sum, item) => sum + (calculatedAmounts[item.id] || 0), 0)
  }, [deductionItems, calculatedAmounts])

  const grossSalary = baseSalaryNum + totalAllowances
  const netSalary = grossSalary - totalDeductions

  const handleEmployeeChange = (empId: string) => {
    setEmployeeId(empId)
  }

  const handleSubmit = () => {
    if (!employeeId || !baseSalary) return

    const items: { title: string; category: string; amount: number; payrollItemId: string | null; sortOrder: number }[] = []

    for (const item of relevantItems) {
      const amountInTomans = calculatedAmounts[item.id] || 0
      const amountInRials = amountInTomans * 10
      items.push({
        title: item.title,
        category: item.category,
        amount: amountInRials,
        payrollItemId: item.id,
        sortOrder: item.sortOrder,
      })
    }

    onSubmit({
      employeeId,
      year: formYear,
      month: formMonth,
      baseSalary: baseSalaryNum * 10, // Convert to RIALS
      workDays: Number(workDays || 30),
      overtimeHours: Number(overtimeHours || 0),
      notes: notes || null,
      items,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            {isEdit ? 'ویرایش فیش حقوقی' : 'صدور فیش حقوقی جدید'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات فیش حقوقی را بروزرسانی کنید' : 'اطلاعات فیش حقوقی جدید را وارد کنید'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* اطلاعات پایه */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              اطلاعات پایه
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>کارمند *</Label>
                {isEdit ? (
                  <Input
                    value={`${initialData?.employee?.firstName || ''} ${initialData?.employee?.lastName || ''}`}
                    disabled
                    className="bg-muted"
                  />
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="جستجو نام یا کد..."
                        value={empSearch}
                        onChange={(e) => setEmpSearch(e.target.value)}
                        className="pr-10 mb-2"
                      />
                    </div>
                    <Select value={employeeId} onValueChange={handleEmployeeChange}>
                      <SelectTrigger><SelectValue placeholder="انتخاب کارمند" /></SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {filteredEmployees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.personnelCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label>سال *</Label>
                <Input
                  type="number"
                  value={formYear}
                  onChange={(e) => setFormYear(Number(e.target.value))}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>ماه *</Label>
                <Select value={String(formMonth)} onValueChange={(v) => setFormMonth(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PERSIAN_MONTHS.map((m, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>حقوق پایه (تومان) *</Label>
                <Input
                  type="number"
                  placeholder="مبلغ حقوق پایه"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label>روزهای کارکرد</Label>
                <Input
                  type="number"
                  value={workDays}
                  onChange={(e) => setWorkDays(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>ساعات اضافه‌کاری</Label>
                <Input
                  type="number"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>توضیحات</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اختیاری"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* مزایا - Dynamic */}
          {allowanceItems.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                مزایا و پرداختی
                <Badge variant="outline" className="text-[10px]">
                  {toPersianDigits(allowanceItems.length)} آیتم
                </Badge>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allowanceItems.map(item => {
                  const isFormula = item.calculationType === 'formula'
                  const isPercentage = item.calculationType === 'percentage'
                  const isReadonly = isFormula || (item.calculationType === 'fixed' && !item.isEditable)
                  const displayValue = calculatedAmounts[item.id] || 0

                  return (
                    <div key={item.id} className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs">
                        {item.title}
                        {isFormula && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                {FORMULA_DESCRIPTIONS[item.formula?.code || ''] || item.formula?.name || 'محاسبه خودکار'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {isPercentage && (
                          <span className="text-muted-foreground text-[10px]">
                            ({toPersianDigits(item.value)}٪ حقوق پایه)
                          </span>
                        )}
                        {item.calculationType === 'fixed' && !item.isEditable && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={isReadonly ? displayValue : (itemAmounts[item.id] || '')}
                          onChange={(e) => setItemAmounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                          disabled={isReadonly}
                          dir="ltr"
                          className={isReadonly ? 'bg-muted' : ''}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">تومان</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {allowanceItems.length > 0 && deductionItems.length > 0 && <Separator />}

          {/* کسورات - Dynamic */}
          {deductionItems.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                کسورات
                <Badge variant="outline" className="text-[10px]">
                  {toPersianDigits(deductionItems.length)} آیتم
                </Badge>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {deductionItems.map(item => {
                  const isFormula = item.calculationType === 'formula'
                  const isPercentage = item.calculationType === 'percentage'
                  const isReadonly = isFormula || (item.calculationType === 'fixed' && !item.isEditable)
                  const displayValue = calculatedAmounts[item.id] || 0

                  return (
                    <div key={item.id} className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs">
                        {item.title}
                        {isFormula && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                {FORMULA_DESCRIPTIONS[item.formula?.code || ''] || item.formula?.name || 'محاسبه خودکار'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {isPercentage && (
                          <span className="text-muted-foreground text-[10px]">
                            ({toPersianDigits(item.value)}٪ حقوق پایه)
                          </span>
                        )}
                        {item.calculationType === 'fixed' && !item.isEditable && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={isReadonly ? displayValue : (itemAmounts[item.id] || '')}
                          onChange={(e) => setItemAmounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                          disabled={isReadonly}
                          dir="ltr"
                          className={isReadonly ? 'bg-muted' : ''}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">تومان</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {relevantItems.length === 0 && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>آیتم حقوقی برای سال {toPersianDigits(formYear)} تعریف نشده است. لطفاً ابتدا از بخش تنظیمات آیتم‌های حقوقی را تعریف کنید.</span>
            </div>
          )}

          <Separator />

          {/* خلاصه محاسبات */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground mb-1">حقوق پایه</div>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(baseSalaryNum)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">جمع مزایا</div>
                <div className="text-sm font-bold text-teal-700 dark:text-teal-300">
                  {formatCurrency(totalAllowances)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">ناخالص</div>
                <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(grossSalary)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">جمع کسورات</div>
                <div className="text-sm font-bold text-rose-700 dark:text-rose-300">
                  {formatCurrency(totalDeductions)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">خالص پرداختی</div>
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(netSalary)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!employeeId || !baseSalary || relevantItems.length === 0} className="gap-2">
            <Receipt className="w-4 h-4" />
            {isEdit ? 'بروزرسانی' : 'صدور فیش'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
