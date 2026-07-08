// src/modules/recruitment/components/tabs/pipeline-tab.tsx
'use client'

import { Plus, ChevronRight, XCircle, Target, Building2, Briefcase, Users, User } from 'lucide-react'
import { Card } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { PIPELINE_STAGES } from '../../constants'
import { toPersianNumber, formatDate, } from '../../helpers'
import type { JobApplication } from '../../types/type'

interface PipelineTabProps {
  applications: JobApplication[]
  loading: boolean
  onAdd: () => void
  onMoveStage: (id: string, stage: string) => void
  onReject: (id: string) => void
}

export function PipelineTab({ applications, loading, onAdd, onMoveStage, onReject }: PipelineTabProps) {
  const safeApplications = Array.isArray(applications) ? applications : []

  // برعکس کردن ترتیب ستون‌ها (از راست به چچپ)
  const reversedStages = [...PIPELINE_STAGES].reverse()

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
              const stageApps = safeApplications.filter((a) => (a.currentStage || a.status) === stage.id)
              
              return (
                <div key={stage.id} className={`min-w-[260px] w-[260px] flex-shrink-0 rounded-lg border-t-4 ${stage.border} bg-gray-50 dark:bg-gray-800/50`}>
                  {/* Column Header */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{stage.label}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                      {toPersianNumber(stageApps.length)}
                    </Badge>
                  </div>

                  {/* Column Body */}
                  <ScrollArea className="max-h-[500px]">
                    <div className="p-2 space-y-2 min-h-[200px]">
                      {stageApps.length > 0 ? (
                        stageApps.map((app) => (
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
                              {stage.id !== 'hired' && stage.id !== 'rejected' && (
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
                              {stage.id !== 'hired' && stage.id !== 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  onClick={() => onReject(app.id)}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))
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
                  </ScrollArea>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}