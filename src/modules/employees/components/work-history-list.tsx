// src/modules/employees/components/WorkHistoryList.tsx
'use client'

import { useState, useEffect } from 'react'
import { Building2, Calendar as CalendarIcon, Briefcase, Loader2 } from 'lucide-react'
import { Badge } from '@/core/components/ui/badge'
import { useWorkHistory } from '../hooks/use-work-history'
import { toPersianDigits, formatDescriptionDate } from '@/core/lib/utils-fa'

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
  
  return toPersianDigits(persianDate)
}

export function WorkHistoryList({ employeeId }: WorkHistoryListProps) {
  const { data: workHistory = [], isLoading, error } = useWorkHistory(employeeId)
  
  // State برای نگهداری نام سمت و دپارتمان (مثل EmployeeWorkHistory)
  const [positionNames, setPositionNames] = useState<Record<string, string>>({})
  const [departmentNames, setDepartmentNames] = useState<Record<string, string>>({})

  // گرفتن نام سمت‌ها (مثل EmployeeWorkHistory)
  useEffect(() => {
    const fetchPositionNames = async () => {
      try {
        const res = await fetch('/api/positions?status=active')
        if (res.ok) {
          const data = await res.json()
          const positions = data.data || data
          
          const namesMap: Record<string, string> = {}
          if (Array.isArray(positions)) {
            positions.forEach((pos: any) => {
              namesMap[pos.id] = pos.title || pos.name || pos.id
            })
          }
          setPositionNames(namesMap)
        }
      } catch (error) {
        console.error('Error fetching positions:', error)
      }
    }
    fetchPositionNames()
  }, [])

  // گرفتن نام دپارتمان‌ها (مثل EmployeeWorkHistory)
  useEffect(() => {
    const fetchDepartmentNames = async () => {
      try {
        const res = await fetch('/api/departments?status=active')
        if (res.ok) {
          const data = await res.json()
          const departments = data.data || data
          
          const namesMap: Record<string, string> = {}
          if (Array.isArray(departments)) {
            departments.forEach((dept: any) => {
              namesMap[dept.id] = dept.name || dept.title || dept.id
            })
          }
          setDepartmentNames(namesMap)
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
      }
    }
    fetchDepartmentNames()
  }, [])

  const pastWorkHistory = workHistory

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

  // تابع دریافت نام (مثل EmployeeWorkHistory)
  const getDisplayName = (id: string, namesMap: Record<string, string>, fallback?: string): string => {
    if (!id) return fallback || 'نامشخص'
    if (namesMap[id]) return namesMap[id]
    return id
  }

  return (
    <div className="space-y-3">
      {pastWorkHistory.map((item) => (
        <div key={item.id} className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 text-right">
              <div className="flex items-center gap-2 mb-1 justify-end">
                {/* ✅ استفاده از getDisplayName برای نمایش نام سمت */}
                <h5 className="font-medium">
                  {getDisplayName(item.position, positionNames, item.position)}
                </h5>
                {/* ✅ استفاده از getDisplayName برای نمایش نام دپارتمان */}
                <Badge variant="outline" className="text-[10px]">
                  {getDisplayName(item.department, departmentNames, item.department)}
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
          <div className="flex items-center gap-2 text-gray-500 text-xs justify-end ">
  <CalendarIcon className="w-3.5 h-3.5" />
  <span  dir="rtl">
      {convertToPersianDate(item.startDate)} - {item.endDate ? convertToPersianDate(item.endDate) : 'اکنون'}
  </span>
</div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {formatDescriptionDate(item.description)}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}