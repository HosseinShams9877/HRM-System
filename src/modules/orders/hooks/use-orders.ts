// src/modules/orders/hooks/useOrders.ts
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/core/hooks/use-debounce'
import type { OrderRecord, OrderStats, Employee } from '../types'

export function useOrders() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    executed: 0,
    active: 0,
    pending: 0
  })
  const [submitting, setSubmitting] = useState(false)

  const debouncedSearch = useDebounce(search, 300)
  const ITEMS_PER_PAGE = 8

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      params.set('limit', '100')
      
      const res = await fetch(`/api/orders?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const ordersList = data.orders || data.data || []
        
        setStats({
          total: ordersList.length,
          executed: ordersList.filter((o: OrderRecord) => o.status === 'executed').length,
          active: ordersList.filter((o: OrderRecord) => o.status === 'active').length,
          pending: ordersList.filter((o: OrderRecord) => o.status === 'pending').length,
        })
        
        setTotalPages(Math.ceil(ordersList.length / ITEMS_PER_PAGE))
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE
        setOrders(ordersList.slice(start, end))
      }
    } catch (err) {
      console.error('Fetch orders error:', err)
      toast.error('خطا در دریافت احکام')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, typeFilter, statusFilter, currentPage])

const fetchEmployees = useCallback(async () => {
  try {
    const res = await fetch('/api/employees?limit=100')
    if (res.ok) {
      const result = await res.json()
      
      // ✅ ساختار درست: data.data
      let empList = []
      if (result.data && Array.isArray(result.data)) {
        empList = result.data
      } else if (Array.isArray(result)) {
        empList = result
      } else if (result.records && Array.isArray(result.records)) {
        empList = result.records
      } else if (result.employees && Array.isArray(result.employees)) {
        empList = result.employees
      }
      
      console.log('✅ Employees fetched:', empList.length)
      setEmployees(empList)
    }
  } catch (err) {
    console.error('Fetch employees error:', err)
  }
}, [])

  useEffect(() => {
    fetchOrders()
    fetchEmployees()
  }, [fetchOrders, fetchEmployees])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, typeFilter, statusFilter])

  const resetFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  return {
    orders,
    employees,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    stats,
    submitting,
    setSubmitting,
    fetchOrders,
    resetFilters,
  }
}