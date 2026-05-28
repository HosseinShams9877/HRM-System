'use client'

import { Award, CreditCard, BarChart3, CheckCircle2, Calculator, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Progress } from '@/core/components/ui/progress'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { REWARD_TYPES, REWARD_TYPE_CONFIG, LOAN_STATUS, CHART_COLORS } from '../constants'
import type { Reward, Loan } from '../index'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

// ============================================
// Statistics Tab — آمار رفاهی
// ============================================

interface StatisticsTabProps {
  rewards: Reward[]
  loans: Loan[]
  loading: boolean
  rewardSummary: { total: number; cash: number; nonCash: number; totalAmount: number }
  loanSummary: { total: number; pending: number; approved: number; totalAmount: number }
  rewardsByTypeData: Array<{ name: string; value: number }>
  loanStatusData: Array<{ name: string; value: number }>
  statsMetrics: { totalRewards: number; totalLoans: number; approvalRate: number; avgLoanAmount: number }
}

export function StatisticsTab({
  rewards,
  loans,
  loading,
  rewardSummary,
  loanSummary,
  rewardsByTypeData,
  loanStatusData,
  statsMetrics,
}: StatisticsTabProps) {
  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
              <Award className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">کل پاداش‌ها</p>
              <p className="text-sm font-bold">{toPersianDigits(statsMetrics.totalRewards)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30">
              <CreditCard className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">کل وام‌ها</p>
              <p className="text-sm font-bold">{toPersianDigits(statsMetrics.totalLoans)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">نرخ تایید وام</p>
              <p className="text-sm font-bold">{toPersianDigits(statsMetrics.approvalRate)}٪</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Calculator className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">میانگین مبلغ وام</p>
              <p className="text-sm font-bold">{formatCurrency(statsMetrics.avgLoanAmount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart: Rewards by Type */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-pink-600" />
              مبالغ پاداش به تفکیک نوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rewardsByTypeData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-xs">
                داده‌ای برای نمایش وجود ندارد
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rewardsByTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => v.toLocaleString('fa-IR')} />
                    <YAxis type="category" dataKey="name" width={60} />
                    <Tooltip
                      formatter={(value: number) => [value.toLocaleString('fa-IR') + ' تومان', 'مبلغ']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {rewardsByTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart: Loan Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-600" />
              وضعیت درخواست‌های وام
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loanStatusData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-xs">
                داده‌ای برای نمایش وجود ندارد
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={loanStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${toPersianDigits(value)})`}
                    >
                      {loanStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            جزئیات آماری
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reward breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground">تفکیک پاداش‌ها</h4>
              {REWARD_TYPES.map(type => {
                const typeRewards = rewards.filter(r => r.type === type)
                const typeAmount = typeRewards.reduce((s, r) => s + (r.amount || 0), 0)
                const pct = rewardSummary.totalAmount > 0 ? Math.round((typeAmount / rewardSummary.totalAmount) * 100) : 0
                const conf = REWARD_TYPE_CONFIG[type]
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span>{conf.icon}</span>
                        <span>{conf.label}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {toPersianDigits(typeRewards.length)}
                        </Badge>
                      </span>
                      <span className="font-medium">{formatCurrency(typeAmount)}</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                )
              })}
            </div>

            {/* Loan breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground">تفکیک وام‌ها</h4>
              {Object.entries(LOAN_STATUS).map(([key, conf]) => {
                const statusLoans = loans.filter(l => l.status === key)
                const statusAmount = statusLoans.reduce((s, l) => s + l.amount, 0)
                const pct = loanSummary.totalAmount > 0 ? Math.round((statusAmount / loanSummary.totalAmount) * 100) : 0
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <Badge className={`text-[10px] ${conf.color}`}>{conf.label}</Badge>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {toPersianDigits(statusLoans.length)}
                        </Badge>
                      </span>
                      <span className="font-medium">{formatCurrency(statusAmount)}</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
