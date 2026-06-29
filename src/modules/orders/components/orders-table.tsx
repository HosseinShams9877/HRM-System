// src/modules/orders/components/orders-table.tsx
'use client'

import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Download, Edit, Trash2, FileText } from 'lucide-react'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { OrderTypeBadge, OrderStatusBadge } from './order-badges'

interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
}

interface OrderRecord {
  id: string
  orderNumber: string
  orderType: string
  title: string
  employeeId: string
  employee: Employee
  issueDate: string
  effectiveDate: string
  status: string
  fileUrl?: string
}

interface OrdersTableProps {
  orders: OrderRecord[]
  onDownload: (order: OrderRecord) => void
  onEdit: (order: OrderRecord) => void
  onDelete: (order: OrderRecord) => void
}

export function OrdersTable({ orders, onDownload, onEdit, onDelete }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">حکمی یافت نشد</h3>
        <p className="text-sm text-muted-foreground mt-1">فیلتر را تغییر دهید یا حکم جدید اضافه کنید</p>
      </div>
    )
  }

  return (
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
                  <td className="px-4 py-3 text-right text-xs font-mono text-gray-500 dark:text-gray-400" dir="ltr">
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
                        onClick={() => onDownload(order)}
                        title="دانلود فایل"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => onEdit(order)}
                        title="ویرایش"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => onDelete(order)}
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
  )
}