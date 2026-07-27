'use client'

import {
  GraduationCap, Users, BarChart3, CheckCircle2, Award, Clock, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/core/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import type { Training } from '../index'
import { CATEGORY_MAP } from '../constants'

// ============================================
// Statistics Tab
// ============================================

export interface StatisticsTabProps {
  items: Training[]
}

export function StatisticsTab({ items }: StatisticsTabProps) {
  const totalCourses = items.length
  const plannedCount = items.filter(i => i.status === 'planned').length
  const inProgressCount = items.filter(i => i.status === 'in_progress').length
  const completedCount = items.filter(i => i.status === 'completed').length

  const allParticipants = items.flatMap(i => i.participants)
  const completedParticipants = allParticipants.filter(p => p.status === 'completed').length
  const absentParticipants = allParticipants.filter(p => p.status === 'absent').length
  const attendingParticipants = allParticipants.filter(p => p.status === 'attending' || p.status === 'registered').length

  const completionRate = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0
  const scores = allParticipants.filter(p => p.score !== null).map(p => p.score as number)
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const totalHours = items.reduce((sum, i) => sum + (i.duration || 0), 0)

  // Bar chart data: courses by status
  const barData = [
    { name: 'برنامه‌ریزی شده', value: plannedCount, fill: 'var(--color-planned)' },
    { name: 'در حال برگزاری', value: inProgressCount, fill: 'var(--color-inProgress)' },
    { name: 'تکمیل شده', value: completedCount, fill: 'var(--color-completed)' },
  ]

  const barConfig: ChartConfig = {
    planned: { label: 'برنامه‌ریزی شده', color: '#3b82f6' },
    inProgress: { label: 'در حال برگزاری', color: '#f59e0b' },
    completed: { label: 'تکمیل شده', color: '#10b981' },
  }

  // Pie chart data: participant status
  const pieData = [
    { name: 'حاضر', value: attendingParticipants, fill: 'var(--color-attending)' },
    { name: 'تکمیل', value: completedParticipants, fill: 'var(--color-completedP)' },
    { name: 'غایب', value: absentParticipants, fill: 'var(--color-absent)' },
  ]

  const pieConfig: ChartConfig = {
    attending: { label: 'حاضر', color: '#3b82f6' },
    completedP: { label: 'تکمیل', color: '#10b981' },
    absent: { label: 'غایب', color: '#ef4444' },
  }

  const PIE_COLORS = ['#3b82f6', '#10b981', '#ef4444']

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold">{toPersianDigits(totalCourses)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">کل دوره‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{toPersianDigits(completionRate)}٪</div>
            <div className="text-[10px] text-muted-foreground mt-1">نرخ تکمیل</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{toPersianDigits(avgScore.toFixed(1))}</div>
            <div className="text-[10px] text-muted-foreground mt-1">میانگین نمرات</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{toPersianDigits(totalHours)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">کل ساعت آموزش</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2" dir='rtl'>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              تعداد دوره به تفکیک وضعیت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[250px] w-full">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(v: number) => toPersianDigits(v)} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2" dir='rtl'>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              وضعیت شرکت‌کنندگان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${toPersianDigits(Math.round(percent * 100))}٪`}
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2" dir='rtl'>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            توزیع دوره‌ها بر اساس دسته‌بندی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(CATEGORY_MAP).map(([key, val]) => {
              const count = items.filter(i => i.category === key).length
              const Icon = val.icon
              return (
                <div key={key} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/30">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <div className="text-lg font-bold">{toPersianDigits(count)}</div>
                  <div className="text-[10px] text-muted-foreground">{val.label}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
