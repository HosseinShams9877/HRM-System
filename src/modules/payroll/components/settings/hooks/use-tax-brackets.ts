// src/modules/payroll/components/settings/hooks/use-tax-brackets.ts

import { useState, useCallback } from 'react'
import { useToast } from '@/core/hooks/use-toast'

export function useTaxBrackets(year: number) {
  const { toast } = useToast()
  const [brackets, setBrackets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBrackets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payroll/tax-brackets?year=${year}`)
      if (res.ok) {
        const json = await res.json()
        setBrackets(json.brackets || [])
      }
    } catch (err) {
      console.error('Fetch tax brackets error:', err)
    } finally {
      setLoading(false)
    }
  }, [year])

  const addBracket = async (data: { orderNum: number; minAmount: number; maxAmount: number; rate: number }) => {
    try {
      const res = await fetch('/api/payroll/tax-brackets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, ...data }),
      })
      if (res.ok) {
        toast({ title: 'پله مالیاتی اضافه شد' })
        fetchBrackets()
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

  const updateBracket = async (id: string, data: { orderNum: number; minAmount: number; maxAmount: number; rate: number }) => {
    try {
      const res = await fetch(`/api/payroll/tax-brackets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast({ title: 'پله مالیاتی بروزرسانی شد' })
        fetchBrackets()
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

  const deleteBracket = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/tax-brackets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'پله مالیاتی حذف شد' })
        fetchBrackets()
        return true
      }
      return false
    } catch {
      toast({ title: 'خطا', variant: 'destructive' })
      return false
    }
  }

  return {
    brackets,
    loading,
    fetchBrackets,
    addBracket,
    updateBracket,
    deleteBracket,
  }
}