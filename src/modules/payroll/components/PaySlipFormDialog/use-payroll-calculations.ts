// src/modules/payroll/components/PaySlipFormDialog/use-payroll-calculations.ts

import { useMemo, useCallback } from 'react'
import {
  calculateHourlyRate,
  calculateDailyRate,
  calculateInsurance,
  calculateTax,
  calculateEidi,
  calculateSanavat,
  getBenefitKeyFromCode,
} from './payroll-calculations'
import { RIALS_TO_TOMANS } from '../../constants'

interface UsePayrollCalculationsProps {
  relevantItems: any[]
  itemAmounts: Record<string, string>
  baseSalaryNum: number
  employeeBenefits: Record<string, number>
  overtimeHoursNum: number
  nightShiftHours: number
  fridayWorkHours: number
  holidayWorkHours: number
  missionDays: number
  unpaidLeaveDays: number
  absenceDays: number
  delayHours: number
  workDaysNum: number
  settings: any
  taxBrackets: any[]
  allowanceItems: any[]
  totalLoanInstallments: number
  totalRewards: number
  formYear: number
  formMonth: number
  employeeHireDate: string
  // ✅ اضافه شد
  yearsOfService?: string
  workDaysInYear?: string
}

export function usePayrollCalculations({
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
  // ✅ اضافه شد
  yearsOfService = '',
  workDaysInYear = '',
}: UsePayrollCalculationsProps) {
  const workDaysPerMonth = settings?.workDaysPerMonth || 30
  const workHoursPerDay = settings?.workHoursPerDay || 8

  const hourlyRate = calculateHourlyRate(baseSalaryNum, workDaysPerMonth, workHoursPerDay)
  const dailyRate = calculateDailyRate(baseSalaryNum, workDaysPerMonth)

  const calculateFormulaItem = useCallback((item: any, tempCalculated?: Record<string, number>): number => {
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
      return calculateInsurance(baseSalaryNum, allowanceItems, calc, settings, workDaysNum)
    }

    // مالیات بر درآمد
    if (code === 'TAX_INCOME' || code === 'TAX' || code === 'INCOME_TAX') {
      let tempTotalAllowances = 0
      for (const aItem of allowanceItems) {
        tempTotalAllowances += calc[aItem.id] || 0
      }
      const tempGrossSalary = baseSalaryNum + tempTotalAllowances
      return calculateTax(tempGrossSalary, settings, taxBrackets)
    }

    // قسط وام
    if (code === 'LOAN_INSTALLMENT' || code === 'LOAN') {
      return totalLoanInstallments
    }

    // پاداش
    if (code === 'PERFORMANCE_BONUS') {
      return totalRewards
    }

    // ✅ عیدی
    if (code === 'EIDI' || code === 'YEAR_END_BONUS') {
      const workDaysInYearNum = Number(workDaysInYear) || 0
      return calculateEidi(settings, formYear, formMonth, employeeHireDate, baseSalaryNum, workDaysInYearNum)
    }

    // ✅ سنوات
    if (code === 'SANAVAT' || code === 'SENIORITY') {
      const yearsOfServiceNum = Number(yearsOfService) || 0
      const workDaysInYearNum = Number(workDaysInYear) || 0
      return calculateSanavat(
        baseSalaryNum,
        settings,
        employeeHireDate,
        formYear,
        formMonth,
        yearsOfServiceNum,
        workDaysInYearNum  // ✅ پاس دادن روزهای کارکرد
      )
    }
    return Number(itemAmounts[item.id] || 0)
  }, [
    settings,
    hourlyRate,
    dailyRate,
    overtimeHoursNum,
    nightShiftHours,
    fridayWorkHours,
    holidayWorkHours,
    missionDays,
    unpaidLeaveDays,
    absenceDays,
    delayHours,
    workDaysNum,
    baseSalaryNum,
    allowanceItems,
    taxBrackets,
    totalLoanInstallments,
    totalRewards,
    formYear,
    formMonth,
    employeeHireDate,
    itemAmounts,
    // ✅ اضافه کن
    yearsOfService,
    workDaysInYear,
  ])

  const calculateSingleItem = useCallback((item: any, calc: Record<string, number>): number => {
    if (item.calculationType === 'fixed') {
      const benefitKey = getBenefitKeyFromCode(item.code)
      if (benefitKey && employeeBenefits[benefitKey] !== undefined) {
        return employeeBenefits[benefitKey]
      }
      const userVal = Number(itemAmounts[item.id] || 0)
      return item.isEditable ? userVal : RIALS_TO_TOMANS(item.value)
    } else if (item.calculationType === 'percentage') {
      return Math.round(baseSalaryNum * item.value / 100)
    } else if (item.calculationType === 'formula') {
      return calculateFormulaItem(item, calc)
    } else if (item.calculationType === 'employee_field') {
      const fieldName = item.employeeField || item.code
      const benefitKey = getBenefitKeyFromCode(item.code) || fieldName
      return employeeBenefits[benefitKey] || 0
    }
    return Number(itemAmounts[item.id] || 0)
  }, [employeeBenefits, itemAmounts, baseSalaryNum, calculateFormulaItem])

  const calculatedAmounts = useMemo(() => {
    const calc: Record<string, number> = {}

    for (const item of relevantItems) {
      if (item.category !== 'allowance') continue
      calc[item.id] = calculateSingleItem(item, calc)
    }

    for (const item of relevantItems) {
      if (item.category === 'allowance') continue
      calc[item.id] = calculateSingleItem(item, calc)
    }

    return calc
  }, [relevantItems, calculateSingleItem])

  const totalAllowances = useMemo(() => {
    return relevantItems
      .filter(item => item.category === 'allowance')
      .reduce((sum, item) => sum + (calculatedAmounts[item.id] || 0), 0)
  }, [relevantItems, calculatedAmounts])

  const totalDeductions = useMemo(() => {
    return relevantItems
      .filter(item => item.category === 'deduction')
      .reduce((sum, item) => sum + (calculatedAmounts[item.id] || 0), 0)
  }, [relevantItems, calculatedAmounts])

  return {
    calculatedAmounts,
    totalAllowances,
    totalDeductions,
    grossSalary: baseSalaryNum + totalAllowances,
    netSalary: baseSalaryNum + totalAllowances - totalDeductions,
    hourlyRate,
    dailyRate,
  }
}