'use client'

import {
  PlaneTakeoff, LogOut, CheckCircle2, AlertCircle,
  TrendingUp, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { OnboardItem, OffboardItem } from '../index'
import { CHART_COLORS, REASON_COLORS } from '../constants'
import { renderSummaryCard } from './shared/helpers'

interface StatisticsTabProps {
  onStats: { total: number; inProgress: number; completed: number; avgProgress: number }
  offStats: { total: number; inProgress: number; completed: number; reasonBreakdown: Record<string, number> }
  onboards: OnboardItem[]
  offboards: OffboardItem[]
}

export function StatisticsTab({ onStats, offStats, onboards, offboards }: StatisticsTabProps) {
  const onCompletionRate = onboards.length > 0
    ? Math.round((onboards.filter(i => i.status === 'completed').length / onboards.length) * 100)
    : 0
  const offCompletionRate = offboards.length > 0
    ? Math.round((offboards.filter(i => i.status === 'completed').length / offboards.length) * 100)
    : 0

  // Bar chart data
  const barData = [
    { name: 'آنبوردینگ - در حال انجام', value: onStats.inProgress, fill: CHART_COLORS[0] },
    { name: 'آنبوردینگ - تکمیل شده', value: onStats.completed, fill: CHART_COLORS[1] },
    { name: 'آفبوردینگ - در حال انجام', value: offStats.inProgress, fill: CHART_COLORS[2] },
    { name: 'آفبوردینگ - تکمیل شده', value: offStats.completed, fill: CHART_COLORS[3] },
  ]

  // Pie chart data
  const pieData = Object.entries(offStats.reasonBreakdown).map(([name, value], idx) => ({
    name, value, fill: CHART_COLORS[idx % CHART_COLORS.length]
  }))

  // Progress distribution
  const progressRanges = [
    { name: '۰-۲۵٪', min: 0, max: 25 },
    { name: '۲۵-۵۰٪', min: 25, max: 50 },
    { name: '۵۰-۷۵٪', min: 50, max: 75 },
    { name: '۷۵-۱۰۰٪', min: 75, max: 100 },
  ]
  const progressDistData = progressRanges.map(range => ({
    name: range.name,
    آنبوردینگ: [...onboards, ...offboards].filter(i => i.progress >= range.min && i.progress < (range.max === 100 ? 101 : range.max)).length,
  }))

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {renderSummaryCard('نرخ تکمیل آنبوردینگ', `${onCompletionRate}٪`, <CheckCircle2 className="w-4 h-4 text-white" />, 'bg-teal-500')}
        {renderSummaryCard('نرخ تکمیل آفبوردینگ', `${offCompletionRate}٪`, <CheckCircle2 className="w-4 h-4 text-white" />, 'bg-rose-500')}
        {renderSummaryCard('کل آنبوردینگ‌ها', onStats.total, <PlaneTakeoff className="w-4 h-4 text-white" />, 'bg-cyan-500')}
        {renderSummaryCard('کل آفبوردینگ‌ها', offStats.total, <LogOut className="w-4 h-4 text-white" />, 'bg-purple-500')}
      </div>

      {/* Reason breakdown badges */}
      {Object.keys(offStats.reasonBreakdown).length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-500" />
              دلایل آفبوردینگ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-3">
              {Object.entries(offStats.reasonBreakdown).map(([reason, count]) => (
                <div key={reason} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${REASON_COLORS[reason] || 'bg-gray-100'}`}>
                  <span className="text-xs font-medium">{reason}</span>
                  <span className="text-xs opacity-70">({toPersianDigits(count)})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-500" />
              تعداد به تفکیک وضعیت
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {barData.every(d => d.value === 0) ? (
              <div className="text-center py-8 text-muted-foreground text-xs">داده‌ای موجود نیست</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              دلایل آفبوردینگ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {pieData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">داده‌ای موجود نیست</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${toPersianDigits(Math.round(percent * 100))}٪)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            توزیع پیشرفت
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {progressDistData.every(d => d.آنبوردینگ === 0) ? (
            <div className="text-center py-8 text-muted-foreground text-xs">داده‌ای موجود نیست</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressDistData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                />
                <Bar dataKey="آنبوردینگ" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
