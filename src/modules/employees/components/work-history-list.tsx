// src/modules/employees/components/WorkHistoryList.tsx
'use client'

import { Building2, Calendar as CalendarIcon, Briefcase, Loader2 } from 'lucide-react'
import { Badge } from '@/core/components/ui/badge'
import { useWorkHistory } from '../hooks/use-work-history'
import { toPersianDigits } from '@/core/lib/utils-fa'

interface WorkHistoryListProps {
  employeeId: string
}

const convertToPersianDate = (dateString: string | Date): string => {
  if (!dateString) return ''
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return ''
  
  const persianDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  
  // ✅ تبدیل اعداد انگلیسی به فارسی
  return toPersianDigits(persianDate)
}
export function WorkHistoryList({ employeeId }: WorkHistoryListProps) {
  const { data: workHistory = [], isLoading, error } = useWorkHistory(employeeId)

  // فیلتر کردن سوابق غیرجاری (فعلی در بخش بالا نمایش داده میشه)
  const pastWorkHistory = workHistory

  // دیباگ
  console.log('WorkHistoryList - employeeId:', employeeId)
  console.log('WorkHistoryList - data:', workHistory)
  console.log('WorkHistoryList - isLoading:', isLoading)
  console.log('WorkHistoryList - error:', error)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p className="text-sm">خطا در دریافت سوابق شغلی</p>
        <p className="text-xs mt-1">{(error as Error).message}</p>
      </div>
    )
  }

  if (pastWorkHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">سابقه شغلی ثبت نشده</p>
        <p className="text-xs mt-1">برای ثبت سابقه شغلی، از بخش مدیریت سوابق استفاده کنید</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {pastWorkHistory.map((item) => (
        <div key={item.id} className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 text-right">
              <div className="flex items-center gap-2 mb-1 justify-end">
                <h5 className="font-medium">{item.position}</h5>
                <Badge variant="outline" className="text-[10px]">
                  {item.department}
                </Badge>
                {item.source && (
                  <Badge variant="secondary" className="text-[9px]">
                    {item.source === 'MANUAL' ? 'دستی' :
                     item.source === 'PROMOTION' ? 'ارتقا' :
                     item.source === 'TRANSFER' ? 'انتقال' : 
                     item.source === 'HIRE' ? 'استخدام' :
                     item.source === 'TERMINATION' ? 'پایان همکاری' : item.source}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground justify-end">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {convertToPersianDate(item.startDate)} - 
                  {item.endDate ? convertToPersianDate(item.endDate) : 'اکنون'}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-2 text-right">{item.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}