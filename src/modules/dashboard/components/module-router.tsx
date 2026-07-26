'use client'

import { Settings } from 'lucide-react'
import { EmployeesModule } from '@/modules/employees/components/employee-list'
import { PositionsModule } from '@/modules/appointments/components/positions-module'
import { AppointmentModule } from '@/modules/appointments/components/appointment-module'
import { AttendanceModule } from '@/modules/attendance/components/attendance-module'
import { LeavesModule } from '@/modules/attendance/components/leaves-module'
import { LeaveBalanceModule } from '@/modules/attendance/components/leave-balance-module'
import { MissionsModule } from '@/modules/attendance/components/missions-module'
import { ContractsModule } from '@/modules/contracts/components/contracts-module'
import { ShiftsModule } from '@/modules/shifts/components/shifts-module'
import { PayrollModule } from '@/modules/payroll/components/payroll-module'
import { AnnouncementsRegulationsModule } from '@/modules/announcements/components/announcements-regulations-module'
import { RecruitmentModule } from '@/modules/recruitment/components/recruitment-module'
import { PerformanceModule } from '@/modules/performance/components/performance-module'
import { OnboardingOffboardingModule } from '@/modules/onboarding/components/onboarding-offboarding-module'
import { TrainingModule } from '@/modules/training/components/training-module'
import { WelfareModule } from '@/modules/welfare/components/welfare-module'
import { SettingsModule } from '@/modules/settings/components/settings-module'
import { OrganizationModule } from '@/modules/organization/components/organization-module'
import { OrgPulseModule } from '@/modules/organization/components/org-pulse-module'
import { Recruitment } from '@/modules/recruitment/components/Recruitment' 
import { EmployeeProfilePage } from '@/modules/employees/components/employee-profile-page'
import { OrdersModule } from '@/modules/orders/components/orders-module'  
import {CareersSite} from '@/core/components/CareersSite'
import { EmployeeWorkHistory } from '@/modules/employees/components/work-history'
import AdminDesktop from './layouts/admin-desktop'
import EmployeeDesktop from './layouts/employee-desktop'
import { EmployeeDocuments } from '@/modules/employees/components/employee-document'
import { EmployeeArchive } from '@/modules/employees/components/employee-arshive'
import { HRSettings } from '@/modules/employees/components/ht-setting'
import { EmployeeWizard } from '@/modules/employees/components/employee-form'
import { EmployeeContractsModule } from '@/modules/contracts/components/employee-contracts-module'
import { EmployeeLeaveBalanceModule } from '@/modules/attendance/leaves/components/employee-leave-balance'
import { EmployeeShiftsModule } from '@/modules/shifts/components/employee-shifts-module'


// ============================================
// Types
// ============================================

