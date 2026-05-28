'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  CreditCard, Loader2, Calendar, DollarSign, TrendingUp,
  TrendingDown, ChevronDown, ChevronUp, Receipt
} from 'lucide-react'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { getShamsiMonthName } from '@/core/lib/utils-fa'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: 'پیش‌نویس', color: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300' },
  confirmed: { label: 'تأیید شده', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
  paid: { label: 'پرداخت شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
  closed: { label: 'بسته شده', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300' },
}

export default function PayslipList() {
  const [loading, setLoading] = useState(true)
  const [payslips, setPayslips] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/payroll')
        if (res.ok) {
          const data = await res.json()
          setPayslips(data.payslips || [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (payslips.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">فیش حقوقی یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {payslips.map((slip: any) => {
        const status = STATUS_MAP[slip.status] || STATUS_MAP.draft
        const isExpanded = expandedId === slip.id
        const allowances = (slip.items || []).filter((i: any) => i.category === 'allowance')
        const deductions = (slip.items || []).filter((i: any) => i.category === 'deduction')
        const monthName = getShamsiMonthName(slip.month)

        return (
          <Card key={slip.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              {/* Header */}
              <button
                className="w-full text-right"
                onClick={() => setExpandedId(isExpanded ? null : slip.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                      <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        فیش {toPersianDigits(slip.month)} {monthName} {toPersianDigits(slip.year)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {toPersianDigits(slip.workDays)} روز کارکرد
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${status.color} text-[10px]`}>
                      {status.label}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Net Salary */}
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">خالص پرداختی</span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(slip.netSalary)}
                  </span>
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="mt-3 space-y-3">
                  {/* Base Salary */}
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground">حقوق پایه</span>
                    <span className="text-sm font-medium">{formatCurrency(slip.baseSalary)}</span>
                  </div>

                  {/* Allowances */}
                  {allowances.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <TrendingUp className="w-3 h-3" />
                        مزایا
                      </div>
                      {allowances.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between py-1.5 px-3 rounded bg-emerald-50/50 dark:bg-emerald-950/10">
                          <span className="text-[11px] text-muted-foreground">{item.title}</span>
                          <span className="text-xs font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">جمع مزایا</span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {formatCurrency(slip.totalAllowances)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Deductions */}
                  {deductions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-300">
                        <TrendingDown className="w-3 h-3" />
                        کسورات
                      </div>
                      {deductions.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between py-1.5 px-3 rounded bg-red-50/50 dark:bg-red-950/10">
                          <span className="text-[11px] text-muted-foreground">{item.title}</span>
                          <span className="text-xs font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                        <span className="text-xs font-medium text-red-700 dark:text-red-300">جمع کسورات</span>
                        <span className="text-xs font-bold text-red-700 dark:text-red-300">
                          {formatCurrency(slip.totalDeductions)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ناخالص</span>
                      <span className="font-medium">{formatCurrency(slip.grossSalary)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">کسورات</span>
                      <span className="font-medium text-red-600">- {formatCurrency(slip.totalDeductions)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">خالص پرداختی</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        {formatCurrency(slip.netSalary)}
                      </span>
                    </div>
                  </div>

                  {slip.overtimeHours > 0 && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                      <span className="text-xs text-amber-700 dark:text-amber-300">اضافه‌کاری</span>
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        {toPersianDigits(slip.overtimeHours)} ساعت
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
