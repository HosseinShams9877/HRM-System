// src/modules/employees/components/EmployeeWorkHistory.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, User, Calendar, Briefcase, FileText, Clock,
  Plus, Filter, ChevronLeft, ChevronRight, Download,
  Edit, Trash2, CheckCircle, XCircle, Building2, Award, Loader2
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
  DialogFooter,
} from '@/core/components/ui/dialog'
import { toast } from 'sonner'
import { toPersianDigits } from '@/core/lib/utils-fa'

// ============================================
// Hooks
// ============================================
import {
  useWorkHistory,
  useCreateWorkHistory,
  useUpdateWorkHistory,
  useDeleteWorkHistory,
  type WorkHistory,
  type WorkHistoryFormData,
} from '../hooks/use-work-history'

// ============================================
// Types
// ============================================

interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  position: string
  positionId?: string
  positionName?: string
  department: string
  departmentId?: string
  departmentName?: string
  employmentDate: string
  status: 'active' | 'inactive' | 'probation'
  avatar?: string
  updatedAt?: string
}

interface WorkHistoryWithNames extends WorkHistory {
  positionName?: string
  departmentName?: string
}

interface EmployeeWorkHistoryProps {
  onNavigate?: (id: string) => void
  currentUser?: { role: string; employeeId?: string }
}

// ============================================
// Helper Functions
// ============================================

// تبدیل تاریخ میلادی به شمسی (فقط تاریخ)
// src/modules/employees/components/EmployeeArchive.tsx

// ============================================
// Helper Functions
// ============================================

// تبدیل تاریخ میلادی به شمسی با اعداد فارسی
const convertToPersianDate = (dateString: string | Date): string => {
  if (!dateString) return ''
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return ''
  
  const persianDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  
  // ✅ تبدیل اعداد انگلیسی به فارسی
  return toPersianDigits(persianDate)
}

// فرمت تاریخ برای نمایش
const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return convertToPersianDate(dateStr)
}

// فرمت کردن description با تاریخ شمسی
const formatDescriptionDate = (description: string): string => {
  if (!description) return description
  
  const datePattern = /\d{4}\/\d{2}\/\d{2}/
  const match = description.match(datePattern)
  
  if (match) {
    const miladiDate = match[0]
    const persianDate = convertToPersianDate(miladiDate)
    return description.replace(miladiDate, persianDate)
  }
  
  return description
}

// دریافت نام برای نمایش (اسم یا ID)
const getDisplayName = (id: string, namesMap: Record<string, string>, fallback?: string): string => {
  if (!id) return fallback || 'نامشخص'
  if (namesMap[id]) return namesMap[id]
  return id
}

const getStatusBadge = (status: string) => {
  if (!status) return { label: 'نامشخص', color: 'bg-gray-100 text-gray-600' }
  
  const normalized = status.toLowerCase().trim()
  
  switch (normalized) {
    case 'active':
      return { label: 'فعال', color: 'bg-emerald-100 text-emerald-600' }
    case 'inactive':
      return { label: 'غیرفعال', color: 'bg-rose-100 text-rose-600' }
    case 'probation':
      return { label: 'آزمایشی', color: 'bg-amber-100 text-amber-600' }
    case 'suspended':
      return { label: 'معلق', color: 'bg-orange-100 text-orange-600' }
    default:
      return { label: status || 'نامشخص', color: 'bg-gray-100 text-gray-600' }
  }
}

const calculateDuration = (employmentDate: string, endDate?: string | null) => {
  if (!employmentDate) return '—'
  const start = new Date(employmentDate)
  const end = endDate ? new Date(endDate) : new Date()
  const years = end.getFullYear() - start.getFullYear()
  const months = end.getMonth() - start.getMonth()

  if (years > 0) {
    return `${toPersianDigits(years)} سال و ${toPersianDigits(Math.abs(months))} ماه`
  }
  return `${toPersianDigits(Math.abs(months))} ماه`
}

const getSourceLabel = (source: string) => {
  switch (source) {
    case 'MANUAL':
      return 'دستی'
    case 'PROMOTION':
      return 'ارتقا'
    case 'TRANSFER':
      return 'انتقال'
    case 'DEMOTION':
      return 'تنزل مقام'
    case 'REACTIVATION':
      return 'بازگشت به کار'
    case 'SYSTEM':
      return 'سیستمی'
    case 'HIRE':
      return 'استخدام'
    case 'TERMINATION':
      return 'پایان همکاری'
    default:
      return source
  }
}

// ============================================
// Main Component
// ============================================

