'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Home, Users, Clock, CalendarOff, MapPin, DollarSign,
  FileBadge, CreditCard, UserPlus, BarChart3, PlaneTakeoff,
  LogOut, GraduationCap, Award, Settings, ClipboardList,
  ChevronLeft, Menu, X, Briefcase, Sun, Moon, Bell,
  Megaphone, BookOpen, Network, Building2, UserCheck, Settings2,
  BellRing, Smartphone, TrendingUp, User, Activity, type LucideIcon,
  Loader2, RefreshCw, Zap
} from 'lucide-react'
import { NAV_ITEMS } from '@/core/config/navigation'

// Mobile feature components
import AttendanceCheckin from '@/modules/mobile/components/attendance-checkin'
import LeaveRequest from '@/modules/mobile/components/leave-request'
import MissionRequest from '@/modules/mobile/components/mission-request'
import LeaveBalance from '@/modules/mobile/components/leave-balance'
import MyShifts from '@/modules/mobile/components/my-shifts'
import ContractView from '@/modules/mobile/components/contract-view'
import JobOrder from '@/modules/mobile/components/job-order'
import PayslipList from '@/modules/mobile/components/payslip-list'
import LoanRequest from '@/modules/mobile/components/loan-request'
import TrainingList from '@/modules/mobile/components/training-list'
import PerformanceResult from '@/modules/mobile/components/performance-result'
import AnnouncementsList from '@/modules/mobile/components/announcements-list'
import RegulationsList from '@/modules/mobile/components/regulations-list'
import Notifications from '@/modules/mobile/components/notifications'
import Profile from '@/modules/mobile/components/profile'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  toPersianDigits, formatCurrency, getTodayFormatted
} from '@/lib/utils-fa'

/** Map icon name strings → Lucide components for mobile sidebar */
const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Users,
  UserCheck,
  Clock,
  CalendarOff,
  MapPin,
  Briefcase,
  LogOut,
  Bell,
  CreditCard,
  BarChart3,
  UserPlus,
  PlaneTakeoff,
  GraduationCap,
  Award,
  Settings,
  ClipboardList,
  FileBadge,
  DollarSign,
  Settings2,
  BellRing,
  Smartphone,
  Network,
  Building2,
  Megaphone,
  BookOpen,
  TrendingUp,
  User,
  Activity,
}

/** Resolve nav items with icon components from strings */
const resolveNavItems = () =>
  NAV_ITEMS
    .filter(item => !item.desktopOnly)
    .map(item => ({
      ...item,
      icon: ICON_MAP[item.icon],
      children: item.children?.map(child => ({
        ...child,
        icon: ICON_MAP[child.icon],
      })),
    }))

// ============================================
// Bottom Navigation Tabs
// ============================================

const BOTTOM_TABS = [
  { id: 'dashboard', label: 'خانه', icon: Home },
  { id: 'att-today', label: 'تردد', icon: Clock },
  { id: 'att-leave', label: 'مرخصی', icon: CalendarOff },
  { id: 'notifications', label: 'اعلان', icon: Bell },
  { id: 'profile', label: 'پروفایل', icon: User },
]

// ============================================
// Module Title Map
// ============================================

const MODULE_TITLES: Record<string, string> = {
  dashboard: 'داشبورد',
  'att-today': 'ثبت تردد',
  'att-leave': 'درخواست مرخصی',
  'att-mission': 'درخواست ماموریت',
  'att-leave-balance': 'موجودی مرخصی',
  'att-shifts': 'شیفت کاری من',
  'contract-view': 'مشاهده قرارداد',
  'contract-order': 'مشاهده حکم کاری',
  'payroll-list': 'فیش حقوقی',
  'welfare-loans': 'درخواست وام/مساعده',
  'training-list': 'دوره‌های آموزشی',
  'performance-result': 'نتیجه ارزیابی',
  announcements: 'اطلاعیه‌ها',
  regulations: 'آیین‌نامه‌ها',
  notifications: 'نوتیفیکیشن‌ها',
  profile: 'پروفایل شخصی',
}

// ============================================
// Module Content Renderer
// ============================================

