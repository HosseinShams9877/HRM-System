import {
  Receipt, CheckCircle2, BadgeDollarSign, Lock,
} from 'lucide-react'

// ─── تایپ‌ها ───

export interface FormulaVariable {
  varName: string
  sourceType: string
  sourceId: string | null
  label: string
}

export interface FormulaContext {
  baseSalary: number
  workDays: number
  workDaysPerMonth: number
  workHoursPerDay: number
  overtimeHours: number
  hourlyRate: number
  dailyRate: number
  month: number
  year: number
  // مقادیر محاسبه‌شده آیتم‌ها
  itemAmounts: Record<string, number> // code → amount (RIALS)
  // مقادیر تجمیعی
  totalAllowances: number
  totalDeductions: number
  insurableAmount: number
  grossSalary: number
  // تنظیمات
  settings: Record<string, number>
  // اطلاعات کارمند
  employee: Record<string, any>
  // پله‌های مالیاتی
  taxBrackets: { minAmount: number; maxAmount: number; rate: number }[]
}


export interface FormulaDefinition {
  id: string
  code: string
  name: string
  expression: string
  year: number
  variables: FormulaVariable[]
}

// ─── محاسبه فرمول با بافت کامل ───

export async function computeFormula(
  formula: FormulaDefinition,
  context: FormulaContext
): Promise<number> {
  // ساخت دیکشنری متغیرها
  const vars: Record<string, number> = {}

  for (const v of formula.variables) {
    switch (v.sourceType) {
      case 'setting': {
        // خواندن از تنظیمات حقوقی
        vars[v.varName] = context.settings[v.varName] ?? 0
        break
      }
      case 'item': {
        // مبلغ آیتم حقوقی دیگر (با کد)
        vars[v.varName] = context.itemAmounts[v.sourceId || ''] ?? 0
        break
      }
      case 'employee_field': {
        // فیلد کارمند
        const val = context.employee[v.varName]
        vars[v.varName] = typeof val === 'number' ? val : (typeof val === 'string' ? parseFloat(val) || 0 : 0)
        break
      }
      case 'constant': {
        // مقدار ثابت از sourceId (عدد)
        vars[v.varName] = parseFloat(v.sourceId || '0') || 0
        break
      }
      case 'computed': {
        // مقادیر محاسبه‌شده
        const computedMap: Record<string, number> = {
          baseSalary: context.baseSalary,
          hourlyRate: context.hourlyRate,
          dailyRate: context.dailyRate,
          workDays: context.workDays,
          workDaysPerMonth: context.workDaysPerMonth,
          workHoursPerDay: context.workHoursPerDay,
          overtimeHours: context.overtimeHours,
          month: context.month,
          totalAllowances: context.totalAllowances,
          totalDeductions: context.totalDeductions,
          insurableAmount: context.insurableAmount,
          grossSalary: context.grossSalary,
          taxableIncome: context.settings.taxableIncome || 0,
          taxExemptRials: context.settings.taxExemptRials || 0,
        }
        vars[v.varName] = computedMap[v.varName] ?? 0
        break
      }
      case 'tax': {
        // محاسبه مالیات تصاعدی
        const taxableIncome = vars[v.varName.replace('_tax', '')] || context.grossSalary
        vars[v.varName] = calculateProgressiveTax(taxableIncome, context.taxBrackets)
        break
      }
    }
  }


  // بررسی وجود TAX_PROGRESSIVE در عبارت
  if (formula.expression.includes('TAX_PROGRESSIVE')) {
    // استخراج درآمد مشمول مالیات
    const taxMatch = formula.expression.match(/TAX_PROGRESSIVE\(\{([^}]+)\}\)/)
    if (taxMatch) {
      const taxableVar = taxMatch[1]
      const monthlyTaxableIncome = vars[taxableVar] ?? 0
      // پله‌های مالیاتی سالانه هستند → درآمد ماهانه × ۱۲ = درآمد سالانه
      const annualTaxableIncome = monthlyTaxableIncome * 12
      const annualTaxAmount = calculateProgressiveTax(annualTaxableIncome, context.taxBrackets)
      // مالیات ماهانه = مالیات سالانه / ۱۲
      const monthlyTaxAmount = Math.round(annualTaxAmount / 12)
      // جایگزینی کل عبارت TAX_PROGRESSIVE با مبلغ مالیات
      const taxExpr = `TAX_PROGRESSIVE({${taxableVar}})`
      const newExpr = formula.expression.replace(taxExpr, String(monthlyTaxAmount))
      return evaluateExpression(newExpr, vars)
    }
  }

  return evaluateExpression(formula.expression, vars)
}

