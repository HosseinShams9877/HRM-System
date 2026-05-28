'use client'

import { useMemo } from 'react'
import {
  BarChart3, PieChart as PieChartIcon, FileText,
  Users, TrendingUp, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Separator } from '@/core/components/ui/separator'
import { Progress } from '@/core/components/ui/progress'
import { toPersianDigits } from '@/core/lib/utils-fa'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/core/components/ui/chart'
import { LEAVE_TYPE_CONFIG, DEFAULT_LEAVE_TYPE, barChartConfig, pieChartConfig } from '../constants'
import type { LeaveRecord, LeaveStats } from '../index'

export interface LeavesStatsTabProps {
  stats: LeaveStats
  leaves: LeaveRecord[]
}

export function LeavesStatsTab({ stats, leaves }: LeavesStatsTabProps) {
  // Chart data: Bar chart by type
  const typeBarData = useMemo(() => {
    const typeCounts: Record<string, number> = {}
    leaves.forEach(l => {
      typeCounts[l.type] = (typeCounts[l.type] || 0) + 1
    })
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      fill: (LEAVE_TYPE_CONFIG[type] || DEFAULT_LEAVE_TYPE).color,
    }))
  }, [leaves])

  // Chart data: Pie chart by status
  const statusPieData = useMemo(() => [
    { name: 'در انتظار', value: stats.pending, fill: '#f59e0b' },
    { name: 'تایید شده', value: stats.approved, fill: '#10b981' },
    { name: 'رد شده', value: stats.rejected, fill: '#ef4444' },
  ], [stats])

  // Type breakdown for statistics tab
  const typeBreakdown = useMemo(() => {
    const breakdown: Record<string, { total: number; pending: number; approved: number; rejected: number }> = {}
    leaves.forEach(l => {
      if (!breakdown[l.type]) {
        breakdown[l.type] = { total: 0, pending: 0, approved: 0, rejected: 0 }
      }
      breakdown[l.type].total++
      if (l.status === 'pending') breakdown[l.type].pending++
      if (l.status === 'approved') breakdown[l.type].approved++
      if (l.status === 'rejected') breakdown[l.type].rejected++
    })
    return breakdown
  }, [leaves])

  // Approval rate
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0

  if (leaves.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-16 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-sm font-medium text-muted-foreground">داده‌ای برای نمایش آمار موجود نیست</h3>
          <p className="text-xs text-muted-foreground mt-1">ابتدا درخواست مرخصی ثبت کنید</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart - By Type */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              توزیع مرخصی بر اساس نوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[280px] w-full">
              <BarChart data={typeBarData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => toPersianDigits(v)} />
                <YAxis
                  type="category"
                  dataKey="type"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {typeBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - By Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-500" />
              توزیع وضعیت درخواست‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[280px] w-full">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${toPersianDigits(value)}`}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Type Breakdown Grid */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            تفکیک بر اساس نوع مرخصی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {Object.entries(typeBreakdown).map(([type, counts]) => {
              const typeConf = LEAVE_TYPE_CONFIG[type] || DEFAULT_LEAVE_TYPE
              const typeRate = counts.total > 0 ? Math.round((counts.approved / counts.total) * 100) : 0
              return (
                <Card key={type} className="overflow-hidden shadow-sm">
                  <div className={`h-1.5 ${typeConf.gradientBorder}`} />
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{type}</span>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${typeConf.gradientFrom} ${typeConf.gradientTo}`} />
                    </div>
                    <div className="text-lg font-bold">{toPersianDigits(counts.total)}</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">نرخ تایید</span>
                        <span className="font-medium">{toPersianDigits(typeRate)}٪</span>
                      </div>
                      <Progress value={typeRate} className="h-1.5" />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div>
                        <div className="text-[10px] text-amber-600 font-bold">{toPersianDigits(counts.pending)}</div>
                        <div className="text-[9px] text-muted-foreground">منتظر</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-600 font-bold">{toPersianDigits(counts.approved)}</div>
                        <div className="text-[9px] text-muted-foreground">تایید</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-red-600 font-bold">{toPersianDigits(counts.rejected)}</div>
                        <div className="text-[9px] text-muted-foreground">رد</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {Object.keys(typeBreakdown).length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                داده‌ای موجود نیست
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold">{toPersianDigits(stats.total)}</div>
              <div className="text-[11px] text-muted-foreground">کل درخواست‌ها</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold">{toPersianDigits(approvalRate)}٪</div>
              <div className="text-[11px] text-muted-foreground">نرخ تایید</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold">{toPersianDigits(stats.pending)}</div>
              <div className="text-[11px] text-muted-foreground">نیاز به اقدام</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
