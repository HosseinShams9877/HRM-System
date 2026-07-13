// src/modules/recruitment/components/dialogs/offer-dialog.tsx

'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'
import { toast } from 'sonner'

interface OfferDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  applications: any[]
  selectedApplication?: any
  submitting?: boolean
}

export function OfferDialog({ open, onClose, onSubmit, applications, submitting = false }: OfferDialogProps) {
  const [form, setForm] = useState({
    applicationId: '',
    employmentType: 'full_time',
    baseSalary: '',
    startDate: null as Date | null,
    workLocation: 'onsite',
    notes: '',
  })

  useEffect(() => {
    if (!open) {
      setForm({
        applicationId: '',
        employmentType: 'full_time',
        baseSalary: '',
        startDate: null,
        workLocation: 'onsite',
        notes: '',
      })
    }
  }, [open])

  const handleSubmit = () => {
    if (!form.applicationId) {
      toast.error('لطفاً کاندیدا را انتخاب کنید')
      return
    }
    if (!form.baseSalary) {
      toast.error('لطفاً حقوق پیشنهادی را وارد کنید')
      return
    }
    if (!form.startDate) {
      toast.error('لطفاً تاریخ شروع را انتخاب کنید')
      return
    }
    onSubmit(form)
  }

  // فقط کاندیداهایی که در مرحله offer هستن
  const availableApplications = applications.filter(
    (app) => app.currentStage === 'offer'
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            پیشنهاد شغلی جدید
          </DialogTitle>
          <DialogDescription>
            اطلاعات پیشنهاد شغلی را وارد کنید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>کاندیدا <span className="text-red-500">*</span></Label>
            <Select value={form.applicationId} onValueChange={(v) => setForm({ ...form, applicationId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کاندیدا..." />
              </SelectTrigger>
              <SelectContent>
                {availableApplications.length === 0 ? (
                  <div className="px-2 py-4 text-center text-gray-500 text-sm">
                    کاندیدایی در مرحله پیشنهاد وجود ندارد
                  </div>
                ) : (
                  availableApplications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.candidate?.firstName} {app.candidate?.lastName} - {app.job?.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>نوع همکاری <span className="text-red-500">*</span></Label>
            <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">تمام وقت</SelectItem>
                <SelectItem value="part_time">پاره وقت</SelectItem>
                <SelectItem value="contract">قراردادی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
  <Label>حقوق پایه (ریال) <span className="text-red-500">*</span></Label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ریال</span>
    <Input
      type="number"
      value={form.baseSalary}
      onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
      className="pl-16"
      placeholder="مثلاً: ۵۰,۰۰۰,۰۰۰"
      dir="ltr"
    />
  </div>
</div>
          <div className="space-y-2">
            <Label>تاریخ شروع <span className="text-red-500">*</span></Label>
            <PersianDatePicker
              value={form.startDate}
              onChange={(date) => setForm({ ...form, startDate: date })}
            />
          </div>

          <div className="space-y-2">
            <Label>نوع حضور</Label>
            <Select value={form.workLocation} onValueChange={(v) => setForm({ ...form, workLocation: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onsite">حضوری</SelectItem>
                <SelectItem value="remote">دورکاری</SelectItem>
                <SelectItem value="hybrid">ترکیبی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="توضیحات اضافی..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !form.applicationId || !form.baseSalary || !form.startDate}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {submitting ? 'در حال ذخیره...' : 'ایجاد پیشنهاد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}