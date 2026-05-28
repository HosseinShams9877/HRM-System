'use client'

import {
  Megaphone, Edit2, Trash2, AlertCircle, Calendar, Users,
  LayoutGrid, List, AlertTriangle, Info, Clock
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/core/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/core/components/ui/table'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import type { Announcement, ViewMode, AnnStats } from '../index'
import { PRIORITY_MAP, AUDIENCE_MAP } from '../constants'

// ============================================
// Stat Card Component
// ============================================

function StatCard({
  title, value, icon: Icon, iconBg, trend
}: {
  title: string
  value: number
  icon: React.ElementType
  iconBg: string
  trend?: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{toPersianDigits(value)}</p>
            {trend && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                {trend}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// View Toggle Component
// ============================================

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center border rounded-lg overflow-hidden">
      <Button
        variant={value === 'card' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 rounded-none gap-1.5 text-xs px-3"
        onClick={() => onChange('card')}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        کارت
      </Button>
      <Button
        variant={value === 'table' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 rounded-none gap-1.5 text-xs px-3"
        onClick={() => onChange('table')}
      >
        <List className="w-3.5 h-3.5" />
        جدول
      </Button>
    </div>
  )
}

// ============================================
// Helpers
// ============================================

function truncateText(text: string, maxLen: number = 120): string {
  if (!text) return ''
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text
}

// ============================================
// Announcements Tab Props & Component
// ============================================

export interface AnnouncementsTabProps {
  items: Announcement[]
  loading: boolean
  annStats: AnnStats
  viewMode: ViewMode
  priorityFilter: string
  categoryFilter: string
  onViewModeChange: (mode: ViewMode) => void
  onPriorityFilterChange: (val: string) => void
  onCategoryFilterChange: (val: string) => void
  onEdit: (item: Announcement) => void
  onDelete: (id: string) => void
}

export function AnnouncementsTab({
  items,
  loading,
  annStats,
  viewMode,
  priorityFilter,
  categoryFilter,
  onViewModeChange,
  onPriorityFilterChange,
  onCategoryFilterChange,
  onEdit,
  onDelete,
}: AnnouncementsTabProps) {
  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="کل اطلاعیه‌ها"
          value={annStats.total}
          icon={Megaphone}
          iconBg="bg-blue-500"
        />
        <StatCard
          title="مهم"
          value={annStats.high}
          icon={AlertTriangle}
          iconBg="bg-red-500"
        />
        <StatCard
          title="عادی"
          value={annStats.normal}
          icon={Info}
          iconBg="bg-amber-500"
        />
        <StatCard
          title="اخیر (۷ روز)"
          value={annStats.recent}
          icon={Clock}
          iconBg="bg-emerald-500"
        />
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger size="sm" className="w-[130px] text-xs">
              <SelectValue placeholder="اولویت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">همه اولویت‌ها</SelectItem>
              <SelectItem value="urgent" className="text-xs">فوری</SelectItem>
              <SelectItem value="high" className="text-xs">مهم</SelectItem>
              <SelectItem value="normal" className="text-xs">عادی</SelectItem>
              <SelectItem value="low" className="text-xs">کم‌اهمیت</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger size="sm" className="w-[130px] text-xs">
              <SelectValue placeholder="مخاطب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">همه مخاطبان</SelectItem>
              <SelectItem value="managers" className="text-xs">مدیران</SelectItem>
              <SelectItem value="employees" className="text-xs">کارکنان</SelectItem>
              <SelectItem value="department" className="text-xs">دپارتمان</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ViewToggle value={viewMode} onChange={onViewModeChange} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          در حال بارگذاری...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Megaphone className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">اطلاعیه‌ای یافت نشد</p>
          <p className="text-xs mt-1">برای افزودن اطلاعیه جدید از دکمه بالا استفاده کنید</p>
        </div>
      ) : viewMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(ann => {
            const priority = PRIORITY_MAP[ann.priority] || PRIORITY_MAP.normal
            return (
              <Card key={ann.id} className={`border-0 shadow-sm transition-all hover:shadow-md ${!ann.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge className={`text-[10px] shrink-0 ${priority.color}`}>
                        {priority.label}
                      </Badge>
                      <h3 className="text-sm font-medium truncate">{ann.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mr-2">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(ann)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => onDelete(ann.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {truncateText(ann.content, 120)}
                  </p>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {AUDIENCE_MAP[ann.targetAudience] || ann.targetAudience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatShamsi(ann.publishDate)}
                      </span>
                      {ann.expiryDate && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          انقضا: {formatShamsi(ann.expiryDate)}
                        </span>
                      )}
                    </div>
                    <Badge variant={ann.isActive ? 'default' : 'secondary'} className="text-[10px] h-4">
                      {ann.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>

                  {ann.department && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-[10px]">
                        {ann.department}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="border-0 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">عنوان</TableHead>
                <TableHead className="text-xs">اولویت</TableHead>
                <TableHead className="text-xs">مخاطب</TableHead>
                <TableHead className="text-xs">تاریخ انتشار</TableHead>
                <TableHead className="text-xs">وضعیت</TableHead>
                <TableHead className="text-xs text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(ann => {
                const priority = PRIORITY_MAP[ann.priority] || PRIORITY_MAP.normal
                return (
                  <TableRow key={ann.id} className={!ann.isActive ? 'opacity-60' : ''}>
                    <TableCell className="text-xs font-medium max-w-[200px] truncate">{ann.title}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${priority.color}`}>{priority.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{AUDIENCE_MAP[ann.targetAudience] || ann.targetAudience}</TableCell>
                    <TableCell className="text-xs">{formatShamsi(ann.publishDate)}</TableCell>
                    <TableCell>
                      <Badge variant={ann.isActive ? 'default' : 'secondary'} className="text-[10px] h-4">
                        {ann.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(ann)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => onDelete(ann.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
