// components/Shifts/stats/stats-cards.tsx

import { Card, CardContent } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { ShiftStats, HolidayStats } from '../types'

interface StatsCardsProps {
  shifts: ShiftStats
  holidays: HolidayStats
}

export function StatsCards({ shifts, holidays }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold">{toPersianDigits(shifts.total)}</div>
          <div className="text-[10px] text-muted-foreground">کل شیفت‌ها</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-emerald-600">
            {toPersianDigits(shifts.active)}
          </div>
          <div className="text-[10px] text-muted-foreground">شیفت فعال</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {toPersianDigits(shifts.totalEmployees)}
          </div>
          <div className="text-[10px] text-muted-foreground">کارمند منتسب</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-red-600">
            {toPersianDigits(holidays.official)}
          </div>
          <div className="text-[10px] text-muted-foreground">تعطیلی رسمی</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-amber-600">
            {toPersianDigits(holidays.agreed)}
          </div>
          <div className="text-[10px] text-muted-foreground">تعطیلی توافقی</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-purple-600">
            {toPersianDigits(holidays.occasional)}
          </div>
          <div className="text-[10px] text-muted-foreground">تعطیلی موقت</div>
        </CardContent>
      </Card>
    </div>
  )
}