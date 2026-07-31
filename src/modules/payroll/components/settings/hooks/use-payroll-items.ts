// src/modules/payroll/components/settings/hooks/use-payroll-items.ts

import { useState, useCallback } from 'react'
import { useToast } from '@/core/hooks/use-toast'

export function usePayrollItems(year: number) {
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payroll/items?year=${year}`)
      if (res.ok) {
        const json = await res.json()
        setItems(json.items || [])
      }
    } catch (err) {
      console.error('Fetch items error:', err)
    } finally {
      setLoading(false)
    }
  }, [year])

  const saveItem = async (data: Record<string, unknown>, existingId?: string) => {
    try {
      const url = existingId ? `/api/payroll/items/${existingId}` : '/api/payroll/items'
      const method = existingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast({ title: existingId ? 'آیتم بروزرسانی شد' : 'آیتم ایجاد شد' })
        fetchItems()
        return true
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
      return false
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('آیا از حذف این آیتم اطمینان دارید؟')) return false
    try {
      const res = await fetch(`/api/payroll/items/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'آیتم حذف شد' })
        fetchItems()
        return true
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
      return false
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/payroll/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      if (res.ok) {
        toast({ title: isActive ? 'آیتم فعال شد' : 'آیتم غیرفعال شد' })
        fetchItems()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    } finally {
      setTogglingId(null)
    }
  }

  return {
    items,
    loading,
    togglingId,
    fetchItems,
    saveItem,
    deleteItem,
    toggleActive,
  }
}