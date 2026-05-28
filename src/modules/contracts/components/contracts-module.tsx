'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  FileText, Search, Plus, MoreVertical, Eye,
  FileBadge, CheckCircle2, XCircle,
  RefreshCcw, Trash2, Users, Clock, AlertCircle, FileWarning, FileCheck,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/core/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Skeleton } from '@/core/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/core/components/ui/alert-dialog'
import { toast } from 'sonner'
import { toPersianDigits, formatShamsi, formatCurrency } from '@/core/lib/utils-fa'
import type { EmployeeBasic, ContractRecord, ContractStats } from '../index'
import { CONTRACT_TYPES } from '../index'
import { ContractFormDialog, RenewDialog, TerminateDialog } from './contract-form-dialog'
import { ContractDetailDialog, ContractStatusBadge, ContractTypeBadge, DaysUntilExpiry } from './contract-detail-dialog'

// ============================================
// محاسبه روزهای باقیمانده
// ============================================

const calculateDaysRemaining = (endDate: string | null | undefined): number => {
  if (!endDate) return 0
  try {
    const parts = endDate.split('/')
    if (parts.length !== 3) return 0
    
    const today = new Date()
    const end = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  } catch {
    return 0
  }
}

// ============================================
// Debounce Hook
// ============================================

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// ============================================
// Employee with contract info
// ============================================

interface EmployeeWithContract extends EmployeeBasic {
  activeContract?: ContractRecord | null
  contractStatus?: string
  contractType?: string
  startDate?: string
  endDate?: string
  daysRemaining?: number
}

// ============================================
// Stats Card Component
// ============================================

function StatsCard({ title, value, icon: Icon, color, bgColor, subText }: { 
  title: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
  subText?: string
}) {
  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{toPersianDigits(value)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
            {subText && <p className="text-[9px] text-muted-foreground mt-0.5">{subText}</p>}
          </div>
          <div className={`p-3 rounded-2xl ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Pagination Component
// ============================================

function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 rounded-lg"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      
      {getPageNumbers().map((page, idx) => (
        page === '...' ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            className={`h-8 w-8 p-0 rounded-lg ${currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            onClick={() => onPageChange(page as number)}
          >
            {toPersianDigits(page as number)}
          </Button>
        )
      ))}
      
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 rounded-lg"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
    </div>
  )
}

// ============================================
// Main Contracts Module
// ============================================