interface DashboardStats {
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

interface DashboardAlerts {
  expiringContracts: { id: string; title: string; employeeName: string; endDate: string | null }[]
  birthdays: { id: string; name: string; date: string | null }[]
  marriageAnniversaries: { id: string; name: string; date: string | null }[]
}

interface KpiItem {
  department: string
  actual: number
  target: number
  gap: number
}

interface DashboardPeople {
  present: { id: string; name: string }[]
  absent: { id: string; name: string }[]
  late: { id: string; name: string }[]
  leave: { id: string; name: string }[]
  mission: { id: string; name: string }[]
}

interface DashboardData {
  stats: DashboardStats
  people?: DashboardPeople
  pending: {
    leaves: number
    missions: number
    loans: number
    contracts: number
  }
  alerts: DashboardAlerts
  kpi: KpiItem[]
  recruitment: { active: number; offboarding: number }
  attendanceTrend: { date: string; rate: number }[]
}

// ============================================
// Module Router
// ============================================

export function ModuleRouter({
  activeModule,
  data,
  onNavigate,
  onRefresh,
  user,
  currentUser
}: {
  activeModule: string
  data: DashboardData | null
  onNavigate: (id: string) => void
  onRefresh: () => void
  user?: { role: string; employeeId?: string; name?: string }
  currentUser?: { role: string; employeeId?: string }  
}) {
  const stats = data?.stats || {
    totalEmployees: 0, presentToday: 0, absentToday: 0,
    lateToday: 0, leaveToday: 0, missionToday: 0,
    noCheckIn: 0, overtimeExceeded: 0, monthlySalary: 0, monthlyInsurance: 0,
  }
  const people = data?.people
  const pending = data?.pending || { leaves: 0, missions: 0, loans: 0, contracts: 0 }
  const alerts = data?.alerts || { expiringContracts: [], birthdays: [], marriageAnniversaries: [] }
  const kpiData = data?.kpi || []
  const recruitment = data?.recruitment || { active: 0, offboarding: 0 }
  const attendanceTrend = data?.attendanceTrend || []

  if (activeModule === 'employees') return <EmployeesModule onNavigate={onNavigate} />
  if (activeModule === 'app-positions') return <PositionsModule />
  if (activeModule === 'app-appoint') return <AppointmentModule />
  if (activeModule === 'att-today') return <AttendanceModule currentUser={user}/>
  if (activeModule === 'att-leave') return <LeavesModule  currentUser={user}/>
  if (activeModule === 'att-mission') return <MissionsModule currentUser={user} />
  if (activeModule === 'att-leave-balance') {
  // اگر کاربر employee هست، کامپوننت مخصوص کارمند رو نشون بده
  if (user?.role === 'employee' || currentUser?.role === 'employee') {
    const empId = user?.employeeId || currentUser?.employeeId || ''
    return <EmployeeLeaveBalanceModule employeeId={empId} />
  }
  return <LeaveBalanceModule currentUser={user || currentUser} />
}
 if (activeModule === 'att-shifts') {
  // اگر کاربر employee هست، کامپوننت مخصوص کارمند رو نشون بده
  if (user?.role === 'employee' || currentUser?.role === 'employee') {
    const empId = user?.employeeId || currentUser?.employeeId || ''
    return <EmployeeShiftsModule employeeId={empId} />
  }
  return <ShiftsModule />
}
  if (activeModule === 'contracts' || activeModule === 'contract-view') return <ContractsModule />
  if (activeModule === 'contract-order') return <OrdersModule />
  if (activeModule === 'payroll' || activeModule === 'payroll-list' || activeModule === 'payroll-reports' || activeModule === 'payroll-settings') {
    return <PayrollModule initialTab={activeModule === 'payroll-settings' ? 'settings' : activeModule === 'payroll-reports' ? 'reports' : 'list'} />
  }

  if (activeModule === 'employee-archive') {
    return <EmployeeArchive onNavigate={onNavigate} currentUser={user} />
  }
  if (activeModule === 'hr-settings') {
    return <HRSettings onNavigate={onNavigate} currentUser={user} />
  }
  if (activeModule === 'payslips') return <PayrollModule />
  if (activeModule === 'org-pulse') return <OrgPulseModule />
  if (activeModule === 'org-employee') {
    return <EmployeeProfilePage onNavigate={onNavigate} />
  }  if (activeModule === 'org-chart' || activeModule === 'org-departments' || activeModule === 'org-positions' || activeModule === 'organization') {
    return <OrganizationModule initialTab={activeModule === 'org-departments' ? 'org-departments' : activeModule === 'org-positions' ? 'org-positions' : 'org-chart'} />
  }
  if (activeModule === 'employee-contracts') {
  return <EmployeeContractsModule currentUser={user} />
}
  if (activeModule === 'announcements-regulations' || activeModule === 'announcements') {
    return <AnnouncementsRegulationsModule initialTab="announcements" />
  }
  if (activeModule === 'regulations') {
    return <AnnouncementsRegulationsModule initialTab="regulations" />
  }
  if (activeModule.startsWith('employee-edit/')) {
    const employeeId = activeModule.split('/')[1]
    return <EmployeeWizard 
      employeeId={employeeId}
      startTab={1}  // ← از تب اول شروع کن
      onSuccess={() => onNavigate('org-employee')}
      onCancel={() => onNavigate('org-employee')}
    />
  }
  if (activeModule.startsWith('employee-edit-documents/')) {
    const employeeId = activeModule.split('/')[1]
    return <EmployeeWizard 
      employeeId={employeeId}
      startTab={5}  // ← از تب مدارک شروع کن
      onSuccess={() => onNavigate('org-employee')}
      onCancel={() => onNavigate('org-employee')}
    />
  }
  if (activeModule === 'employee-create') {
    return <EmployeeWizard onSuccess={() => onNavigate('employees')} />
  }
  if (activeModule === 'recruitment') return <RecruitmentModule />
  if (activeModule === 'recruitment-jobs') return <Recruitment  />
  if (activeModule === 'recruitment-applications') return <CareersSite />
  if (activeModule === 'performance') return <PerformanceModule />
  if (activeModule === 'onboarding' || activeModule === 'offboarding') return <OnboardingOffboardingModule />
  if (activeModule === 'training') return <TrainingModule />
  if (activeModule === 'work-history') {
    return <EmployeeWorkHistory onNavigate={onNavigate} currentUser={user} />
  }
  if (activeModule === 'welfare' || activeModule === 'welfare-rewards' || activeModule === 'welfare-loans') return <WelfareModule />
  if (activeModule === 'settings' || activeModule === 'settings-general' || activeModule === 'settings-access') return <SettingsModule />
/*
  if (activeModule === 'employee-documents') {
    return <EmployeeDocuments onNavigate={onNavigate} currentUser={user} />
  }
  */
  if (activeModule === 'dashboard') {
    const ADMIN_ROLES = ['admin', 'hr_manager', 'department_manager']
    const isAdminUser = user && ADMIN_ROLES.includes(user.role)

    if (isAdminUser) {
      return (
        <AdminDesktop
          stats={stats}
          people={people}
          kpiData={kpiData}
          alerts={alerts}
          recruitment={recruitment}
          attendanceTrend={attendanceTrend}
          pending={pending}
          onNavigate={onNavigate}
          onRefresh={onRefresh}
          currentUser={user}
        />
      )
    }
    return (
      <EmployeeDesktop
        employeeId={user?.employeeId || ''}
        onNavigate={onNavigate}
        currentUser={user}
      />
    )
  }

  // Fallback: unknown module
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Settings className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">این ماژول در حال توسعه است</h3>
        <p className="text-xs text-muted-foreground mt-1">به زودی اضافه خواهد شد</p>
      </div>
    </div>
  )
}
