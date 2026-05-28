// src/core/components/mobile-bottom-nav.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  Home, Users, Menu, Sparkles, 
  CalendarCheck, Briefcase, Clock, CreditCard, UserPlus
} from 'lucide-react'

interface MobileBottomNavProps {
  activeModule: string
  setActiveModule: (id: string) => void
  setMobileSidebarOpen: (open: boolean) => void
  userRole: string | undefined
  onQuickAction?: (action: string) => void
}

export function MobileBottomNav({ 
  activeModule, 
  setActiveModule, 
  setMobileSidebarOpen, 
  userRole,
  onQuickAction 
}: MobileBottomNavProps) {
  const isAdmin = userRole && ['admin', 'hr_manager', 'department_manager'].includes(userRole)
  const isEmployee = userRole === 'employee'

  // ✅ دسترسی‌های سریع برای ادمین (5 تا)
  const adminQuickActions = [
    { id: 'leave', label: 'مرخصی', icon: CalendarCheck, color: 'emerald', action: () => onQuickAction?.('att-leave') },
    { id: 'mission', label: 'ماموریت', icon: Briefcase, color: 'blue', action: () => onQuickAction?.('att-mission') },
    { id: 'attendance', label: 'تردد', icon: Clock, color: 'amber', action: () => onQuickAction?.('att-today') },
    { id: 'payroll', label: 'فیش حقوقی', icon: CreditCard, color: 'rose', action: () => onQuickAction?.('payroll') },
    { id: 'employee', label: 'کارمند جدید', icon: UserPlus, color: 'purple', action: () => onQuickAction?.('employees') },
  ]

  // ✅ دسترسی‌های سریع برای کارمند (3 تا)
  const employeeQuickActions = [
    { id: 'leave', label: 'مرخصی', icon: CalendarCheck, color: 'emerald', action: () => onQuickAction?.('att-leave') },
    { id: 'mission', label: 'ماموریت', icon: Briefcase, color: 'blue', action: () => onQuickAction?.('att-mission') },
    { id: 'attendance', label: 'تردد', icon: Clock, color: 'amber', action: () => onQuickAction?.('att-today') },
  ]

  const quickActions = isEmployee ? employeeQuickActions : adminQuickActions

  // نقشه رنگ‌ها
  const colorMap: Record<string, { light: string; dark: string; text: string }> = {
    emerald: { light: 'bg-emerald-100', dark: 'dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
    blue: { light: 'bg-blue-100', dark: 'dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400' },
    amber: { light: 'bg-amber-100', dark: 'dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400' },
    rose: { light: 'bg-rose-100', dark: 'dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400' },
    purple: { light: 'bg-purple-100', dark: 'dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400' },
  }

  return (
    <>
      {/* Quick Actions Bar - بالای تب‌ها */}
      <div className="fixed bottom-16 left-0 right-0 z-50 md:hidden px-4">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-2"
        >
          <div className="flex items-center justify-around gap-2">
            {quickActions.map((action, idx) => {
              const colors = colorMap[action.color]
              return (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={action.action}
                  className="flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-all"
                >
                  <div className={`p-1.5 rounded-lg ${colors.light} ${colors.dark}`}>
                    <action.icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                    {action.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 shadow-2xl">
          <div className="flex items-center justify-around py-1 px-3">
            
            {/* تب داشبورد */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveModule('dashboard')}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-4 rounded-2xl transition-all ${
                activeModule === 'dashboard' 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {activeModule === 'dashboard' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-emerald-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Home className={`w-5 h-5 ${activeModule === 'dashboard' ? 'fill-emerald-50' : ''}`} />
              <span className="text-[9px] font-medium">خانه</span>
            </motion.button>

            {/* تب کارکنان - فقط برای مدیران */}
            {isAdmin && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveModule('employees')}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-4 rounded-2xl transition-all ${
                  activeModule === 'employees' 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {activeModule === 'employees' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Users className="w-5 h-5" />
                <span className="text-[9px] font-medium">کارکنان</span>
              </motion.button>
            )}

            {/* دکمه مرکزی منو */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileSidebarOpen(true)}
              className="relative -mt-6"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 block">
                منو
              </span>
            </motion.button>

            {/* تب درخواست‌ها */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveModule('att-leave')}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-4 rounded-2xl transition-all ${
                activeModule === 'att-leave' || activeModule === 'att-mission'
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {activeModule === 'att-leave' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-emerald-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <CalendarCheck className="w-5 h-5" />
              <span className="text-[9px] font-medium">درخواست</span>
            </motion.button>
          </div>
        </div>

        {/* Safe area for notches */}
        <div className="h-safe-bottom bg-white/95 dark:bg-gray-950/95" />
      </div>
    </>
  )
}