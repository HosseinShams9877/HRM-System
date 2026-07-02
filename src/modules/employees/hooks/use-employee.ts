// src/modules/employees/hooks/use-employee.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================
// Types
// ============================================

export interface EmployeeFinancial {
  id?: string
  employeeId?: string
  bankAccountNo?: string | null
  insuranceNo?: string | null
  laborCardNo?: string | null
  baseSalary?: number | null
  housingAllowance?: number | null
  workAllowance?: number | null
  spouseAllowance?: number | null
  childAllowance?: number | null
  yearsOfServiceBase?: number | null
  responsibilityAllowance?: number | null
  otherAllowances?: number | null
}

export interface EmployeeDocument {
  id: string
  employeeId: string
  title: string
  category: string
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  description?: string | null
  uploadedBy?: string | null
  uploadedAt: string
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  nationalCode: string
  personnelCode: string
  fatherName?: string | null
  phone?: string | null
  email?: string | null
  birthDate?: string | null
  hireDate?: string | null
  birthPlace?: string | null
  issuePlace?: string | null
  gender?: string | null
  maritalStatus?: string | null
  childrenCount?: number | null
  education?: string | null
  fieldOfStudy?: string | null
  department?: string | null
  position?: string | null
  contractType?: string | null
  status?: string | null
  address?: string | null
  postalCode?: string | null
  homePhone?: string | null
  secondaryPhone?: string | null
  birthCertificateNo?: string | null
  contractMonths?: number | null
  contractEndDate?: string | null
  departmentName?: string | null
  positionName?: string | null
  financial?: EmployeeFinancial
  user?: {
    id: string
    email: string
    role: string
    isActive: boolean
    lastLogin: string | null
  }
}

// ============================================
// Query Keys
// ============================================

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  financial: (id: string) => [...employeeKeys.detail(id), 'financial'] as const,
  documents: (id: string) => [...employeeKeys.detail(id), 'documents'] as const,
}

// ============================================
// Query Functions
// ============================================

const fetchEmployee = async (id: string): Promise<Employee> => {
  const res = await fetch(`/api/employees/${id}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'خطا در دریافت اطلاعات کارمند')
  }
  const data = await res.json()
  return data.data || data
}

const fetchEmployeeFinancial = async (id: string): Promise<EmployeeFinancial> => {
  const res = await fetch(`/api/employees/${id}/financial`)
  if (!res.ok) {
    return {}
  }
  const data = await res.json()
  return data.data || data
}

const fetchEmployeeDocuments = async (id: string): Promise<EmployeeDocument[]> => {
  const res = await fetch(`/api/employees/${id}/documents`)
  if (!res.ok) {
    return []
  }
  const data = await res.json()
  return data.data || data
}

const fetchEmployeeWithFinancial = async (id: string): Promise<Employee> => {
  const [employee, financial] = await Promise.all([
    fetchEmployee(id),
    fetchEmployeeFinancial(id),
  ])
  
  return {
    ...employee,
    financial,
  }
}

// ============================================
// useEmployee Hook
// ============================================

export function useEmployee(id: string | null | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('شناسه کارمند الزامی است')
      return fetchEmployeeWithFinancial(id)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}

// ============================================
// useEmployeeBasic Hook
// ============================================

export function useEmployeeBasic(id: string | null | undefined) {
  return useQuery({
    queryKey: [...employeeKeys.detail(id || ''), 'basic'],
    queryFn: () => {
      if (!id) throw new Error('شناسه کارمند الزامی است')
      return fetchEmployee(id)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}

// ============================================
// useEmployeeFinancial Hook
// ============================================

export function useEmployeeFinancial(id: string | null | undefined) {
  return useQuery({
    queryKey: employeeKeys.financial(id || ''),
    queryFn: () => {
      if (!id) throw new Error('شناسه کارمند الزامی است')
      return fetchEmployeeFinancial(id)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}

// ============================================
// useEmployeeDocuments Hook
// ============================================

export function useEmployeeDocuments(id: string | null | undefined) {
  return useQuery({
    queryKey: employeeKeys.documents(id || ''),
    queryFn: () => {
      if (!id) throw new Error('شناسه کارمند الزامی است')
      return fetchEmployeeDocuments(id)
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// ============================================
// useUpdateEmployeeFinancial Hook
// ============================================

export function useUpdateEmployeeFinancial(employeeId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<EmployeeFinancial>) => {
      const res = await fetch(`/api/employees/${employeeId}/financial`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'خطا در بروزرسانی اطلاعات مالی')
      }
      const result = await res.json()
      return result.data || result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.financial(employeeId) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) })
      toast.success('اطلاعات مالی با موفقیت بروزرسانی شد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در بروزرسانی اطلاعات مالی')
    },
  })
}

// ============================================
// useUpdateEmployee Hook
// ============================================

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Employee>) => {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'خطا در بروزرسانی کارمند')
      }
      const result = await res.json()
      return result.data || result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      toast.success('اطلاعات کارمند با موفقیت بروزرسانی شد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در بروزرسانی کارمند')
    },
  })
}

// ============================================
// useUploadEmployeeDocument Hook
// ============================================

export function useUploadEmployeeDocument(employeeId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { file: File; title: string; category: string; description?: string }) => {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('title', data.title)
      formData.append('category', data.category)
      if (data.description) {
        formData.append('description', data.description)
      }
      
      const res = await fetch(`/api/employees/${employeeId}/documents`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'خطا در آپلود مدرک')
      }
      const result = await res.json()
      return result.data || result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.documents(employeeId) })
      toast.success('مدرک با موفقیت آپلود شد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در آپلود مدرک')
    },
  })
}

// ============================================
// useDeleteEmployeeDocument Hook
// ============================================

export function useDeleteEmployeeDocument(employeeId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (documentId: string) => {
      const res = await fetch(`/api/employees/${employeeId}/documents?docId=${documentId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'خطا در حذف مدرک')
      }
      return documentId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.documents(employeeId) })
      toast.success('مدرک با موفقیت حذف شد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در حذف مدرک')
    },
  })
}

// ============================================
// useDeleteEmployee Hook
// ============================================

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'خطا در غیرفعال کردن کارمند')
      }
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      toast.success('کارمند با موفقیت غیرفعال شد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در غیرفعال کردن کارمند')
    },
  })
}