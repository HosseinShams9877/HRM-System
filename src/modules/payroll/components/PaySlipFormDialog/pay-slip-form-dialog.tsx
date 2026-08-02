// src/modules/payroll/components/PaySlipFormDialog/pay-slip-form-dialog.tsx

'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Receipt, AlertTriangle, Loader2, Edit3, Save, X } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
import { toPersianDigits, getTodayShamsi } from '@/core/lib/utils-fa'
import { PERSIAN_MONTHS, RIALS_TO_TOMANS } from '../../constants'
import { BasicInfoSection } from './basic-info-section'
import { WorkDetailsSection } from './work-details-section'
import { AllowanceItemsSection } from './allowance-items-section'
import { DeductionItemsSection } from './deduction-items-section'
import { SummarySection } from './summary-section'
import { OrderSection } from './order-section'
import { useEmployeeData } from './use-employee-data'
import { usePayrollCalculations } from './use-payroll-calculations'
import { getOrderTitle } from './payroll-calculations'
import type { PaySlipFormDialogProps } from './types'

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

  // ========== Stateهای فرم ==========
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
  
  // ========== Stateهای کارکرد ==========
  const [workRecordData, setWorkRecordData] = useState<any>(null)
  const [isEditingWorkRecord, setIsEditingWorkRecord] = useState(false)
  const [savingWorkRecord, setSavingWorkRecord] = useState(false)
  const [workRecordStatus, setWorkRecordStatus] = useState<string>('')
  
  const [editWorkDays, setEditWorkDays] = useState('30')
  const [editOvertimeHours, setEditOvertimeHours] = useState('0')
  const [editNightShiftHours, setEditNightShiftHours] = useState('0')
  const [editShiftType, setEditShiftType] = useState<string>('none')
  const [editFridayWorkHours, setEditFridayWorkHours] = useState('0')
  const [editHolidayWorkHours, setEditHolidayWorkHours] = useState('0')
  const [editMissionDays, setEditMissionDays] = useState('0')
  const [editUnpaidLeaveDays, setEditUnpaidLeaveDays] = useState('0')
  const [editAbsenceDays, setEditAbsenceDays] = useState('0')
  const [editDelayHours, setEditDelayHours] = useState('0')
  const [yearsOfService, setYearsOfService] = useState('')  // سال سابقه کار برای سنوات
