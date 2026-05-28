'use client'

import { useState, useEffect } from 'react'
import {
  Loader2, BarChart3, Building2,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { STATUS_MAP, RIALS_TO_TOMANS } from '../constants'
import type { PayrollDetailSummary } from '../index'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/core/components/ui/chart'

// ============================================
// Reports Tab
// ============================================

export function ReportsTab({ year, month }: { year: number; month: number }) {
  const [summaryData, setSummaryData] = useState<PayrollDetailSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('year', String(year))
        if (month) params.set('month', String(month))
        const res = await fetch(`/api/payroll/summary?${params.toString()}`)
        if (res.ok) {
          const json = await res.json()
          setSummaryData(json)
        }
      } catch (err) {
        console.error('Fetch summary error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [year, month])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!summaryData || summaryData.totals.count === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">داده‌ای برای نمایش گزارش وجود ندارد</p>
        <p className="text-xs mt-1">ابتدا فیش حقوقی صادر کنید</p>
      </div>
    )
  }

  const { totals, countByStatus, departmentBreakdown } = summaryData

  // Bar chart data - monthly summary
  const barChartData = [
    { name: 'حقوق پایه', value: RIALS_TO_TOMANS(totals.totalBaseSalary), fill: 'var(--color-base)' },
    { name: 'مزایا', value: RIALS_TO_TOMANS(totals.totalAllowances), fill: 'var(--color-allowances)' },
    { name: 'کسورات', value: RIALS_TO_TOMANS(totals.totalDeductions), fill: 'var(--color-deductions)' },
    { name: 'خالص', value: RIALS_TO_TOMANS(totals.totalNetSalary), fill: 'var(--color-net)' },
  ]

  const barChartConfig: ChartConfig = {
    base: { label: 'حقوق پایه', color: '#3b82f6' },
    allowances: { label: 'مزایا', color: '#10b981' },
    deductions: { label: 'کسورات', color: '#f43f5e' },
    net: { label: 'خالص', color: '#059669' },
  }

  // Status distribution pie chart
  const statusColors: Record<string, string> = {
    draft: '#f59e0b',
    confirmed: '#3b82f6',
    paid: '#10b981',
    closed: '#6b7280',
  }
  const pieData = Object.entries(countByStatus).map(([status, count]) => ({
    name: STATUS_MAP[status]?.label || status,
    value: count,
    fill: statusColors[status] || '#94a3b8',
  }))

  const pieChartConfig: ChartConfig = Object.fromEntries(
    Object.entries(countByStatus).map(([status]) => [
      status,
      { label: STATUS_MAP[status]?.label || status, color: statusColors[status] || '#94a3b8' }
    ])
  )

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">کل فیش‌ها</div>
            <div className="text-2xl font-bold">{toPersianDigits(totals.count)}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">میانگین حقوق پایه</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(RIALS_TO_TOMANS(summaryData.averages.baseSalary))}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">میانگین خالص</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(RIALS_TO_TOMANS(summaryData.averages.netSalary))}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">جمع خالص پرداختی</div>
            <div className="text-lg font-bold text-teal-700 dark:text-teal-300">{formatCurrency(RIALS_TO_TOMANS(totals.totalNetSalary))}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Summary Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              خلاصه ماهانه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[250px] w-full">
              <BarChart data={barChartData} layout="vertical" margin={{ right: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <YAxis type="category" dataKey="name" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              توزیع وضعیت فیش‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name} (${toPersianDigits(value)})`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      {departmentBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              تفکیک دپارتمان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departmentBreakdown
                .sort((a, b) => b.totalNetSalary - a.totalNetSalary)
                .map(dept => {
                  const maxSalary = Math.max(...departmentBreakdown.map(d => d.totalNetSalary))
                  const widthPercent = maxSalary > 0 ? (dept.totalNetSalary / maxSalary) * 100 : 0
                  return (
                    <div key={dept.department} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{dept.department}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{toPersianDigits(dept.count)} نفر</span>
                          <span className="font-mono font-semibold text-foreground">{formatCurrency(RIALS_TO_TOMANS(dept.totalNetSalary))}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
