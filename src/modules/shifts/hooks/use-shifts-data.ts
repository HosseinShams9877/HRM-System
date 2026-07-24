// components/Shifts/hooks/useShiftsData.ts

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/core/hooks/use-toast'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import { WorkShiftData, EmployeeBasic, HolidayData, ShiftStats, HolidayStats } from '../types'

export function useShiftsData() {
  const [shifts, setShifts] = useState<WorkShiftData[]>([])
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])
  const [holidays, setHolidays] = useState<HolidayData[]>([])
  const [assignments, setAssignments] = useState<unknown[]>([])
  const [stats, setStats] = useState<ShiftStats>({ total: 0, active: 0, totalEmployees: 0 })
  const [holidayStats, setHolidayStats] = useState<HolidayStats>({ total: 0, official: 0, agreed: 0, occasional: 0 })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchShifts = useCallback(async (search: string = '') => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/shifts?${params.toString()}`)
      if (res.ok) { 
        const json = await res.json() 
        const payload = json.data || json 
        setShifts(payload.shifts || []) 
        setStats(payload.stats || { total: 0, active: 0, totalEmployees: 0 }) 
      }
    } catch (err) { 
      console.error('Fetch shifts error:', err) 
      setShifts([])
      setStats({ total: 0, active: 0, totalEmployees: 0 })
    }
  }, [])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?status=active')
      if (res.ok) { 
        const result = await res.json() 
        const empList = Array.isArray(result) ? result : (result.data || []) 
        setEmployees(empList.map((e: EmployeeBasic) => ({ 
          id: e.id, 
          firstName: e.firstName, 
          lastName: e.lastName, 
          personnelCode: e.personnelCode, 
          department: e.department, 
          position: e.position 
        }))) 
      }
    } catch (err) { 
      console.error('Fetch employees error:', err) 
      setEmployees([])
    }
  }, [])

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/shift-assignments')
      if (res.ok) { 
        const json = await res.json() 
        const payload = json.data || json 
        setAssignments(payload.assignments || []) 
      }
    } catch (err) { 
      console.error('Fetch assignments error:', err) 
      setAssignments([])
    }
  }, [])

  const fetchHolidays = useCallback(async (typeFilter: string = 'all') => {
    try {
      const params = new URLSearchParams()
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)
      const res = await fetch(`/api/holidays?${params.toString()}`)
      if (res.ok) { 
        const json = await res.json()
        console.log('📥 fetchHolidays response:', json) // برای دیباگ
        
        // ساختار پاسخ: { data: [...], pagination: {...}, stats: {...} }
        setHolidays(json.data || []) 
        setHolidayStats(json.stats || { total: 0, official: 0, agreed: 0, occasional: 0 })
      } else {
        setHolidays([])
        setHolidayStats({ total: 0, official: 0, agreed: 0, occasional: 0 })
      }
    } catch (err) { 
      console.error('Fetch holidays error:', err) 
      setHolidays([])
      setHolidayStats({ total: 0, official: 0, agreed: 0, occasional: 0 })
    }
  }, [])

  const createShift = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/shifts', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      })
      if (res.ok) { 
        toast({ title: 'شیفت کاری با موفقیت ایجاد شد' })
        return true
      } else { 
        const err = await res.json() 
        toast({ title: err.error || 'خطا', variant: 'destructive' })
        return false
      }
    } catch { 
      toast({ title: 'خطا در ارتباط', variant: 'destructive' })
      return false
    }
  }, [toast])

  const updateShift = useCallback(async (id: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/shifts/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      })
      if (res.ok) { 
        toast({ title: 'شیفت بروزرسانی شد' })
        return true
      } else { 
        const err = await res.json() 
        toast({ title: err.error || 'خطا', variant: 'destructive' })
        return false
      }
    } catch { 
      toast({ title: 'خطا در ارتباط', variant: 'destructive' })
      return false
    }
  }, [toast])

  const deleteShift = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/shifts/${id}`, { method: 'DELETE' })
      if (res.ok) { 
        toast({ title: 'شیفت حذف شد' })
        return true
      } else { 
        const err = await res.json() 
        toast({ title: err.error || 'خطا', variant: 'destructive' })
        return false
      }
    } catch { 
      toast({ title: 'خطا در ارتباط', variant: 'destructive' })
      return false
    }
  }, [toast])

  const assignShift = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/shift-assignments', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      })
      if (res.ok) { 
        toast({ title: 'شیفت با موفقیت به کارمند انتساب شد' })
        return true
      } else { 
        const err = await res.json() 
        toast({ title: err.error || 'خطا', variant: 'destructive' })
        return false
      }
    } catch { 
      toast({ title: 'خطا در ارتباط', variant: 'destructive' })
      return false
    }
  }, [toast])

  const endAssignment = useCallback(async (id: string) => {
    try {
      const today = getTodayShamsi()
      const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
      await fetch(`/api/shift-assignments/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ action: 'end', endDate: todayStr }) 
      })
      toast({ title: 'انتساب پایان یافت' })
      return true
    } catch { 
      toast({ title: 'خطا', variant: 'destructive' })
      return false
    }
  }, [toast])

  const createHoliday = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/holidays', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      })
      if (res.ok) { 
        toast({ title: 'تعطیلی با موفقیت ثبت شد' })
        return true
      } else { 
        const err = await res.json() 
        toast({ title: err.error || 'خطا', variant: 'destructive' })
        return false
      }
    } catch { 
      toast({ title: 'خطا در ارتباط', variant: 'destructive' })
      return false
    }
  }, [toast])

  const updateHoliday = useCallback(async (id: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/holidays/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      })
      if (res.ok) { 
        toast({ title: 'تعطیلی بروزرسانی شد' })
        return true
      } else { 
        const err = await res.json() 
        toast({ title: err.error || 'خطا', variant: 'destructive' })
        return false
      }
    } catch { 
      toast({ title: 'خطا در ارتباط', variant: 'destructive' })
      return false
    }
  }, [toast])

  const deleteHoliday = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/holidays/${id}`, { method: 'DELETE' })
      if (res.ok) { 
        toast({ title: 'تعطیلی حذف شد' })
        return true
      }
      return false
    } catch { 
      toast({ title: 'خطا', variant: 'destructive' })
      return false
    }
  }, [toast])

  // بارگذاری اولیه
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchShifts(),
        fetchEmployees(),
        fetchAssignments(),
        fetchHolidays()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  return {
    shifts,
    employees,
    holidays,
    assignments,
    stats,
    holidayStats,
    loading,
    fetchShifts,
    fetchEmployees,
    fetchAssignments,
    fetchHolidays,
    createShift,
    updateShift,
    deleteShift,
    assignShift,
    endAssignment,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  }
}