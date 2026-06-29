// src/modules/orders/components/order-filter.tsx
'use client'

import { Card, CardContent } from '@/core/components/ui/card'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import { Search, X } from 'lucide-react'

const ORDER_TYPES = [
  { value: 'employment', label: 'استخدام', icon: '📋' },
  { value: 'extension', label: 'تمدید قرارداد', icon: '📄' },
  { value: 'salary_increase', label: 'افزایش حقوق', icon: '💰' },
  { value: 'position_change', label: 'تغییر سمت', icon: '🔄' },
  { value: 'department_change', label: 'تغییر واحد', icon: '🏢' },
  { value: 'promotion', label: 'ارتقاء شغلی', icon: '⬆️' },
  { value: 'transfer', label: 'انتقال', icon: '🚚' },
  { value: 'suspension', label: 'تعلیق', icon: '⏸️' },
  { value: 'termination', label: 'پایان همکاری', icon: '🚪' },
  { value: 'other', label: 'سایر', icon: '📄' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'pending', label: 'در انتظار تأیید' },
  { value: 'approved', label: 'تأیید شده' },
  { value: 'active', label: 'فعال' },
  { value: 'cancelled', label: 'ابطال شده' },
  { value: 'replaced', label: 'جایگزین شده' },
]

interface OrderFilterProps {
  search: string
  setSearch: (value: string) => void
  typeFilter: string
  setTypeFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  resetFilters: () => void
}

export function OrderFilter({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  resetFilters,
}: OrderFilterProps) {
  const hasActiveFilter = search || typeFilter !== 'all' || statusFilter !== 'all'

  return (
    <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="جستجو عنوان حکم، شماره، نام کارمند..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 rounded-lg border-gray-200 dark:border-gray-700 focus:ring-emerald-500"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] rounded-lg border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="نوع حکم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه انواع</SelectItem>
              {ORDER_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] rounded-lg border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="وضعیت حکم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilter && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetFilters}
              className="gap-1 text-gray-500"
            >
              <X className="w-4 h-4" />
              حذف فیلترها
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}