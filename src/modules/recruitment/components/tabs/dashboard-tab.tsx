// src/modules/recruitment/components/tabs/dashboard-tab.tsx
'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Briefcase, Users, FileText, Calendar, Award, TrendingUp, PieChart, Clock } from 'lucide-react'
import { AnimatedCounter } from '../animated-counter'
import { getStatusBadge, getSourceLabel, toPersianNumber, formatDate } from '../../helpers'
import type { JobApplication, Candidate } from '../../types/type'

interface DashboardTabProps {
  stats: {
    totalJobs: number
    activeCandidates: number
    totalApplications: number
    upcomingInterviews: number
    activeOffers: number
    conversionRate: number
    sourceBreakdown: Record<string, number>
  }
  applications: JobApplication[]
  candidates: Candidate[]
  onApplicationClick: (app: JobApplication) => void
}

export function DashboardTab({ stats, applications, candidates, onApplicationClick }: DashboardTabProps) {
  const total = Object.values(stats.sourceBreakdown).reduce((a, b) => a + b, 0)

  const colors: Record<string, string> = {
    website: 'bg-blue-500',
    referral: 'bg-emerald-500',
    linkedin: 'bg-sky-500',
    job_site: 'bg-amber-500',
    other: 'bg-gray-400',
  }

  // رنگ‌های قبلی برای کارت‌ها
  const cardColors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-amber-500 to-amber-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-rose-500 to-rose-600',
  ]

  const items = [
    { label: 'کل آگهی‌ها', value: stats.totalJobs, icon: Briefcase, delay: 0 },
    { label: 'کاندیداهای فعال', value: stats.activeCandidates, icon: Users, delay: 0.05 },
    { label: 'درخواست‌ها', value: stats.totalApplications, icon: FileText, delay: 0.1 },
    { label: 'مصاحبه‌های پیش‌رو', value: stats.upcomingInterviews, icon: Calendar, delay: 0.15 },
    { label: 'پیشنهاد شغلی', value: stats.activeOffers, icon: Award, delay: 0.2 },
    { label: 'نرخ تبدیل', value: stats.conversionRate, icon: TrendingUp, suffix: '%', delay: 0.25 },
  ]

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <motion.div 
            key={item.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: item.delay }}
          >
            <Card className={`border-0 shadow-sm ${cardColors[index % cardColors.length]} text-white`}>
              <CardContent className="p-4 text-center">
                <item.icon className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <p className="text-xs opacity-80 mb-1">{item.label}</p>
                <p className="text-2xl font-bold">
                  <AnimatedCounter value={item.value} suffix={item.suffix || ''} />
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              منبع جذب کاندیداها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.sourceBreakdown).map(([source, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={source} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{getSourceLabel(source)}</span>
                    <span className="text-gray-500">{toPersianNumber(count)} نفر ({toPersianNumber(pct)}٪)</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100">
                    <motion.div
                      className={`h-full rounded-full ${colors[source] || 'bg-gray-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              آخرین درخواست‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onApplicationClick(app)}
                  >
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                          {app.candidate?.firstName?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {app.candidate?.firstName} {app.candidate?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{app.job?.title}</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-col items-end gap-1">
                      {getStatusBadge(app.currentStage || app.status)}
                      <span className="text-xs text-gray-400">{formatDate(app.appliedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">درخواستی یافت نشد</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}