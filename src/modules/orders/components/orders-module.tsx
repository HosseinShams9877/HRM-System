// src/modules/orders/components/orders-module.tsx
'use client'

import React, { useState } from 'react'
import { FileBadge, Plus, Download, Loader2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Skeleton } from '@/core/components/ui/skeleton'
import { toast } from 'sonner'
import { ViewOrderDialog } from './view-order-dialog'
import { useOrders } from '../hooks/use-orders'
import { OrderStats } from './order-stats'
import { OrderFilter } from './order-filter'
import { OrdersTable } from './orders-table'
import { AddOrderDialog } from './OrderDialogs/add-order-dialog'
import { EditOrderDialog } from './OrderDialogs/edit-order-dialog'
import { DeleteOrderDialog } from './OrderDialogs/delete-order-dialog'
import type { OrderRecord } from '../types'
import { formatShamsi } from '@/core/lib/utils-fa'
import { ORDER_TYPES, STATUS_OPTIONS } from './order-badges' 

export function OrdersModule() {
  const {
    orders,
    employees,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    stats,
    submitting,
    setSubmitting,
    fetchOrders,
    resetFilters,
  } = useOrders()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null)
  const [exporting, setExporting] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

const handleAddOrder = async (data: FormData) => {
  setSubmitting(true)
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      body: data,  // ← FormData رو مستقیم بفرست
      // headers رو تنظیم نکن، browser خودش content-type رو set میکنه
    })

    if (res.ok) {
      toast.success('حکم با موفقیت اضافه شد')
      setShowAddDialog(false)
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

  const handleEditOrder = async (data: FormData) => {
    if (!selectedOrder) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, { method: 'PUT', body: data })
      if (res.ok) {
        toast.success('حکم با موفقیت ویرایش شد')
        setShowEditDialog(false)
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
      const res = await fetch(`/api/orders/${selectedOrder.id}`, { method: 'DELETE' })
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

  const handleDownload = (order: OrderRecord) => {
    if (order.fileUrl) {
      window.open(order.fileUrl, '_blank')
    } else {
      toast.info('فایل برای این حکم وجود ندارد')
    }
  }

 // src/modules/orders/components/orders-module.tsx

const handleExportCSV = async () => {
  setExporting(true)
  try {
    // گرفتن همه احکام
    const res = await fetch('/api/orders?limit=1000')
    if (!res.ok) {
      throw new Error('خطا در دریافت داده‌ها')
    }
    
    const result = await res.json()
    const ordersList = result.data || result.orders || []
    
    if (ordersList.length === 0) {
      toast.warning('هیچ حکمی برای خروجی وجود ندارد')
      return
    }

    // تعریف هدرها
    const headers = [
      'نوع حکم',
      'کارمند',
      'کد پرسنلی',
      'عنوان حکم',
      'شماره حکم',
      'تاریخ صدور',
      'تاریخ اجرا',
      'وضعیت'
    ]

    // تعریف ردیف‌ها
    const rows = ordersList.map((order: any) => {
      const orderTypeLabel = ORDER_TYPES.find(t => t.value === order.orderType)?.label || order.orderType
      const statusLabel = STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status
      
      return [
        orderTypeLabel,
        `${order.employee?.firstName || ''} ${order.employee?.lastName || ''}`,
        order.employee?.personnelCode || '',
        order.title || '',
        order.orderNumber || '',
        formatShamsi(order.issueDate),
        formatShamsi(order.effectiveDate),
        statusLabel
      ]
    })

    // ساخت CSV
    const csvRows = [headers, ...rows]
    const csvContent = csvRows
      .map(row => row.join(','))
      .join('\n')

    // اضافه کردن BOM برای پشتیبانی از فارسی
    const blob = new Blob(['\uFEFF' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    })

    // دانلود فایل
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', `احکام_کاری_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`${ordersList.length} حکم با موفقیت خروجی گرفته شد`)
  } catch (error) {
    console.error('Export error:', error)
    toast.error('خطا در دریافت خروجی')
  } finally {
    setExporting(false)
  }
}
const handleView = (order: OrderRecord) => {
  setSelectedOrder(order)
  setShowViewDialog(true)
}

  if (loading) {
    return <OrdersLoading />
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
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
          <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-500 hover:bg-emerald-600 gap-2">
            <Plus className="w-4 h-4" /> حکم جدید
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={exporting || orders.length === 0}
            className="gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            خروجی
          </Button>
        </div>
      </div>

      {/* Stats */}
      <OrderStats stats={stats} />

      {/* Filters */}
      <OrderFilter
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        resetFilters={resetFilters}
      />

      {/* Table */}
      <OrdersTable
        orders={orders}
        onDownload={handleDownload}
        onEdit={(order) => {
          setSelectedOrder(order)
          setShowEditDialog(true)
        }}
        onDelete={(order) => {
          setSelectedOrder(order)
          setShowDeleteDialog(true)
        }}
        onView={handleView}
      />

      {/* Dialogs */}
      <AddOrderDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        employees={employees}
        onSubmit={handleAddOrder}
        submitting={submitting}
      />

      <EditOrderDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        order={selectedOrder}
        employees={employees}
        onSubmit={handleEditOrder}
        submitting={submitting}
      />

      <DeleteOrderDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteOrder}
        submitting={submitting}
      />
      <ViewOrderDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        order={selectedOrder}
      />
    </div>
  )
}

function OrdersLoading() {
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