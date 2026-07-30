'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
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
// توابع تبدیل اعداد
// ============================================

const toEnglishNumber = (str: string): string => {
  const map: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  }
  return str.replace(/[۰-۹]/g, (d) => map[d] || d)
}

const toPersianNumber = (str: string): string => {
  if (!str) return ''
  const map: Record<string, string> = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
  }
  return str.replace(/\d/g, (d) => map[d] || d)
}

// ============================================
// تابع تطابق کد آیتم با مزایای کارمند
// ============================================
const getBenefitKey = (code: string): string | null => {
  const mapping: Record<string, string> = {
    'HOUSING': 'housingAllowance',
    'HOUSING_ALLOWANCE': 'housingAllowance',
    'FOOD': 'workAllowance',
    'FOOD_ALLOWANCE': 'workAllowance',
    'BEN': 'workAllowance',
    'SPOUSE': 'spouseAllowance',
    'SPOUSE_ALLOWANCE': 'spouseAllowance',
    'CHILD': 'childAllowance',
    'CHILD_ALLOWANCE': 'childAllowance',
    'RESPONSIBILITY': 'responsibilityAllowance',
    'RESPONSIBILITY_ALLOWANCE': 'responsibilityAllowance',
    'OTHER': 'otherAllowances',
    'OTHER_ALLOWANCES': 'otherAllowances',
    'SENIORITY': 'yearsOfServiceBase',
    'YEARS_OF_SERVICE': 'yearsOfServiceBase',
    'SERVICE_BASE': 'yearsOfServiceBase',
  }
  return mapping[code] || null
}

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
  const [employeeBenefits, setEmployeeBenefits] = useState<Record<string, number>>({})
  
  // ============================================
  // Stateهای مربوط به حکم
  // ============================================
  const [generateOrder, setGenerateOrder] = useState(false)
  const [orderType, setOrderType] = useState('SALARY_CHANGE')
  const [orderEffectiveDate, setOrderEffectiveDate] = useState('')
  const [orderDescription, setOrderDescription] = useState('')
  const [orderNewPosition, setOrderNewPosition] = useState('')
  const [orderNewDepartment, setOrderNewDepartment] = useState('')
  
  const hasInitialized = useRef(false)
  const salaryLoaded = useRef(false)

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
        // بررسی آیا این آیتم با یکی از مزایای کارمند مطابقت دارد
        const benefitKey = getBenefitKey(item.code)
        if (benefitKey && employeeBenefits[benefitKey] !== undefined) {
          calc[item.id] = employeeBenefits[benefitKey]
        } else {
          const userVal = Number(itemAmounts[item.id] || 0)
          calc[item.id] = item.isEditable ? userVal : RIALS_TO_TOMANS(item.value)
        }
      } else if (item.calculationType === 'percentage') {
        calc[item.id] = Math.round(baseSalaryNum * item.value / 100)
      } else if (item.calculationType === 'formula') {
        calc[item.id] = Number(itemAmounts[item.id] || 0)
      }
    }
    return calc
  }, [relevantItems, itemAmounts, baseSalaryNum, employeeBenefits])

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
    salaryLoaded.current = false
    setEmployeeBenefits({})
  }

  // ============================================
  // تابع کمکی برای عنوان حکم بر اساس نوع
  // ============================================
  const getOrderTitle = (type: string): string => {
    const titles: Record<string, string> = {
      SALARY_CHANGE: 'حکم تغییر حقوق',
      POSITION_CHANGE: 'حکم تغییر سمت',
      CONTRACT_EXTENSION: 'حکم تمدید قرارداد',
      PROMOTION: 'حکم ارتقا',
      TRANSFER: 'حکم انتقال',
      TERMINATION: 'حکم پایان همکاری',
    }
    return titles[type] || 'حکم کارگزینی'
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

    const orderData = generateOrder ? {
      employeeId,
      orderType: orderType,
      title: getOrderTitle(orderType),
      description: orderDescription || null,
      issueDate: getTodayShamsi().full,
      effectiveDate: orderEffectiveDate || getTodayShamsi().full,
      status: 'active',
      baseSalary: baseSalaryNum * 10,
      newPosition: orderNewPosition || null,
      newDepartment: orderNewDepartment || null,
      housingAllowance: null,
      foodAllowance: null,
      attractionAllowance: null,
      responsibilityAllowance: null,
      otherAllowances: null,
      fixedDeductions: null,
      spouseAllowance: null,
      childAllowance: null,
      yearsOfServiceBase: null,
      insuranceStatus: null,
      taxStatus: null,
    } : null

    onSubmit({
      employeeId,
      year: formYear,
      month: formMonth,
      baseSalary: baseSalaryNum * 10,
      workDays: Number(workDays || 30),
      overtimeHours: Number(overtimeHours || 0),
      notes: notes || null,
      items,
      generateOrder,
      orderData,
    })
  }

  // ✅ مقداردهی اولیه دیالوگ
  useEffect(() => {
    if (open && !hasInitialized.current) {
      hasInitialized.current = true
      
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
        setOrderEffectiveDate(getTodayShamsi().full)
      } else {
        setFormYear(year || today.year)
        setFormMonth(today.month)
        setEmployeeId('')
        setBaseSalary('')
        setWorkDays('30')
        setOvertimeHours('0')
        setNotes('')
        setEmployeeBenefits({})
        const amounts: Record<string, string> = {}
        for (const item of payrollItems) {
          if (item.calculationType === 'fixed') {
            amounts[item.id] = String(RIALS_TO_TOMANS(item.value))
          } else {
            amounts[item.id] = '0'
          }
        }
        setItemAmounts(amounts)
        setOrderEffectiveDate(getTodayShamsi().full)
        setOrderType('SALARY_CHANGE')
        setOrderDescription('')
        setOrderNewPosition('')
        setOrderNewDepartment('')
        setGenerateOrder(false)
      }
      setEmpSearch('')
    }

    if (!open) {
      hasInitialized.current = false
      salaryLoaded.current = false
    }
  }, [open, initialData, year, today, payrollItems])

  // ============================================
  // بارگذاری حقوق پایه و مزایا از اطلاعات کارمند
  // ============================================
  useEffect(() => {
    if (!employeeId) return
    if (salaryLoaded.current) return
    if (isEdit) return
    
    const loadEmployeeData = async () => {
      try {
        const res = await fetch(`/api/employees/${employeeId}/financial`)
        if (res.ok) {
          const json = await res.json()
          const data = json.data || json
          
          // ۱. حقوق پایه
          if (data.baseSalary) {
            setBaseSalary(String(RIALS_TO_TOMANS(data.baseSalary)))
          } else {
            const settingRes = await fetch('/api/payroll/settings')
            if (settingRes.ok) {
              const settingJson = await settingRes.json()
              const setting = settingJson.setting
              if (setting?.baseSalaryDefault) {
                setBaseSalary(String(RIALS_TO_TOMANS(setting.baseSalaryDefault)))
              }
            }
          }
          
          // ۲. مزایا
          const benefits: Record<string, number> = {}
          if (data.housingAllowance) benefits['housingAllowance'] = RIALS_TO_TOMANS(data.housingAllowance)
          if (data.workAllowance) benefits['workAllowance'] = RIALS_TO_TOMANS(data.workAllowance)
          if (data.spouseAllowance) benefits['spouseAllowance'] = RIALS_TO_TOMANS(data.spouseAllowance)
          if (data.childAllowance) benefits['childAllowance'] = RIALS_TO_TOMANS(data.childAllowance)
          if (data.responsibilityAllowance) benefits['responsibilityAllowance'] = RIALS_TO_TOMANS(data.responsibilityAllowance)
          if (data.otherAllowances) benefits['otherAllowances'] = RIALS_TO_TOMANS(data.otherAllowances)
          if (data.yearsOfServiceBase) benefits['yearsOfServiceBase'] = RIALS_TO_TOMANS(data.yearsOfServiceBase)
          
          setEmployeeBenefits(benefits)
          
          // ۳. تنظیم مقادیر آیتم‌ها با مزایا
          const newItemAmounts: Record<string, string> = {}
          for (const item of payrollItems) {
            const benefitKey = getBenefitKey(item.code)
            if (benefitKey && benefits[benefitKey] !== undefined) {
              newItemAmounts[item.id] = String(benefits[benefitKey])
            } else if (item.calculationType === 'fixed') {
              newItemAmounts[item.id] = String(RIALS_TO_TOMANS(item.value))
            } else {
              newItemAmounts[item.id] = '0'
            }
          }
          setItemAmounts(newItemAmounts)
          
          salaryLoaded.current = true
        }
      } catch (error) {
        console.error('Error loading employee data:', error)
        salaryLoaded.current = true
      }
    }
    
    loadEmployeeData()
  }, [employeeId, isEdit, payrollItems])

  // ============================================
  // بارگذاری کارکرد ماهانه
  // ============================================
  useEffect(() => {
    if (!employeeId || !formYear || !formMonth) return
    
    const loadWorkRecord = async () => {
      try {
        const res = await fetch(
          `/api/payroll/work-records?employeeId=${employeeId}&year=${formYear}&month=${formMonth}`
        )
        if (res.ok) {
          const json = await res.json()
          const record = json.records?.[0]
          if (record) {
            setWorkDays(String(record.workDays || 30))
            setOvertimeHours(String(record.overtimeHours || 0))
          }
        }
      } catch {
        // خطا را نادیده بگیرید
      }
    }
    
    loadWorkRecord()
  }, [employeeId, formYear, formMonth])
  
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
          {/* اطلاعات پایه - همان کد قبلی */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              اطلاعات پایه
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* کارمند */}
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
                        {filteredEmployees.length === 0 ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            {empSearch ? 'کارمندی یافت نشد' : 'کارمندی موجود نیست'}
                          </div>
                        ) : (
                          filteredEmployees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName} ({toPersianDigits(emp.personnelCode)})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
              {/* سال */}
              <div className="space-y-2">
                <Label>سال *</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(String(formYear))}
                  onChange={(e) => {
                    const englishNumber = toEnglishNumber(e.target.value)
                    const numeric = englishNumber.replace(/[^0-9]/g, '')
                    if (numeric) setFormYear(Number(numeric))
                  }}
                  dir="ltr"
                  placeholder={toPersianNumber('۱۴۰۴')}
                />
              </div>
              {/* ماه */}
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
              {/* حقوق پایه */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>حقوق پایه * <span className="text-muted-foreground text-xs mr-1">(تومان)</span></Label>
                  {!isEdit && employeeId && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">
                      از کارمند
                    </Badge>
                  )}
                </div>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder={toPersianNumber('حقوق پایه')}
                  value={toPersianNumber(baseSalary)}
                  onChange={(e) => {
                    const englishNumber = toEnglishNumber(e.target.value)
                    const numeric = englishNumber.replace(/[^0-9.]/g, '')
                    setBaseSalary(numeric)
                  }}
                  dir="ltr"
                  className={!isEdit && employeeId ? 'bg-muted/50' : ''}
                  readOnly={!isEdit && !!employeeId}
                />
                {!isEdit && employeeId && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    از اطلاعات مالی کارمند دریافت شده است.
                  </p>
                )}
              </div>
            </div>
            {/* روزهای کارکرد، اضافه‌کاری، توضیحات */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label>روزهای کارکرد</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(workDays)}
                  onChange={(e) => {
                    const englishNumber = toEnglishNumber(e.target.value)
                    const numeric = englishNumber.replace(/[^0-9.]/g, '')
                    setWorkDays(numeric)
                  }}
                  dir="ltr"
                  placeholder={toPersianNumber('مثلاً ۳۰')}
                />
              </div>
              <div className="space-y-2">
                <Label>ساعات اضافه‌کاری</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(overtimeHours)}
                  onChange={(e) => {
                    const englishNumber = toEnglishNumber(e.target.value)
                    const numeric = englishNumber.replace(/[^0-9.]/g, '')
                    setOvertimeHours(numeric)
                  }}
                  dir="ltr"
                  placeholder={toPersianNumber('مثلاً ۵')}
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
                {!isEdit && employeeId && Object.keys(employeeBenefits).length > 0 && (
                  <Badge className="text-[10px] bg-emerald-100 text-emerald-700">
                    از اطلاعات کارمند
                  </Badge>
                )}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allowanceItems.map(item => {
                  const isFormula = item.calculationType === 'formula'
                  const isPercentage = item.calculationType === 'percentage'
                  const benefitKey = getBenefitKey(item.code)
                  const hasBenefit = benefitKey && employeeBenefits[benefitKey] !== undefined
                  const isReadonly = isFormula || (item.calculationType === 'fixed' && !item.isEditable) || hasBenefit
                  const displayValue = calculatedAmounts[item.id] || 0

                  return (
                    <div key={item.id} className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs">
                        {item.title}
                        <span className="text-[10px] text-muted-foreground">(تومان)</span>
                        {hasBenefit && (
                          <Badge className="text-[9px] bg-emerald-100 text-emerald-700 border-0 px-1.5 py-0">
                            از کارمند
                          </Badge>
                        )}
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
                        {item.calculationType === 'fixed' && !item.isEditable && !hasBenefit && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={isReadonly ? toPersianNumber(String(displayValue)) : toPersianNumber(itemAmounts[item.id] || '')}
                          onChange={(e) => {
                            if (isReadonly) return
                            const englishNumber = toEnglishNumber(e.target.value)
                            const numeric = englishNumber.replace(/[^0-9.]/g, '')
                            setItemAmounts(prev => ({ ...prev, [item.id]: numeric }))
                          }}
                          disabled={isReadonly}
                          dir="ltr"
                          className={isReadonly ? 'bg-muted/50' : ''}
                          placeholder={toPersianNumber('۰')}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {allowanceItems.length > 0 && deductionItems.length > 0 && <Separator />}

          {/* کسورات - بدون تغییر */}
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
                        <span className="text-[10px] text-muted-foreground">(تومان)</span>
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
                          type="text"
                          inputMode="numeric"
                          value={isReadonly ? toPersianNumber(String(displayValue)) : toPersianNumber(itemAmounts[item.id] || '')}
                          onChange={(e) => {
                            if (isReadonly) return
                            const englishNumber = toEnglishNumber(e.target.value)
                            const numeric = englishNumber.replace(/[^0-9.]/g, '')
                            setItemAmounts(prev => ({ ...prev, [item.id]: numeric }))
                          }}
                          disabled={isReadonly}
                          dir="ltr"
                          className={isReadonly ? 'bg-muted' : ''}
                          placeholder={toPersianNumber('۰')}
                        />
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

          {/* گزینه صدور حکم همزمان - بدون تغییر */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={generateOrder}
                onChange={(e) => setGenerateOrder(e.target.checked)}
                className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-sm text-blue-700 dark:text-blue-300">
                  صدور همزمان حکم کارگزینی
                </span>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  با فعال کردن این گزینه، به همراه فیش حقوقی یک حکم کارگزینی نیز صادر می‌شود.
                </p>
              </div>
            </label>
            
            {generateOrder && (
              <div className="mt-3 space-y-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-700 dark:text-blue-300">نوع حکم *</Label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="انتخاب نوع حکم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALARY_CHANGE">تغییر حقوق</SelectItem>
                        <SelectItem value="POSITION_CHANGE">تغییر سمت</SelectItem>
                        <SelectItem value="CONTRACT_EXTENSION">تمدید قرارداد</SelectItem>
                        <SelectItem value="PROMOTION">ارتقا</SelectItem>
                        <SelectItem value="TRANSFER">انتقال</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-700 dark:text-blue-300">تاریخ اجرا *</Label>
                    <Input
                      type="text"
                      value={orderEffectiveDate}
                      onChange={(e) => setOrderEffectiveDate(e.target.value)}
                      placeholder="مثلاً ۱۴۰۴/۰۱/۰۱"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-700 dark:text-blue-300">سمت جدید (اختیاری)</Label>
                    <Input
                      type="text"
                      value={orderNewPosition}
                      onChange={(e) => setOrderNewPosition(e.target.value)}
                      placeholder="سمت جدید کارمند"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-700 dark:text-blue-300">دپارتمان جدید (اختیاری)</Label>
                    <Input
                      type="text"
                      value={orderNewDepartment}
                      onChange={(e) => setOrderNewDepartment(e.target.value)}
                      placeholder="دپارتمان جدید"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-700 dark:text-blue-300">توضیحات حکم (اختیاری)</Label>
                  <Input
                    value={orderDescription}
                    onChange={(e) => setOrderDescription(e.target.value)}
                    placeholder="توضیحات مربوط به حکم"
                    className="h-8 text-xs"
                  />
                </div>
                
                <div className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-medium">توجه:</span> حقوق پایه جدید به طور خودکار از مبلغ وارد شده در فیش ( 
                  <span className="font-bold">{formatCurrency(baseSalaryNum)}</span> تومان ) گرفته می‌شود.
                </div>
              </div>
            )}
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