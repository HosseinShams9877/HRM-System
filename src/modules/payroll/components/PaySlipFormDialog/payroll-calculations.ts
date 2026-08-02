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
  workDaysInYearInput?: number
): number => {
  // ✅ فقط در اسفند
  if (month !== 12) return 0

  // ✅ حداقل دستمزد روزانه از تنظیمات (ریال)
  const minDailyWage = settings?.minDailyWage || 5541850

  // ✅ دریافت روزهای کارکرد در سال از ورودی کاربر
  let workDaysInYear = workDaysInYearInput || 0

  // اگر کاربر مقدار وارد نکرده، از تاریخ استخدام محاسبه کن
  if (workDaysInYear === 0 && hireDate) {
    const parts = hireDate.split('/')
    if (parts.length === 3) {
      const hireYear = parseInt(parts[0])
      if (hireYear === year) {
        const hireMonth = parseInt(parts[1])
        const hireDay = parseInt(parts[2])
        workDaysInYear = 365 - ((hireMonth - 1) * 30 + hireDay)
      } else {
        workDaysInYear = 365
      }
    }
  }

  // محدود کردن به بازه ۰ تا ۳۶۵
  if (workDaysInYear < 0) workDaysInYear = 0
  if (workDaysInYear > 365) workDaysInYear = 365

  // ✅ محاسبه تعداد روزهای عیدی (متناسب با روزهای کارکرد)
  // برای هر روز کارکرد، (۹۰/۳۶۵) روز عیدی تعلق می‌گیرد
  let eidiDays = (workDaysInYear / 365) * 90

  // ❌ حذف حداقل ۶۰ روز!
  // فقط سقف ۹۰ روز رو اعمال کن
  if (eidiDays > 90) eidiDays = 90

  // ✅ محاسبه عیدی نهایی به ریال
  // عیدی = حداقل دستمزد روزانه × تعداد روزهای عیدی
  const eidiAmount = minDailyWage * eidiDays

  console.log('📊 [calculateEidi]', {
    minDailyWage,
    workDaysInYear,
    eidiDays: Math.round(eidiDays * 10) / 10,
    eidiAmount: Math.round(eidiAmount),
    maxEidi: Math.round(minDailyWage * 90)
  })

  return Math.round(eidiAmount/10)
}

export const calculateSanavat = (
  baseSalary: number,        // حقوق پایه کارمند (ریال)
  settings: any,
  hireDate: string,
  year: number,
  month: number,
  yearsOfServiceInput?: number,   // سال سابقه کار (از کاربر)
  workDaysInYearInput?: number    // روزهای کارکرد در سال جاری (از کاربر)
): number => {
  // ✅ فقط در اسفند
  if (month !== 12) return 0

  // ۱. محاسبه سال‌های کامل سابقه کار
  let fullYears = yearsOfServiceInput || 0

  if (fullYears === 0 && hireDate) {
    const parts = hireDate.split('/')
    if (parts.length === 3) {
      const hireYear = parseInt(parts[0])
      fullYears = year - hireYear
    }
  }

  if (fullYears < 0) fullYears = 0

  // ۲. محاسبه روزهای کارکرد در سال جاری
  let workDaysInYear = workDaysInYearInput || 0

  if (workDaysInYear === 0 && hireDate) {
    const parts = hireDate.split('/')
    if (parts.length === 3) {
      const hireYear = parseInt(parts[0])
      if (hireYear === year) {
        const hireMonth = parseInt(parts[1])
        const hireDay = parseInt(parts[2])
        workDaysInYear = 365 - ((hireMonth - 1) * 30 + hireDay)
      } else {
        workDaysInYear = 365
      }
    }
  }

  // محدود کردن به ۳۶۵ روز
  if (workDaysInYear < 0) workDaysInYear = 0
  if (workDaysInYear > 365) workDaysInYear = 365

  // ۳. محاسبه کل سابقه به سال (سال کامل + کسر روز)
  const totalYears = fullYears + (workDaysInYear / 365)

  // ۴. اعمال حداکثر سال سابقه
  const maxYears = settings?.sanavatMaxYears || 30
  const effectiveYears = Math.min(totalYears, maxYears)

  // ۵. نرخ سنوات (درصد)
  const sanavatRate = settings?.sanavatRate || 3  // ۳٪

  // ۶. محاسبه سنوات ماهانه
  // (حقوق پایه × نرخ سنوات × سال سابقه) / ۱۲
  const sanavat = (baseSalary * sanavatRate * effectiveYears) / (100 * 12)

  console.log('📊 [calculateSanavat]', {
    baseSalary,
    fullYears,
    workDaysInYear,
    totalYears: Math.round(totalYears * 100) / 100,
    effectiveYears: Math.round(effectiveYears * 100) / 100,
    sanavatRate,
    sanavat: Math.round(sanavat)
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