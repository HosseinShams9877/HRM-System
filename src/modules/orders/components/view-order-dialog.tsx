// src/modules/orders/components/OrderDialogs/view-order-dialog.tsx
'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { 
  Printer, Eye, X, Loader2, Download, FileText, User, 
  Briefcase, DollarSign, Calendar, Phone, Building2,
  CheckCircle, AlertCircle
} from 'lucide-react'
import { formatShamsi, toPersianDigits,convertMiladiToShamsi, formatShamsiFull  } from '@/core/lib/utils-fa'
import { toast } from 'sonner'
import { useEmployee } from '@/modules/employees/hooks/use-employee'
import { cn } from '@/core/lib/utils'
import { pdf, Font } from '@react-pdf/renderer'
import { OrderPDF,registerFonts } from './OrderDialogs/order-pdf'
import { OrderPDFSimple } from './OrderDialogs/order-pdf-simple' 

// تایپ‌ها
interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  nationalCode?: string
  fatherName?: string
  phone?: string
  email?: string
  birthDate?: string
  hireDate?: string
  maritalStatus?: string
  department?: string
  position?: string
  contractType?: string
  departmentName?: string
  positionName?: string
  address?: string
  baseSalary?: number
  housingAllowance?: number
  foodAllowance?: number
  attractionAllowance?: number
  responsibilityAllowance?: number
  otherAllowances?: number
  fixedDeductions?: number
  spouseAllowance?: number      
  childAllowance?: number       
  yearsOfServiceBase?: number
}

interface OrderRecord {
  id: string
  orderNumber: string
  orderType: string
  title: string
  description?: string
  employeeId: string
  employee: Employee
  contractId?: string
  issueDate: string
  effectiveDate: string
  expiryDate?: string
  newPosition?: string
  newDepartment?: string
  newPositionName?: string
  newDepartmentName?: string
  newManagerId?: string
  baseSalary?: number
  housingAllowance?: number
  foodAllowance?: number
  attractionAllowance?: number
  responsibilityAllowance?: number
  otherAllowances?: number
  fixedDeductions?: number
  spouseAllowance?: number      
  childAllowance?: number       
  yearsOfServiceBase?: number
  status: string
  fileUrl?: string
  fileName?: string
}

interface ViewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderRecord | null
}

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return '—'
  return toPersianDigits(amount.toLocaleString()) + ' ریال'
}

