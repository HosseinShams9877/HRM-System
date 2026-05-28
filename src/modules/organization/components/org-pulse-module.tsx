'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Activity, Users, UserCheck, UserX, Clock, Building2,
  Briefcase, TrendingUp, TrendingDown, AlertTriangle,
  Loader2, Heart, Zap, FileBadge, GraduationCap,
  UserPlus, ArrowUpRight, ArrowDownRight, CalendarOff,
  MapPin, CreditCard, BarChart3, ChevronLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Progress } from '@/core/components/ui/progress'
import { Separator } from '@/core/components/ui/separator'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'

// ============================================
// Types
// ============================================

interface PulseData {
  healthScore: number
  dynamismScore: number
  employees: {
    total: number
    newHiresThisMonth: number
    offboardingsThisMonth: number
    turnoverRate: number
  }
  attendance: {
    present: number
    late: number
    leave: number
    mission: number
    absent: number
    rate: number
    trend: { date: string; rate: number; present: number }[]
  }
  positions: {
    total: number
    active: number
    filled: number
    totalHeadcount: number
    fillRate: number
  }
  departments: {
    id: string
    name: string
    code: string
    employeeCount: number
    totalPositions: number
    headcount: number
    filled: number
    fillRate: number
  }[]
  pending: {
    leaves: number
    missions: number
    loans: number
    expiringContracts: number
  }
  performance: {
    avgScore: number
    completedCount: number
  }
  recruitment: {
    openPositions: number
  }
  training: {
    activeCourses: number
  }
}

// ============================================
// Helpers
// ============================================

function getScoreColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', ring: 'ring-emerald-400', gradient: 'from-emerald-400 to-teal-500', label: 'عالی' }
  if (score >= 60) return { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30', ring: 'ring-sky-400', gradient: 'from-sky-400 to-blue-500', label: 'خوب' }
  if (score >= 40) return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', ring: 'ring-amber-400', gradient: 'from-amber-400 to-orange-500', label: 'متوسط' }
  return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', ring: 'ring-red-400', gradient: 'from-red-400 to-rose-500', label: 'ضعیف' }
}

function getFillRateColor(rate: number) {
  if (rate >= 90) return 'text-emerald-600'
  if (rate >= 70) return 'text-sky-600'
  if (rate >= 50) return 'text-amber-600'
  return 'text-red-600'
}

// ============================================
// Score Gauge
// ============================================

function ScoreGauge({ score, label, icon: Icon }: { score: number; label: string; icon: React.ElementType }) {
  const c = getScoreColor(score)
  const circumference = 2 * Math.PI * 45
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6 flex flex-col items-center">
        <div className="relative w-28 h-28 mb-3">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              className={`stroke-current ${c.text}`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${c.text}`}>{toPersianDigits(score)}</span>
            <span className="text-[10px] text-muted-foreground">از ۱۰۰</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className={`w-4 h-4 ${c.text}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <Badge className={`text-[10px] ${c.bg} ${c.text} border-0`}>{c.label}</Badge>
      </CardContent>
    </Card>
  )
}

// ============================================
// Stat Card
// ============================================

