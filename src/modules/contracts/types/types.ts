// ============================================
// Types — قرارداد و احکام
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

export interface ContractRecord {
  id: string
  employeeId: string
  type: string
  contractNumber: string | null
  title: string
  startDate: string
  endDate: string | null
  amount: number | null
  department: string | null
  notes: string | null
  status: string
  filePath: string | null
  approvedById: string | null
  approvedAt: string | null
  createdAt: string
  employee: EmployeeBasic
}

export interface ContractStats {
  total: number
  active: number
  expired: number
  terminated: number
  draft: number
  expiringSoon: number
  byType: {
    contract: number
    appointment: number
    transfer: number
    changePosition: number
    renewal: number
  }
}
