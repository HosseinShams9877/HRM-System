'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Edit, XCircle, CheckCircle, FileText, ChevronLeft, ChevronRight, Filter, X, Search} from 'lucide-react'
import { toast } from 'sonner'
import { formatShamsi, getTodayShamsi, toPersianDigits } from '@/core/lib/utils-fa'
import { Input } from '@/core/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/core/components/ui/pagination'

interface Contract {
  id: string
  employeeId: string
  type: string
  contractNumber: string
  title: string
  startDate: string
  endDate: string | null
  amount: number | null
  department: string | null
  notes: string | null
  status: string
  filePath: string | null
  approvedById: string | null
  approvedAt: string | null
  createdAt?: string
  updatedAt?: string
  variables?: {
    contractMonths?: number
    [key: string]: unknown
  }
  employee?: {
    id: string
    firstName: string
    lastName: string
    personnelCode: string
    department: string | null
    position: string | null
  }
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  [key: string]: unknown
}

interface ContractTableProps {
  contracts: Contract[]
  employees: Employee[]
  onEdit: (contract: Contract) => void
  onRefresh: () => Promise<void>
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

// ============================================
// Helper: Calculate remaining time
// ============================================

const getRemainingTime = (endDate: string | null): { text: string; isExpired: boolean } => {
  if (!endDate) return { text: 'نامحدود', isExpired: false }

  try {
    const [endYear, endMonth, endDay] = endDate.split('/').map(Number)

    const todayShamsi = getTodayShamsi()
    const todayYear = todayShamsi.year
    const todayMonth = todayShamsi.month
    const todayDay = todayShamsi.day

    const daysInMonth = (year: number, month: number): number => {
      if (month <= 6) return 31
      if (month <= 11) return 30
      const isLeap = (year % 33 === 1 || year % 33 === 5 || year % 33 === 9 ||
                      year % 33 === 13 || year % 33 === 17 || year % 33 === 21 ||
                      year % 33 === 25 || year % 33 === 29)
      return isLeap ? 30 : 29
    }

    let diffYears = endYear - todayYear
    let diffMonths = endMonth - todayMonth
    let diffDays = endDay - todayDay

    if (diffDays < 0) {
      diffMonths -= 1
      const prevMonth = endMonth - 1 < 1 ? 12 : endMonth - 1
      const prevMonthDays = daysInMonth(endYear, prevMonth)
      diffDays += prevMonthDays
    }

    if (diffMonths < 0) {
      diffYears -= 1
      diffMonths += 12
    }

    if (diffYears < 0 || (diffYears === 0 && diffMonths < 0) || (diffYears === 0 && diffMonths === 0 && diffDays < 0)) {
      return { text: 'منقضی شده', isExpired: true }
    }

    if (diffYears === 0 && diffMonths === 0 && diffDays === 0) {
      return { text: 'امروز', isExpired: false }
    }

    const parts = []
    if (diffYears > 0) parts.push(`${toPersianDigits(diffYears)} سال`)
    if (diffMonths > 0) parts.push(`${toPersianDigits(diffMonths)} ماه`)
    if (diffDays > 0) parts.push(`${toPersianDigits(diffDays)} روز`)

    return { text: parts.join(' و ') || 'امروز', isExpired: false }
  } catch {
    return { text: 'نامحدود', isExpired: false }
  }
}

export function ContractTable({
  contracts,
  employees,
  onEdit,
  onRefresh,
  page,
  totalPages,
  onPageChange
}: ContractTableProps) {
  // ============================================
  // Filter States
  // ============================================
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // ============================================
  // Filtered Contracts
  // ============================================
  const filteredContracts = contracts.filter(contract => {
    // فیلتر نوع
    if (filterType !== 'all' && contract.type !== filterType) return false

    // فیلتر وضعیت
    if (filterStatus !== 'all' && contract.status !== filterStatus) return false

    // جستجو
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      const employee = employees.find(e => e.id === contract.employeeId)
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}`.toLowerCase() : ''
      return (
        employeeName.includes(query) ||
        contract.title?.toLowerCase().includes(query) ||
        contract.contractNumber?.toLowerCase().includes(query)
      )
    }

    return true
  })

  // ============================================
  // Reset Filters
  // ============================================
  const resetFilters = () => {
    setFilterType('all')
    setFilterStatus('all')
    setSearchQuery('')
  }

  const hasActiveFilters = filterType !== 'all' || filterStatus !== 'all' || searchQuery.trim() !== ''

  // ============================================
  // Toggle Contract Status
  // ============================================
  const handleToggleStatus = async (contract: Contract) => {
    try {
      const newStatus = contract.status === 'active' ? 'expired' : 'active'

      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-status',
          status: newStatus
        }),
      })

      if (res.ok) {
        toast.success(`قرارداد با موفقیت ${newStatus === 'active' ? 'فعال' : 'غیرفعال'} شد`)

       
        if (onRefresh) {
          await onRefresh()
        }
      } else {
        const err = await res.json()
        toast.error(err.error || 'خطا در تغییر وضعیت')
      }
    } catch (error) {
      console.error('Error toggling contract status:', error)
      toast.error('خطا در ارتباط با سرور')
    }
  }

  // ============================================
  // Pagination
  // ============================================
  const ITEMS_PER_PAGE = 7
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentContracts = filteredContracts.slice(startIndex, endIndex)

  return (
    <div className="mt-8 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          لیست قراردادهای ثبت شده
        </h3>
        <span className="text-sm text-muted-foreground dark:text-gray-400">
          {filteredContracts.length} قرارداد
        </span>
      </div>

      {/* ============================================
          فیلترها و جستجو
          ============================================ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* نوع قرارداد */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs sm:text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
              <SelectValue placeholder="نوع قرارداد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="official">دائم</SelectItem>
              <SelectItem value="temporary">موقت</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* وضعیت */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs sm:text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="expired">منقضی شده</SelectItem>
              <SelectItem value="terminated">فسخ شده</SelectItem>
              <SelectItem value="draft">پیش‌نویس</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* جستجو */}
        <div className="relative flex-1 w-full sm:w-auto min-w-[150px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground dark:text-gray-500" />
          <Input
            placeholder="جستجوی نام، عنوان، شماره..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8 sm:pr-10 h-9 text-xs sm:text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* دکمه پاک کردن فیلترها */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs sm:text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 h-9 px-3"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
            پاک کردن فیلترها
          </Button>
        )}
      </div>

      {/* ============================================
          جدول
          ============================================ */}
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-white dark:bg-gray-900">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 transition-all duration-300 pb-1">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 sticky top-0 z-10">
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200">کارمند</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200">نوع قرارداد</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200">تاریخ شروع</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200">تاریخ پایان</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200">زمان باقیمانده</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200">وضعیت</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {currentContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground dark:text-gray-400">
                    {hasActiveFilters ? 'هیچ قراردادی با فیلترهای انتخاب شده یافت نشد' : 'هیچ قراردادی ثبت نشده است'}
                  </td>
                </tr>
              ) : (
                currentContracts.map((contract, idx) => {
                  const employee = employees.find(e => e.id === contract.employeeId)
                  const isPermanent = contract.type === 'official'
                  const isActive = contract.status === 'active'
                  const remaining = getRemainingTime(contract.endDate)

                  return (
                    <tr key={contract.id} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-150 ${
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                    }`}>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6 sm:w-7 sm:h-7">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[8px] sm:text-[9px] font-bold">
                              {employee?.firstName?.[0] || '?'}{employee?.lastName?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[80px] sm:max-w-none">
                            {employee ? `${employee.firstName} ${employee.lastName}` : 'نامشخص'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <Badge className={`${isPermanent ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'} border-0 rounded-full px-2 py-0.5 text-[8px] sm:text-[10px]`}>
                          {isPermanent ? 'دائم' : 'موقت'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{formatShamsi(contract.startDate)}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {contract.endDate ? formatShamsi(contract.endDate) : 'نامحدود'}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                        {isPermanent ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">نامحدود</span>
                        ) : remaining.isExpired ? (
                          <span className="text-red-500 dark:text-red-400">منقضی شده</span>
                        ) : (
                          <span className="font-medium text-gray-800 dark:text-gray-200">{remaining.text}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <Badge className={`${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'
                        } border-0 rounded-full px-2 py-0.5 text-[8px] sm:text-[10px]`}>
                          {isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                            onClick={() => onEdit(contract)}
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                            onClick={() => handleToggleStatus(contract)}
                          >
                            {isActive ? <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ============================================
          Pagination
          ============================================ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-4">
          <Pagination dir="rtl">
            <PaginationContent className="flex gap-1 sm:gap-2">
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 sm:h-9 sm:px-4 text-xs sm:text-sm gap-1 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  قبلی
                </Button>
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => {
                  if (p === 1 || p === totalPages) return true
                  if (Math.abs(p - page) <= 1) return true
                  return false
                })
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0) {
                    const prev = arr[idx - 1]
                    if (p - prev > 1) acc.push('ellipsis')
                  }
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <span className="px-2 text-gray-400 dark:text-gray-500">...</span>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <Button
                        variant={p === page ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm ${
                          p === page
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => onPageChange(p)}
                      >
                        {toPersianDigits(p)}
                      </Button>
                    </PaginationItem>
                  )
                )}

              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 sm:h-9 sm:px-4 text-xs sm:text-sm gap-1 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                >
                  بعدی
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}