// ============================================
// Types — Missions Module
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

export interface MissionRecord {
  id: string
  employeeId: string
  title: string
  destination: string | null
  startDate: string
  endDate: string
  totalDays: number
  status: string
  createdAt: string
  employee: EmployeeBasic
}

export interface MissionStats {
  total: number
  pending: number
  approved: number
  rejected: number
}
