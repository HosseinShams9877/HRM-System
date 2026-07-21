// src/modules/recruitment/components/tabs/pipeline-tab.tsx

'use client'

import { Plus, ChevronRight, XCircle, Target, User, FileText, ChevronLeft } from 'lucide-react'
import { Card } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { PIPELINE_STAGES } from '../../constants'
import { toPersianNumber, formatDate } from '../../helpers'
import type { JobApplication } from '../../types/type'
import { useState } from 'react'

interface PipelineTabProps {
  applications: JobApplication[]
  loading: boolean
  onAdd: () => void
  onMoveStage: (id: string, stage: string) => void
  onReject: (id: string) => void
  onCreateOffer?: (application: JobApplication) => void
}

const ITEMS_PER_PAGE = 3

export function PipelineTab({ 
  applications, 
  loading, 
  onAdd, 
  onMoveStage, 
  onReject,
  onCreateOffer
}: PipelineTabProps) {
  const safeApplications = Array.isArray(applications) ? applications : []

  const reversedStages = [...PIPELINE_STAGES].reverse()

  // State برای نگهداری ایندکس شروع هر ستون (مثل یه کاروسل)
  const [startIndex, setStartIndex] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    reversedStages.forEach(stage => {
      initial[stage.id] = 0
    })
    return initial
  })

  // تابع برای حرکت به چپ (نمایش کارت‌های قبلی)
  const moveLeft = (stageId: string) => {
    setStartIndex(prev => {
      const stageApps = safeApplications.filter((a) => {
        const isInStage = (a.currentStage || a.status) === stageId
        const isCandidateActive = a.candidate?.status === 'active'
        return isInStage && isCandidateActive
      })
      const current = prev[stageId] || 0
      const newIndex = Math.max(0, current - 1)
      return { ...prev, [stageId]: newIndex }
    })
  }

  // تابع برای حرکت به راست (نمایش کارت‌های بعدی)
  const moveRight = (stageId: string) => {
    setStartIndex(prev => {
      const stageApps = safeApplications.filter((a) => {
        const isInStage = (a.currentStage || a.status) === stageId
        const isCandidateActive = a.candidate?.status === 'active'
        return isInStage && isCandidateActive
      })
      const current = prev[stageId] || 0
      const maxStart = Math.max(0, stageApps.length - ITEMS_PER_PAGE)
      const newIndex = Math.min(maxStart, current + 1)
      return { ...prev, [stageId]: newIndex }
    })
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          موقعیت‌ها بر اساس وضعیت در ستون‌های مختلف نمایش داده می‌شوند.
        </p>
        <Button size="sm" className="gap-1.5 text-xs" onClick={onAdd}>
          <Plus className="w-3.5 h-3.5" /> افزودن موقعیت
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: `${PIPELINE_STAGES.length * 280}px` }}>
          {reversedStages.map((stage) => {
            const stageApps = safeApplications.filter((a) => {
            const isInStage = (a.currentStage || a.status) === stage.id
            const isCandidateActive = a.candidate?.status === 'active'
            return isInStage && isCandidateActive
                })
            
            const currentStart = startIndex[stage.id] || 0
            const maxStart = Math.max(0, stageApps.length - ITEMS_PER_PAGE)
            
            // آیتم‌های قابل نمایش (حداکثر ۳ تا)
            const visibleItems = stageApps.slice(currentStart, currentStart + ITEMS_PER_PAGE)
            
            const canMoveLeft = currentStart > 0
            const canMoveRight = currentStart < maxStart

              return (
                <div key={stage.id} className={`min-w-[260px] w-[260px] flex-shrink-0 rounded-lg border-t-4 ${stage.border} bg-gray-50 dark:bg-gray-800/50`}>
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{stage.label}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                      {toPersianNumber(stageApps.length)}
                    </Badge>
                  </div>

                  <div className="p-2 min-h-[200px] relative">
                    {/* دکمه‌های چپ و راست - فقط اگه بیشتر از ۳ تا باشه */}
                    {stageApps.length > ITEMS_PER_PAGE && (
                      <>
                        <button
                          onClick={() => moveLeft(stage.id)}
                          disabled={!canMoveLeft}
                          className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-background border border-border shadow-sm flex items-center justify-center transition-all ${
                            !canMoveLeft 
                              ? 'opacity-30 cursor-not-allowed' 
                              : 'hover:bg-accent hover:border-primary'
                          }`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => moveRight(stage.id)}
                          disabled={!canMoveRight}
                          className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-background border border-border shadow-sm flex items-center justify-center transition-all ${
                            !canMoveRight 
                              ? 'opacity-30 cursor-not-allowed' 
                              : 'hover:bg-accent hover:border-primary'
                          }`}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    
                    <div className="space-y-2">
                      {stageApps.length > 0 ? (
                        visibleItems.map((app) => {
                          const isRejected = app.status === 'rejected'
                          const isOfferStage = stage.id === 'offer'
                          const isHiredStage = stage.id === 'hired'

                          return (
                            <Card key={app.id} className="p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 flex-row-reverse mb-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs">
                                    {app.candidate?.firstName?.[0]}{app.candidate?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-right min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                                    {app.candidate?.firstName} {app.candidate?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.job?.title}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
                                <span>{formatDate(app.appliedAt)}</span>
                                {app.matchScore > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {toPersianNumber(app.matchScore)}٪
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                {!isRejected && !isHiredStage && stage.id !== 'rejected' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    onClick={() => onMoveStage(app.id, app.currentStage || app.status)}
                                  >
                                    <ChevronRight className="h-3 w-3 mr-1" />
                                    مرحله بعد
                                  </Button>
                                )}

                                {isOfferStage && !isRejected && (
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => onCreateOffer?.(app)}
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    ایجاد پیشنهاد
                                  </Button>
                                )}

                                {!isRejected && stage.id !== 'hired' && stage.id !== 'rejected' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    onClick={() => onReject(app.id)}
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                )}

                                {isRejected && (
                                  <Badge variant="destructive" className="text-xs w-full justify-center">
                                    رد شده
                                  </Badge>
                                )}

                                {isHiredStage && !isRejected && (
                                  <Badge className="bg-emerald-100 text-emerald-600 text-xs w-full justify-center">
                                    استخدام شد
                                  </Badge>
                                )}
                              </div>
                            </Card>
                          )
                        })
                      ) : (
                        <div className="p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <User className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            <p className="text-xs text-gray-400 dark:text-gray-500">هیچ درخواستی در این مرحله نیست</p>
                            <p className="text-[10px] text-gray-300 dark:text-gray-600">با ثبت درخواست جدید، اینجا پر می‌شود</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}