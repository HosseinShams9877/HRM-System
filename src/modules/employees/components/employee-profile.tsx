'use client'

import React, { useState, useCallback, useEffect } from 'react'
import {
  User, Briefcase, FileText, Clock, DollarSign,
  BarChart3, Award, GraduationCap, History, Shield, Mail,
  Phone, MapPin, Calendar, Heart, Users, Edit, 
  CheckCircle2, XCircle, AlertCircle,
  File, CreditCard, PhoneCall, Droplets,
  BookOpen, ShieldCheck, Building2,Loader2 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Separator } from '@/core/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import { useWorkHistory } from '../hooks/use-work-history'
import {
  toPersianDigits, formatCurrency, formatShamsi,convertToPersianDate,convertShamsiToGregorian
} from '@/core/lib/utils-fa'
import { DocumentManager } from './document-manager'
import { WorkHistoryList } from './work-history-list'
import { EmployeeContracts } from './employee-contracts'
import { EmployeeWelfareTab } from './employee-welfare-tab'
import { EmployeeTrainingTab } from './employee-training-tab';
import { EmployeePerformanceTab } from './employee-performance-tab';
import { EmployeePayrollTab } from './employee-payroll-tab';
import { EmployeeAttendanceTab } from './employee-attendance-tab';
// ============================================
// Types
// ============================================

interface EmployeeFull {
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
  positionName :string
  createdAt: string
  updatedAt: string
  user: { id: string; email: string; role: string; isActive: boolean; lastLogin: string | null } | null
  attendance: Array<{ id: string; date: string; checkIn: string | null; checkOut: string | null; status: string; workHours: number | null; overtime: number | null }>
  leaves: Array<{ id: string; type: string; startDate: string; endDate: string; totalDays: number; reason: string | null; status: string }>
  missions: Array<{ id: string; title: string; destination: string | null; startDate: string; endDate: string; totalDays: number; status: string }>
  paySlips: Array<{ id: string; year: number; month: number; baseSalary: number; netSalary: number; totalAdds: number; totalDeductions: number; status: string }>
  contracts: Array<{ id: string; type: string; title: string; startDate: string; endDate: string | null; status: string }>
  performances: Array<{ id: string; period: string; score: number; target: number; kpi1: number | null; kpi2: number | null; kpi3: number | null; status: string }>
  loanRequests: Array<{ id: string; type: string; amount: number; reason: string | null; status: string; installments: number | null }>
  trainings: Array<{ id: string; status: string; score: number | null; training: { title: string; startDate: string; endDate: string | null; status: string } }>
  rewards: Array<{ id: string; type: string; title: string; amount: number | null; reason: string | null; date: string }>
  onboarding: { id: string; progress: number; status: string; tasks: string | null } | null
  offboarding: { id: string; reason: string; progress: number; status: string; tasks: string | null } | null
  appointments: Array<{ id: string; type: string; startDate: string; endDate: string | null; decreeNumber: string | null; status: string; position: { title: string; code: string } }>
  documents: Array<{ id: string; title: string; category: string; fileName: string; filePath: string; fileType: string; fileSize: number; description: string | null; createdAt: string }>
  departmentName?: string
}

interface EmployeeProfileProps {
  employee: EmployeeFull
  onRefresh: () => void
  onNavigate?: (id: string) => void
}

// ============================================
// Status Badge
// ============================================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'فعال', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    inactive: { label: 'غیرفعال', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    suspended: { label: 'معلق', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    probation: { label: 'آزمایشی', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  }
  const c = config[status] || config.active
  return <Badge className={`text-xs ${c.className}`}>{c.label}</Badge>
}

// ============================================
// Info Row
// ============================================

function InfoRow({ icon: Icon, label, value, iconColor = "text-emerald-500" }: { icon: React.ElementType; label: string; value: string | number | null | undefined; iconColor?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-sm font-medium text-left flex-1">{value ? String(value) : '—'}</span>
      <div className="flex items-center gap-3 w-[35%] justify-end">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />
      </div>
    </div>
  )
}

// ============================================
// Employee Profile Component
// ============================================

