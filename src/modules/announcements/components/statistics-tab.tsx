'use client'

import {
  Megaphone, BookOpen, BarChart3, PieChart as PieChartIcon,
  TrendingUp, Activity, ChevronLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/components/ui/card'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Progress } from '@/core/components/ui/progress'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import type { Announcement, Regulation, AnnStats, RegStats } from '../index'
import { PIE_COLORS } from '../constants'

// ============================================
// Stat Card Component
// ============================================

function StatCard({
  title, value, icon: Icon, iconBg, trend
}: {
  title: string
  value: number
  icon: React.ElementType
  iconBg: string
  trend?: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{toPersianDigits(value)}</p>
            {trend && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Statistics Tab Props & Component
// ============================================

export interface StatisticsTabProps {
  announcements: Announcement[]
  regulations: Regulation[]
  annStats: AnnStats
  regStats: RegStats
  annPriorityChartData: { name: string; value: number; fill: string }[]
  regStatusChartData: { name: string; value: number }[]
  recentActivity: { type: 'ann' | 'reg'; title: string; date: string; icon: React.ElementType; color: string }[]
}

export function StatisticsTab({
  announcements,
  regulations,
  annStats,
  regStats,
  annPriorityChartData,
  regStatusChartData,
  recentActivity,
}: StatisticsTabProps) {
  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="کل اطلاعیه‌ها"
          value={annStats.total}
          icon={Megaphone}
          iconBg="bg-blue-500"
          trend={`${toPersianDigits(annStats.active)} فعال`}
        />
        <StatCard
          title="کل آیین‌نامه‌ها"
          value={regStats.total}
          icon={BookOpen}
          iconBg="bg-violet-500"
          trend={`${toPersianDigits(regStats.active)} فعال`}
        />
        <StatCard
          title="اطلاعیه‌های مهم"
          value={annStats.high}
          icon={Activity}
          iconBg="bg-red-500"
        />
        <StatCard
          title="فعالیت اخیر"
          value={annStats.recent + regStats.revoked}
          icon={Activity}
          iconBg="bg-emerald-500"
          trend="۷ روز اخیر"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar Chart: Announcements by Priority */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              اطلاعیه‌ها بر اساس اولویت
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {announcements.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                داده‌ای برای نمایش وجود ندارد
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={annPriorityChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip
                    formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                    contentStyle={{ fontSize: 12, direction: 'rtl' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {annPriorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart: Regulation Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-violet-500" />
              توزیع وضعیت آیین‌نامه‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {regulations.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                داده‌ای برای نمایش وجود ندارد
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={regStatusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${toPersianDigits(value)}`}
                  >
                    {regStatusChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [toPersianDigits(value), 'تعداد']}
                    contentStyle={{ fontSize: 12, direction: 'rtl' }}
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

      {/* Recent Activity Timeline */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            فعالیت‌های اخیر
          </CardTitle>
          <CardDescription className="text-xs">آخرین اطلاعیه‌ها و آیین‌نامه‌های منتشر شده</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {recentActivity.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
              فعالیتی ثبت نشده است
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {recentActivity.map((item, idx) => {
                const IconComp = item.icon
                return (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted">
                          <IconComp className={`w-4 h-4 ${item.color}`} />
                        </AvatarFallback>
                      </Avatar>
                      {idx < recentActivity.length - 1 && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-3 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.type === 'ann' ? 'اطلاعیه' : 'آیین‌نامه'} • {formatShamsi(item.date)}
                      </p>
                    </div>
                    <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Progress */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            خلاصه وضعیت
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>اطلاعیه‌های فعال</span>
              <span className="text-muted-foreground">
                {toPersianDigits(annStats.active)} از {toPersianDigits(annStats.total)}
              </span>
            </div>
            <Progress value={annStats.total > 0 ? (annStats.active / annStats.total) * 100 : 0} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>آیین‌نامه‌های فعال</span>
              <span className="text-muted-foreground">
                {toPersianDigits(regStats.active)} از {toPersianDigits(regStats.total)}
              </span>
            </div>
            <Progress value={regStats.total > 0 ? (regStats.active / regStats.total) * 100 : 0} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>اطلاعیه‌های مهم و فوری</span>
              <span className="text-muted-foreground">
                {toPersianDigits(annStats.high)} از {toPersianDigits(annStats.total)}
              </span>
            </div>
            <Progress value={annStats.total > 0 ? (annStats.high / annStats.total) * 100 : 0} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
