// src/modules/payroll/components/settings/types.ts

export interface SettingsFormData {
    minDailyWage: string
    minMonthlyWage: string
    baseSalaryDefault: string
    workHoursPerDay: string
    workDaysPerMonth: string
    insuranceRate: string
    employerInsRate: string
    unemploymentInsRate: string
    insuranceCeilingMultiplier: string
    overtimeMultiplier: string
    nightShiftMultiplier: string
    mixedNightMultiplier: string
    fridayWorkMultiplier: string
    holidayWorkMultiplier: string
    eidiMinDays: string
    eidiMaxDays: string
    sanavatRate: string
    sanavatMaxYears: string
    taxExemptAmount: string
  }
  
  export interface PayrollItemFormData {
    title: string
    code: string
    category: string
    calculationType: string
    value: string
    formulaId: string
    employeeField: string
    isInsurable: boolean
    isTaxable: boolean
    isEditable: boolean
    isSystem: boolean
    sortOrder: string
    description: string
    includeInEidi: boolean
    includeInSanavat: boolean
    affectsOvertime: boolean
    includeInLeaveBuyback: boolean
    includeInLeaveBalance: boolean
  }
  
  export const EMPLOYEE_FIELDS = [
    { value: 'housingAllowance', label: 'حق مسکن' },
    { value: 'workAllowance', label: 'حق خواربار' },
    { value: 'spouseAllowance', label: 'حق تاهل' },
    { value: 'childAllowance', label: 'حق اولاد' },
    { value: 'responsibilityAllowance', label: 'حق مسئولیت' },
    { value: 'otherAllowances', label: 'سایر مزایا' },
    { value: 'yearsOfServiceBase', label: 'پایه سنوات' },
  ]