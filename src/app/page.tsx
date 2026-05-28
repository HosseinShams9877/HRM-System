'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import {
  Users, UserCheck, Clock, CalendarOff, MapPin,
  Briefcase, LogOut, Bell, Sun, Moon, ChevronLeft,
  Menu, RefreshCw, Award, DollarSign, UserPlus,
  TrendingUp, User, Activity, type LucideIcon,
} from 'lucide-react'
import { NAV_ITEMS } from '@/core/config/navigation'
import { Button } from '@/core/components/ui/button'
import {
  toPersianDigits, getTodayFormatted,
} from '@/core/lib/utils-fa'
import { NotificationDropdown } from '@/core/components/notification-dropdown'
import { ModuleRouter } from '@/modules/dashboard/components/module-router'
import ErrorBoundary from '@/core/components/error-boundary'
import { DashboardSkeleton } from '@/core/components/skeleton-dashboard'
import type { AuthUser, DashboardData } from '@/modules/dashboard/types'

const ICON_MAP: Record<string, LucideIcon> = {
  Home: CalendarOff,
  Users, UserCheck, Clock, CalendarOff, MapPin,
  Briefcase, LogOut, Bell, CreditCard: DollarSign,
  BarChart3: TrendingUp, UserPlus, PlaneTakeoff: Briefcase,
  GraduationCap: Briefcase, Award, Settings: Briefcase,
  ClipboardList: Briefcase, FileBadge: Briefcase, DollarSign,
  Settings2: Briefcase, BellRing: Bell, Smartphone: Briefcase,
  Network: Briefcase, Building2: Briefcase, Megaphone: Bell,
  BookOpen: Briefcase, TrendingUp, User, Activity,
}


function Sidebar({
  activeModule, onNavigate, collapsed, onToggle,
  user, onLogout, isMobileOpen, onMobileClose
}: any) {

  useEffect(() => {
    console.log('🔴 Sidebar user changed:', user)
    console.log('🔴 User role:', user?.role)
  }, [user])

  const [expandedGroups, setExpandedGroups] = useState<string[]>(['attendance'])
  
  // ✅ تابع فیلتر کردن منوها بر اساس نقش کاربر
  const getFilteredNavItems = useCallback(() => {
    console.log('🔴 getFilteredNavItems CALLED!')
    const role = user?.role
    console.log('Current user role:', role)  // ← اضافه کنید این خط
    return NAV_ITEMS
      .filter(item => !item.mobileOnly)
      .filter(item => {
        // اگر allowedRoles تعریف نشده، همه ببینند
        if (!item.allowedRoles) return true
        // اگر نقش کاربر در allowedRoles هست، نشان بده
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
        })),
      }))
  }, [user])

  const [navItems, setNavItems] = useState(() => getFilteredNavItems())
  
  // ✅ هر بار user تغییر کرد، منوها را به‌روز کن
  useEffect(() => {
    setNavItems(getFilteredNavItems())
  }, [getFilteredNavItems])
  
  const toggleGroup = (id: string) => {
    setExpandedGroups(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onMobileClose} />
      )}
      
      <aside className={
        "fixed top-0 right-0 h-screen z-40 flex flex-col bg-card/80 backdrop-blur-xl border-l border-border/50 shadow-2xl transition-all duration-300 " +
        (collapsed ? "md:w-[72px]" : "md:w-[280px]") +
        " w-[300px] " +
        (isMobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0")
      }>
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold">منابع انسانی</h1>
                  <p className="text-[11px] text-muted-foreground">سامانه مدیریت هوشمند</p>
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onToggle}>
              <ChevronLeft className={"w-4 h-4 " + (collapsed ? "rotate-180" : "")} />
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item: any, index: number) => {
            const isActive = activeModule === item.id
            const isGroup = item.children && item.children.length > 0
            const isExpanded = expandedGroups.includes(item.id)

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (isGroup) toggleGroup(item.id)
                    else onNavigate(item.id)
                  }}
                  className={
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] " +
                    (isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground")
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {(!collapsed || isMobileOpen) && (
                    <>
                      <span className="flex-1 text-right">{item.label}</span>
                      {isGroup && (
                        <ChevronLeft className={"w-3.5 h-3.5 transition-transform " + (isExpanded ? "-rotate-90" : "")} />
                      )}
                    </>
                  )}
                </button>

                {isGroup && isExpanded && (!collapsed || isMobileOpen) && (
                  <div className="mr-6 mt-1 space-y-0.5">
                    {item.children.map((child: any) => (
                      <button
                        key={child.id}
                        onClick={() => { onNavigate(child.id); onMobileClose() }}
                        className={
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all min-h-[40px] " +
                          (activeModule === child.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted")
                        }
                      >
                        <child.icon className="w-3.5 h-5 shrink-0" />
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {(!collapsed || isMobileOpen) && user && (
          <div className="p-3 border-t border-border/50">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0) || user.employee?.firstName?.charAt(0) || 'م'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.name || 'کاربر'}</p>
                <p className="text-[10px] text-muted-foreground">{user.employee?.position || user.role || ''}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500" onClick={onLogout}>
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
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
    }).catch(() => {})
    
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
        {/* Background Orbs - WITHOUT animate-pulse */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl opacity-60" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl opacity-60" style={{ animationDelay: '2s' }} />
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

        {/* MAIN CONTENT */}
        <main className={
          sidebarCollapsed 
            ? "relative z-10 min-h-screen md:mr-[72px] mr-0 transition-all duration-300"
            : "relative z-10 min-h-screen md:mr-[280px] mr-0 transition-all duration-300"
        }>
          {/* Header */}
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
                  className={"h-9 w-9 p-0 " + (refreshing ? "opacity-70" : "")} 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'spin' : ''}`} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
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

          {/* Content */}
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <ErrorBoundary>
              <ModuleRouter
                activeModule={activeModule}
                data={data}
                onNavigate={setActiveModule}
                onRefresh={fetchDashboard}
              />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )

  async function handleRefresh() {
    setRefreshing(true)
    await fetchDashboard()
    setTimeout(() => setRefreshing(false), 600)
  }
}

/* Add this CSS for spin animation */
const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}