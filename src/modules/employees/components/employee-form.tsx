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
  FileText,
  Upload,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'
import { toShamsi } from '@/core/lib/utils-fa'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/core/components/ui/dialog'

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
  employeeId?: string
  onSuccess?: () => void
  onCancel?: () => void
  startTab?: number
}

interface Document {
  id: string
  employeeId: string
  title: string
  category: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  status: string
  description?: string
  uploadedAt: string
}

const CATEGORIES = [
  { id: 'identification', label: 'مدارک شناسایی', icon: '🆔' },
  { id: 'education', label: 'مدارک تحصیلی', icon: '🎓' },
  { id: 'military', label: 'مدارک نظام وظیفه', icon: '🪖' },
  { id: 'resume', label: 'رزومه', icon: '📄' },
  { id: 'contract', label: 'قراردادها', icon: '📑' },
  { id: 'certificate', label: 'گواهینامه‌ها', icon: '🏆' },
  { id: 'medical', label: 'مدارک پزشکی', icon: '🏥' },        // ← اضافه کن
  { id: 'insurance', label: 'بیمه', icon: '🛡️' },            // ← اضافه کن
  { id: 'other', label: 'سایر مدارک', icon: '📁' },
]

const STEPS = [
  { id: 1, title: 'اطلاعات هویتی', icon: User },
  { id: 2, title: 'اطلاعات تماس', icon: Phone },
  { id: 3, title: 'اطلاعات شغلی', icon: Briefcase },
  { id: 4, title: 'اطلاعات مالی', icon: DollarSign },
  { id: 5, title: 'مدارک پرسنلی', icon: FileText },
  { id: 6, title: 'بررسی و ثبت', icon: Check },
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

export function EmployeeWizard({ employeeId, onSuccess, onCancel, startTab = 1 }: EmployeeWizardProps) {
  const [employee, setEmployee] = useState<EmployeeProp | null>(null)
  const [dbDocuments, setDbDocuments] = useState<Document[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [currentStep, setCurrentStep] = useState(startTab)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docCategoryFilter, setDocCategoryFilter] = useState('all')
  const [docFormData, setDocFormData] = useState({
    title: '',
    category: '',
    description: '',
  })
  const [pendingFiles, setPendingFiles] = useState<{ file: File; title: string; category: string; description: string }[]>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [positions, setPositions] = useState<{id: string, name: string, maxOccupancy: number | null, currentCount: number}[]>([])
  const [positionName, setPositionName] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const [showAddPositionDialog, setShowAddPositionDialog] = useState(false)
  const [newPositionName, setNewPositionName] = useState('')
  const [addingPosition, setAddingPosition] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPositionDropdown, setShowPositionDropdown] = useState(false)

  // Fetch departments
  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(Array.isArray(data) ? data : (data.data || [])))
      .catch(console.error)
  }, [])
  const fetchPositions = async () => {
    if (!formData.departmentId) return
    try {
      // گرفتن لیست سمت‌ها
      const response = await fetch(`/api/positions?departmentId=${formData.departmentId}`)
      const data = await response.json()
      const positionsList = (data.data || data)
      
      // گرفتن لیست کارمندها برای شمردن تعداد واقعی
      const empResponse = await fetch(`/api/employees?departmentId=${formData.departmentId}&limit=10000`)
      const empData = await empResponse.json()
      const employeesList = empData.data || empData
      
      // ساخت آرایه نهایی با تعداد واقعی
      const formattedPositions = positionsList.map((pos: any) => {
        // تعداد کارمندهایی که این سمت رو دارن
        const realCount = employeesList.filter((emp: any) => emp.position === pos.id).length
        return {
          id: pos.id,
          name: pos.title,
          maxOccupancy: pos.headcount,
          currentCount: realCount
        }
      })
      
      setPositions(formattedPositions)
      if (formData.position) {
        const updatedPos = formattedPositions.find(p => p.id === formData.position)
        if (updatedPos) setPositionName(updatedPos.name)
      }
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }

  const fetchDocuments = async (empId: string) => {
    setLoadingDocs(true)
    try {
      const response = await fetch(`/api/employees/${empId}/documents`)
      const data = await response.json()
      if (response.ok) {
        const docs = data.data || data
        setDbDocuments(docs)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoadingDocs(false)
    }
  }

  // Fetch employee data if editing
useEffect(() => {
  if (employeeId) {
    setLoadingData(true)
    Promise.all([
      fetch(`/api/employees/${employeeId}`).then(res => res.json()),
      fetch(`/api/employees/${employeeId}/financial`).then(res => res.json()).catch(() => ({}))
    ])
      .then(([empRes, financialRes]) => {
        const emp = empRes.data || empRes
        const financial = financialRes.data || financialRes
        setEmployee(emp)
        setFormData({
          ...initialFormData,
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          fatherName: emp.fatherName || '',
          nationalId: emp.nationalCode || '',
          birthCertificateNo: emp.birthCertificateNo || '',
          birthDate: emp.birthDate ? new Date(emp.birthDate) : null,
          birthPlace: emp.birthPlace || '',
          issuePlace: emp.issuePlace || '',
          gender: emp.gender || 'male',
          maritalStatus: emp.maritalStatus || 'single',
          childrenCount: String(emp.childrenCount || '0'),
          educationLevel: 
          emp.education === 'دیپلم' ? 'diploma' :
          emp.education === 'کاردانی' ? 'associate' :
          emp.education === 'کارشناسی' ? 'bachelor' :
          emp.education === 'کارشناسی ارشد' ? 'master' :
          emp.education === 'دکتری' ? 'phd' : '',
          educationField: emp.fieldOfStudy || '',
          phone: emp.phone || '',
          secondaryPhone: emp.secondaryPhone || '',
          landline: emp.homePhone || '',
          address: emp.address || '',
          postalCode: emp.postalCode || '',
          email: emp.email || '',
          employeeCode: emp.personnelCode || '',
          departmentId: emp.department || '',
          position: emp.position || '',
          contractType: emp.contractType || 'permanent',
          hireDate: emp.hireDate ? new Date(emp.hireDate) : null,
          contractMonths: String(emp.contractMonths || ''),
          // اطلاعات مالی از financial
          baseSalary: financial.baseSalary?.toString() || '',
          housingAllowance: financial.housingAllowance?.toString() || '0',
          workAllowance: financial.workAllowance?.toString() || '0',
          spouseAllowance: financial.spouseAllowance?.toString() || '0',
          childAllowance: financial.childAllowance?.toString() || '0',
          yearsOfServiceBase: financial.yearsOfServiceBase?.toString() || '0',
          responsibilityAllowance: financial.responsibilityAllowance?.toString() || '0',
          otherAllowances: financial.otherAllowances?.toString() || '0',
          bankAccountNo: financial.bankAccountNo || '',
          insuranceNo: financial.insuranceNo || '',
          laborCardNo: financial.laborCardNo || '',
        })
        fetchDocuments(employeeId)
        setLoadingData(false)
      })
      .catch(err => {
        console.error('Error fetching employee:', err)
        setLoadingData(false)
      })
  }
}, [employeeId, startTab])

// هر وقت departmentId تغییر کرد، سموم رو بگیر و نام دپارتمان رو پیدا کن
useEffect(() => {
  if (formData.departmentId) {
    fetchPositions()
    const dept = departments.find(d => d.id === formData.departmentId)
    setDepartmentName(dept?.name || '')
  } else {
    setPositions([])
    setDepartmentName('')
  }
}, [formData.departmentId, departments])

// برای تنظیم positionName در حالت ویرایش
useEffect(() => {
  if (formData.position && positions.length > 0) {
    const pos = positions.find(p => p.id === formData.position)
    if (pos) setPositionName(pos.name)
  }
}, [formData.position, positions])

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

  // اضافه کن بعد از تابع handleUpdateEmployee
  const handleFinalSubmit = async () => {
    setLoading(true)
    const educationMap: Record<string, string> = {
      'diploma': 'دیپلم',
      'associate': 'کاردانی',
      'bachelor': 'کارشناسی',
      'master': 'کارشناسی ارشد',
      'phd': 'دکتری',
    }
    
    // تابع تبدیل تاریخ ساده
    const dateToSimpleShamsi = (date: Date | null): string => {
      if (!date) return ''
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}/${month}/${day}`
    }
  
    try {
      // 1. اطلاعات پایه کارمند (با تمام فیلدها)
      const employeeData: Record<string, any> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fatherName: formData.fatherName || null,
        nationalCode: formData.nationalId,
        birthCertificateNo: formData.birthCertificateNo || null,
        birthDate: formData.birthDate ? dateToSimpleShamsi(formData.birthDate) : '',
        birthPlace: formData.birthPlace || null,
        issuePlace: formData.issuePlace || null,
        gender: formData.gender || null,
        maritalStatus: formData.maritalStatus || null,
        childrenCount: parseInt(formData.childrenCount) || 0,
        fieldOfStudy: formData.educationField || null,
        phone: formData.phone || null,
        secondaryPhone: formData.secondaryPhone || null,
        homePhone: formData.landline || null,
        education: educationMap[formData.educationLevel] || '',
        address: formData.address || null,
        postalCode: formData.postalCode || null,
        email: formData.email || null,
        personnelCode: formData.employeeCode,
        department: formData.departmentId || null,
        position: formData.position || null,
        contractType: formData.contractType === 'permanent' ? 'official' : 
          formData.contractType === 'temporary' ? 'temporary' :
          formData.contractType === 'hourly' ? 'contractual' : 'official',
        hireDate: formData.hireDate ? dateToSimpleShamsi(formData.hireDate) : '',
        contractEndDate: formData.contractEndDate ? dateToSimpleShamsi(formData.contractEndDate) : null,
        contractMonths: parseInt(formData.contractMonths) || null,
        status: 'active',
        createContract: true,
        createUser: true,
      }
  
      // حذف فیلدهای خالی (undefined, null, '')
      Object.keys(employeeData).forEach(key => {
        const value = employeeData[key]
        if (value === undefined || value === null || value === '') {
          delete employeeData[key]
        }
      })
  
      console.log('📤 Sending employee data:', employeeData)
  
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      })
  
      if (response.ok) {
        const result = await response.json()
        const newEmployeeId = result.employee?.id || result.data?.id || result.id
        
        // 2. ذخیره اطلاعات مالی (بعد از ایجاد کارمند)
        if (newEmployeeId) {
          const financialData: Record<string, any> = {
            bankAccountNo: formData.bankAccountNo || null,
            insuranceNo: formData.insuranceNo || null,
            laborCardNo: formData.laborCardNo || null,
            baseSalary: parseFloat(formData.baseSalary) || 0,
            housingAllowance: parseFloat(formData.housingAllowance) || 0,
            workAllowance: parseFloat(formData.workAllowance) || 0,
            spouseAllowance: parseFloat(formData.spouseAllowance) || 0,
            childAllowance: parseFloat(formData.childAllowance) || 0,
            yearsOfServiceBase: parseFloat(formData.yearsOfServiceBase) || 0,
            responsibilityAllowance: parseFloat(formData.responsibilityAllowance) || 0,
            otherAllowances: parseFloat(formData.otherAllowances) || 0,
          }
          
          // حذف فیلدهای خالی در financialData
          Object.keys(financialData).forEach(key => {
            if (financialData[key] === undefined || financialData[key] === null) {
              delete financialData[key]
            }
          })
          
          await fetch(`/api/employees/${newEmployeeId}/financial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(financialData),
          }).catch(err => console.warn('Financial data save error:', err))
        }
        
        // 3. ذخیره مدارک (اگر وجود دارند)
        if (newEmployeeId && pendingFiles.length > 0) {
          for (const pendingFile of pendingFiles) {
            const formData = new FormData()
            formData.append('file', pendingFile.file)
            formData.append('title', pendingFile.title)
            formData.append('category', pendingFile.category)
            formData.append('description', pendingFile.description || '')
            
            await fetch(`/api/employees/${newEmployeeId}/documents`, {
              method: 'POST',
              body: formData,
            }).catch(console.error)
          }
        }
        
        toast.success('کارمند با موفقیت ثبت شد')
        if (result.account) {
          toast.info(`رمز عبور موقت: ${result.account.temporaryPassword || result.account.password}`)
          toast.warning('کارمند در اولین ورود رمز عبور را تغییر دهد')
        }
       if (formData.departmentId && formData.position) {
  // آپدیت دستی تعداد در UI
  setPositions(prevPositions => 
    prevPositions.map(pos => 
      pos.id === formData.position 
        ? { ...pos, currentCount: (pos.currentCount || 0) + 1 }
        : pos
    )
  )
  // برای اطمینان، بعد از 2 ثانیه دوباره از سرور بگیر
  setTimeout(() => {
    fetchPositions()
  }, 2000)
}
        onSuccess?.()
      } else {
        const error = await response.json()
        console.error('Server error:', error)
        toast.error(error.error || 'خطا در ثبت کارمند')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }
