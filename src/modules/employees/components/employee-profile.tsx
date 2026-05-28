'use client'

import { useState } from 'react'
import {
  User, Briefcase, FileText, Clock, DollarSign,
  BarChart3, Award, GraduationCap, History, Shield, Mail,
  Phone, MapPin, Calendar, Heart, Users, Edit, 
  CheckCircle2, XCircle, AlertCircle,
  File, CreditCard, PhoneCall, Droplets,
  BookOpen, ShieldCheck, Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Separator } from '@/core/components/ui/separator'
import { Progress } from '@/core/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import {
  toPersianDigits, formatCurrency, formatShamsi,
} from '@/core/lib/utils-fa'
import { DocumentManager } from './document-manager'

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
}

interface EmployeeProfileProps {
  employee: EmployeeFull
  onRefresh: () => void
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

function LeaveStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'در انتظار', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    approved: { label: 'تایید شده', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    rejected: { label: 'رد شده', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  }
  const c = config[status] || config.pending
  return <Badge className={`text-[10px] ${c.className}`}>{c.label}</Badge>
}

// ============================================
// Info Row (RTL کامل - راست به چپ)
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

export function EmployeeProfile({ employee, onRefresh }: EmployeeProfileProps) {

  console.log('employee data:', employee)
  const [activeTab, setActiveTab] = useState('personal')
  const initials = employee?.firstName?.[0] + employee?.lastName?.[0] || '?'

  const genderLabel = employee.gender === 'male' ? 'مرد' : employee.gender === 'female' ? 'زن' : '—'
  const maritalLabel = employee.maritalStatus === 'single' ? 'مجرد' : employee.maritalStatus === 'married' ? 'متاهل' : '—'
  const militaryLabel = employee.militaryStatus === 'done' ? 'پایان خدمت' : employee.militaryStatus === 'exempt' ? 'معاف' : employee.militaryStatus === 'deferred' ? 'معاف تحصیلی' : '—'
  const contractLabel = employee.contractType === 'official' ? 'رسمی' : employee.contractType === 'contractual' ? 'قراردادی' : employee.contractType === 'probation' ? 'آزمایشی' : employee.contractType === 'temporary' ? 'موقت' : '—'
  const roleLabel = employee.user?.role === 'admin' ? 'مدیر سیستم' : employee.user?.role === 'hr_manager' ? 'مدیر منابع انسانی' : employee.user?.role === 'manager' ? 'مدیر' : 'کارمند'

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
                {employee.position || 'بدون پست'} {employee.department ? `• ${employee.department}` : ''}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> کد پرسنلی: {toPersianDigits(employee.personnelCode)}</span>
                {employee.user && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Shield className="w-3 h-3" /> {roleLabel}
                  </span>
                )}
                {employee.hireDate && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatShamsi(employee.hireDate)}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5">
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

        {/* Tab 1: Personal Info */}
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
             <CardTitle className="text-sm flex items-center pr-5 gap-2 justify-end">
                  تماس و تحصیلات 
              <User className="w-4 h-4 text-emerald-600 order-2" />
            </CardTitle>
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

        {/* بقیه تب‌ها به همین روال قبلی خودشون */}
      </Tabs>
    </div>
  )
}