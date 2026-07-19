'use client'

import {
  BarChart3, TrendingUp, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Progress } from '@/core/components/ui/progress'
import { toPersianDigits } from '@/core/lib/utils-fa'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'
import type { MissionStats, MissionRecord } from '../types/types'
import { PIE_COLORS } from '../constants'

// ============================================
// Statistics Tab
// ============================================

export function StatisticsTab({
  stats,
  missions,
}: {
  stats: MissionStats
  missions: MissionRecord[]
}) {
  // ---- Statistics data ----
  const barChartData = [
    { name: 'در انتظار', value: stats.pending, fill: '#f59e0b' },
    { name: 'تایید شده', value: stats.approved, fill: '#10b981' },
    { name: 'رد شده', value: stats.rejected, fill: '#ef4444' },
  ]

  const pieChartData = [
    { name: 'در انتظار', value: stats.pending },
    { name: 'تایید شده', value: stats.approved },
    { name: 'رد شده', value: stats.rejected },
  ].filter((d) => d.value > 0)

  // Destination ranking
  const destinationMap = new Map<string, number>()
  missions.forEach((m) => {
    const dest = m.destination || 'نامشخص'
    destinationMap.set(dest, (destinationMap.get(dest) || 0) + 1)
  })
  const destinationRanking = Array.from(destinationMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
  const maxDestCount = destinationRanking.length > 0 ? destinationRanking[0].count : 1

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="border-0 shadow-sm" dir='rtl'>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              توزیع وضعیت مأموریت‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v: number) => toPersianDigits(v)} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-sm" dir='rtl'>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              نسبت وضعیت‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: { name: string; percent: number }) =>
                        `${name} ${toPersianDigits(Math.round(percent * 100))}%`
                      }
                    >
                      {pieChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  داده‌ای برای نمایش نیست
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Destination Ranking */}
      <Card className="border-0 shadow-sm" dir='rtl'>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            رتبه‌بندی مقاصد مأموریت
          </CardTitle>
        </CardHeader>
        <CardContent>
          {destinationRanking.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              داده‌ای برای نمایش نیست
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {destinationRanking.map((dest, idx) => (
                <div
                  key={dest.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                      idx === 0
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                        : idx === 1
                          ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                          : idx === 2
                            ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                            : 'bg-gradient-to-br from-sky-400 to-sky-500'
                    }`}
                  >
                    {toPersianDigits(idx + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-500 flex-shrink-0" />
                      {dest.name}
                    </p>
                    <div className="mt-1">
                      <Progress value={(dest.count / maxDestCount) * 100} className="h-1.5" />
                    </div>
                  </div>
                  <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 text-[11px] flex-shrink-0">
                    {toPersianDigits(dest.count)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
