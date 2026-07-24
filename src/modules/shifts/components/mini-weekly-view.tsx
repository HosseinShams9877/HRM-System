// components/Shifts/components/mini-weekly-view.tsx

import { DAYS_OF_WEEK } from '../constants'
import { ShiftSchedule } from '../types'

interface MiniWeeklyViewProps {
  schedules: ShiftSchedule[]
  color: string
}

export function MiniWeeklyView({ schedules, color }: MiniWeeklyViewProps) {
  return (
    <div className="flex gap-1 items-end">
      {DAYS_OF_WEEK.map(day => {
        const s = schedules.find(sc => sc.dayOfWeek === day.value)
        const isWork = s?.isWorkingDay
        return (
          <div key={day.value} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-muted-foreground">{day.short}</span>
            <div
              className={`w-6 rounded-sm text-[8px] font-mono text-center ${isWork ? 'text-white' : 'bg-muted/30 text-muted-foreground'}`}
              style={isWork ? { backgroundColor: color } : undefined}
            >
              {isWork ? s?.startTime?.slice(0, 2) : '—'}
            </div>
          </div>
        )
      })}
    </div>
  )
}