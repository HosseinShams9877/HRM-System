'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/core/components/ui/popover'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import moment from 'moment-jalaali'

// Persian month names
const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

// Persian day names
const PERSIAN_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

// Convert number to Persian digits
const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)])
}

interface PersianDatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  disabled = false,
  className = '',
  minDate,
  maxDate
}: PersianDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value || new Date())
  const inputRef = useRef<HTMLInputElement>(null)

  // تبدیل میلادی به شمسی
  const toJalali = (date: Date) => {
    const m = moment(date)
    return {
      year: m.jYear(),
      month: m.jMonth() + 1,
      day: m.jDate()
    }
  }

  // تبدیل شمسی به میلادی
  const jalaliToGregorian = (year: number, month: number, day: number): Date => {
    return moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD').toDate()
  }

  // Get days in a Jalali month
  const getDaysInMonth = (year: number, month: number) => {
    if (month <= 6) return 31
    if (month <= 11) return 30
    // Esfand - check for leap year
    const isLeapYear = moment(`${year}/1/1`, 'jYYYY/jMM/jDD').jIsLeapYear()
    return isLeapYear ? 30 : 29
  }

  // Get the day of week for the first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    const gregorianDate = jalaliToGregorian(year, month, 1)
    const dayOfWeek = gregorianDate.getDay()
    // Convert to Persian week (Saturday = 0)
    return (dayOfWeek + 1) % 7
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const jalali = toJalali(viewDate)
    const daysInMonth = getDaysInMonth(jalali.year, jalali.month)
    const firstDay = getFirstDayOfMonth(jalali.year, jalali.month)
    
    const days: (number | null)[] = []
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  // Handle month/year navigation
  const goToPrevMonth = () => {
    const jalali = toJalali(viewDate)
    let newMonth = jalali.month - 1
    let newYear = jalali.year
    
    if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
    
    setViewDate(jalaliToGregorian(newYear, newMonth, 1))
  }

  const goToNextMonth = () => {
    const jalali = toJalali(viewDate)
    let newMonth = jalali.month + 1
    let newYear = jalali.year
    
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    }
    
    setViewDate(jalaliToGregorian(newYear, newMonth, 1))
  }

  // Handle day selection
  const handleDayClick = (day: number) => {
    const jalali = toJalali(viewDate)
    const selectedDate = jalaliToGregorian(jalali.year, jalali.month, day)
    onChange?.(selectedDate)
    setOpen(false)
  }

  // Check if day is selected
  const isSelected = (day: number) => {
    if (!value) return false
    const valueJalali = toJalali(value)
    const viewJalali = toJalali(viewDate)
    return (
      valueJalali.year === viewJalali.year &&
      valueJalali.month === viewJalali.month &&
      valueJalali.day === day
    )
  }

  // Check if day is today
  const isToday = (day: number) => {
    const today = new Date()
    const todayJalali = toJalali(today)
    const viewJalali = toJalali(viewDate)
    return (
      todayJalali.year === viewJalali.year &&
      todayJalali.month === viewJalali.month &&
      todayJalali.day === day
    )
  }

  // Format display value
  const formatDisplay = (date: Date) => {
    try {
      const jalali = toJalali(date)
      return `${toPersianNumber(jalali.year)}/${toPersianNumber(jalali.month.toString().padStart(2, '0'))}/${toPersianNumber(jalali.day.toString().padStart(2, '0'))}`
    } catch {
      return ''
    }
  }

  // Year options for dropdown
  const jalali = toJalali(viewDate)
  const years = Array.from({ length: 86 }, (_, i) => 1320 + i)

  const handleYearChange = (year: number) => {
    const currentJalali = toJalali(viewDate)
    const newDate = jalaliToGregorian(year, currentJalali.month, Math.min(currentJalali.day, 28))
    setViewDate(newDate)
  }

  const handleMonthChange = (month: number) => {
    const currentJalali = toJalali(viewDate)
    const newDate = jalaliToGregorian(currentJalali.year, month, Math.min(currentJalali.day, 28))
    setViewDate(newDate)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`w-full justify-start text-right font-normal ${!value ? 'text-muted-foreground' : ''} ${className}`}
        >
          <CalendarIcon className="ml-2 h-4 w-4" />
          {value ? formatDisplay(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Header with navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              {/* Month select */}
              <select
                value={jalali.month}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                {PERSIAN_MONTHS.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
              
              {/* Year select */}
              <select
                value={jalali.year}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {toPersianNumber(year)}
                  </option>
                ))}
              </select>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {PERSIAN_DAYS.map((day, index) => (
              <div
                key={index}
                className="h-8 w-8 flex items-center justify-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, index) => (
              <div
                key={index}
                className="h-8 w-8 flex items-center justify-center"
              >
                {day !== null && (
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`
                      h-8 w-8 rounded-md text-sm transition-colors
                      ${isSelected(day)
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : isToday(day)
                          ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    {toPersianNumber(day)}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Today button */}
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange?.(new Date())
                setOpen(false)
              }}
            >
              امروز: {formatDisplay(new Date())}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Helper function to format date for display
export function formatPersianDate(date: Date | null | undefined): string {
  if (!date) return '-'
  try {
    const m = moment(date)
    const year = m.jYear()
    const month = m.jMonth() + 1
    const day = m.jDate()
    return `${toPersianNumber(year)}/${toPersianNumber(month.toString().padStart(2, '0'))}/${toPersianNumber(day.toString().padStart(2, '0'))}`
  } catch {
    return '-'
  }
}

// Helper function to format date with month name
export function formatPersianDateLong(date: Date | null | undefined): string {
  if (!date) return '-'
  try {
    const m = moment(date)
    const year = m.jYear()
    const month = m.jMonth() // 0-11
    const day = m.jDate()
    return `${toPersianNumber(day)} ${PERSIAN_MONTHS[month]} ${toPersianNumber(year)}`
  } catch {
    return '-'
  }
}

// Helper to convert string Persian date to Date object
export function parsePersianDate(dateStr: string): Date | null {
  if (!dateStr) return null
  try {
    const parts = dateStr.split('/').map(Number)
    if (parts.length !== 3) return null
    const [year, month, day] = parts
    return moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD').toDate()
  } catch {
    return null
  }
}