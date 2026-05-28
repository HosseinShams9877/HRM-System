// ============================================
// Types — پست‌های سازمانی
// ============================================

export interface Department {
  id: string
  name: string
  code: string
}

export interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
}

export interface Position {
  id: string
  title: string
  code: string
  level: string | null
  departmentId: string | null
  department: Department | null
  jobGrade: string | null
  minSalary: number | null
  maxSalary: number | null
  description: string | null
  requirements: string | null
  headcount: number
  status: string
  createdAt: string
  appointments: { employee: EmployeeBasic }[]
  occupiedCount: number
  availableCount: number
}
