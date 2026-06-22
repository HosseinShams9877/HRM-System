'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import {
  Home, Users, UserCheck, Clock, CalendarOff, MapPin,
  Briefcase, LogOut, Bell, Sun, Moon, ChevronLeft,
  Menu, RefreshCw, Award, DollarSign, UserPlus,
  TrendingUp, User, Activity, Network, Building2,
  FileBadge, Settings, Archive, FileText, Folder, Eye,
  CreditCard, BarChart3, PlaneTakeoff, GraduationCap,
  ClipboardList, Settings2, BellRing, Smartphone,
  Megaphone, BookOpen, type LucideIcon
} from 'lucide-react'

import { MobileBottomNav } from '@/core/components/ui/mobile-bottom'
import { NavChild, NAV_ITEMS } from '@/core/config/navigation'
import { Button } from '@/core/components/ui/Button'
import {
  toPersianDigits, getTodayFormatted,
} from '@/core/lib/utils-fa'
import { NotificationDropdown } from '@/core/components/notification-dropdown'
import { ModuleRouter } from './module-router'
import ErrorBoundary from '@/core/components/error-boundary'
import { DashboardSkeleton } from '@/core/components/skeleton-dashboard'
import type { AuthUser, DashboardData } from '../types'

const ICON_MAP: Record<string, LucideIcon> = {
  Home: Home,
  Users: Users,
  UserCheck: UserCheck,
  Clock: Clock,
  CalendarOff: CalendarOff,
  MapPin: MapPin,
  Briefcase: Briefcase,
  LogOut: LogOut,
  Bell: Bell,
  Megaphone: Megaphone,   
  BookOpen: BookOpen,     
  BellRing: BellRing,
  Sun: Sun,
  Moon: Moon,
  ChevronLeft: ChevronLeft,
  Menu: Menu,
  RefreshCw: RefreshCw,
  Award: Award,
  DollarSign: DollarSign,
  CreditCard: CreditCard,
  UserPlus: UserPlus,
  TrendingUp: TrendingUp,
  BarChart3: TrendingUp,
  User: User,
  Activity: Activity,
  Building2: Building2,
  FileBadge: FileBadge,
  Settings: Settings,
  Settings2: Settings2,
  Archive: Archive,
  FileText: FileText,
  Folder: Folder,
  Network: Network,
  Eye: Eye,
  PlaneTakeoff: PlaneTakeoff,
  GraduationCap: GraduationCap,
  ClipboardList: ClipboardList,
  Smartphone: Smartphone,
}


