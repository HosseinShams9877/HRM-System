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
  hireDate: string,
  baseSalary: number,
  workDaysInYearInput?: number  // ← مقدار دستی از کاربر
): number => {
  // ✅ فقط در اسفند
  if (month !== 12) return 0

  // ✅ اولویت ۱: مقدار دستی کاربر
  let workDaysInYear = workDaysInYearInput || 0

  // ✅ اولویت ۲: محاسبه از تاریخ استخدام
  if (workDaysInYear === 0 && hireDate) {
    const parts = hireDate.split('/')
    if (parts.length === 3) {
      const hireYear = parseInt(parts[0])
      // محاسبه روزهای کارکرد در سال (حداکثر ۳۶۵)
      // اگر در سال جاری استخدام شده، روزهای باقیمانده تا امروز
      const currentYear = year
      if (hireYear === currentYear) {
        // استخدام در سال جاری - از تاریخ استخدام تا الان
        const hireMonth = parseInt(parts[1])
        const hireDay = parseInt(parts[2])
        // ساده‌سازی: تقریباً (ماه فعلی - ماه استخدام) × ۳۰ + روز
        workDaysInYear = 365 - ((hireMonth - 1) * 30 + hireDay)
      } else {
        workDaysInYear = 365  // کل سال
      }
    }
  }

  // محدود کردن به حداقل و حداکثر
  if (workDaysInYear <= 0) workDaysInYear = 0
  if (workDaysInYear > 365) workDaysInYear = 365

  const eidiMinDays = settings?.eidiMinDays || 60
  const eidiMaxDays = settings?.eidiMaxDays || 90
  
  // تعداد روزهای عیدی بین حداقل و حداکثر
  const effectiveDays = Math.min(Math.max(workDaysInYear, eidiMinDays), eidiMaxDays)

  // عیدی = (حقوق پایه / ۳۰) × روزهای عیدی
  return Math.round((baseSalary / 30) * effectiveDays)
}

export const calculateSanavat = (
  baseSalary: number,
  settings: any,
  hireDate: string,
  year: number,
  month: number,
  yearsOfServiceInput?: number,   // سال سابقه کار (از کاربر)
  workDaysInYearInput?: number    // ✅ روزهای کارکرد در سال (از کاربر)
): number => {
  // ✅ فقط در اسفند
  if (month !== 12) return 0

  // ۱. محاسبه سال سابقه کار
  let yearsOfService = yearsOfServiceInput || 0

  // اگر کاربر مقدار وارد نکرده، از تاریخ استخدام محاسبه کن
  if (yearsOfService === 0 && hireDate) {
    const parts = hireDate.split('/')
    if (parts.length === 3) {
      const hireYear = parseInt(parts[0])
      yearsOfService = year - hireYear
    }
  }

  if (yearsOfService <= 0) return 0

  // ۲. محاسبه روزهای کارکرد در سال
  let workDaysInYear = workDaysInYearInput || 0

  // اگر کاربر مقدار وارد نکرده، ۳۶۵ روز در نظر بگیر (یک سال کامل)
  if (workDaysInYear === 0) {
    workDaysInYear = 365
  }

  // محدود کردن به حداکثر ۳۶۵ روز
  if (workDaysInYear > 365) workDaysInYear = 365
  if (workDaysInYear < 0) workDaysInYear = 0

  // ۳. محاسبه سنوات
  const sanavatRate = settings?.sanavatRate || 3
  const maxYears = settings?.sanavatMaxYears || 30
  const effectiveYears = Math.min(yearsOfService, maxYears)

  // ✅ فرمول کامل: (حقوق پایه × نرخ × سال سابقه × روزهای کارکرد) / (۱۲ × ۳۶۵)
  const sanavat = (baseSalary * sanavatRate * effectiveYears * workDaysInYear) / (100 * 12 * 365)

  console.log('📊 [calculateSanavat]', {
    baseSalary,
    sanavatRate,
    effectiveYears,
    workDaysInYear,
    result: Math.round(sanavat)
  })

  return Math.round(sanavat)
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