// اضافه کن در بالای کامپوننت، قبل از توابع
const dateToSimpleShamsi = (date: Date | null): string => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}
const handleUpdateEmployee = async () => {
  setLoading(true)
  const educationMap: Record<string, string> = {
    'diploma': 'دیپلم',
    'associate': 'کاردانی',
    'bachelor': 'کارشناسی',
    'master': 'کارشناسی ارشد',
    'phd': 'دکتری',
  }

  try {
    // 1. به‌روزرسانی اطلاعات پایه کارمند
    const employeeData: Record<string, any> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      fatherName: formData.fatherName || null,
      nationalCode: formData.nationalId,
      birthCertificateNo: formData.birthCertificateNo || null,
      birthDate: formData.birthDate ? dateToSimpleShamsi(formData.birthDate) : '',
      birthPlace: formData.birthPlace || null,
      issuePlace: formData.issuePlace || null,
      gender: formData.gender || null,
      maritalStatus: formData.maritalStatus || null,
      childrenCount: parseInt(formData.childrenCount) || 0,
      fieldOfStudy: formData.educationField || null,
      phone: formData.phone || null,
      secondaryPhone: formData.secondaryPhone || null,
      homePhone: formData.landline || null,
      education: educationMap[formData.educationLevel] || '',
      address: formData.address || null,
      postalCode: formData.postalCode || null,
      email: formData.email || null,
      personnelCode: formData.employeeCode,
      department: formData.departmentId || null,
      position: formData.position || null,
      contractType: formData.contractType === 'permanent' ? 'official' : 
        formData.contractType === 'temporary' ? 'temporary' :
        formData.contractType === 'hourly' ? 'contractual' : 'official',
      hireDate: formData.hireDate ? dateToSimpleShamsi(formData.hireDate) : '',
      contractEndDate: formData.contractEndDate ? dateToSimpleShamsi(formData.contractEndDate) : null,
      contractMonths: parseInt(formData.contractMonths) || null,
      status: 'active',
    }

    // حذف فیلدهای خالی
    Object.keys(employeeData).forEach(key => {
      if (employeeData[key] === undefined || employeeData[key] === null || employeeData[key] === '') {
        delete employeeData[key]
      }
    })

    const employeeResponse = await fetch(`/api/employees/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    })

    if (!employeeResponse.ok) {
      const error = await employeeResponse.json()
      console.error('Employee update error:', error)
      throw new Error(error.error || 'خطا در بروزرسانی اطلاعات پایه')
    }

    // 2. به‌روزرسانی اطلاعات مالی
    const financialData = {
      bankAccountNo: formData.bankAccountNo || null,
      insuranceNo: formData.insuranceNo || null,
      laborCardNo: formData.laborCardNo || null,
      baseSalary: parseFloat(formData.baseSalary) || 0,
      housingAllowance: parseFloat(formData.housingAllowance) || 0,
      workAllowance: parseFloat(formData.workAllowance) || 0,
      spouseAllowance: parseFloat(formData.spouseAllowance) || 0,
      childAllowance: parseFloat(formData.childAllowance) || 0,
      yearsOfServiceBase: parseFloat(formData.yearsOfServiceBase) || 0,
      responsibilityAllowance: parseFloat(formData.responsibilityAllowance) || 0,
      otherAllowances: parseFloat(formData.otherAllowances) || 0,
    }

    const financialResponse = await fetch(`/api/employees/${employeeId}/financial`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(financialData),
    })

    if (!financialResponse.ok) {
      console.warn('Financial data update failed:', await financialResponse.json())
    }

    // 3. ذخیره مدارک جدید (pendingFiles) - فقط در حالت ویرایش
    if (pendingFiles.length > 0) {
      console.log(`📤 آپلود ${pendingFiles.length} مدرک برای کارمند ${employeeId}...`)
      
      for (const pendingFile of pendingFiles) {
        const formData = new FormData()
        formData.append('file', pendingFile.file)
        formData.append('title', pendingFile.title)
        formData.append('category', pendingFile.category)
        formData.append('description', pendingFile.description || '')
        
        try {
          const uploadResponse = await fetch(`/api/employees/${employeeId}/documents`, {
            method: 'POST',
            body: formData,
          })
          
          if (uploadResponse.ok) {
            console.log(`✅ مدرک "${pendingFile.title}" آپلود شد`)
          } else {
            console.error(`❌ خطا در آپلود مدرک "${pendingFile.title}"`)
          }
        } catch (err) {
          console.error(`❌ خطا در آپلود مدرک "${pendingFile.title}":`, err)
        }
      }
      
      // پاک کردن pendingFiles بعد از آپلود
      setPendingFiles([])
      console.log('✅ همه مدارک آپلود شدند')
    }

    toast.success('اطلاعات کارمند با موفقیت بروزرسانی شد')
    await fetchPositions()
    onSuccess?.()
  } catch (error: any) {
    console.error('Update error:', error)
    toast.error(error.message || 'خطا در بروزرسانی')
  } finally {
    setLoading(false)
  }
}

const handleUploadDocument = async () => {
  if (!selectedFile || !docFormData.title || !docFormData.category) {
    toast.error('لطفاً همه فیلدهای required را پر کنید')
    return
  }

  // ذخیره موقت فایل در state (نه آپلود به سرور)
  setPendingFiles(prev => [...prev, {
    file: selectedFile,
    title: docFormData.title,
    category: docFormData.category,
    description: docFormData.description,
  }])
  
  // برای نمایش در UI (پیش‌نمایش موقت)
  const tempId = Date.now().toString()
  setDbDocuments(prev => [...prev, {
    id: tempId,
    employeeId: 'pending',
    title: docFormData.title,
    category: docFormData.category,
    fileName: selectedFile.name,
    fileUrl: URL.createObjectURL(selectedFile),
    fileSize: selectedFile.size,
    fileType: selectedFile.type,
    status: 'pending',
    description: docFormData.description,
    uploadedAt: new Date().toISOString()
  }])
  
  toast.success('مدرک اضافه شد (پس از ثبت کارمند آپلود می‌شود)')
  setShowUploadDialog(false)
  setSelectedFile(null)
  setDocFormData({ title: '', category: '', description: '' })
}

  const handleDeleteDocument = async (docId: string, isFromDb: boolean) => {
    if (isFromDb) {
      try {
        const response = await fetch(`/api/employees/${employeeId}/documents/${docId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setDbDocuments(prev => prev.filter(d => d.id !== docId))
          toast.success('مدرک با موفقیت حذف شد')
        } else {
          toast.error('خطا در حذف مدرک')
        }
      } catch (error) {
        console.error('Error deleting document:', error)
        toast.error('خطا در حذف مدرک')
      }
    } else {
      setDocuments(prev => prev.filter(d => d.id !== docId))
      toast.success('مدرک حذف شد')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>نام <span className="text-red-500">*</span></Label><Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />{errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}</div>
            <div className="space-y-2"><Label>نام خانوادگی <span className="text-red-500">*</span></Label><Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />{errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}</div>
            <div className="space-y-2"><Label>نام پدر <span className="text-red-500">*</span></Label><Input value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}  />{errors.fatherName && <p className="text-red-500 text-xs">{errors.fatherName}</p>}</div>
            <div className="space-y-2"><Label>کد ملی <span className="text-red-500">*</span></Label><Input value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} maxLength={10} dir="ltr" />{errors.nationalId && <p className="text-red-500 text-xs">{errors.nationalId}</p>}</div>
            <div className="space-y-2"><Label>شماره شناسنامه</Label><Input value={formData.birthCertificateNo} onChange={(e) => setFormData({ ...formData, birthCertificateNo: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label>تاریخ تولد</Label><PersianDatePicker minDate={new Date(1920, 0, 1)} maxDate={new Date(2016, 11, 31)}  value={formData.birthDate} onChange={(date) => setFormData({ ...formData, birthDate: date })} /></div>
            
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
            <div className="space-y-2">
  <Label>سمت <span className="text-red-500">*</span></Label>
  <div className="relative">
  <div 
    className="w-full border rounded-lg px-4 py-3 bg-white flex justify-between items-center cursor-pointer"
    onClick={() => {
      console.log('🔵 Clicked, current showPositionDropdown:', showPositionDropdown)
      console.log('🔵 positions length:', positions.length)
      setShowPositionDropdown(!showPositionDropdown)
    }}
  >
    <span className={positionName ? 'text-black-900' : 'text-gray-400'}>
      {positionName || 'انتخاب سمت...'}
    </span>
    <ChevronLeft className={`h-4 w-4 transition-transform ${showPositionDropdown ? 'rotate-90' : ''}`} />
  </div>
  
  {console.log('🔵🔵🔵 Rendering dropdown, showPositionDropdown:', showPositionDropdown, 'positions.length:', positions.length)}
  
  {showPositionDropdown && (
   <div className="absolute z-[9999] w-full mt-1 bg-white border rounded-lg shadow-lg" style={{ top: '100%', left: 0, right: 0 }}>
      <div className="p-2 border-b">
        <Input
          type="text"
          placeholder="جستجوی سمت..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          autoFocus
        />
      </div>
      <div className="max-h-60 overflow-y-auto">
        {positions.length === 0 && !searchTerm ? (
          <div className="px-4 py-3 text-center text-gray-500">
            لطفاً ابتدا واحد سازمانی را انتخاب کنید
          </div>
        ) : (
          <>
           {positions
  .filter(p => !searchTerm || p.name.includes(searchTerm))
  .map((position) => {
    const isFull = position.maxOccupancy && (position.currentCount || 0) >= position.maxOccupancy
    const remaining = (position.maxOccupancy || 0) - (position.currentCount || 0)
    return (
      <div
        key={position.id}
        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => {
          if (!isFull) {
            setFormData({ ...formData, position: position.id })
            setPositionName(position.name)
            setShowPositionDropdown(false)
            setSearchTerm('')
          } else {
            toast.error(`ظرفیت سمت "${position.name}" تکمیل شده است`)
          }
        }}
      >
        <div className="flex justify-between items-center">
          <span>{position.name}</span>
          <div className="flex gap-2 text-xs">
            {position.maxOccupancy ? (
              <span className={`${remaining === 0 ? 'text-red-500' : remaining <= 2 ? 'text-amber-500' : 'text-green-500'}`}>
                {position.currentCount || 0}/{position.maxOccupancy}
              </span>
            ) : (
              <span className="text-gray-400">نامحدود</span>
            )}
          </div>
        </div>
        {isFull && <span className="text-xs text-rose-500 block">(پر شده)</span>}
      </div>
    )
  })}
            <div
              className="px-4 py-2 text-emerald-600 cursor-pointer hover:bg-gray-100 border-t"
              onClick={() => {
                setShowPositionDropdown(false)
                setShowAddPositionDialog(true)
              }}
            >
              + افزودن سمت جدید
            </div>
          </>
        )}
      </div>
    </div>
  )}
</div>
  {errors.position && <p className="text-red-500 text-xs">{errors.position}</p>}
</div>
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
        const allDocuments = [...dbDocuments, ...documents]
        const filteredDocs = docCategoryFilter === 'all' 
          ? allDocuments 
          : allDocuments.filter(doc => doc.category === docCategoryFilter)
        
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">مدارک پرسنلی</h3>
                <p className="text-sm text-gray-500">مدارک شناسایی، تحصیلی و شغلی کارمند</p>
              </div>
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                size="sm"
              >
                <Upload className="w-4 h-4" />
                افزودن مدرک
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDocCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  docCategoryFilter === 'all'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                همه
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setDocCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    docCategoryFilter === cat.id
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">هیچ مدرکی افزوده نشده است</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 gap-1"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Plus className="w-3 h-3" />
                  افزودن اولین مدرک
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredDocs.map((doc) => {
                  const category = CATEGORIES.find(c => c.id === doc.category)
                  const isFromDb = doc.id && !doc.fileUrl?.startsWith('blob:') && doc.fileUrl?.startsWith('/uploads')
                  return (
                    <Card key={doc.id} className="border hover:shadow-md transition-all">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{doc.title}</p>
                              <p className="text-[10px] text-gray-400">{category?.label}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isFromDb && doc.fileUrl && (
                              <a 
                                href={doc.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                              >
                                مشاهده
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDeleteDocument(doc.id, isFromDb)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {doc.description && (
                          <p className="text-[10px] text-gray-500 mt-1 truncate">{doc.description}</p>
                        )}
                        {isFromDb && doc.uploadedAt && (
                          <p className="text-[9px] text-gray-400 mt-1">
                            آپلود: {new Date(doc.uploadedAt).toLocaleDateString('fa-IR')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="font-medium text-emerald-800">آماده ثبت</p>
              <p className="text-sm text-emerald-600">اطلاعات کارمند کامل است. با ثبت نهایی، پنل کارمند و قرارداد استخدامی صادر می‌شود.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card><CardContent className="p-4"><p className="font-medium">{formData.firstName} {formData.lastName}</p><p className="text-xs text-gray-500">کد ملی: {formData.nationalId}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="font-medium">{formData.phone}</p><p className="text-xs text-gray-500 truncate">{formData.address}</p></CardContent></Card>
              <Card><CardContent className="p-4">
                  <p className="font-medium">{positionName || formData.position || '—'}</p>
                  <p className="text-xs text-gray-500">واحد: {departmentName || formData.departmentId}</p>
                  <p className="text-xs text-gray-500">کد: {formData.employeeCode}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4"><p className="font-medium">حقوق پایه: {(parseFloat(formData.baseSalary) || 0).toLocaleString()} ریال</p></CardContent></Card>
            </div>
          </div>
        )
      default: return null
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-800">{employeeId ? 'ویرایش کارمند' : 'ثبت کارمند جدید'}</h1>
        </div>
        <p className="text-gray-500 mr-4">{employeeId ? 'ویرایش اطلاعات پرسنلی' : 'ایجاد پروفایل پرسنلی جدید در سازمان'}</p>
      </div>
      
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Progress Bar - با جهت راست به چپ */}
<div className="space-y-2">
  <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
    <div 
      className="absolute top-0 right-0 h-full bg-gradient-to-l from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
  <div className="flex justify-between">
    {STEPS.map((step) => {
      const Icon = step.icon
      const isActive = currentStep === step.id
      const isCompleted = currentStep > step.id
      return (
        <div 
          key={step.id} 
          className={`flex flex-col items-center text-xs cursor-pointer ${isActive ? 'text-emerald-600' : isCompleted ? 'text-emerald-500' : 'text-gray-400'}`} 
          onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
        >
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
            <Button 
  variant="outline" 
  onClick={() => {
    console.log('✅ دکمه لغو کلیک شد - EmployeeWizard')
    
    // ریست کردن state های فرم
    setCurrentStep(1)
    setFormData(initialFormData)
    setErrors({})
    setSelectedFile(null)
    setDocFormData({ title: '', category: '', description: '' })
    setPendingFiles([])
    
    // سعی کن onCancel رو صدا بزنی
    if (onCancel) {
      console.log('✅ onCancel وجود داره، صدا میزنم...')
      onCancel()
    } else {
      console.log('❌ onCancel وجود نداره!')
      // راه حل جایگزین: مستقیم parent رو صدا بزن
      // اگه EmployeeWizard داخل Dialog نیست، از onSuccess استفاده کن
      if (onSuccess) {
        onSuccess()
      }
    }
  }}
>
  لغو
</Button>
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrev}>
                    <ChevronRight className="h-4 w-4 ml-1" />مرحله قبل
                  </Button>
                )}
                {currentStep < STEPS.length ? (
                  <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                    مرحله بعد
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>
                ) : (
                  <Button 
  onClick={employeeId ? handleUpdateEmployee : handleFinalSubmit} 
  disabled={loading} 
  className="bg-emerald-600 hover:bg-emerald-700"
>
  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (employeeId ? 'ذخیره تغییرات' : 'ثبت نهایی')}
</Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>افزودن مدرک جدید</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>فایل *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  id="file-upload-doc"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="file-upload-doc" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'برای انتخاب فایل کلیک کنید'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, JPG, PNG (حداکثر 5MB)</p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>عنوان مدرک *</Label>
              <Input
                value={docFormData.title}
                onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                placeholder="مثال: مدرک تحصیلی کارشناسی"
              />
            </div>

            <div className="space-y-2">
              <Label>دسته بندی *</Label>
              <Select value={docFormData.category} onValueChange={(v) => setDocFormData({ ...docFormData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته بندی..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>توضیحات</Label>
              <textarea
  value={docFormData.description || ''}
  onChange={(e) => setDocFormData({ ...docFormData, description: e.target.value })}
  className="w-full p-2 border rounded-lg min-h-[80px]"
  placeholder="توضیحات اضافی..."
/>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUploadDialog(false)
              setSelectedFile(null)
              setDocFormData({ title: '', category: '', description: '' })
            }}>
              انصراف
            </Button>
            <Button 
              onClick={handleUploadDocument} 
              disabled={uploadingDoc || !selectedFile || !docFormData.title || !docFormData.category}
              className="bg-emerald-500 hover:bg-emerald-600 gap-2"
            >
              {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingDoc ? 'در حال افزودن...' : 'افزودن مدرک'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
            <Dialog open={showAddPositionDialog} onOpenChange={setShowAddPositionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>افزودن سمت جدید</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>نام سمت *</Label>
              <Input
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                placeholder="مثال: برنامه‌نویس ارشد"
              />
            </div>
            <div className="space-y-2">
              <Label>واحد سازمانی</Label>
              <Input
                value={departmentName || departments.find(d => d.id === formData.departmentId)?.name || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddPositionDialog(false)
              setNewPositionName('')
            }}>
              انصراف
            </Button>
            <Button 
              onClick={async () => {
                if (!newPositionName.trim()) {
                  toast.error('نام سمت الزامی است')
                  return
                }
                if (!formData.departmentId) {
                  toast.error('لطفاً ابتدا واحد سازمانی را انتخاب کنید')
                  return
                }
                setAddingPosition(true)
                try {
                  const response = await fetch('/api/positions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: newPositionName,
                      departmentId: formData.departmentId
                    })
                  })
                  if (response.ok) {
                    const result = await response.json()
                    const newPosition = result.data || result
                    toast.success('سمت با موفقیت اضافه شد')
                    setNewPositionName('')
                    setShowAddPositionDialog(false)
                    await fetchPositions()
                    setFormData({ ...formData, position: newPosition.id })
                    setPositionName(newPosition.name)
                  } else {
                    toast.error('خطا در افزودن سمت')
                  }
                } catch {
                  toast.error('خطا در ارتباط با سرور')
                } finally {
                  setAddingPosition(false)
                }
              }}
              disabled={addingPosition || !newPositionName.trim()}
            >
              {addingPosition ? <Loader2 className="h-4 w-4 animate-spin" /> : 'افزودن'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}