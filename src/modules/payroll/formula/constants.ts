import type { FormulaFormData, VariableFormData } from './types/types'

// ============================================
// Constants
// ============================================

export const SOURCE_TYPE_MAP: Record<string, string> = {
  setting: 'تنظیمات حقوقی',
  item: 'آیتم حقوقی',
  employee_field: 'فیلد کارمند',
  constant: 'مقدار ثابت',
  computed: 'محاسبه‌شده',
  tax: 'مالیات تصاعدی',
}

export const SOURCE_TYPES = [
  { value: 'setting', label: 'تنظیمات حقوقی' },
  { value: 'item', label: 'آیتم حقوقی' },
  { value: 'employee_field', label: 'فیلد کارمند' },
  { value: 'constant', label: 'مقدار ثابت' },
  { value: 'computed', label: 'محاسبه‌شده' },
  { value: 'tax', label: 'مالیات تصاعدی' },
]

export const YEAR_OPTIONS = [1403, 1404, 1405, 1406, 1407, 1408, 1409, 1410]

export const EMPTY_FORMULA: FormulaFormData = {
  name: '',
  code: '',
  expression: '',
  description: '',
  isActive: true,
  variables: [],
}

export const EMPTY_VARIABLE: VariableFormData = {
  varName: '',
  sourceType: 'constant',
  sourceId: '',
  label: '',
}

// ============================================
// API Helpers
// ============================================

import type { SalaryFormula } from './types/types'

export async function fetchFormulas(year: number): Promise<SalaryFormula[]> {
  const res = await fetch(`/api/payroll/formulas?year=${year}`)
  if (!res.ok) throw new Error('خطا در دریافت فرمول‌ها')
  const data = await res.json()
  return data.formulas ?? data ?? []
}

export async function fetchFormulaById(id: string): Promise<SalaryFormula> {
  const res = await fetch(`/api/payroll/formulas/${id}`)
  if (!res.ok) throw new Error('خطا در دریافت جزئیات فرمول')
  return res.json()
}

export async function createFormula(payload: Omit<FormulaFormData, ''> & { year: number }): Promise<SalaryFormula> {
  const res = await fetch('/api/payroll/formulas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'خطا در ایجاد فرمول')
  }
  return res.json()
}

export async function updateFormula(id: string, payload: Omit<FormulaFormData, ''> & { year: number }): Promise<SalaryFormula> {
  const res = await fetch(`/api/payroll/formulas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'خطا در بروزرسانی فرمول')
  }
  return res.json()
}

export async function deleteFormula(id: string): Promise<void> {
  const res = await fetch(`/api/payroll/formulas/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'خطا در حذف فرمول')
  }
}

export async function seedSystemFormulas(year: number): Promise<{ created: number; updated: number }> {
  const res = await fetch('/api/payroll/formulas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'خطا در ایجاد فرمول‌های سیستمی')
  }
  return res.json()
}
