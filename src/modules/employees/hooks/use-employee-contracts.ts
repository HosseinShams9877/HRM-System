// src/modules/employees/hooks/use-employee-contracts.ts
import { useQuery } from '@tanstack/react-query'

export interface EmployeeContract {
  id: string
  employeeId: string
  type: string
  contractNumber: string
  title: string
  startDate: string
  endDate: string | null
  amount: number | null
  department: string | null
  notes: string | null
  status: string
  filePath: string | null
  content: string | null
  variables: any
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  employee: {
    id: string
    firstName: string
    lastName: string
    personnelCode: string
    department: string | null
    position: string | null
  }
}

export function useEmployeeContracts(employeeId: string | null | undefined) {
  return useQuery({
    queryKey: ['employee-contracts', employeeId],
    queryFn: async () => {
      if (!employeeId) return []
      const res = await fetch(`/api/employees/${employeeId}/contracts`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'خطا در دریافت قراردادها')
      }
      const data = await res.json()
      return data.data || []
    },
    enabled: !!employeeId,
    staleTime: 2 * 60 * 1000,
  })
}