export function evaluateExpression(expression: string, variables: Record<string, number>): number {
  // جایگزینی متغیرها با مقادیر عددی
  let expr = expression

  // جایگزینی متغیرهای {varName}
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    expr = expr.replace(regex, String(value))
  }

  // جایگزینی توابع ویژه
  expr = replaceFunctions(expr, variables)

  // بررسی امنیت عبارت — فقط اعداد، عملگرها، پرانتز، نقطه، فاصله و توابع Math مجاز است
  const sanitized = expr.replace(/\s/g, '')
  // حذف تمام فراخوانی‌های Math.xxx مجاز (شامل فراخوانی‌های تودرتو)
  let cleaned = sanitized
  let prev = ''
  while (prev !== cleaned) {
    prev = cleaned
    cleaned = cleaned.replace(/Math\.(min|max|ceil|round|abs|sqrt)\([^()]*\)/g, '0')
  }
  // حذف عملگر سه‌تایی (condition ? val1 : val2)
  cleaned = cleaned.replace(/\([^()]*\)?\?[^?:]*:[^?:]*/g, '0')
  // باقی‌مانده باید فقط شامل اعداد و عملگرها باشد
  if (!/^[\d+\-*/().%,]+$/.test(cleaned)) {
    console.warn(`عبارت ناامن شناسایی شد: ${expr}`)
    return 0
  }

  try {
    // ارزیابی با Function سازنده (ایمن‌تر از eval)
    const result = new Function(`"use strict"; return (${expr})`)()
    if (typeof result !== 'number' || !isFinite(result)) {
      return 0
    }
    return Math.round(result)
  } catch (error) {
    console.warn(`خطا در ارزیابی عبارت "${expression}":`, error)
    return 0
  }
}


// جایگزینی توابع ویژه
function replaceFunctions(expr: string, variables: Record<string, number>): string {
  // MIN(a, b) → Math.min(a, b)
  expr = expr.replace(/MIN\(([^,]+),\s*([^)]+)\)/g, 'Math.min($1,$2)')
  // MAX(a, b) → Math.max(a, b)
  expr = expr.replace(/MAX\(([^,]+),\s*([^)]+)\)/g, 'Math.max($1,$2)')
  // ROUND(x) → Math.round(x)
  expr = expr.replace(/ROUND\(([^)]+)\)/g, 'Math.round($1)')
  // CEIL(x) → Math.ceil(x)
  expr = expr.replace(/CEIL\(([^)]+)\)/g, 'Math.ceil($1)')
  // ABS(x) → Math.abs(x)
  expr = expr.replace(/ABS\(([^)]+)\)/g, 'Math.abs($1)')

  // IF(condition, trueVal, falseVal) → (condition ? trueVal : falseVal)
  // باید با دقت پرانتزها رو بشماره تا آرگومان‌هایی که کامای داخلی دارن هندل بشن
  expr = replaceIfFunction(expr)

  return expr
}


// جایگزینی IF با پارسر پرانتزی هوشمند
function replaceIfFunction(expr: string): string {
  let result = expr
  let safety = 0
  while (result.includes('IF(') && safety < 20) {
    safety++
    const ifIdx = result.indexOf('IF(')
    if (ifIdx === -1) break

    // پیدا کردن سه آرگومان با شمارش پرانتز
    let depth = 0
    let args: string[] = []
    let currentArg = ''
    let started = false

    for (let i = ifIdx + 3; i < result.length; i++) {
      const ch = result[i]
      if (ch === '(') {
        depth++
        currentArg += ch
      } else if (ch === ')') {
        if (depth === 0) {
          // پایان IF
          args.push(currentArg.trim())
          // ساخت عبارت سه‌تایی
          const replacement = `((${args[0]})?(${args[1]}):(${args[2] || '0'}))`
          result = result.substring(0, ifIdx) + replacement + result.substring(i + 1)
          break
        }
        depth--
        currentArg += ch
      } else if (ch === ',' && depth === 0) {
        args.push(currentArg.trim())
        currentArg = ''
      } else {
        currentArg += ch
      }
    }
  }
  return result
}

