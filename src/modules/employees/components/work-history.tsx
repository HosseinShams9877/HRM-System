// src/modules/employees/components/EmployeeWorkHistory.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, User, Calendar, Briefcase, FileText, Clock, 
  Plus, Filter, ChevronLeft, ChevronRight, Download,
  Edit, Trash2, CheckCircle, XCircle, Building2, Award ,Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
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
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

// ============================================
// Types
// ============================================

interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  position: string
  department: string
  employmentDate: string
  employmentStatus: 'active' | 'inactive' | 'probation'
  avatar?: string
}

interface WorkHistory {
  id: string
  employeeId: string
  startDate: string
  endDate: string | null
  position: string
  department: string
  description: string
  isCurrent: boolean
}

interface EmployeeWorkHistoryProps {
  onNavigate?: (id: string) => void
  currentUser?: { role: string; employeeId?: string }
}

// ============================================
// Helper Functions
// ============================================

const getStatusBadge = (status: string) => {
    console.log('Getting badge for status:', status) // برای دیباگ
    
    switch (status) {
      case 'active':
      case 'فعال':
        return { label: 'فعال', color: 'bg-emerald-100 text-emerald-600' }
      case 'inactive':
      case 'غیرفعال':
        return { label: 'غیرفعال', color: 'bg-rose-100 text-rose-600' }
      case 'probation':
      case 'آزمایشی':
        return { label: 'آزمایشی', color: 'bg-amber-100 text-amber-600' }
      default:
        return { label: status || 'نامشخص', color: 'bg-gray-100 text-gray-600' }
    }
  }

const calculateDuration = (employmentDate: string) => {
    if (!employmentDate) return '—'
    const start = new Date(employmentDate)
    const now = new Date()
    const years = now.getFullYear() - start.getFullYear()
    const months = now.getMonth() - start.getMonth()
    
    if (years > 0) {
      return `${toPersianDigits(years)} سال و ${toPersianDigits(Math.abs(months))} ماه`
    }
    return `${toPersianDigits(Math.abs(months))} ماه`
  }
// ============================================
// Main Component
// ============================================

export function EmployeeWorkHistory({ onNavigate, currentUser }: EmployeeWorkHistoryProps) {
    console.log('EmployeeWorkHistory component loaded')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [workHistory, setWorkHistory] = useState<WorkHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkHistory | null>(null)
  const [formData, setFormData] = useState({
    position: '',
    department: '',
    startDate: '',
    endDate: '',
    description: '',
    isCurrent: false
  })

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
  // Fetch Work History
  // ============================================

  const fetchWorkHistory = useCallback(async (employeeId: string) => {
    if (!employeeId) return
    try {
      const res = await fetch(`/api/employees/${employeeId}/work-history`)
      if (res.ok) {
        const data = await res.json()
        const history = data.data || data.records || data
        setWorkHistory(Array.isArray(history) ? history : [])
      }
    } catch (error) {
      console.error('Error fetching work history:', error)
    }
  }, [])

  

  useEffect(() => {
    console.log('🟢 useEffect for fetchEmployees is RUNNING')
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    if (selectedEmployee) {
      fetchWorkHistory(selectedEmployee.id)
    }
  }, [selectedEmployee, fetchWorkHistory])

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
      const res = await fetch(`/api/employees/${selectedEmployee.id}/work-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        toast.success('سابقه شغلی با موفقیت اضافه شد')
        setShowAddDialog(false)
        setFormData({ position: '', department: '', startDate: '', endDate: '', description: '', isCurrent: false })
        fetchWorkHistory(selectedEmployee.id)
      } else {
        toast.error('خطا در افزودن سابقه شغلی')
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleDeleteWorkHistory = async (id: string) => {
    if (!confirm('آیا از حذف این سابقه شغلی اطمینان دارید؟')) return
    
    try {
      const res = await fetch(`/api/employees/${selectedEmployee?.id}/work-history/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast.success('سابقه شغلی حذف شد')
        fetchWorkHistory(selectedEmployee!.id)
      } else {
        toast.error('خطا در حذف سابقه شغلی')
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  // فیلتر کردن کارمندان بر اساس جستجو
  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.includes(searchTerm) ||
    emp.personnelCode.includes(searchTerm)
  )

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const statusBadge = selectedEmployee ? getStatusBadge(selectedEmployee.employmentStatus) : null
   // const duration = selectedEmployee ? calculateEmploymentDuration(selectedEmployee.employmentDate) : null

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" dir="rtl">
      {/* Main Card */}
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Header with Employee Selector */}
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

        {/* Employee Info Card (shown when employee selected) */}
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
                        {selectedEmployee.position}
                      </Badge>
                      <Badge className={statusBadge?.color}>
                        {statusBadge?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
  <div className="text-center">
    <p className="text-gray-500 text-xs">تاریخ استخدام</p>
    <p className="font-bold">
      {selectedEmployee.employmentDate ? formatShamsi(selectedEmployee.employmentDate) : '—'}
    </p>
  </div>
  <div className="text-center">
  <p className="text-gray-500 text-xs">مدت همکاری</p>
  <p className="font-bold text-emerald-600">
    {calculateDuration(selectedEmployee.employmentDate)}
  </p>
</div>
</div>

                {/* Add Button */}
                <Button 
                  onClick={() => setShowAddDialog(true)}
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
          ) : workHistory.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">هیچ سابقه شغلی یافت نشد</h3>
              <p className="text-sm text-gray-400 mt-1">برای این کارمند سابقه شغلی ثبت نشده است</p>
              <Button 
                variant="outline" 
                className="mt-4 gap-2"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="w-4 h-4" />
                افزودن اولین سابقه شغلی
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="w-3 h-3" />
                    همه
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Award className="w-3 h-3" />
                    جاری
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {toPersianDigits(workHistory.length)} سابقه شغلی
                </p>
              </div>

              {/* Work History Cards */}
              <div className="space-y-3">
                {workHistory.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-emerald-600" />
                          </div>
                          <h3 className="text-base font-bold text-gray-800">{item.position}</h3>
                          {item.isCurrent && (
                            <Badge className="bg-emerald-100 text-emerald-600">جاری</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{item.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatShamsi(item.startDate)} - {item.endDate ? formatShamsi(item.endDate) : 'اکنون'}</span>
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-amber-600"
                          onClick={() => {
                            setEditingItem(item)
                            setFormData({
                              position: item.position,
                              department: item.department,
                              startDate: item.startDate,
                              endDate: item.endDate || '',
                              description: item.description || '',
                              isCurrent: item.isCurrent
                            })
                            setShowAddDialog(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-rose-600"
                          onClick={() => handleDeleteWorkHistory(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
              <Label htmlFor="isCurrent">سمت جاری</Label>
            </div>
            
            <div className="space-y-2">
              <Label>توضیحات</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg min-h-[100px]"
                placeholder="شرح وظایف و مسئولیت‌ها..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false)
              setEditingItem(null)
              setFormData({ position: '', department: '', startDate: '', endDate: '', description: '', isCurrent: false })
            }}>
              انصراف
            </Button>
            <Button onClick={handleAddWorkHistory} className="bg-emerald-500 hover:bg-emerald-600">
              {editingItem ? 'ویرایش' : 'افزودن'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}