'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users, Download, UserPlus, CheckCircle2, XCircle,
  Shield, AlertCircle, Loader2, AlertTriangle, Copy,
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Skeleton } from '@/core/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { useToast } from '@/core/hooks/use-toast'
import { toast as sonnerToast } from 'sonner'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { exportToCSV } from '../lib/export-utils'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { EmployeeProfile } from './employee-profile'
import type { Employee, NewAccountInfo, PaginationInfo } from '../index'
import { CSV_COLUMNS, getEmployeeCSVData } from '../constants'
import { EmployeeFilters } from './employee-filters'
import { EmployeeTable } from './employee-table'
import { EmployeeWizard } from './employee-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'


interface EmployeesModuleProps {
  onNavigate?: (id: string) => void
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
// Skeleton Loading Components
// ============================================

function SkeletonCard() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-7 w-7 rounded" />
        </div>
        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      <td className="px-3 py-3"><Skeleton className="w-4 h-4 rounded" /></td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </td>
      <td className="px-3 py-3"><Skeleton className="h-3 w-12" /></td>
      <td className="px-3 py-3"><Skeleton className="h-3 w-20" /></td>
      <td className="px-3 py-3"><Skeleton className="h-3 w-16" /></td>
      <td className="px-3 py-3"><Skeleton className="h-3 w-20" /></td>
      <td className="px-3 py-3"><Skeleton className="h-5 w-12 rounded-full" /></td>
      <td className="px-3 py-3"><Skeleton className="h-7 w-7 rounded" /></td>
    </tr>
  )
}

// ============================================
// Account Created Dialog
// ============================================

function AccountCreatedDialog({
  open,
  onClose,
  accountInfo,
}: {
  open: boolean
  onClose: () => void
  accountInfo: NewAccountInfo | null
}) {
  const { toast } = useToast()

  if (!accountInfo) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: `${label} کپی شد`, duration: 2000 })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            حساب کاربری ایجاد شد
          </DialogTitle>
          <DialogDescription>
            رمز عبور فقط یکبار نمایش داده می‌شود. لطفاً آن را ذخیره کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">مهم!</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              این رمز عبور دیگر نمایش داده نخواهد شد. حتماً آن را یادداشت کنید.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <span className="text-xs text-muted-foreground">ایمیل سازمانی</span>
                <p className="text-sm font-medium font-mono" dir="ltr">{accountInfo.email}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => copyToClipboard(accountInfo.email, 'ایمیل')}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <span className="text-xs text-muted-foreground">رمز عبور</span>
                <p className="text-sm font-bold font-mono text-emerald-600" dir="ltr">{accountInfo.password}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => copyToClipboard(accountInfo.password, 'رمز عبور')}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">نقش</span>
              <p className="text-sm font-medium">
                {accountInfo.role === 'admin' ? 'مدیر سیستم' :
                 accountInfo.role === 'hr_manager' ? 'مدیر منابع انسانی' :
                 accountInfo.role === 'manager' ? 'مدیر' : 'کارمند'}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            متوجه شدم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Main Employees Module — Thin Orchestrator
// ============================================

