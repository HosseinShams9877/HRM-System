'use client'

import {
  Receipt, BadgeDollarSign, Printer,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { PERSIAN_MONTHS, RIALS_TO_TOMANS } from '../constants'
import { PaySlipStatusBadge } from './pay-slip-status-badge'
import type { PaySlipRecord } from '../index'

// ============================================
// PaySlipDetailDialog
// ============================================

export function PaySlipDetailDialog({
  open,
  onClose,
  payslip,
}: {
  open: boolean
  onClose: () => void
  payslip: PaySlipRecord | null
}) {
  if (!payslip) return null

  const emp = payslip.employee
  const monthName = PERSIAN_MONTHS[payslip.month - 1] || ''
  const allowanceItems = payslip.items.filter(i => i.category === 'allowance').sort((a, b) => a.sortOrder - b.sortOrder)
  const deductionItems = payslip.items.filter(i => i.category === 'deduction').sort((a, b) => a.sortOrder - b.sortOrder)

  const handlePrint = () => {
    const printContent = document.getElementById('payslip-print-area')
    if (!printContent) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html dir="rtl" lang="fa">
        <head>
          <title>فیش حقوقی - ${emp.firstName} ${emp.lastName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            * { font-family: 'Vazirmatn', sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
            body { padding: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 6px 10px; text-align: right; }
            th { background: #f0f0f0; font-weight: 700; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { font-size: 16px; margin-bottom: 5px; }
            .header p { color: #666; font-size: 11px; }
            .section-title { background: #e8f5e9; font-weight: 700; padding: 8px 10px; margin-top: 15px; border: 1px solid #333; border-bottom: none; }
            .deduction-title { background: #fce4ec; font-weight: 700; padding: 8px 10px; margin-top: 15px; border: 1px solid #333; border-bottom: none; }
            .total-row td { font-weight: 700; background: #f5f5f5; }
            .net-row td { font-weight: 700; background: #e8f5e9; font-size: 14px; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; }
            .sig-box { border-top: 1px solid #333; padding-top: 5px; width: 150px; text-align: center; font-size: 10px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              فیش حقوقی
            </div>
            <PaySlipStatusBadge status={payslip.status} />
          </DialogTitle>
          <DialogDescription>
            {toPersianDigits(payslip.year)} / {monthName}
          </DialogDescription>
        </DialogHeader>

        <div id="payslip-print-area" className="space-y-4 py-4">
          <div className="header text-center">
            <h2 className="text-lg font-bold">فیش حقوقی و مزایا</h2>
            <p className="text-sm text-muted-foreground">
              دوره: {toPersianDigits(payslip.year)} / {monthName}
              {payslip.workDays < 30 && (
                <span className="mr-2">— روزهای کارکرد: {toPersianDigits(payslip.workDays)}</span>
              )}
              {payslip.overtimeHours > 0 && (
                <span className="mr-2">— اضافه‌کاری: {toPersianDigits(payslip.overtimeHours)} ساعت</span>
              )}
            </p>
          </div>

          {/* اطلاعات کارمند */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">
                {emp.firstName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{emp.firstName} {emp.lastName}</h3>
              <p className="text-sm text-muted-foreground">
                کد پرسنلی: {toPersianDigits(emp.personnelCode)}
                {emp.department && ` — ${emp.department}`}
                {emp.position && ` — ${emp.position}`}
              </p>
            </div>
          </div>

          {/* جدول مزایا */}
          <div>
            <div className="text-sm font-semibold p-2 rounded-t-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-b-0">
              مزایا و پرداختی
            </div>
            <table className="w-full text-sm border">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2.5 text-muted-foreground">حقوق پایه</td>
                  <td className="px-4 py-2.5 text-left font-mono font-semibold" dir="ltr">{formatCurrency(RIALS_TO_TOMANS(payslip.baseSalary))}</td>
                </tr>
                {allowanceItems.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {item.title}
                      {item.payrollItem?.calculationType === 'formula' && (
                        <span className="text-[10px] text-muted-foreground mr-1">(خودکار)</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-left font-mono" dir="ltr">{formatCurrency(RIALS_TO_TOMANS(item.amount))}</td>
                  </tr>
                ))}
                <tr className="bg-teal-50 dark:bg-teal-950/20">
                  <td className="px-4 py-2.5 font-semibold">جمع مزایا</td>
                  <td className="px-4 py-2.5 text-left font-mono font-bold text-teal-700 dark:text-teal-300" dir="ltr">{formatCurrency(RIALS_TO_TOMANS(payslip.totalAllowances))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* جدول کسورات */}
          <div>
            <div className="text-sm font-semibold p-2 rounded-t-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-b-0">
              کسورات
            </div>
            <table className="w-full text-sm border">
              <tbody>
                {deductionItems.length > 0 ? (
                  <>
                    {deductionItems.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {item.title}
                          {item.payrollItem?.calculationType === 'formula' && (
                            <span className="text-[10px] text-muted-foreground mr-1">(خودکار)</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-left font-mono" dir="ltr">{formatCurrency(RIALS_TO_TOMANS(item.amount))}</td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td className="px-4 py-2.5 text-muted-foreground text-center" colSpan={2}>کسوراتی ثبت نشده</td>
                  </tr>
                )}
                <tr className="bg-rose-50 dark:bg-rose-950/20">
                  <td className="px-4 py-2.5 font-semibold">جمع کسورات</td>
                  <td className="px-4 py-2.5 text-left font-mono font-bold text-rose-700 dark:text-rose-300" dir="ltr">{formatCurrency(RIALS_TO_TOMANS(payslip.totalDeductions))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* خلاصه محاسبات */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 text-sm">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">ناخالص</div>
              <div className="font-bold text-blue-700 dark:text-blue-300">{formatCurrency(RIALS_TO_TOMANS(payslip.grossSalary))}</div>
            </div>
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">کسورات</div>
              <div className="font-bold text-rose-700 dark:text-rose-300">{formatCurrency(RIALS_TO_TOMANS(payslip.totalDeductions))}</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">خالص</div>
              <div className="font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(RIALS_TO_TOMANS(payslip.netSalary))}</div>
            </div>
          </div>

          {/* خالص پرداختی */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <BadgeDollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">خالص پرداختی</span>
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(RIALS_TO_TOMANS(payslip.netSalary))}
              </div>
            </div>
          </div>

          {/* امضا در چاپ */}
          <div className="hidden print:flex justify-between mt-8">
            <div className="border-t pt-2 w-[150px] text-center text-[10px]">امضای مدیر منابع انسانی</div>
            <div className="border-t pt-2 w-[150px] text-center text-[10px]">امضای مدیر مالی</div>
            <div className="border-t pt-2 w-[150px] text-center text-[10px]">امضای گیرنده</div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>بستن</Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            چاپ فیش
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
