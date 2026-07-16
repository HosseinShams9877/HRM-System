// src/modules/orders/types/index.ts
export interface Employee {
    id: string
    firstName: string
    lastName: string
    personnelCode: string
  }
  
  export interface OrderRecord {
    id: string
    orderNumber: string
    orderType: string
    title: string
    description?: string
    employeeId: string
    employee: Employee
    contractId?: string
    issueDate: string
    effectiveDate: string
    expiryDate?: string
    newPosition?: string
    newDepartment?: string
    newManagerId?: string
    baseSalary?: number
    housingAllowance?: number
    foodAllowance?: number
    attractionAllowance?: number
    spouseAllowance?: number
  childAllowance?: number
  yearsOfServiceBase?: number
    responsibilityAllowance?: number
    otherAllowances?: number
    fixedDeductions?: number
    status: 'draft' | 'pending' | 'approved' | 'active' | 'cancelled' | 'replaced'
    fileUrl?: string
    fileName?: string
    createdAt: string
    updatedAt: string
  }
  
  export interface OrderStats {
    total: number
    executed: number
    active: number
    pending: number
  }
  
  export interface OrderFormData {
    orderType: string
    employeeId: string
    title: string
    orderNumber: string
    issueDate: string
    effectiveDate: string
    description: string
    status: string
    // فیلدهای جدید
    newPosition?: string
    newDepartment?: string
    baseSalary?: number
    housingAllowance?: number
    foodAllowance?: number
    attractionAllowance?: number
    responsibilityAllowance?: number
    otherAllowances?: number
    fixedDeductions?: number
  }