export function EmployeesModule({ onNavigate }: EmployeesModuleProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null)
  const [accountInfo, setAccountInfo] = useState<NewAccountInfo | null>(null)
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const { toast } = useToast()

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employees', page, debouncedSearch, departmentFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (departmentFilter && departmentFilter !== 'all') params.set('department', departmentFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
  
      const res = await fetch(`/api/employees?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const result = await res.json()
      return {
        employees: Array.isArray(result) ? result : (result.data || []),
        pagination: result.pagination || null
      }
    },
    staleTime: 5000, // 5 ثانیه داده کش بشه
  })
  const employees = data?.employees || []
  const loading = isLoading
  const error = isError
  const pagination = data?.pagination || null



  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, departmentFilter, statusFilter])

  // Get unique departments for filter
  const departments = [...new Set(employees.map(e => e.departmentName).filter(Boolean))] as string[]
  // Toggle select
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(employees.map(e => e.id))
    }
  }

  // View employee profile
  const handleViewEmployee = (emp: Employee) => {
    sessionStorage.setItem('selectedEmployee', JSON.stringify(emp))
    onNavigate?.('org-employee')
  }

  // Edit employee
const handleEditEmployee = (emp: Employee) => {
  sessionStorage.setItem('editEmployee', JSON.stringify(emp))
  onNavigate?.(`employee-edit/${emp.id}`)
}
  // Delete employee
  const handleDeleteEmployee = async (emp: Employee) => {
    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: 'DELETE' })
      if (res.ok) {
        sonnerToast.success(`${emp.firstName} ${emp.lastName} غیرفعال شد`)
        queryClient.invalidateQueries({ queryKey: ['employees'] })
      }
    } catch (err) {
      sonnerToast.error('خطا در حذف کارمند')
    }
    setDeleteConfirm(null)
  }


  // Summary stats
  const totalActive = employees.filter(e => e.status === 'active').length
  const totalInactive = employees.filter(e => e.status !== 'active').length
  const withAccount = employees.filter(e => e.user).length

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-3 py-3"><Skeleton className="w-4 h-4" /></th>
                    <th className="px-3 py-3"><Skeleton className="h-3 w-24" /></th>
                    <th className="px-3 py-3"><Skeleton className="h-3 w-16" /></th>
                    <th className="px-3 py-3"><Skeleton className="h-3 w-10" /></th>
                    <th className="px-3 py-3"><Skeleton className="h-3 w-16" /></th>
                    <th className="px-3 py-3"><Skeleton className="h-3 w-12" /></th>
                    <th className="px-3 py-3"><Skeleton className="h-3 w-12" /></th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // ---- Error State ----
  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-red-50 dark:bg-red-950/30">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium">خطا در بارگذاری اطلاعات</h3>
              <p className="text-xs text-muted-foreground mt-1">لطفاً دوباره تلاش کنید</p>
            </div>
            <Button
              onClick={() => { setLoading(true); setError(false); fetchEmployees() }}
              className="gap-2"
              size="sm"
            >
              <Loader2 className="w-4 h-4" />
              تلاش مجدد
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ---- Profile View ----
  if (showProfile && selectedEmployee) {
    return (
      <EmployeeProfile
        employee={selectedEmployee}
        onBack={() => { setShowProfile(false); setSelectedEmployee(null) }}
        onRefresh={fetchEmployees}
      />
    )
  }

  // ---- Main List View ----
  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              مدیریت کارکنان
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              مدیریت و مشاهده اطلاعات پرسنلی کارکنان سازمان
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => {
              exportToCSV(
                getEmployeeCSVData(employees),
                [...CSV_COLUMNS],
                `employees-${new Date().toISOString().split('T')[0]}.csv`
              )
            }}
          >
            <Download className="w-4 h-4" />
            خروجی CSV
          </Button>
          <Button
  onClick={() => onNavigate('employee-create')}
  className="gap-2 bg-gradient-to-l from-emerald-600 to-teal-600"
>
  <UserPlus className="w-4 h-4" />
  ثبت کارمند جدید
</Button>
        </div>
      </div>

      {/* Summary Cards with Hover Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{toPersianDigits(employees.length)}</p>
              <p className="text-xs text-muted-foreground">کل کارکنان</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30">
              <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{toPersianDigits(totalActive)}</p>
              <p className="text-xs text-muted-foreground">فعال</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{toPersianDigits(totalInactive)}</p>
              <p className="text-xs text-muted-foreground">غیرفعال</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{toPersianDigits(withAccount)}</p>
              <p className="text-xs text-muted-foreground">دارای اکانت</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters with better styling */}
      <div className="bg-white dark:bg-gray-950 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <EmployeeFilters
          search={search}
          onSearchChange={setSearch}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          departments={departments}
          selectedCount={selectedIds.length}
        />
      </div>

      {/* Employee List */}
      <EmployeeTable
        employees={employees}
        viewMode={viewMode}
        selectedIds={selectedIds}
        onSelect={handleViewEmployee}
        onEdit={handleEditEmployee}
        onDelete={(e) => setDeleteConfirm(e)}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onAddNew={() => { setEditingEmployee(null); setShowForm(true) }}
        page={page}
        onPageChange={setPage}
        pagination={pagination}
      />

{showForm && (
  <EmployeeWizard
    employeeId={editingEmployee?.id}
    onSuccess={() => {
      setShowForm(false)
      setEditingEmployee(null)
      // این خط باعث میشه کش قدیمی بشه و دیتای جدید از سرور گرفته بشه
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }}
    onCancel={() => {
      setShowForm(false)
      setEditingEmployee(null)
    }}
  />
)}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="تایید حذف"
        description={`آیا از غیرفعال کردن ${deleteConfirm?.firstName} ${deleteConfirm?.lastName} اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
        confirmText="غیرفعال کردن"
        variant="destructive"
        onConfirm={() => deleteConfirm && handleDeleteEmployee(deleteConfirm)}
      />

      {/* Account Created Dialog */}
      <AccountCreatedDialog
        open={showAccountDialog}
        onClose={() => { setShowAccountDialog(false); setAccountInfo(null) }}
        accountInfo={accountInfo}
      />
    </div>
  )
}
