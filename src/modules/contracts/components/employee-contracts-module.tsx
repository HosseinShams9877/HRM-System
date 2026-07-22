'use client'

import { useEffect, useState } from 'react'
import { FileBadge, FileText, Calendar, Building2, Download, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Skeleton } from '@/core/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import { OrderPDF, registerFonts } from '@/modules/orders/components/OrderDialogs/order-pdf'
import { OrderRecord } from '@/modules/orders/types'
import { useEmployee } from '@/modules/employees/hooks/use-employee'

interface Contract {
  id: string
  contractNumber: string
  type: string
  title: string
  startDate: string
  endDate: string | null
  amount: number | null
  status: string
  department: string | null
  notes: string | null
  filePath: string | null
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  orderType: string
  title: string
  issueDate: string
  effectiveDate: string
  status: string
  fileUrl: string | null
  fileName: string | null
  description: string | null
}

interface EmployeeContractsModuleProps {
  currentUser?: { role: string; employeeId?: string }
}

export function EmployeeContractsModule({ currentUser }: EmployeeContractsModuleProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'contracts' | 'orders'>('contracts')
const [isDownloading, setIsDownloading] = useState(false)
  const employeeId = currentUser?.employeeId

  const fetchContracts = async () => {
    if (!employeeId) return
    try {
      const res = await fetch(`/api/contracts?employeeId=${employeeId}`)
      if (res.ok) {
        const data = await res.json()
        // داده ممکنه مستقیم بیاد یا توی data باشه
        const items = Array.isArray(data) ? data : data.data || []
        setContracts(items)
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    }
  }

  const fetchOrders = async () => {
    if (!employeeId) return
    try {
      const res = await fetch(`/api/orders?employeeId=${employeeId}`)
      if (res.ok) {
        const data = await res.json()
        const items = Array.isArray(data) ? data : data.data || []
        setOrders(items)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchContracts()
      await fetchOrders()
      setLoading(false)
    }
    load()
  }, [employeeId])

  const handleDownloadPDF = async (item: Order) => {
    setIsDownloading(true)
    try {
      // دریافت اطلاعات کامل حکم
      const orderRes = await fetch(`/api/orders/${item.id}`)
      if (!orderRes.ok) {
        toast.error('خطا در دریافت اطلاعات حکم')
        return
      }
      const orderData = await orderRes.json()
      
      // ✅ گرفتن اطلاعات کامل کارمند از دیتابیس
      const employeeId = orderData.employeeId
      let fullEmployee = orderData.employee || {}
      
      try {
        const empRes = await fetch(`/api/employees/${employeeId}`)
        if (empRes.ok) {
          const empData = await empRes.json()
          fullEmployee = empData.data || empData || fullEmployee
        }
      } catch (error) {
        console.error('Error fetching full employee:', error)
      }
      
      // گرفتن نام‌های جدید
      let newPositionName = '—'
      let newDepartmentName = '—'
      
      if (orderData.newPosition) {
        try {
          const posRes = await fetch(`/api/positions/${orderData.newPosition}`)
          if (posRes.ok) {
            const posData = await posRes.json()
            newPositionName = posData.title || orderData.newPosition
          }
        } catch (error) {
          console.error('Error fetching new position:', error)
          newPositionName = orderData.newPosition || '—'
        }
      }
      
      if (orderData.newDepartment) {
        try {
          const deptRes = await fetch(`/api/departments/${orderData.newDepartment}`)
          if (deptRes.ok) {
            const deptData = await deptRes.json()
            newDepartmentName = deptData.name || orderData.newDepartment
          }
        } catch (error) {
          console.error('Error fetching new department:', error)
          newDepartmentName = orderData.newDepartment || '—'
        }
      }
      
      const fontKey = Date.now().toString()
      await registerFonts(fontKey)
      
      const displayOrder = orderData
      
      const hasPositionChange = displayOrder.newPosition || displayOrder.newDepartment
      const hasSalaryChange = displayOrder.baseSalary || 
                             displayOrder.housingAllowance || 
                             displayOrder.foodAllowance || 
                             displayOrder.attractionAllowance || 
                             displayOrder.responsibilityAllowance || 
                             displayOrder.otherAllowances ||
                             displayOrder.spouseAllowance ||
                             displayOrder.childAllowance ||
                             displayOrder.yearsOfServiceBase ||
                             displayOrder.fixedDeductions
  
      const orderTypeLabels: Record<string, string> = {
        employment: 'استخدام',
        extension: 'تمدید قرارداد',
        salary_increase: 'افزایش حقوق',
        position_change: 'تغییر سمت',
        department_change: 'تغییر واحد',
        promotion: 'ارتقاء شغلی',
        transfer: 'انتقال',
        suspension: 'تعلیق',
        termination: 'پایان همکاری',
        other: 'سایر',
      }
  
      const blob = await pdf(
        <OrderPDF
          order={orderData}
          employee={fullEmployee}
          displayOrder={displayOrder}
          hasPositionChange={hasPositionChange}
          hasSalaryChange={hasSalaryChange}
          orderTypeLabels={orderTypeLabels}
          formatShamsi={formatShamsi}
          fontKey={fontKey}
          newPositionName={newPositionName}
          newDepartmentName={newDepartmentName}
        />
      ).toBlob()
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `حکم_کاری_${displayOrder.orderNumber || 'unknown'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
      
      toast.success('PDF با موفقیت دانلود شد')
    } catch (error) {
      console.error('Error:', error)
      toast.error('خطا در دانلود فایل')
    } finally {
      setIsDownloading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: 'فعال', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
      pending: { label: 'در انتظار', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
      expired: { label: 'منقضی', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
      terminated: { label: 'فسخ شده', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300' },
      draft: { label: 'پیش‌نویس', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300' },
      approved: { label: 'تایید شده', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    }
    return config[status] || config.pending
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const displayItems = activeTab === 'contracts' ? contracts : orders

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-emerald-600" />
            قرارداد و حکم
          </h2>
          <p className="text-sm text-muted-foreground">مشاهده قراردادها و احکام کاری شما</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {toPersianDigits(contracts.length)}
              </div>
              <div className="text-xs text-muted-foreground">قرارداد</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30">
              <FileBadge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {toPersianDigits(orders.length)}
              </div>
              <div className="text-xs text-muted-foreground">حکم کاری</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {toPersianDigits([...contracts, ...orders].filter(i => i.status === 'active' || i.status === 'approved').length)}
              </div>
              <div className="text-xs text-muted-foreground">فعال</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === 'contracts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('contracts')}
        >
          <FileText className="w-4 h-4 ml-2" />
          قراردادها
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('orders')}
        >
          <FileBadge className="w-4 h-4 ml-2" />
          احکام کاری
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {displayItems.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <h3 className="text-sm font-medium text-muted-foreground">
                {activeTab === 'contracts' ? 'قراردادی' : 'حکمی'} یافت نشد
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                شما هیچ {activeTab === 'contracts' ? 'قراردادی' : 'حکمی'} ثبت نشده دارید
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-right text-xs font-medium">عنوان</TableHead>
                  <TableHead className="text-right text-xs font-medium">شماره</TableHead>
                  <TableHead className="text-right text-xs font-medium">تاریخ شروع</TableHead>
                  <TableHead className="text-right text-xs font-medium">تاریخ پایان</TableHead>
                  <TableHead className="text-center text-xs font-medium">وضعیت</TableHead>
                  <TableHead className="text-center text-xs font-medium">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayItems.map((item) => {
                  const statusConfig = getStatusBadge(item.status)
                  const startDate = 'startDate' in item ? item.startDate : (item as Order).issueDate
                  const endDate = 'endDate' in item ? item.endDate : (item as Order).effectiveDate
                  const number = 'contractNumber' in item ? item.contractNumber : (item as Order).orderNumber
                  const title = item.title || (item as Contract).type || (item as Order).orderType
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm font-medium">{title}</TableCell>
                      <TableCell className="text-xs">{toPersianDigits(number)}</TableCell>
                      <TableCell className="text-xs">{formatShamsi(startDate)}</TableCell>
                      <TableCell className="text-xs">{endDate ? formatShamsi(endDate) : 'نامحدود'}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-[10px] ${statusConfig.className}`}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                    <Button
  variant="outline"
  size="sm"
  className="h-7 text-[10px] gap-1"
  onClick={() => {
    if (activeTab === 'orders') {
      handleDownloadPDF(item as Order)
    } else {
      // برای قرارداد - دانلود فایل
      if ((item as Contract).filePath) {
        window.open((item as Contract).filePath!, '_blank')
      } else {
        toast.info('فایلی برای این قرارداد وجود ندارد')
      }
    }
  }}
  disabled={isDownloading}
>
  {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
  دانلود
</Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}