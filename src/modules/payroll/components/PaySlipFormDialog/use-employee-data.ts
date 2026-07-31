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
    'BENEFIT': 'workAllowance',
    'SPOUSE': 'spouseAllowance',
    'SPOUSE_ALLOWANCE': 'spouseAllowance',
    'MARRIAGE': 'spouseAllowance',
    'CHILD': 'childAllowance',
    'CHILD_ALLOWANCE': 'childAllowance',
    'CHILDREN': 'childAllowance',
    'RESPONSIBILITY': 'responsibilityAllowance',
    'RESPONSIBILITY_ALLOWANCE': 'responsibilityAllowance',
    'MANAGEMENT': 'responsibilityAllowance',
    'OTHER': 'otherAllowances',
    'OTHER_ALLOWANCES': 'otherAllowances',
    'EXTRA': 'otherAllowances',
    'SENIORITY': 'yearsOfServiceBase',
    'YEARS_OF_SERVICE': 'yearsOfServiceBase',
    'SERVICE_BASE': 'yearsOfServiceBase',
    'SENIORITY_BASE': 'yearsOfServiceBase',
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

  useEffect(() => {
    salaryLoaded.current = false
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

          // ۲. ✅ همه مزایا
          const benefits: EmployeeBenefits = {}
          
          // حق مسکن
          if (data.housingAllowance) benefits.housingAllowance = RIALS_TO_TOMANS(data.housingAllowance)
          // بن کارگری
          if (data.workAllowance) benefits.workAllowance = RIALS_TO_TOMANS(data.workAllowance)
          // حق تاهل
          if (data.spouseAllowance) benefits.spouseAllowance = RIALS_TO_TOMANS(data.spouseAllowance)
          // حق اولاد
          if (data.childAllowance) benefits.childAllowance = RIALS_TO_TOMANS(data.childAllowance)
          // حق مسئولیت
          if (data.responsibilityAllowance) benefits.responsibilityAllowance = RIALS_TO_TOMANS(data.responsibilityAllowance)
          // سایر مزایا
          if (data.otherAllowances) benefits.otherAllowances = RIALS_TO_TOMANS(data.otherAllowances)
          // پایه سنوات
          if (data.yearsOfServiceBase) benefits.yearsOfServiceBase = RIALS_TO_TOMANS(data.yearsOfServiceBase)

          console.log('✅ مزایای دریافت شده از کارمند:', benefits)
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