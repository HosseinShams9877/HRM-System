'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Progress } from '@/core/components/ui/progress'
import { Separator } from '@/core/components/ui/separator'
import {
  BarChart3, Loader2, Target, TrendingUp, Star,
  Award, MessageSquare
} from 'lucide-react'
import { toPersianDigits } from '@/core/lib/utils-fa'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
  completed: { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
}

const KPI_LABELS = ['شاخص کیفیت کار', 'شاخص بهره‌وری', 'شاخص teamwork', 'شاخص نوآوری']

function getScoreColor(score: number, target: number): string {
  const ratio = target > 0 ? score / target : 0
  if (ratio >= 1) return 'text-emerald-600 dark:text-emerald-400'
  if (ratio >= 0.7) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreLabel(score: number): string {
  if (score >= 4.5) return 'عالی'
  if (score >= 3.5) return 'خوب'
  if (score >= 2.5) return 'متوسط'
  if (score >= 1.5) return 'ضعیف'
  return 'بسیار ضعیف'
}

export default function PerformanceResult() {
  const [loading, setLoading] = useState(true)
  const [performances, setPerformances] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/performance')
        if (res.ok) {
          const data = await res.json()
          setPerformances(Array.isArray(data) ? data : [])
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
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  if (performances.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">ارزیابی عملکردی یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {performances.map((perf: any) => {
        const status = STATUS_MAP[perf.status] || STATUS_MAP.pending
        const scorePercentage = (perf.score / 5) * 100
        const targetPercentage = (perf.target / 5) * 100
        const scoreColor = getScoreColor(perf.score, perf.target)
        const kpis = [perf.kpi1, perf.kpi2, perf.kpi3, perf.kpi4].filter(k => k !== null && k !== undefined)

        return (
          <Card key={perf.id} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                    <BarChart3 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  </div>
                  دوره {perf.period}
                </CardTitle>
                <Badge className={`${status.color} text-[10px]`}>
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score Display */}
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className={`text-4xl font-bold ${scoreColor}`}>
                  {toPersianDigits(perf.score.toFixed(1))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  از {toPersianDigits(5)} — {getScoreLabel(perf.score)}
                </div>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Target className="w-3 h-3 text-amber-500" />
                    <span className="text-muted-foreground">هدف:</span>
                    <span className="font-medium">{toPersianDigits(perf.target.toFixed(1))}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="w-3 h-3 text-orange-500" />
                    <span className="text-muted-foreground">نمره:</span>
                    <span className={`font-medium ${scoreColor}`}>{toPersianDigits(perf.score.toFixed(1))}</span>
                  </div>
                </div>
              </div>

              {/* Score Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">عملکرد نسبت به هدف</span>
                  <span className={`font-medium ${scoreColor}`}>
                    {toPersianDigits(Math.round((perf.score / perf.target) * 100))}٪
                  </span>
                </div>
                <div className="relative">
                  <Progress value={targetPercentage} className="h-3" />
                  <div
                    className="absolute top-0 h-3 rounded-full bg-orange-500 dark:bg-orange-400"
                    style={{ width: `${Math.min(scorePercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>نمره: {toPersianDigits(perf.score.toFixed(1))}</span>
                  <span>هدف: {toPersianDigits(perf.target.toFixed(1))}</span>
                </div>
              </div>

              {/* KPIs */}
              {kpis.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <TrendingUp className="w-3 h-3 text-orange-500" />
                      شاخص‌های کلیدی
                    </div>
                    {kpis.map((kpi, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{KPI_LABELS[index] || `شاخص ${toPersianDigits(index + 1)}`}</span>
                          <span className={`font-medium ${getScoreColor(kpi, perf.target)}`}>
                            {toPersianDigits(kpi.toFixed(1))}
                          </span>
                        </div>
                        <Progress value={(kpi / 5) * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Comments */}
              {perf.comments && (
                <>
                  <Separator />
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-orange-700 dark:text-orange-300">
                      <MessageSquare className="w-3 h-3" />
                      بازخورد ارزیاب
                    </div>
                    <p className="text-xs text-orange-900 dark:text-orange-200">{perf.comments}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