function EmployeeProfileInner({ employee, onRefresh, onNavigate }: EmployeeProfileProps) {
  const [activeTab, setActiveTab] = useState('personal')
  const [documents, setDocuments] = useState(employee.documents || [])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [departmentName, setDepartmentName] = useState('')
const { data: workHistory = [], isLoading: isLoadingHistory } = useWorkHistory(employee.id)
  const initials = employee?.firstName?.[0] + employee?.lastName?.[0] || '?'

  const genderLabel = employee.gender === 'male' ? 'مرد' : employee.gender === 'female' ? 'زن' : '—'
  const maritalLabel = employee.maritalStatus === 'single' ? 'مجرد' : employee.maritalStatus === 'married' ? 'متاهل' : '—'
  const militaryLabel = employee.militaryStatus === 'done' ? 'پایان خدمت' : employee.militaryStatus === 'exempt' ? 'معاف' : employee.militaryStatus === 'deferred' ? 'معاف تحصیلی' : '—'
  const roleLabel = employee.user?.role === 'admin' ? 'مدیر سیستم' : employee.user?.role === 'hr_manager' ? 'مدیر منابع انسانی' : employee.user?.role === 'manager' ? 'مدیر' : 'کارمند'

  const fetchDocuments = useCallback(async () => {
    if (!employee.id) return
    setLoadingDocs(true)
    try {
      const res = await fetch(`/api/employees/${employee.id}/documents`)
      if (res.ok) {
        const data = await res.json()
        const docs = data.data || data.records || data
        setDocuments(Array.isArray(docs) ? docs : [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoadingDocs(false)
    }
  }, [employee.id])

  // دریافت نام دپارتمان
  useEffect(() => {
    if (employee.department && employee.department !== 'null' && !employee.department?.startsWith('cmp')) {
      setDepartmentName(employee.departmentName)
    } else {
      setDepartmentName('')
    }
  }, [employee.department])

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments()
    }
  }, [activeTab, fetchDocuments])

  const handleRefresh = () => {
    fetchDocuments()
    onRefresh()
  }

  const handleEditFromDocuments = () => {
    onNavigate?.(`employee-edit-documents/${employee.id}`)
  }

  // نمایش دپارتمان: فقط اگر نام واقعی داشته باشه و ID نباشه
  const displayDepartment = departmentName && !departmentName.startsWith('cmp') && departmentName !== 'null' ? ` • ${departmentName}` : ''

  return (
    <div className="space-y-6" dir="rtl">
      {/* Profile Header Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="w-20 h-20 border-4 border-background shadow-lg shrink-0">
              <AvatarImage src={employee.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{employee.firstName} {employee.lastName}</h2>
                <StatusBadge status={employee.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {employee.positionName || employee.position || 'بدون پست'}
                {displayDepartment}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> کد پرسنلی: {toPersianDigits(employee.personnelCode)}</span>
                {employee.user && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Shield className="w-3 h-3" /> {roleLabel}
                  </span>
                )}
                {employee.hireDate && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {convertShamsiToGregorian(employee.hireDate).toLocaleDateString('fa-IR')}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5"
                onClick={() => onNavigate?.(`employee-edit/${employee.id}`)}
              >
                <Edit className="w-3.5 h-3.5" />
                ویرایش
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-end bg-muted/50 h-auto p-1 gap-0.5 flex-wrap">
          <TabsTrigger value="documents" className="text-xs gap-1 data-[state=active]:bg-background">
            <File className="w-3.5 h-3.5" /> پرونده الکترونیک
          </TabsTrigger>
          <TabsTrigger value="training" className="text-xs gap-1 data-[state=active]:bg-background">
            <GraduationCap className="w-3.5 h-3.5" /> آموزش
          </TabsTrigger>
          <TabsTrigger value="welfare" className="text-xs gap-1 data-[state=active]:bg-background">
            <Award className="w-3.5 h-3.5" /> رفاهی
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs gap-1 data-[state=active]:bg-background">
            <BarChart3 className="w-3.5 h-3.5" /> ارزیابی
          </TabsTrigger>
          <TabsTrigger value="salary" className="text-xs gap-1 data-[state=active]:bg-background">
            <DollarSign className="w-3.5 h-3.5" /> حقوق
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs gap-1 data-[state=active]:bg-background">
            <Clock className="w-3.5 h-3.5" /> حضور
          </TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs gap-1 data-[state=active]:bg-background">
            <FileText className="w-3.5 h-3.5" /> قرارداد
          </TabsTrigger>
          <TabsTrigger value="job" className="text-xs gap-1 data-[state=active]:bg-background">
            <Briefcase className="w-3.5 h-3.5" /> اطلاعات شغلی
          </TabsTrigger>
          <TabsTrigger value="personal" className="text-xs gap-1 data-[state=active]:bg-background">
            <User className="w-3.5 h-3.5" /> اطلاعات فردی
          </TabsTrigger>
        </TabsList>

        {/* Tab: Personal Info */}
        <TabsContent value="personal" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identity */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 justify-end">
                  اطلاعات هویتی
                  <User className="w-4 h-4 text-emerald-600 order-2" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <InfoRow icon={User} iconColor="text-emerald-500" label="نام و نام خانوادگی" value={`${employee.firstName} ${employee.lastName}`} />
                <InfoRow icon={CreditCard} iconColor="text-blue-500" label="کد ملی" value={toPersianDigits(employee.nationalCode)} />
                <InfoRow icon={CreditCard} iconColor="text-blue-500" label="کد پرسنلی" value={toPersianDigits(employee.personnelCode)} />
                <InfoRow icon={Calendar} iconColor="text-purple-500" label="تاریخ تولد" value={employee.birthDate ? formatShamsi(employee.birthDate) : null} />
                <InfoRow icon={MapPin} iconColor="text-rose-500" label="محل تولد" value={employee.birthPlace} />
                <InfoRow icon={Users} iconColor="text-teal-500" label="جنسیت" value={genderLabel} />
                <InfoRow icon={Heart} iconColor="text-red-500" label="وضعیت تاهل" value={maritalLabel} />
                {employee.maritalStatus === 'married' && (
                  <InfoRow icon={Calendar} iconColor="text-purple-500" label="تاریخ ازدواج" value={employee.marriageDate ? formatShamsi(employee.marriageDate) : null} />
                )}
                <InfoRow icon={Users} iconColor="text-teal-500" label="تعداد فرزندان" value={employee.childrenCount > 0 ? toPersianDigits(employee.childrenCount) : null} />
                <InfoRow icon={Droplets} iconColor="text-sky-500" label="گروه خونی" value={employee.bloodType} />
                {employee.medicalInfo && <InfoRow icon={AlertCircle} iconColor="text-amber-500" label="بیماری خاص" value={employee.medicalInfo} />}
              </CardContent>
            </Card>

            {/* Contact & Education */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 justify-end">
                  تماس و تحصیلات
                  <User className="w-4 h-4 text-emerald-600 order-2" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <InfoRow icon={Mail} iconColor="text-emerald-500" label="ایمیل" value={employee.email} />
                <InfoRow icon={Phone} iconColor="text-blue-500" label="تلفن همراه" value={employee.phone ? toPersianDigits(employee.phone) : null} />
                <InfoRow icon={PhoneCall} iconColor="text-purple-500" label="تلفن ثابت" value={employee.homePhone ? toPersianDigits(employee.homePhone) : null} />
                <InfoRow icon={MapPin} iconColor="text-rose-500" label="آدرس" value={employee.address} />
                <Separator className="my-2" />
                <InfoRow icon={BookOpen} iconColor="text-teal-500" label="مدرک تحصیلی" value={employee.education} />
                <InfoRow icon={BookOpen} iconColor="text-teal-500" label="رشته تحصیلی" value={employee.fieldOfStudy} />
                <InfoRow icon={Building2} iconColor="text-amber-500" label="دانشگاه" value={employee.university} />
                <InfoRow icon={ShieldCheck} iconColor="text-sky-500" label="نظام وظیفه" value={militaryLabel} />
              </CardContent>
            </Card>

            {/* Account Info */}
            {employee.user && (
              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center pr-5 gap-2 justify-end">
                    <Shield className="w-4 h-4 text-purple-600" />
                    حساب کاربری
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium font-mono" dir="ltr">{employee.user.email}</p>
                      <span className="text-[10px] text-muted-foreground">ایمیل ورود</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">{roleLabel}</p>
                      <span className="text-[10px] text-muted-foreground">نقش</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">
                        {employee.user.isActive ? (
                          <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> فعال</span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> غیرفعال</span>
                        )}
                      </p>
                      <span className="text-[10px] text-muted-foreground">وضعیت اکانت</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">
                        {employee.user.lastLogin ? new Date(employee.user.lastLogin).toLocaleDateString('fa-IR') : 'هرگز'}
                      </p>
                      <span className="text-[10px] text-muted-foreground">آخرین ورود</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Documents */}
        <TabsContent value="documents" className="mt-4">
          <DocumentManager 
            employeeId={employee.id} 
            documents={documents}
            onRefresh={handleRefresh}
            onEditEmployee={handleEditFromDocuments}  
          />
        </TabsContent>

        {/* Placeholders for other tabs */}
        <TabsContent value="training" className="mt-4">
  <EmployeeTrainingTab
    employeeId={employee.id}
    employeeName={`${employee.firstName} ${employee.lastName}`}
  />
</TabsContent>

<TabsContent value="welfare" className="mt-4">
  <EmployeeWelfareTab
    employeeId={employee.id}
    employeeName={`${employee.firstName} ${employee.lastName}`}
    employeeDepartment={employee.departmentName || employee.department}
  />
</TabsContent>

<TabsContent value="performance" className="mt-4">
  <EmployeePerformanceTab
    employeeId={employee.id}
    employeeName={`${employee.firstName} ${employee.lastName}`}
  />
</TabsContent>

<TabsContent value="salary" className="mt-4">
  <EmployeePayrollTab
    employeeId={employee.id}
    employeeName={`${employee.firstName} ${employee.lastName}`}
  />
</TabsContent>

<TabsContent value="attendance" className="mt-4">
  <EmployeeAttendanceTab
    employeeId={employee.id}
    employeeName={`${employee.firstName} ${employee.lastName}`}
  />
</TabsContent>

        <TabsContent value="contracts" className="mt-4">
  <Card className="border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="text-sm flex items-center gap-2 justify-end">
        قراردادها
        <FileText className="w-4 h-4 text-emerald-600 order-2" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <EmployeeContracts 
        employeeId={employee.id} 
        employeeName={`${employee.firstName} ${employee.lastName}`}
      />
    </CardContent>
  </Card>
</TabsContent>

        <TabsContent value="job" className="mt-4">
  <Card className="border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="text-sm flex items-center gap-2 justify-end">
        اطلاعات شغلی
        <Briefcase className="w-4 h-4 text-emerald-600 order-2" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* موقعیت فعلی */}
      <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
        <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3 text-right">موقعیت فعلی</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="text-right">
            <span className="text-muted-foreground">سمت:</span>
            <span className="font-medium mr-2">{employee.positionName || employee.position || '—'}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground">دپارتمان:</span>
            <span className="font-medium mr-2">{displayDepartment ||employee.departmentName || employee.department || '—'}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground">تاریخ شروع:</span>
            <span className="font-medium mr-2">{employee.hireDate ? convertToPersianDate(employee.hireDate) : '—'}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground">نوع قرارداد:</span>
            <span className="font-medium mr-2">
              {employee.contractType === 'official' ? 'رسمی' :
               employee.contractType === 'contractual' ? 'قراردادی' :
               employee.contractType === 'probation' ? 'آزمایشی' :
               employee.contractType === 'temporary' ? 'موقت' : '—'}
            </span>
          </div>
          {employee.jobGrade && (
            <div className="text-right">
              <span className="text-muted-foreground">گروه شغلی:</span>
              <span className="font-medium mr-2">{employee.jobGrade}</span>
            </div>
          )}
          {employee.workLocation && (
            <div className="text-right">
              <span className="text-muted-foreground">محل کار:</span>
              <span className="font-medium mr-2">{employee.workLocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* سوابق شغلی */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-right">سوابق شغلی</h4>
        <WorkHistoryList employeeId={employee.id} />
      </div>
    </CardContent>
  </Card>
</TabsContent>
      </Tabs>
    </div>
  )
}

export const EmployeeProfile = React.memo(EmployeeProfileInner, (prevProps, nextProps) => {
  return prevProps.employee?.id === nextProps.employee?.id
})