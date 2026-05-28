'use client'

import { Card, CardContent } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'
import type { ContractStats } from '../index'

interface StatisticsTabProps {
  stats: ContractStats
}

export function StatisticsTab({ stats }: StatisticsTabProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold">{toPersianDigits(stats.total)}</div>
          <div className="text-[10px] text-muted-foreground">کل</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-emerald-600">{toPersianDigits(stats.active)}</div>
          <div className="text-[10px] text-muted-foreground">فعال</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-amber-600">{toPersianDigits(stats.expiringSoon)}</div>
          <div className="text-[10px] text-muted-foreground">در حال انقضا</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-red-600">{toPersianDigits(stats.expired)}</div>
          <div className="text-[10px] text-muted-foreground">منقضی</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-orange-600">{toPersianDigits(stats.terminated)}</div>
          <div className="text-[10px] text-muted-foreground">فسخ شده</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-gray-600">{toPersianDigits(stats.draft)}</div>
          <div className="text-[10px] text-muted-foreground">پیش‌نویس</div>
        </CardContent>
      </Card>
    </div>
  )
}
