// src/modules/employees/components/EmployeeArchive.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Calendar, Briefcase, FileText, Clock,
  Filter, Download, Eye, UserX, Users, UserMinus,
  UserCheck, CalendarOff, Building2, Award, Loader2,
  ChevronLeft, ChevronRight, X, TrendingDown, Archive
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import { toast } from 'sonner'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'

// ============================================
// Types
// ============================================

interface ArchivedEmployee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  lastPosition: string
  department: string
  exitDate: string
  exitReason: 'resignation' | 'retirement' | 'contract_end' | 'termination' | 'death' | 'other'
  status: 'archived'
  employmentDate?: string
}

interface ArchiveStats {
  totalArchived: number
  contractEnd: number
  resignation: number
  retirement: number
  currentYearExits: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface EmployeeArchiveProps {
  onNavigate?: (id: string) => void
  currentUser?: { role: string; employeeId?: string }
}

// ============================================
// Exit Reasons
// ============================================

const EXIT_REASONS = [
  { id: 'resignation', label: 'استعفا', icon: '📝', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'retirement', label: 'بازنشستگی', icon: '🎂', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'contract_end', label: 'پایان قرارداد', icon: '📄', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: 'termination', label: 'اخراج', icon: '⚠️', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300' },
  { id: 'death', label: 'فوت', icon: '🕊️', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300' },
  { id: 'other', label: 'سایر', icon: '📌', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300' },
]

// ============================================
// Helper Functions
// ============================================

const convertToPersianDate = (dateString: string | Date): string => {
  if (!dateString) return ''
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return ''
  
  const persianDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  
  return toPersianDigits(persianDate)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return convertToPersianDate(dateStr)
}

const getExitReasonBadge = (reason: string) => {
  const found = EXIT_REASONS.find(r => r.id === reason)
  if (found) {
    return { label: found.label, color: found.color, icon: found.icon }
  }
  return { label: reason, color: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300', icon: '📌' }
}

// ============================================
// Stat Card Component
// ============================================

function StatCard({ icon: Icon, label, value, color, onClick }: any) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-4 bg-gradient-to-br ${color} text-white shadow-md hover:shadow-xl transition-all duration-300 dark:shadow-gray-900/30`}
    >
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 opacity-80" />
        <span className="text-2xl font-bold">{toPersianDigits(value)}</span>
      </div>
      <p className="text-sm font-medium mt-2 opacity-90">{label}</p>
    </motion.div>
  )
}

// ============================================
// Pagination Component
// ============================================

function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}) {
  const { page, totalPages } = pagination

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function EmployeeArchive({ onNavigate, currentUser }: EmployeeArchiveProps) {
  const [archivedEmployees, setArchivedEmployees] = useState<ArchivedEmployee[]>([])
  const [stats, setStats] = useState<ArchiveStats>({
    totalArchived: 0,
    contractEnd: 0,
    resignation: 0,
    retirement: 0,
    currentYearExits: 0
  })
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [reasonFilter, setReasonFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<ArchivedEmployee | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // State برای نگهداری نام سمت و دپارتمان
  const [positionNames, setPositionNames] = useState<Record<string, string>>({})
  const [departmentNames, setDepartmentNames] = useState<Record<string, string>>({})

  // ============================================
  // Fetch Data
  // ============================================

  const fetchArchivedEmployees = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true)
      } else {
        setRefreshing(true)
      }
      
      const params = new URLSearchParams()
      params.set('page', String(pagination.page))
      params.set('limit', String(pagination.limit))
      if (searchTerm) params.append('search', searchTerm)
      if (departmentFilter !== 'all') params.append('department', departmentFilter)
      if (reasonFilter !== 'all') params.append('exitReason', reasonFilter)
      
      if (startDate) {
        const year = startDate.getFullYear()
        const month = String(startDate.getMonth() + 1).padStart(2, '0')
        const day = String(startDate.getDate()).padStart(2, '0')
        params.append('startDate', `${year}/${month}/${day}`)
      }
      if (endDate) {
        const year = endDate.getFullYear()
        const month = String(endDate.getMonth() + 1).padStart(2, '0')
        const day = String(endDate.getDate()).padStart(2, '0')
        params.append('endDate', `${year}/${month}/${day}`)
      }
  
      const res = await fetch(`/api/employees/archived?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const employees = data.data || data.records || data
        
        if (Array.isArray(employees)) {
          if (pagination.page === 1) {
            setArchivedEmployees(employees)
          } else {
            setArchivedEmployees(prev => [...prev, ...employees])
          }
        }
        
        if (data.pagination) {
          setPagination(data.pagination)
        }
        
        if (isInitial && data.stats) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      if (isInitial) {
        setInitialLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }, [searchTerm, departmentFilter, reasonFilter, startDate, endDate, pagination.page, pagination.limit])

  // ============================================
  // Fetch Position & Department Names
  // ============================================

  const fetchPositionNames = useCallback(async () => {
    try {
      const res = await fetch('/api/positions?status=active')
      if (res.ok) {
        const data = await res.json()
        const positions = data.data || data
        
        const namesMap: Record<string, string> = {}
        if (Array.isArray(positions)) {
          positions.forEach((pos: any) => {
            namesMap[pos.id] = pos.title || pos.name || pos.id
          })
        }
        setPositionNames(namesMap)
      }
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }, [])

  const fetchDepartmentNames = useCallback(async () => {
    try {
      const res = await fetch('/api/departments?status=active')
      if (res.ok) {
        const data = await res.json()
        const departments = data.data || data
        
        const namesMap: Record<string, string> = {}
        if (Array.isArray(departments)) {
          departments.forEach((dept: any) => {
            namesMap[dept.id] = dept.name || dept.title || dept.id
          })
        }
        setDepartmentNames(namesMap)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }, [])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        const deptList = data.data || data.records || data
        setDepartments(Array.isArray(deptList) ? deptList : [])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }, [])

  // ============================================
  // Effects
  // ============================================

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchArchivedEmployees(true),
        fetchDepartments(),
        fetchPositionNames(),
        fetchDepartmentNames()
      ])
    }
    init()
  }, [])

  // تغییر فیلترها → ریست صفحه به ۱
  useEffect(() => {
    if (!initialLoading) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [searchTerm, departmentFilter, reasonFilter, startDate, endDate])

  // تغییر صفحه → fetch دوباره
  useEffect(() => {
    if (!initialLoading && pagination.page > 0) {
      fetchArchivedEmployees(false)
    }
  }, [pagination.page])

  // ============================================
  // Helper Functions for Display Names
  // ============================================

  const getPositionName = (id: string) => {
    if (!id) return 'نامشخص'
    return positionNames[id] || id
  }

  const getDepartmentName = (id: string) => {
    if (!id) return 'نامشخص'
    return departmentNames[id] || id
  }

  // ============================================
  // Handlers
  // ============================================

  const handleResetFilters = () => {
    setSearchTerm('')
    setDepartmentFilter('all')
    setReasonFilter('all')
    setStartDate(null)
    setEndDate(null)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleViewEmployee = (employee: ArchivedEmployee) => {
    setSelectedEmployee(employee)
    setShowDetailDialog(true)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const filteredEmployees = archivedEmployees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.includes(searchTerm) ||
    emp.personnelCode.includes(searchTerm)
  )

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }
  
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen" dir="rtl">
      {/* Main Card */}
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden dark:bg-gray-950/50">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">آرشیو کارکنان</h1>
              <p className="text-gray-300 dark:text-gray-400 text-sm mt-1">مدیریت کارکنان خروج کرده و بازنشسته</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetFilters}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-700/50"
              >
                <X className="w-4 h-4 ml-1" />
                حذف فیلترها
              </Button>
            </div>
          </div>
        </div>
  
        {/* Stats Cards */}
        <div className="p-5 border-b dark:border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard
              icon={Archive}
              label="کل آرشیو شده"
              value={stats.totalArchived}
              color="from-gray-500 to-gray-600 dark:from-gray-700 dark:to-gray-800"
            />
            <StatCard
              icon={FileText}
              label="پایان قرارداد"
              value={stats.contractEnd}
              color="from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800"
            />
            <StatCard
              icon={UserMinus}
              label="استعفا"
              value={stats.resignation}
              color="from-amber-500 to-amber-600 dark:from-amber-700 dark:to-amber-800"
            />
            <StatCard
              icon={UserCheck}
              label="بازنشسته"
              value={stats.retirement}
              color="from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800"
            />
            <StatCard
              icon={TrendingDown}
              label="خروج سال جاری"
              value={stats.currentYearExits}
              color="from-rose-500 to-rose-600 dark:from-rose-700 dark:to-rose-800"
            />
          </div>
        </div>
  
        {/* ✅ Filters با PersianDatePicker - دارک مود */}
        <div className="p-5 border-b bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Department */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
  <SelectTrigger>
    <SelectValue placeholder="واحد سازمانی" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">همه واحدها</SelectItem>
    {departments.map(dept => (
      <SelectItem key={dept.id} value={dept.name}>  {/* ← value=name */}
        {dept.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

            {/* Exit Reason */}
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="dark:bg-gray-950 dark:border-gray-700 dark:text-gray-200">
                <SelectValue placeholder="دلیل خروج" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-950 dark:border-gray-700">
                <SelectItem value="all">همه دلایل</SelectItem>
                {EXIT_REASONS.map(reason => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.icon} {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* ✅ Date Range */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-1">
                <div className="flex-1">
                  <PersianDatePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="از تاریخ"
                  />
                </div>
                <span className="text-gray-400 dark:text-gray-500 text-xs px-1">تا</span>
                <div className="flex-1">
                  <PersianDatePicker
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="تا تاریخ"
                  />
                </div>
                <Button 
                  onClick={() => {
                    setPagination(prev => ({ ...prev, page: 1 }))
                    fetchArchivedEmployees(false)
                  }} 
                  className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 gap-1 whitespace-nowrap px-3"
                  size="sm"
                >
                  {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                  اعمال
                </Button>
              </div>
            </div>
          </div>
        </div>
  
        {/* Employees Table with Loading Overlay */}
        <div className="relative">
          {refreshing && (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-950/60 z-10 flex items-center justify-center rounded-b-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          )}
          
          <CardContent className={`p-0 ${refreshing ? 'pointer-events-none' : ''}`}>
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-16 dark:bg-gray-950/30">
                <UserX className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">کارمندی یافت نشد</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">با تغییر فیلترها ممکن است نتیجه پیدا کنید</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm dark:bg-gray-950/30">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800">
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">کارمند</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">کد پرسنلی</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">آخرین سمت</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">واحد سازمانی</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">تاریخ خروج</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">دلیل خروج</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, idx) => {
                      const exitReason = getExitReasonBadge(emp.exitReason)
                      return (
                        <motion.tr
                          key={emp.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 dark:bg-gray-700">
                                <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs dark:from-gray-600 dark:to-gray-700">
                                  {emp.firstName[0]}{emp.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{emp.firstName} {emp.lastName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{emp.personnelCode}</td>
                          <td className="py-3 px-4 dark:text-gray-300">
                            {getPositionName(emp.lastPosition)}
                          </td>
                          <td className="py-3 px-4 dark:text-gray-300">
                            {getDepartmentName(emp.department)}
                          </td>
                          <td className="py-3 px-4 dark:text-gray-300">{formatDate(emp.exitDate)}</td>
                          <td className="py-3 px-4">
                            <Badge className={`${exitReason.color} dark:border-0`}>
                              {exitReason.icon} {exitReason.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/30"
                              onClick={() => handleViewEmployee(emp)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </div>
  
        {/* Footer with pagination */}
        {filteredEmployees.length > 0 && (
          <div className="p-4 border-t dark:border-gray-800 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              نمایش {toPersianDigits(filteredEmployees.length)} از {toPersianDigits(archivedEmployees.length)} نفر
            </p>
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
  
      {/* Employee Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md dark:bg-gray-950 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-gray-200">
              <UserX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              اطلاعات کارمند
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <Avatar className="w-16 h-16 dark:bg-gray-700">
                  <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-lg dark:from-gray-600 dark:to-gray-700">
                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold dark:text-gray-200">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEmployee.personnelCode}</p>
                </div>
              </div>
  
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">آخرین سمت</p>
                  <p className="font-medium dark:text-gray-300">{getPositionName(selectedEmployee.lastPosition)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">واحد سازمانی</p>
                  <p className="font-medium dark:text-gray-300">{getDepartmentName(selectedEmployee.department)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">تاریخ خروج</p>
                  <p className="font-medium dark:text-gray-300">{formatDate(selectedEmployee.exitDate)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">دلیل خروج</p>
                  <Badge className={`${getExitReasonBadge(selectedEmployee.exitReason).color} dark:border-0`}>
                    {getExitReasonBadge(selectedEmployee.exitReason).icon} {getExitReasonBadge(selectedEmployee.exitReason).label}
                  </Badge>
                </div>
              </div>
  
              {selectedEmployee.employmentDate && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">تاریخ استخدام</p>
                  <p className="font-medium dark:text-gray-300">{formatDate(selectedEmployee.employmentDate)}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}