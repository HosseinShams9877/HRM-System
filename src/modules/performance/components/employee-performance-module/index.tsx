// src/modules/performance/components/employee-performance-module/index.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  Calendar,
  Loader2,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { Progress } from '@/core/components/ui/progress'
import { Badge } from '@/core/components/ui/badge'

interface EmployeePerformanceProps {
  employeeId: string
  employeeName?: string
}

interface PerformanceData {
  overallScore: number
  totalGoals: number
  completedGoals: number
  inProgressGoals: number
  pendingGoals: number
  recentEvaluations: {
    id: string
    title: string
    date: string
    score: number
    status: string
  }[]
  goals: {
    id: string
    title: string
    status: 'not_started' | 'in_progress' | 'completed'
    deadline: string
    progress: number
  }[]
}

export function EmployeePerformanceModule({
  employeeId,
  employeeName
}: EmployeePerformanceProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PerformanceData | null>(null)

  useEffect(() => {
    if (employeeId) {
      fetchPerformanceData()
    }
  }, [employeeId])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // دریافت ارزیابی‌های کارمند از API
      const response = await fetch(`/api/performance?employeeId=${employeeId}`)
      
      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات عملکرد')
      }

      const result = await response.json()
      const performances = result.data || []
      
      // محاسبه آمار از داده‌های واقعی
      const total = performances.length
      const completed = performances.filter((p: any) => 
        p.status === 'completed' || p.status === 'reviewed'
      ).length
      const pending = performances.filter((p: any) => 
        p.status === 'pending'
      ).length
      const inProgress = performances.filter((p: any) => 
        p.status === 'in_progress'
      ).length
      
      // محاسبه میانگین امتیاز
      const avgScore = total > 0 
        ? Math.round(performances.reduce((acc: number, p: any) => acc + p.score, 0) / total * 10) / 10
        : 0

      // تبدیل داده‌های API به فرمت مورد نیاز کامپوننت
      setData({
        overallScore: avgScore,
        totalGoals: total,
        completedGoals: completed,
        inProgressGoals: inProgress,
        pendingGoals: pending,
        recentEvaluations: performances.slice(0, 5).map((p: any) => ({
          id: p.id,
          title: p.period || 'ارزیابی عملکرد',
          date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('fa-IR') : '',
          score: p.score,
          status: p.status
        })),
        goals: performances.map((p: any) => ({
          id: p.id,
          title: p.period || 'هدف عملکردی',
          status: p.status === 'completed' || p.status === 'reviewed' ? 'completed' : 
                  p.status === 'in_progress' ? 'in_progress' : 'not_started',
          deadline: p.createdAt ? new Date(p.createdAt).toLocaleDateString('fa-IR') : '',
          progress: Math.min(Math.round((p.score / p.target) * 100), 100) || 0
        }))
      })
    } catch (error) {
      console.error('Error fetching performance data:', error)
      setError('خطا در دریافت اطلاعات عملکرد')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' }> = {
      'completed': { label: 'تکمیل شده', variant: 'success' },
      'reviewed': { label: 'بررسی شده', variant: 'success' },
      'in_progress': { label: 'در حال انجام', variant: 'warning' },
      'pending': { label: 'در انتظار', variant: 'warning' },
      'not_started': { label: 'شروع نشده', variant: 'default' },
      'cancelled': { label: 'لغو شده', variant: 'destructive' }
    }
    const info = map[status] || { label: status, variant: 'default' }
    return <Badge variant={info.variant}>{info.label}</Badge>
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button variant="outline" className="mt-3" onClick={fetchPerformanceData}>
          تلاش مجدد
        </Button>
      </div>
    )
  }

  if (!data || data.totalGoals === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-8 text-center">
        <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          اطلاعات عملکردی موجود نیست
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          هنوز ارزیابی عملکردی برای شما ثبت نشده است
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {employeeName ? `عملکرد ${employeeName}` : 'عملکرد من'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            خلاصه عملکرد و ارزیابی‌ها
          </p>
        </div>
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">امتیاز کلی</p>
                <p className={`text-3xl font-bold ${getScoreColor(data.overallScore)}`}>
                  {toPersianDigits(data.overallScore)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">اهداف تکمیل شده</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {toPersianDigits(data.completedGoals)}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={data.totalGoals > 0 ? (data.completedGoals / data.totalGoals) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">در حال انجام</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {toPersianDigits(data.inProgressGoals)}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">در انتظار</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {toPersianDigits(data.pendingGoals)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* اهداف */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            اهداف من
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.goals.slice(0, 5).map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                      {goal.title}
                    </span>
                    {getStatusBadge(goal.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>مهلت: {goal.deadline}</span>
                    <span>پیشرفت: {toPersianDigits(goal.progress)}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-1.5 mt-1" />
                </div>
              </div>
            ))}
            {data.goals.length > 5 && (
              <p className="text-xs text-gray-400 text-center">
                و {toPersianDigits(data.goals.length - 5)} هدف دیگر ...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ارزیابی‌های اخیر */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            ارزیابی‌های اخیر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentEvaluations.map((eval_) => (
              <div key={eval_.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {eval_.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>تاریخ: {eval_.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${getScoreColor(eval_.score)}`}>
                    {toPersianDigits(eval_.score)}
                  </span>
                  {getStatusBadge(eval_.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}