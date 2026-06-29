// src/modules/orders/components/OrderDialogs/add-order-dialog.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/core/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/core/components/ui/popover'
import { toast } from 'sonner'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import { Plus, Loader2, Check, Upload, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/core/lib/utils'

const ORDER_TYPES = [
  { value: 'employment', label: 'استخدام', icon: '📋' },
  { value: 'extension', label: 'تمدید قرارداد', icon: '📄' },
  { value: 'salary_increase', label: 'افزایش حقوق', icon: '💰' },
  { value: 'position_change', label: 'تغییر سمت', icon: '🔄' },
  { value: 'department_change', label: 'تغییر واحد', icon: '🏢' },
  { value: 'promotion', label: 'ارتقاء شغلی', icon: '⬆️' },
  { value: 'transfer', label: 'انتقال', icon: '🚚' },
  { value: 'suspension', label: 'تعلیق', icon: '⏸️' },
  { value: 'termination', label: 'پایان همکاری', icon: '🚪' },
  { value: 'other', label: 'سایر', icon: '📄' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'pending', label: 'در انتظار تأیید' },
  { value: 'approved', label: 'تأیید شده' },
  { value: 'active', label: 'فعال' },
  { value: 'cancelled', label: 'ابطال شده' },
  { value: 'replaced', label: 'جایگزین شده' },
]

interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  department?: string
  position?: string
}

interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  onSubmit: (data: FormData) => Promise<void>
  submitting: boolean
}

export function AddOrderDialog({ open, onOpenChange, employees, onSubmit, submitting }: AddOrderDialogProps) {
  const today = getTodayShamsi()
  const defaultDate = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
  
  const [formData, setFormData] = useState({
    orderType: '',
    employeeId: '',
    title: '',
    orderNumber: '',
    issueDate: '',
    effectiveDate: '',
    description: '',
    status: 'draft'
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false)

  // فیلتر کردن کارمندان بر اساس جستجو
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees
    const search = employeeSearch.toLowerCase().trim()
    return employees.filter(emp => 
      emp.firstName.toLowerCase().includes(search) ||
      emp.lastName.toLowerCase().includes(search) ||
      emp.personnelCode.toLowerCase().includes(search) ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search)
    )
  }, [employees, employeeSearch])

  // کارمند انتخاب شده
  const selectedEmployee = employees.find(e => e.id === formData.employeeId)

  const resetForm = () => {
    setFormData({
      orderType: '',
      employeeId: '',
      title: '',
      orderNumber: '',
      issueDate: '',
      effectiveDate: '',
      description: '',
      status: 'draft'
    })
    setSelectedFile(null)
    setEmployeeSearch('')
    setEmployeePopoverOpen(false)
  }

const handleSubmit = async () => {
  if (!formData.orderType || !formData.employeeId || !formData.title || 
      !formData.orderNumber || !formData.issueDate || !formData.effectiveDate) {
    toast.error('لطفاً همه فیلدهای الزامی را پر کنید')
    return
  }

  const submitData = new FormData()
  Object.entries(formData).forEach(([key, value]) => {
    if (value) submitData.append(key, value)
  })
  if (selectedFile) {
    submitData.append('file', selectedFile)
  }

  await onSubmit(submitData)
  resetForm()
}

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            افزودن حکم جدید
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* نوع حکم */}
          <div className="space-y-2">
            <Label>نوع حکم *</Label>
            <Select value={formData.orderType} onValueChange={(v) => setFormData({ ...formData, orderType: v })}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب نوع حکم" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* کارمند با جستجو */}
          <div className="space-y-2">
            <Label>کارمند *</Label>
            <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={employeePopoverOpen}
                  className="w-full justify-between h-10 font-normal"
                >
                  {selectedEmployee ? (
                    <span>
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                      <span className="text-xs text-muted-foreground mr-2">
                        ({selectedEmployee.personnelCode})
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">انتخاب کارمند...</span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput 
                    placeholder="جستجو نام، کد پرسنلی..." 
                    value={employeeSearch}
                    onValueChange={setEmployeeSearch}
                    className="h-9"
                  />
                  <CommandList className="max-h-56">
                    <CommandEmpty>کارمندی یافت نشد</CommandEmpty>
                    <CommandGroup>
                      {filteredEmployees.slice(0, 50).map((emp) => (
                        <CommandItem
                          key={emp.id}
                          value={emp.id}
                          onSelect={() => {
                            setFormData({ ...formData, employeeId: emp.id })
                            setEmployeeSearch('')
                            setEmployeePopoverOpen(false)
                          }}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <span>{emp.firstName} {emp.lastName}</span>
                            <span className="text-xs text-muted-foreground mr-2">
                              {emp.personnelCode}
                            </span>
                          </div>
                          {formData.employeeId === emp.id && (
                            <Check className="h-4 w-4 text-emerald-500" />
                          )}
                        </CommandItem>
                      ))}
                      {filteredEmployees.length > 50 && (
                        <div className="text-xs text-muted-foreground p-2 text-center border-t">
                          {filteredEmployees.length - 50} کارمند دیگر...
                        </div>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* عنوان حکم */}
          <div className="space-y-2">
            <Label>عنوان حکم *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: ارتقاء شغلی به مدیر منابع انسانی"
            />
          </div>

          {/* شماره حکم */}
          <div className="space-y-2">
            <Label>شماره حکم *</Label>
            <Input
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              placeholder="شماره حکم"
            />
          </div>

          {/* تاریخ‌ها */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاریخ صدور *</Label>
              <Input
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                placeholder={defaultDate}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>تاریخ اجرا *</Label>
              <Input
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                placeholder={defaultDate}
                dir="ltr"
              />
            </div>
          </div>

          {/* وضعیت */}
          <div className="space-y-2">
            <Label>وضعیت</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب وضعیت" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* توضیحات */}
          <div className="space-y-2">
            <Label>توضیحات</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg min-h-[80px]"
              placeholder="توضیحات اضافی..."
            />
          </div>

          {/* فایل */}
          <div className="space-y-2">
            <Label>فایل حکم</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : 'برای انتخاب فایل کلیک کنید'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (حداکثر 5MB)</p>
              </label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-emerald-500 hover:bg-emerald-600 gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            ثبت حکم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}