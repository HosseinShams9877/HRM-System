// src/modules/orders/components/OrdersModule.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  FileBadge, FileText, CheckCircle2, Clock, AlertCircle,
  Search, Plus, Download, Loader2, Eye, Trash2, Edit,
  X, Upload, Calendar, User, Hash, File, Check, ChevronLeft, ChevronRight
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/core/components/ui/alert-dialog'
import { Skeleton } from '@/core/components/ui/skeleton'
import { toast } from 'sonner'
import { toPersianDigits, formatShamsi, getTodayShamsi } from '@/core/lib/utils-fa'
import { useDebounce } from '@/core/hooks/use-debounce'

// ============================================
// Types
// ============================================

interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
}

interface OrderRecord {
  id: string
  orderType: 'promotion' | 'transfer' | 'salary' | 'disciplinary' | 'leave' | 'termination' | 'other'
  orderNumber: string
  title: string
  description?: string
  issueDate: string
  effectiveDate: string
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'active'
  fileUrl?: string
  fileName?: string
  employeeId: string
  employee: Employee
  createdAt: string
  updatedAt: string
}

interface OrderStats {
  total: number
  executed: number
  active: number
  pending: number
}

// ============================================
// Constants
// ============================================

const ORDER_TYPES = [
  { value: 'promotion', label: 'ارتقاء شغلی', icon: '⬆️', color: 'bg-emerald-100 text-emerald-600' },
  { value: 'transfer', label: 'انتقالی', icon: '🔄', color: 'bg-blue-100 text-blue-600' },
  { value: 'salary', label: 'حقوق و مزایا', icon: '💰', color: 'bg-amber-100 text-amber-600' },
  { value: 'disciplinary', label: 'تنبیهی', icon: '⚠️', color: 'bg-rose-100 text-rose-600' },
  { value: 'leave', label: 'مرخصی', icon: '🏖️', color: 'bg-purple-100 text-purple-600' },
  { value: 'termination', label: 'پایان همکاری', icon: '🚪', color: 'bg-gray-100 text-gray-600' },
  { value: 'other', label: 'سایر', icon: '📄', color: 'bg-gray-100 text-gray-600' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'در انتظار', color: 'bg-amber-100 text-amber-600' },
  { value: 'approved', label: 'تایید شده', color: 'bg-blue-100 text-blue-600' },
  { value: 'rejected', label: 'رد شده', color: 'bg-rose-100 text-rose-600' },
  { value: 'active', label: 'در حال اجرا', color: 'bg-emerald-100 text-emerald-600' },
  { value: 'executed', label: 'اجرا شده', color: 'bg-teal-100 text-teal-600' },
]

// ============================================
// Helper Components
// ============================================

function StatsCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{toPersianDigits(value)}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrderTypeBadge({ type }: { type: string }) {
  const found = ORDER_TYPES.find(t => t.value === type)
  return (
    <Badge className={found?.color || 'bg-gray-100 text-gray-600'}>
      {found?.icon} {found?.label || type}
    </Badge>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const found = STATUS_OPTIONS.find(s => s.value === status)
  return (
    <Badge className={found?.color || 'bg-gray-100 text-gray-600'}>
      {found?.label || status}
    </Badge>
  )
}

// ============================================
// Main Component
// ============================================

export function OrdersModule() {
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
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null)
  const [exporting, setExporting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    orderType: '',
    employeeId: '',
    title: '',
    orderNumber: '',
    issueDate: '',
    effectiveDate: '',
    description: '',
    status: 'pending'
  })

  const debouncedSearch = useDebounce(search, 300)
  const ITEMS_PER_PAGE = 8

  // ============================================
  // Fetch Data
  // ============================================

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
      const res = await fetch('/api/employees?status=active')
      if (res.ok) {
        const data = await res.json()
        const empList = data.data || data.records || data
        setEmployees(Array.isArray(empList) ? empList : [])
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

  // ============================================
  // Handlers
  // ============================================

  const handleResetFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      params.set('limit', '1000')
      
      const res = await fetch(`/api/orders?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const ordersList = data.orders || data.data || []
        
        const headers = ['نوع حکم', 'نام کارمند', 'کد پرسنلی', 'عنوان حکم', 'شماره حکم', 'تاریخ صدور', 'تاریخ اجرا', 'وضعیت']
        const rows = ordersList.map((order: OrderRecord) => [
          ORDER_TYPES.find(t => t.value === order.orderType)?.label || order.orderType,
          `${order.employee.firstName} ${order.employee.lastName}`,
          order.employee.personnelCode,
          order.title,
          order.orderNumber,
          formatShamsi(order.issueDate),
          formatShamsi(order.effectiveDate),
          STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status
        ])
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.href = url
        link.setAttribute('download', `احکام_کاری_${new Date().toLocaleDateString('fa-IR')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('خروجی با موفقیت دریافت شد')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('خطا در دریافت خروجی')
    } finally {
      setExporting(false)
    }
  }

  const handleAddOrder = async () => {
    if (!formData.orderType || !formData.employeeId || !formData.title || !formData.orderNumber || !formData.issueDate || !formData.effectiveDate) {
      toast.error('لطفاً همه فیلدهای الزامی را پر کنید')
      return
    }

    setSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('orderType', formData.orderType)
      submitData.append('employeeId', formData.employeeId)
      submitData.append('title', formData.title)
      submitData.append('orderNumber', formData.orderNumber)
      submitData.append('issueDate', formData.issueDate)
      submitData.append('effectiveDate', formData.effectiveDate)
      submitData.append('description', formData.description || '')
      submitData.append('status', formData.status)
      if (selectedFile) {
        submitData.append('file', selectedFile)
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        body: submitData
      })

      if (res.ok) {
        toast.success('حکم با موفقیت اضافه شد')
        setShowAddDialog(false)
        resetForm()
        fetchOrders()
      } else {
        const error = await res.json()
        toast.error(error.error || 'خطا در ثبت حکم')
      }
    } catch (error) {
      console.error('Add order error:', error)
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditOrder = async () => {
    if (!selectedOrder) return
    
    setSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('orderType', formData.orderType)
      submitData.append('employeeId', formData.employeeId)
      submitData.append('title', formData.title)
      submitData.append('orderNumber', formData.orderNumber)
      submitData.append('issueDate', formData.issueDate)
      submitData.append('effectiveDate', formData.effectiveDate)
      submitData.append('description', formData.description || '')
      submitData.append('status', formData.status)
      if (selectedFile) {
        submitData.append('file', selectedFile)
      }

      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        body: submitData
      })

      if (res.ok) {
        toast.success('حکم با موفقیت ویرایش شد')
        setShowEditDialog(false)
        resetForm()
        fetchOrders()
      } else {
        toast.error('خطا در ویرایش حکم')
      }
    } catch (error) {
      console.error('Edit order error:', error)
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return
    
    setSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('حکم با موفقیت حذف شد')
        setShowDeleteDialog(false)
        setSelectedOrder(null)
        fetchOrders()
      } else {
        toast.error('خطا در حذف حکم')
      }
    } catch (error) {
      console.error('Delete order error:', error)
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = async (order: OrderRecord) => {
    if (order.fileUrl) {
      window.open(order.fileUrl, '_blank')
    } else {
      toast.info('فایل برای این حکم وجود ندارد')
    }
  }

  const resetForm = () => {
    setFormData({
      orderType: '',
      employeeId: '',
      title: '',
      orderNumber: '',
      issueDate: '',
      effectiveDate: '',
      description: '',
      status: 'pending'
    })
    setSelectedFile(null)
    setSelectedOrder(null)
  }

  const openEditDialog = (order: OrderRecord) => {
    setSelectedOrder(order)
    setFormData({
      orderType: order.orderType,
      employeeId: order.employeeId,
      title: order.title,
      orderNumber: order.orderNumber,
      issueDate: order.issueDate,
      effectiveDate: order.effectiveDate,
      description: order.description || '',
      status: order.status
    })
    setShowEditDialog(true)
  }

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[100px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  const today = getTodayShamsi()
  const defaultDate = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-emerald-600" />
            احکام کاری
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت احکام و دستورات اداری کارکنان
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-emerald-500 hover:bg-emerald-600 gap-2"
          >
            <Plus className="w-4 h-4" />
            حکم جدید
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            disabled={exporting || orders.length === 0}
            className="gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            خروجی اکسل
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard 
          title="کل احکام" 
          value={stats.total} 
          icon={FileText}
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatsCard 
          title="اجرا شده" 
          value={stats.executed} 
          icon={CheckCircle2}
          color="text-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatsCard 
          title="در حال اجرا" 
          value={stats.active} 
          icon={Clock}
          color="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-950/30"
        />
        <StatsCard 
          title="در انتظار تایید" 
          value={stats.pending} 
          icon={AlertCircle}
          color="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-950/30"
        />
      </div>

      {/* Filter Bar */}
      <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجو عنوان حکم، شماره، نام کارمند..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 rounded-lg border-gray-200 dark:border-gray-700 focus:ring-emerald-500"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] rounded-lg border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="نوع حکم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه انواع</SelectItem>
                {ORDER_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] rounded-lg border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="وضعیت حکم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleResetFilters}
                className="gap-1 text-gray-500"
              >
                <X className="w-4 h-4" />
                حذف فیلترها
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">حکمی یافت نشد</h3>
          <p className="text-sm text-muted-foreground mt-1">فیلتر را تغییر دهید یا حکم جدید اضافه کنید</p>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 gap-2"
          >
            <Plus className="w-4 h-4" />
            افزودن حکم جدید
          </Button>
        </div>
      ) : (
        <>
          <Card className="border-0 shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">نوع حکم</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">کارمند</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">عنوان حکم</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">شماره</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">تاریخ صدور</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">تاریخ اجرا</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">وضعیت</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const rowBg = idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                    return (
                      <tr key={order.id} className={`${rowBg} hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-800`}>
                        <td className="px-4 py-3">
                          <OrderTypeBadge type={order.orderType} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[10px] font-bold">
                                {order.employee.firstName[0]}{order.employee.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {order.employee.firstName} {order.employee.lastName}
                              </span>
                              <p className="text-[10px] text-muted-foreground">
                                {toPersianDigits(order.employee.personnelCode)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                          {order.title}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400" dir="ltr">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                          {formatShamsi(order.issueDate)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                          {formatShamsi(order.effectiveDate)}
                        </td>
                        <td className="px-4 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleDownload(order)}
                              title="دانلود فایل"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => openEditDialog(order)}
                              title="ویرایش"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowDeleteDialog(true)
                              }}
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="w-4 h-4" />
                قبلی
              </Button>
              <span className="flex items-center px-4 text-sm">
                صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                بعدی
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Order Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              افزودن حکم جدید
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>نوع حکم *</Label>
              <Select value={formData.orderType} onValueChange={(v) => setFormData({ ...formData, orderType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع حکم" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>کارمند *</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کارمند" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.personnelCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>عنوان حکم *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: ارتقاء شغلی به مدیر منابع انسانی"
              />
            </div>

            <div className="space-y-2">
              <Label>شماره حکم *</Label>
              <Input
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                placeholder="شماره حکم"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاریخ صدور *</Label>
                <Input
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  placeholder={defaultDate}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>تاریخ اجرا *</Label>
                <Input
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  placeholder={defaultDate}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>وضعیت</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>توضیحات</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg min-h-[80px]"
                placeholder="توضیحات اضافی..."
              />
            </div>

            <div className="space-y-2">
              <Label>فایل حکم</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'برای انتخاب فایل کلیک کنید'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (حداکثر 5MB)</p>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              انصراف
            </Button>
            <Button 
              onClick={handleAddOrder} 
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              ثبت حکم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              ویرایش حکم
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* فرم مشابه دیالوگ افزودن */}
            <div className="space-y-2">
              <Label>نوع حکم *</Label>
              <Select value={formData.orderType} onValueChange={(v) => setFormData({ ...formData, orderType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع حکم" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>کارمند *</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کارمند" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.personnelCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>عنوان حکم *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: ارتقاء شغلی به مدیر منابع انسانی"
              />
            </div>

            <div className="space-y-2">
              <Label>شماره حکم *</Label>
              <Input
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                placeholder="شماره حکم"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاریخ صدور *</Label>
                <Input
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  placeholder={defaultDate}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>تاریخ اجرا *</Label>
                <Input
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  placeholder={defaultDate}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>وضعیت</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>توضیحات</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg min-h-[80px]"
                placeholder="توضیحات اضافی..."
              />
            </div>

            <div className="space-y-2">
              <Label>فایل جدید (اختیاری)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  id="file-upload-edit"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="file-upload-edit" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'برای تغییر فایل کلیک کنید'}
                  </p>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              انصراف
            </Button>
            <Button 
              onClick={handleEditOrder} 
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              ذخیره تغییرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این حکم اطمینان دارید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این اقدام غیرقابل بازگشت است و حکم به طور کامل حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-rose-500 hover:bg-rose-600">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}