export function EmployeeWorkHistory({ onNavigate, currentUser }: EmployeeWorkHistoryProps) {
  console.log('EmployeeWorkHistory component loaded')

  // ============================================
  // State
  // ============================================
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkHistory | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'current'>('all')
  const [formData, setFormData] = useState<WorkHistoryFormData>({
    position: '',
    department: '',
    startDate: '',
    endDate: '',
    description: '',
    isCurrent: false,
  })

  // State برای نگهداری نام سمت و دپارتمان
  const [positionNames, setPositionNames] = useState<Record<string, string>>({})
  const [departmentNames, setDepartmentNames] = useState<Record<string, string>>({})

  // ============================================
  // React Query Hooks
  // ============================================

  const {
    data: workHistory = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useWorkHistory(selectedEmployee?.id)

  const createMutation = useCreateWorkHistory()
  const updateMutation = useUpdateWorkHistory()
  const deleteMutation = useDeleteWorkHistory()

  // ============================================
  // Fetch Employees
  // ============================================
  useEffect(() => {
    console.log('1. employees state:', employees)
    console.log('2. loading state:', loading)
    console.log('3. selectedEmployee:', selectedEmployee)
  }, [employees, loading, selectedEmployee])

  const fetchEmployees = useCallback(async () => {
    console.log('🟡 INSIDE fetchEmployees - START')
    try {
      console.log('🟡 Calling API: /api/employees')
      const res = await fetch('/api/employees')
      console.log('🟡 Response status:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('🟡 Data received:', data)
        const empList = data.data || data.records || data
        setEmployees(Array.isArray(empList) ? empList : [])
        setLoading(false)
      } else {
        console.log('🔴 Response not ok:', res.status)
        setLoading(false)
      }
    } catch (error) {
      console.error('🔴 Error fetching employees:', error)
      setLoading(false)
    }
  }, [])

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
        console.log('✅ Position names loaded:', Object.keys(namesMap).length)
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
        console.log('✅ Department names loaded:', Object.keys(namesMap).length)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }, [])

  // ============================================
  // Effects
  // ============================================

  useEffect(() => {
    console.log('🟢 useEffect for fetchEmployees is RUNNING')
    
    const init = async () => {
      await Promise.all([
        fetchEmployees(),
        fetchPositionNames(),
        fetchDepartmentNames()
      ])
    }
    
    init()
  }, [fetchEmployees, fetchPositionNames, fetchDepartmentNames])

  useEffect(() => {
    if (selectedEmployee) {
      refetchHistory()
    }
  }, [selectedEmployee, refetchHistory])

  // ============================================
  // Handlers
  // ============================================

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId)
    setSelectedEmployee(emp || null)
  }

  const handleAddWorkHistory = async () => {
    if (!selectedEmployee) return

    try {
      await createMutation.mutateAsync({
        employeeId: selectedEmployee.id,
        data: {
          ...formData,
          source: 'MANUAL',
        },
      })
      toast.success('سابقه شغلی با موفقیت اضافه شد')
      setShowAddDialog(false)
      resetForm()
      refetchHistory()
    } catch (error) {
      // خطا توسط toast در hook مدیریت میشه
    }
  }

  const handleEditWorkHistory = async () => {
    if (!selectedEmployee || !editingItem) return

    try {
      await updateMutation.mutateAsync({
        employeeId: selectedEmployee.id,
        historyId: editingItem.id,
        data: formData,
      })
      toast.success('سابقه شغلی با موفقیت ویرایش شد')
      setShowAddDialog(false)
      setEditingItem(null)
      resetForm()
      refetchHistory()
    } catch (error) {
      // خطا توسط toast در hook مدیریت میشه
    }
  }

  const handleDeleteWorkHistory = async (id: string) => {
    if (!selectedEmployee) return
    if (!confirm('آیا از حذف این سابقه شغلی اطمینان دارید؟')) return

    try {
      await deleteMutation.mutateAsync({
        employeeId: selectedEmployee.id,
        historyId: id,
      })
      refetchHistory()
    } catch (error) {
      // خطا توسط toast در hook مدیریت میشه
    }
  }

  const resetForm = () => {
    setFormData({
      position: '',
      department: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrent: false,
    })
  }

  // ✅ باز کردن دیالوگ افزودن - فرم خالی
  const openAddDialog = () => {
    setEditingItem(null)
    resetForm()
    setShowAddDialog(true)
  }

  // ✅ باز کردن دیالوگ ویرایش - پر کردن با اطلاعات سابقه
  const openEditDialog = (item: WorkHistory) => {
    setEditingItem(item)
    setFormData({
      position: getDisplayName(item.position, positionNames, item.position),  // ← نام
      department: getDisplayName(item.department, departmentNames, item.department),  // ← نام
      startDate: item.startDate ? convertToPersianDate(item.startDate) : '',
      endDate: item.endDate ? convertToPersianDate(item.endDate) : '',
      description: item.description || '',
      isCurrent: item.isCurrent,
    })
    setShowAddDialog(true)
  }
  // فیلتر کردن سوابق
  const filteredHistory = filterType === 'current'
    ? workHistory.filter(item => item.isCurrent)
    : workHistory

  // فیلتر کردن کارمندان بر اساس جستجو
  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.includes(searchTerm) ||
    emp.personnelCode.includes(searchTerm)
  )

  // ============================================
  // Loading State
  // ============================================

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const statusBadge = selectedEmployee ? getStatusBadge(selectedEmployee.status) : null

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" dir="rtl">
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">سوابق شغلی</h1>
              <p className="text-emerald-100 text-sm mt-1">مشاهده و مدیریت سوابق شغلی کارکنان</p>
            </div>

            {/* Employee Selector */}
            <div className="w-full md:w-96">
              <Select onValueChange={handleEmployeeSelect} value={selectedEmployee?.id}>
                <SelectTrigger className="bg-white border-2 border-emerald-300 text-gray-800 font-medium shadow-md hover:border-emerald-400 transition-all">
                  <SelectValue placeholder="🔍 انتخاب کارمند..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 sticky top-0 bg-white border-b">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="جستجو بر اساس نام یا کد پرسنلی..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 border-emerald-200 focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        کارمندی یافت نشد
                      </div>
                    ) : (
                      filteredEmployees.map(emp => (
                        <SelectItem
                          key={emp.id}
                          value={emp.id}
                          className="cursor-pointer hover:bg-emerald-50 data-[state=checked]:bg-emerald-100"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-emerald-500 text-white text-[10px]">
                                  {emp.firstName[0]}{emp.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{emp.firstName} {emp.lastName}</span>
                            </div>
                            <span className="text-xs text-gray-400">{emp.personnelCode}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <AnimatePresence mode="wait">
          {selectedEmployee && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-5 border-b"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-lg">
                      {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="secondary" className="gap-1">
                        <FileText className="w-3 h-3" />
                        {selectedEmployee.personnelCode}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Briefcase className="w-3 h-3" />
                        {getDisplayName(selectedEmployee.position, positionNames, selectedEmployee.position)}
                      </Badge>
                      <Badge className={statusBadge?.color}>
                        {statusBadge?.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={openAddDialog}
                  className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  افزودن سابقه شغلی
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Work History List */}
        <CardContent className="p-5">
          {!selectedEmployee ? (
            <div className="text-center py-16">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">کارمندی را انتخاب کنید</h3>
              <p className="text-sm text-gray-400 mt-1">برای مشاهده سوابق شغلی، یک کارمند را از لیست بالا انتخاب کنید</p>
            </div>
          ) : isLoadingHistory ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : workHistory.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">هیچ سابقه شغلی یافت نشد</h3>
              <p className="text-sm text-gray-400 mt-1">برای این کارمند سابقه شغلی ثبت نشده است</p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={openAddDialog}
              >
                <Plus className="w-4 h-4" />
                افزودن اولین سابقه شغلی
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className={filterType === 'all' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                    onClick={() => setFilterType('all')}
                  >
                    <Filter className="w-3 h-3 ml-1" />
                    همه
                  </Button>
                  <Button
                    variant={filterType === 'current' ? 'default' : 'outline'}
                    size="sm"
                    className={filterType === 'current' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                    onClick={() => setFilterType('current')}
                  >
                    <Award className="w-3 h-3 ml-1" />
                    جاری
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {toPersianDigits(filteredHistory.length)} سابقه شغلی
                </p>
              </div>

              {/* Work History Cards */}
              <div className="space-y-3">
                {filteredHistory.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-emerald-600" />
                          </div>
                          <h3 className="text-base font-bold text-gray-800">
                            {getDisplayName(item.position, positionNames, item.position)}
                          </h3>
                          {item.isCurrent && (
                            <Badge className="bg-emerald-100 text-emerald-600">جاری</Badge>
                          )}
                          {item.source && (
                            <Badge variant="outline" className="text-xs">
                              {getSourceLabel(item.source)}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{getDisplayName(item.department, departmentNames, item.department)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {convertToPersianDate(item.startDate)} - {item.endDate ? convertToPersianDate(item.endDate) : 'اکنون'}
                            </span>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-2">
                            {formatDescriptionDate(item.description)}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => openEditDialog(item)}
                          disabled={createMutation.isPending || updateMutation.isPending}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => handleDeleteWorkHistory(item.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending && deleteMutation.variables === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setEditingItem(null)
          resetForm()
        }
        setShowAddDialog(open)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'ویرایش سابقه شغلی' : 'افزودن سابقه شغلی جدید'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>سمت شغلی *</Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="مثال: مدیر منابع انسانی"
              />
            </div>

            <div className="space-y-2">
              <Label>دپارتمان *</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="مثال: منابع انسانی"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاریخ شروع *</Label>
                <Input
                  type="text"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="1400/01/01"
                />
              </div>
              <div className="space-y-2">
                <Label>تاریخ پایان</Label>
                <Input
                  type="text"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  placeholder="1402/12/29"
                  disabled={formData.isCurrent}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={formData.isCurrent}
                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: '' })}
                className="w-4 h-4"
              />
              <Label htmlFor="isCurrent" className="cursor-pointer">سمت جاری</Label>
            </div>

            <div className="space-y-2">
              <Label>توضیحات</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="شرح وظایف و مسئولیت‌ها..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false)
              setEditingItem(null)
              resetForm()
            }}>
              انصراف
            </Button>
            <Button
              onClick={editingItem ? handleEditWorkHistory : handleAddWorkHistory}
              className="bg-emerald-500 hover:bg-emerald-600"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              )}
              {editingItem ? 'ویرایش' : 'افزودن'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}