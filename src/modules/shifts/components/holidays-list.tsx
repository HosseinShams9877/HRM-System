// modules/shifts/components/holidays-list.tsx

import { Calendar, Edit3, Trash2, RotateCcw, CalendarOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { HolidayData } from '../types'
import { HOLIDAY_TYPES, SHAMSI_MONTHS } from '../constants'

interface HolidaysListProps {
  holidays: HolidayData[]
  onEdit: (holiday: HolidayData) => void
  onDelete: (id: string) => void
}

export function HolidaysList({ holidays, onEdit, onDelete }: HolidaysListProps) {
  // گروه‌بندی بر اساس ماه
  const holidaysByMonth = holidays.reduce<Record<string, HolidayData[]>>((acc, h) => {
    const parts = h.date.split('/')
    const monthKey = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : h.date
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(h)
    return acc
  }, {})

  const getHolidayTypeBadge = (type: string) => {
    const t = HOLIDAY_TYPES.find(h => h.value === type)
    if (!t) return <Badge variant="outline" className="text-[10px]">{type}</Badge>
    const Icon = t.icon
    return (
      <Badge className={`text-[10px] gap-1 ${t.color}`}>
        <Icon className="w-3 h-3" />
        {t.label}
      </Badge>
    )
  }

  if (holidays.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-16 text-center">
          <CalendarOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-sm font-medium text-muted-foreground">
            تعطیلی ثبت نشده
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            اولین تعطیلی را تعریف کنید
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(holidaysByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthKey, monthHolidays]) => {
          const parts = monthKey.split('/')
          const monthNum = parseInt(parts[1] || '1')
          const monthName = `${parts[0]} - ${SHAMSI_MONTHS[monthNum - 1] || ''}`
          
          return (
            <Card key={monthKey} className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  {monthName}
                  <Badge variant="outline" className="text-[10px]">
                    {toPersianDigits(monthHolidays.length)} تعطیلی
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {monthHolidays.map(h => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600" dir="ltr">
                          {h.date.split('/').pop()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{h.title}</span>
                          {getHolidayTypeBadge(h.type)}
                          {h.isRecurring && (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <RotateCcw className="w-2.5 h-2.5" />
                              سالانه
                            </Badge>
                          )}
                        </div>
                        {h.description && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {h.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onEdit(h)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500"
                        onClick={() => onDelete(h.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
    </div>
  )
}