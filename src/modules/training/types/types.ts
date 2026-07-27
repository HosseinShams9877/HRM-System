// ============================================
// Types — Training Module
// ============================================

export interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  department: string | null
  position: string | null
}

export interface Participant {
  id: string
  trainingId: string
  employeeId: string
  status: string
  score: number | null
  employee: EmployeeBasic
}

export interface Training {
  id: string
  title: string
  instructor: string | null
  startDate: string
  endDate: string | null
  location: string | null
  status: string
  description: string | null
  capacity: number | null
  category: string | null
  duration: number | null
   maxScore: number | null
  participants: Participant[]
}
