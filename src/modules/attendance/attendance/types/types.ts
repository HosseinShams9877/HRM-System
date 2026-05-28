// ============================================
// Types — Attendance Module
// ============================================

export interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  avatar: string | null
  department: string | null
  position: string | null
}

export interface ShiftInfo {
  id: string
  name: string
  code: string
  color: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  workHours: number | null
  overtime: number | null
  shiftId: string | null
  shift: ShiftInfo | null
  employee: EmployeeBasic
}

export interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  leave: number
  mission: number
}

export interface TrendDataPoint {
  date: string
  rate: number
  present: number
  absent: number
  total: number
  day: string
}
