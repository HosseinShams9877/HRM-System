'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  FileText, Search, Plus, Save, User, Building2,
  CreditCard, Calendar, Hash, Briefcase, UserCircle, Phone,
  Mail, MapPin, CheckCircle2, XCircle, Edit, Eye
} from 'lucide-react'
import { PERMANENT_CONTRACT_TEMPLATE, TEMPORARY_CONTRACT_TEMPLATE } from '../lib/contract-templates'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { toast } from 'sonner'
import { toPersianDigits, formatCurrency ,formatShamsi,convertMiladiToShamsi  } from '@/core/lib/utils-fa'

// ============================================
// Types
// ============================================

interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  positionName?: string
  position?: string
  departmentName?: string
  department?: string
  hireDate?: string
  contractMonths?: number
  contractEndDate?: string
  contractType?: string
  financial?: {
    baseSalary?: number
    housingAllowance?: number
    workAllowance?: number
    otherAllowances?: number
  } | null
  [key: string]: unknown
}

interface Contract {
  id: string
  employeeId: string
  type: string
  contractNumber: string
  title: string
  startDate: string
  endDate: string | null
  status: string
  content?: string
  variables?: {
    firstName?: string
    lastName?: string
    position?: string
    department?: string
    basicSalary?: number
    housingAllowance?: number
    transportationAllowance?: number
    mealAllowance?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface ContractEditorProps {
  selectedEmployee: Employee | null
  contractText: string
  setContractText: (text: string) => void
  isSaving: boolean
  onSave: () => void
  onReset: () => void
  getContractTemplate: (employee: Employee) => string
  replaceVariables: (text: string, data: Employee) => string
  employees: Employee[]
  loading: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  availableEmployees: Employee[]
  setSelectedEmployee: (emp: Employee | null) => void
}

// ============================================
// Main Component
// ============================================

export function ContractEditor({
  selectedEmployee,
  contractText,
  setContractText,
  isSaving,
  onSave,
  onReset,
  getContractTemplate,
  replaceVariables,
  employees,
  loading,
  searchTerm,
  setSearchTerm,
  availableEmployees,
  setSelectedEmployee
}: ContractEditorProps) {
  const [showPreview, setShowPreview] = useState(false)

  // اضافه کن بعد از const [showPreview, setShowPreview] = useState(false)
  const insertVariable = (variable: string) => {
    if (!showPreview && selectedEmployee) {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = contractText
        const before = text.substring(0, start)
        const after = text.substring(end)
        
        // دریافت مقدار واقعی متغیر از selectedEmployee
        let value = ''
        switch(variable) {
          case 'firstName': value = selectedEmployee.firstName || ''; break
          case 'lastName': value = selectedEmployee.lastName || ''; break
          case 'position': value = selectedEmployee.positionName || selectedEmployee.position || ''; break
          case 'department': value = selectedEmployee.departmentName || selectedEmployee.department || ''; break
          case 'startDate': value = selectedEmployee.hireDate ? formatShamsi(convertMiladiToShamsi(selectedEmployee.hireDate)) : ''; break
          case 'endDate': value = selectedEmployee.contractEndDate ? formatShamsi(convertMiladiToShamsi(selectedEmployee.contractEndDate)) : ''; break
          case 'basicSalary': value = selectedEmployee.financial?.baseSalary ? toPersianDigits(selectedEmployee.financial.baseSalary.toLocaleString()) : '۰'; break
          case 'housingAllowance': value = selectedEmployee.financial?.housingAllowance ? toPersianDigits(selectedEmployee.financial.housingAllowance.toLocaleString()) : '۰'; break
          case 'transportationAllowance': value = selectedEmployee.financial?.workAllowance ? toPersianDigits(selectedEmployee.financial.workAllowance.toLocaleString()) : '۰'; break
          case 'mealAllowance': value = selectedEmployee.financial?.otherAllowances ? toPersianDigits(selectedEmployee.financial.otherAllowances.toLocaleString()) : '۰'; break
          case 'birthDate': 
          value = selectedEmployee.birthDate ? formatShamsi(convertMiladiToShamsi(selectedEmployee.birthDate)) : ''
          break
          case 'totalSalary': 
            const total = (selectedEmployee.financial?.baseSalary || 0) + 
                         (selectedEmployee.financial?.housingAllowance || 0) + 
                         (selectedEmployee.financial?.workAllowance || 0) + 
                         (selectedEmployee.financial?.otherAllowances || 0)
            value = toPersianDigits(total.toLocaleString())
            break
          case 'contractDuration': value = selectedEmployee.contractMonths ? toPersianDigits(selectedEmployee.contractMonths.toString()) : '۰'; break
          default: value = `{{${variable}}}`
        
        }
        
        const newText = before + value + after
        setContractText(newText)
        
        setTimeout(() => {
          textarea.focus()
          const newCursorPos = start + value.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
      }
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!showPreview) {
      const textarea = e.target
      const cursorPos = textarea.selectionStart
      const value = textarea.value
      
      // تبدیل همه اعداد انگلیسی به فارسی
      const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
      const englishDigits = '0123456789'
      let newValue = ''
      let hasChanged = false
      for (let i = 0; i < value.length; i++) {
        const char = value[i]
        const index = englishDigits.indexOf(char)
        if (index !== -1) {
          newValue += persianDigits[index]
          hasChanged = true
        } else {
          newValue += char
        }
      }
      
      // فقط اگه تغییری کرده باشه
      if (hasChanged) {
        // مقدار textarea رو مستقیم تغییر بده (بدون رندر مجدد)
        textarea.value = newValue
        // cursor رو به همون جا برگردون
        textarea.setSelectionRange(cursorPos, cursorPos)
        // state رو به‌روز کن
        setContractText(newValue)
      } else {
        setContractText(value)
      }
    }
  }

  // Preview Text
  const previewText = useMemo(() => {
    if (!selectedEmployee) return 'لطفاً ابتدا یک کارمند انتخاب کنید.'
    const template = getContractTemplate(selectedEmployee)
    return replaceVariables(template, selectedEmployee)
  }, [selectedEmployee])  

  // Update contract text when employee changes
  useEffect(() => {
    if (selectedEmployee) {
      const template = getContractTemplate(selectedEmployee)
      const filledText = replaceVariables(template, selectedEmployee)
      setContractText(filledText)
    }
  }, [selectedEmployee])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
      {/* Left Panel: Employee Selection */}
      <div className="lg:col-span-4 space-y-4">
        <Card className="border-0 shadow-lg rounded-xl sticky top-4 bg-white dark:bg-gray-900/90 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              انتخاب کارمند
            </h3>

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-500" />
              <Input
                placeholder="جستجوی نام یا کد پرسنلی..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-emerald-500 dark:focus:ring-emerald-400"
              />
            </div>

            {/* Employee List */}
            <ScrollArea className="h-[300px] sm:h-[400px] rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <span className="text-muted-foreground dark:text-gray-400">در حال بارگذاری...</span>
                </div>
              ) : availableEmployees.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-gray-400">
                  کارمندی یافت نشد
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {availableEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`w-full text-right p-2.5 sm:p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 flex items-center gap-2.5 sm:gap-3 ${
                        selectedEmployee?.id === emp.id ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
                      }`}
                    >
                      <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[9px] sm:text-[10px] font-bold">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-right min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground dark:text-gray-400 truncate">
                          {emp.personnelCode} • {emp.positionName || emp.position || 'بدون سمت'}
                        </p>
                      </div>
                      {selectedEmployee?.id === emp.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Contract Editor */}
      <div className="lg:col-span-8 space-y-4">
        <Card className="border-0 shadow-lg rounded-xl bg-white dark:bg-gray-900/90 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Employee Info */}
            {selectedEmployee ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30 gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs sm:text-sm font-bold">
                      {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 truncate">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {toPersianDigits(selectedEmployee.personnelCode)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {selectedEmployee.positionName || selectedEmployee.position || 'نامشخص'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {selectedEmployee.departmentName || selectedEmployee.department || 'نامشخص'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="w-full sm:w-auto text-xs gap-1 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700"
                >
                  <XCircle className="w-3 h-3" />
                  تغییر کارمند
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 dark:text-gray-600 mb-2" />
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
                  لطفاً یک کارمند از لیست سمت راست انتخاب کنید
                </p>
              </div>
            )}

            {/* Template Editor */}
            {selectedEmployee && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Edit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    متن قرارداد (قابل ویرایش)
                  </Label>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Badge variant="outline" className="text-[8px] sm:text-[9px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                      متغیرها به‌صورت خودکار جایگزین می‌شوند
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-xs gap-1 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {showPreview ? <Eye className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                      {showPreview ? 'مشاهده متن' : 'پیش‌نمایش'}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                <Textarea
  value={showPreview ? previewText : contractText}
  onChange={handleInput}  
  className={`min-h-[350px] sm:min-h-[500px] font-mono
    text-xs sm:text-sm leading-relaxed rounded-xl bg-gray-50 
    dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 ${
    showPreview ? 'pointer-events-none' : ''
  }`}
  dir="rtl"
  readOnly={showPreview}
/>
                </div>

               {/* Variables Legend - قابل کلیک */}
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 sm:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">متغیرهای قابل استفاده (کلیک کنید):</span>
                      <div className="flex flex-wrap gap-1">
                      {[
  { key: 'firstName', label: 'نام' },
  { key: 'lastName', label: 'نام‌خانوادگی' },
  { key: 'position', label: 'سمت' },
  { key: 'department', label: 'دپارتمان' },
  { key: 'startDate', label: 'تاریخ شروع' },
  { key: 'endDate', label: 'تاریخ پایان' },
  { key: 'birthDate', label: 'تاریخ تولد' },
  { key: 'basicSalary', label: 'حقوق پایه' },
  { key: 'housingAllowance', label: 'مسکن' },
  { key: 'transportationAllowance', label: 'ایاب‌ذهاب' },
  { key: 'mealAllowance', label: 'وعده غذایی' },
  { key: 'totalSalary', label: 'مجموع حقوق' },
  { key: 'contractDuration', label: 'مدت قرارداد' }
].map(({ key, label }) => (
  <Badge 
    key={key} 
    variant="outline" 
    className={`text-[10px] sm:text-xs font-medium bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 ${showPreview ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={() => !showPreview && insertVariable(key)}
    title={`کلیک کنید تا ${label} در متن درج شود`}
  >
    {label}
  </Badge>
))}
                  </div>
              </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

