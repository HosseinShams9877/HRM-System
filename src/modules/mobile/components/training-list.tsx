'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  GraduationCap, Loader2, Calendar, MapPin, User,
  BookOpen, Clock, CheckCircle2, Users
} from 'lucide-react'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  planned: { label: 'برنامه‌ریزی شده', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300' },
  in_progress: { label: 'در حال برگزاری', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
  completed: { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
}

const PARTICIPANT_STATUS: Record<string, { label: string; color: string }> = {
  registered: { label: 'ثبت‌نام شده', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300' },
  completed: { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
  failed: { label: 'عدم قبولی', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300' },
}

export default function TrainingList() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/training')
        if (res.ok) {
          const data = await res.json()
          setCourses(Array.isArray(data) ? data : [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <GraduationCap className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">دوره آموزشی یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {courses.map((course: any) => {
        const status = STATUS_MAP[course.status] || STATUS_MAP.planned
        const participants = course.participants || []
        const participantCount = participants.length

        return (
          <Card key={course.id} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/30">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  {course.title}
                </CardTitle>
                <Badge className={`${status.color} text-[10px]`}>
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-xs text-muted-foreground">مدرس</span>
                  </div>
                  <span className="text-sm font-medium">{course.instructor}</span>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
                  <Calendar className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-[10px] text-muted-foreground">شروع</div>
                  <div className="text-xs font-medium">{formatShamsi(course.startDate)}</div>
                </div>
                {course.endDate && (
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-center">
                    <Calendar className="w-3.5 h-3.5 mx-auto mb-1 text-red-600 dark:text-red-400" />
                    <div className="text-[10px] text-muted-foreground">پایان</div>
                    <div className="text-xs font-medium">{formatShamsi(course.endDate)}</div>
                  </div>
                )}
              </div>

              {/* Location */}
              {course.location && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs text-muted-foreground">محل برگزاری</span>
                  </div>
                  <span className="text-sm font-medium">{course.location}</span>
                </div>
              )}

              {/* Participants */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs text-cyan-700 dark:text-cyan-300">شرکت‌کنندگان</span>
                </div>
                <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                  {toPersianDigits(participantCount)} نفر
                </span>
              </div>

              {/* Participant List */}
              {participants.length > 0 && (
                <div className="space-y-1.5">
                  {participants.map((p: any) => {
                    const pStatus = PARTICIPANT_STATUS[p.status] || PARTICIPANT_STATUS.registered
                    return (
                      <div key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30">
                        <span className="text-[11px]">
                          {p.employee?.firstName} {p.employee?.lastName}
                        </span>
                        <div className="flex items-center gap-2">
                          {p.score !== null && p.score !== undefined && (
                            <span className="text-[10px] text-muted-foreground">
                              نمره: {toPersianDigits(p.score)}
                            </span>
                          )}
                          <Badge className={`${pStatus.color} text-[9px]`}>
                            {pStatus.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
