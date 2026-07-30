// src/modules/payroll/components/PaySlipFormDialog/use-employee-data.ts

import { useState, useEffect, useRef } from 'react'
import { RIALS_TO_TOMANS } from '../../constants'
import type { EmployeeBenefits, PayrollItemDefinition } from './types'

const getBenefitKey = (code: string): string | null => {
  const mapping: Record<string, string> = {
    'HOUSING': 'housingAllowance',
    'HOUSING_ALLOWANCE': 'housingAllowance',
    'FOOD': 'workAllowance',
    'FOOD_ALLOWANCE': 'workAllowance',
    'BEN': 'workAllowance',
    'SPOUSE': 'spouseAllowance',
    'SPOUSE_ALLOWANCE': 'spouseAllowance',
    'CHILD': 'childAllowance',
    'CHILD_ALLOWANCE': 'childAllowance',
    'RESPONSIBILITY': 'responsibilityAllowance',
    'RESPONSIBILITY_ALLOWANCE': 'responsibilityAllowance',
    'OTHER': 'otherAllowances',
    'OTHER_ALLOWANCES': 'otherAllowances',
    'SENIORITY': 'yearsOfServiceBase',
    'YEARS_OF_SERVICE': 'yearsOfServiceBase',
    'SERVICE_BASE': 'yearsOfServiceBase',
  }
  return mapping[code] || null
}

interface UseEmployeeDataProps {
  employeeId: string
  isEdit: boolean
  payrollItems: PayrollItemDefinition[]
  onBaseSalaryLoaded: (salary: string) => void
  onBenefitsLoaded: (benefits: EmployeeBenefits) => void
  onItemAmountsLoaded: (amounts: Record<string, string>) => void
}

export function useEmployeeData({
  employeeId,
  isEdit,
  payrollItems,
  onBaseSalaryLoaded,
  onBenefitsLoaded,
  onItemAmountsLoaded,
}: UseEmployeeDataProps) {
  const [loading, setLoading] = useState(false)
  const [employeeBenefits, setEmployeeBenefits] = useState<EmployeeBenefits>({})
  const salaryLoaded = useRef(false)

  // ============================================
  // 🔥 وقتی employeeId تغییر می‌کند، ref را ریست کن
  // ============================================
  useEffect(() => {
    salaryLoaded.current = false
    // Reset benefits when employee changes
    setEmployeeBenefits({})
  }, [employeeId])

  useEffect(() => {
    if (!employeeId) return
    if (salaryLoaded.current) return
    if (isEdit) return

    const loadEmployeeData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/employees/${employeeId}/financial`)
        if (res.ok) {
          const json = await res.json()
          const data = json.data || json

          // ۱. حقوق پایه
          if (data.baseSalary) {
            onBaseSalaryLoaded(String(RIALS_TO_TOMANS(data.baseSalary)))
          } else {
            const settingRes = await fetch('/api/payroll/settings')
            if (settingRes.ok) {
              const settingJson = await settingRes.json()
              const setting = settingJson.setting
              if (setting?.baseSalaryDefault) {
                onBaseSalaryLoaded(String(RIALS_TO_TOMANS(setting.baseSalaryDefault)))
              }
            }
          }

          // ۲. مزایا
          const benefits: EmployeeBenefits = {}
          if (data.housingAllowance) benefits.housingAllowance = RIALS_TO_TOMANS(data.housingAllowance)
          if (data.workAllowance) benefits.workAllowance = RIALS_TO_TOMANS(data.workAllowance)
          if (data.spouseAllowance) benefits.spouseAllowance = RIALS_TO_TOMANS(data.spouseAllowance)
          if (data.childAllowance) benefits.childAllowance = RIALS_TO_TOMANS(data.childAllowance)
          if (data.responsibilityAllowance) benefits.responsibilityAllowance = RIALS_TO_TOMANS(data.responsibilityAllowance)
          if (data.otherAllowances) benefits.otherAllowances = RIALS_TO_TOMANS(data.otherAllowances)
          if (data.yearsOfServiceBase) benefits.yearsOfServiceBase = RIALS_TO_TOMANS(data.yearsOfServiceBase)

          setEmployeeBenefits(benefits)
          onBenefitsLoaded(benefits)

          // ۳. تنظیم مقادیر آیتم‌ها با مزایا
          const newItemAmounts: Record<string, string> = {}
          for (const item of payrollItems) {
            const benefitKey = getBenefitKey(item.code)
            if (benefitKey && benefits[benefitKey] !== undefined) {
              newItemAmounts[item.id] = String(benefits[benefitKey])
            } else if (item.calculationType === 'fixed') {
              newItemAmounts[item.id] = String(RIALS_TO_TOMANS(item.value))
            } else {
              newItemAmounts[item.id] = '0'
            }
          }
          onItemAmountsLoaded(newItemAmounts)

          salaryLoaded.current = true
        }
      } catch (error) {
        console.error('Error loading employee data:', error)
        salaryLoaded.current = true
      } finally {
        setLoading(false)
      }
    }

    loadEmployeeData()
  }, [employeeId, isEdit, payrollItems, onBaseSalaryLoaded, onBenefitsLoaded, onItemAmountsLoaded])

  return {
    loading,
    employeeBenefits,
    hasBenefits: Object.keys(employeeBenefits).length > 0,
  }
}