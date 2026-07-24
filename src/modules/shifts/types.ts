// components/Shifts/types.ts

export interface ShiftSchedule {
    id?: string
    dayOfWeek: number
    dayName: string
    isWorkingDay: boolean
    startTime: string
    endTime: string
    breakStart: string | null
    breakEnd: string | null
    lateThreshold: string | null
    earlyLeaveThreshold: string | null
    minWorkHours: number
  }
  
  export interface WorkShiftData {
    id: string
    name: string
    code: string
    color: string
    description: string | null
    isActive: boolean
    schedules: ShiftSchedule[]
    _count?: { assignments: number }
    assignments?: { employee: { id: string; firstName: string; lastName: string; personnelCode: string; department: string | null } }[]
  }
  
  export interface EmployeeBasic {
    id: string
    firstName: string
    lastName: string
    personnelCode: string
    department: string | null
    position: string | null
  }
  
  export interface HolidayData {
    id: string
    title: string
    date: string
    type: string
    isRecurring: boolean
    description: string | null
  }
  
  export interface ShiftStats {
    total: number
    active: number
    totalEmployees: number
  }
  
  export interface HolidayStats {
    total: number
    official: number
    agreed: number
    occasional: number
  }