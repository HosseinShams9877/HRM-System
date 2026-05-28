// ============================================
// Appointments Module Types
// ============================================

export interface Department {
  id: string
  name: string
}

export interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  avatar: string | null
  department: string | null
}

export interface PositionBasic {
  id: string
  title: string
  code: string
  level: string | null
  jobGrade: string | null
  department: Department | null
}

export interface Appointment {
  id: string
  employeeId: string
  positionId: string
  type: string
  startDate: string
  endDate: string | null
  decreeNumber: string | null
  status: string
  notes: string | null
  createdAt: string
  employee: EmployeeBasic
  position: PositionBasic
}
