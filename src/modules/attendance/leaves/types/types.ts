// ============================================
// Leaves Module Types
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

export interface LeaveRecord {
  id: string
  employeeId: string
  type: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string | null
  status: string
  createdAt: string
  employee: EmployeeBasic
}

export interface LeaveStats {
  total: number
  pending: number
  approved: number
  rejected: number
}
