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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/core/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import { toast } from 'sonner'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

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

interface EmployeeArchiveProps {
  onNavigate?: (id: string) => void
  currentUser?: { role: string; employeeId?: string }
}

// ============================================
// Exit Reasons
// ============================================

const EXIT_REASONS = [
  { id: 'resignation', label: 'استعفا', icon: '📝', color: 'bg-amber-100 text-amber-600' },
  { id: 'retirement', label: 'بازنشستگی', icon: '🎂', color: 'bg-blue-100 text-blue-600' },
  { id: 'contract_end', label: 'پایان قرارداد', icon: '📄', color: 'bg-purple-100 text-purple-600' },
  { id: 'termination', label: 'اخراج', icon: '⚠️', color: 'bg-rose-100 text-rose-600' },
  { id: 'death', label: 'فوت', icon: '🕊️', color: 'bg-gray-100 text-gray-600' },
  { id: 'other', label: 'سایر', icon: '📌', color: 'bg-gray-100 text-gray-600' },
]

// ============================================
// Helper Functions
// ============================================

const getExitReasonBadge = (reason: string) => {
  const found = EXIT_REASONS.find(r => r.id === reason)
  if (found) {
    return { label: found.label, color: found.color, icon: found.icon }
  }
  return { label: reason, color: 'bg-gray-100 text-gray-600', icon: '📌' }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return formatShamsi(dateStr)
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
      className={`cursor-pointer rounded-xl p-4 bg-gradient-to-br ${color} text-white shadow-md hover:shadow-xl transition-all duration-300`}
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
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [reasonFilter, setReasonFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<ArchivedEmployee | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

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
      if (searchTerm) params.append('search', searchTerm)
      if (departmentFilter !== 'all') params.append('department', departmentFilter)
      if (reasonFilter !== 'all') params.append('exitReason', reasonFilter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
  
      const res = await fetch(`/api/employees/archived?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const employees = data.data || data.records || data
        setArchivedEmployees(Array.isArray(employees) ? employees : [])
        if (data.stats) {
          setStats(data.stats)
        } else {
          calculateStats(employees)
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
  }, [searchTerm, departmentFilter, reasonFilter, startDate, endDate])
  
  // useEffect اولیه:
  useEffect(() => {
    fetchArchivedEmployees(true)
    fetchDepartments()
  }, [])
  
  // تغییر فیلترها:
  useEffect(() => {
    if (!initialLoading) {
      fetchArchivedEmployees(false)
    }
  }, [searchTerm, departmentFilter, reasonFilter, startDate, endDate])

  const calculateStats = (employees: ArchivedEmployee[]) => {
    const currentYear = new Date().getFullYear()
    setStats({
      totalArchived: employees.length,
      contractEnd: employees.filter(e => e.exitReason === 'contract_end').length,
      resignation: employees.filter(e => e.exitReason === 'resignation').length,
      retirement: employees.filter(e => e.exitReason === 'retirement').length,
      currentYearExits: employees.filter(e => {
        const exitYear = new Date(e.exitDate).getFullYear()
        return exitYear === currentYear
      }).length
    })
  }

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

  useEffect(() => {
    fetchArchivedEmployees()
    fetchDepartments()
  }, [fetchArchivedEmployees, fetchDepartments])

  // ============================================
  // Handlers
  // ============================================

  const handleResetFilters = () => {
    setSearchTerm('')
    setDepartmentFilter('all')
    setReasonFilter('all')
    setStartDate('')
    setEndDate('')
  }

  const handleViewEmployee = (employee: ArchivedEmployee) => {
    setSelectedEmployee(employee)
    setShowDetailDialog(true)
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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" dir="rtl">
      {/* Main Card */}
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-gray-700 to-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">آرشیو کارکنان</h1>
              <p className="text-gray-300 text-sm mt-1">مدیریت کارکنان خروج کرده و بازنشسته</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetFilters}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4 ml-1" />
                حذف فیلترها
              </Button>
            </div>
          </div>
        </div>
  
        {/* Stats Cards */}
        <div className="p-5 border-b">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard
              icon={Archive}
              label="کل آرشیو شده"
              value={stats.totalArchived}
              color="from-gray-500 to-gray-600"
            />
            <StatCard
              icon={FileText}
              label="پایان قرارداد"
              value={stats.contractEnd}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={UserMinus}
              label="استعفا"
              value={stats.resignation}
              color="from-amber-500 to-amber-600"
            />
            <StatCard
              icon={UserCheck}
              label="بازنشسته"
              value={stats.retirement}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={TrendingDown}
              label="خروج سال جاری"
              value={stats.currentYearExits}
              color="from-rose-500 to-rose-600"
            />
          </div>
        </div>
  
        {/* Filters */}
        <div className="p-5 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="جستجو نام یا کد پرسنلی..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
  
            {/* Department Filter */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="واحد سازمانی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه واحدها</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
  
            {/* Exit Reason Filter */}
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger>
                <SelectValue placeholder="دلیل خروج" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دلایل</SelectItem>
                {EXIT_REASONS.map(reason => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.icon} {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
  
            {/* Date Range */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="از تاریخ"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
                dir="ltr"
              />
              <Input
                type="text"
                placeholder="تا تاریخ"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                dir="ltr"
              />
            </div>
  
            {/* Search Button */}
            <Button onClick={() => fetchArchivedEmployees(false)} className="bg-emerald-500 hover:bg-emerald-600 gap-2">
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
              اعمال فیلتر
            </Button>
          </div>
        </div>
  
        {/* Employees Table with Loading Overlay */}
        <div className="relative">
          {refreshing && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-b-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          )}
          
          <CardContent className={`p-0 ${refreshing ? 'pointer-events-none' : ''}`}>
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-16">
                <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">کارمندی یافت نشد</h3>
                <p className="text-sm text-gray-400 mt-1">با تغییر فیلترها ممکن است نتیجه پیدا کنید</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">کارمند</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">کد پرسنلی</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">آخرین سمت</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">واحد سازمانی</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">تاریخ خروج</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">دلیل خروج</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">عملیات</th>
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
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs">
                                  {emp.firstName[0]}{emp.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{emp.personnelCode}</td>
                          <td className="py-3 px-4">{emp.lastPosition || '—'}</td>
                          <td className="py-3 px-4">{emp.department || '—'}</td>
                          <td className="py-3 px-4">{formatDate(emp.exitDate)}</td>
                          <td className="py-3 px-4">
                            <Badge className={exitReason.color}>
                              {exitReason.icon} {exitReason.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600"
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
          <div className="p-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-500">
              نمایش {toPersianDigits(filteredEmployees.length)} از {toPersianDigits(archivedEmployees.length)} نفر
            </p>
          </div>
        )}
      </Card>
  
      {/* Employee Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-gray-500" />
              اطلاعات کارمند
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-lg">
                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                  <p className="text-sm text-gray-500">{selectedEmployee.personnelCode}</p>
                </div>
              </div>
  
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">آخرین سمت</p>
                  <p className="font-medium">{selectedEmployee.lastPosition || '—'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">واحد سازمانی</p>
                  <p className="font-medium">{selectedEmployee.department || '—'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">تاریخ خروج</p>
                  <p className="font-medium">{formatDate(selectedEmployee.exitDate)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">دلیل خروج</p>
                  <Badge className={getExitReasonBadge(selectedEmployee.exitReason).color}>
                    {getExitReasonBadge(selectedEmployee.exitReason).icon} {getExitReasonBadge(selectedEmployee.exitReason).label}
                  </Badge>
                </div>
              </div>
  
              {selectedEmployee.employmentDate && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">تاریخ استخدام</p>
                  <p className="font-medium">{formatDate(selectedEmployee.employmentDate)}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}