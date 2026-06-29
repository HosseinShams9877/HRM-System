// src/modules/orders/components/OrderDialogs/edit-order-dialog.tsx
'use client'

import React, { useState, useEffect } from 'react'
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
import { Edit, Loader2, Check, Upload } from 'lucide-react'

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
    status: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
        status: order.status
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
      status: ''
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            ویرایش حکم
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
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

          <div className="space-y-2">
            <Label>عنوان حکم *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="عنوان حکم"
            />
          </div>

          <div className="space-y-2">
            <Label>شماره حکم *</Label>
            <Input
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              placeholder="شماره حکم"
            />
          </div>

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

          <div className="space-y-2">
            <Label>توضیحات</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg min-h-[80px]"
              placeholder="توضیحات اضافی..."
            />
          </div>

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