// ─── ساخت بافت محاسبه برای یک کارمند ───

export async function buildFormulaContext(params: {
  employee: any
  year: number
  month: number
  baseSalary: number
  workDays: number
  overtimeHours: number
  setting: any
  taxBrackets: any[]
  preCalculatedItems: { code: string; amount: number; isInsurable: boolean; category: string }[]
  /** داده‌های حضور و غیاب محاسبه‌شده در generate */
  attendanceData?: {
    nightShiftHours: number
    fridayWorkHours: number
    holidayWorkHours: number
    missionDays: number
    unpaidLeaveDays: number
    totalLoanInstallment: number
    performanceScore: number
    yearsOfService: number
    childAmount?: number
  }
}): Promise<FormulaContext> {
  const {
    employee, year, month, baseSalary, workDays, overtimeHours,
    setting, taxBrackets, preCalculatedItems, attendanceData
  } = params

  const workHoursPerDay = setting.workHoursPerDay || 8
  const workDaysPerMonth = setting.workDaysPerMonth || 30
  const hourlyRate = baseSalary / (workDaysPerMonth * workHoursPerDay)
  const dailyRate = baseSalary / workDaysPerMonth

  // ساخت دیکشنری مبالغ آیتم‌ها
  const itemAmounts: Record<string, number> = {}
  let totalAllowances = 0
  let totalDeductions = 0
  let insurableAmount = 0

  for (const item of preCalculatedItems) {
    itemAmounts[item.code] = item.amount
    if (item.category === 'allowance') {
      totalAllowances += item.amount
      if (item.isInsurable) insurableAmount += item.amount
    } else {
      totalDeductions += item.amount
    }
  }

  insurableAmount += baseSalary
  const insuranceCeiling = setting.minDailyWage * workDaysPerMonth * setting.insuranceCeilingMultiplier
  const cappedInsurable = Math.min(insurableAmount, insuranceCeiling)

  const grossSalary = baseSalary + totalAllowances
  // taxableIncome برای محاسبه مالیات (ناخالص منهای معافیت مالیاتی)
  const taxExemptRials = (setting.taxExemptAmount || 0) * 10 // تومان → ریال
  const taxableIncome = Math.max(0, grossSalary - taxExemptRials)

  // ساخت دیکشنری تنظیمات
  const settings: Record<string, number> = {
    insuranceRate: setting.insuranceRate,
    employerInsRate: setting.employerInsRate,
    unemploymentInsRate: setting.unemploymentInsRate,
    insuranceCeilingMultiplier: setting.insuranceCeilingMultiplier,
    minDailyWage: setting.minDailyWage,
    minMonthlyWage: setting.minMonthlyWage,
    baseSalaryDefault: setting.baseSalaryDefault,
    workHoursPerDay: setting.workHoursPerDay,
    workDaysPerMonth: setting.workDaysPerMonth,
    overtimeMultiplier: setting.overtimeMultiplier,
    nightShiftMultiplier: setting.nightShiftMultiplier,
    mixedNightMultiplier: setting.mixedNightMultiplier,
    fridayWorkMultiplier: setting.fridayWorkMultiplier,
    holidayWorkMultiplier: setting.holidayWorkMultiplier,
    eidiMinDays: setting.eidiMinDays,
    eidiMaxDays: setting.eidiMaxDays,
    sanavatRate: setting.sanavatRate,
    sanavatMaxYears: setting.sanavatMaxYears,
    taxExemptAmount: setting.taxExemptAmount,
    insuranceCeiling,
    cappedInsurable,
    totalEmpInsRate: setting.insuranceRate + (setting.unemploymentInsRate || 0),
    taxExemptRials,
    taxableIncome,
  }

  // اطلاعات کارمند — اولویت با attendanceData (محاسبه‌شده در generate) سپس فیلدهای مستقیم کارمند
  const employeeData: Record<string, any> = {
    childrenCount: employee.childrenCount || 0,
    maritalStatus: employee.maritalStatus === 'married' ? 1 : 0,
    yearsOfService: attendanceData?.yearsOfService ?? (employee.hireDate
      ? Math.max(0, year - parseInt(employee.hireDate.split('/')[0]))
      : 0),
    performanceScore: attendanceData?.performanceScore ?? employee.performances?.[0]?.score ?? 0,
    totalLoanInstallment: attendanceData?.totalLoanInstallment ?? 0,
    nightShiftHours: attendanceData?.nightShiftHours ?? 0,
    fridayWorkHours: attendanceData?.fridayWorkHours ?? 0,
    holidayWorkHours: attendanceData?.holidayWorkHours ?? 0,
    missionDays: attendanceData?.missionDays ?? 0,
    unpaidLeaveDays: attendanceData?.unpaidLeaveDays ?? 0,
    childAmount: attendanceData?.childAmount ?? 0,
  }

  // محاسبه وام (اگر attendanceData ارائه نشده، از اطلاعات کارمند محاسبه کن)
  if (!attendanceData && employee.loanRequests) {
    const activeLoans = employee.loanRequests.filter(
      (l: any) => l.status === 'approved'
    )
    for (const loan of activeLoans) {
      if (loan.installments && loan.installments > 0) {
        employeeData.totalLoanInstallment += Math.round(loan.amount / loan.installments)
      }
    }
  }

  return {
    baseSalary,
    workDays,
    workDaysPerMonth,
    workHoursPerDay,
    overtimeHours,
    hourlyRate,
    dailyRate,
    month,
    year,
    itemAmounts,
    totalAllowances,
    totalDeductions,
    insurableAmount: cappedInsurable,
    grossSalary,
    settings,
    employee: employeeData,
    taxBrackets: taxBrackets.map((b: any) => ({
      minAmount: b.minAmount,
      maxAmount: b.maxAmount,
      rate: b.rate,
    })),
  }
}


