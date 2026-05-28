// ============================================
// Types — Employee List Module
// ============================================

export interface UserAccount {
  id: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string | null
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  nationalCode: string
  personnelCode: string
  email: string | null
  phone: string | null
  avatar: string | null
  birthDate: string | null
  birthPlace: string | null
  gender: string | null
  maritalStatus: string | null
  marriageDate: string | null
  childrenCount: number
  bloodType: string | null
  medicalInfo: string | null
  address: string | null
  homePhone: string | null
  education: string | null
  fieldOfStudy: string | null
  university: string | null
  militaryStatus: string | null
  hireDate: string
  status: string
  contractType: string | null
  probationEnd: string | null
  position: string | null
  department: string | null
  jobGrade: string | null
  workLocation: string | null
  accessCardNo: string | null
  managerId: string | null
  createdAt: string
  updatedAt: string
  user: UserAccount | null
}

export interface NewAccountInfo {
  email: string
  password: string
  role: string
  message: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}
