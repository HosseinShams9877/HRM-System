// src/modules/recruitment/components/StatisticsTab.tsx
'use client'

import { Briefcase, Users, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/core/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'

interface Recruitment {
  id: string
  title: string
  department: string | null
  position: string | null
  status: string
  applicants: number
  createdAt: string
  updatedAt: string
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#0ea5e9', '#6b7280']

export function StatisticsTab({ items }: { items: Recruitment[] }) {
  const totalPositions = items.length
  const openCount = items.filter(i => i.status === 'open').length
  const interviewingCount = items.filter(i => i.status === 'interviewing').length
  const offeredCount = items.filter(i => i.status === 'offered').length
  const hiredCount = items.filter(i => i.status === 'hired').length
  const closedCount = items.filter(i => i.status === 'closed').length

  const totalApplicants = items.reduce((s, i) => s + i.applicants, 0)
  const activePositions = items.filter(i => ['open', 'interviewing', 'offered'].includes(i.status)).length
  const conversionRate = totalPositions > 0 ? Math.round((hiredCount / totalPositions) * 100) : 0
  const avgApplicants = totalPositions > 0 ? Math.round(totalApplicants / totalPositions) : 0

  const barData = [
    { name: 'باز', value: openCount, fill: 'var(--color-open)' },
    { name: 'مصاحبه', value: interviewingCount, fill: 'var(--color-interviewing)' },
    { name: 'پیشنهاد شغل', value: offeredCount, fill: 'var(--color-offered)' },
    { name: 'استخدام شده', value: hiredCount, fill: 'var(--color-hired)' },
    { name: 'بسته شده', value: closedCount, fill: 'var(--color-closed)' },
  ]

  const barConfig: ChartConfig = {
    open: { label: 'باز', color: '#10b981' },
    interviewing: { label: 'مصاحبه', color: '#3b82f6' },
    offered: { label: 'پیشنهاد شغل', color: '#8b5cf6' },
    hired: { label: 'استخدام شده', color: '#0ea5e9' },
    closed: { label: 'بسته شده', color: '#6b7280' },
  }

  const pieData = [
    { name: 'باز', value: openCount, fill: 'var(--color-pOpen)' },
    { name: 'مصاحبه', value: interviewingCount, fill: 'var(--color-pInterviewing)' },
    { name: 'پیشنهاد شغل', value: offeredCount, fill: 'var(--color-pOffered)' },
    { name: 'استخدام شده', value: hiredCount, fill: 'var(--color-pHired)' },
    { name: 'بسته شده', value: closedCount, fill: 'var(--color-pClosed)' },
  ].filter(d => d.value > 0)

  const pieConfig: ChartConfig = {
    pOpen: { label: 'باز', color: '#10b981' },
    pInterviewing: { label: 'مصاحبه', color: '#3b82f6' },
    pOffered: { label: 'پیشنهاد شغل', color: '#8b5cf6' },
    pHired: { label: 'استخدام شده', color: '#0ea5e9' },
    pClosed: { label: 'بسته شده', color: '#6b7280' },
  }

  if (totalPositions === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-sm">داده‌ای برای نمایش آمار موجود نیست</p>
        <p className="text-xs mt-1">ابتدا یک موقعیت شغلی ایجاد کنید</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{toPersianDigits(totalPositions)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">کل موقعیت‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-sky-600">{toPersianDigits(conversionRate)}٪</div>
            <div className="text-[10px] text-muted-foreground mt-1">نرخ تبدیل</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{toPersianDigits(avgApplicants)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">میانگین متقاضیان</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{toPersianDigits(activePositions)}</div>
            <div className="text-[10px] text-muted-foreground mt-1">موقعیت‌های فعال</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              تعداد موقعیت به تفکیک وضعیت
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

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              توزیع وضعیت موقعیت‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
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
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                داده‌ای موجود نیست
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}