// ============================================
// Types — رفاهی
// ============================================

export interface Employee {
  id: string
  firstName: string
  lastName: string
}

export interface Reward {
  id: string
  employeeId: string
  type: string
  title: string
  amount: number | null
  reason: string | null
  date: string
  employee: { firstName: string; lastName: string }
}

export interface Loan {
  id: string
  employeeId: string
  type: string
  amount: number
  reason: string | null
  status: string
  installments: number | null
  approverId: string | null
  createdAt: string
  employee: { firstName: string; lastName: string }
}