const [workDaysInYear, setWorkDaysInYear] = useState('')  // روزهای کارکرد در سال برای عیدی

  // ========== Stateهای وام، پاداش، تاریخ استخدام ==========
  const [activeLoans, setActiveLoans] = useState<any[]>([])
  const [monthlyRewards, setMonthlyRewards] = useState<any[]>([])
  const [employeeHireDate, setEmployeeHireDate] = useState<string>('')

  // ========== Stateهای حکم ==========
  const [generateOrder, setGenerateOrder] = useState(false)
  const [orderType, setOrderType] = useState('SALARY_CHANGE')
  const [orderEffectiveDate, setOrderEffectiveDate] = useState('')
  const [orderDescription, setOrderDescription] = useState('')
  const [orderNewPosition, setOrderNewPosition] = useState('')
  const [orderNewDepartment, setOrderNewDepartment] = useState('')

  // ========== Stateهای تنظیمات ==========
  const [settings, setSettings] = useState<any>(null)
  const [taxBrackets, setTaxBrackets] = useState<any[]>([])
  const [loadingSettings, setLoadingSettings] = useState(true)

  const hasInitialized = useRef(false)

  // ========== دریافت تنظیمات ==========
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`/api/payroll/settings?year=${formYear}`)
        if (res.ok) {
          const json = await res.json()
          setSettings(json.setting)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoadingSettings(false)
      }
    }
    loadSettings()
  }, [formYear])

  useEffect(() => {
    const loadTaxBrackets = async () => {
      try {
        const res = await fetch(`/api/payroll/tax-brackets?year=${formYear}`)
        if (res.ok) {
          const json = await res.json()
          setTaxBrackets(json.brackets || [])
        }
      } catch (error) {
        console.error('Error loading tax brackets:', error)
      }
    }
    loadTaxBrackets()
  }, [formYear])

  // ========== دریافت وام، پاداش، تاریخ استخدام ==========
  const fetchActiveLoans = async (empId: string) => {
    if (!empId) return
    try {
      const res = await fetch(`/api/loans?employeeId=${empId}&status=approved`)
      if (res.ok) {
        const json = await res.json()
        setActiveLoans(json.data || [])
      }
    } catch (error) {
      console.error('Error fetching loans:', error)
    }
  }

  const fetchMonthlyRewards = async (empId: string, year: number, month: number) => {
    if (!empId) return
    try {
      console.log('🔍 [fetchMonthlyRewards] شروع درخواست برای:', { empId, year, month })
      const res = await fetch(`/api/rewards?employeeId=${empId}`)
      console.log('🔍 [fetchMonthlyRewards] پاسخ API:', res.status)
      if (res.ok) {
        const json = await res.json()
        const allRewards = json.data || []

        console.log('📊 [fetchMonthlyRewards] همه پاداش‌های دریافتی:', JSON.stringify(allRewards, null, 2))
        const filtered = allRewards.filter((reward: any) => {
          if (!reward.date) return false
          const parts = reward.date.split('/')
          if (parts.length !== 3) return false
          return parseInt(parts[0]) === year && parseInt(parts[1]) === month
        })
        console.log('📊 [fetchMonthlyRewards] پاداش‌های فیلتر شده برای ماه:', { 
          year, 
          month, 
          count: filtered.length,
          data: JSON.stringify(filtered, null, 2)
        })
        setMonthlyRewards(filtered)
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
    }
  }

  const fetchEmployeeHireDate = async (empId: string) => {
    if (!empId) return
    try {
      const res = await fetch(`/api/employees/${empId}`)
      if (res.ok) {
        const json = await res.json()
        const employee = json.data || json
        if (employee.hireDate) setEmployeeHireDate(employee.hireDate)
      }
    } catch (error) {
      console.error('Error fetching employee:', error)
    }
  }

  useEffect(() => {
    if (!employeeId) {
      setActiveLoans([])
      setMonthlyRewards([])
      setEmployeeHireDate('')
      return
    }
    fetchActiveLoans(employeeId)
    fetchMonthlyRewards(employeeId, formYear, formMonth)
    fetchEmployeeHireDate(employeeId)
  }, [employeeId, formYear, formMonth])

  // ========== بارگذاری کارکرد ==========
  useEffect(() => {
    if (!employeeId || !formYear || !formMonth || isEdit) return

    const loadWorkRecord = async () => {
      try {
        const res = await fetch(
          `/api/payroll/work-records?employeeId=${employeeId}&year=${formYear}&month=${formMonth}`
        )
        if (res.ok) {
          const json = await res.json()
          const record = json.records?.[0]
          if (record) {
            setWorkRecordData(record)
            setWorkRecordStatus(record.status || 'draft')
            setEditWorkDays(String(record.workDays || 30))
            setEditOvertimeHours(String(record.overtimeHours || 0))
            setEditNightShiftHours(String(record.nightShiftHours || 0))
            setEditShiftType(record.shiftType || 'none')
            setEditFridayWorkHours(String(record.fridayWorkHours || 0))
            setEditHolidayWorkHours(String(record.holidayWorkHours || 0))
            setEditMissionDays(String(record.missionDays || 0))
            setEditUnpaidLeaveDays(String(record.unpaidLeaveDays || 0))
            setEditAbsenceDays(String(record.absenceDays || 0))
            setEditDelayHours(String(record.delayHours || 0))
            setWorkDays(String(record.workDays || 30))
            setOvertimeHours(String(record.overtimeHours || 0))
          }
        }
      } catch (error) {
        console.error('Error loading work record:', error)
      }
    }

    loadWorkRecord()
  }, [employeeId, formYear, formMonth, isEdit])

  // ========== ریست کردن فیلدها ==========
  useEffect(() => {
    if (!employeeId || isEdit) return

    setWorkDays('30')
    setOvertimeHours('0')
    setBaseSalary('')
    setEmployeeBenefits({})
    setItemAmounts({})
    setWorkRecordData(null)
    setWorkRecordStatus('')
    setEditWorkDays('30')
    setEditOvertimeHours('0')
    setEditNightShiftHours('0')
    setEditShiftType('none')
    setEditFridayWorkHours('0')
    setEditHolidayWorkHours('0')
    setEditMissionDays('0')
    setEditUnpaidLeaveDays('0')
    setEditAbsenceDays('0')
    setEditDelayHours('0')
    setIsEditingWorkRecord(false)
    setActiveLoans([])
    setMonthlyRewards([])
    setEmployeeHireDate('')
  }, [employeeId, isEdit,formYear, formMonth])

  // ========== هوک اطلاعات کارمند ==========
  const { hasBenefits, loading: loadingEmployee } = useEmployeeData({
    employeeId,
    isEdit,
    payrollItems,
    onBaseSalaryLoaded: (salary) => setBaseSalary(salary),
    onBenefitsLoaded: (benefits) => setEmployeeBenefits(benefits),
    onItemAmountsLoaded: (amounts) => setItemAmounts(amounts),
  })

  // ========== محاسبه وام و پاداش ==========
  const totalLoanInstallments = useMemo(() => {
    if (!activeLoans?.length) return 0
    return activeLoans.reduce((sum, loan) => {
      if (loan.installments > 0) {
        return sum + Math.round(loan.amount / loan.installments)
      }
      return sum + (loan.amount || 0)
    }, 0)
  }, [activeLoans])

  // در pay-slip-form-dialog.tsx
const totalRewards = useMemo(() => {
  console.log('🔍 [totalRewards] monthlyRewards:', monthlyRewards)
  
  if (!monthlyRewards?.length) {
    console.log('📊 [totalRewards] نتیجه: 0 (هیچ پاداشی وجود ندارد)')
    return 0
  }
  
  const sum = monthlyRewards.reduce((sum, reward) => {
    console.log(`📊 [totalRewards] اضافه کردن: ${reward.title} = ${reward.amount}`)
    return sum + (reward.amount || 0)
  }, 0)
  
  console.log(`📊 [totalRewards] جمع کل: ${sum}`)
  return sum
}, [monthlyRewards])

  // ========== فیلتر آیتم‌ها ==========

const relevantItems = useMemo(() => {
  let items = [...payrollItems]
  
  const addItem = (code: string, title: string, category: string, sortOrder: number, desc: string) => {
    if (!items.some(item => item.code === code)) {
      items.push({
        id: `${code.toLowerCase()}_auto_${Date.now()}`,
        title,
        code,
        category,
        calculationType: 'formula',
        value: 0,
        formulaId: null,
        isInsurable: false,
        isTaxable: category === 'allowance',
        isEditable: true,
        isSystem: true,
        sortOrder,
        isActive: true,
        year: formYear,
        description: desc,
      } as any)
    }
  }

  // ========== ❌ حذف: مزایای ثابت کارمند (از employee_financial می‌آیند) ==========
  // addItem('HOUSING_ALLOWANCE', 'حق مسکن', 'allowance', 30, ...)
  // addItem('FOOD_ALLOWANCE', 'حق خواربار', 'allowance', 31, ...)
  // addItem('SPOUSE_ALLOWANCE', 'حق تاهل', 'allowance', 32, ...)
  // addItem('CHILD_ALLOWANCE', 'حق اولاد', 'allowance', 33, ...)
  // addItem('RESPONSIBILITY_ALLOWANCE', 'حق مسئولیت', 'allowance', 34, ...)
  // addItem('OTHER_ALLOWANCES', 'سایر مزایا', 'allowance', 35, ...)
  // addItem('YEARS_OF_SERVICE', 'پایه سنوات', 'allowance', 36, ...)

  // ========== ✅ آیتم‌های سیستمی (در payroll_items می‌مانند) ==========

  addItem('EIDI', 'عیدی', 'allowance', 10, 'عیدی (فقط اسفند)')
  addItem('SANAVAT', 'سنوات', 'allowance', 20, 'سنوات ماهانه')

  // ========== ✅ کسورات ==========
  addItem('INSURANCE_EMPLOYEE', 'بیمه تامین اجتماعی', 'deduction', 999, 'محاسبه خودکار بیمه')
  //addItem('TAX_INCOME', 'مالیات بر درآمد', 'deduction', 1000, 'محاسبه خودکار مالیات')
  //addItem('TAX', 'مالیات بر درآمد', 'deduction', 1001, 'محاسبه خودکار مالیات')
  addItem('LOAN_INSTALLMENT', 'قسط وام', 'deduction', 998, 'محاسبه خودکار اقساط وام')

  return items
    .filter(item => item.year === formYear && item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}, [payrollItems, formYear])

  const allowanceItems = relevantItems.filter(item => item.category === 'allowance')
  const deductionItems = relevantItems.filter(item => item.category === 'deduction')

  // ========== مقادیر پایه ==========
  const baseSalaryNum = Number(baseSalary || 0)
  const workDaysNum = Number(workDays || 30)
  const overtimeHoursNum = Number(overtimeHours || 0)

  const nightShiftHours = isEditingWorkRecord ? Number(editNightShiftHours || 0) : Number(workRecordData?.nightShiftHours || 0)
  const shiftType = isEditingWorkRecord ? editShiftType : (workRecordData?.shiftType || 'none')
  const fridayWorkHours = isEditingWorkRecord ? Number(editFridayWorkHours || 0) : Number(workRecordData?.fridayWorkHours || 0)
  const holidayWorkHours = isEditingWorkRecord ? Number(editHolidayWorkHours || 0) : Number(workRecordData?.holidayWorkHours || 0)
  const missionDays = isEditingWorkRecord ? Number(editMissionDays || 0) : Number(workRecordData?.missionDays || 0)
  const unpaidLeaveDays = isEditingWorkRecord ? Number(editUnpaidLeaveDays || 0) : Number(workRecordData?.unpaidLeaveDays || 0)
  const absenceDays = isEditingWorkRecord ? Number(editAbsenceDays || 0) : Number(workRecordData?.absenceDays || 0)
  const delayHours = isEditingWorkRecord ? Number(editDelayHours || 0) : Number(workRecordData?.delayHours || 0)

  // ========== هوک محاسبات ==========
  const {
    calculatedAmounts,
    totalAllowances,
    totalDeductions,
    grossSalary,
    netSalary,
  } = usePayrollCalculations({
    relevantItems,
    itemAmounts,
    baseSalaryNum,
    employeeBenefits,
    overtimeHoursNum,
    nightShiftHours,
    fridayWorkHours,
    holidayWorkHours,
    missionDays,
    unpaidLeaveDays,
    absenceDays,
    delayHours,
    workDaysNum,
    settings,
    taxBrackets,
    allowanceItems,
    totalLoanInstallments,
    totalRewards,
    formYear,
    formMonth,
    employeeHireDate,
    yearsOfService,
    workDaysInYear,
  })

  // ========== ذخیره کارکرد ==========
  const handleSaveWorkRecord = async () => {
    if (!employeeId) return
    setSavingWorkRecord(true)
    try {
      const payload = {
        employeeId,
        year: formYear,
        month: formMonth,
        workDays: Number(editWorkDays || 30),
        overtimeHours: Number(editOvertimeHours || 0),
        nightShiftHours: Number(editNightShiftHours || 0),
        shiftType: editShiftType === 'none' ? null : editShiftType,
        fridayWorkHours: Number(editFridayWorkHours || 0),
        holidayWorkHours: Number(editHolidayWorkHours || 0),
        missionDays: Number(editMissionDays || 0),
        unpaidLeaveDays: Number(editUnpaidLeaveDays || 0),
        absenceDays: Number(editAbsenceDays || 0),
        delayHours: Number(editDelayHours || 0),
        status: workRecordStatus || 'draft',
      }

      const url = workRecordData
        ? `/api/payroll/work-records/${workRecordData.id}`
        : '/api/payroll/work-records'
      const method = workRecordData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const json = await res.json()
        setWorkRecordData(json.record)
        setWorkRecordStatus(json.record.status || 'draft')
        setWorkDays(String(json.record.workDays || 30))
        setOvertimeHours(String(json.record.overtimeHours || 0))
        setIsEditingWorkRecord(false)
      } else {
        const err = await res.json()
        console.error('Error saving work record:', err)
      }
    } catch (error) {
      console.error('Error saving work record:', error)
    } finally {
      setSavingWorkRecord(false)
    }
  }

  // ========== ارسال فرم ==========
  const handleSubmit = () => {
    if (!employeeId || !baseSalary) return

    const items = relevantItems.map(item => ({
      title: item.title,
      category: item.category,
      amount: (calculatedAmounts[item.id] || 0) * 10,
      payrollItemId: item.id,
      sortOrder: item.sortOrder,
    }))

    const orderData = generateOrder ? {
      employeeId,
      orderType,
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
      workDays: workDaysNum,
      overtimeHours: overtimeHoursNum,
      notes: notes || null,
      items,
      generateOrder,
      orderData,
    })
  }

  // ========== مقداردهی اولیه ==========
  useEffect(() => {
    if (open && !hasInitialized.current) {
      hasInitialized.current = true

      if (initialData) {
        setFormYear(initialData.year)
        setFormMonth(initialData.month)
        setEmployeeId(initialData.employeeId)
        setBaseSalary(String(RIALS_TO_TOMANS(initialData.baseSalary)))
        setWorkDays(String(initialData.workDays))
        setOvertimeHours(String(initialData.overtimeHours || 0))
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
        setWorkRecordData(null)
        setWorkRecordStatus('')
        setActiveLoans([])
        setMonthlyRewards([])
        setEmployeeHireDate('')
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
        setIsEditingWorkRecord(false)
      }
      setEmpSearch('')
    }

    if (!open) {
      hasInitialized.current = false
    }
  }, [open, initialData, year, today, payrollItems])

  const hasWorkRecord = !!workRecordData
  const workRecordStatusLabel = workRecordStatus === 'draft' ? 'پیش‌نویس' : 
                                workRecordStatus === 'confirmed' ? 'تأیید شده' : 
                                workRecordStatus === 'closed' ? 'بسته شده' : ''

  const isLoading = loadingEmployee || loadingSettings

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
            {isLoading && (
              <span className="mr-2 inline-flex items-center gap-1 text-emerald-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                در حال بارگذاری...
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <BasicInfoSection
            employees={employees}
            employeeId={employeeId}
            onEmployeeChange={setEmployeeId}
            employeeSearch={empSearch}
            onEmployeeSearchChange={setEmpSearch}
            year={formYear}
            onYearChange={setFormYear}
            month={formMonth}
            onMonthChange={setFormMonth}
            baseSalary={baseSalary}
            onBaseSalaryChange={setBaseSalary}
            isEdit={isEdit}
            isLoadingEmployee={loadingEmployee}
          />

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                اطلاعات کارکرد ماهانه
                {hasWorkRecord && (
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    workRecordStatus === 'draft' ? 'bg-amber-100 text-amber-700' :
                    workRecordStatus === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {workRecordStatusLabel}
                  </span>
                )}
              </h4>
              
              <div className="flex items-center gap-2">
                {hasWorkRecord && !isEditingWorkRecord && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (workRecordData) {
                        setEditWorkDays(String(workRecordData.workDays || 30))
                        setEditOvertimeHours(String(workRecordData.overtimeHours || 0))
                        setEditNightShiftHours(String(workRecordData.nightShiftHours || 0))
                        setEditShiftType(workRecordData.shiftType || 'none')
                        setEditFridayWorkHours(String(workRecordData.fridayWorkHours || 0))
                        setEditHolidayWorkHours(String(workRecordData.holidayWorkHours || 0))
                        setEditMissionDays(String(workRecordData.missionDays || 0))
                        setEditUnpaidLeaveDays(String(workRecordData.unpaidLeaveDays || 0))
                        setEditAbsenceDays(String(workRecordData.absenceDays || 0))
                        setEditDelayHours(String(workRecordData.delayHours || 0))
                      }
                      setIsEditingWorkRecord(true)
                    }}
                    className="gap-1 h-8 text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    ویرایش کارکرد
                  </Button>
                )}
                {isEditingWorkRecord && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveWorkRecord}
                      disabled={savingWorkRecord}
                      className="gap-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      {savingWorkRecord ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      ذخیره
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingWorkRecord(false)
                        if (workRecordData) {
                          setEditWorkDays(String(workRecordData.workDays || 30))
                          setEditOvertimeHours(String(workRecordData.overtimeHours || 0))
                          setEditNightShiftHours(String(workRecordData.nightShiftHours || 0))
                          setEditShiftType(workRecordData.shiftType || 'none')
                          setEditFridayWorkHours(String(workRecordData.fridayWorkHours || 0))
                          setEditHolidayWorkHours(String(workRecordData.holidayWorkHours || 0))
                          setEditMissionDays(String(workRecordData.missionDays || 0))
                          setEditUnpaidLeaveDays(String(workRecordData.unpaidLeaveDays || 0))
                          setEditAbsenceDays(String(workRecordData.absenceDays || 0))
                          setEditDelayHours(String(workRecordData.delayHours || 0))
                        }
                      }}
                      disabled={savingWorkRecord}
                      className="gap-1 h-8 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      انصراف
                    </Button>
                  </>
                )}
              </div>
            </div>

            <WorkDetailsSection
              workDays={isEditingWorkRecord ? editWorkDays : workDays}
              onWorkDaysChange={isEditingWorkRecord ? setEditWorkDays : setWorkDays}
              overtimeHours={isEditingWorkRecord ? editOvertimeHours : overtimeHours}
              onOvertimeHoursChange={isEditingWorkRecord ? setEditOvertimeHours : setOvertimeHours}
              nightShiftHours={editNightShiftHours}
              onNightShiftHoursChange={setEditNightShiftHours}
              shiftType={editShiftType}
              onShiftTypeChange={setEditShiftType}
              fridayWorkHours={editFridayWorkHours}
              onFridayWorkHoursChange={setEditFridayWorkHours}
              holidayWorkHours={editHolidayWorkHours}
              onHolidayWorkHoursChange={setEditHolidayWorkHours}
              missionDays={editMissionDays}
              onMissionDaysChange={setEditMissionDays}
              unpaidLeaveDays={editUnpaidLeaveDays}
              onUnpaidLeaveDaysChange={setEditUnpaidLeaveDays}
              absenceDays={editAbsenceDays}
              onAbsenceDaysChange={setEditAbsenceDays}
              delayHours={editDelayHours}
              onDelayHoursChange={setEditDelayHours}
              notes={notes}
              onNotesChange={setNotes}
              isLoading={isLoading}
              isEditing={isEditingWorkRecord}
              yearsOfService={yearsOfService}
  onYearsOfServiceChange={setYearsOfService}
  workDaysInYear={workDaysInYear}
  onWorkDaysInYearChange={setWorkDaysInYear}
  formMonth={formMonth}
            />
          </div>

          <Separator />

          <AllowanceItemsSection
            items={allowanceItems}
            calculatedAmounts={calculatedAmounts}
            itemAmounts={itemAmounts}
            onItemAmountChange={(id, value) => setItemAmounts(prev => ({ ...prev, [id]: value }))}
            baseSalaryNum={baseSalaryNum}
            hasEmployeeBenefits={hasBenefits}
          />

          {allowanceItems.length > 0 && deductionItems.length > 0 && <Separator />}

          <DeductionItemsSection
            items={deductionItems}
            calculatedAmounts={calculatedAmounts}
            itemAmounts={itemAmounts}
            onItemAmountChange={(id, value) => setItemAmounts(prev => ({ ...prev, [id]: value }))}
          />

          {relevantItems.length === 0 && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>آیتم حقوقی برای سال {toPersianDigits(formYear)} تعریف نشده است.</span>
            </div>
          )}

          <Separator />

          <SummarySection
            baseSalary={baseSalaryNum}
            totalAllowances={totalAllowances}
            totalDeductions={totalDeductions}
            grossSalary={grossSalary}
            netSalary={netSalary}
          />

          <OrderSection
            generateOrder={generateOrder}
            onGenerateOrderChange={setGenerateOrder}
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            orderEffectiveDate={orderEffectiveDate}
            onOrderEffectiveDateChange={setOrderEffectiveDate}
            orderDescription={orderDescription}
            onOrderDescriptionChange={setOrderDescription}
            orderNewPosition={orderNewPosition}
            onOrderNewPositionChange={setOrderNewPosition}
            orderNewDepartment={orderNewDepartment}
            onOrderNewDepartmentChange={setOrderNewDepartment}
            baseSalaryNum={baseSalaryNum}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button
            onClick={handleSubmit}
            disabled={!employeeId || !baseSalary || relevantItems.length === 0 || isLoading}
            className="gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
            {isEdit ? 'بروزرسانی' : 'صدور فیش'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}