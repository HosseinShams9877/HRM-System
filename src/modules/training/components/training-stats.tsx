// modules/training/components/training-stats.tsx

import { Card, CardContent } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'

interface TrainingStatsProps {
  totalCourses: number
  inProgressCount: number
  completedCount: number
  totalParticipants: number
}

export function TrainingStats({
  totalCourses,
  inProgressCount,
  completedCount,
  totalParticipants,
}: TrainingStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{toPersianDigits(totalCourses)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">کل دوره‌ها</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{toPersianDigits(inProgressCount)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">در حال برگزاری</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{toPersianDigits(completedCount)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">تکمیل شده</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{toPersianDigits(totalParticipants)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">کل شرکت‌کنندگان</div>
        </CardContent>
      </Card>
    </div>
  )
}