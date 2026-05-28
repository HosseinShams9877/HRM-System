// src/modules/dashboard/components/DashboardMetrics.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { 
  BookOpen, ChevronLeft, Clock, Award, 
  TrendingUp, Users, Zap, Target 
} from 'lucide-react'
import { toPersianDigits } from '@/core/lib/utils-fa'

// ============================================
// Types
// ============================================

interface DashboardMetricsProps {
  userRole: string
  onNavigate?: (id: string) => void
  
  // Training metrics
  learningCourses?: number
  completedCourses?: number
  totalHours?: number
  trainingProgress?: number
  
  // Performance metrics (only for command roles)
  satisfactionRate?: number
  hiringEfficiency?: number
  responseTime?: number
}

// ============================================
// Donut Chart Component (Reusable)
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
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
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
  onNavigate?: (id: string) => void
}> = ({ learningCourses, completedCourses, totalHours, trainingProgress, onNavigate }) => {
  return (
    <Card className="border-0 shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          آموزش و توسعه
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-5 pt-2">
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
          onClick={() => onNavigate?.('training')}
        >
          مشاهده همه دوره‌ها
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================
// Performance Card Component (Only for Command Roles)
// ============================================

const PerformanceCard: React.FC<{
  satisfactionRate: number
  hiringEfficiency: number
  responseTime: number
}> = ({ satisfactionRate, hiringEfficiency, responseTime }) => {
  const metrics = [
    { 
      label: 'رضایت کارکنان', 
      value: satisfactionRate, 
      icon: Users, 
      color: '#10b981',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      textColor: 'text-emerald-700'
    },
    { 
      label: 'بهبود عملکرد استخدام', 
      value: hiringEfficiency, 
      icon: Target, 
      color: '#8b5cf6',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      textColor: 'text-purple-700'
    },
    { 
      label: 'کاهش زمان پاسخگویی', 
      value: responseTime, 
      icon: Zap, 
      color: '#f59e0b',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      textColor: 'text-amber-700'
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
      
      <CardContent className="flex-1 p-5 pt-2 space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-xl ${metric.bgColor}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/60 dark:bg-gray-800 rounded-lg shadow-sm">
                <metric.icon className={`w-4 h-4`} style={{ color: metric.color }} />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {metric.label}
              </span>
            </div>
            <MiniDonut progress={metric.value} color={metric.color} />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================
// Main Component (Combined)
// ============================================

export default function DashboardMetrics({
  userRole,
  onNavigate,
  learningCourses = 4,
  completedCourses = 6,
  totalHours = 28,
  trainingProgress = 60,
  satisfactionRate = 78,
  hiringEfficiency = 65,
  responseTime = 45
}: DashboardMetricsProps) {
  
    const isEmployee = userRole === 'employee'

    if (!isEmployee) {
        return null
      }
      
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <TrainingCard
        learningCourses={learningCourses}
        completedCourses={completedCourses}
        totalHours={totalHours}
        trainingProgress={trainingProgress}
        onNavigate={onNavigate}
      />
    
        <PerformanceCard
          satisfactionRate={satisfactionRate}
          hiringEfficiency={hiringEfficiency}
          responseTime={responseTime}
        />

    </div>
  )
}