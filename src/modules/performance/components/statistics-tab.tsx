'use client'

import { useMemo } from 'react'
import {
  BarChart3, TrendingUp, Award, AlertTriangle, Target, User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import type { Performance } from '../index'
import { STATUS_MAP, CHART_COLORS, PIE_COLORS } from '../constants'

interface StatisticsTabProps {
  items: Performance[]
}

export function StatisticsTab({ items }: StatisticsTabProps) {
  const stats = useMemo(() => {
    const total = items.length
    const metTarget = items.filter(i => i.score >= i.target).length
    const needImprovement = items.filter(i => i.score < i.target * 0.7).length
    const avgScore = total ? items.reduce((s, i) => s + i.score, 0) / total : 0
    const maxScore = total ? Math.max(...items.map(i => i.score)) : 0
    const minScore = total ? Math.min(...items.map(i => i.score)) : 0
    const targetRate = total ? Math.round((metTarget / total) * 100) : 0
    return { total, metTarget, needImprovement, avgScore, maxScore, minScore, targetRate }
  }, [items])

  const periodBarData = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>()
    items.forEach(i => {
      const curr = map.get(i.period) || { total: 0, count: 0 }
      curr.total += i.score
      curr.count += 1
      map.set(i.period, curr)
    })
    return Array.from(map.entries())
      .map(([period, { total, count }]) => ({ period, avg: +(total / count).toFixed(2), count }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [items])

  const statusPieData = useMemo(() => {
    const map: Record<string, number> = { pending: 0, completed: 0, reviewed: 0 }
    items.forEach(i => { map[i.status] = (map[i.status] || 0) + 1 })
    return Object.entries(map).map(([status, count]) => ({
      name: STATUS_MAP[status]?.label || status,
      value: count,
      status,
    }))
  }, [items])

  const scoreDistributionData = useMemo(() => {
    const ranges = [
      { label: '۰-۱', min: 0, max: 1 },
      { label: '۱-۲', min: 1, max: 2 },
      { label: '۲-۳', min: 2, max: 3 },
      { label: '۳-۴', min: 3, max: 4 },
      { label: '۴-۵', min: 4, max: 5 },
    ]
    return ranges.map(r => ({
      range: r.label,
      count: items.filter(i => i.score >= r.min && i.score < r.max).length + (r.max === 5 ? items.filter(i => i.score === 5).length : 0),
    }))
  }, [items])

  if (items.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">داده‌ای برای نمایش آمار وجود ندارد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Award className="w-5 h-5 mx-auto mb-2 text-purple-500" />
            <div className="text-xl font-bold">{toPersianDigits(+stats.avgScore.toFixed(1))}</div>
            <div className="text-[10px] text-muted-foreground mt-1">میانگین نمره کل</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
            <div className="text-xl font-bold text-emerald-600">{toPersianDigits(+stats.maxScore.toFixed(1))}</div>
            <div className="text-[10px] text-muted-foreground mt-1">بالاترین نمره</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-red-500" />
            <div className="text-xl font-bold text-red-600">{toPersianDigits(+stats.minScore.toFixed(1))}</div>
            <div className="text-[10px] text-muted-foreground mt-1">پایین‌ترین نمره</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Target className="w-5 h-5 mx-auto mb-2 text-amber-500" />
            <div className="text-xl font-bold text-amber-600">{toPersianDigits(stats.targetRate)}٪</div>
            <div className="text-[10px] text-muted-foreground mt-1">نرخ تحقق هدف</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart: Scores by Period */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              نمرات به تفکیک دوره
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={periodBarData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="avg" name="میانگین نمره" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              وضعیت ارزیابی‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${toPersianDigits(value)})`}
                >
                  {statusPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            توزیع کارکنان در بازه‌های نمره
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" name="تعداد کارکنان" radius={[4, 4, 0, 0]}>
                {scoreDistributionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  )
}
