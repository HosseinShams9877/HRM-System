// src/modules/orders/components/OrderDialogs/edit-order-dialog.tsx
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
import { toast } from 'sonner'
import { Edit, Loader2, Check, Upload, Info } from 'lucide-react'

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

// انواع حکمی که نیاز به اطلاعات شغلی/حقوقی جدید دارن
const CHANGE_ORDER_TYPES = ['salary_increase', 'position_change', 'department_change', 'promotion', 'transfer']

interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  department?: string
  position?: string
}

interface OrderRecord {
  id: string
  orderType: string
  employeeId: string
  title: string
  orderNumber: string
  issueDate: string
  effectiveDate: string
  description?: string
  status: string
  newPosition?: string
  newDepartment?: string
  baseSalary?: number
  housingAllowance?: number
  foodAllowance?: number
  attractionAllowance?: number
  responsibilityAllowance?: number
  otherAllowances?: number
  fixedDeductions?: number
}

interface EditOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderRecord | null
  employees: Employee[]
  onSubmit: (data: FormData) => Promise<void>
  submitting: boolean
}

export function EditOrderDialog({ open, onOpenChange, order, employees, onSubmit, submitting }: EditOrderDialogProps) {
  const [formData, setFormData] = useState({
    orderType: '',
    employeeId: '',
    title: '',
    orderNumber: '',
    issueDate: '',
    effectiveDate: '',
    description: '',
    status: '',
    newPosition: '',
    newDepartment: '',
    baseSalary: '',
    housingAllowance: '',
    foodAllowance: '',
    attractionAllowance: '',
    responsibilityAllowance: '',
    otherAllowances: '',
    fixedDeductions: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // تشخیص اینکه آیا نوع حکم نیاز به اطلاعات شغلی/حقوقی جدید داره
  const showJobInfoFields = useMemo(() => {
    return CHANGE_ORDER_TYPES.includes(formData.orderType)
  }, [formData.orderType])

  // تشخیص اینکه آیا حکم استخدام هست
  const isEmployment = formData.orderType === 'employment'

  useEffect(() => {
    if (order) {
      setFormData({
        orderType: order.orderType,
        employeeId: order.employeeId,
        title: order.title,
        orderNumber: order.orderNumber,
        issueDate: order.issueDate,
        effectiveDate: order.effectiveDate,
        description: order.description || '',
        status: order.status,
        newPosition: order.newPosition || '',
        newDepartment: order.newDepartment || '',
        baseSalary: order.baseSalary?.toString() || '',
        housingAllowance: order.housingAllowance?.toString() || '',
        foodAllowance: order.foodAllowance?.toString() || '',
        attractionAllowance: order.attractionAllowance?.toString() || '',
        responsibilityAllowance: order.responsibilityAllowance?.toString() || '',
        otherAllowances: order.otherAllowances?.toString() || '',
        fixedDeductions: order.fixedDeductions?.toString() || '',
      })
    }
  }, [order])

  const resetForm = () => {
    setFormData({
      orderType: '',
      employeeId: '',
      title: '',
      orderNumber: '',
      issueDate: '',
      effectiveDate: '',
      description: '',
      status: '',
      newPosition: '',
      newDepartment: '',
      baseSalary: '',
      housingAllowance: '',
      foodAllowance: '',
      attractionAllowance: '',
      responsibilityAllowance: '',
      otherAllowances: '',
      fixedDeductions: '',
    })
    setSelectedFile(null)
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            ویرایش حکم
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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

          {/* کارمند */}
          <div className="space-y-2">
            <Label>کارمند *</Label>
            <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کارمند" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.personnelCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* عنوان حکم */}
          <div className="space-y-2">
            <Label>عنوان حکم *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="عنوان حکم"
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
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>تاریخ اجرا *</Label>
              <Input
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
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

          {/* بخش اطلاعات شغلی و حقوقی - شرطی */}
          {isEmployment && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
              <Info className="h-4 w-4 inline ml-1" />
              اطلاعات شغلی و حقوقی از اطلاعات ثبت‌شده کارمند و قرارداد به‌صورت خودکار اعمال می‌شود.
            </div>
          )}

          {showJobInfoFields && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <Label className="font-bold text-emerald-700 block mb-3">اطلاعات شغلی جدید</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>سمت جدید</Label>
                    <Input
                      value={formData.newPosition || ''}
                      onChange={(e) => setFormData({ ...formData, newPosition: e.target.value })}
                      placeholder="سمت جدید"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>دپارتمان جدید</Label>
                    <Input
                      value={formData.newDepartment || ''}
                      onChange={(e) => setFormData({ ...formData, newDepartment: e.target.value })}
                      placeholder="دپارتمان جدید"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <Label className="font-bold text-emerald-700 block mb-3">اطلاعات حقوقی جدید</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>حقوق پایه</Label>
                    <Input
                      type="number"
                      value={formData.baseSalary || ''}
                      onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                      placeholder="حقوق پایه جدید"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>حق مسکن</Label>
                    <Input
                      type="number"
                      value={formData.housingAllowance || ''}
                      onChange={(e) => setFormData({ ...formData, housingAllowance: e.target.value })}
                      placeholder="حق مسکن جدید"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>بن کارگری</Label>
                    <Input
                      type="number"
                      value={formData.foodAllowance || ''}
                      onChange={(e) => setFormData({ ...formData, foodAllowance: e.target.value })}
                      placeholder="بن کارگری جدید"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>حق جذب</Label>
                    <Input
                      type="number"
                      value={formData.attractionAllowance || ''}
                      onChange={(e) => setFormData({ ...formData, attractionAllowance: e.target.value })}
                      placeholder="حق جذب جدید"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>حق مسئولیت</Label>
                    <Input
                      type="number"
                      value={formData.responsibilityAllowance || ''}
                      onChange={(e) => setFormData({ ...formData, responsibilityAllowance: e.target.value })}
                      placeholder="حق مسئولیت جدید"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>سایر مزایا</Label>
                    <Input
                      type="number"
                      value={formData.otherAllowances || ''}
                      onChange={(e) => setFormData({ ...formData, otherAllowances: e.target.value })}
                      placeholder="سایر مزایا"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <Label>کسورات ثابت</Label>
                  <Input
                    type="number"
                    value={formData.fixedDeductions || ''}
                    onChange={(e) => setFormData({ ...formData, fixedDeductions: e.target.value })}
                    placeholder="کسورات ثابت"
                  />
                </div>
              </div>
            </>
          )}

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

          {/* فایل جدید */}
          <div className="space-y-2">
            <Label>فایل جدید (اختیاری)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
              <input
                type="file"
                id="file-upload-edit"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="file-upload-edit" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : 'برای تغییر فایل کلیک کنید'}
                </p>
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
            className="bg-blue-500 hover:bg-blue-600 gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            ذخیره تغییرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}