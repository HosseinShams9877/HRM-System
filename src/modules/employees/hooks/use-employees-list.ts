// src/modules/employees/hooks/use-employees-list.ts

import { useQuery } from '@tanstack/react-query'

// ============================================
// Types
// ============================================

export interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  department: string | null
  position: string | null
  avatar: string | null
  email?: string | null
  phone?: string | null
  status?: string | null
}

// ============================================
// Query Keys
// ============================================

export const employeeListKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeListKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...employeeListKeys.lists(), filters] as const,
  active: () => [...employeeListKeys.all, 'active'] as const,
}

// ============================================
// Query Function
// ============================================

const fetchEmployees = async (params?: { status?: string; search?: string }): Promise<EmployeeBasic[]> => {
  const url = new URL('/api/employees', window.location.origin)
  
  if (params?.status) url.searchParams.set('status', params.status)
  if (params?.search) url.searchParams.set('search', params.search)
  
  const res = await fetch(url.toString())
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'خطا در دریافت لیست کارمندان')
  }
  
  const data = await res.json()
  
  // پشتیبانی از ساختارهای مختلف پاسخ
  let employeesData: EmployeeBasic[] = []
  
  if (Array.isArray(data)) {
    employeesData = data
  } else if (data.data && Array.isArray(data.data)) {
    employeesData = data.data
  } else if (data.employees && Array.isArray(data.employees)) {
    employeesData = data.employees
  } else {
    employeesData = []
  }
  
  // نگاشت به فرمت استاندارد
  return employeesData.map((emp: any) => ({
    id: emp.id,
    firstName: emp.firstName || '',
    lastName: emp.lastName || '',
    personnelCode: emp.personnelCode || emp.code || '',
    department: emp.department || null,
    position: emp.position || null,
    avatar: emp.avatar || null,
    email: emp.email || null,
    phone: emp.phone || null,
    status: emp.status || 'active',
  }))
}

// ============================================
// Hooks
// ============================================

/**
 * دریافت لیست کارمندان فعال
 */
export function useActiveEmployees() {
  return useQuery({
    queryKey: employeeListKeys.active(),
    queryFn: () => fetchEmployees({ status: 'active' }),
    staleTime: 5 * 60 * 1000, // 5 دقیقه
    gcTime: 10 * 60 * 1000, // 10 دقیقه
    retry: 1,
  })
}

/**
 * دریافت لیست کارمندان با فیلتر وضعیت
 */
export function useEmployees(status?: string) {
  return useQuery({
    queryKey: status ? employeeListKeys.list({ status }) : employeeListKeys.lists(),
    queryFn: () => fetchEmployees({ status }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}

/**
 * دریافت لیست کارمندان با جستجو
 */
export function useSearchEmployees(search: string) {
  return useQuery({
    queryKey: employeeListKeys.list({ search }),
    queryFn: () => fetchEmployees({ search }),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: search.length > 2, // فقط وقتی حداقل ۳ کاراکتر وارد شده
    retry: 1,
  })
}

/**
 * دریافت لیست کارمندان (با قابلیت رفرش دستی)
 */
export function useEmployeesList(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: employeeListKeys.list(params || {}),
    queryFn: () => fetchEmployees(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}