export function ViewOrderDialog({ open, onOpenChange, order }: ViewOrderDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [fullOrder, setFullOrder] = useState<OrderRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [newPositionName, setNewPositionName] = useState<string>('')
  const [newDepartmentName, setNewDepartmentName] = useState<string>('')

  const { data: employeeData, isLoading: employeeLoading } = useEmployee(
    order?.employeeId || null
  )

  useEffect(() => {
    if (open && order?.id) {
      fetchFullOrder(order.id)
    }
  }, [open, order])

  // ===== 4. تابع fetchFullOrder =====
  const fetchFullOrder = async (orderId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setFullOrder(data)
      } else {
        toast.error('خطا در دریافت اطلاعات حکم')
      }
    } catch (error) {
      console.error('Error fetching full order:', error)
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  // ===== 5. displayOrder رو اینجا تعریف کن =====
  const displayOrder = fullOrder || order

  // ===== 6. useEffect دوم - گرفتن نام‌ها (بعد از displayOrder) =====
  useEffect(() => {
    const fetchNames = async () => {
      if (!displayOrder) return

      if (displayOrder.newPosition) {
        try {
          const res = await fetch(`/api/positions/${displayOrder.newPosition}`)
          if (res.ok) {
            const data = await res.json()
            setNewPositionName(data.title || displayOrder.newPosition)
          }
        } catch (error) {
          console.error('Error fetching new position:', error)
          setNewPositionName(displayOrder.newPosition || '—')
        }
      } else {
        setNewPositionName('—')
      }

      if (displayOrder.newDepartment) {
        try {
          const res = await fetch(`/api/departments/${displayOrder.newDepartment}`)
          if (res.ok) {
            const data = await res.json()
            setNewDepartmentName(data.name || displayOrder.newDepartment)
          }
        } catch (error) {
          console.error('Error fetching new department:', error)
          setNewDepartmentName(displayOrder.newDepartment || '—')
        }
      } else {
        setNewDepartmentName('—')
      }
    }

    fetchNames()
  }, [displayOrder?.newPosition, displayOrder?.newDepartment, displayOrder])

  // ===== 7. توابع handleDownloadPDF و handlePrint =====
  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const fontKey = Date.now().toString()
      
      await registerFonts(fontKey)
      const PDFComponent = OrderPDF
        console.log('PDFComponent:', PDFComponent.name || PDFComponent)
      
      
      const blob = await pdf(
        <PDFComponent
          order={order}
          employee={employee}
          displayOrder={displayOrder}
          hasPositionChange={hasPositionChange}
          hasSalaryChange={hasSalaryChange}
          orderTypeLabels={orderTypeLabels}
          formatShamsi={formatShamsi}
          formatCurrency={formatCurrency}
          toPersianDigits={toPersianDigits}
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
// ============================================
// قسمت پرینت - با ساختار مشابه PDF
// ============================================
const handlePrint = () => {
  if (!printRef.current) {
    toast.error('محتوایی برای چاپ وجود ندارد')
    return
  }
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    toast.error('پنجره پرینت باز نشد')
    return
  }
  const content = printRef.current.innerHTML
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>حکم کاری ${fullOrder?.orderNumber || order?.orderNumber || ''}</title>
        <style>
          /* ===== استایل‌های Tailwind برای پرینت ===== */
          * { box-sizing: border-box; font-family: 'Vazirmatn', sans-serif; }
          body { 
            padding: 20px; 
            background: white; 
            max-width: 1200px; 
            margin: 0 auto;
            direction: rtl;
          }
          .text-center { text-align: center; }
          .border-b-2 { border-bottom-width: 2px; }
          .border-emerald-600 { border-color: #059669; }
          .pb-4 { padding-bottom: 1rem; }
          .mb-4 { margin-bottom: 1rem; }
          .text-2xl { font-size: 1.5rem; }
          .text-3xl { font-size: 1.875rem; }
          .font-bold { font-weight: 700; }
          .text-emerald-800 { color: #065f46; }
          .text-sm { font-size: 0.875rem; }
          .text-gray-500 { color: #6b7280; }
          .mt-1 { margin-top: 0.25rem; }
          .flex { display: flex; }
          .flex-wrap { flex-wrap: wrap; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .gap-2 { gap: 0.5rem; }
          .gap-3 { gap: 0.75rem; }
          .mt-3 { margin-top: 0.75rem; }
          .bg-gray-50 { background-color: #f9fafb; }
          .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
          .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
          .rounded-full { border-radius: 9999px; }
          .text-xs { font-size: 0.75rem; }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
          .border { border-width: 1px; }
          .border-gray-200 { border-color: #e5e7eb; }
          .text-emerald-700 { color: #047857; }
          .bg-emerald-50 { background-color: #ecfdf5; }
          .rounded-xl { border-radius: 0.75rem; }
          .p-3 { padding: 0.75rem; }
          .p-4 { padding: 1rem; }
          .border-emerald-200 { border-color: #a7f3d0; }
          .text-emerald-600 { color: #059669; }
          .block { display: block; }
          .text-base { font-size: 1rem; }
          .text-lg { font-size: 1.125rem; }
          .text-emerald-800 { color: #065f46; }
          .dark\\:border-gray-700 { border-color: #374151; }
          .dark\\:bg-gray-900 { background-color: #111827; }
          .dark\\:text-gray-400 { color: #9ca3af; }
          .dark\\:text-emerald-400 { color: #34d399; }
          .dark\\:text-gray-300 { color: #d1d5db; }
          .overflow-hidden { overflow: hidden; }
          .border-b { border-bottom-width: 1px; }
          .border-gray-700 { border-color: #374151; }
          .gap-1 { gap: 0.25rem; }
          .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .col-span-2 { grid-column: span 2 / span 2; }
          .bg-amber-50 { background-color: #fffbeb; }
          .border-amber-200 { border-color: #fcd34d; }
          .text-amber-600 { color: #b45309; }
          .text-amber-800 { color: #92400e; }
          .text-amber-700 { color: #b45309; }
          .bg-amber-500 { background-color: #f59e0b; }
          .text-white { color: #ffffff; }
          .bg-blue-50 { background-color: #eff6ff; }
          .border-r-4 { border-right-width: 4px; }
          .border-blue-500 { border-color: #3b82f6; }
          .text-blue-600 { color: #2563eb; }
          .bg-blue-100 { background-color: #dbeafe; }
          .leading-relaxed { line-height: 1.625; }
          .whitespace-pre-wrap { white-space: pre-wrap; }
          .pt-4 { padding-top: 1rem; }
          .border-t { border-top-width: 1px; }
          .border-gray-700 { border-color: #374151; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-4 { gap: 1rem; }
          .text-gray-400 { color: #9ca3af; }
          .dark\\:text-gray-500 { color: #6b7280; }
          .mt-4 { margin-top: 1rem; }
          .mt-6 { margin-top: 1.5rem; }
          .text-[10px] { font-size: 10px; }
          .w-4 { width: 1rem; }
          .h-4 { height: 1rem; }
          .w-8 { width: 2rem; }
          .h-8 { height: 2rem; }
          .flex-shrink-0 { flex-shrink: 0; }
          .gap-3 { gap: 0.75rem; }
          .font-semibold { font-weight: 600; }
          .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
          .sticky { position: sticky; }
          .top-0 { top: 0; }
          .z-20 { z-index: 20; }
          .bg-background { background-color: #ffffff; }
          .border-b { border-bottom-width: 1px; }
          .max-w-6xl { max-width: 72rem; }
          .w-\\[95vw\\] { width: 95vw; }
          .max-h-\\[95vh\\] { max-height: 95vh; }
          .overflow-y-auto { overflow-y: auto; }
          .p-0 { padding: 0; }
          .sm\\:p-6 { padding: 1.5rem; }
          .bg-white { background-color: #ffffff; }
          .max-w-5xl { max-width: 64rem; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .sm\\:text-3xl { font-size: 1.875rem; }
          .sm\\:pb-6 { padding-bottom: 1.5rem; }
          .sm\\:mb-6 { margin-bottom: 1.5rem; }
          .sm\\:gap-3 { gap: 0.75rem; }
          .sm\\:text-sm { font-size: 0.875rem; }
          .sm\\:p-4 { padding: 1rem; }
          .sm\\:text-lg { font-size: 1.125rem; }
          .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
          @media (max-width: 640px) {
            .sm\\:p-6 { padding: 1rem; }
            .sm\\:text-3xl { font-size: 1.5rem; }
            .sm\\:pb-6 { padding-bottom: 1rem; }
            .sm\\:mb-6 { margin-bottom: 0.75rem; }
            .sm\\:gap-3 { gap: 0.5rem; }
            .sm\\:text-sm { font-size: 0.75rem; }
            .sm\\:p-4 { padding: 0.75rem; }
            .sm\\:text-lg { font-size: 1rem; }
            .sm\\:grid-cols-3 { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        ${content}
        <script>window.onload = function() { window.print(); }</script>
      </body>
    </html>
  `)
  printWindow.document.close()
}

  if (!order) return null

  if (loading || employeeLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>در حال بارگذاری</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="mr-3 text-lg">در حال بارگذاری...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  
  const employee = {
    ...(employeeData || displayOrder.employee),
    baseSalary: displayOrder.baseSalary ?? employeeData?.financial?.baseSalary ?? displayOrder.employee?.baseSalary,
    housingAllowance: displayOrder.housingAllowance ?? employeeData?.financial?.housingAllowance ?? displayOrder.employee?.housingAllowance,
    foodAllowance: displayOrder.foodAllowance ?? employeeData?.financial?.workAllowance ?? displayOrder.employee?.foodAllowance,
    attractionAllowance: displayOrder.attractionAllowance ?? employeeData?.financial?.responsibilityAllowance ?? displayOrder.employee?.attractionAllowance,
    responsibilityAllowance: displayOrder.responsibilityAllowance ?? employeeData?.financial?.responsibilityAllowance ?? displayOrder.employee?.responsibilityAllowance,
    otherAllowances: displayOrder.otherAllowances ?? employeeData?.financial?.otherAllowances ?? displayOrder.employee?.otherAllowances,
    fixedDeductions: displayOrder.fixedDeductions ?? employeeData?.financial?.fixedDeductions ?? displayOrder.employee?.fixedDeductions,
    spouseAllowance: displayOrder.spouseAllowance ?? employeeData?.financial?.spouseAllowance ?? displayOrder.employee?.spouseAllowance,
    childAllowance: displayOrder.childAllowance ?? employeeData?.financial?.childAllowance ?? displayOrder.employee?.childAllowance,
    yearsOfServiceBase: displayOrder.yearsOfServiceBase ?? employeeData?.financial?.yearsOfServiceBase ?? displayOrder.employee?.yearsOfServiceBase,
  }

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

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    replaced: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  }

  const statusLabels: Record<string, string> = {
    draft: 'پیش‌نویس',
    pending: 'در انتظار تأیید',
    approved: 'تأیید شده',
    active: 'فعال',
    cancelled: 'ابطال شده',
    replaced: 'جایگزین شده',
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto p-0 sm:p-6">
        {/* هدر دیالوگ */}
        <div className="sticky top-0 z-20 bg-background border-b px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-t-lg">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>مشاهده حکم کارگزینی</span>
            <Badge variant="outline" className="mr-2 text-xs font-normal">
              {displayOrder.orderNumber}
            </Badge>
          </DialogTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint} 
              className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">چاپ</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF} 
              disabled={isDownloading}
              className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isDownloading ? 'در حال دانلود...' : 'دانلود PDF'}</span>
            </Button>
          </div>
        </div>

        {/* محتوای حکم */}
        <div ref={printRef} className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900" dir="rtl">
          <div className="max-w-5xl mx-auto">
            {/* هدر حکم */}
            <div className="text-center border-b-2 border-emerald-600 dark:border-emerald-500 pb-4 sm:pb-6 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 dark:text-emerald-400">حکم کارگزینی</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">سازمان مدیریت منابع انسانی</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3">
                <span className="bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs sm:text-sm shadow-sm border border-gray-200 dark:border-gray-700">
                  شماره: <strong className="text-emerald-700 dark:text-emerald-400">{toPersianDigits(displayOrder.orderNumber)}</strong>
                </span>
                <span className="bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs sm:text-sm shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  صدور: <strong>{formatShamsi(order.issueDate)}</strong>
                </span>
                <span className="bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs sm:text-sm shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  اجرا: <strong>{formatShamsi(displayOrder.effectiveDate)}</strong>
                </span>
                <Badge className={cn(statusColors[displayOrder.status], 'px-3 py-1.5 text-xs')}>
                  {statusLabels[displayOrder.status] || displayOrder.status}
                </Badge>
              </div>
            </div>

            {/* عنوان حکم */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 sm:p-4 mb-4 text-center border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-1">
                {orderTypeLabels[displayOrder.orderType] || displayOrder.orderType}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-300">{displayOrder.title}</h2>
            </div>

            {/* مشخصات کارمند - 2 ستون */}
            <div className="border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 font-bold text-sm flex items-center gap-2 border-b dark:border-gray-700">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                مشخصات کارمند
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">نام و نام خانوادگی</p>
                  <p className="text-sm font-semibold dark:text-gray-200 truncate">{employee.firstName} {employee.lastName}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">کد پرسنلی</p>
                  <p className="text-sm font-semibold dark:text-gray-200">{toPersianDigits(employee.personnelCode)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">کد ملی</p>
                  <p className="text-sm font-semibold dark:text-gray-200">{toPersianDigits(employee.nationalCode || '—')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">نام پدر</p>
                  <p className="text-sm font-semibold dark:text-gray-200">{employee.fatherName || '—'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">تاریخ تولد</p>
                  <p className="text-sm font-semibold dark:text-gray-200">{formatShamsi(convertMiladiToShamsi(employee.birthDate  || ''))}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    شماره موبایل
                  </p>
                  <p className="text-sm font-semibold dark:text-gray-200 truncate" dir="ltr">
                    {toPersianDigits(employee.phone || '—')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">وضعیت تأهل</p>
                  <p className="text-sm font-semibold dark:text-gray-200">{employee.maritalStatus === 'married' ? 'متاهل' : 'مجرد'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">تاریخ شروع همکاری</p>
                  <p className="text-sm font-semibold dark:text-gray-200">{formatShamsiFull(convertMiladiToShamsi(employee.hireDate || ''))}</p>
                </div>
              </div>
            </div>

            {/* اطلاعات شغلی - 2 ستون */}
            <div className="border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 font-bold text-sm flex items-center gap-2 border-b dark:border-gray-700">
                <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                اطلاعات شغلی
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">سمت</p>
                  <p className="text-sm font-semibold dark:text-gray-200 truncate">
                    {employee.positionName || employee.position || '—'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">واحد سازمانی</p>
                  <p className="text-sm font-semibold dark:text-gray-200 truncate">
                    {employee.departmentName || employee.department || '—'}
                  </p>
                </div>
                
                {hasPositionChange && (
                  <>
                    <div className="col-span-2 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        سمت جدید
                      </p>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      {newPositionName || displayOrder.newPositionName || displayOrder.newPosition || '—'}
                       <span className="text-[10px] text-amber-600 mr-1">(تغییر)</span>
                      </p>
                    </div>
                    <div className="col-span-2 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        واحد جدید
                      </p>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      {newDepartmentName || displayOrder.newDepartmentName || displayOrder.newDepartment || '—'}
                        <span className="text-[10px] text-amber-600 mr-1">(تغییر)</span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* اطلاعات حقوقی - 2 ستون */}
            <div className="border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 font-bold text-sm flex items-center justify-between border-b dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  اطلاعات حقوقی
                </div>
                {hasSalaryChange && (
                  <Badge className="bg-amber-500 text-white dark:bg-amber-600 text-[10px]">
                    تغییرات جدید
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">حقوق پایه</p>
                  <p className="text-sm font-semibold dark:text-gray-200 truncate">
                    {hasSalaryChange && displayOrder.baseSalary ? (
                      <span className="text-amber-700 dark:text-amber-400">
                        {formatCurrency(displayOrder.baseSalary)}
                        <span className="text-[9px] text-gray-400 mr-1">(جدید)</span>
                      </span>
                    ) : (
                      formatCurrency(employee.baseSalary)
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">حق مسکن</p>
                  <p className="text-sm font-semibold dark:text-gray-200 truncate">
                    {hasSalaryChange && displayOrder.housingAllowance ? (
                      <span className="text-amber-700 dark:text-amber-400">
                        {formatCurrency(displayOrder.housingAllowance)}
                        <span className="text-[9px] text-gray-400 mr-1">(جدید)</span>
                      </span>
                    ) : (
                      formatCurrency(employee.housingAllowance)
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">بن کارگری</p>
                  <p className="text-sm font-semibold dark:text-gray-200 truncate">
                    {hasSalaryChange && displayOrder.foodAllowance ? (
                      <span className="text-amber-700 dark:text-amber-400">
                        {formatCurrency(displayOrder.foodAllowance)}
                        <span className="text-[9px] text-gray-400 mr-1">(جدید)</span>
                      </span>
                    ) : (
                      formatCurrency(employee.foodAllowance || employee.workAllowance)
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">حق مسئولیت</p>
                  <p className="text-sm font-semibold dark:text-gray-200 truncate">
                    {hasSalaryChange && displayOrder.responsibilityAllowance ? (
                      <span className="text-amber-700 dark:text-amber-400">
                        {formatCurrency(displayOrder.responsibilityAllowance)}
                        <span className="text-[9px] text-gray-400 mr-1">(جدید)</span>
                      </span>
                    ) : (
                      formatCurrency(employee.responsibilityAllowance)
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">سایر مزایا</p>
                  <p className="text-sm font-semibold dark:text-gray-200 truncate">
                    {hasSalaryChange && displayOrder.otherAllowances ? (
                      <span className="text-amber-700 dark:text-amber-400">
                        {formatCurrency(displayOrder.otherAllowances)}
                        <span className="text-[9px] text-gray-400 mr-1">(جدید)</span>
                      </span>
                    ) : (
                      formatCurrency(employee.otherAllowances)
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
  <p className="text-[10px] text-gray-500 dark:text-gray-400">حق تاهل</p>
  <p className="text-sm font-semibold dark:text-gray-200 truncate">
    {formatCurrency(employee.spouseAllowance)}
  </p>
</div>
<div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
  <p className="text-[10px] text-gray-500 dark:text-gray-400">حق اولاد</p>
  <p className="text-sm font-semibold dark:text-gray-200 truncate">
    {formatCurrency(employee.childAllowance)}
  </p>
</div>
<div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
  <p className="text-[10px] text-gray-500 dark:text-gray-400">پایه سنوات</p>
  <p className="text-sm font-semibold dark:text-gray-200 truncate">
    {formatCurrency(employee.yearsOfServiceBase)}
  </p>
</div>
             
              </div>
            </div>

            {/* متن قانونی */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border-r-4 border-blue-500 dark:border-blue-400 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">متن قانونی حکم</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    با توجه به تصمیمات و ضوابط مربوطه و با استفاده از قوانین به قوانین، بخش آیین‌نامه‌ها و مقررات تاریخ اجرای حکم، موارد مندرج در این حکم کارگزینی به عنوان مبنای محاسبات حقوق و مزایا و سایر تعهدات و مسئولیت‌های مالی در شرکت ملک عمل قرار گیرد.
                  </p>
                </div>
              </div>
            </div>

            {/* شرح وظایف */}
            {displayOrder.description && (
              <div className="border dark:border-gray-700 rounded-xl overflow-hidden mb-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 font-bold text-sm">شرح وظایف</div>
                <div className="px-4 py-3 text-sm whitespace-pre-wrap dark:text-gray-300 leading-relaxed">
                  {displayOrder.description}
                </div>
              </div>
            )}

            {/* توضیحات */}
            <div className="border dark:border-gray-700 rounded-xl overflow-hidden mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 font-bold text-sm">توضیحات</div>
              <div className="px-4 py-3 text-sm dark:text-gray-300 leading-relaxed">
                <p>این حکم اجرایی حکم جدید بوده و تاریخ صدور و تاریخ اجرای حکم معتبر می‌باشد.</p>
                <p className="mt-1">هرگونه تغییر در مفاد این حکم صرفاً با مجوز کتبی مدیرعامل مقام مجاز امکان پذیر است.</p>
              </div>
            </div>

            {/* امضاها */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                <p className="font-bold text-sm dark:text-gray-200">کارمند</p>
                <div className="mt-6 space-y-2 text-xs dark:text-gray-300">
                  <p>نام و نام خانوادگی: ....................</p>
                  <p>امضاء: ....................</p>
                  <p>تاریخ: ....../....../......</p>
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                <p className="font-bold text-sm dark:text-gray-200">مدیر واحد</p>
                <div className="mt-6 space-y-2 text-xs dark:text-gray-300">
                  <p>نام و نام خانوادگی: ....................</p>
                  <p>امضاء: ....................</p>
                  <p>تاریخ: ....../....../......</p>
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                <p className="font-bold text-sm dark:text-gray-200">مدیر منابع انسانی</p>
                <div className="mt-6 space-y-2 text-xs dark:text-gray-300">
                  <p>نام و نام خانوادگی: ....................</p>
                  <p>امضاء: ....................</p>
                  <p>تاریخ: ....../....../......</p>
                </div>
              </div>
            </div>

            {/* فوتر */}
            <div className="text-center text-[10px] text-gray-400 dark:text-gray-500 pt-4 mt-4 border-t dark:border-gray-700">
              <p>این سند به صورت دیجیتال صادر شده و بدون مهر و امضاء معتبر می‌باشد.</p>
              <p className="mt-1">کد پیگیری: {toPersianDigits(displayOrder.orderNumber)}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-2 border-t px-4 sm:px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            <X className="w-4 h-4 ml-2" />
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}