'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Loader2, BookOpen, Shield, Briefcase, Heart, Star } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Separator } from '@/core/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import type { Training } from '../index'
import { STATUS_MAP, CATEGORY_MAP } from '../constants'

// ============================================
// Course Form Dialog
// ============================================

export interface CourseFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  initialData?: Training | null
}

export function CourseFormDialog({
  open, onClose, onSubmit, initialData,
}: CourseFormDialogProps) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    title: '', instructor: '', startDate: '', endDate: '', location: '',
    status: 'planned', description: '', capacity: '', category: '', duration: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        instructor: initialData.instructor || '',
        startDate: initialData.startDate,
        endDate: initialData.endDate || '',
        location: initialData.location || '',
        status: initialData.status,
        description: initialData.description || '',
        capacity: initialData.capacity?.toString() || '',
        category: initialData.category || '',
        duration: initialData.duration?.toString() || '',
      })
    } else {
      setForm({ title: '', instructor: '', startDate: '', endDate: '', location: '', status: 'planned', description: '', capacity: '', category: '', duration: '' })
    }
  }, [open, initialData])

  const handleSubmit = async () => {
    if (!form.title || !form.startDate) return
    setSaving(true)
    try {
      await onSubmit({
        ...form,
        instructor: form.instructor || null,
        endDate: form.endDate || null,
        location: form.location || null,
        description: form.description || null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        category: form.category || null,
        duration: form.duration ? parseInt(form.duration) : null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            {isEdit ? 'ویرایش دوره آموزشی' : 'افزودن دوره آموزشی جدید'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات دوره را بروزرسانی کنید' : 'دوره آموزشی جدید را ثبت کنید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* اطلاعات پایه */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              اطلاعات پایه
            </h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>عنوان دوره *</Label>
                <Input placeholder="مثلاً: دوره آموزش پایتون" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>مدرس</Label>
                  <Input placeholder="نام مدرس" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>محل برگزاری</Label>
                  <Input placeholder="مکان دوره" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* زمان و ظرفیت */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              زمان و ظرفیت
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاریخ شروع *</Label>
                <Input placeholder="1404/01/01" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>تاریخ پایان</Label>
                <Input placeholder="1404/01/15" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>ظرفیت (نفر)</Label>
                <Input type="number" placeholder="مثلاً: ۲۰" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>مدت دوره (ساعت)</Label>
                <Input type="number" placeholder="مثلاً: ۴۰" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} dir="ltr" />
              </div>
            </div>
          </div>

          <Separator />

          {/* دسته‌بندی و وضعیت */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              دسته‌بندی و وضعیت
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>دسته‌بندی</Label>
                <Select value={form.category || '_none'} onValueChange={v => setForm({ ...form, category: v === '_none' ? '' : v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">بدون دسته‌بندی</SelectItem>
                    {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* توضیحات */}
          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Textarea placeholder="توضیحات اختیاری درباره دوره..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.title || !form.startDate} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
            {saving ? 'در حال ذخیره...' : isEdit ? 'بروزرسانی' : 'ذخیره'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
