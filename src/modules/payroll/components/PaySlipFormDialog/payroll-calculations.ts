// src/modules/payroll/components/PaySlipFormDialog/payroll-calculations.ts

export const calculateHourlyRate = (
    monthlySalary: number,
    workDaysPerMonth: number = 30,
    workHoursPerDay: number = 8
  ): number => {
    return monthlySalary / (workDaysPerMonth * workHoursPerDay)
  }
  
  export const calculateDailyRate = (
    monthlySalary: number,
    workDaysPerMonth: number = 30
  ): number => {
    return monthlySalary / workDaysPerMonth
  }
  
  export const calculateInsurance = (
    baseSalary: number,
    allowanceItems: any[],
    calculatedAmounts: Record<string, number>,
    settings: any,
    workDays: number
  ): number => {
    if (!settings) return 0
  
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
    const totalRate = (settings.insuranceRate || 7) + (settings.unemploymentInsRate || 1)
  
    return Math.round(cappedInsurable * totalRate / 100)
  }
  
  export const calculateTax = (
    grossSalary: number,
    settings: any,
    taxBrackets: any[]
  ): number => {
    if (!settings || !taxBrackets || taxBrackets.length === 0) return 0
  
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
  
    return Math.round(annualTax / 12)
  }
  
  export const calculateEidi = (
    settings: any,
    year: number,
    month: number,
    hireDate: string
  ): number => {
    if (month !== 12 || !settings) return 0
  
    const minDailyWage = settings.minDailyWage / 10
    let daysWorked = 365
  
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
          daysWorked = 365 - ((hireMonth - 1) * 30 + hireDay)
          if (daysWorked < 0) daysWorked = 0
        }
      }
    }
  
    let eidi = (minDailyWage * daysWorked) / 12
    const minEidi = minDailyWage * 60
    const maxEidi = minDailyWage * 90
    eidi = Math.max(minEidi, Math.min(eidi, maxEidi))
  
    return Math.round(eidi)
  }
  
  export const calculateSanavat = (
    baseSalary: number,
    settings: any,
    hireDate: string,
    year: number
  ): number => {
    if (!settings || !hireDate) return 0
  
    const parts = hireDate.split('/')
    if (parts.length !== 3) return 0
  
    const hireYear = parseInt(parts[0])
    const yearsOfService = year - hireYear
    if (yearsOfService <= 0) return 0
  
    const sanavatRate = settings.sanavatRate || 2.5
    const maxYears = settings.sanavatMaxYears || 30
    const effectiveYears = Math.min(yearsOfService, maxYears)
  
    return Math.round((baseSalary * sanavatRate * effectiveYears) / 100 / 12)
  }
  
  export const getBenefitKeyFromCode = (code: string): string | null => {
    const mapping: Record<string, string> = {
      // مسکن
      'HOUSING': 'housingAllowance',
      'HOUSING_ALLOWANCE': 'housingAllowance',
      // بن کارگری
      'FOOD': 'workAllowance',
      'FOOD_ALLOWANCE': 'workAllowance',
      'WORK_ALLOWANCE': 'workAllowance',
      'BEN': 'workAllowance',
      'BENEFIT': 'workAllowance',
      // حق تاهل
      'SPOUSE': 'spouseAllowance',
      'SPOUSE_ALLOWANCE': 'spouseAllowance',
      'MARRIAGE': 'spouseAllowance',
      // حق اولاد
      'CHILD': 'childAllowance',
      'CHILD_ALLOWANCE': 'childAllowance',
      'CHILDREN': 'childAllowance',
      // حق مسئولیت
      'RESPONSIBILITY': 'responsibilityAllowance',
      'RESPONSIBILITY_ALLOWANCE': 'responsibilityAllowance',
      'MANAGEMENT': 'responsibilityAllowance',
      // سایر مزایا
      'OTHER': 'otherAllowances',
      'OTHER_ALLOWANCES': 'otherAllowances',
      'EXTRA': 'otherAllowances',
      // پایه سنوات
      'SENIORITY': 'yearsOfServiceBase',
      'YEARS_OF_SERVICE': 'yearsOfServiceBase',
      'SERVICE_BASE': 'yearsOfServiceBase',
      'SENIORITY_BASE': 'yearsOfServiceBase',
    }
    return mapping[code] || null
  }
  
  export const getOrderTitle = (type: string): string => {
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