// ============================================
// Constants — Payroll Module
// ============================================

export const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType; bgClass: string }> = {
  draft: {
    label: 'پیش‌نویس',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    icon: Receipt,
    bgClass: 'bg-amber-50 dark:bg-amber-950/20',
  },
  confirmed: {
    label: 'تأیید شده',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    icon: CheckCircle2,
    bgClass: 'bg-blue-50 dark:bg-blue-950/20',
  },
  paid: {
    label: 'پرداخت شده',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: BadgeDollarSign,
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  closed: {
    label: 'بسته شده',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400',
    icon: Lock,
    bgClass: 'bg-gray-50 dark:bg-gray-900/20',
  },
}

export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
]

export const RIALS_TO_TOMANS = (rials: number): number => Math.round(rials / 10)

export const FORMULA_DESCRIPTIONS: Record<string, string> = {
  family_per_child: 'محاسبه خودکار بر اساس تعداد فرزندان',
  overtime_hours: 'محاسبه خودکار بر اساس ساعات اضافه‌کاری',
  night_shift_hours: 'محاسبه خودکار بر اساس ساعات شب‌کاری',
  mixed_night_hours: 'محاسبه خودکار بر اساس ساعات شب‌کاری مختلط',
  friday_work_hours: 'محاسبه خودکار بر اساس ساعات جمعه‌کاری',
  holiday_hours: 'محاسبه خودکار بر اساس ساعات تعطیل‌کاری',
  mission_days: 'محاسبه خودکار بر اساس روزهای ماموریت تأییدشده',
  sanavat: 'محاسبه خودکار بر اساس سال سابقه کار',
  eidi: 'محاسبه خودکار عیدی (فقط ماه اسفند)',
  performance_bonus: 'محاسبه خودکار بر اساس نمره ارزیابی عملکرد',
  insurance_employee: 'محاسبه خودکار بر اساس نرخ بیمه (سهم کارمند + بیکاری)',
  tax_progressive: 'محاسبه خودکار مالیات تصاعدی',
  unpaid_leave_days: 'کسر خودکار روزهای بدون حقوق',
  loan_installment: 'کسر خودکار اقساط وام فعال',
}


// ─── فرمول‌های پیش‌فرض سیستمی ───

