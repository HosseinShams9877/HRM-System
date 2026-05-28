'use client'

import {
  BookOpen, Edit2, Trash2, FileText, Calendar, Shield,
  LayoutGrid, List, CheckCircle2, Edit3, XCircle
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
import type { Regulation, ViewMode, RegStats } from '../index'
import { CATEGORY_MAP, REG_STATUS_MAP } from '../constants'

// ============================================
// Stat Card Component
// ============================================

function StatCard({
  title, value, icon: Icon, iconBg
}: {
  title: string
  value: number
  icon: React.ElementType
  iconBg: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{toPersianDigits(value)}</p>
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

function getRegStatus(reg: Regulation): 'active' | 'draft' | 'revoked' {
  if (!reg.isActive) return 'revoked'
  return 'active'
}

function truncateText(text: string, maxLen: number = 120): string {
  if (!text) return ''
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text
}

// ============================================
// Regulations Tab Props & Component
// ============================================

export interface RegulationsTabProps {
  items: Regulation[]
  loading: boolean
  regStats: RegStats
  viewMode: ViewMode
  statusFilter: string
  categoryFilter: string
  onViewModeChange: (mode: ViewMode) => void
  onStatusFilterChange: (val: string) => void
  onCategoryFilterChange: (val: string) => void
  onEdit: (item: Regulation) => void
  onDelete: (id: string) => void
}

export function RegulationsTab({
  items,
  loading,
  regStats,
  viewMode,
  statusFilter,
  categoryFilter,
  onViewModeChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onEdit,
  onDelete,
}: RegulationsTabProps) {
  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="کل آیین‌نامه‌ها"
          value={regStats.total}
          icon={BookOpen}
          iconBg="bg-violet-500"
        />
        <StatCard
          title="فعال"
          value={regStats.active}
          icon={CheckCircle2}
          iconBg="bg-emerald-500"
        />
        <StatCard
          title="پیش‌نویس"
          value={regStats.draft}
          icon={Edit3}
          iconBg="bg-amber-500"
        />
        <StatCard
          title="منسوخ"
          value={regStats.revoked}
          icon={XCircle}
          iconBg="bg-red-500"
        />
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger size="sm" className="w-[130px] text-xs">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">همه وضعیت‌ها</SelectItem>
              <SelectItem value="active" className="text-xs">فعال</SelectItem>
              <SelectItem value="revoked" className="text-xs">منسوخ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger size="sm" className="w-[140px] text-xs">
              <SelectValue placeholder="دسته‌بندی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">همه دسته‌ها</SelectItem>
              <SelectItem value="استخدام" className="text-xs">استخدام</SelectItem>
              <SelectItem value="حقوق" className="text-xs">حقوق</SelectItem>
              <SelectItem value="حضورغیاب" className="text-xs">حضور و غیاب</SelectItem>
              <SelectItem value="آموزش" className="text-xs">آموزش</SelectItem>
              <SelectItem value="ایمنی" className="text-xs">ایمنی</SelectItem>
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
          <BookOpen className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">آیین‌نامه‌ای یافت نشد</p>
          <p className="text-xs mt-1">برای افزودن آیین‌نامه جدید از دکمه بالا استفاده کنید</p>
        </div>
      ) : viewMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(reg => {
            const cat = CATEGORY_MAP[reg.category] || { label: reg.category, color: 'bg-gray-100 text-gray-700' }
            const status = getRegStatus(reg)
            const statusInfo = REG_STATUS_MAP[status]
            return (
              <Card key={reg.id} className={`border-0 shadow-sm transition-all hover:shadow-md ${status === 'revoked' ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                      <Badge className={`text-[10px] shrink-0 ${cat.color}`}>
                        {cat.label}
                      </Badge>
                      <Badge className={`text-[10px] shrink-0 ${statusInfo.color}`}>
                        {statusInfo.label}
                      </Badge>
                      <h3 className="text-sm font-medium truncate">{reg.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mr-2">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(reg)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => onDelete(reg.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {truncateText(reg.content, 120)}
                  </p>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        نسخه {reg.version}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatShamsi(reg.publishDate)}
                      </span>
                      {reg.filePath && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          فایل پیوست
                        </span>
                      )}
                    </div>
                    <Badge variant={reg.isActive ? 'default' : 'secondary'} className="text-[10px] h-4">
                      {reg.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
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
                <TableHead className="text-xs">دسته‌بندی</TableHead>
                <TableHead className="text-xs">نسخه</TableHead>
                <TableHead className="text-xs">تاریخ انتشار</TableHead>
                <TableHead className="text-xs">وضعیت</TableHead>
                <TableHead className="text-xs text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(reg => {
                const cat = CATEGORY_MAP[reg.category] || { label: reg.category, color: 'bg-gray-100 text-gray-700' }
                const status = getRegStatus(reg)
                const statusInfo = REG_STATUS_MAP[status]
                return (
                  <TableRow key={reg.id} className={status === 'revoked' ? 'opacity-60' : ''}>
                    <TableCell className="text-xs font-medium max-w-[200px] truncate">{reg.title}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{reg.version}</TableCell>
                    <TableCell className="text-xs">{formatShamsi(reg.publishDate)}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${statusInfo.color}`}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(reg)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => onDelete(reg.id)}>
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
