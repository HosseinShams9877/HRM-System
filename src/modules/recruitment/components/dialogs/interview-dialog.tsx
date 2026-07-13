// src/modules/recruitment/components/dialogs/interview-dialog.tsx

'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Video, Loader2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'
import { toast } from 'sonner'

interface InterviewDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  applications: any[]
  submitting?: boolean
}

export function InterviewDialog({ open, onClose, onSubmit, applications, submitting = false }: InterviewDialogProps) {
  const [form, setForm] = useState({
    applicationId: '',
    type: 'in_person',
    scheduledAt: null as Date | null,
    duration: 60,
    location: '',
    link: '',
    notes: '',
  })

  useEffect(() => {
    if (!open) {
      setForm({
        applicationId: '',
        type: 'in_person',
        scheduledAt: null,
        duration: 60,
        location: '',
        link: '',
        notes: '',
      })
    }
  }, [open])

  const handleSubmit = () => {
    if (!form.applicationId) {
      toast.error('لطفاً کاندیدا را انتخاب کنید')
      return
    }
    if (!form.scheduledAt) {
      toast.error('لطفاً تاریخ و زمان مصاحبه را انتخاب کنید')
      return
    }
    onSubmit(form)
  }

  // فقط کاندیداهایی که در مرحله مصاحبه هستن یا قبلاً مصاحبه نداشتن
  const availableApplications = applications.filter(
    (app) => app.currentStage === 'interview' || app.currentStage === 'screening'
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            زمان‌بندی مصاحبه
          </DialogTitle>
          <DialogDescription>
            زمان و مکان مصاحبه را مشخص کنید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* انتخاب کاندیدا */}
          <div className="space-y-2">
            <Label>کاندیدا <span className="text-red-500">*</span></Label>
            <Select 
              value={form.applicationId} 
              onValueChange={(v) => setForm({ ...form, applicationId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کاندیدا..." />
              </SelectTrigger>
              <SelectContent>
                {availableApplications.length === 0 ? (
                  <div className="px-2 py-4 text-center text-gray-500 text-sm">
                    کاندیدایی در مرحله مصاحبه وجود ندارد
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

          {/* نوع مصاحبه */}
          <div className="space-y-2">
            <Label>نوع مصاحبه <span className="text-red-500">*</span></Label>
            <Select 
              value={form.type} 
              onValueChange={(v) => setForm({ ...form, type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">حضوری</SelectItem>
                <SelectItem value="video">آنلاین (ویدئو)</SelectItem>
                <SelectItem value="phone">تلفنی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* تاریخ و زمان */}
          <div className="space-y-2">
            <Label>تاریخ و زمان <span className="text-red-500">*</span></Label>
            <PersianDatePicker
              value={form.scheduledAt}
              onChange={(date) => setForm({ ...form, scheduledAt: date })}
              placeholder="انتخاب تاریخ و زمان"
            />
          </div>

          {/* مدت زمان */}
          <div className="space-y-2">
            <Label>مدت زمان (دقیقه)</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <Input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 30 })}
                min="15"
                max="180"
                className="w-24"
              />
              <span className="text-sm text-gray-500">دقیقه</span>
            </div>
          </div>

          {/* مکان یا لینک */}
          {form.type === 'in_person' && (
            <div className="space-y-2">
              <Label>مکان <span className="text-red-500">*</span></Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="آدرس محل مصاحبه"
                />
              </div>
            </div>
          )}

          {(form.type === 'video' || form.type === 'phone') && (
            <div className="space-y-2">
              <Label>لینک جلسه</Label>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-gray-400" />
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            </div>
          )}

          {/* توضیحات */}
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
            disabled={submitting || !form.applicationId || !form.scheduledAt}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
            {submitting ? 'در حال ذخیره...' : 'زمان‌بندی مصاحبه'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}