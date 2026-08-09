'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Users, UserCheck, UserX, Clock, CalendarOff, MapPin,
  AlertTriangle, TrendingUp, CreditCard, UserPlus,
  LogOut, Eye, Zap, DollarSign, BarChart3,
  CheckCircle2, Database, Search, Inbox, ClipboardList,
  Sparkles, Activity, ShieldCheck, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import {
  toPersianDigits, formatCurrency,
  getWeekDaysShamsi, formatShamsi
} from '@/core/lib/utils-fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '@/core/hooks/use-mobile'

// ============================================
// Types (بدون تغییر)
// ============================================

interface DashboardStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  lateToday: number
  leaveToday: number
  missionToday: number
  noCheckIn: number
  overtimeExceeded: number
  monthlySalary: number
  monthlyInsurance: number
}

interface DashboardPeople {
  present: string[]
  absent: string[]
  late: string[]
  leave: string[]
  mission: string[]
}

interface DashboardAlerts {
  expiringContracts: { id: string; title: string; employeeName: string; endDate: string | null }[]
  birthdays: { id: string; name: string; date: string | null }[]
  marriageAnniversaries: { id: string; name: string; date: string | null }[]
}

interface KpiItem {
  department: string
  actual: number
  target: number
  gap: number
}

interface RecruitmentData {
  active: number
  offboarding: number
}

interface AttendanceTrendItem {
  date: string
  rate: number
}

// ============================================
// Animation Variants
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 22,
      duration: 0.4,
    },
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17,
    },
  },
}

// ============================================
// Donut Chart Component with Animation
// ============================================

