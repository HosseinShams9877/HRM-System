// modules/shifts/constants.ts

import { Star, CalendarOff, Clock } from 'lucide-react'
import { ShiftSchedule } from './types'

export const DAYS_OF_WEEK = [
  { value: 0, label: 'شنبه', short: 'ش' },
  { value: 1, label: 'یکشنبه', short: 'ی' },
  { value: 2, label: 'دوشنبه', short: 'د' },
  { value: 3, label: 'سه‌شنبه', short: 'س' },
  { value: 4, label: 'چهارشنبه', short: 'چ' },
  { value: 5, label: 'پنجشنبه', short: 'پ' },
  { value: 6, label: 'جمعه', short: 'ج' },
]

export const SHIFT_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
]

export const HOLIDAY_TYPES = [
  { value: 'official', label: 'رسمی', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: Star },
  { value: 'agreed', label: 'توافقی', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: CalendarOff },
  { value: 'occasional', label: 'موقت', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: Clock },
]

export const SHAMSI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']

export const DEFAULT_SCHEDULES: ShiftSchedule[] = DAYS_OF_WEEK.map(d => ({
  dayOfWeek: d.value,
  dayName: d.label,
  isWorkingDay: d.value < 6,
  startTime: '08:00',
  endTime: '17:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  lateThreshold: '08:15',
  earlyLeaveThreshold: '16:45',
  minWorkHours: 8,
}))