function ModuleContent({ activeModule }: { activeModule: string }) {
  switch (activeModule) {
    case 'att-today':
      return <AttendanceCheckin />
    case 'att-leave':
      return <LeaveRequest />
    case 'att-mission':
      return <MissionRequest />
    case 'att-leave-balance':
      return <LeaveBalance />
    case 'att-shifts':
      return <MyShifts />
    case 'contract-view':
      return <ContractView />
    case 'contract-order':
      return <JobOrder />
    case 'payroll-list':
      return <PayslipList />
    case 'welfare-loans':
      return <LoanRequest />
    case 'training-list':
      return <TrainingList />
    case 'performance-result':
      return <PerformanceResult />
    case 'announcements':
      return <AnnouncementsList />
    case 'regulations':
      return <RegulationsList />
    case 'notifications':
      return <Notifications />
    case 'profile':
      return <Profile />
    case 'dashboard':
    default:
      return <DashboardContent />
  }
}

// ============================================
// Pull-to-Refresh Hook
// ============================================

function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0
    if (scrollTop > 0 || isRefreshing) return

    const diff = e.touches[0].clientY - startY.current
    if (diff > 0 && diff < 120) {
      setIsPulling(true)
      setPullDistance(Math.min(diff * 0.5, 60))
    }
  }, [isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (isPulling && pullDistance > 40 && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setIsPulling(false)
    setPullDistance(0)
  }, [isPulling, pullDistance, isRefreshing, onRefresh])

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}

// ============================================
// Swipe Gesture Hook for Tab Switching
// ============================================

function useSwipeGesture(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const startX = useRef(0)
  const startY = useRef(0)
  const isSwiping = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isSwiping.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return
    const diffY = Math.abs(e.touches[0].clientY - startY.current)
    // If vertical movement is greater, it's a scroll, not a swipe
    if (diffY > 30) {
      isSwiping.current = false
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return
    isSwiping.current = false

    const endX = e.changedTouches[0].clientX
    const diff = endX - startX.current

    // Minimum swipe distance of 50px
    if (Math.abs(diff) < 50) return

    // RTL: swipe right = go to next tab, swipe left = go to prev tab
    if (diff > 0) {
      onSwipeRight()
    } else {
      onSwipeLeft()
    }
  }, [onSwipeLeft, onSwipeRight])

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}

// ============================================
// Mobile Sidebar (Drawer)
// ============================================