export function ContractsModule() {
  const [employees, setEmployees] = useState<EmployeeWithContract[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    expiringSoon: 0,
    draft: 0,
    noContract: 0
  })
  const [showCreate, setShowCreate] = useState(false)
  const [editContract, setEditContract] = useState<ContractRecord | null>(null)
  const [detailContract, setDetailContract] = useState<ContractRecord | null>(null)
  const [renewContract, setRenewContract] = useState<ContractRecord | null>(null)
  const [terminateContract, setTerminateContract] = useState<ContractRecord | null>(null)
  const [deleteContract, setDeleteContract] = useState<ContractRecord | null>(null)

  const debouncedSearch = useDebounce(search, 300)
  const ITEMS_PER_PAGE = 7

  const fetchEmployeesWithContracts = useCallback(async () => {
    try {
      setLoading(true)
      // دریافت لیست کارمندان
      const empRes = await fetch(`/api/employees?limit=100`)
      let employeesList: EmployeeBasic[] = []
      if (empRes.ok) {
        const empData = await empRes.json()
        employeesList = Array.isArray(empData) ? empData : (empData.data || [])
      }
      
      // دریافت همه قراردادها
      const contractRes = await fetch('/api/contracts')
      let allContracts: ContractRecord[] = []
      if (contractRes.ok) {
        const contractData = await contractRes.json()
        allContracts = contractData.contracts || []
      }
      
      // محاسبه آمار
      const activeContracts = allContracts.filter(c => c.status === 'active')
      const expiredContracts = allContracts.filter(c => c.status === 'expired')
      const draftContracts = allContracts.filter(c => c.status === 'draft')
      
      let expiringSoonCount = 0
      activeContracts.forEach(c => {
        if (c.endDate) {
          const daysLeft = calculateDaysRemaining(c.endDate)
          if (daysLeft > 0 && daysLeft <= 30) {
            expiringSoonCount++
          }
        }
      })
      
      setStats({
        total: allContracts.length,
        active: activeContracts.length,
        expired: expiredContracts.length,
        expiringSoon: expiringSoonCount,
        draft: draftContracts.length,
        noContract: employeesList.filter(emp => !allContracts.some(c => c.employeeId === emp.id && c.status === 'active')).length
      })
      
      // ترکیب کارمندان با قراردادهای فعال آنها
      let employeesWithContracts: EmployeeWithContract[] = employeesList.map(emp => {
        const activeContract = allContracts.find(c => c.employeeId === emp.id && c.status === 'active')
        
        let daysRemaining = 0
        if (activeContract?.endDate) {
          daysRemaining = calculateDaysRemaining(activeContract.endDate)
        }
        
        return {
          ...emp,
          activeContract: activeContract || null,
          contractStatus: activeContract ? 'active' : 'no_contract',
          contractType: activeContract?.type || null,
          startDate: activeContract?.startDate,
          endDate: activeContract?.endDate,
          daysRemaining: daysRemaining
        }
      })
      
      // فیلتر بر اساس جستجو
      if (debouncedSearch) {
        employeesWithContracts = employeesWithContracts.filter(emp =>
          `${emp.firstName} ${emp.lastName}`.includes(debouncedSearch) ||
          emp.personnelCode.includes(debouncedSearch)
        )
      }
      
      // فیلتر بر اساس نوع قرارداد
     // فیلتر بر اساس نوع قرارداد - فقط اگر مقدار انتخاب شده باشه
     if (typeFilter && typeFilter !== 'all') {
      employeesWithContracts = employeesWithContracts.filter(emp => emp.contractType === typeFilter)
    }
      
      // فیلتر بر اساس وضعیت
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          employeesWithContracts = employeesWithContracts.filter(emp => emp.contractStatus === 'active')
        } else if (statusFilter === 'no_contract') {
          employeesWithContracts = employeesWithContracts.filter(emp => emp.contractStatus === 'no_contract')
        } else if (statusFilter === 'expiring_soon') {
          employeesWithContracts = employeesWithContracts.filter(emp => emp.daysRemaining > 0 && emp.daysRemaining <= 30)
        }
      }
      
      // محاسبه تعداد صفحات
      setTotalPages(Math.ceil(employeesWithContracts.length / ITEMS_PER_PAGE))
      
      // صفحه‌بندی
      const start = (currentPage - 1) * ITEMS_PER_PAGE
      const end = start + ITEMS_PER_PAGE
      const paginatedEmployees = employeesWithContracts.slice(start, end)
      
      setEmployees(paginatedEmployees)
      
    } catch (err) {
      console.error('Fetch employees error:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, typeFilter, statusFilter, currentPage])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        setDepartments(data.map((d: { name: string }) => d.name))
      }
    } catch (err) {
      console.error('Fetch departments error:', err)
    }
  }, [])

  useEffect(() => {
    fetchEmployeesWithContracts()
    fetchDepartments()
  }, [fetchEmployeesWithContracts, fetchDepartments])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, typeFilter, statusFilter])

  // ایجاد قرارداد جدید
  const handleCreate = async (formData: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast.success('قرارداد/حکم با موفقیت ایجاد شد')
        setShowCreate(false)
        fetchEmployeesWithContracts()
      } else {
        const err = await res.json()
        toast.error(err.error || 'خطا در ایجاد')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  // ویرایش قرارداد
  const handleEdit = async (formData: Record<string, unknown>) => {
    if (!editContract) return
    try {
      const res = await fetch(`/api/contracts/${editContract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast.success('قرارداد/حکم بروزرسانی شد')
        setEditContract(null)
        fetchEmployeesWithContracts()
      } else {
        const err = await res.json()
        toast.error(err.error || 'خطا در بروزرسانی')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  // تأیید قرارداد
  const handleApprove = async (contractId: string) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (res.ok) {
        toast.success('قرارداد تأیید شد')
        fetchEmployeesWithContracts()
      }
    } catch {
      toast.error('خطا در تأیید')
    }
  }

  // فسخ قرارداد
  const handleTerminate = async (formData: Record<string, unknown>) => {
    if (!terminateContract) return
    try {
      const res = await fetch(`/api/contracts/${terminateContract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'terminate', notes: formData.notes }),
      })
      if (res.ok) {
        toast.success('قرارداد فسخ شد')
        setTerminateContract(null)
        fetchEmployeesWithContracts()
      }
    } catch {
      toast.error('خطا در فسخ')
    }
  }

  // تمدید قرارداد
  const handleRenew = async (formData: Record<string, unknown>) => {
    if (!renewContract) return
    try {
      const res = await fetch(`/api/contracts/${renewContract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'renew',
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          amount: formData.amount || null,
          notes: formData.notes || null,
        }),
      })
      if (res.ok) {
        toast.success('قرارداد تمدید شد و سند جدید ایجاد شد')
        setRenewContract(null)
        fetchEmployeesWithContracts()
      }
    } catch {
      toast.error('خطا در تمدید')
    }
  }

  // حذف قرارداد
  const handleDelete = async (contractId: string) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('قرارداد حذف شد')
        fetchEmployeesWithContracts()
      }
    } catch {
      toast.error('خطا در حذف')
    }
    setDeleteContract(null)
  }

  const getStatusBadge = (employee: EmployeeWithContract) => {
    if (employee.contractStatus === 'active') {
      if (employee.daysRemaining && employee.daysRemaining <= 30 && employee.daysRemaining > 0) {
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 rounded-full px-2.5 py-0.5">در شرف انقضا</Badge>
      }
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full px-2.5 py-0.5">فعال</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-0 rounded-full px-2.5 py-0.5">بدون قرارداد</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[60px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-emerald-600" />
            قرارداد و احکام کارکنان
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت قراردادها و احکام کارکنان سازمان
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
          <Plus className="w-4 h-4" />
          ایجاد قرارداد/حکم جدید
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsCard 
          title="کل قراردادها" 
          value={stats.total} 
          icon={FileText}
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatsCard 
          title="فعال" 
          value={stats.active} 
          icon={FileCheck}
          color="text-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatsCard 
          title="در شرف انقضا" 
          value={stats.expiringSoon} 
          icon={AlertCircle}
          color="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-950/30"
          subText="تا 30 روز"
        />
        <StatsCard 
          title="منقضی شده" 
          value={stats.expired} 
          icon={FileWarning}
          color="text-red-600"
          bgColor="bg-red-50 dark:bg-red-950/30"
        />
        <StatsCard 
          title="پیش‌نویس" 
          value={stats.draft} 
          icon={FileText}
          color="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-950/30"
        />
        <StatsCard 
          title="بدون قرارداد" 
          value={stats.noContract} 
          icon={Users}
          color="text-gray-600"
          bgColor="bg-gray-100 dark:bg-gray-800"
        />
      </div>

      {/* Filter Bar */}
      <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <CardContent className="p-4">

<div className="flex flex-wrap items-center gap-3">
  <div className="relative flex-1 min-w-[200px]">
    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      placeholder="جستجو نام کارمند، کد پرسنلی..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="pr-10 rounded-lg border-gray-200 dark:border-gray-700 focus:ring-emerald-500"
    />
  </div>
  
  {/* فیلتر نوع قرارداد */}
  <Select value={typeFilter} onValueChange={setTypeFilter}>
  <SelectTrigger className="w-[180px] rounded-lg border-gray-200 dark:border-gray-700">
    <SelectValue placeholder="نوع قرارداد" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all"> همه قرارداد ها</SelectItem>
    <SelectItem value="official">رسمی</SelectItem>
    <SelectItem value="contractual">قراردادی</SelectItem>
    <SelectItem value="probation">آزمایشی</SelectItem>
    <SelectItem value="temporary">موقت</SelectItem>
    <SelectItem value="outsource">پیمانکاری</SelectItem>
    <SelectItem value="part_time">پاره وقت</SelectItem>
  </SelectContent>
</Select>
  
  {/* فیلتر وضعیت - حذف "همه انواع" */}
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-[160px] rounded-lg border-gray-200 dark:border-gray-700">
      <SelectValue placeholder="وضعیت" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">همه وضعیت‌ها</SelectItem>
      <SelectItem value="active">فعال</SelectItem>
      <SelectItem value="expiring_soon">در شرف انقضا</SelectItem>
      <SelectItem value="no_contract">بدون قرارداد</SelectItem>
    </SelectContent>
  </Select>
</div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">کارمندی یافت نشد</h3>
          <p className="text-sm text-muted-foreground mt-1">فیلتر را تغییر دهید یا کارمند جدید ایجاد کنید</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 ml-2" />
            ایجاد قرارداد/حکم جدید
          </Button>
        </div>
      ) : (
        <>
          <Card className="border-0 shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">کارمند</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">کد پرسنلی</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">نوع قرارداد</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">تاریخ شروع</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">تاریخ پایان</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">روزهای باقیمانده</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">وضعیت</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, idx) => {
                    const rowBg = idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                    return (
                      <tr key={employee.id} className={`${rowBg} hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-800`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[10px] font-bold">
                                {employee.firstName[0]}{employee.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{employee.firstName} {employee.lastName}</span>
                              <p className="text-[10px] text-muted-foreground">{employee.department || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">
                          {toPersianDigits(employee.personnelCode)}
                        </td>
                        <td className="px-4 py-3">
                          {employee.contractType ? (
                            <Badge variant="outline" className="text-[9px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800">
                              {CONTRACT_TYPES.find(t => t.value === employee.contractType)?.label || employee.contractType}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                          {employee.startDate ? formatShamsi(employee.startDate) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                          {employee.endDate ? formatShamsi(employee.endDate) : 'نامحدود'}
                        </td>
                        <td className="px-4 py-3">
                          {employee.daysRemaining && employee.daysRemaining > 0 ? (
                            <div className="flex items-center gap-1">
                              <span className={`text-sm font-bold ${employee.daysRemaining <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {toPersianDigits(employee.daysRemaining)}
                              </span>
                              <span className="text-xs text-gray-400">روز</span>
                            </div>
                          ) : employee.contractStatus === 'active' ? (
                            <span className="text-xs text-emerald-600">نامحدود</span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(employee)}
                        </td>
                        <td className="px-4 py-3">
                          {employee.activeContract ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="w-4 h-4 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="min-w-[160px] rounded-xl">
                                <DropdownMenuItem onClick={() => setDetailContract(employee.activeContract)} className="gap-2 cursor-pointer">
                                  <Eye className="w-3.5 h-3.5" />
                                  مشاهده جزئیات
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditContract(employee.activeContract)} className="gap-2 cursor-pointer">
                                  <FileText className="w-3.5 h-3.5" />
                                  ویرایش
                                </DropdownMenuItem>
                                {employee.contractStatus === 'active' && (
                                  <>
                                    <DropdownMenuItem onClick={() => setRenewContract(employee.activeContract)} className="gap-2 text-emerald-600 cursor-pointer">
                                      <RefreshCcw className="w-3.5 h-3.5" />
                                      تمدید
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setTerminateContract(employee.activeContract)} className="gap-2 text-red-600 cursor-pointer">
                                      <XCircle className="w-3.5 h-3.5" />
                                      فسخ
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDeleteContract(employee.activeContract)} className="gap-2 text-red-600 cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs gap-1 rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => setShowCreate(true)}
                            >
                              <Plus className="w-3 h-3" />
                              ایجاد قرارداد
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Pagination */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Dialogs */}
      <ContractFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        employees={employees}
        departments={departments}
      />

      <ContractFormDialog
        open={!!editContract}
        onClose={() => setEditContract(null)}
        onSubmit={handleEdit}
        employees={employees}
        departments={departments}
        initialData={editContract}
      />

      <ContractDetailDialog
        open={!!detailContract}
        onClose={() => setDetailContract(null)}
        contract={detailContract}
      />

      <RenewDialog
        open={!!renewContract}
        onClose={() => setRenewContract(null)}
        onSubmit={handleRenew}
        contract={renewContract}
      />

      <TerminateDialog
        open={!!terminateContract}
        onClose={() => setTerminateContract(null)}
        onSubmit={handleTerminate}
        contract={terminateContract}
      />

      <AlertDialog open={!!deleteContract} onOpenChange={(open) => { if (!open) setDeleteContract(null) }}>
        <AlertDialogContent dir="rtl" className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              حذف قرارداد
            </AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف قرارداد «{deleteContract?.title}» اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-lg">انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteContract && handleDelete(deleteContract.id)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}