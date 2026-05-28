'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import { Progress } from '@/core/components/ui/progress'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  User, 
  Phone, 
  Briefcase, 
  DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'
import { toShamsi } from '@/core/lib/utils-fa'

interface EmployeeProp {
  id?: string
  firstName?: string
  lastName?: string
  nationalCode?: string
  personnelCode?: string
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  birthPlace?: string | null
  gender?: string | null
  maritalStatus?: string | null
  childrenCount?: number
  address?: string | null
  homePhone?: string | null
  education?: string | null
  fieldOfStudy?: string | null
  hireDate?: string
  status?: string
  contractType?: string | null
  position?: string | null
  department?: string | null
  user?: { role?: string } | null
}

interface EmployeeWizardProps {
  onSuccess?: () => void
  onClose?: () => void
  employee?: EmployeeProp | null
}

const STEPS = [
  { id: 1, title: 'اطلاعات هویتی', icon: User },
  { id: 2, title: 'اطلاعات تماس', icon: Phone },
  { id: 3, title: 'اطلاعات شغلی', icon: Briefcase },
  { id: 4, title: 'اطلاعات مالی', icon: DollarSign },
  { id: 5, title: 'بررسی و ثبت', icon: Check },
]

interface FormData {
  firstName: string
  lastName: string
  fatherName: string
  nationalId: string
  birthCertificateNo: string
  birthDate: Date | null
  birthPlace: string
  issuePlace: string
  gender: string
  maritalStatus: string
  childrenCount: string
  educationLevel: string
  educationField: string
  phone: string
  secondaryPhone: string
  landline: string
  address: string
  postalCode: string
  email: string
  employeeCode: string
  departmentId: string
  position: string
  contractType: string
  hireDate: Date | null
  contractEndDate: Date | null
  contractMonths: string
  baseSalary: string
  housingAllowance: string
  workAllowance: string
  spouseAllowance: string
  childAllowance: string
  yearsOfServiceBase: string
  responsibilityAllowance: string
  otherAllowances: string
  bankAccountNo: string
  insuranceNo: string
  laborCardNo: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  fatherName: '',
  nationalId: '',
  birthCertificateNo: '',
  birthDate: null,
  birthPlace: '',
  issuePlace: '',
  gender: 'male',
  maritalStatus: 'single',
  childrenCount: '0',
  educationLevel: '',
  educationField: '',
  phone: '',
  secondaryPhone: '',
  landline: '',
  address: '',
  postalCode: '',
  email: '',
  employeeCode: '',
  departmentId: '',
  position: '',
  contractType: 'permanent',
  hireDate: null,
  contractEndDate: null,
  contractMonths: '',
  baseSalary: '',
  housingAllowance: '0',
  workAllowance: '0',
  spouseAllowance: '0',
  childAllowance: '0',
  yearsOfServiceBase: '0',
  responsibilityAllowance: '0',
  otherAllowances: '0',
  bankAccountNo: '',
  insuranceNo: '',
  laborCardNo: '',
}

