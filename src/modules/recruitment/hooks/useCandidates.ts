// src/modules/recruitment/hooks/useCandidates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Candidate } from '../types/type'

// دریافت لیست کاندیداها
export function useCandidates(filters?: { status?: string; source?: string; search?: string }) {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
      if (filters?.source && filters.source !== 'all') params.set('source', filters.source)
      if (filters?.search) params.set('search', filters.search)
      
      const res = await fetch(`/api/candidates?${params.toString()}`)
      if (!res.ok) throw new Error('خطا در دریافت کاندیداها')
      return res.json() as Promise<Candidate[]>
    },
    staleTime: 60 * 1000, // 1 دقیقه
  })
}

// تغییر وضعیت کاندیدا
export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'خطا در بروزرسانی وضعیت')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('وضعیت کاندیدا بروزرسانی شد')
      // فقط کش کاندیداها رو بروزرسانی کن
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در بروزرسانی وضعیت')
    },
  })
}