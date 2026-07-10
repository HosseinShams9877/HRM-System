// src/modules/employees/hooks/use-work-history.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================
// Types
// ============================================

export interface WorkHistory {
  id: string
  employeeId: string
  startDate: string
  endDate: string | null
  position: string
  positionId?: string
  department: string
  departmentId?: string
  description: string
  isCurrent: boolean
  source: string
  sourceId?: string
  createdAt: string
  updatedAt: string
}

export interface WorkHistoryFormData {
  position: string
  positionId?: string
  department: string
  departmentId?: string
  startDate: string
  endDate?: string
  description?: string
  isCurrent?: boolean
  source?: string
  sourceId?: string
}

export interface WorkHistoryFilters {
  isCurrent?: boolean
  startDateFrom?: string
  startDateTo?: string
}

// ============================================
// Query Keys
// ============================================

export const workHistoryKeys = {
  all: ['workHistory'] as const,
  lists: () => [...workHistoryKeys.all, 'list'] as const,
  list: (employeeId: string, filters?: WorkHistoryFilters) => 
    [...workHistoryKeys.lists(), employeeId, filters] as const,
  details: () => [...workHistoryKeys.all, 'detail'] as const,
  detail: (employeeId: string, historyId: string) => 
    [...workHistoryKeys.details(), employeeId, historyId] as const,
}

// ============================================
// Query Functions
// ============================================

const fetchWorkHistory = async (
  employeeId: string, 
  filters?: WorkHistoryFilters
): Promise<WorkHistory[]> => {
  const queryParams = new URLSearchParams()
  
  if (filters?.isCurrent !== undefined) {
    queryParams.append('isCurrent', String(filters.isCurrent))
  }
  if (filters?.startDateFrom) {
    queryParams.append('startDateFrom', filters.startDateFrom)
  }
  if (filters?.startDateTo) {
    queryParams.append('startDateTo', filters.startDateTo)
  }
  
  const url = `/api/employees/${employeeId}/work-history${
    queryParams.toString() ? '?' + queryParams.toString() : ''
  }`
  
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'خطا در دریافت سوابق شغلی')
  }
  const data = await res.json()
  return data.data || data || []
}

const fetchSingleWorkHistory = async (
  employeeId: string,
  historyId: string
): Promise<WorkHistory> => {
  const res = await fetch(`/api/employees/${employeeId}/work-history/${historyId}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'خطا در دریافت سابقه شغلی')
  }
  const data = await res.json()
  return data.data || data
}

// ============================================
// useWorkHistory Hook
// ============================================

export function useWorkHistory(
  employeeId: string | null | undefined,
  filters?: WorkHistoryFilters
) {
  return useQuery({
    queryKey: workHistoryKeys.list(employeeId || '', filters),
    queryFn: () => {
      if (!employeeId) throw new Error('شناسه کارمند الزامی است')
      return fetchWorkHistory(employeeId, filters)
    },
    enabled: !!employeeId,
    staleTime: 2 * 60 * 1000, // 2 دقیقه
    gcTime: 5 * 60 * 1000, // 5 دقیقه
    retry: 1,
  })
}

// ============================================
// useSingleWorkHistory Hook
// ============================================

export function useSingleWorkHistory(
  employeeId: string | null | undefined,
  historyId: string | null | undefined
) {
  return useQuery({
    queryKey: workHistoryKeys.detail(employeeId || '', historyId || ''),
    queryFn: () => {
      if (!employeeId || !historyId) {
        throw new Error('شناسه کارمند و شناسه سابقه شغلی الزامی است')
      }
      return fetchSingleWorkHistory(employeeId, historyId)
    },
    enabled: !!employeeId && !!historyId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// ============================================
// useCurrentWorkHistory Hook (فقط سابقه جاری)
// ============================================

export function useCurrentWorkHistory(employeeId: string | null | undefined) {
  return useWorkHistory(employeeId, { isCurrent: true })
}

// ============================================
// useCreateWorkHistory Hook
// ============================================

export function useCreateWorkHistory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      data 
    }: { 
      employeeId: string
      data: WorkHistoryFormData 
    }) => {
      const res = await fetch(`/api/employees/${employeeId}/work-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: data.source || 'MANUAL',
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'خطا در ایجاد سابقه شغلی')
      }
      const result = await res.json()
      return result.data || result
    },
    onSuccess: (data, { employeeId }) => {
      // Invalid کردن کش سوابق شغلی
      queryClient.invalidateQueries({ 
        queryKey: workHistoryKeys.list(employeeId) 
      })
      // Invalid کردن کش کارمند
      queryClient.invalidateQueries({ 
        queryKey: ['employees', 'detail', employeeId] 
      })
      toast.success('سابقه شغلی با موفقیت ایجاد شد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در ایجاد سابقه شغلی')
    },
  })
}

// ============================================
// useUpdateWorkHistory Hook
// ============================================

export function useUpdateWorkHistory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      historyId, 
      data 
    }: { 
      employeeId: string
      historyId: string
      data: Partial<WorkHistoryFormData>
    }) => {
      const res = await fetch(`/api/employees/${employeeId}/work-history/${historyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'خطا در ویرایش سابقه شغلی')
      }
      const result = await res.json()
      return result.data || result
    },
    onSuccess: (data, { employeeId, historyId }) => {
      // Invalid کردن کش سوابق شغلی
      queryClient.invalidateQueries({ 
        queryKey: workHistoryKeys.list(employeeId) 
      })
      // Invalid کردن کش یک سابقه خاص
      queryClient.invalidateQueries({ 
        queryKey: workHistoryKeys.detail(employeeId, historyId) 
      })
      // Invalid کردن کش کارمند
      queryClient.invalidateQueries({ 
        queryKey: ['employees', 'detail', employeeId] 
      })
      toast.success('سابقه شغلی با موفقیت ویرایش شد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در ویرایش سابقه شغلی')
    },
  })
}

// ============================================
// useDeleteWorkHistory Hook
// ============================================

export function useDeleteWorkHistory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      historyId 
    }: { 
      employeeId: string
      historyId: string
    }) => {
      const res = await fetch(`/api/employees/${employeeId}/work-history/${historyId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'خطا در حذف سابقه شغلی')
      }
      const result = await res.json()
      return result
    },
    onSuccess: (_, { employeeId, historyId }) => {
      // Invalid کردن کش سوابق شغلی
      queryClient.invalidateQueries({ 
        queryKey: workHistoryKeys.list(employeeId) 
      })
      // حذف کردن کش یک سابقه خاص از حافظه
      queryClient.removeQueries({ 
        queryKey: workHistoryKeys.detail(employeeId, historyId) 
      })
      toast.success('سابقه شغلی با موفقیت حذف شد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در حذف سابقه شغلی')
    },
  })
}

// ============================================
// useBulkWorkHistory Hook (برای گزارش‌گیری)
// ============================================

export function useBulkWorkHistory(employeeIds: string[]) {
  return useQuery({
    queryKey: [...workHistoryKeys.all, 'bulk', employeeIds],
    queryFn: async () => {
      const promises = employeeIds.map(id => fetchWorkHistory(id))
      const results = await Promise.allSettled(promises)
      
      return results.reduce((acc, result, index) => {
        if (result.status === 'fulfilled') {
          acc[employeeIds[index]] = result.value
        }
        return acc
      }, {} as Record<string, WorkHistory[]>)
    },
    enabled: employeeIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}