export function EmployeeWizard({ onSuccess, onClose, employee }: EmployeeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(Array.isArray(data) ? data : (data.data || [])))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (employee) {
      setFormData({
        ...initialFormData,
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        nationalId: employee.nationalCode || '',
        employeeCode: employee.personnelCode || '',
        email: employee.email || '',
        phone: employee.phone || '',
        birthDate: employee.birthDate ? new Date(employee.birthDate) : null,
        birthPlace: employee.birthPlace || '',
        gender: employee.gender || 'male',
        maritalStatus: employee.maritalStatus || 'single',
        childrenCount: String(employee.childrenCount || '0'),
        address: employee.address || '',
        landline: employee.homePhone || '',
        educationLevel: employee.education || '',
        educationField: employee.fieldOfStudy || '',
        position: employee.position || '',
        departmentId: employee.department || '',
        contractType: employee.contractType || 'permanent',
        hireDate: employee.hireDate ? new Date(employee.hireDate) : null,
        baseSalary: '',
      })
    }
    setCurrentStep(1)
    setErrors({})
  }, [employee])

  const progress = (currentStep / STEPS.length) * 100

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'نام الزامی است'
        if (!formData.lastName.trim()) newErrors.lastName = 'نام خانوادگی الزامی است'
        if (!formData.fatherName.trim()) newErrors.fatherName = 'نام پدر الزامی است'
        if (!formData.nationalId.trim()) newErrors.nationalId = 'کد ملی الزامی است'
        else if (!/^\d{10}$/.test(formData.nationalId)) newErrors.nationalId = 'کد ملی باید ۱۰ رقم باشد'
        break
      case 2:
        if (!formData.phone.trim()) newErrors.phone = 'شماره موبایل الزامی است'
        else if (!/^09\d{9}$/.test(formData.phone)) newErrors.phone = 'شماره موبایل معتبر نیست'
        if (!formData.address.trim()) newErrors.address = 'آدرس الزامی است'
        break
      case 3:
        if (!formData.employeeCode.trim()) newErrors.employeeCode = 'کد کارمندی الزامی است'
        if (!formData.departmentId) newErrors.departmentId = 'واحد سازمانی الزامی است'
        if (!formData.position.trim()) newErrors.position = 'سمت الزامی است'
        if (!formData.hireDate) newErrors.hireDate = 'تاریخ استخدام الزامی است'
        if (formData.contractType === 'temporary' && !formData.contractMonths) {
          newErrors.contractMonths = 'مدت قرارداد برای قرارداد موقت الزامی است'
        }
        break
      case 4:
        if (!formData.baseSalary) newErrors.baseSalary = 'حقوق پایه الزامی است'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    try {
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fatherName: formData.fatherName,
        nationalCode: formData.nationalId,
        birthCertificateNo: formData.birthCertificateNo,
        birthDate: formData.birthDate ? toShamsi(formData.birthDate) : '',
        birthPlace: formData.birthPlace,
        issuePlace: formData.issuePlace,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        childrenCount: parseInt(formData.childrenCount) || 0,
        education: formData.educationLevel === 'diploma' ? 'دیپلم' :
             formData.educationLevel === 'associate' ? 'کاردانی' :
             formData.educationLevel === 'bachelor' ? 'کارشناسی' :
             formData.educationLevel === 'master' ? 'کارشناسی ارشد' :
             formData.educationLevel === 'phd' ? 'دکتری' : '',
        fieldOfStudy: formData.educationField,
        phone: formData.phone,
        secondaryPhone: formData.secondaryPhone,
        homePhone: formData.landline,
        address: formData.address,
        postalCode: formData.postalCode,
        email: formData.email,
        personnelCode: formData.employeeCode,
        department: formData.departmentId,
        position: formData.position,
        contractType: formData.contractType === 'permanent' ? 'official' : 
        formData.contractType === 'temporary' ? 'temporary' :
        formData.contractType === 'hourly' ? 'contractual' : 'official',
        hireDate: formData.hireDate ? toShamsi(formData.hireDate) : '',  
        contractEndDate: formData.contractEndDate ? toShamsi(formData.contractEndDate) : null, 
        contractMonths: parseInt(formData.contractMonths) || null,
        baseSalary: parseFloat(formData.baseSalary) || 0,
        housingAllowance: parseFloat(formData.housingAllowance) || 0,
        workAllowance: parseFloat(formData.workAllowance) || 0,
        spouseAllowance: parseFloat(formData.spouseAllowance) || 0,
        childAllowance: parseFloat(formData.childAllowance) || 0,
        yearsOfServiceBase: parseFloat(formData.yearsOfServiceBase) || 0,
        responsibilityAllowance: parseFloat(formData.responsibilityAllowance) || 0,
        otherAllowances: parseFloat(formData.otherAllowances) || 0,
        bankAccountNo: formData.bankAccountNo,
        insuranceNo: formData.insuranceNo,
        laborCardNo: formData.laborCardNo,
        status: 'active',
        createContract: true,
        createUser: true
      }

      console.log('📤 Submitting data:', submitData)  

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('کارمند با موفقیت ثبت شد')
        if (result.account) {
          toast.info(`نام کاربری: ${result.account.email}`)  
          toast.info(`رمز عبور موقت: ${result.account.temporaryPassword}`)
          toast.warning('کارمند در اولین ورود رمز عبور را تغییر دهد')
        
        }
        onSuccess?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'خطا در ثبت کارمند')
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>نام <span className="text-red-500">*</span></Label><Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />{errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}</div>
            <div className="space-y-2"><Label>نام خانوادگی <span className="text-red-500">*</span></Label><Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />{errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}</div>
            <div className="space-y-2"><Label>نام پدر <span className="text-red-500">*</span></Label><Input value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} />{errors.fatherName && <p className="text-red-500 text-xs">{errors.fatherName}</p>}</div>
            <div className="space-y-2"><Label>کد ملی <span className="text-red-500">*</span></Label><Input value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} maxLength={10} dir="ltr" />{errors.nationalId && <p className="text-red-500 text-xs">{errors.nationalId}</p>}</div>
            <div className="space-y-2"><Label>شماره شناسنامه</Label><Input value={formData.birthCertificateNo} onChange={(e) => setFormData({ ...formData, birthCertificateNo: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>تاریخ تولد</Label><PersianDatePicker value={formData.birthDate} onChange={(date) => setFormData({ ...formData, birthDate: date })} /></div>
            <div className="space-y-2"><Label>محل تولد</Label><Input value={formData.birthPlace} onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })} /></div>
            <div className="space-y-2"><Label>محل صدور</Label><Input value={formData.issuePlace} onChange={(e) => setFormData({ ...formData, issuePlace: e.target.value })} /></div>
            <div className="space-y-2"><Label>جنسیت</Label><Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">مرد</SelectItem><SelectItem value="female">زن</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>وضعیت تأهل</Label><Select value={formData.maritalStatus} onValueChange={(v) => setFormData({ ...formData, maritalStatus: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">مجرد</SelectItem><SelectItem value="married">متأهل</SelectItem></SelectContent></Select></div>
            {formData.maritalStatus === 'married' && (<div className="space-y-2"><Label>تعداد فرزندان</Label><Input type="number" value={formData.childrenCount} onChange={(e) => setFormData({ ...formData, childrenCount: e.target.value })} min="0" /></div>)}
            <div className="space-y-2"><Label>مقطع تحصیلی</Label><Select value={formData.educationLevel} onValueChange={(v) => setFormData({ ...formData, educationLevel: v })}><SelectTrigger><SelectValue placeholder="انتخاب کنید" /></SelectTrigger><SelectContent><SelectItem value="diploma">دیپلم</SelectItem><SelectItem value="associate">فوق دیپلم</SelectItem><SelectItem value="bachelor">لیسانس</SelectItem><SelectItem value="master">فوق لیسانس</SelectItem><SelectItem value="phd">دکتری</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>رشته تحصیلی</Label><Input value={formData.educationField} onChange={(e) => setFormData({ ...formData, educationField: e.target.value })} /></div>
          </div>
        )
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>شماره موبایل <span className="text-red-500">*</span></Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} dir="ltr" />{errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}</div>
            <div className="space-y-2"><Label>شماره تماس ضروری</Label><Input value={formData.secondaryPhone} onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>تلفن ثابت</Label><Input value={formData.landline} onChange={(e) => setFormData({ ...formData, landline: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>ایمیل</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2 md:col-span-2"><Label>آدرس محل سکونت <span className="text-red-500">*</span></Label><Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} />{errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}</div>
            <div className="space-y-2"><Label>کد پستی</Label><Input value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} dir="ltr" /></div>
          </div>
        )
      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>کد کارمندی <span className="text-red-500">*</span></Label><Input value={formData.employeeCode} onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })} dir="ltr" />{errors.employeeCode && <p className="text-red-500 text-xs">{errors.employeeCode}</p>}</div>
            <div className="space-y-2"><Label>واحد سازمانی <span className="text-red-500">*</span></Label><Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}><SelectTrigger><SelectValue placeholder="انتخاب واحد سازمانی" /></SelectTrigger><SelectContent>{departments.map(dept => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}</SelectContent></Select>{errors.departmentId && <p className="text-red-500 text-xs">{errors.departmentId}</p>}</div>
            <div className="space-y-2"><Label>سمت <span className="text-red-500">*</span></Label><Input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />{errors.position && <p className="text-red-500 text-xs">{errors.position}</p>}</div>
            <div className="space-y-2"><Label>نوع قرارداد <span className="text-red-500">*</span></Label><Select value={formData.contractType} onValueChange={(v) => setFormData({ ...formData, contractType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="permanent">دائمی</SelectItem><SelectItem value="temporary">موقت</SelectItem><SelectItem value="hourly">ساعتی</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>تاریخ شروع قرارداد <span className="text-red-500">*</span></Label><PersianDatePicker value={formData.hireDate} onChange={(date) => setFormData({ ...formData, hireDate: date })} />{errors.hireDate && <p className="text-red-500 text-xs">{errors.hireDate}</p>}</div>
            {formData.contractType === 'temporary' && (<div className="space-y-2"><Label>مدت قرارداد (ماه) <span className="text-red-500">*</span></Label><Input type="number" value={formData.contractMonths} onChange={(e) => { const months = e.target.value; setFormData({ ...formData, contractMonths: months }); if (months && formData.hireDate) { const endDate = new Date(formData.hireDate); endDate.setMonth(endDate.getMonth() + parseInt(months)); setFormData(prev => ({ ...prev, contractEndDate: endDate })); } }} min="1" />{errors.contractMonths && <p className="text-red-500 text-xs">{errors.contractMonths}</p>}</div>)}
          </div>
        )
      case 4:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>حقوق پایه (ریال) <span className="text-red-500">*</span></Label><Input type="number" value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })} dir="ltr" />{errors.baseSalary && <p className="text-red-500 text-xs">{errors.baseSalary}</p>}</div>
            <div className="space-y-2"><Label>حق مسکن (ریال)</Label><Input type="number" value={formData.housingAllowance} onChange={(e) => setFormData({ ...formData, housingAllowance: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>بن کارگری (ریال)</Label><Input type="number" value={formData.workAllowance} onChange={(e) => setFormData({ ...formData, workAllowance: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>حق تاهل (ریال)</Label><Input type="number" value={formData.spouseAllowance} onChange={(e) => setFormData({ ...formData, spouseAllowance: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>حق اولاد (ریال)</Label><Input type="number" value={formData.childAllowance} onChange={(e) => setFormData({ ...formData, childAllowance: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>پایه سنوات</Label><Input type="number" value={formData.yearsOfServiceBase} onChange={(e) => setFormData({ ...formData, yearsOfServiceBase: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>حق مسئولیت (ریال)</Label><Input type="number" value={formData.responsibilityAllowance} onChange={(e) => setFormData({ ...formData, responsibilityAllowance: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>سایر مزایا (ریال)</Label><Input type="number" value={formData.otherAllowances} onChange={(e) => setFormData({ ...formData, otherAllowances: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>شماره حساب بانکی</Label><Input value={formData.bankAccountNo} onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>شماره بیمه</Label><Input value={formData.insuranceNo} onChange={(e) => setFormData({ ...formData, insuranceNo: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>شماره طب کار</Label><Input value={formData.laborCardNo} onChange={(e) => setFormData({ ...formData, laborCardNo: e.target.value })} dir="ltr" /></div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="font-medium text-emerald-800">آماده ثبت</p>
              <p className="text-sm text-emerald-600">اطلاعات کارمند کامل است. با ثبت نهایی، پنل کارمند و قرارداد استخدامی صادر می‌شود.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card><CardContent className="p-4"><p className="font-medium">{formData.firstName} {formData.lastName}</p><p className="text-xs text-gray-500">کد ملی: {formData.nationalId}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="font-medium">{formData.phone}</p><p className="text-xs text-gray-500 truncate">{formData.address}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="font-medium">{formData.position}</p><p className="text-xs text-gray-500">کد: {formData.employeeCode}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="font-medium">حقوق پایه: {(parseFloat(formData.baseSalary) || 0).toLocaleString()} ریال</p></CardContent></Card>
            </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-800">ثبت کارمند جدید</h1>
        </div>
        <p className="text-gray-500 mr-4">ایجاد پروفایل پرسنلی جدید در سازمان</p>
      </div>
      
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between">
                {STEPS.map((step) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id
                  return (
                    <div key={step.id} className={`flex flex-col items-center text-xs cursor-pointer ${isActive ? 'text-emerald-600' : isCompleted ? 'text-emerald-500' : 'text-gray-400'}`} onClick={() => step.id <= currentStep && setCurrentStep(step.id)}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isActive ? 'bg-emerald-100 border-2 border-emerald-500' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>
                        {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className="hidden sm:block">{step.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="min-h-[400px]">{renderStepContent()}</div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
                <ChevronRight className="h-4 w-4 ml-1" />مرحله قبل
              </Button>
              {currentStep < STEPS.length ? (
                <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                  مرحله بعد<ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              ) : (
                <Button onClick={handleFinalSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                  {loading ? 'در حال ثبت...' : 'ثبت نهایی'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}