'use client'

import {
  BarChart3, PieChart as PieChartIcon, FileText,
  Activity, Clock, CheckCircle2, Building2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Progress } from '@/core/components/ui/progress'
import { toPersianDigits } from '@/core/lib/utils-fa'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts'
import { CHART_COLORS } from '../constants'
import type { Appointment } from '../index'

export function StatisticsTab({ appointments }: { appointments: Appointment[] }) {
  // Data for bar chart: count by type
  const typeData = [
    { name: 'اصلی', value: appointments.filter(a => a.type === 'اصلی').length, fill: '#0ea5e9' },
    { name: 'سرپرست', value: appointments.filter(a => a.type === 'سرپرست').length, fill: '#a855f7' },
    { name: 'موقت', value: appointments.filter(a => a.type === 'موقت').length, fill: '#f59e0b' },
    { name: 'Acting', value: appointments.filter(a => a.type === 'Acting').length, fill: '#f43f5e' },
  ]

  // Data for pie chart: count by status
  const statusData = [
    { name: 'فعال', value: appointments.filter(a => a.status === 'active').length },
    { name: 'پایان‌یافته', value: appointments.filter(a => a.status === 'ended').length },
    { name: 'لغوشده', value: appointments.filter(a => a.status === 'cancelled').length },
  ]

  // Department breakdown
  const deptMap = new Map<string, number>()
  appointments.forEach(apt => {
    const deptName = apt.position.department?.name || 'بدون دپارتمان'
    deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1)
  })
  const deptData = Array.from(deptMap.entries()).map(([name, value]) => ({ name, value }))

  const total = appointments.length
  const active = appointments.filter(a => a.status === 'active').length
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-emerald-500 to-teal-500" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">نرخ انتصابات فعال</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold">{toPersianDigits(activePercent)}٪</div>
            <Progress value={activePercent} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {toPersianDigits(active)} از {toPersianDigits(total)} انتصاب فعال هستند
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-sky-500 to-blue-500" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">مجموع انتصابات</span>
              <FileText className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-3xl font-bold">{toPersianDigits(total)}</div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                فعال: {toPersianDigits(appointments.filter(a => a.status === 'active').length)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                پایان‌یافته: {toPersianDigits(appointments.filter(a => a.status === 'ended').length)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-purple-500 to-fuchsia-500" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">دپارتمان‌ها</span>
              <Building2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-3xl font-bold">{toPersianDigits(deptData.length)}</div>
            <p className="text-xs text-muted-foreground mt-3">
              {toPersianDigits(appointments.filter(a => a.status === 'cancelled').length)} انتصاب لغوشده
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart - By Type */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-500" />
              توزیع بر اساس نوع انتصاب
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[260px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - By Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-500" />
              توزیع بر اساس وضعیت
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[260px] flex items-center" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department breakdown */}
      {deptData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              توزیع انتصابات بر اساس دپارتمان
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