const resolveNavItems = () =>
  NAV_ITEMS
    .filter(item => !item.mobileOnly)
    .map(item => ({
      ...item,
      icon: ICON_MAP[item.icon] || Briefcase,
      children: item.children?.map(child => ({
        ...child,
        icon: ICON_MAP[child.icon] || Briefcase,
      })),
    }))


    function Sidebar({
      activeModule, onNavigate, collapsed, onToggle,
      user, onLogout, isMobileOpen, onMobileClose
    }: any) {
    
      const [expandedGroups, setExpandedGroups] = useState<string[]>([])

      
    
      // تابع بازگشتی برای رندر منوها
      const renderNavItems = (items: any[], level = 0) => {
        return items.map(item => {
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedGroups.includes(item.id)
          const isActive = activeModule === item.id
          
          const isTopLevel = level === 0
          const isSecondLevel = level === 1
          const isThirdLevel = level === 2
      
          return (
            <div key={item.id}>
              <div className="flex flex-row w-full">
                {/* ستون آیکون - برای همه سطوح */}
                <div className="w-[52px] shrink-0 flex items-center justify-center py-2">
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        if (!collapsed) toggleGroup(item.id)
                      } else {
                        onNavigate(item.id)
                        if (isMobileOpen) onMobileClose()
                      }
                    }}
                    className={`
                      w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200
                      ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}
                    `}
                    title={item.label}
                  >
                    <item.icon className="w-5 h-5 text-green" />
                  </button>
                </div>
      
                {/* ستون عنوان */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        if (!collapsed) toggleGroup(item.id)
                      } else {
                        onNavigate(item.id)
                        if (isMobileOpen) onMobileClose()
                      }
                    }}
                    className={`
                      w-full h-9 flex items-center rounded-lg transition-all duration-200 mt-2
                      ${collapsed ? 'justify-center px-0' : 'justify-start px-3 gap-2'}
                      ${isThirdLevel && !collapsed ? 'mr-0' : ''}
                      ${isActive 
                        ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    {!collapsed && (
                      <>
                        <span className={`flex-1 text-right truncate ${isThirdLevel ? 'text-xs' : 'text-sm'}`}>
                          {item.label}
                        </span>
                        {hasChildren && (
                          <ChevronLeft 
                            className={`w-3 h-3 shrink-0 transition-transform duration-200 text-gray-400 ${isExpanded ? '-rotate-90' : ''}`} 
                          />
                        )}
                      </>
                    )}
                  </button>
      
                  {/* زیرمنوها */}
                  {hasChildren && isExpanded && !collapsed && (
                    <div className={`mt-0.5 space-y-0.5 ${
                      isTopLevel ? 'mr-0' : 
                      isSecondLevel ? 'mr-0' : 
                      'mr-0'
                    }`}>
                      {renderNavItems(item.children, level + 1)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })
      }
    
      // تابع فیلتر کردن منوها بر اساس نقش کاربر
      const getFilteredNavItems = useCallback(() => {
        const role = user?.role
        return NAV_ITEMS
          .filter(item => !item.mobileOnly)
          .filter(item => {
            if (!item.allowedRoles) return true
            return item.allowedRoles.includes(role)
          })
          .map(item => ({
            ...item,
            icon: ICON_MAP[item.icon] || Briefcase,
            children: item.children?.filter(child => {
              if (!child.allowedRoles) return true
              return child.allowedRoles.includes(role)
            }).map(child => ({
              ...child,
              icon: ICON_MAP[child.icon] || Briefcase,
              children: child.children?.map(grandChild => ({
                ...grandChild,
                icon: ICON_MAP[grandChild.icon] || Briefcase,
              })),
            })),
          }))
      }, [user])
    
      const [navItems, setNavItems] = useState(() => getFilteredNavItems())
    
      useEffect(() => {
        setNavItems(getFilteredNavItems())
      }, [getFilteredNavItems])
    
      const toggleGroup = (id: string) => {
        setExpandedGroups(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
      }
    
      // وقتی سایدبار بسته میشه، همه گروه‌ها رو ببند
      useEffect(() => {
        if (collapsed) {
          setExpandedGroups([])
        }
      }, [collapsed])
    
      return (
        <>
          {/* Overlay برای موبایل */}
          {isMobileOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" 
              onClick={onMobileClose} 
            />
          )}
    
          <aside 
            className={`
              fixed top-2 bottom-2 right-0 h-screen z-40 flex flex-col
              bg-white dark:bg-gray-950
              shadow-xl transition-all duration-300
              ${collapsed ? 'md:w-[72px]' : 'md:w-[280px]'}
              w-[280px]
              ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}
          >
            {/* Header */}
            <div className="shrink-0 relative z-10">
              <div className="py-4 px-3">
                <div className="flex items-center justify-between">
                  {!collapsed && (
                    <div>
                      <h1 className="text-sm font-bold text-gray-800 dark:text-white">پنل کاربری</h1>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">سامانه جامع مدیریت سازمانی</p>
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" 
                    onClick={onToggle}
                  >
                    <ChevronLeft className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${!collapsed ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
    
            {/* بخش اسکرول شونده */}
            <div 
              className="flex-1 overflow-y-auto min-h-0 relative"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="relative">
                {/* نوار سبز تزئینی */}
                <div className="absolute right-0 top-0 bottom-0 w-[52px] z-0">
                  <div className="absolute right-0 top-0 bottom-0 w-[52px] bg-emerald-600 rounded-full" />
                </div>
    
                {/* آیتم‌ها */}
                <div className="relative z-10">
                  {navItems.map((item: any) => renderNavItems([item]))}
                </div>
              </div>
            </div>
    
            {/* Footer */}
            <div className="shrink-0 relative z-10">
              <div className="flex flex-row w-full border-t border-gray-100 dark:border-gray-800">
                <div className="w-[52px] shrink-0 flex items-center justify-center py-3">
                  <button
                    onClick={onLogout}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200"
                    title="خروج"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                {!collapsed && user && (
                  <div className="flex-1 min-w-0 py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 text-xs font-bold">
                          {user.name?.charAt(0) || 'م'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 dark:text-white truncate">
                          {user.name || 'کاربر'}
                        </p>
                        <p className="text-[9px] text-gray-400 truncate">
                          {user.employee?.position || user.role || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>
      )
    }

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    router.push('/login')
    router.refresh()
  }

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) setData(await res.json())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetch('/api/auth/session').then(res => res.ok ? res.json() : {}).then((d: any) => {
  
      if (d?.authenticated) setUser(d.user)
    }).catch((err) => console.error('Session fetch error:', err))
    
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar
          activeModule={activeModule}
          onNavigate={setActiveModule}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={null}
          onLogout={() => {}}
          isMobileOpen={false}
          onMobileClose={() => {}}
        />
        <main className={(sidebarCollapsed ? "md:mr-[72px]" : "md:mr-[280px]") + " mr-0"}>
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "صبح بخیر" : hour < 17 ? "ظهر بخیر" : "عصر بخیر"


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl opacity-60" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl opacity-60" />
        </div>

        <Sidebar
          activeModule={activeModule}
          onNavigate={setActiveModule}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={user}
          onLogout={handleLogout}
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className={
          sidebarCollapsed 
            ? "relative z-10 min-h-screen md:mr-[72px] mr-0 transition-all duration-300 pb-35 md:pb-0"
            : "relative z-10 min-h-screen md:mr-[280px] mr-0 transition-all duration-300 pb-35 md:pb-0"
        }>
          <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="md:hidden h-9 w-9 p-0" onClick={() => setMobileSidebarOpen(true)}>
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-sm md:text-lg font-bold">{greeting}، {user?.name || 'کاربر'} 👋</h2>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {getTodayFormatted()} — {toPersianDigits(currentTime.getHours())}:{toPersianDigits(currentTime.getMinutes())}:{toPersianDigits(currentTime.getSeconds())}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-9 w-9 p-0 ${refreshing ? 'opacity-70' : ''}`} 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                >
                  <RefreshCw 
                    className="w-4 h-4" 
                    style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} 
                  />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
                </Button>
                <NotificationDropdown />
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <ErrorBoundary>
              <ModuleRouter
                activeModule={activeModule}
                data={data}
                onNavigate={setActiveModule}
                onRefresh={fetchDashboard}
                user={user} 
              />
            </ErrorBoundary>
          </div>
        </main>
        <MobileBottomNav
  activeModule={activeModule}
  setActiveModule={setActiveModule}
  setMobileSidebarOpen={setMobileSidebarOpen}
  userRole={user?.role}
  onQuickAction={(action) => setActiveModule(action)}
/>
      </div>
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ErrorBoundary>
  )

  async function handleRefresh() {
    setRefreshing(true)
    await fetchDashboard()
    setTimeout(() => setRefreshing(false), 600)
  }
}