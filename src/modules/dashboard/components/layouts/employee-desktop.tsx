// src/modules/dashboard/layouts/EmployeeDesktop.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, LogOut, LogIn, AlertCircle, CheckCircle, 
  Briefcase, CalendarCheck, TrendingUp, TrendingDown,
  Eye, Send, Loader2, Calendar, Edit3, Zap, Shield,
  Award, CreditCard, FileText, User
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Progress } from '@/core/components/ui/progress'
import { getTodayShamsi, toPersianDigits } from '@/core/lib/utils-fa'
import { ActionCenter } from '../dashboard/actionCenter'
import DashboardMetrics from '../dashboard/TrainingProgress'
import { useIsMobile } from '@/core/hooks/use-mobile'
import { toast } from 'sonner'
import { CheckInDialog } from '@/modules/attendance/attendance/components/attendance-form-dialog'
import type { EmployeeBasic } from '@/modules/attendance/attendance/index'

// ============================================
// Types
// ============================================

interface EmployeeStats {
  hasCheckedIn: boolean
  hasCheckedOut: boolean
  checkInTime?: string
  checkOutTime?: string
  totalWorkHours: number
  overtimeToday: number
  lateMinutes: number
  usedLeaveDays: number
  remainingLeaveDays: number
  totalLeaveDays: number
  attendanceRate: number
  perfectDays: number
  activeRequests: {
    leaves: number
    missions: number
    overtime: number
    corrections: number
  }
}
interface LeaveRequest {
  id: string
  type: string 
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
  totalDays: number  
  days?: number     
}

interface MissionRequest {
  id: string
  title: string
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
}

interface AttendanceRecord {
  id: string
  date: string
  checkIn: string
  checkOut: string
  workHours: number
  overtime: number
  late: number
  status: 'present' | 'absent' | 'late' | 'mission' | 'leave'
}

interface EmployeeDesktopProps {
  employeeId: string
  onNavigate: (id: string) => void
  currentUser?: { role: string; employeeId?: string; name?: string; position?: string; department?: string }
}

// ============================================
// Helper Components
// ============================================

function StatItem({ icon: Icon, label, value, unit, color, onClick }: any) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-3 bg-gradient-to-br ${color} text-white shadow-md hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-1">
        <Icon className="w-4 h-4 opacity-80" />
      </div>
      <div className="text-xl font-bold">
        {typeof value === 'number' ? toPersianDigits(value) : value}
        {unit && <span className="text-xs mr-0.5 opacity-80">{unit}</span>}
      </div>
      <div className="text-[10px] opacity-80 mt-0.5">{label}</div>
    </motion.div>
  )
}

// ============================================
// Main Component
// ============================================