function StatCard({
  icon: Icon, label, value, sub, color = 'emerald', trend
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string; trend?: 'up' | 'down' | 'neutral'
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    sky: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400',
    violet: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.emerald}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold">{value}</span>
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
          </div>
          <div className="text-[11px] text-muted-foreground">{label}</div>
          {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Main Component
// ============================================

export function OrgPulseModule() {
  const [data, setData] = useState<PulseData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPulse = useCallback(async () => {
    try {
      const res = await fetch('/api/organization/pulse')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch org pulse:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPulse()
  }, [fetchPulse])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">در حال بارگذاری نبض سازمان...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Activity className="w-8 h-8" />
          <span className="text-sm">خطا در دریافت اطلاعات نبض سازمان</span>
        </div>
      </div>
    )
  }

  const attTrendLast7 = data.attendance.trend.slice(-7)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          نبض سازمان
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          نمای کلی سلامت، پویایی و وضعیت منابع انسانی سازمان
        </p>
      </div>

      {/* ===== Row 1: Main Gauges ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreGauge score={data.healthScore} label="سلامت سازمان" icon={Heart} />
        <ScoreGauge score={data.dynamismScore} label="پویایی سازمان" icon={Zap} />
        <ScoreGauge score={data.attendance.rate} label="نرخ حضور" icon={UserCheck} />
        <ScoreGauge score={data.positions.fillRate} label="نرخ اشغال پست‌ها" icon={Briefcase} />
      </div>

      {/* ===== Row 2: Employee Stats ===== */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          نیروی انسانی
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Users}
            label="کل کارکنان فعال"
            value={toPersianDigits(data.employees.total)}
            sub="نفر"
            color="emerald"
          />
          <StatCard
            icon={UserPlus}
            label="ورود جدید این ماه"
            value={toPersianDigits(data.employees.newHiresThisMonth)}
            sub="نفر"
            color="sky"
            trend={data.employees.newHiresThisMonth > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            icon={UserX}
            label="خروج این ماه"
            value={toPersianDigits(data.employees.offboardingsThisMonth)}
            sub="نفر"
            color="red"
            trend={data.employees.offboardingsThisMonth > 0 ? 'down' : 'neutral'}
          />
          <StatCard
            icon={TrendingDown}
            label="نرخ ریزش"
            value={`${toPersianDigits(data.employees.turnoverRate)}٪`}
            color={data.employees.turnoverRate > 5 ? 'red' : 'amber'}
          />
        </div>
      </div>

      {/* ===== Row 3: Attendance ===== */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          حضور و غیاب امروز
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <StatCard icon={UserCheck} label="حاضر" value={toPersianDigits(data.attendance.present)} sub="نفر" color="emerald" />
          <StatCard icon={Clock} label="تاخیر" value={toPersianDigits(data.attendance.late)} sub="نفر" color="amber" />
          <StatCard icon={CalendarOff} label="مرخصی" value={toPersianDigits(data.attendance.leave)} sub="نفر" color="sky" />
          <StatCard icon={MapPin} label="ماموریت" value={toPersianDigits(data.attendance.mission)} sub="نفر" color="violet" />
          <StatCard icon={UserX} label="غایب" value={toPersianDigits(data.attendance.absent)} sub="نفر" color="red" />
        </div>

        {/* Attendance Trend Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              روند حضور (۷ روز اخیر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attTrendLast7}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => v.split('/').slice(1).join('/')}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}٪`} />
                  <Tooltip
                    formatter={(value: number) => [`${toPersianDigits(value)}٪`, 'نرخ حضور']}
                    labelFormatter={(label: string) => label}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#attGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== Row 4: Positions & Departments ===== */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          پست‌های سازمانی و دپارتمان‌ها
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard icon={Briefcase} label="کل پست‌ها" value={toPersianDigits(data.positions.total)} color="emerald" />
          <StatCard icon={Briefcase} label="پست فعال" value={toPersianDigits(data.positions.active)} color="sky" />
          <StatCard icon={UserCheck} label="پست‌های اشغال شده" value={toPersianDigits(data.positions.filled)} sub={`از ${toPersianDigits(data.positions.totalHeadcount)}`} color="violet" />
          <StatCard icon={BarChart3} label="نرخ اشغال" value={`${toPersianDigits(data.positions.fillRate)}٪`} color={data.positions.fillRate >= 70 ? 'emerald' : 'amber'} />
        </div>

        {/* Department Fill Rate Chart */}
        {data.departments.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                نرخ اشغال پست‌ها به تفکیک دپارتمان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departments} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}٪`} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${toPersianDigits(value)}٪`, 'نرخ اشغال']}
                    />
                    <Bar dataKey="fillRate" radius={[0, 4, 4, 0]} barSize={20}>
                      {data.departments.map((dept, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={dept.fillRate >= 80 ? '#10b981' : dept.fillRate >= 50 ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Department Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {data.departments.map(dept => (
            <Card key={dept.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold truncate">{dept.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono" dir="ltr">{dept.code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm font-bold">{toPersianDigits(dept.employeeCount)}</div>
                    <div className="text-[9px] text-muted-foreground">نفر</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm font-bold">{toPersianDigits(dept.totalPositions)}</div>
                    <div className="text-[9px] text-muted-foreground">پست</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm font-bold">{toPersianDigits(dept.filled)}/{toPersianDigits(dept.headcount)}</div>
                    <div className="text-[9px] text-muted-foreground">اشغال</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>نرخ اشغال</span>
                    <span className={getFillRateColor(dept.fillRate)}>{toPersianDigits(dept.fillRate)}٪</span>
                  </div>
                  <Progress value={dept.fillRate} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ===== Row 5: Pending + Performance + Recruitment ===== */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          درخواست‌های در انتظار و وضعیت‌ها
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard
            icon={CalendarOff}
            label="مرخصی در انتظار"
            value={toPersianDigits(data.pending.leaves)}
            color={data.pending.leaves > 0 ? 'amber' : 'emerald'}
          />
          <StatCard
            icon={MapPin}
            label="ماموریت در انتظار"
            value={toPersianDigits(data.pending.missions)}
            color={data.pending.missions > 0 ? 'amber' : 'emerald'}
          />
          <StatCard
            icon={CreditCard}
            label="وام در انتظار"
            value={toPersianDigits(data.pending.loans)}
            color={data.pending.loans > 0 ? 'amber' : 'emerald'}
          />
          <StatCard
            icon={FileBadge}
            label="قرارداد در حال انقضا"
            value={toPersianDigits(data.pending.expiringContracts)}
            color={data.pending.expiringContracts > 0 ? 'red' : 'emerald'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Performance */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/30">
                  <BarChart3 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-sm font-medium">ارزیابی عملکرد</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                  {toPersianDigits(data.performance.avgScore)}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1">
                  میانگین نمره ({toPersianDigits(data.performance.completedCount)} ارزیابی)
                </p>
              </div>
              <div className="mt-2">
                <Progress
                  value={data.performance.avgScore}
                  className="h-1.5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recruitment */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30">
                  <UserPlus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <span className="text-sm font-medium">جذب و استخدام</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {toPersianDigits(data.recruitment.openPositions)}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1">
                  موقعیت شغلی باز
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Training */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium">آموزش</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {toPersianDigits(data.training.activeCourses)}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1">
                  دوره فعال
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
