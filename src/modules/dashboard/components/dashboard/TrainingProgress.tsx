// src/modules/dashboard/components/DashboardMetrics.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { 
  BookOpen, ChevronLeft, Clock, Award, 
  TrendingUp, Users, Zap, Target, Loader2 ,Star, BarChart3, CheckCircle, 
} from 'lucide-react'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { useRouter } from 'next/navigation'

// ============================================
// Types
// ============================================

interface DashboardMetricsProps {
  userRole: string
  userId?: string
  onNavigate?: (id: string) => void
}

interface TrainingStats {
  learningCourses: number
  completedCourses: number
  totalHours: number
  trainingProgress: number
}

interface PerformanceMetrics {
  avgScore: number        // میانگین امتیاز
  totalEvaluations: number // تعداد کل ارزیابی‌ها
  completedGoals: number   // تعداد اهداف تکمیل شده
  progress: number         // درصد پیشرفت کلی
}

// ============================================
// Donut Chart Component
// ============================================

interface DonutChartProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  showPercentage?: boolean
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  progress, 
  size = 120, 
  strokeWidth = 10,
  color = '#10b981',
  showPercentage = true
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            {toPersianDigits(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================
// Mini Donut for Performance Metrics
// ============================================

const MiniDonut: React.FC<{ progress: number; color?: string }> = ({ 
  progress, 
  color = '#3b82f6' 
}) => {
  const size = 50
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
          {toPersianDigits(progress)}%
        </span>
      </div>
    </div>
  )
}

// ============================================
// Training Card Component
// ============================================

const TrainingCard: React.FC<{
  learningCourses: number
  completedCourses: number
  totalHours: number
  trainingProgress: number
  onNavigate: () => void
  isLoading: boolean
}> = ({ learningCourses, completedCourses, totalHours, trainingProgress, onNavigate, isLoading }) => {
  return (
    <Card className="border-0 shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          آموزش و توسعه
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-5 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-[280px]">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <DonutChart 
                progress={trainingProgress} 
                size={130} 
                strokeWidth={10}
                color="#10b981"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-2.5 text-center">
                <BookOpen className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {toPersianDigits(learningCourses)}
                </div>
                <div className="text-[9px] text-gray-500">دوره در حال یادگیری</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-2.5 text-center">
                <Award className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {toPersianDigits(completedCourses)}
                </div>
                <div className="text-[9px] text-gray-500">دوره تکمیل شده</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2.5 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] text-gray-600 dark:text-gray-400">ساعت آموزش</span>
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {toPersianDigits(totalHours)} ساعت
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full py-2 text-sm gap-2 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 group"
              onClick={onNavigate}
            >
              مشاهده همه دوره‌ها
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Performance Card Component
// ============================================

const PerformanceCard: React.FC<{
  avgScore: number
  totalEvaluations: number
  completedGoals: number
  progress: number
  isLoading: boolean
}> = ({ avgScore, totalEvaluations, completedGoals, progress, isLoading }) => {
  const metrics = [
    { 
      label: 'میانگین امتیاز', 
      value: avgScore, 
      icon: Star, 
      color: '#8b5cf6',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      format: (v: number) => v.toFixed(1)
    },
    { 
      label: 'تعداد ارزیابی‌ها', 
      value: totalEvaluations, 
      icon: BarChart3, 
      color: '#3b82f6',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      format: (v: number) => v.toString()
    },
    { 
      label: 'اهداف تکمیل شده', 
      value: completedGoals, 
      icon: CheckCircle, 
      color: '#10b981',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      format: (v: number) => v.toString()
    },
    { 
      label: 'پیشرفت کلی', 
      value: progress, 
      icon: TrendingUp, 
      color: '#f59e0b',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      format: (v: number) => `${v}%`
    }
  ]

  return (
    <Card className="border-0 shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          عملکرد من
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-5 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-[240px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl text-center ${metric.bgColor}`}
              >
                <div className="flex items-center justify-center mb-2">
                  <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
                <div className="text-xl font-bold text-gray-800 dark:text-white">
                  {toPersianDigits(metric.format(metric.value))}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Main Component
// ============================================

export default function DashboardMetrics({ userRole, userId, onNavigate }: DashboardMetricsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TrainingStats>({
    learningCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    trainingProgress: 0
  })
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    avgScore: 0,
    totalEvaluations: 0,
    completedGoals: 0,
    progress: 0
  })

  const isEmployee = userRole === 'employee'

  useEffect(() => {
    console.log('🔍 DashboardMetrics mounted', { userRole, userId })
    if (isEmployee) {  // فقط role رو چک کن، userId لازم نیست
      fetchTrainingStats()
      fetchPerformanceMetrics()
    } else {
      console.log('⏭️ Skipping fetch: isEmployee=', isEmployee)
      setIsLoading(false)
    }
  }, [isEmployee])  // وابستگی userId رو حذف کن

  const fetchTrainingStats = async () => {
    try {
      console.log('📡 Fetching my courses...')
      setError(null)
  
      // به جای استفاده از userId، از API my-courses استفاده کن
      const response = await fetch('/api/training/my-courses')
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', errorText)
        throw new Error(`خطا در دریافت اطلاعات دوره‌ها: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Data received:', data.length, 'participants')
      
      // محاسبه آمار
      const learning = data.filter((p: any) => 
        p.status === 'registered' || p.status === 'attending'
      )
      const completed = data.filter((p: any) => 
        p.status === 'completed'
      )
      
      const totalHours = data.reduce((acc: number, p: any) => {
        return acc + (p.training?.duration || 0)
      }, 0)
  
      const progress = data.length > 0 
        ? Math.round((completed.length / data.length) * 100)
        : 0
  
      setStats({
        learningCourses: learning.length,
        completedCourses: completed.length,
        totalHours,
        trainingProgress: progress
      })
    } catch (error) {
      console.error('❌ Error fetching training stats:', error)
      setError('خطا در دریافت اطلاعات دوره‌ها')
    } finally {
      setIsLoading(false)
    }
  }


  const fetchPerformanceMetrics = async () => {
    try {
      console.log('📡 Fetching my performance from API...')
      
      const response = await fetch('/api/performance/my-performance')
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات عملکرد')
      }
      
      const result = await response.json()
      const performances = result.data || []
      console.log('📊 Performances received:', performances.length)
      
      const sorted = [...performances].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      
      const total = sorted.length
      const completed = sorted.filter((p: any) => 
        p.status === 'completed' || p.status === 'reviewed'
      ).length
      
      const avgScore = total > 0 
        ? Math.round(sorted.reduce((acc: number, p: any) => acc + p.score, 0) / total * 10) / 10
        : 0
      
      let previousAvgScore = 0
      if (total > 1) {
        const previousPerformances = sorted.slice(0, total - 1)
        previousAvgScore = Math.round(
          previousPerformances.reduce((acc: number, p: any) => acc + p.score, 0) / previousPerformances.length * 10
        ) / 10
      }
      
      let progress = 0
      if (previousAvgScore > 0) {
        progress = Math.round(((avgScore - previousAvgScore) / previousAvgScore) * 100)
      } else if (avgScore > 0 && previousAvgScore === 0) {
        progress = 100
      }
  
      setPerformance({
        avgScore: avgScore,
        totalEvaluations: total,
        completedGoals: completed,
        progress: progress
      })
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      setPerformance({
        avgScore: 0,
        totalEvaluations: 0,
        completedGoals: 0,
        progress: 0
      })
    }
  }

  const handleNavigateToTrainings = () => {
    if (onNavigate) {
      onNavigate('my-trainings')  // استفاده از onNavigate
    } else {
      router.push('/dashboard?module=my-trainings')  // fallback
    }
  }

  // اگر کاربر employee نباشه، چیزی نشون نده
  if (!isEmployee) {
    return null
  }

  // اگر خطا داشتیم، پیام خطا نشون بده
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button 
          variant="outline" 
          className="mt-3"
          onClick={() => {
            setError(null)
            setIsLoading(true)
            fetchTrainingStats()
          }}
        >
          تلاش مجدد
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <TrainingCard
        learningCourses={stats.learningCourses}
        completedCourses={stats.completedCourses}
        totalHours={stats.totalHours}
        trainingProgress={stats.trainingProgress}
        onNavigate={handleNavigateToTrainings}
        isLoading={isLoading}
      />
    
    <PerformanceCard
  avgScore={performance.avgScore}
  totalEvaluations={performance.totalEvaluations}
  completedGoals={performance.completedGoals}
  progress={performance.progress}
  isLoading={isLoading}
/>
    </div>
  )
}