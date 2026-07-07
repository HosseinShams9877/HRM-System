// src/modules/recruitment/components/PositionFormDialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
import { STATUS_MAP } from './recruitment-module'

interface Recruitment {
  id: string
  title: string
  department: string | null
  position: string | null
  status: string
  applicants: number
  createdAt: string
  updatedAt: string
}

export function PositionFormDialog({
  open, onClose, onSubmit, initialData,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  initialData?: Recruitment | null
}) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    title: '', department: '', position: '', status: 'open', applicants: '0',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          title: initialData.title,
          department: initialData.department || '',
          position: initialData.position || '',
          status: initialData.status,
          applicants: initialData.applicants.toString(),
        })
      } else {
        setForm({ title: '', department: '', position: '', status: 'open', applicants: '0' })
      }
    }
  }, [open, initialData])

  const handleSubmit = async () => {
    if (!form.title) return
    setSaving(true)
    try {
      await onSubmit({
        title: form.title,
        department: form.department || null,
        position: form.position || null,
        status: form.status,
        applicants: parseInt(form.applicants) || 0,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            {isEdit ? 'ویرایش موقعیت شغلی' : 'افزودن موقعیت شغلی جدید'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات موقعیت را بروزرسانی کنید' : 'موقعیت شغلی جدید را ثبت کنید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              اطلاعات پایه
            </h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>عنوان موقعیت *</Label>
                <Input
                  placeholder="مثلاً: توسعه‌دهنده ارشد فرانت‌اند"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>دپارتمان</Label>
                  <Input
                    placeholder="مثلاً: فناوری اطلاعات"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>سمت</Label>
                  <Input
                    placeholder="مثلاً: ارشد"
                    value={form.position}
                    onChange={e => setForm({ ...form, position: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              وضعیت و متقاضیان
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${val.dotColor}`} />
                          {val.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تعداد متقاضی</Label>
                <Input
                  type="number"
                  placeholder="۰"
                  value={form.applicants}
                  onChange={e => setForm({ ...form, applicants: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.title} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {saving ? 'در حال ذخیره...' : isEdit ? 'بروزرسانی' : 'ذخیره'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}