function EmployeeDesktop({ employeeId, onNavigate, currentUser }: EmployeeDesktopProps) {
  const isMobile = useIsMobile()
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [recentLeaveRequests, setRecentLeaveRequests] = useState<LeaveRequest[]>([])
  const [recentMissions, setRecentMissions] = useState<MissionRequest[]>([])
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showCheckOut, setShowCheckOut] = useState(false)
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])

  // ============================================
  // Fetch Data from API
  // ============================================
  
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)
      
      const today = getTodayShamsi()
      const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
      
      // 1. دریافت وضعیت حضور امروز
      const attendanceRes = await fetch(`/api/attendance?date=${todayStr}`)
      
      let hasCheckedIn = false
      let hasCheckedOut = false
      let checkInTime: string | undefined = undefined
      let checkOutTime: string | undefined = undefined
      let totalWorkHours = 0
      let overtimeToday = 0
      let lateMinutes = 0
      
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json()
        const records = attendanceData.data || attendanceData.records || []
        const todayRecord = records.find((r: any) => r.employeeId === employeeId)
        
        if (todayRecord) {
          hasCheckedIn = !!todayRecord.checkIn && todayRecord.checkIn !== 'null'
          hasCheckedOut = !!todayRecord.checkOut && todayRecord.checkOut !== 'null'
          checkInTime = hasCheckedIn ? todayRecord.checkIn : undefined
          checkOutTime = hasCheckedOut ? todayRecord.checkOut : undefined
          totalWorkHours = todayRecord.workHours || 0
          overtimeToday = todayRecord.overtime || 0
          lateMinutes = todayRecord.late || 0
        }
      }
      
      // 2. دریافت مرخصی‌ها (بدون فراخوانی balance)
      const leavesRes = await fetch(`/api/leaves?employeeId=${employeeId}&limit=50`)
      let usedDays = 0
      let remainingDays = 26
      let totalLeaveDays = 26
      let leavesPendingCount = 0
      let recentLeaves: any[] = []
      
      if (leavesRes.ok) {
        const leavesResult = await leavesRes.json()
        const leavesList = leavesResult.data || leavesResult.records || leavesResult
        const leavesArray = Array.isArray(leavesList) ? leavesList : []
        
        // فیلتر مرخصی‌های مربوط به این کارمند
        const employeeLeaves = leavesArray.filter((l: any) => l.employeeId === employeeId)
        
        // محاسبه مجموع روزهای مرخصی تایید شده
        const approvedDays = employeeLeaves
          .filter((leave: any) => leave.status === 'approved')
          .reduce((sum: number, leave: any) => sum + (leave.totalDays || 0), 0)
        
        // محاسبه تعداد در انتظار تایید
        leavesPendingCount = employeeLeaves.filter((leave: any) => leave.status === 'pending').length
        
        usedDays = approvedDays
        remainingDays = Math.max(0, totalLeaveDays - approvedDays)
        recentLeaves = employeeLeaves.slice(0, 5)
      }
      
      // 3. دریافت ماموریت‌های اخیر
      const missionsRes = await fetch(`/api/missions?employeeId=${employeeId}&limit=5`)
      let missionsData = { recent: [], pendingCount: 0 }
      if (missionsRes.ok) {
        const missionsResult = await missionsRes.json()
        const missionsList = missionsResult.data || missionsResult.records || missionsResult
        const missionsArray = Array.isArray(missionsList) ? missionsList : []
        const employeeMissions = missionsArray.filter((m: any) => m.employeeId === employeeId)
        
        missionsData = {
          recent: employeeMissions.slice(0, 5),
          pendingCount: employeeMissions.filter((m: any) => m.status === 'pending').length
        }
      }
      
      // 4. دریافت تاریخچه تردد
      const historyRes = await fetch(`/api/attendance/history?employeeId=${employeeId}&days=7`)
      let historyRecords: AttendanceRecord[] = []
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        historyRecords = historyData.records || historyData.data?.records || []
      }
      
      setStats({
        hasCheckedIn,
        hasCheckedOut,
        checkInTime,
        checkOutTime,
        totalWorkHours,
        overtimeToday,
        lateMinutes,
        usedLeaveDays: usedDays,
        remainingLeaveDays: remainingDays,
        totalLeaveDays: totalLeaveDays,
        attendanceRate: 0,
        perfectDays: 0,
        activeRequests: {
          leaves: leavesPendingCount,
          missions: missionsData.pendingCount,
          overtime: 0,
          corrections: 0
        }
      })
      
      setRecentLeaveRequests(recentLeaves)
      setRecentMissions(missionsData.recent)
      setAttendanceHistory(historyRecords)
      
    } catch (error) {
      console.error('Error fetching employee data:', error)
      toast.error('خطا در دریافت اطلاعات')
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?status=active')
      if (res.ok) {
        const result = await res.json()
        const empList = Array.isArray(result) ? result : (result.data || [])
        setEmployees(empList.map((e: EmployeeBasic) => ({
          id: e.id, 
          firstName: e.firstName, 
          lastName: e.lastName,
          personnelCode: e.personnelCode, 
          avatar: e.avatar,
          department: e.department, 
          position: e.position,
        })))
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 30000)
    return () => clearInterval(interval)
  }, [fetchAllData])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // ============================================
  // Handle Check In/Out
  // ============================================
  
  const handleCheckInOut = async (formData: Record<string, unknown>, type: 'checkIn' | 'checkOut') => {
    setIsSubmitting(true)
    try {
      let targetEmployeeId = formData.employeeId as string
      
      if (currentUser?.role === 'employee') {
        targetEmployeeId = currentUser?.employeeId || ''
        if (!targetEmployeeId) {
          toast.error('شناسه کارمند یافت نشد')
          return
        }
      }

      const payload: Record<string, unknown> = {
        employeeId: targetEmployeeId,
        date: formData.date,
      }

      if (type === 'checkIn') {
        payload.checkIn = formData.checkIn
      } else {
        payload.checkOut = formData.checkOut
      }

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(type === 'checkIn' ? 'ورود با موفقیت ثبت شد' : 'خروج با موفقیت ثبت شد')
        await fetchAllData()
      } else {
        const error = await res.json()
        toast.error(error.error || 'خطا در ثبت تردد')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setIsSubmitting(false)
      setShowCheckIn(false)
      setShowCheckOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  // Colors for stats
  const statColors = {
    work: 'from-blue-500 to-blue-600',
    overtime: 'from-amber-500 to-amber-600',
    late: 'from-rose-500 to-rose-600',
    leave: 'from-emerald-500 to-emerald-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={isMobile ? "p-4 min-h-screen bg-gray-50 dark:bg-gray-950" : "p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen"}
      dir="rtl"
    >
      {/* Main Container Card */}
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
        <CardContent className="p-5 space-y-5">
          
          {/* ========== Row 1: 4 Stats Cards ========== */}
          <div className={isMobile ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 md:grid-cols-4 gap-3"}>
            <StatItem
              icon={Clock}
              label="کارکرد امروز"
              value={stats?.totalWorkHours || 0}
              unit="ساعت"
              color={statColors.work}
            />
            <StatItem
              icon={TrendingUp}
              label="اضافه کاری"
              value={stats?.overtimeToday || 0}
              unit="ساعت"
              color={statColors.overtime}
            />
            <StatItem
              icon={TrendingDown}
              label="تاخیر امروز"
              value={stats?.lateMinutes || 0}
              unit="دقیقه"
              color={statColors.late}
            />
            <StatItem
              icon={CalendarCheck}
              label="مانده مرخصی"
              value={stats?.remainingLeaveDays || 0}
              unit="روز"
              color={statColors.leave}
            />
          </div>

          {/* ========== Row 2: Check In/Out + Quick Actions ========== */}
          <div className={isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-4"}>
            {/* Check In/Out Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                وضعیت حضور امروز
              </h3>
              
              {stats?.hasCheckedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">زمان ورود</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.checkInTime || '—'}</span>
                  </div>
                  {stats.hasCheckedOut ? (
                    <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">زمان خروج</span>
                      <span className="font-bold text-gray-600 dark:text-gray-400">{stats.checkOutTime || '—'}</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setShowCheckOut(true)}
                      disabled={isSubmitting}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-sm py-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                      ثبت خروج
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center py-2">
                    <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">هنوز ورود ثبت نشده</p>
                  </div>
                  <Button 
                    onClick={() => setShowCheckIn(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-sm py-2"
                  >
                    <LogIn className="w-4 h-4 ml-2" />
                    ثبت ورود
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions - فقط در دسکتاپ */}
            {!isMobile && (
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  دسترسی سریع
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: CalendarCheck, label: 'درخواست مرخصی', path: 'att-leave', color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
                    { icon: Briefcase, label: 'درخواست ماموریت', path: 'att-mission', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
                    { icon: Edit3, label: 'اصلاح تردد', path: 'att-today', color: 'amber', gradient: 'from-amber-500 to-amber-600' }
                  ].map((action) => (
                    <motion.div
                      key={action.label}
                      whileHover={{ scale: 1.02, y: -3, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className={`
                          relative overflow-hidden group
                          flex flex-col items-center gap-1 py-3 h-auto w-full
                          border-0 bg-${action.color}-50 dark:bg-${action.color}-950/30
                          transition-all duration-300 cursor-pointer
                        `}
                        onClick={() => onNavigate(action.path)}
                      >
                        <motion.div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r ${action.gradient}`}
                          initial={false}
                          whileHover={{ opacity: 1 }}
                        />
                        <motion.div
                          className={`absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md bg-gradient-to-r ${action.gradient}`}
                          initial={false}
                          whileHover={{ opacity: 0.5 }}
                        />
                        <motion.div
                          className="relative z-10"
                          whileHover={{ rotate: [0, -8, 8, -5, 5, 0], scale: 1.15, transition: { duration: 0.5 } }}
                        >
                          <action.icon className={`w-4 h-4 text-${action.color}-600 group-hover:text-white transition-all duration-300`} />
                        </motion.div>
                        <motion.span 
                          className={`text-[11px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-white transition-all duration-300 relative z-10`}
                          whileHover={{ letterSpacing: '0.5px' }}
                        >
                          {action.label}
                        </motion.span>
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          initial={{ boxShadow: '0 0 0 0 rgba(255,255,255,0)' }}
                          whileTap={{ boxShadow: '0 0 0 4px rgba(255,255,255,0.4)', transition: { duration: 0.1 } }}
                        />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========== Row 3: Leave Balance & Active Requests ========== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leave Balance */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                وضعیت مرخصی
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">استفاده شده</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{toPersianDigits(stats?.usedLeaveDays || 0)} روز</span>
                  </div>
                  <Progress value={((stats?.usedLeaveDays || 0) / (stats?.totalLeaveDays || 26)) * 100} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">مانده مرخصی</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{toPersianDigits(stats?.remainingLeaveDays || 0)} روز</span>
                  </div>
                  <Progress value={((stats?.remainingLeaveDays || 0) / (stats?.totalLeaveDays || 26)) * 100} className="h-1.5" />
                </div>
              </div>
            </div>

            {/* Active Requests */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-500" />
                درخواست‌های در انتظار
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: CalendarCheck, label: 'مرخصی', count: stats?.activeRequests.leaves || 0, color: 'emerald' },
                  { icon: Briefcase, label: 'ماموریت', count: stats?.activeRequests.missions || 0, color: 'blue' },
                  { icon: Clock, label: 'اضافه کاری', count: stats?.activeRequests.overtime || 0, color: 'amber' },
                  { icon: Edit3, label: 'اصلاح تردد', count: stats?.activeRequests.corrections || 0, color: 'rose' }
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between p-2 bg-${item.color}-50 dark:bg-${item.color}-950/30 rounded-lg`}>
                    <div className="flex items-center gap-1.5">
                      <item.icon className={`w-3.5 h-3.5 text-${item.color}-600 dark:text-${item.color}-400`} />
                      <span className="text-[11px] text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    {item.count > 0 ? (
                      <Badge className={`bg-${item.color}-500 text-white text-[10px] px-1.5 py-0`}>
                        {toPersianDigits(item.count)}
                      </Badge>
                    ) : (
                      <CheckCircle className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========== Recent Requests - فقط در دسکتاپ ========== */}
          {!isMobile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Leaves */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                  مرخصی‌های اخیر
                </h3>
                {recentLeaveRequests.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs">هیچ مرخصی ثبت نشده</div>
                ) : (
                  <div className="space-y-2">
                    {recentLeaveRequests.slice(0, 2).map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
  <p className="text-xs font-medium dark:text-gray-300">
    {req.type === 'annual' || req.type === 'استحقاقی' ? 'مرخصی سالانه' : 
     req.type === 'sick' || req.type === 'استعلاجی' ? 'مرخصی استعلاجی' : 
     req.type === 'emergency' || req.type === 'اضطراری' ? 'مرخصی اضطراری' : req.type}
  </p>
  <p className="text-[10px] text-gray-400 dark:text-gray-500">
    {toPersianDigits(req.totalDays || req.days || 0)} روز
  </p>
</div>
                        <Badge className={
                          req.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                          req.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                        }>
                          {req.status === 'approved' ? 'تأیید' : req.status === 'pending' ? 'در انتظار' : 'رد'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Missions */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  ماموریت‌های اخیر
                </h3>
                {recentMissions.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs">هیچ ماموریتی ثبت نشده</div>
                ) : (
                  <div className="space-y-2">
                    {recentMissions.slice(0, 2).map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="text-xs font-medium dark:text-gray-300">{req.title}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{req.startDate}</p>
                        </div>
                        <Badge className={
                          req.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                          req.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                        }>
                          {req.status === 'approved' ? 'تأیید' : req.status === 'pending' ? 'در انتظار' : 'رد'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
            
          {/* ========== Row 4: Action Center ========== */}
          <div className="grid grid-cols-1 gap-4">
            <ActionCenter
              userRole={currentUser?.role as 'admin' | 'hr_manager' | 'department_manager' | 'employee' || 'employee'}
              userId={currentUser?.employeeId}
              onNavigate={onNavigate}
            />
          </div>

          {/* ========== Row 5: DashboardMetrics - فقط در دسکتاپ ========== */}
          {!isMobile && currentUser?.role === 'employee' && (
            <DashboardMetrics
              userRole={currentUser.role}
              onNavigate={onNavigate}
              learningCourses={5}
              completedCourses={8}
              totalHours={42}
              trainingProgress={65}
            />
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Dialogs */}
      {/* ============================================ */}
      
      {/* Check-In Dialog */}
      <CheckInDialog
        open={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={(d) => handleCheckInOut(d, 'checkIn')}
        employees={employees}
        type="checkIn"
        currentUser={currentUser}
      />

      {/* Check-Out Dialog */}
      <CheckInDialog
        open={showCheckOut}
        onClose={() => setShowCheckOut(false)}
        onSubmit={(d) => handleCheckInOut(d, 'checkOut')}
        employees={employees}
        type="checkOut"
        currentUser={currentUser}
      />
    </motion.div>
  )
}

export default React.memo(EmployeeDesktop)