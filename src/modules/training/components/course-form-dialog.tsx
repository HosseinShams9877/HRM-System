'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Loader2, BookOpen, Shield, Briefcase, Heart, Star, Calendar } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Separator } from '@/core/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'
import { toPersianDigits, formatShamsi, getTodayShamsi } from '@/core/lib/utils-fa'
import type { Training } from '../index'
import { STATUS_MAP, CATEGORY_MAP } from '../constants'
import moment from 'moment-jalaali'

// ============================================
// توابع تبدیل اعداد
// ============================================

const toEnglishNumber = (str: string): string => {
  const map: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  }
  return str.replace(/[۰-۹]/g, (d) => map[d] || d)
}

const toPersianNumber = (str: string): string => {
  if (!str) return ''
  const map: Record<string, string> = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
  }
  return str.replace(/\d/g, (d) => map[d] || d)
}

// ============================================
// توابع تبدیل تاریخ
// ============================================

// تبدیل تاریخ شمسی به میلادی (Date)
const toMiladi = (shamsiDate: string): Date | null => {
  if (!shamsiDate) return null
  try {
    const englishDate = toEnglishNumber(shamsiDate)
    const parts = englishDate.split('/').map(Number)
    if (parts.length !== 3) return null
    const m = moment(`${parts[0]}/${parts[1]}/${parts[2]}`, 'jYYYY/jMM/jDD')
    if (!m.isValid()) return null
    return m.toDate()
  } catch {
    return null
  }
}

// تبدیل تاریخ میلادی به شمسی (رشته)
const toShamsi = (date: Date): string => {
  if (!date) return ''
  try {
    const m = moment(date)
    const shamsiStr = m.format('jYYYY/jMM/jDD')
    return shamsiStr
  } catch {
    return ''
  }
}

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
  const today = getTodayShamsi()
  const defaultDate = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
  
  const [form, setForm] = useState({
    title: '', instructor: '', startDate: '', endDate: '', location: '',
    status: 'planned', description: '', capacity: '', category: '', duration: '', maxScore: '5', 
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
         maxScore: initialData.maxScore?.toString() || '5',
      })
    } else {
      setForm({ 
        title: '', instructor: '', startDate: defaultDate, endDate: '', location: '', 
        status: 'planned', description: '', capacity: '', category: '', duration: '' ,maxScore: '5'
      })
    }
  }, [open, initialData, defaultDate])

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
        capacity: form.capacity ? parseInt(toEnglishNumber(form.capacity)) : null,
        category: form.category || null,
        duration: form.duration ? parseInt(toEnglishNumber(form.duration)) : null,
         maxScore: parseInt(form.maxScore) || 5,
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
                <div className="relative">
                  <PersianDatePicker
                    value={form.startDate ? toMiladi(form.startDate) : new Date()}
                    onChange={(date) => {
                      if (date) {
                        const shamsiDate = toShamsi(date)
                        setForm({ ...form, startDate: shamsiDate })
                      }
                    }}
                    placeholder={toPersianNumber(defaultDate)}
                    className="w-full"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>تاریخ پایان</Label>
                <div className="relative">
                  <PersianDatePicker
                    value={form.endDate ? toMiladi(form.endDate) : undefined}
                    onChange={(date) => {
                      if (date) {
                        const shamsiDate = toShamsi(date)
                        setForm({ ...form, endDate: shamsiDate })
                      } else {
                        setForm({ ...form, endDate: '' })
                      }
                    }}
                    placeholder="۱۴۰۴/۰۱/۱۵"
                    className="w-full"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ظرفیت (نفر)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="مثلاً: ۲۰"
                  value={toPersianNumber(form.capacity)}
                  onChange={e => {
                    const englishNumber = toEnglishNumber(e.target.value)
                    const numeric = englishNumber.replace(/[^0-9]/g, '')
                    setForm({ ...form, capacity: numeric })
                  }}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>مدت دوره (ساعت)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="مثلاً: ۴۰"
                  value={toPersianNumber(form.duration)}
                  onChange={e => {
                    const englishNumber = toEnglishNumber(e.target.value)
                    const numeric = englishNumber.replace(/[^0-9]/g, '')
                    setForm({ ...form, duration: numeric })
                  }}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
  <Label>حداکثر نمره</Label>
  <Select 
    value={form.maxScore} 
    onValueChange={v => setForm({ ...form, maxScore: v })}
  >
    <SelectTrigger className="h-8">
      <SelectValue placeholder="حداکثر نمره" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="5">۵</SelectItem>
      <SelectItem value="10">۱۰</SelectItem>
      <SelectItem value="20">۲۰</SelectItem>
      <SelectItem value="50">۵۰</SelectItem>
      <SelectItem value="100">۱۰۰</SelectItem>
    </SelectContent>
  </Select>
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