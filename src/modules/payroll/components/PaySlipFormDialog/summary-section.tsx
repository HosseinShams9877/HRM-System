// src/modules/payroll/components/PaySlipFormDialog/summary-section.tsx

'use client'

import { formatCurrency } from '@/core/lib/utils-fa'

interface SummarySectionProps {
  baseSalary: number
  totalAllowances: number
  totalDeductions: number
  grossSalary: number
  netSalary: number
}

export function SummarySection({
  baseSalary,
  totalAllowances,
  totalDeductions,
  grossSalary,
  netSalary,
}: SummarySectionProps) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground mb-1">حقوق پایه</div>
          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(baseSalary)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">جمع مزایا</div>
          <div className="text-sm font-bold text-teal-700 dark:text-teal-300">
            {formatCurrency(totalAllowances)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">ناخالص</div>
          <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
            {formatCurrency(grossSalary)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">جمع کسورات</div>
          <div className="text-sm font-bold text-rose-700 dark:text-rose-300">
            {formatCurrency(totalDeductions)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">خالص پرداختی</div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(netSalary)}
          </div>
        </div>
      </div>
    </div>
  )
}