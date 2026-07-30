// src/modules/payroll/components/PaySlipFormDialog/types.ts

import type { PaySlipFormDialogProps } from '../../index'
import type { EmployeeBasic, PayrollItemDefinition } from '../../types'

export interface FormState {
  formYear: number
  formMonth: number
  employeeId: string
  baseSalary: string
  workDays: string
  overtimeHours: string
  notes: string
  itemAmounts: Record<string, string>
}

export interface OrderState {
  generateOrder: boolean
  orderType: string
  orderEffectiveDate: string
  orderDescription: string
  orderNewPosition: string
  orderNewDepartment: string
}

export interface EmployeeBenefits {
  housingAllowance?: number
  workAllowance?: number
  spouseAllowance?: number
  childAllowance?: number
  responsibilityAllowance?: number
  otherAllowances?: number
  yearsOfServiceBase?: number
}

export interface CalculatedAmounts {
  [key: string]: number
}

export type { PaySlipFormDialogProps, EmployeeBasic, PayrollItemDefinition }