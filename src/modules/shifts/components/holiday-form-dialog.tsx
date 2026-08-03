// components/Shifts/components/holiday-form-dialog.tsx

import { useState, useEffect, useMemo } from 'react'
import { CalendarOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Switch } from '@/core/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import { HolidayData } from '../types'
import { HOLIDAY_TYPES } from '../constants'

interface HolidayFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  initialData?: HolidayData | null
}

export function HolidayFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: HolidayFormDialogProps) {
  const isEdit = !!initialData

  // محاسبه مقدار پیش‌فرض برای فرم
  const defaultForm = useMemo(() => {
    if (initialData) {
      return {
        title: initialData.title,
        date: initialData.date,
        type: initialData.type,
        isRecurring: initialData.isRecurring,
        description: initialData.description || '',
      }
    }
    const today = getTodayShamsi()
    return {
      title: '',
      date: `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`,
      type: 'official',
      isRecurring: false,
      description: '',
    }
  }, [initialData]) // وابسته به initialData

  const [form, setForm] = useState(defaultForm)

  // وقتی initialData تغییر می‌کنه، فرم رو به‌روز کن
  useEffect(() => {
    setForm(defaultForm)
    // غیرفعال کردن خطای ESLint فقط برای این خط
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [defaultForm])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-red-600" />
            {isEdit ? 'ویرایش تعطیلی' : 'تعریف تعطیلی جدید'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات تعطیلی را بروزرسانی کنید' : 'تعطیلی رسمی یا توافقی ثبت کنید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>عنوان تعطیلی *</Label>
            <Input
              placeholder="مثلاً: عید فطر"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاریخ *</Label>
              <Input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                dir="ltr"
                placeholder="1405/01/01"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع تعطیلی *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOLIDAY_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.isRecurring}
              onCheckedChange={(v) => setForm({ ...form, isRecurring: v })}
            />
            <Label className="text-xs">تکرار هر سال (رسمی ماندگار)</Label>
          </div>
          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Textarea
              placeholder="توضیحات اختیاری..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button
            onClick={() => onSubmit(form)}
            disabled={!form.title || !form.date}
            className="gap-2"
          >
            <CalendarOff className="w-4 h-4" />
            {isEdit ? 'بروزرسانی' : 'ثبت تعطیلی'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}