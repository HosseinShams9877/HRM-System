'use client'

import { TrendingUp, UserCheck, UserX, BarChart3, Building2, PieChart as PieChartIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { PIE_COLORS } from '../constants'
import type { Position } from '../index'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts'

// ============================================
// Statistics Tab — آمار پست‌های سازمانی
// ============================================

interface StatisticsTabProps {
  positions: Position[]
  totalOccupied: number
  totalVacant: number
  totalCapacity: number
  departmentChartData: Array<{ name: string; فعال: number; خالی: number }>
  levelChartData: Array<{ name: string; value: number }>
  fillRateChartData: Array<{ name: string; fillRate: number; occupied: number; capacity: number }>
}

export function StatisticsTab({
  positions,
  totalOccupied,
  totalVacant,
  totalCapacity,
  departmentChartData,
  levelChartData,
  fillRateChartData,
}: StatisticsTabProps) {
  return (
    <div className="space-y-4">
      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
            <div className="text-lg font-bold">{toPersianDigits(positions.length)}</div>
            <div className="text-[11px] text-muted-foreground">کل پست‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <UserCheck className="w-5 h-5 mx-auto text-sky-600 mb-1" />
            <div className="text-lg font-bold">{toPersianDigits(totalOccupied)}</div>
            <div className="text-[11px] text-muted-foreground">نیروی مشغول</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <UserX className="w-5 h-5 mx-auto text-amber-600 mb-1" />
            <div className="text-lg font-bold">{toPersianDigits(totalVacant)}</div>
            <div className="text-[11px] text-muted-foreground">جای خالی</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-5 h-5 mx-auto text-purple-600 mb-1" />
            <div className="text-lg font-bold">
              {toPersianDigits(totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0)}٪
            </div>
            <div className="text-[11px] text-muted-foreground">نرخ اشغال کل</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart - By Department */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              توزیع نیروها به تفکیک دپارتمان
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departmentChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                داده‌ای برای نمایش وجود ندارد
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={departmentChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="فعال" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="خالی" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - By Level */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
              توزیع پست‌ها به تفکیک سطح
            </CardTitle>
          </CardHeader>
          <CardContent>
            {levelChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                داده‌ای برای نمایش وجود ندارد
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={levelChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${toPersianDigits(Math.round(percent * 100))}٪`}
                  >
                    {levelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Fill Rate Chart */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              نرخ اشغال پست‌های فعال (بیشترین اول)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fillRateChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                داده‌ای برای نمایش وجود ندارد
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fillRateChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${toPersianDigits(v)}٪`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'fillRate') return [toPersianDigits(value) + '٪', 'نرخ اشغال']
                      return [toPersianDigits(value), name]
                    }}
                  />
                  <Bar dataKey="fillRate" name="fillRate" radius={[4, 4, 0, 0]}>
                    {fillRateChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.fillRate >= 90 ? '#ef4444' :
                          entry.fillRate >= 70 ? '#f59e0b' :
                          '#10b981'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
