'use client'

import { useState, useEffect, useMemo } from 'react'
import { ContractTable } from './contract-table'
import {
  FileText,  Save, 
 CheckCircle2
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { PERMANENT_CONTRACT_TEMPLATE, TEMPORARY_CONTRACT_TEMPLATE } from '../lib/contract-templates'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription
} from '@/core/components/ui/dialog'
import { toast } from 'sonner'
import { toShamsi, toPersianDigits,  getTodayShamsi ,formatCurrency } from '@/core/lib/utils-fa'
import { ContractEditor } from './contract-editor'
import { Employee , Contract } from '../types/types'
import { StatisticsTab } from './statistics-tab'

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
  const getDaysRemaining = (endDate: string | null): number => {
    if (!endDate) return Infinity
    try {
      const [ey, em, ed] = endDate.split('/').map(Number)
      const today = getTodayShamsi()
      const endTotal = (ey * 365) + (em * 31) + ed
      const nowTotal = (today.year * 365) + (today.month * 31) + today.day
      return endTotal - nowTotal
    } catch {
      return Infinity
    }
  }
  
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    expiringSoon: contracts.filter(c => {
      if (c.status !== 'active' || !c.endDate) return false
      const daysLeft = getDaysRemaining(c.endDate)
      return daysLeft >= 0 && daysLeft <= 30
    }).length,
    expired: contracts.filter(c => c.status === 'expired').length,
    terminated: contracts.filter(c => c.status === 'terminated').length,
    draft: contracts.filter(c => c.status === 'draft').length,
  }

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
                contractType = emp.contractType || null 
              }
              if (emp.hireDate && contractMonths && contractMonths > 0) {
                const startParts = emp.hireDate.split('/')
                if (startParts.length === 3) {
                  const year = parseInt(startParts[0])
                  const month = parseInt(startParts[1])
                  const day = parseInt(startParts[2])
                  
                  let endYear = year
                  let endMonth = month + contractMonths
                  let endDay = day
                  
                  while (endMonth > 12) {
                    endMonth -= 12
                    endYear += 1
                  }
                  
                  const daysInMonth = (y: number, m: number) => {
                    if (m <= 6) return 31
                    if (m <= 11) return 30
                    const isLeap = (y % 33 === 1 || y % 33 === 5 || y % 33 === 9 || y % 33 === 13 || y % 33 === 17 || y % 33 === 21 || y % 33 === 25 || y % 33 === 29)
                    return isLeap ? 30 : 29
                  }
                  
                  const maxDay = daysInMonth(endYear, endMonth)
                  if (endDay > maxDay) endDay = maxDay
                  
                  contractEndDate = `${endYear}/${String(endMonth).padStart(2, '0')}/${String(endDay).padStart(2, '0')}`
                }
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
    let birthDate = 'تاریخ تولد'
    if (data.birthDate) {
      const date = new Date(data.birthDate)
      if (!isNaN(date.getTime())) {
        birthDate = date.toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } else {
        birthDate = data.birthDate
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
      birthDate: birthDate,
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
    
    setIsSaving(true)
  
    try {
      const contentToSave = contractText
      let endDate = null
      let contractDuration = 'دائم'
      
      // محاسبه endDate
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
      
      // ✅ بررسی کن که آیا این قرارداد قبلاً وجود دارد (ویرایش)
      const existingContract = contracts.find(c => c.employeeId === selectedEmployee.id && c.status === 'active')
      
      // ✅ اگر در حال ویرایش هستیم، از contractNumber موجود استفاده کن
      const contractNumber = existingContract?.contractNumber || `C-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
      
      const payload = {
        employeeId: selectedEmployee.id,
        title: `قرارداد کاری ${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        contractNumber: contractNumber,
        type: selectedEmployee.contractType === 'permanent' || selectedEmployee.contractType === 'official' ? 'official' : 'temporary',
        status: 'active',
        department: selectedEmployee.departmentName || selectedEmployee.department || null,
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
        },
        amount: 
          (selectedEmployee.financial?.baseSalary || 0) +
          (selectedEmployee.financial?.housingAllowance || 0) +
          (selectedEmployee.financial?.workAllowance || 0) +
          (selectedEmployee.financial?.otherAllowances || 0),
      }
  
      // ✅ اگر قرارداد وجود دارد (ویرایش)، از PUT استفاده کن
      let url = '/api/contracts'
      let method = 'POST'
      
      if (existingContract) {
        url = `/api/contracts/${existingContract.id}`
        method = 'PUT'
      }
  
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
  
      if (res.ok) {
        toast.success(existingContract ? 'قرارداد با موفقیت ویرایش شد' : 'قرارداد با موفقیت ذخیره شد')
        setShowSuccess(true)
        await fetchContracts()
        await fetchEmployees()
        // ریست کردن فرم
        setSelectedEmployee(null)
        setContractText(TEMPORARY_CONTRACT_TEMPLATE)
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
  const handleEditContract = async (contract: Contract) => {
    // فقط قراردادهای فعال قابل ویرایش هستند
    if (contract.status !== 'active') {
      toast.warning('فقط قراردادهای فعال قابل ویرایش هستند')
      return
    }
  
    const employee = employees.find(e => e.id === contract.employeeId)
    if (!employee) {
      toast.error('کارمند یافت نشد')
      return
    }
  
    setSelectedEmployee(employee)
    
    // ✅ متن قرارداد را از دیتابیس بارگذاری کن
    try {
      const res = await fetch(`/api/contracts/${contract.id}`)
      if (res.ok) {
        const data = await res.json()
        const contractData = data.data || data
        
        
        // اگر قرارداد متن ذخیره شده دارد، آن را نمایش بده
        if (contractData.content) {
          setContractText(contractData.content)
          // همچنین متغیرهای قرارداد رو هم آپدیت کن
          if (contractData.variables) {
            // می‌تونی متغیرها رو هم در صورت نیاز به state اضافه کنی
          }
        } else {
          // اگر متن ذخیره نشده، از قالب استفاده کن
          const template = getContractTemplate(employee)
          setContractText(replaceVariables(template, employee))
        }
        
        toast.info('در حال ویرایش قرارداد...')
      } else {
        toast.error('خطا در دریافت متن قرارداد')
      }
    } catch (error) {
      console.error('Error fetching contract content:', error)
      toast.error('خطا در ارتباط با سرور')
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
      <StatisticsTab stats={stats} />

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