function MobileSidebar({
  activeModule,
  onNavigate,
  isOpen,
  onClose,
  darkMode,
  onToggleDark,
}: {
  activeModule: string
  onNavigate: (id: string) => void
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
  onToggleDark: () => void
}) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['attendance'])

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-screen w-[280px] bg-card border-l border-border z-50 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold">منابع انسانی</h1>
              <p className="text-[10px] text-muted-foreground">سامانه مدیریت</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-11 w-11 p-0" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              م
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">محمد احمدی</p>
              <p className="text-[11px] text-muted-foreground">مدیر منابع انسانی</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {resolveNavItems().map(item => {
            const isActive = activeModule === item.id
            const isGroup = 'children' in item && item.children
            const isExpanded = expandedGroups.includes(item.id)
            // Check if any child is active
            const isChildActive = isGroup && item.children?.some(child => activeModule === child.id)

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (isGroup) {
                      toggleGroup(item.id)
                    } else {
                      onNavigate(item.id)
                      onClose()
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 min-h-[44px] ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isChildActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-right">{item.label}</span>
                  {isGroup && (
                    <ChevronLeft className={`w-4 h-4 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
                  )}
                </button>

                {/* Sub-items */}
                {isGroup && isExpanded && item.children && (
                  <div className="mr-6 mt-0.5 space-y-0.5">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => {
                          onNavigate(child.id)
                          onClose()
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all min-h-[44px] ${
                          activeModule === child.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <child.icon className="w-4 h-4 shrink-0" />
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sm min-h-[44px]"
            onClick={onToggleDark}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {darkMode ? 'حالت روشن' : 'حالت تاریک'}
          </Button>
        </div>
      </aside>
    </>
  )
}

// ============================================
// Quick Stats for Mobile
// ============================================

function MobileStatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color: string
}) {
  const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: 'text-emerald-600 dark:text-emerald-400', text: 'text-emerald-700 dark:text-emerald-300' },
    red: { bg: 'bg-red-50 dark:bg-red-950/30', icon: 'text-red-600 dark:text-red-400', text: 'text-red-700 dark:text-red-300' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: 'text-amber-600 dark:text-amber-400', text: 'text-amber-700 dark:text-amber-300' },
    blue: { bg: 'bg-sky-50 dark:bg-sky-950/30', icon: 'text-sky-600 dark:text-sky-400', text: 'text-sky-700 dark:text-sky-300' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', icon: 'text-purple-600 dark:text-purple-400', text: 'text-purple-700 dark:text-purple-300' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', icon: 'text-orange-600 dark:text-orange-400', text: 'text-orange-700 dark:text-orange-300' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <div className={`text-lg font-bold ${c.text}`}>{value}</div>
          <div className="text-[11px] text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Dashboard Content (default module)
// ============================================

interface DashboardData {
  stats: {
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
  pending: {
    leaves: number
    missions: number
    loans: number
    contracts: number
  }
  alerts: {
    expiringContracts: { id: string; title: string; employeeName: string; endDate: string | null }[]
    birthdays: { id: string; name: string; date: string | null }[]
    marriageAnniversaries: { id: string; name: string; date: string | null }[]
  }
  kpi: { department: string; actual: number; target: number; gap: number }[]
  recruitment: {
    active: number
    offboarding: number
  }
  attendanceTrend: { date: string; rate: number }[]
}

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      </div>
    )
  }

  const { stats, pending, alerts, recruitment } = data

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MobileStatCard icon={Users} label="کل کارکنان" value={toPersianDigits(stats.totalEmployees)} color="emerald" />
        <MobileStatCard icon={Users} label="حاضر" value={toPersianDigits(stats.presentToday)} color="blue" />
        <MobileStatCard icon={Users} label="غایب" value={toPersianDigits(stats.absentToday)} color="red" />
        <MobileStatCard icon={Clock} label="تاخیر" value={toPersianDigits(stats.lateToday)} color="amber" />
        <MobileStatCard icon={CalendarOff} label="مرخصی" value={toPersianDigits(stats.leaveToday)} color="purple" />
        <MobileStatCard icon={MapPin} label="ماموریت" value={toPersianDigits(stats.missionToday)} color="orange" />
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            دسترسی سریع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: CalendarOff, label: 'مرخصی', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
              { icon: UserCheck, label: 'حضور', color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/30' },
              { icon: CreditCard, label: 'فیش حقوق', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
              { icon: MapPin, label: 'ماموریت', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
            ].map((action, i) => (
              <button
                key={i}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-muted/50 transition-colors min-h-[44px]"
              >
                <div className={`p-2 rounded-xl ${action.bg}`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-[10px] text-muted-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <ClipboardList className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            درخواست‌های در انتظار
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/50 min-h-[44px]">
            <div className="flex items-center gap-2">
              <CalendarOff className="w-4 h-4 text-purple-500" />
              <span className="text-xs">مرخصی</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">{toPersianDigits(pending.leaves)}</Badge>
          </div>
          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/50 min-h-[44px]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              <span className="text-xs">ماموریت</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">{toPersianDigits(pending.missions)}</Badge>
          </div>
          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/50 min-h-[44px]">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span className="text-xs">وام و مساعده</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">{toPersianDigits(pending.loans)}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Salary Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">حقوق ماهانه</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(stats.monthlySalary)} تومان
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">بیمه</span>
            <span className="text-sm font-medium text-sky-700 dark:text-sky-300">
              {formatCurrency(stats.monthlyInsurance)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30">
              <Bell className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            </div>
            هشدارها
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.expiringContracts.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/20 border-r-4 border-r-red-500 min-h-[44px]">
              <FileBadge className="w-4 h-4 text-red-500" />
              <span className="text-xs">{toPersianDigits(alerts.expiringContracts.length)} قرارداد در حال انقضا</span>
            </div>
          )}
          {alerts.birthdays.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-sky-50/50 dark:bg-sky-950/20 border-r-4 border-r-sky-500 min-h-[44px]">
              <Award className="w-4 h-4 text-sky-500" />
              <span className="text-xs">{toPersianDigits(alerts.birthdays.length)} تولد این ماه 🎂</span>
            </div>
          )}
          {alerts.marriageAnniversaries.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border-r-4 border-r-purple-500 min-h-[44px]">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="text-xs">{toPersianDigits(alerts.marriageAnniversaries.length)} سالگرد ازدواج 💍</span>
            </div>
          )}
          {alerts.expiringContracts.length === 0 && alerts.birthdays.length === 0 && alerts.marriageAnniversaries.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-4">هیچ هشداری وجود ندارد</div>
          )}
        </CardContent>
      </Card>

      {/* Recruitment & Offboarding */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 w-fit mx-auto mb-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{toPersianDigits(recruitment.active)}</div>
            <div className="text-[10px] text-muted-foreground">در حال استخدام</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 w-fit mx-auto mb-2">
              <LogOut className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-lg font-bold text-rose-700 dark:text-rose-300">{toPersianDigits(recruitment.offboarding)}</div>
            <div className="text-[10px] text-muted-foreground">آفبوردینگ</div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ============================================
// Bottom Navigation Bar
// ============================================

function BottomNav({
  activeModule,
  onNavigate,
}: {
  activeModule: string
  onNavigate: (id: string) => void
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {BOTTOM_TABS.map(tab => {
          const isActive = activeModule === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-h-[56px] min-w-[56px] transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ============================================
// Mobile App Page
// ============================================

export default function MobilePage() {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDark = () => setDarkMode(!darkMode)

  // Apply dark mode
  if (typeof document !== 'undefined') {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const hour = new Date().getHours()
  let greeting = 'سلام'
  if (hour < 12) greeting = 'صبح بخیر'
  else if (hour < 17) greeting = 'ظهر بخیر'
  else greeting = 'عصر بخیر'

  const moduleTitle = MODULE_TITLES[activeModule] || 'داشبورد'

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    // Force re-fetch by triggering a state update
    window.dispatchEvent(new CustomEvent('mobile-refresh'))
  }, [])

  const {
    isPulling,
    isRefreshing,
    pullDistance,
    containerRef,
    handleTouchStart: pullTouchStart,
    handleTouchMove: pullTouchMove,
    handleTouchEnd: pullTouchEnd,
  } = usePullToRefresh(handleRefresh)

  // Swipe gesture for tab switching
  const handleSwipeLeft = useCallback(() => {
    const currentIdx = BOTTOM_TABS.findIndex(t => t.id === activeModule)
    if (currentIdx < BOTTOM_TABS.length - 1) {
      setActiveModule(BOTTOM_TABS[currentIdx + 1].id)
    }
  }, [activeModule])

  const handleSwipeRight = useCallback(() => {
    const currentIdx = BOTTOM_TABS.findIndex(t => t.id === activeModule)
    if (currentIdx > 0) {
      setActiveModule(BOTTOM_TABS[currentIdx - 1].id)
    }
  }, [activeModule])

  const {
    handleTouchStart: swipeTouchStart,
    handleTouchMove: swipeTouchMove,
    handleTouchEnd: swipeTouchEnd,
  } = useSwipeGesture(handleSwipeLeft, handleSwipeRight)

  // Combined touch handlers
  const combinedTouchStart = (e: React.TouchEvent) => {
    pullTouchStart(e)
    swipeTouchStart(e)
  }

  const combinedTouchMove = (e: React.TouchEvent) => {
    pullTouchMove(e)
    swipeTouchMove(e)
  }

  const combinedTouchEnd = (e: React.TouchEvent) => {
    pullTouchEnd(e)
    swipeTouchEnd(e)
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Sidebar Drawer */}
      <MobileSidebar
        activeModule={activeModule}
        onNavigate={setActiveModule}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 p-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              {activeModule === 'dashboard' ? (
                <>
                  <h2 className="text-sm font-bold">{greeting}، محمد 👋</h2>
                  <p className="text-[10px] text-muted-foreground">{getTodayFormatted()}</p>
                </>
              ) : (
                <h2 className="text-sm font-bold">{moduleTitle}</h2>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-11 w-11 p-0" onClick={toggleDark}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 p-0 relative"
              onClick={() => setActiveModule('notifications')}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </div>
      </header>

      {/* Pull-to-Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="flex items-center justify-center py-2 text-muted-foreground transition-all"
          style={{ height: `${pullDistance || (isRefreshing ? 40 : 0)}px` }}
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing && <span className="text-xs mr-2">در حال بروزرسانی...</span>}
        </div>
      )}

      {/* Content with gesture support */}
      <main
        ref={containerRef}
        className="p-4 space-y-4 pb-24 overflow-y-auto"
        onTouchStart={combinedTouchStart}
        onTouchMove={combinedTouchMove}
        onTouchEnd={combinedTouchEnd}
      >
        <ModuleContent activeModule={activeModule} />
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeModule={activeModule} onNavigate={setActiveModule} />
    </div>
  )
}
