// src/modules/dashboard/layouts/AdminDesktop.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  DashboardStatCards,
  QuickActionsCard,
} from '../dashboard-kpi'
import AnalyticsCharts from '../dashboard/analytics-charts'
import { ActionCenter } from '../dashboard/actionCenter'
import ProcessStatusGrid from '../dashboard/ProcessStatusDashboard'
import CalendarWithTasks from '../dashboard/CalendarWithTasks'
import { useIsMobile } from '@/core/hooks/use-mobile'

// ============================================
// Types
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

interface AdminDesktopProps {
  stats: DashboardStats
  people?: DashboardPeople
  kpiData?: KpiItem[]
  alerts?: DashboardAlerts
  recruitment?: RecruitmentData
  attendanceTrend?: AttendanceTrendItem[]
  pending?: { leaves: number; missions: number; loans: number; contracts: number }
  onNavigate: (id: string) => void
  onRefresh?: () => void
  currentUser: { role: string; employeeId?: string; name?: string; departmentName?: string }
}

// ============================================
// Animation Variants
// ============================================

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08,
      when: "beforeChildren",
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20, duration: 0.5 },
  },
}

// ============================================
// Main Component
// ============================================

export default function AdminDesktop({
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
}: AdminDesktopProps) {

  const isMobile = useIsMobile()
  // بررسی نقش کاربر
  const isAdmin = currentUser.role === 'admin'
  const isHR = currentUser.role === 'hr_manager'
  const isDepartmentManager = currentUser.role === 'department_manager'

  // داده‌های پیش‌فرض در صورت نداشتن
  const safeStats = stats || {
    totalEmployees: 0, presentToday: 0, absentToday: 0,
    lateToday: 0, leaveToday: 0, missionToday: 0,
    noCheckIn: 0, overtimeExceeded: 0, monthlySalary: 0, monthlyInsurance: 0,
  }

  const safeAttendanceTrend = attendanceTrend && attendanceTrend.length > 0 ? attendanceTrend : []
  const safeKpiData = kpiData && kpiData.length > 0 ? kpiData : []

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-5 ${isMobile ? 'p-3' : 'p-6'} bg-gray-50 dark:bg-gray-950 min-h-screen`}
      dir="rtl"
    >
      {/* ============================================ */}
      {/* ردیف 1: کارت‌های آماری (6 تایی) */}
      {/* ============================================ */}
      <motion.div variants={sectionVariants}>
        <DashboardStatCards
          stats={safeStats}
          people={people}
          onNavigate={onNavigate}
        />
      </motion.div>
  
      {/* ============================================ */}
      {/* ردیف 2: دسترسی سریع (فقط در دسکتاپ) */}
      {/* ============================================ */}
      {!isMobile && (
        <motion.div variants={sectionVariants}>
          <QuickActionsCard
            onNavigate={onNavigate}
            currentUser={currentUser}
          />
        </motion.div>
      )}
  
      {/* ============================================ */}
      {/* ردیف 3: تحلیل نیروی انسانی + مرکز اقدامات (دسکتاپ: دو ستون) */}
      {/* ============================================ */}
      <motion.div variants={sectionVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* نمودارهای تحلیلی */}
          <AnalyticsCharts
            userRole={currentUser.role as 'admin' | 'hr_manager' | 'department_manager' | 'employee'}
            departmentId={currentUser.employeeId}
          />
          
          {/* مرکز اقدامات */}
          <ActionCenter
            userRole={currentUser.role as 'admin' | 'hr_manager' | 'department_manager' | 'employee'}
            userId={currentUser?.employeeId}
            onNavigate={onNavigate}
          />
        </div>
      </motion.div>
  
      {/* ============================================ */}
      {/* ردیف 4: وضعیت فرآیندها + تقویم رویدادها (فقط دسکتاپ) */}
      {/* ============================================ */}
      {!isMobile && (
        <motion.div variants={sectionVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ProcessStatusGrid onNavigate={onNavigate}/>
            <CalendarWithTasks
              userRole={currentUser.role}
              onTaskClick={(task) => console.log('Task clicked:', task)}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}