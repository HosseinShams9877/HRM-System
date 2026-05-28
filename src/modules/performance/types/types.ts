// ============================================
// Types — ارزیابی عملکرد
// ============================================

export interface Employee {
  id: string
  firstName: string
  lastName: string
  department?: string | null
  position?: string | null
}

export interface Performance {
  id: string
  employeeId: string
  period: string
  score: number
  target: number
  kpi1: number | null
  kpi2: number | null
  kpi3: number | null
  kpi4: number | null
  comments: string | null
  status: string
  reviewerId: string | null
  createdAt: string
  updatedAt: string
  employee: Employee
}

export interface FormData {
  employeeId: string
  period: string
  score: number
  target: number
  kpi1: number | null
  kpi2: number | null
  kpi3: number | null
  kpi4: number | null
  comments: string
  status: string
}