export const SYSTEM_FORMULAS = [
  {
    code: 'insurance_employee',
    name: 'بیمه سهم کارمند',
    description: 'محاسبه خودکار بر اساس نرخ بیمه (سهم کارمند + بیکاری)',
    expression: '{cappedInsurable} * {totalEmpInsRate} / 100',
    variables: [
      { varName: 'cappedInsurable', sourceType: 'setting', sourceId: null, label: 'مبلغ مشمول بیمه (با سقف)' },
      { varName: 'totalEmpInsRate', sourceType: 'setting', sourceId: null, label: 'نرخ کل بیمه سهم کارمند' },
    ],
  },
  {
    code: 'tax_progressive',
    name: 'مالیات تصاعدی',
    description: 'محاسبه خودکار مالیات تصاعدی بر اساس پله‌های قانونی',
    expression: 'TAX_PROGRESSIVE({taxableIncome})',
    variables: [
      { varName: 'taxableIncome', sourceType: 'computed', sourceId: null, label: 'درآمد مشمول مالیات' },
    ],
  },
  {
    code: 'family_per_child',
    name: 'حق اولاد',
    description: 'محاسبه خودکار بر اساس تعداد فرزندان (فقط متأهل). مبلغ هر فرزند از value آیتم حقوقی خوانده می‌شود.',
    expression: '{maritalStatus} * {childrenCount} * {childAmount}',
    variables: [
      { varName: 'maritalStatus', sourceType: 'employee_field', sourceId: null, label: 'وضعیت تأهل (1=متأهل)' },
      { varName: 'childrenCount', sourceType: 'employee_field', sourceId: null, label: 'تعداد فرزندان' },
      { varName: 'childAmount', sourceType: 'employee_field', sourceId: null, label: 'مبلغ هر فرزند (از value آیتم حقوقی)' },
    ],
  },
  {
    code: 'overtime_hours',
    name: 'اضافه‌کاری',
    description: 'محاسبه خودکار بر اساس ساعات اضافه‌کاری',
    expression: '{hourlyRate} * {overtimeMultiplier} * {overtimeHours}',
    variables: [
      { varName: 'hourlyRate', sourceType: 'computed', sourceId: null, label: 'نرخ ساعتی' },
      { varName: 'overtimeMultiplier', sourceType: 'setting', sourceId: null, label: 'ضریب اضافه‌کاری' },
      { varName: 'overtimeHours', sourceType: 'computed', sourceId: null, label: 'ساعات اضافه‌کاری' },
    ],
  },
  {
    code: 'night_shift_hours',
    name: 'شب‌کاری',
    description: 'محاسبه خودکار بر اساس ساعات شب‌کاری',
    expression: '{hourlyRate} * {nightShiftMultiplier} * {nightShiftHours}',
    variables: [
      { varName: 'hourlyRate', sourceType: 'computed', sourceId: null, label: 'نرخ ساعتی' },
      { varName: 'nightShiftMultiplier', sourceType: 'setting', sourceId: null, label: 'ضریب شب‌کاری' },
      { varName: 'nightShiftHours', sourceType: 'employee_field', sourceId: null, label: 'ساعات شب‌کاری' },
    ],
  },
  {
    code: 'friday_work_hours',
    name: 'جمعه‌کاری',
    description: 'محاسبه خودکار بر اساس ساعات جمعه‌کاری',
    expression: '{hourlyRate} * {fridayWorkMultiplier} * {fridayWorkHours}',
    variables: [
      { varName: 'hourlyRate', sourceType: 'computed', sourceId: null, label: 'نرخ ساعتی' },
      { varName: 'fridayWorkMultiplier', sourceType: 'setting', sourceId: null, label: 'ضریب جمعه‌کاری' },
      { varName: 'fridayWorkHours', sourceType: 'employee_field', sourceId: null, label: 'ساعات جمعه‌کاری' },
    ],
  },
  {
    code: 'mixed_night_hours',
    name: 'شب‌کاری مختلط',
    description: 'محاسبه خودکار بر اساس ساعات شب‌کاری مختلط',
    expression: '{hourlyRate} * {mixedNightMultiplier} * {nightShiftHours}',
    variables: [
      { varName: 'hourlyRate', sourceType: 'computed', sourceId: null, label: 'نرخ ساعتی' },
      { varName: 'mixedNightMultiplier', sourceType: 'setting', sourceId: null, label: 'ضریب شب‌کاری مختلط' },
      { varName: 'nightShiftHours', sourceType: 'employee_field', sourceId: null, label: 'ساعات شب‌کاری' },
    ],
  },
  {
    code: 'holiday_hours',
    name: 'تعطیل‌کاری',
    description: 'محاسبه خودکار بر اساس ساعات کار در تعطیلات رسمی',
    expression: '{hourlyRate} * {holidayWorkMultiplier} * {holidayWorkHours}',
    variables: [
      { varName: 'hourlyRate', sourceType: 'computed', sourceId: null, label: 'نرخ ساعتی' },
      { varName: 'holidayWorkMultiplier', sourceType: 'setting', sourceId: null, label: 'ضریب تعطیل‌کاری' },
      { varName: 'holidayWorkHours', sourceType: 'employee_field', sourceId: null, label: 'ساعات تعطیل‌کاری' },
    ],
  },
  {
    code: 'shift_allowance_morning_evening',
    name: 'نوبت‌کاری صبح و عصر',
    description: 'محاسبه خودکار نوبت‌کاری صبح و عصر (۱۰٪)',
    expression: '{dailyRate} * 0.1 * {workDays}',
    variables: [
      { varName: 'dailyRate', sourceType: 'computed', sourceId: null, label: 'نرخ روزانه' },
      { varName: 'workDays', sourceType: 'computed', sourceId: null, label: 'روزهای کارکرد' },
    ],
  },
  {
    code: 'shift_allowance_all_shifts',
    name: 'نوبت‌کاری صبح، عصر و شب',
    description: 'محاسبه خودکار نوبت‌کاری صبح، عصر و شب (۱۵٪)',
    expression: '{dailyRate} * 0.15 * {workDays}',
    variables: [
      { varName: 'dailyRate', sourceType: 'computed', sourceId: null, label: 'نرخ روزانه' },
      { varName: 'workDays', sourceType: 'computed', sourceId: null, label: 'روزهای کارکرد' },
    ],
  },
  {
    code: 'shift_allowance_mixed',
    name: 'نوبت‌کاری مختلط',
    description: 'محاسبه خودکار نوبت‌کاری صبح و شب یا عصر و شب (۲۲.۵٪)',
    expression: '{dailyRate} * 0.225 * {workDays}',
    variables: [
      { varName: 'dailyRate', sourceType: 'computed', sourceId: null, label: 'نرخ روزانه' },
      { varName: 'workDays', sourceType: 'computed', sourceId: null, label: 'روزهای کارکرد' },
    ],
  },
  {
    code: 'absence_deduction',
    name: 'کسر غیبت',
    description: 'محاسبه خودکار کسر غیبت',
    expression: '{dailyRate} * {absenceDays}',
    variables: [
      { varName: 'dailyRate', sourceType: 'computed', sourceId: null, label: 'نرخ روزانه' },
      { varName: 'absenceDays', sourceType: 'employee_field', sourceId: null, label: 'روزهای غیبت' },
    ],
  },
  {
    code: 'delay_deduction',
    name: 'کسر تأخیر',
    description: 'محاسبه خودکار کسر تأخیر',
    expression: '{hourlyRate} * {delayHours}',
    variables: [
      { varName: 'hourlyRate', sourceType: 'computed', sourceId: null, label: 'نرخ ساعتی' },
      { varName: 'delayHours', sourceType: 'employee_field', sourceId: null, label: 'ساعات تأخیر' },
    ],
  },
  {
    code: 'mission_days',
    name: 'حق ماموریت',
    description: 'محاسبه خودکار بر اساس روزهای ماموریت تأییدشده',
    expression: '{dailyRate} * {missionDays}',
    variables: [
      { varName: 'dailyRate', sourceType: 'computed', sourceId: null, label: 'نرخ روزانه' },
      { varName: 'missionDays', sourceType: 'employee_field', sourceId: null, label: 'روزهای ماموریت' },
    ],
  },
  {
    code: 'sanavat',
    name: 'سنوات',
    description: 'محاسبه خودکار بر اساس سال سابقه کار',
    expression: '{sanavatRate} / 100 * {baseSalary} * MIN({yearsOfService}, {sanavatMaxYears}) / 12',
    variables: [
      { varName: 'sanavatRate', sourceType: 'setting', sourceId: null, label: 'نرخ سنوات' },
      { varName: 'baseSalary', sourceType: 'computed', sourceId: null, label: 'حقوق پایه' },
      { varName: 'yearsOfService', sourceType: 'employee_field', sourceId: null, label: 'سال سابقه کار' },
      { varName: 'sanavatMaxYears', sourceType: 'setting', sourceId: null, label: 'حداکثر سال سابقه مشمول' },
    ],
  },
  {
    code: 'eidi',
    name: 'عیدی',
    description: 'محاسبه خودکار عیدی (فقط ماه اسفند)',
    expression: 'IF({month}==12, {baseSalary} / {workDaysPerMonth} * MIN({eidiMinDays} + {yearsOfService}, {eidiMaxDays}), 0)',
    variables: [
      { varName: 'month', sourceType: 'computed', sourceId: null, label: 'ماه جاری' },
      { varName: 'baseSalary', sourceType: 'computed', sourceId: null, label: 'حقوق پایه' },
      { varName: 'workDaysPerMonth', sourceType: 'computed', sourceId: null, label: 'روزهای کار در ماه' },
      { varName: 'eidiMinDays', sourceType: 'setting', sourceId: null, label: 'حداقل روز عیدی' },
      { varName: 'yearsOfService', sourceType: 'employee_field', sourceId: null, label: 'سال سابقه کار' },
      { varName: 'eidiMaxDays', sourceType: 'setting', sourceId: null, label: 'حداکثر روز عیدی' },
    ],
  },
  {
    code: 'performance_bonus',
    name: 'پاداش عملکرد',
    description: 'محاسبه خودکار بر اساس نمره ارزیابی عملکرد',
    expression: '{baseSalary} * 5 / 100 * {performanceScore}',
    variables: [
      { varName: 'baseSalary', sourceType: 'computed', sourceId: null, label: 'حقوق پایه' },
      { varName: 'performanceScore', sourceType: 'employee_field', sourceId: null, label: 'نمره عملکرد' },
    ],
  },
  {
    code: 'unpaid_leave_days',
    name: 'کسر مرخصی بدون حقوق',
    description: 'کسر خودکار روزهای بدون حقوق',
    expression: '{dailyRate} * {unpaidLeaveDays}',
    variables: [
      { varName: 'dailyRate', sourceType: 'computed', sourceId: null, label: 'نرخ روزانه' },
      { varName: 'unpaidLeaveDays', sourceType: 'employee_field', sourceId: null, label: 'روزهای بدون حقوق' },
    ],
  },
  {
    code: 'loan_installment',
    name: 'قسط وام',
    description: 'کسر خودکار اقساط وام فعال',
    expression: '{totalLoanInstallment}',
    variables: [
      { varName: 'totalLoanInstallment', sourceType: 'employee_field', sourceId: null, label: 'جمع اقساط وام فعال' },
    ],
  },
]


