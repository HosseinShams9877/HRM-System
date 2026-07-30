// src/modules/payroll/components/pay-slip-form-dialog.tsx

'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
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
import type { PaySlipFormDialogProps } from './types'

// ============================================
// تابع کمکی برای تطابق کد آیتم با مزایا
// ============================================
const getBenefitKeyFromCode = (code: string): string | null => {
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
// تابع عنوان حکم
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

// ============================================
// توابع محاسبه
// ============================================
const calculateHourlyRate = (monthlySalary: number, workDaysPerMonth: number = 30, workHoursPerDay: number = 8): number => {
  return monthlySalary / (workDaysPerMonth * workHoursPerDay)
}

const calculateDailyRate = (monthlySalary: number, workDaysPerMonth: number = 30): number => {
  return monthlySalary / workDaysPerMonth
}

// ============================================
// محاسبه بیمه تامین اجتماعی
// ============================================
const calculateInsurance = (
  baseSalary: number,
  allowanceItems: any[],
  calculatedAmounts: Record<string, number>,
  settings: any,
  workDays: number
): number => {
  if (!settings) {
    console.warn('⚠️ تنظیمات حقوقی دریافت نشد، بیمه محاسبه نمی‌شود')
    return 0
  }

  let insurableAmount = baseSalary
  for (const item of allowanceItems) {
    if (item.isInsurable) {
      insurableAmount += calculatedAmounts[item.id] || 0
    }
  }

  const minDailyWage = settings.minDailyWage / 10
  const workDaysPerMonth = settings.workDaysPerMonth || 30
  const insuranceCeilingMultiplier = settings.insuranceCeilingMultiplier || 7
  const ceiling = minDailyWage * workDaysPerMonth * insuranceCeilingMultiplier

  const cappedInsurable = Math.min(insurableAmount, ceiling)

  const insuranceRate = settings.insuranceRate || 7
  const unemploymentRate = settings.unemploymentInsRate || 1
  const totalRate = insuranceRate + unemploymentRate

  const result = Math.round(cappedInsurable * totalRate / 100)
  console.log('🔍 محاسبه بیمه:', { insurableAmount, cappedInsurable, totalRate, result })
  return result
}

// ============================================
// محاسبه مالیات بر درآمد
// ============================================
const calculateTax = (
  grossSalary: number,
  settings: any,
  taxBrackets: any[]
): number => {
  if (!settings) {
    console.warn('⚠️ تنظیمات حقوقی دریافت نشد، مالیات محاسبه نمی‌شود')
    return 0
  }
  if (!taxBrackets || taxBrackets.length === 0) {
    console.warn('⚠️ پله‌های مالیاتی دریافت نشد، مالیات محاسبه نمی‌شود')
    return 0
  }

  const taxExemptAmount = settings.taxExemptAmount || 0
  const taxableMonthly = Math.max(0, grossSalary - taxExemptAmount)
  const taxableYearly = taxableMonthly * 12

  let annualTax = 0
  let remaining = taxableYearly
  const sortedBrackets = [...taxBrackets].sort((a, b) => a.orderNum - b.orderNum)

  for (const bracket of sortedBrackets) {
    if (remaining <= 0) break
    const minAmount = bracket.minAmount
    const maxAmount = bracket.maxAmount === 0 ? Infinity : bracket.maxAmount
    if (taxableYearly <= minAmount) break
    const taxableInBracket = Math.min(remaining, maxAmount - minAmount)
    if (taxableInBracket > 0) {
      annualTax += taxableInBracket * bracket.rate / 100
      remaining -= taxableInBracket
    }
  }

  const result = Math.round(annualTax / 12)
  console.log('🔍 محاسبه مالیات:', { grossSalary, taxExemptAmount, taxableMonthly, taxableYearly, annualTax, result })
  return result
}

// ============================================
// محاسبه عیدی (فقط در ماه اسفند)
// ============================================
const calculateEidi = (
  baseSalary: number,
  settings: any,
  year: number,
  month: number,
  hireDate: string
): number => {
  // فقط در ماه اسفند (ماه ۱۲) محاسبه شود
  if (month !== 12) return 0
  
  if (!settings) return 0
  
  // حداقل دستمزد روزانه (تومان)
  const minDailyWage = settings.minDailyWage / 10

  console.log("minDay" , minDailyWage)
  
  // محاسبه تعداد روزهای کارکرد در سال (ساده‌شده)
  let daysWorked = 365 // پیش‌فرض
  
  if (hireDate) {
    const parts = hireDate.split('/')
    if (parts.length === 3) {
      const hireYear = parseInt(parts[0])
      const hireMonth = parseInt(parts[1])
      const hireDay = parseInt(parts[2])
      
      const currentYear = year
      if (hireYear < currentYear) {
        daysWorked = 365
      } else if (hireYear === currentYear) {
        // تقریبی: روزهای باقی‌مانده از تاریخ استخدام
        daysWorked = 365 - ((hireMonth - 1) * 30 + hireDay)
        if (daysWorked < 0) daysWorked = 0
      }
    }
  }
  
  // عیدی = (حداقل دستمزد روزانه × روزهای کارکرد) / ۱۲
  let eidi = (minDailyWage * daysWorked) / 12

  console.log("eidi", eidi)
  
  // اعمال حداقل و حداکثر
  const minEidi = minDailyWage * 60
  const maxEidi = minDailyWage * 90
  
  eidi = Math.max(minEidi, Math.min(eidi, maxEidi))
  
  console.log('🎁 محاسبه عیدی:', { minDailyWage, daysWorked, eidi, minEidi, maxEidi })
  return Math.round(eidi)
}

// ============================================
// محاسبه سنوات ماهانه
// ============================================
const calculateSanavat = (
  baseSalary: number,
  settings: any,
  hireDate: string,
  year: number
): number => {
  if (!settings) return 0
  if (!hireDate) return 0
  
  const parts = hireDate.split('/')
  if (parts.length !== 3) return 0
  
  const hireYear = parseInt(parts[0])
  const yearsOfService = year - hireYear
  
  if (yearsOfService <= 0) return 0
  
  const sanavatRate = settings.sanavatRate || 2.5
  const maxYears = settings.sanavatMaxYears || 30
  
  const effectiveYears = Math.min(yearsOfService, maxYears)
  
  const monthlySanavat = (baseSalary * sanavatRate * effectiveYears) / 100 / 12
  
  console.log('📅 محاسبه سنوات:', { baseSalary, sanavatRate, effectiveYears, monthlySanavat })
  return Math.round(monthlySanavat)
}

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

  // ============================================
  // Stateهای فرم
  // ============================================
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
  // Stateهای کارکرد از دیتابیس
  // ============================================
  const [workRecordData, setWorkRecordData] = useState<any>(null)
  const [isEditingWorkRecord, setIsEditingWorkRecord] = useState(false)
  const [savingWorkRecord, setSavingWorkRecord] = useState(false)
  const [workRecordStatus, setWorkRecordStatus] = useState<string>('')
  
  // ============================================
  // Stateهای موقت برای ویرایش کارکرد
  // ============================================
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

  // ============================================
  // Stateهای وام و پاداش
  // ============================================
  const [activeLoans, setActiveLoans] = useState<any[]>([])
  const [monthlyRewards, setMonthlyRewards] = useState<any[]>([])
  const [employeeHireDate, setEmployeeHireDate] = useState<string>('')

  // ============================================
  // Stateهای حکم
  // ============================================
  const [generateOrder, setGenerateOrder] = useState(false)
  const [orderType, setOrderType] = useState('SALARY_CHANGE')
  const [orderEffectiveDate, setOrderEffectiveDate] = useState('')
  const [orderDescription, setOrderDescription] = useState('')
  const [orderNewPosition, setOrderNewPosition] = useState('')
  const [orderNewDepartment, setOrderNewDepartment] = useState('')

  // ============================================
  // Stateهای تنظیمات و مالیات
  // ============================================
  const [settings, setSettings] = useState<any>(null)
  const [taxBrackets, setTaxBrackets] = useState<any[]>([])
  const [loadingSettings, setLoadingSettings] = useState(true)

  const hasInitialized = useRef(false)

  // ============================================
  // دریافت تنظیمات حقوقی
  // ============================================
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`/api/payroll/settings?year=${formYear}`)
        if (res.ok) {
          const json = await res.json()
          setSettings(json.setting)
          console.log('✅ تنظیمات حقوقی دریافت شد:', json.setting)
        } else {
          console.warn('⚠️ تنظیمات حقوقی دریافت نشد')
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoadingSettings(false)
      }
    }
    loadSettings()
  }, [formYear])

  // ============================================
  // دریافت پله‌های مالیاتی
  // ============================================
  useEffect(() => {
    const loadTaxBrackets = async () => {
      try {
        const res = await fetch(`/api/payroll/tax-brackets?year=${formYear}`)
        if (res.ok) {
          const json = await res.json()
          setTaxBrackets(json.brackets || [])
          console.log('✅ پله‌های مالیاتی دریافت شد:', json.brackets)
        } else {
          console.warn('⚠️ پله‌های مالیاتی دریافت نشد')
        }
      } catch (error) {
        console.error('Error loading tax brackets:', error)
      }
    }
    loadTaxBrackets()
  }, [formYear])

  // ============================================
  // دریافت وام‌های فعال کارمند
  // ============================================
  const fetchActiveLoans = async (empId: string) => {
    if (!empId) return
    try {
      console.log('🔄 دریافت وام‌های کارمند:', empId)
      const res = await fetch(`/api/loans?employeeId=${empId}&status=approved`)
      if (res.ok) {
        const json = await res.json()
        const loans = json.data || []
        console.log('📋 تعداد وام‌ها:', loans.length)
        setActiveLoans(loans)
      }
    } catch (error) {
      console.error('Error fetching loans:', error)
    }
  }

  // ============================================
  // دریافت پاداش‌های ماه جاری کارمند
  // ============================================
  const fetchMonthlyRewards = async (empId: string, year: number, month: number) => {
    if (!empId) return
    try {
      const res = await fetch(`/api/rewards?employeeId=${empId}`)
      if (res.ok) {
        const json = await res.json()
        const allRewards = json.data || []
        const filteredRewards = allRewards.filter((reward: any) => {
          if (!reward.date) return false
          const parts = reward.date.split('/')
          if (parts.length !== 3) return false
          const rewardYear = parseInt(parts[0])
          const rewardMonth = parseInt(parts[1])
          return rewardYear === year && rewardMonth === month
        })
        setMonthlyRewards(filteredRewards)
        console.log('✅ پاداش‌های ماه جاری:', filteredRewards)
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
    }
  }

  // ============================================
  // دریافت تاریخ استخدام کارمند
  // ============================================
  const fetchEmployeeHireDate = async (empId: string) => {
    if (!empId) return
    try {
      const res = await fetch(`/api/employees/${empId}`)
      if (res.ok) {
        const json = await res.json()
        const employee = json.data || json
        if (employee.hireDate) {
          setEmployeeHireDate(employee.hireDate)
          console.log('✅ تاریخ استخدام:', employee.hireDate)
        }
      }
    } catch (error) {
      console.error('Error fetching employee:', error)
    }
  }

  // ============================================
  // بارگذاری وام، پاداش و تاریخ استخدام هنگام تغییر کارمند
  // ============================================
  useEffect(() => {
    if (!employeeId) {
      setActiveLoans([])
      setMonthlyRewards([])
      setEmployeeHireDate('')
      return
    }
    
    console.log('🔄 بارگذاری اطلاعات برای کارمند:', employeeId)
    fetchActiveLoans(employeeId)
    fetchMonthlyRewards(employeeId, formYear, formMonth)
    fetchEmployeeHireDate(employeeId)
  }, [employeeId, formYear, formMonth])

  // ============================================
  // فیلتر آیتم‌های حقوقی + اضافه کردن آیتم‌ها
  // ============================================
  const relevantItems = useMemo(() => {
    let items = [...payrollItems]
    
    // بررسی وجود آیتم بیمه
    const hasInsurance = items.some(item => 
      item.code === 'INSURANCE_EMPLOYEE' || item.code === 'INSURANCE' || item.code === 'INSURANCE_SOCIAL'
    )
    
    // بررسی وجود آیتم مالیات
    const hasTax = items.some(item => 
      item.code === 'TAX_INCOME' || item.code === 'TAX' || item.code === 'INCOME_TAX'
    )

    // بررسی وجود آیتم قسط وام
    const hasLoan = items.some(item => 
      item.code === 'LOAN_INSTALLMENT' || item.code === 'LOAN'
    )

    // بررسی وجود آیتم پاداش
    const hasReward = items.some(item => 
      item.code === 'REWARD' || item.code === 'BONUS'
    )

    // بررسی وجود آیتم عیدی
    const hasEidi = items.some(item => 
      item.code === 'EIDI' || item.code === 'YEAR_END_BONUS'
    )

    // بررسی وجود آیتم سنوات
    const hasSanavat = items.some(item => 
      item.code === 'SANAVAT' || item.code === 'SENIORITY'
    )

    // اضافه کردن آیتم بیمه
    if (!hasInsurance) {
      items.push({
        id: `insurance_auto_${Date.now()}`,
        title: 'بیمه تامین اجتماعی',
        code: 'INSURANCE_EMPLOYEE',
        category: 'deduction',
        calculationType: 'formula',
        value: 0,
        formulaId: null,
        isInsurable: false,
        isTaxable: false,
        isEditable: false,
        isSystem: true,
        sortOrder: 999,
        isActive: true,
        year: formYear,
        description: 'محاسبه خودکار بیمه سهم کارمند (۷٪ + ۱٪ بیمه بیکاری)',
      } as any)
      console.log('✅ آیتم بیمه به لیست اضافه شد')
    }
    
    // اضافه کردن آیتم مالیات
    if (!hasTax) {
      items.push({
        id: `tax_auto_${Date.now()}`,
        title: 'مالیات بر درآمد',
        code: 'TAX_INCOME',
        category: 'deduction',
        calculationType: 'formula',
        value: 0,
        formulaId: null,
        isInsurable: false,
        isTaxable: false,
        isEditable: false,
        isSystem: true,
        sortOrder: 1000,
        isActive: true,
        year: formYear,
        description: 'محاسبه خودکار مالیات بر درآمد (پلکانی)',
      } as any)
      console.log('✅ آیتم مالیات به لیست اضافه شد')
    }

    // اضافه کردن آیتم قسط وام
    if (!hasLoan) {
      items.push({
        id: `loan_auto_${Date.now()}`,
        title: 'قسط وام',
        code: 'LOAN_INSTALLMENT',
        category: 'deduction',
        calculationType: 'formula',
        value: 0,
        formulaId: null,
        isInsurable: false,
        isTaxable: false,
        isEditable: false,
        isSystem: true,
        sortOrder: 998,
        isActive: true,
        year: formYear,
        description: 'محاسبه خودکار اقساط وام فعال',
      } as any)
      console.log('✅ آیتم قسط وام به لیست اضافه شد')
    }

    // اضافه کردن آیتم پاداش
    if (!hasReward) {
      items.push({
        id: `reward_auto_${Date.now()}`,
        title: 'پاداش و تشویق',
        code: 'REWARD',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        formulaId: null,
        isInsurable: false,
        isTaxable: true,
        isEditable: false,
        isSystem: true,
        sortOrder: 50,
        isActive: true,
        year: formYear,
        description: 'محاسبه خودکار پاداش‌های ماه جاری',
      } as any)
      console.log('✅ آیتم پاداش به لیست اضافه شد')
    }

    // 🔥 اضافه کردن آیتم عیدی (فقط اسفند نمایش داده می‌شود)
    if (!hasEidi) {
      items.push({
        id: `eidi_auto_${Date.now()}`,
        title: 'عیدی پایان سال',
        code: 'EIDI',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        formulaId: null,
        isInsurable: false,
        isTaxable: true,
        isEditable: false,
        isSystem: true,
        sortOrder: 10,
        isActive: true,
        year: formYear,
        description: 'محاسبه خودکار عیدی (فقط اسفند)',
      } as any)
      console.log('✅ آیتم عیدی به لیست اضافه شد')
    }

    // 🔥 اضافه کردن آیتم سنوات
    if (!hasSanavat) {
      items.push({
        id: `sanavat_auto_${Date.now()}`,
        title: 'سنوات',
        code: 'SANAVAT',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        formulaId: null,
        isInsurable: false,
        isTaxable: true,
        isEditable: false,
        isSystem: true,
        sortOrder: 20,
        isActive: true,
        year: formYear,
        description: 'محاسبه خودکار سنوات ماهانه',
      } as any)
      console.log('✅ آیتم سنوات به لیست اضافه شد')
    }

    return items
      .filter(item => item.year === formYear && item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [payrollItems, formYear])

  const allowanceItems = relevantItems.filter(item => item.category === 'allowance')
  const deductionItems = relevantItems.filter(item => item.category === 'deduction')

  // ============================================
  // محاسبه مجموع اقساط وام‌های فعال
  // ============================================
  const totalLoanInstallments = useMemo(() => {
    if (!activeLoans || activeLoans.length === 0) return 0
    
    let total = 0
    for (const loan of activeLoans) {
      if (loan.installments && loan.installments > 0) {
        const monthlyInstallment = Math.round(loan.amount / loan.installments)
        total += monthlyInstallment
      } else {
        total += loan.amount || 0
      }
    }
    return Math.round(total)
  }, [activeLoans])

  // ============================================
  // جمع کل پاداش‌های ماه جاری
  // ============================================
  const totalRewards = useMemo(() => {
    if (!monthlyRewards || monthlyRewards.length === 0) return 0
    return monthlyRewards.reduce((sum, reward) => sum + (reward.amount || 0), 0)
  }, [monthlyRewards])

  // ============================================
  // محاسبات پایه
  // ============================================
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

  const workDaysPerMonth = settings?.workDaysPerMonth || 30
  const workHoursPerDay = settings?.workHoursPerDay || 8

  const hourlyRate = calculateHourlyRate(baseSalaryNum, workDaysPerMonth, workHoursPerDay)
  const dailyRate = calculateDailyRate(baseSalaryNum, workDaysPerMonth)

  // ============================================
  // محاسبه خودکار آیتم‌های فرمولی
  // ============================================
  const calculateFormulaItem = (item: any, tempCalculated?: Record<string, number>): number => {
    const code = item.code
    const calc = tempCalculated || {}

    // اضافه‌کاری
    if (code === 'OVERTIME' || code === 'OVERTIME_HOURS' || code === 'OVERTIME_ALLOWANCE') {
      const multiplier = settings?.overtimeMultiplier || 1.4
      return Math.round(hourlyRate * multiplier * overtimeHoursNum)
    }

    // شب‌کاری
    if (code === 'NIGHT_SHIFT' || code === 'NIGHT_SHIFT_HOURS' || code === 'NIGHT_ALLOWANCE') {
      const multiplier = settings?.nightShiftMultiplier || 1.15
      return Math.round(hourlyRate * multiplier * nightShiftHours)
    }

    // شب‌کاری مختلط
    if (code === 'MIXED_NIGHT' || code === 'MIXED_NIGHT_HOURS' || code === 'MIXED_NIGHT_ALLOWANCE') {
      const multiplier = settings?.mixedNightMultiplier || 1.35
      return Math.round(hourlyRate * multiplier * nightShiftHours)
    }

    // نوبت‌کاری صبح و عصر
    if (code === 'SHIFT_MORNING_EVENING' || code === 'SHIFT_ALLOWANCE_ME') {
      return Math.round(dailyRate * 0.1 * workDaysNum)
    }

    // نوبت‌کاری صبح، عصر و شب
    if (code === 'SHIFT_ALL_SHIFTS' || code === 'SHIFT_ALLOWANCE_ALL') {
      return Math.round(dailyRate * 0.15 * workDaysNum)
    }

    // نوبت‌کاری مختلط
    if (code === 'SHIFT_MIXED' || code === 'SHIFT_ALLOWANCE_MIXED') {
      return Math.round(dailyRate * 0.225 * workDaysNum)
    }

    // جمعه‌کاری
    if (code === 'FRIDAY_WORK' || code === 'FRIDAY_WORK_HOURS' || code === 'FRIDAY_ALLOWANCE') {
      const multiplier = settings?.fridayWorkMultiplier || 1.4
      return Math.round(hourlyRate * multiplier * fridayWorkHours)
    }

    // تعطیل‌کاری
    if (code === 'HOLIDAY_WORK' || code === 'HOLIDAY_WORK_HOURS' || code === 'HOLIDAY_ALLOWANCE') {
      const multiplier = settings?.holidayWorkMultiplier || 1.4
      return Math.round(hourlyRate * multiplier * holidayWorkHours)
    }

    // حق مأموریت
    if (code === 'MISSION' || code === 'MISSION_DAYS' || code === 'MISSION_ALLOWANCE') {
      return Math.round(dailyRate * missionDays)
    }

    // کسر مرخصی بدون حقوق
    if (code === 'UNPAID_LEAVE' || code === 'UNPAID_LEAVE_DAYS') {
      return Math.round(dailyRate * unpaidLeaveDays)
    }

    // کسر غیبت
    if (code === 'ABSENCE' || code === 'ABSENCE_DAYS') {
      return Math.round(dailyRate * absenceDays)
    }

    // کسر تأخیر
    if (code === 'DELAY' || code === 'DELAY_HOURS') {
      return Math.round(hourlyRate * delayHours)
    }

    // بیمه تامین اجتماعی
    if (code === 'INSURANCE_EMPLOYEE' || code === 'INSURANCE' || code === 'INSURANCE_SOCIAL') {
      const result = calculateInsurance(baseSalaryNum, allowanceItems, calc, settings, workDaysNum)
      return result
    }

    // مالیات بر درآمد
    if (code === 'TAX_INCOME' || code === 'TAX' || code === 'INCOME_TAX') {
      let tempTotalAllowances = 0
      for (const aItem of allowanceItems) {
        tempTotalAllowances += calc[aItem.id] || 0
      }
      const tempGrossSalary = baseSalaryNum + tempTotalAllowances
      const result = calculateTax(tempGrossSalary, settings, taxBrackets)
      return result
    }

    // قسط وام
    if (code === 'LOAN_INSTALLMENT' || code === 'LOAN') {
      return totalLoanInstallments
    }

    // پاداش
    if (code === 'REWARD' || code === 'BONUS') {
      return totalRewards
    }

    // ============================================
    // 🔥 عیدی (فقط اسفند)
    // ============================================
    if (code === 'EIDI' || code === 'YEAR_END_BONUS') {
      const result = calculateEidi(
        baseSalaryNum,
        settings,
        formYear,
        formMonth,
        employeeHireDate
      )
      console.log(`🎁 عیدی (${item.title}):`, result, 'تومان')
      return result
    }

    // ============================================
    // 🔥 سنوات
    // ============================================
    if (code === 'SANAVAT' || code === 'SENIORITY') {
      const result = calculateSanavat(
        baseSalaryNum,
        settings,
        employeeHireDate,
        formYear
      )
      console.log(`📅 سنوات (${item.title}):`, result, 'تومان')
      return result
    }

    return Number(itemAmounts[item.id] || 0)
  }

  // ============================================
  // محاسبه تمام آیتم‌ها
  // ============================================
  const calculatedAmounts = useMemo(() => {
    const calc: Record<string, number> = {}

    for (const item of relevantItems) {
      if (item.calculationType === 'fixed') {
        const benefitKey = getBenefitKeyFromCode(item.code)
        if (benefitKey && employeeBenefits[benefitKey] !== undefined) {
          calc[item.id] = employeeBenefits[benefitKey]
        } else {
          const userVal = Number(itemAmounts[item.id] || 0)
          calc[item.id] = item.isEditable ? userVal : RIALS_TO_TOMANS(item.value)
        }
      } else if (item.calculationType === 'percentage') {
        calc[item.id] = Math.round(baseSalaryNum * item.value / 100)
      } else if (item.calculationType === 'formula') {
        calc[item.id] = calculateFormulaItem(item, calc)
      } else {
        calc[item.id] = Number(itemAmounts[item.id] || 0)
      }
    }

    return calc
  }, [relevantItems, itemAmounts, baseSalaryNum, employeeBenefits, 
      overtimeHoursNum, nightShiftHours, fridayWorkHours, holidayWorkHours,
      missionDays, unpaidLeaveDays, absenceDays, delayHours,
      workDaysNum, hourlyRate, dailyRate, settings, taxBrackets, allowanceItems,
      totalLoanInstallments, totalRewards, formYear, formMonth, employeeHireDate])

  // ============================================
  // جمع‌ها
  // ============================================
  const totalAllowances = useMemo(() => {
    return allowanceItems.reduce((sum, item) => sum + (calculatedAmounts[item.id] || 0), 0)
  }, [allowanceItems, calculatedAmounts])

  const totalDeductions = useMemo(() => {
    return deductionItems.reduce((sum, item) => sum + (calculatedAmounts[item.id] || 0), 0)
  }, [deductionItems, calculatedAmounts])

  const grossSalary = baseSalaryNum + totalAllowances
  const netSalary = grossSalary - totalDeductions

  // ============================================
  // بارگذاری کارکرد ماهانه
  // ============================================
  useEffect(() => {
    if (!employeeId || !formYear || !formMonth) return
    if (isEdit) return

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

  // ============================================
  // ریست کردن فیلدها هنگام تغییر کاربر
  // ============================================
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
  }, [employeeId, isEdit])

  // ============================================
  // ذخیره کارکرد ویرایش شده
  // ============================================
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

      let res
      if (workRecordData) {
        res = await fetch(`/api/payroll/work-records/${workRecordData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/payroll/work-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const json = await res.json()
        setWorkRecordData(json.record)
        setWorkRecordStatus(json.record.status || 'draft')
        setWorkDays(String(json.record.workDays || 30))
        setOvertimeHours(String(json.record.overtimeHours || 0))
        setIsEditingWorkRecord(false)
        console.log('✅ کارکرد با موفقیت ذخیره شد')
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

  const handleCancelEdit = () => {
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
  }

  const handleStartEdit = () => {
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
  }

  // ============================================
  // هوک بارگذاری اطلاعات کارمند
  // ============================================
  const { hasBenefits, loading: loadingEmployee } = useEmployeeData({
    employeeId,
    isEdit,
    payrollItems,
    onBaseSalaryLoaded: (salary) => setBaseSalary(salary),
    onBenefitsLoaded: (benefits) => setEmployeeBenefits(benefits),
    onItemAmountsLoaded: (amounts) => setItemAmounts(amounts),
  })

  // ============================================
  // ارسال فرم
  // ============================================
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
      workDays: workDaysNum,
      overtimeHours: overtimeHoursNum,
      notes: notes || null,
      items,
      generateOrder,
      orderData,
    })
  }

  // ============================================
  // مقداردهی اولیه دیالوگ
  // ============================================
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
                    onClick={handleStartEdit}
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
                      {savingWorkRecord ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      ذخیره
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
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
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Receipt className="w-4 h-4" />
            )}
            {isEdit ? 'بروزرسانی' : 'صدور فیش'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}