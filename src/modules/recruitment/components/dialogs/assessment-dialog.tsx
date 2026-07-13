// src/modules/recruitment/components/dialogs/assessment-dialog.tsx

'use client'

import { useState, useEffect } from 'react'
import { ClipboardCheck, Loader2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { toast } from 'sonner'

interface AssessmentDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  applications: any[]
  submitting?: boolean
}

export function AssessmentDialog({ open, onClose, onSubmit, applications, submitting = false }: AssessmentDialogProps) {
  const [form, setForm] = useState({
    applicationId: '',
    type: 'technical_exam',
    title: '',
    passScore: '60',
    deadline: '',
    notes: '',
  })

  useEffect(() => {
    if (!open) {
      setForm({
        applicationId: '',
        type: 'technical_exam',
        title: '',
        passScore: '60',
        deadline: '',
        notes: '',
      })
    }
  }, [open])

  const handleSubmit = () => {
    if (!form.applicationId) {
      toast.error('لطفاً کاندیدا را انتخاب کنید')
      return
    }
    if (!form.title) {
      toast.error('لطفاً عنوان ارزیابی را وارد کنید')
      return
    }
    onSubmit(form)
  }

  // فقط کاندیداهایی که در مرحله testing هستن
  const availableApplications = applications.filter(
    (app) => app.currentStage === 'testing'
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-violet-500" />
            ارزیابی جدید
          </DialogTitle>
          <DialogDescription>
            اطلاعات ارزیابی را وارد کنید
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
                    کاندیدایی در مرحله آزمون وجود ندارد
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
            <Label>نوع ارزیابی <span className="text-red-500">*</span></Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="written_test">آزمون کتبی</SelectItem>
                <SelectItem value="technical_exam">آزمون تخصصی</SelectItem>
                <SelectItem value="practical_task">تکلیف عملی</SelectItem>
                <SelectItem value="psychological">ارزیابی روانشناسی</SelectItem>
                <SelectItem value="other">سایر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>عنوان <span className="text-red-500">*</span></Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: آزمون React"
            />
          </div>

          <div className="space-y-2">
            <Label>حد نصاب (نمره قبولی)</Label>
            <Input
              type="number"
              value={form.passScore}
              onChange={(e) => setForm({ ...form, passScore: e.target.value })}
              min="0"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label>توضیحات</Label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2 border rounded-lg min-h-[60px] text-sm"
              placeholder="توضیحات اضافی..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !form.applicationId || !form.title}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
            {submitting ? 'در حال ذخیره...' : 'ایجاد ارزیابی'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}