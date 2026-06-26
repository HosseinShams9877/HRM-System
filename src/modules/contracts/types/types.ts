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
export  interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  nationalCode: string
  positionName?: string
  email?: string
  phone?: string
  position?: string
  department?: string
  contractMonths?: number    
  contractEndDate?: string
  departmentName?: string
  contractType?: string
  hireDate?: string
  basicSalary?: number
  housingAllowance?: number
  transportationAllowance?: number
  mealAllowance?: number
  financial?: {
    baseSalary?: number
    housingAllowance?: number
    workAllowance?: number
    spouseAllowance?: number
    childAllowance?: number
    yearsOfServiceBase?: number
    responsibilityAllowance?: number
    otherAllowances?: number
  } | null
  [key: string]: unknown
}

export interface Contract {
  id: string
  employeeId: string
  type: string          // نوع قرارداد (official, temporary, ...)
  contractNumber: string
  title: string
  startDate: string
  endDate: string | null
  amount: number | null
  department: string | null
  notes: string | null
  status: string        // active, expired, terminated, draft
  filePath: string | null
  approvedById: string | null
  approvedAt: string | null
  createdAt?: string
  updatedAt?: string
  employee?: {
    id: string
    firstName: string
    lastName: string
    personnelCode: string
    department: string | null
    position: string | null
  }
}