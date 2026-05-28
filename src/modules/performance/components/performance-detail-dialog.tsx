'use client'

import {
  Eye, Edit2, Trash2, User, CheckCircle2
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Progress } from '@/core/components/ui/progress'
import { Separator } from '@/core/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { toPersianDigits } from '@/core/lib/utils-fa'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Tooltip, ResponsiveContainer
} from 'recharts'
import type { Performance } from '../types/types'
import { STATUS_MAP, KPI_LABELS, scoreColor } from '../constants'

interface PerformanceDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  detailItem: Performance | null
  onEdit: (item: Performance) => void
  onStatusChange: (id: string, newStatus: string) => void
  onDelete: (id: string) => void
}

export function PerformanceDetailDialog({
  open,
  onOpenChange,
  detailItem,
  onEdit,
  onStatusChange,
  onDelete,
}: PerformanceDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        {detailItem && (
          <>
            <DialogHeader>
              <DialogTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-600" />
                جزئیات ارزیابی عملکرد
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Employee Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{detailItem.employee?.firstName} {detailItem.employee?.lastName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {detailItem.employee?.department && `${detailItem.employee.department} · `}
                    {detailItem.employee?.position || ''}
                  </p>
                </div>
                <Badge variant="outline" className={`text-[10px] mr-auto ${STATUS_MAP[detailItem.status]?.color || ''}`}>
                  {STATUS_MAP[detailItem.status]?.label || detailItem.status}
                </Badge>
              </div>

              {/* Period & Score */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground mb-1">دوره</div>
                  <div className="text-sm font-bold">{detailItem.period}</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground mb-1">نمره کل</div>
                  <div className={`text-sm font-bold ${scoreColor(detailItem.score, detailItem.target)}`}>
                    {toPersianDigits(detailItem.score)}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground mb-1">هدف</div>
                  <div className="text-sm font-bold">{toPersianDigits(detailItem.target)}</div>
                </div>
              </div>

              {/* KPI Bars */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">شاخص‌های کلیدی</h4>
                <div className="space-y-2">
                  {(['kpi1', 'kpi2', 'kpi3', 'kpi4'] as const).map(key => {
                    const val = detailItem[key]
                    const pct = val !== null ? Math.min((val / 5) * 100, 100) : 0
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{KPI_LABELS[key]}</span>
                          <span className={`text-xs font-bold ${val !== null ? scoreColor(val, detailItem.target) : ''}`}>
                            {val !== null ? toPersianDigits(val) : '-'}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={pct} className={`h-2 ${val !== null ? '' : 'opacity-20'}`} />
                          <div
                            className="absolute top-0 h-2 w-0.5 bg-gray-800 dark:bg-gray-300"
                            style={{ left: `${(detailItem.target / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Mini Radar Chart */}
              {([detailItem.kpi1, detailItem.kpi2, detailItem.kpi3, detailItem.kpi4].some(v => v !== null)) && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">نمودار رادار</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart
                      data={[
                        { dimension: 'توانایی فنی', score: detailItem.kpi1 || 0, fullMark: 5 },
                        { dimension: 'روابط انسانی', score: detailItem.kpi2 || 0, fullMark: 5 },
                        { dimension: 'نوآوری', score: detailItem.kpi3 || 0, fullMark: 5 },
                        { dimension: 'رهبری', score: detailItem.kpi4 || 0, fullMark: 5 },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius="65%"
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} />
                      <Radar name="نمره" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Comments */}
              {detailItem.comments && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">توضیحات</h4>
                  <p className="text-xs bg-muted/30 p-3 rounded-lg">{detailItem.comments}</p>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => { onOpenChange(false); onEdit(detailItem) }}>
                  <Edit2 className="w-3 h-3" /> ویرایش
                </Button>
                {detailItem.status === 'pending' && (
                  <Button size="sm" variant="outline" className="text-xs gap-1.5 text-emerald-600" onClick={() => onStatusChange(detailItem.id, 'completed')}>
                    <CheckCircle2 className="w-3 h-3" /> تکمیل
                  </Button>
                )}
                {(detailItem.status === 'pending' || detailItem.status === 'completed') && (
                  <Button size="sm" variant="outline" className="text-xs gap-1.5 text-purple-600" onClick={() => onStatusChange(detailItem.id, 'reviewed')}>
                    <Eye className="w-3 h-3" /> بررسی
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-xs gap-1.5 text-red-600" onClick={() => { onOpenChange(false); onDelete(detailItem.id) }}>
                  <Trash2 className="w-3 h-3" /> حذف
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
