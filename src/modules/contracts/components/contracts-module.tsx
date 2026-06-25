'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { ContractTable } from './contract-table'
import {
  FileText, Search, Plus, Save, Printer, User, Building2,
  CreditCard, Calendar, Hash, Briefcase, UserCircle, Phone,
  Mail, MapPin, CheckCircle2, XCircle, Edit, Eye, CheckCircle, AlertCircle, UserMinus
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/core/components/ui/select'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { Separator } from '@/core/components/ui/separator'
import { PERMANENT_CONTRACT_TEMPLATE, TEMPORARY_CONTRACT_TEMPLATE } from '../lib/contract-templates'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription
} from '@/core/components/ui/dialog'
import { toast } from 'sonner'
import { toShamsi, toPersianDigits, formatShamsi, formatCurrency } from '@/core/lib/utils-fa'
import { ContractEditor } from './contract-editor'

// ============================================
// Types
// ============================================

interface Employee {
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

interface Contract {
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


// ============================================
// Stats Card Component
// ============================================

const StatsCard = ({ title, value, icon: Icon, color, bgColor, subText }: { 
  title: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
  subText?: string
}) => {
  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{toPersianDigits(value)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
            {subText && <p className="text-[9px] text-muted-foreground mt-0.5">{subText}</p>}
          </div>
          <div className={`p-3 rounded-2xl ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Main Contracts Module
// ============================================

export function ContractsModule() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [contractText, setContractText] = useState(TEMPORARY_CONTRACT_TEMPLATE)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

// ============================================
// Update contract text when employee changes
// ============================================
useEffect(() => {
  if (selectedEmployee) {
    const template = getContractTemplate(selectedEmployee)
    const filledText = replaceVariables(template, selectedEmployee)
    setContractText(filledText)
  } else {
    setContractText(TEMPORARY_CONTRACT_TEMPLATE)
  }
}, [selectedEmployee])
  // ============================================
// Auto Refresh After Edit
// ============================================

const fetchContracts = async () => {
  try {
    const res = await fetch('/api/contracts')
const data = await res.json()
setContracts(data.data || data || [])
    
  } catch (error) {
    console.error('Error fetching contracts:', error)
  }
}

useEffect(() => {
  const itemsPerPage = 7
  const total = Math.ceil(contracts.length / itemsPerPage)
  setTotalPages(total > 0 ? total : 1)
}, [contracts])

useEffect(() => {
  const handleFocus = () => {
    fetchEmployees()
  }
  
  window.addEventListener('focus', handleFocus)
  
  return () => window.removeEventListener('focus', handleFocus)
}, [])

  useEffect(() => {
    fetchEmployees()
    fetchContracts() 
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/employees?limit=100')
      if (res.ok) {
        const data = await res.json()
        const employeesList = Array.isArray(data) ? data : (data.data || [])
        
        const employeesWithFinancial = await Promise.all(
          employeesList.map(async (emp: Employee) => {
            try {
              const [finRes, contractRes] = await Promise.all([
                fetch(`/api/employees/${emp.id}/financial`),
                fetch(`/api/employees/${emp.id}?includeContracts=true`)
              ])
              
              let financial = null
              let contractMonths = null
              let contractEndDate = null
              let contractType = null
              
              if (finRes.ok) {
                const finData = await finRes.json()
                financial = finData.data || finData
              }
              
              if (contractRes.ok) {
                const contractData = await contractRes.json()
                const empData = contractData.data || contractData
                contractMonths = empData.contractMonths || null
                contractEndDate = empData.contractEndDate || null
                contractType = emp.contractType || null 
              }
              
              return { ...emp, financial, contractMonths, contractEndDate, contractType ,positionName: emp.positionName || emp.position,  // ← اضافه کن
              departmentName: emp.departmentName || emp.department}
            } catch (e) {
              return { ...emp, financial: null, contractMonths: null, contractEndDate: null }
            }
          })
        )
        
        setEmployees(employeesWithFinancial)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('خطا در دریافت لیست کارمندان')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // Filtered Employees
  // ============================================

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees
    const term = searchTerm.toLowerCase()
    return employees.filter(emp =>
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(term) ||
      emp.personnelCode.includes(term)
    )
  }, [employees, searchTerm])

  // ============================================
// Employees without active contracts
// ============================================
const availableEmployees = useMemo(() => {
  // پیدا کردن کارمندانی که قرارداد فعال دارند
  const employeeIdsWithActiveContract = new Set(
    contracts
      .filter(c => c.status === 'active')
      .map(c => c.employeeId)
  )

  // فقط کارمندانی که قرارداد فعال ندارند
  return filteredEmployees.filter(emp => 
    !employeeIdsWithActiveContract.has(emp.id) && 
    emp.status === 'active'
  )
}, [filteredEmployees, contracts])

  const getContractTemplate = (employee: Employee) => {
    const isPermanent = employee.contractType === 'permanent' || !employee.contractMonths || employee.contractMonths === 0
    return isPermanent ? PERMANENT_CONTRACT_TEMPLATE : TEMPORARY_CONTRACT_TEMPLATE
  }
  

  // ============================================
  // Replace Variables in Template
  // ============================================

  const replaceVariables = (text: string, data: Employee): string => {
    let result = text
  
    // تاریخ شروع
    let startDate = 'تاریخ شروع'
    if (data.hireDate) {
      const date = new Date(data.hireDate)
      if (!isNaN(date.getTime())) {
        startDate = date.toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } else {
        startDate = data.hireDate
      }
    }
  
    // تاریخ پایان و مدت قرارداد
    let endDate = 'نامحدود'
    let contractDuration = 'دائم'
  
    if (data.contractEndDate) {
      const date = new Date(data.contractEndDate)
      if (!isNaN(date.getTime())) {
        endDate = date.toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } else {
        endDate = data.contractEndDate
      }
      contractDuration = data.contractMonths ? String(data.contractMonths) + ' ماه' : 'موقت'
    } else if (data.contractMonths && data.contractMonths > 0 && data.hireDate) {
      const start = new Date(data.hireDate)
      if (!isNaN(start.getTime())) {
        start.setMonth(start.getMonth() + data.contractMonths)
        endDate = start.toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        contractDuration = String(data.contractMonths) + ' ماه'
      }
    } else {
      endDate = 'نامحدود'
      contractDuration = 'دائم'
    }
  
    const replacements: Record<string, string> = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      position: data.positionName || data.position || 'نامشخص',
      department: data.departmentName || data.department || 'نامشخص',
      startDate: startDate,
      endDate: endDate,
      contractDuration: contractDuration,
      basicSalary: formatCurrency(data.financial?.baseSalary || 0),
      housingAllowance: formatCurrency(data.financial?.housingAllowance || 0),
      transportationAllowance: formatCurrency(data.financial?.workAllowance || 0),
      mealAllowance: formatCurrency(data.financial?.otherAllowances || 0),
      totalSalary: formatCurrency(
        (data.financial?.baseSalary || 0) + 
        (data.financial?.housingAllowance || 0) + 
        (data.financial?.workAllowance || 0) + 
        (data.financial?.otherAllowances || 0)
      ),
    }
  
    // جایگزینی متغیرها
    Object.entries(replacements).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
  
    return result
  }

  // ============================================
  // Preview Contract
  // ============================================

  const previewText = useMemo(() => {
    if (!selectedEmployee) return 'لطفاً ابتدا یک کارمند انتخاب کنید.'
    const template = getContractTemplate(selectedEmployee)
    return replaceVariables(template, selectedEmployee)
  }, [selectedEmployee, contractText, getContractTemplate, replaceVariables])  

  // ============================================
  // Save Contract
  // ============================================

  const handleSave = async () => {
    if (!selectedEmployee) {
      toast.error('لطفاً ابتدا یک کارمند انتخاب کنید.')
      return
    }
    const hasActiveContract = contracts.some(c => c.employeeId === selectedEmployee.id && c.status === 'active')
    if (hasActiveContract) {
      toast.error('این کارمند قبلاً قرارداد فعال دارد!')
      return
    }
    setIsSaving(true)

    try {
      const contentToSave = contractText
      let endDate = null
      let contractDuration = 'دائم'
      
      if (selectedEmployee.contractEndDate) {
        const date = new Date(selectedEmployee.contractEndDate)
        if (!isNaN(date.getTime())) {
          endDate = toShamsi(date)
        } else {
          endDate = selectedEmployee.contractEndDate
        }
        contractDuration = selectedEmployee.contractMonths ? String(selectedEmployee.contractMonths) + ' ماه' : 'موقت'
      } else if (selectedEmployee.contractMonths && selectedEmployee.contractMonths > 0 && selectedEmployee.hireDate) {
        const start = new Date(selectedEmployee.hireDate)
        if (!isNaN(start.getTime())) {
          start.setMonth(start.getMonth() + selectedEmployee.contractMonths)
          endDate = toShamsi(start)
          contractDuration = String(selectedEmployee.contractMonths) + ' ماه'
        }
      } else {
        endDate = null
        contractDuration = 'دائم'
      }
      
      const payload = {
        employeeId: selectedEmployee.id,
        title: `قرارداد کاری ${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        contractNumber: `C-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        type: selectedEmployee.contractType === 'permanent' || selectedEmployee.contractType === 'official' ? 'official' : 'temporary',
        status: 'active',
        startDate: selectedEmployee.hireDate ? toShamsi(new Date(selectedEmployee.hireDate)) : '1404/01/01',
        endDate: endDate,
        content: contentToSave,
        variables: {
          firstName: selectedEmployee.firstName,
          lastName: selectedEmployee.lastName,
          position: selectedEmployee.positionName || selectedEmployee.position,
          department: selectedEmployee.departmentName || selectedEmployee.department,
          basicSalary: selectedEmployee.financial?.baseSalary || 0,
    housingAllowance: selectedEmployee.financial?.housingAllowance || 0,
    transportationAllowance: selectedEmployee.financial?.workAllowance || 0,
    mealAllowance: selectedEmployee.financial?.otherAllowances || 0,
        }
      }

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowSuccess(true)
        toast.success('قرارداد با موفقیت ذخیره شد')
        await fetchContracts()
        await fetchEmployees()
        const template = getContractTemplate(selectedEmployee)
        const filledText = replaceVariables(template, selectedEmployee)
        setContractText(filledText)
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        const err = await res.json()
        toast.error(err.error || 'خطا در ذخیره قرارداد')
      }
    } catch (error) {
      console.error('Error saving contract:', error)
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setIsSaving(false)
    }
  }
  const handleEditContract = (contract: Contract) => {
    const employee = employees.find(e => e.id === contract.employeeId)
    if (employee) {
      setSelectedEmployee(employee)
      const template = getContractTemplate(employee)
      const filledText = replaceVariables(template, employee)
      setContractText(filledText)
      toast.info('در حال ویرایش قرارداد...')
    }
  }


  // ============================================
  // Reset
  // ============================================

  const handleReset = () => {
    setSelectedEmployee(null)
    setContractText(TEMPORARY_CONTRACT_TEMPLATE)
    setSearchTerm('')
    setShowPreview(false)
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            ایجاد و ویرایش قرارداد
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mt-0.5">
            انتخاب کارمند، ویرایش متن قرارداد و ذخیره نهایی
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!selectedEmployee || isSaving}
          className="w-full sm:w-auto gap-2 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/10 text-white text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>در حال ذخیره...</span>
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>ذخیره قرارداد</span>
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <StatsCard 
          title="کل قراردادها" 
          value={contracts.length} 
          icon={FileText}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatsCard 
          title="فعال" 
          value={contracts.filter(c => c.status === 'active').length} 
          icon={CheckCircle}
          color="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatsCard 
          title="دائم" 
          value={contracts.filter(c => c.type === 'official' && c.status === 'active').length} 
          icon={CheckCircle}
          color="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatsCard 
          title="موقت" 
          value={contracts.filter(c => c.type === 'temporary' && c.status === 'active').length} 
          icon={AlertCircle}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-50 dark:bg-amber-950/30"
        />
      </div>

      {/* Contract Table */}
      
<ContractTable
  contracts={contracts}
  employees={employees}
  onEdit={handleEditContract}
  onRefresh={async () => {
    await fetchContracts()
    await fetchEmployees()
  }}
  page={page}
  totalPages={totalPages}
  onPageChange={(newPage) => {
    setPage(newPage)
    // اگه میخوای اسکرول بره بالا
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }}
/>

<ContractEditor
  selectedEmployee={selectedEmployee}
  contractText={contractText}           // ← مقدار فعلی
  setContractText={setContractText}     // ← تابع تغییر (برای ویرایش)
  isSaving={isSaving}
  onSave={handleSave}
  onReset={handleReset}
  getContractTemplate={getContractTemplate}
  replaceVariables={replaceVariables}
  employees={employees}
  loading={loading}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  availableEmployees={availableEmployees}
  setSelectedEmployee={setSelectedEmployee}
/>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="rounded-2xl text-center max-w-sm sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
              قرارداد با موفقیت ذخیره شد
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-300">
              قرارداد برای کارمند مورد نظر ثبت شده و در لیست قراردادها قابل مشاهده است.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => setShowSuccess(false)}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
            >
              متوجه شدم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
