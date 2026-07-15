'use client'

import {
  PlaneTakeoff, Edit2, Trash2, User, Clock, CheckCircle2,
  LayoutGrid, List, Eye, TrendingUp, Users
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Separator } from '@/core/components/ui/separator'
import { Progress } from '@/core/components/ui/progress'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { OnboardItem } from '../index'
import { statusLabel, statusBadgeVariant } from '../lib/utils'
import { renderSummaryCard, renderProgressBar, renderTaskChecklist } from './shared/helpers'

interface OnboardingTabProps {
  items: OnboardItem[]
  loading: boolean
  onStatusFilter: string
  viewMode: 'card' | 'table'
  onStats: { total: number; inProgress: number; completed: number; avgProgress: number }
  onStatusFilterChange: (val: string) => void
  onViewModeChange: (mode: 'card' | 'table') => void
  onToggleTask: (type: 'on' | 'off', id: string, taskIndex: number) => void
  onEdit: (item: OnboardItem) => void
  onDelete: (id: string) => void
  onDetail: (item: OnboardItem) => void
}

export function OnboardingTab({
  items, loading, onStatusFilter, viewMode, onStats,
  onStatusFilterChange, onViewModeChange, onToggleTask, onEdit, onDelete, onDetail
}: OnboardingTabProps) {
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {renderSummaryCard('کل آنبوردینگ‌ها', onStats.total, <Users className="w-4 h-4 text-white" />, 'bg-teal-500')}
        {renderSummaryCard('در حال انجام', onStats.inProgress, <Clock className="w-4 h-4 text-white" />, 'bg-amber-500')}
        {renderSummaryCard('تکمیل شده', onStats.completed, <CheckCircle2 className="w-4 h-4 text-white" />, 'bg-emerald-500')}
        {renderSummaryCard('میانگین پیشرفت', `${onStats.avgProgress}٪`, <TrendingUp className="w-4 h-4 text-white" />, 'bg-cyan-500')}
      </div>

      {/* Filters & view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={onStatusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="in_progress">در حال انجام</SelectItem>
              <SelectItem value="completed">تکمیل شده</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onViewModeChange('card')}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onViewModeChange('table')}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <PlaneTakeoff className="w-10 h-10 mx-auto mb-3 opacity-30" />
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
                    <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <User className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.employee?.firstName} {item.employee?.lastName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {item.startDate && <span>شروع: {item.startDate}</span>}
                        {item.endDate && <span>پایان: {item.endDate}</span>}
                      </div>
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant(item.status)} className="text-[10px]">
                    {statusLabel(item.status)}
                  </Badge>
                </div>

                {/* Progress */}
                {renderProgressBar(item.progress)}

                {/* Task Checklist */}
                {renderTaskChecklist('on', item.id, item.tasks, onToggleTask, true)}

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
                  <TableHead className="text-xs text-center">اقدامات</TableHead>
                  <TableHead className="text-xs text-center">وضعیت</TableHead>
                  <TableHead className="text-xs text-center">پیشرفت</TableHead>
                  <TableHead className="text-xs text-center">تاریخ پایان</TableHead>
                  <TableHead className="text-xs text-center">تاریخ شروع</TableHead>
                  <TableHead className="text-xs text-center">کارمند</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
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
                    <TableCell className="text-center">
                      <Badge variant={statusBadgeVariant(item.status)} className="text-[10px]">{statusLabel(item.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <div className="flex items-center justify-center gap-2 min-w-[120px] mx-auto">
                        <Progress value={item.progress} className="h-1.5 flex-1" />
                        <span className="w-8 text-left">{toPersianDigits(item.progress)}٪</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground text-center">{item.endDate || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground text-center">{item.startDate || '—'}</TableCell>
                    <TableCell className="text-xs font-medium text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                          <User className="w-3 h-3 text-teal-600" />
                        </div>
                        {item.employee?.firstName} {item.employee?.lastName}
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
