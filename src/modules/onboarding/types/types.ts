// ============================================
// Types
// ============================================

export interface TaskItem {
  text: string
  done: boolean
}

export interface OnboardItem {
  id: string; employeeId: string; tasks: string | null; progress: number
  status: string; startDate: string | null; endDate: string | null
  employee: { id: string; firstName: string; lastName: string }
}

export interface OffboardItem {
  id: string; employeeId: string; reason: string; tasks: string | null
  progress: number; status: string; lastDate: string | null
  employee: { id: string; firstName: string; lastName: string }
}
