// ============================================
// Types — Payroll Module
// ============================================

export interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  avatar: string | null
  department: string | null
  position: string | null
  maritalStatus?: string | null
  childrenCount?: number
  contractType?: string | null
  nationalCode?: string | null
}

export interface PaySlipItemRecord {
  id: string
  paySlipId: string
  payrollItemId: string | null
  title: string
  category: string // allowance | deduction
  amount: number // RIALS
  sortOrder: number
  payrollItem?: {
    id: string
    code: string
    category: string
    calculationType: string
    formulaId: string | null
    formula?: {
      id: string
      code: string
      name: string
    } | null
  } | null
}

export interface PaySlipRecord {
  id: string
  employeeId: string
  year: number
  month: number
  baseSalary: number // RIALS
  totalAllowances: number // RIALS
  totalDeductions: number // RIALS
  grossSalary: number // RIALS
  netSalary: number // RIALS
  workDays: number
  overtimeHours: number
  status: string // draft | confirmed | paid | closed
  notes: string | null
  createdAt: string
  employee: EmployeeBasic
  items: PaySlipItemRecord[]
}

export interface PayrollItemDefinition {
  id: string
  title: string
  code: string
  category: string // allowance | deduction
  calculationType: string // fixed | percentage | formula
  value: number
  formulaId: string | null
  formula?: {
    id: string
    code: string
    name: string
    expression: string
  } | null
  isInsurable: boolean
  isTaxable: boolean
  isEditable: boolean
  isSystem: boolean
  sortOrder: number
  isActive: boolean
  year: number
  description: string | null
}

export interface PayrollSettingRecord {
  id: string
  year: number
  // بخش دستمزد
  minDailyWage: number // RIALS
  minMonthlyWage: number // RIALS
  baseSalaryDefault: number // RIALS
  workHoursPerDay: number
  workDaysPerMonth: number
  // بخش بیمه
  insuranceRate: number
  employerInsRate: number
  unemploymentInsRate: number
  insuranceCeilingMultiplier: number
  // ضرایب
  overtimeMultiplier: number
  nightShiftMultiplier: number
  mixedNightMultiplier: number
  fridayWorkMultiplier: number
  holidayWorkMultiplier: number
  // عیدی و سنوات
  eidiMinDays: number
  eidiMaxDays: number
  sanavatRate: number
  sanavatMaxYears: number
  // مالیات
  taxExemptAmount: number // TOMANS
}

export interface TaxBracketRecord {
  id: string
  year: number
  orderNum: number
  minAmount: number // TOMANS
  maxAmount: number // TOMANS (0 = infinity)
  rate: number // percentage
}

export interface PayrollSummaryResponse {
  totalBaseSalary: number
  totalAllowances: number
  totalDeductions: number
  totalNetSalary: number
  count: number
  byStatus: Record<string, number>
}

export interface PayrollDetailSummary {
  totals: {
    totalBaseSalary: number
    totalAllowances: number
    totalDeductions: number
    totalGrossSalary: number
    totalNetSalary: number
    count: number
  }
  countByStatus: Record<string, number>
  departmentBreakdown: {
    department: string
    count: number
    totalBaseSalary: number
    totalNetSalary: number
  }[]
  averages: {
    netSalary: number
    baseSalary: number
  }
}

export interface GenerateResult {
  generated: number
  skipped: number
  totalEmployees: number
  errors?: string[]
}

export interface PaySlipFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    employeeId: string
    year: number
    month: number
    baseSalary: number
    workDays: number
    overtimeHours: number
    notes: string | null
    items: { title: string; category: string; amount: number; payrollItemId: string | null; sortOrder: number }[]
  }) => void
  employees: EmployeeBasic[]
  initialData?: PaySlipRecord | null
  payrollItems: PayrollItemDefinition[]
  year: number
}