function DonutChart({ donutData }: { donutData: { department: string; درصد: number }[] }) {
  const [isAnimated, setIsAnimated] = useState(false)
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
  
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3">
        <div className="relative w-32 h-32 mx-auto">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke={COLORS[0]}
              strokeWidth="10"
              strokeDasharray={`${donutData[0]?.درصد || 75} ${100 - (donutData[0]?.درصد || 75)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ strokeDashoffset: isAnimated ? 0 : 100 }}
            />
          </svg>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-2xl font-bold text-emerald-600">
              {toPersianDigits(donutData[0]?.درصد || 75)}٪
            </span>
          </motion.div>
        </div>
        <div className="space-y-1 text-xs max-w-[150px] mx-auto">
          {donutData.slice(0, 4).map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex justify-between gap-4"
            >
              <span className="text-gray-500">{item.department}</span>
              <span className="font-medium" style={{ color: COLORS[i] }}>
                {toPersianDigits(item.درصد)}٪
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Stat Cards Component - Professional Design
// ============================================

export function DashboardStatCards({
  stats,
  people,
  onNavigate,
}: {
  stats: DashboardStats
  people?: DashboardPeople
  onNavigate: (id: string) => void
}) {

  const isMobile = useIsMobile()
  const items = [
    {
      icon: Users,
      label: 'کل کارکنان',
      value: stats.totalEmployees,
      gradient: 'from-violet-600 to-purple-600',
      glow: 'shadow-violet-500/30',
      borderGlow: 'ring-violet-500/20',
      onClick: () => onNavigate('employees'),
      subtitle: 'نیروی انسانی فعال',
    },
    {
      icon: UserCheck,
      label: 'حاضر',
      value: stats.presentToday,
      gradient: 'from-emerald-600 to-teal-600',
      glow: 'shadow-emerald-500/30',
      borderGlow: 'ring-emerald-500/20',
      onClick: () => onNavigate('att-today'),
      subtitle: 'حضور امروز',
    },
    {
      icon: UserX,
      label: 'غایب',
      value: stats.absentToday,
      gradient: 'from-rose-600 to-red-600',
      glow: 'shadow-rose-500/30',
      borderGlow: 'ring-rose-500/20',
      onClick: () => onNavigate('att-today'),
      subtitle: 'بدون حضور',
    },
    {
      icon: Clock,
      label: 'تاخیر',
      value: stats.lateToday,
      gradient: 'from-amber-600 to-orange-600',
      glow: 'shadow-amber-500/30',
      borderGlow: 'ring-amber-500/20',
      onClick: () => onNavigate('att-today'),
      subtitle: 'دیرکرد امروز',
    },
    {
      icon: CalendarOff,
      label: 'مرخصی',
      value: stats.leaveToday,
      gradient: 'from-sky-600 to-blue-600',
      glow: 'shadow-sky-500/30',
      borderGlow: 'ring-sky-500/20',
      onClick: () => onNavigate('att-leave'),
      subtitle: 'در مرخصی',
    },
    {
      icon: MapPin,
      label: 'ماموریت',
      value: stats.missionToday,
      gradient: 'from-orange-600 to-amber-600',
      glow: 'shadow-orange-500/30',
      borderGlow: 'ring-orange-500/20',
      onClick: () => onNavigate('att-mission'),
      subtitle: 'ماموریت امروز',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid gap-3 ${
        isMobile 
          ? 'grid-cols-2 gap-2'  // موبایل: 2 ستون با فاصله کمتر
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'  // دسکتاپ: 6 ستون
      }`}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          variants={itemVariants}
          whileHover={!isMobile ? { y: -4 } : {}}
          onClick={item.onClick}
          className="cursor-pointer"
        >
          <Card className={`
            relative overflow-hidden
            bg-gradient-to-br ${item.gradient}
            shadow-lg hover:shadow-xl
            transition-all duration-300
            border-0
            ${isMobile ? 'rounded-xl' : 'rounded-2xl'}
          `}>
            <CardContent className={`relative z-10 ${isMobile ? 'p-3' : 'p-4'}`}>
              {/* آیکون - کوچک‌تر در موبایل */}
              <div className={`mb-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
                <div className={`
                  ${isMobile ? 'w-9 h-9' : 'w-12 h-12'} 
                  rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-sm 
                  flex items-center justify-center
                `}>
                  <item.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                </div>
              </div>

              {/* مقدار - فونت کوچک‌تر در موبایل */}
              <div className="mb-1">
                <span className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                  {typeof item.value === 'number' ? toPersianDigits(item.value) : item.value}
                </span>
              </div>

              {/* عنوان - فونت کوچک‌تر در موبایل */}
              <p className={`font-medium text-white/90 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {item.label}
              </p>
              
              {/* زیرنویس - مخفی در موبایل */}
              {!isMobile && (
                <p className="text-xs text-white/60 mt-0.5">
                  {item.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
// ============================================
// Quick Actions Component
// ============================================

export function QuickActionsCard({ onNavigate , currentUser  }: { onNavigate: (id: string) => void ,currentUser?: { role: string; employeeId?: string } }) {
  const allActions  = [
    { icon: CalendarOff, label: 'ثبت مرخصی', color: 'emerald', navigate: 'att-leave', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee']},
    { icon: UserCheck, label: 'ثبت حضور', color: 'sky', navigate: 'att-today', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee']},
    { icon: CreditCard, label: 'فیش حقوقی', color: 'rose', navigate: 'payroll', allowedRoles: ['admin', 'hr_manager', 'department_manager'] },
    { icon: UserPlus, label: 'کارمند جدید', color: 'amber', navigate: 'employees', allowedRoles: ['admin', 'hr_manager', 'department_manager'] },
    { icon: MapPin, label: 'ثبت ماموریت', color: 'violet', navigate: 'att-mission', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
  ]

  const actions = allActions.filter(action => 
    !action.allowedRoles || action.allowedRoles.includes(currentUser?.role || 'employee')
  )

  const colors: Record<string, { light: string; dark: string; icon: string }> = {
    emerald: { light: 'from-emerald-50 to-emerald-100', dark: 'dark:from-emerald-950/40 dark:to-emerald-900/30', icon: 'text-emerald-600' },
    sky: { light: 'from-sky-50 to-sky-100', dark: 'dark:from-sky-950/40 dark:to-sky-900/30', icon: 'text-sky-600' },
    rose: { light: 'from-rose-50 to-rose-100', dark: 'dark:from-rose-950/40 dark:to-rose-900/30', icon: 'text-rose-600' },
    amber: { light: 'from-amber-50 to-amber-100', dark: 'dark:from-amber-950/40 dark:to-amber-900/30', icon: 'text-amber-600' },
    violet: { light: 'from-violet-50 to-violet-100', dark: 'dark:from-violet-950/40 dark:to-violet-900/30', icon: 'text-violet-600' },
  }

  const getGridCols = () => {
    const count = actions.length
    if (count <= 2) return 'grid-cols-2'
    if (count <= 3) return 'grid-cols-3'
    if (count <= 4) return 'grid-cols-4'
    return 'grid-cols-5'
  }

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-1 pt-0 px-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
              </motion.div>
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent text-xs">
                دسترسی سریع
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-1 pt-0">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid ${getGridCols()} gap-1.5`}
            >
              {actions.map((action, i) => (
                <motion.div
                  key={action.label}
                  variants={itemVariants}
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Button
                    variant="outline"
                    className={`h-auto py-1 px-2 flex flex-col items-center gap-1 bg-gradient-to-br ${colors[action.color].light} ${colors[action.color].dark} border-0 hover:shadow-md transition-all duration-300 w-full rounded-lg`}
                    onClick={() => onNavigate(action.navigate)}
                  >
                    <action.icon className={`w-4 h-4 ${colors[action.color].icon}`} />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
}

// ============================================
// Attendance Trend Card with Area Chart
// ============================================

export function AttendanceTrendCard({ attendanceTrend }: { attendanceTrend: AttendanceTrendItem[] }) {
  const trendData = attendanceTrend && attendanceTrend.length > 0 
    ? attendanceTrend.map((item, i) => ({
        day: getWeekDaysShamsi()[i] || item.date,
        نرخ: item.rate,
      }))
    : generateSampleAttendanceTrend().map(item => ({
        day: item.date,
        نرخ: item.rate,
      }))

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>روند حضور ۷ روز اخیر</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${toPersianDigits(v)}٪`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    fontFamily: 'Vazirmatn',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${toPersianDigits(value)}٪`, 'نرخ حضور']}
                />
                <Area 
                  type="monotone" 
                  dataKey="نرخ" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fill="url(#colorRate)"
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff", strokeOpacity: 0.8 }}
                  activeDot={{ r: 6, fill: "#10b981", strokeWidth: 2.5, stroke: "#fff", strokeOpacity: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// KPI Donut Chart Card
// ============================================

export function KpiDonutChart({ kpiData }: { kpiData: KpiItem[] }) {
  const donutData = kpiData && kpiData.length > 0 ? kpiData.map(item => ({
    department: item.department,
    درصد: Math.round((item.actual / item.target) * 100),
  })) : [
    { department: 'بازده', درصد: 85 },
    { department: 'رضایت', درصد: 72 },
    { department: 'عملکرد', درصد: 60 },
    { department: 'غایب', درصد: 35 },
  ]

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="h-full"
    >
      <Card className="border-0 shadow-lg overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>شاخص‌های ارزیابی</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="w-full">
            <DonutChart donutData={donutData} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// Salary Card with Animated Counter
// ============================================

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {prefix}
      {toPersianDigits(displayValue)}
      {suffix}
    </span>
  )
}
export function SalaryCard({ stats }: { stats: DashboardStats }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="h-full"
    >
      <Card className="border-0 shadow-lg overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>حقوق و بیمه ماهانه</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {/* Salary */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">حقوق ماهانه</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.monthlySalary > 0 
                ? <AnimatedNumber value={stats.monthlySalary} suffix=" تومان" />
                : toPersianDigits(0) + ' تومان'
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">
              مجموع خالص پرداختی ماه جاری
            </div>
            
            <div className="mt-3 h-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
              />
            </div>
          </motion.div>

          {/* Insurance */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">بیمه سهم کارمند</span>
              <CreditCard className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-sky-700 dark:text-sky-300">
              {stats.monthlyInsurance > 0 
                ? <AnimatedNumber value={stats.monthlyInsurance} suffix=" تومان" />
                : toPersianDigits(0) + ' تومان'
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">
              کسورات بیمه ماه جاری
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="text-center p-3 rounded-lg bg-white/60 dark:bg-gray-800/40"
              >
                <div className="text-lg font-bold text-emerald-600">
                  {stats.totalEmployees > 0 
                    ? toPersianDigits(Math.round(stats.monthlySalary / Math.max(stats.totalEmployees, 1))) 
                    : '۰'
                  }
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  میانگین حقوق
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="text-center p-3 rounded-lg bg-white/60 dark:bg-gray-800/40"
              >
                <div className="text-lg font-bold text-sky-600">
                  {stats.totalEmployees > 0 && stats.monthlySalary > 0
                    ? toPersianDigits(Math.round((stats.monthlyInsurance / stats.monthlySalary) * 100)) + '٪'
                    : '۰٪'
                  }
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  نسبت بیمه
                </div>
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// Empty State Component
// ============================================

function EmptyState({ message = 'داده‌ای وجود ندارد', icon: Icon = Database }: { message?: string; icon?: React.ComponentType<any> }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Icon className="w-12 h-12 text-gray-400 mb-3 opacity-50" />
      </motion.div>
      <p className="mt-4 text-sm text-gray-500 text-center max-w-xs">
        {message || 'اطلاعات یافت نشده'}
      </p>
    </motion.div>
  )
}

// ============================================
// Generate Sample Data Helper
// ============================================

function generateSampleAttendanceTrend(): AttendanceTrendItem[] {
  return [
    { date: 'شنبه', rate: 65 },
    { date: 'یکشنبه', rate: 72 },
    { date: 'دوشنبه', rate: 58 },
    { date: 'سه‌شنبه', rate: 45 },
    { date: 'چهارشنبه', rate: 82 },
    { date: 'پنجشنبه', rate: 90 },
    { date: 'جمعه', rate: 78 },
  ]
}

// ============================================
// Main Export
// ============================================

export function DashboardKpiSection({
  stats,
  people,
  kpiData,
  alerts,
  recruitment,
  attendanceTrend,
  pending,
  onNavigate,
  onRefresh,
  currentUser
}: {
  stats: DashboardStats
  people?: DashboardPeople
  kpiData?: KpiItem[]
  alerts?: DashboardAlerts
  recruitment?: RecruitmentData
  attendanceTrend?: AttendanceTrendItem[]
  pending?: { leaves: number; missions: number; loans: number; contracts: number }
  onNavigate: (id: string) => void
  onRefresh?: () => void
  currentUser?: { role: string; employeeId?: string }
}) {

  const safeStats = stats || {
    totalEmployees: 0, presentToday: 0, absentToday: 0,
    lateToday: 0, leaveToday: 0, missionToday: 0,
    noCheckIn: 0, overtimeExceeded: 0, monthlySalary: 0, monthlyInsurance: 0,
  }

  const safeKpiData = kpiData && kpiData.length > 0 ? kpiData : []
  const safeAttendanceTrend = attendanceTrend && attendanceTrend.length > 0 ? attendanceTrend : generateSampleAttendanceTrend()
  const safeRecruitment = recruitment || { active: 0, offboarding: 0 }
  const safePending = pending || { leaves: 0, missions: 0, loans: 0, contracts: 0 }
  const safeAlerts = alerts || {
    expiringContracts: [],
    birthdays: [],
    marriageAnniversaries: []
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Row 1: Stat Cards */}
      <DashboardStatCards 
        stats={safeStats} 
        people={people} 
        onNavigate={onNavigate || (() => {})} 
      />

      {/* Row 2: Quick Actions */}
      <QuickActionsCard onNavigate={onNavigate || (() => {})} currentUser={currentUser} />

      {/* Row 3: Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AttendanceTrendCard attendanceTrend={safeAttendanceTrend} />
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-violet-500" />
              <span>درخواست‌های در انتظار</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState message="درخواستی در انتظار وجود ندارد" icon={ClipboardList} />
          </CardContent>
        </Card>

        <KpiDonutChart kpiData={safeKpiData} />
        <SalaryCard stats={safeStats} />
      </div>

      {/* Row 4: Alerts & More */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>هشدارها و یادآوری‌ها</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState 
              message={safeAlerts.expiringContracts.length > 0 
                ? `${safeAlerts.expiringContracts.length} قرارداد منقضی شونده` 
                : 'هشداری موجود ندارد'} 
              icon={AlertTriangle}
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <EmptyState message="داده‌ای برای نمایش وجود ندارد" icon={Database} />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <EmptyState message="حقوق و بیمه" icon={DollarSign} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}