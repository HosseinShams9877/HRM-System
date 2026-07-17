// src/modules/recruitment/components/tabs/reports-tab.tsx
'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Globe, Activity, Award, TrendingUp, PieChart } from 'lucide-react'
import { toPersianNumber } from '../../helpers'
import { PIPELINE_STAGES } from '../../constants'
import type { JobApplication, JobOffer, Candidate } from '../../types/type'

interface ReportsTabProps {
  applications: JobApplication[]
  jobOffers: JobOffer[]
  candidates: Candidate[]
  stats: {
    sourceBreakdown: Record<string, number>
  }
  timeToFill: number
  timeToHire: number
  offerAcceptanceRate: number
  offerAccepted: number
  totalOffers: number
  noShowRate: number
  noShowInterviews: number
  totalInterviews: number
}

export function ReportsTab({
  applications,
  jobOffers,
  candidates,
  stats,
  timeToFill,
  timeToHire,
  offerAcceptanceRate,
  offerAccepted,
  totalOffers,
  noShowRate,
  noShowInterviews,
  totalInterviews,
}: ReportsTabProps) {
  const stageFunnel = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: applications.filter((a) => a.currentStage === stage.id).length,
  }))

  const maxFunnelCount = Math.max(...stageFunnel.map((s) => s.count), 1)

  const colors: Record<string, string> = {
    website: 'bg-blue-500',
    referral: 'bg-emerald-500',
    linkedin: 'bg-sky-500',
    job_site: 'bg-amber-500',
    other: 'bg-gray-400',
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">زمان پر کردن جایگاه</p>
            <p className="text-2xl font-bold text-blue-600">{toPersianNumber(timeToFill)} روز</p>
            <p className="text-xs text-gray-400 mt-1">میانگین از انتشار تا استخدام</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">زمان استخدام</p>
            <p className="text-2xl font-bold text-purple-600">{toPersianNumber(timeToHire)} روز</p>
            <p className="text-xs text-gray-400 mt-1">میانگین از درخواست تا استخدام</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">نرخ پذیرش پیشنهاد</p>
            <p className="text-2xl font-bold text-emerald-600">{toPersianNumber(offerAcceptanceRate)}٪</p>
            <p className="text-xs text-gray-400 mt-1">{toPersianNumber(offerAccepted)} از {toPersianNumber(totalOffers)} پیشنهاد</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">نرخ عدم حضور</p>
            <p className="text-2xl font-bold text-orange-600">{toPersianNumber(noShowRate)}٪</p>
            <p className="text-xs text-gray-400 mt-1">{toPersianNumber(noShowInterviews)} از {toPersianNumber(totalInterviews)} مصاحبه</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              توزیع منابع درخواست
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.sourceBreakdown).map(([source, count]) => {
              const total = Object.values(stats.sourceBreakdown).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{source === 'website' ? 'وب‌سایت' : 
                            source === 'referral' ? 'معرفی' :
                            source === 'linkedin' ? 'لینکدین' :
                            source === 'job_site' ? 'سایت کاریابی' : 'سایر'}</span>
                    <span className="text-gray-500">{toPersianNumber(count)} ({toPersianNumber(pct)}٪)</span>
                  </div>
                  <div className="h-4 rounded-full bg-gray-100">
                    <motion.div
                      className={`h-full rounded-full ${colors[source] || 'bg-gray-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1 }}
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
              <Activity className="h-5 w-5 text-purple-500" />
              قیف تبدیل مراحل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stageFunnel.map((stage, idx) => (
              <div key={stage.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded ${stage.color}`} />
                    {stage.label}
                  </span>
                  <span className="text-gray-600 font-medium">{toPersianNumber(stage.count)} درخواست</span>
                </div>
                <div className="h-6 rounded bg-gray-100 relative overflow-hidden">
                  <motion.div
                    className={`h-full rounded ${stage.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${maxFunnelCount > 0 ? (stage.count / maxFunnelCount) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {maxFunnelCount > 0 ? toPersianNumber(Math.round((stage.count / maxFunnelCount) * 100)) : 0}٪
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 justify-end">
            <Award className="h-5 w-5 text-teal-500" />
            خلاصه پیشنهادات شغلی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center  ">
            <div className="order-5">
              <p className="text-2xl font-bold text-gray-900">{toPersianNumber(jobOffers.length)}</p>
              <p className="text-xs text-gray-500">کل پیشنهادات</p>
            </div>
            <div className="order-4">
              <p className="text-2xl font-bold text-blue-600">{toPersianNumber(jobOffers.filter((o) => o.status === 'draft' || o.status === 'pending').length)}</p>
              <p className="text-xs text-gray-500">در انتظار</p>
            </div>
            <div className="order-3">
              <p className="text-2xl font-bold text-emerald-600">{toPersianNumber(jobOffers.filter((o) => o.status === 'accepted').length)}</p>
              <p className="text-xs text-gray-500">پذیرفته شده</p>
            </div>
            <div className="order-2">
              <p className="text-2xl font-bold text-red-600">{toPersianNumber(jobOffers.filter((o) => o.status === 'declined').length)}</p>
              <p className="text-xs text-gray-500">رد شده</p>
            </div>
            <div className="order-1">
              <p className="text-2xl font-bold text-gray-600">{toPersianNumber(jobOffers.filter((o) => o.status === 'revoked').length)}</p>
              <p className="text-xs text-gray-500">ابطال شده</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}