// ─── محاسبه مالیات تصاعدی ───
export function calculateProgressiveTax(
  taxableIncome: number,  // ریال - درآمد مشمول مالیات (با احتساب مزایا)
  taxBrackets: { minAmount: number; maxAmount: number; rate: number }[]  // تومان
): number {
  if (taxableIncome <= 0 || taxBrackets.length === 0) return 0

  // ============================================
  // ۱. تبدیل ریال به تومان
  // ============================================
  const taxableMonthlyToman = Math.round(taxableIncome / 10)
  const taxableYearlyToman = taxableMonthlyToman * 12

  // ============================================
  // ۲. محاسبه مالیات سالانه به تومان
  // ============================================
  let annualTaxToman = 0
  let remaining = taxableYearlyToman

  // مرتب کردن پله‌ها بر اساس orderNum
  const sortedBrackets = [...taxBrackets].sort((a, b) => a.orderNum - b.orderNum)

  for (const bracket of sortedBrackets) {
    if (remaining <= 0) break

    const minAmount = bracket.minAmount  // تومان
    const maxAmount = bracket.maxAmount === 0 ? Infinity : bracket.maxAmount  // تومان

    // اگر درآمد از حداقل پله کمتر باشه، بقیه پله‌ها هم محاسبه نمیشن
    if (taxableYearlyToman <= minAmount) break

    // محاسبه مالیات در این پله
    const taxableInBracket = Math.min(remaining, maxAmount - minAmount)
    if (taxableInBracket > 0) {
      annualTaxToman += taxableInBracket * (bracket.rate / 100)
      remaining -= taxableInBracket
    }
  }

  // ============================================
  // ۳. تبدیل به ریال (ماهانه)
  // ============================================
  return Math.round((annualTaxToman / 12) * 10)
}

