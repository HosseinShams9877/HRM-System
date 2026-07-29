// ============================================
// Types — Monthly Work Record
// ============================================

import type { EmployeeBasic } from '../types'

export interface MonthlyWorkRecord {
  id: string
  employeeId: string
  year: number
  month: number
  
  // کارکرد
  workDays: number
  normalHours: number
  overtimeHours: number
  nightShiftHours: number
  shiftType: string | null // morning_evening | morning_evening_night | morning_night | evening_night | none
  fridayWorkHours: number
  holidayWorkHours: number
  missionDays: number
  leaveDays: number
  unpaidLeaveDays: number
  absenceDays: number
  delayHours: number
  earlyLeaveHours: number
  shortWorkHours: number
  
  // وضعیت
  status: string // draft | confirmed | closed
  notes: string | null
  
  // رابطه
  employee?: EmployeeBasic
  
  createdAt: string
  updatedAt: string
}

export interface MonthlyWorkRecordFormData {
  employeeId: string
  year: number
  month: number
  workDays: number
  normalHours: number
  overtimeHours: number
  nightShiftHours: number
  shiftType: string | null
  fridayWorkHours: number
  holidayWorkHours: number
  missionDays: number
  leaveDays: number
  unpaidLeaveDays: number
  absenceDays: number
  delayHours: number
  earlyLeaveHours: number
  shortWorkHours: number
  notes: string | null
}

export type ShiftType = 'morning_evening' | 'morning_evening_night' | 'morning_night' | 'evening_night' | 'none'

export const SHIFT_TYPES: { value: ShiftType; label: string; rate: number }[] = [
  { value: 'none', label: 'بدون نوبت‌کاری', rate: 0 },
  { value: 'morning_evening', label: 'صبح و عصر', rate: 10 },
  { value: 'morning_evening_night', label: 'صبح، عصر و شب', rate: 15 },
  { value: 'morning_night', label: 'صبح و شب', rate: 22.5 },
  { value: 'evening_night', label: 'عصر و شب', rate: 22.5 },
]