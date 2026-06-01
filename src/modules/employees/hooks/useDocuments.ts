// src/modules/employees/hooks/useDocuments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface Document {
  id: string
  title: string
  category: string
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  description: string | null
  createdAt: string
}

// ========== Fetch Documents ==========
const fetchDocuments = async (employeeId: string): Promise<Document[]> => {
  const res = await fetch(`/api/employees/${employeeId}/documents`)
  if (!res.ok) throw new Error('خطا در دریافت مدارک')
  const data = await res.json()
  return data.data || data
}

export function useDocuments(employeeId: string) {
  return useQuery({
    queryKey: ['documents', employeeId],
    queryFn: () => fetchDocuments(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 دقیقه
  })
}

// ========== Upload Document ==========
export function useUploadDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ employeeId, file, title, category, description }: any) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('category', category)
      formData.append('description', description || '')
      
      const res = await fetch(`/api/employees/${employeeId}/documents`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('خطا در آپلود')
      return res.json()
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', employeeId] })
      toast.success('مدرک با موفقیت آپلود شد')
    },
    onError: (error: any) => {
      toast.error(error.message || 'خطا در آپلود مدرک')
    },
  })
}

// ========== Delete Document ==========
export function useDeleteDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ employeeId, docId }: { employeeId: string; docId: string }) => {
      const res = await fetch(`/api/employees/${employeeId}/documents?docId=${docId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('خطا در حذف')
      return res.json()
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', employeeId] })
      toast.success('مدرک حذف شد')
    },
    onError: () => {
      toast.error('خطا در حذف مدرک')
    },
  })
}

// ========== Update Document ==========
export function useUpdateDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ employeeId, docId, data }: any) => {
      const res = await fetch(`/api/employees/${employeeId}/documents?docId=${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('خطا در ویرایش')
      return res.json()
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', employeeId] })
      toast.success('مدرک با موفقیت ویرایش شد')
    },
    onError: () => {
      toast.error('خطا در ویرایش مدرک')
    },
  })
}