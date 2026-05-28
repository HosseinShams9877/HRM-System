// src/modules/dashboard/types/dashboard.types.ts

// ============================================================
// وابستگی‌های پایه
// ============================================================

export type UserRole = 'admin' | 'hr_manager' | 'manager' | 'employee'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  employeeId: string
  employee?: {
    firstName: string
    lastName: string
    department?: string | null
    position?: string | null
    avatar?: string | null
  }
  name?: string
  department?: string | null
  position?: string | null
}

// ============================================================
// تایپ‌های اختصاصی داشبورد
// ============================================================

export interface ExpiringContractAlert {
  id: string
  title: string
  employeeName: string
  endDate: string | null
  daysRemaining?: number
}

export interface BirthdayAlert {
  id: string
  name: string
  date: string | null
  avatar?: string | null
}

export interface AnniversaryAlert {
  id: string
  name: string
  date: string | null
  years?: number
}

export interface DashboardAlerts {
  expiringContracts: ExpiringContractAlert[]
  birthdays: BirthdayAlert[]
  marriageAnniversaries: AnniversaryAlert[]
}

export interface DashboardStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  lateToday: number
  leaveToday: number
  missionToday: number
  noCheckIn: number
  overtimeExceeded: number
  monthlySalary: number
  monthlyInsurance: number
}

export interface PersonName {
  id: string
  name: string
  avatar?: string | null
}

export interface DashboardPeople {
  present: PersonName[]
  absent: PersonName[]
  late: PersonName[]
  leave: PersonName[]
  mission: PersonName[]
}

export interface PendingRequests {
  leaves: number
  missions: number
  loans: number
  contracts: number
}

export interface KpiItem {
  department: string
  actual: number
  target: number
  gap: number
  percentage?: number
  trend?: 'up' | 'down' | 'stable'
}

export interface RecruitmentData {
  active: number
  offboarding: number
  pendingInterviews?: number
  openPositions?: number
}

export interface AttendanceTrend {
  date: string
  rate: number
  expected?: number
  actual?: number
}

export interface DashboardData {
  stats: DashboardStats
  people?: DashboardPeople
  pending: PendingRequests
  alerts: DashboardAlerts
  kpi: KpiItem[]
  recruitment: RecruitmentData
  attendanceTrend: AttendanceTrend[]
  lastUpdated?: string
}