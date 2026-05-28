'use client'

import {
  LogOut, Edit2, Trash2, User, Clock, CheckCircle2,
  LayoutGrid, List, Eye, AlertCircle, Users
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Separator } from '@/core/components/ui/separator'
import { Progress } from '@/core/components/ui/progress'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { OffboardItem } from '../index'
import { statusLabel, statusBadgeVariant } from '../lib/utils'
import { REASONS, REASON_COLORS } from '../constants'
import { renderSummaryCard, renderProgressBar, renderTaskChecklist } from './shared/helpers'

interface OffboardingTabProps {
  items: OffboardItem[]
  loading: boolean
  offStatusFilter: string
  offReasonFilter: string
  viewMode: 'card' | 'table'
  offStats: { total: number; inProgress: number; completed: number; reasonBreakdown: Record<string, number> }
  onStatusFilterChange: (val: string) => void
  onReasonFilterChange: (val: string) => void
  onViewModeChange: (mode: 'card' | 'table') => void
  onToggleTask: (type: 'on' | 'off', id: string, taskIndex: number) => void
  onEdit: (item: OffboardItem) => void
  onDelete: (id: string) => void
  onDetail: (item: OffboardItem) => void
}

export function OffboardingTab({
  items, loading, offStatusFilter, offReasonFilter, viewMode, offStats,
  onStatusFilterChange, onReasonFilterChange, onViewModeChange, onToggleTask, onEdit, onDelete, onDetail
}: OffboardingTabProps) {
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {renderSummaryCard('کل آفبوردینگ‌ها', offStats.total, <Users className="w-4 h-4 text-white" />, 'bg-rose-500')}
        {renderSummaryCard('در حال انجام', offStats.inProgress, <Clock className="w-4 h-4 text-white" />, 'bg-amber-500')}
        {renderSummaryCard('تکمیل شده', offStats.completed, <CheckCircle2 className="w-4 h-4 text-white" />, 'bg-emerald-500')}
        {renderSummaryCard(
          'بیشترین دلیل',
          Object.entries(offStats.reasonBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || '—',
          <AlertCircle className="w-4 h-4 text-white" />,
          'bg-purple-500'
        )}
      </div>

      {/* Reason breakdown mini-badges */}
      {Object.keys(offStats.reasonBreakdown).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(offStats.reasonBreakdown).map(([reason, count]) => (
            <Badge key={reason} variant="outline" className="text-[11px] gap-1">
              {reason}: {toPersianDigits(count)}
            </Badge>
          ))}
        </div>
      )}

      {/* Filters & view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={offStatusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="in_progress">در حال انجام</SelectItem>
              <SelectItem value="completed">تکمیل شده</SelectItem>
            </SelectContent>
          </Select>
          <Select value={offReasonFilter} onValueChange={onReasonFilterChange}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دلایل</SelectItem>
              {REASONS.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button variant={viewMode === 'card' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => onViewModeChange('card')}>
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => onViewModeChange('table')}>
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <LogOut className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">موردی یافت نشد</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <User className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.employee?.firstName} {item.employee?.lastName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {item.lastDate && <span>آخرین روز: {item.lastDate}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`text-[10px] ${REASON_COLORS[item.reason] || ''}`}>
                      {item.reason}
                    </Badge>
                    <Badge variant={statusBadgeVariant(item.status)} className="text-[10px]">
                      {statusLabel(item.status)}
                    </Badge>
                  </div>
                </div>

                {/* Progress */}
                {renderProgressBar(item.progress)}

                {/* Task Checklist */}
                {renderTaskChecklist('off', item.id, item.tasks, onToggleTask, true)}

                {/* Actions */}
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onDetail(item)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(item)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => onDelete(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">کارمند</TableHead>
                  <TableHead className="text-xs">دلیل</TableHead>
                  <TableHead className="text-xs">آخرین روز</TableHead>
                  <TableHead className="text-xs">پیشرفت</TableHead>
                  <TableHead className="text-xs">وضعیت</TableHead>
                  <TableHead className="text-xs">اقدامات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                          <User className="w-3 h-3 text-rose-600" />
                        </div>
                        {item.employee?.firstName} {item.employee?.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${REASON_COLORS[item.reason] || ''}`}>{item.reason}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.lastDate || '—'}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={item.progress} className="h-1.5 flex-1" />
                        <span className="w-8 text-left">{toPersianDigits(item.progress)}٪</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(item.status)} className="text-[10px]">{statusLabel(item.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onDetail(item)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(item)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => onDelete(item.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
