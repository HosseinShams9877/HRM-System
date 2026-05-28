'use client'

import { useMemo } from 'react'
import {
  Clock, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Progress } from '@/core/components/ui/progress'
import { toPersianDigits } from '@/core/lib/utils-fa'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/core/components/ui/chart'
import type { AttendanceStats, AttendanceRecord, TrendDataPoint } from '../index'
import { attendanceTrendConfig, statusDistConfig, pieConfig } from '../index'

// ============================================
// Statistics Tab
// ============================================

export function StatisticsTab({
  stats,
  data,
  trendData,
}: {
  stats: AttendanceStats
  data: { records: AttendanceRecord[]; stats: AttendanceStats } | null
  trendData: TrendDataPoint[]
}) {
  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

  const avgWorkHours = useMemo(() => {
    if (!data?.records) return 0
    const withHours = data.records.filter(r => r.workHours && r.workHours > 0)
    if (withHours.length === 0) return 0
    return Math.round((withHours.reduce((sum, r) => sum + (r.workHours || 0), 0) / withHours.length) * 10) / 10
  }, [data])

  const avgLateMinutes = useMemo(() => {
    if (!data?.records) return 0
    const lateRecords = data.records.filter(r => r.status === 'late' && r.checkIn)
    if (lateRecords.length === 0) return 0
    // Estimate: if check-in after 8:30, how many minutes late
    let totalLateMin = 0
    lateRecords.forEach(r => {
      if (r.checkIn) {
        const [h, m] = r.checkIn.split(':').map(Number)
        const minutesFromMidnight = h * 60 + m
        const threshold = 8 * 60 + 30 // 8:30
        if (minutesFromMidnight > threshold) {
          totalLateMin += minutesFromMidnight - threshold
        }
      }
    })
    return Math.round(totalLateMin / lateRecords.length)
  }, [data])

  const totalOvertime = useMemo(() => {
    if (!data?.records) return 0
    return data.records.reduce((sum, r) => sum + (r.overtime && r.overtime > 0 ? r.overtime : 0), 0)
  }, [data])

  // Status distribution chart data
  const statusDistData = useMemo(() => [
    { status: 'حاضر', value: stats.present, fill: '#10b981' },
    { status: 'غایب', value: stats.absent, fill: '#ef4444' },
    { status: 'تاخیر', value: stats.late, fill: '#f59e0b' },
    { status: 'مرخصی', value: stats.leave, fill: '#a855f7' },
    { status: 'مأموریت', value: stats.mission, fill: '#0ea5e9' },
  ], [stats])

  // Pie chart data
  const pieData = useMemo(() => [
    { name: 'حاضر', value: stats.present, fill: '#10b981' },
    { name: 'غایب', value: stats.absent, fill: '#ef4444' },
    { name: 'تاخیر', value: stats.late, fill: '#f59e0b' },
    { name: 'مرخصی', value: stats.leave, fill: '#a855f7' },
    { name: 'مأموریت', value: stats.mission, fill: '#0ea5e9' },
  ], [stats])

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{toPersianDigits(attendanceRate)}٪</div>
                <div className="text-[11px] text-muted-foreground">نرخ حضور</div>
              </div>
            </div>
            <Progress value={attendanceRate} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{toPersianDigits(avgWorkHours)}</div>
                <div className="text-[11px] text-muted-foreground">میانگین ساعات کار</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{toPersianDigits(avgLateMinutes)}</div>
                <div className="text-[11px] text-muted-foreground">میانگین تاخیر (دقیقه)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{toPersianDigits(Math.round(totalOvertime * 10) / 10)}</div>
                <div className="text-[11px] text-muted-foreground">تعداد اضافه‌کاری (ساعت)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Area Chart: 7-Day Attendance Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              روند حضور ۷ روز اخیر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={attendanceTrendConfig} className="h-[250px] w-full">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              توزیع وضعیت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusDistConfig} className="h-[250px] w-full">
              <BarChart data={statusDistData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart Row */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-sky-500" />
            درصد حضور و غیاب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieConfig} className="mx-auto h-[300px] w-full max-w-[400px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${toPersianDigits(Math.round(percent * 100))}٪`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
