// ============================================
// Formula Management Types
// ============================================

export interface SalaryFormulaVariable {
  id: string
  formulaId: string
  varName: string
  sourceType: string
  sourceId: string | null
  label: string
  createdAt: string
  updatedAt: string
}

export interface PayrollItemRef {
  id: string
  title: string
  code: string
  category: string
}

export interface SalaryFormula {
  id: string
  name: string
  code: string
  description: string | null
  expression: string
  year: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  variables: SalaryFormulaVariable[]
  payrollItems: PayrollItemRef[]
}

export interface FormulaFormData {
  name: string
  code: string
  expression: string
  description: string
  isActive: boolean
  variables: VariableFormData[]
}

export interface VariableFormData {
  varName: string
  sourceType: string
  sourceId: string
  label: string
}
