'use client'

import { useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { FileText, Gift, Heart, Bell, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { formatShamsi } from '@/core/lib/utils-fa'

// ============================================
// Types
// ============================================

interface DashboardAlerts {
  expiringContracts: { id: string; title: string; employeeName: string; endDate: string | null }[]
  birthdays: { id: string; name: string; date: string | null }[]
  marriageAnniversaries: { id: string; name: string; date: string | null }[]
}

// ============================================
// Alert Item — with micro animation on hover
// ============================================

function AlertItem({
  level,
  icon: Icon,
  message,
  subtext,
  delay = 0,
  isInView,
}: {
  level: 'critical' | 'warning' | 'info'
  icon: React.ElementType
  message: string
  subtext?: string
  delay?: number
  isInView: boolean
}) {
  const levelStyles = {
    critical: 'border-r-4 border-r-red-500 bg-red-50/50 dark:bg-red-950/20',
    warning: 'border-r-4 border-r-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
    info: 'border-r-4 border-r-sky-500 bg-sky-50/50 dark:bg-sky-950/20',
  }
  const iconStyles = {
    critical: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-sky-500',
  }

  return (
    <motion.div
      className={`flex items-start gap-3 p-3 rounded-lg ${levelStyles[level]} cursor-default`}
      initial={{ opacity: 0, x: 25, scale: 0.97 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 25, scale: 0.97 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: -4, scale: 1.01 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.3, delay: delay + 0.1, type: 'spring', stiffness: 300, damping: 15 }}
      >
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconStyles[level]}`} />
      </motion.div>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-relaxed">{message}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
      </div>
    </motion.div>
  )
}

// ============================================
// Alerts Card — scroll-triggered with stagger
// ============================================

export function DashboardAlertsCard({ alerts }: { alerts: DashboardAlerts }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  const allAlerts = [
    ...alerts.expiringContracts.map(c => ({
      key: c.id,
      level: 'critical' as const,
      icon: FileText,
      message: `قرارداد «${c.title}» ${c.employeeName} در حال انقضا`,
      subtext: c.endDate ? `تاریخ انقضا: ${formatShamsi(c.endDate)}` : undefined,
    })),
    ...alerts.birthdays.map(b => ({
      key: b.id,
      level: 'info' as const,
      icon: Gift,
      message: `تولد ${b.name} این ماه 🎂`,
      subtext: b.date ? formatShamsi(b.date) : undefined,
    })),
    ...alerts.marriageAnniversaries.map(m => ({
      key: m.id,
      level: 'info' as const,
      icon: Heart,
      message: `سالگرد ازدواج ${m.name} 💍`,
      subtext: m.date ? formatShamsi(m.date) : undefined,
    })),
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.96, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : { opacity: 0, y: 30, scale: 0.96, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-0 shadow-sm lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <motion.div
              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.4, delay: 0.15, type: 'spring', stiffness: 200 }}
            >
              <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
            </motion.div>
            هشدارها و یادآوری‌ها
            {allAlerts.length > 0 && (
              <motion.span
                className="text-[10px] font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded-full"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.3, delay: 0.3, type: 'spring', stiffness: 300 }}
              >
                {allAlerts.length}
              </motion.span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
          <AnimatePresence>
            {allAlerts.length > 0 ? (
              allAlerts.map((alert, idx) => (
                <AlertItem
                  key={alert.key}
                  level={alert.level}
                  icon={alert.icon}
                  message={alert.message}
                  subtext={alert.subtext}
                  delay={idx * 0.07}
                  isInView={isInView}
                />
              ))
            ) : (
              <motion.div
                className="text-center py-8 text-muted-foreground text-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                </motion.div>
                هشداری وجود ندارد
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
