'use client'

import { useState } from 'react'
import { Briefcase } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Textarea } from '@/core/components/ui/textarea'
import { Separator } from '@/core/components/ui/separator'
import { JOB_GRADES, LEVELS } from '../constants'
import type { Department, Position } from '../index'

// ============================================
// Position Form Dialog
// ============================================

function getInitialFormState(position: Position | null) {
  if (position) {
    return {
      title: position.title || '',
      code: position.code || '',
      level: position.level || '',
      departmentId: position.departmentId || '',
      jobGrade: position.jobGrade || '',
      minSalary: position.minSalary?.toString() || '',
      maxSalary: position.maxSalary?.toString() || '',
      description: position.description || '',
      requirements: position.requirements || '',
      headcount: position.headcount?.toString() || '1',
      status: position.status || 'active',
    }
  }
  return {
    title: '', code: '', level: '', departmentId: '',
    jobGrade: '', minSalary: '', maxSalary: '',
    description: '', requirements: '', headcount: '1', status: 'active',
  }
}

export function PositionFormDialog({
  open,
  onClose,
  onSubmit,
  position,
  departments,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  position: Position | null
  departments: Department[]
}) {
  const [form, setForm] = useState(() => getInitialFormState(position))

  // Reset form when dialog opens with new position data
  const [prevKey, setPrevKey] = useState<string>('')
  const currentKey = `${open}-${position?.id ?? 'new'}`
  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setForm(getInitialFormState(position))
  }

  const handleSubmit = () => {
    if (!form.title || !form.code) return
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            {position ? 'ویرایش پست سازمانی' : 'ثبت پست سازمانی جدید'}
          </DialogTitle>
          <DialogDescription>
            {position ? 'اطلاعات پست سازمانی را ویرایش کنید' : 'اطلاعات پست سازمانی جدید را وارد کنید'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* اطلاعات اصلی */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              اطلاعات اصلی
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان پست *</Label>
                <Input
                  id="title"
                  placeholder="مثال: مدیر فروش"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">کد پست *</Label>
                <Input
                  id="code"
                  placeholder="مثال: POS-001"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>سطح</Label>
                <Select value={form.level || 'none'} onValueChange={(v) => setForm({ ...form, level: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب سطح" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون سطح</SelectItem>
                    {LEVELS.map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>گروه شغلی</Label>
                <Select value={form.jobGrade || 'none'} onValueChange={(v) => setForm({ ...form, jobGrade: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب گروه شغلی" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون گروه</SelectItem>
                    {JOB_GRADES.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>دپارتمان</Label>
                <Select value={form.departmentId || 'none'} onValueChange={(v) => setForm({ ...form, departmentId: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب دپارتمان" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون دپارتمان</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب وضعیت" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="inactive">غیرفعال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* حقوق و ظرفیت */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-sky-500 rounded-full" />
              حقوق و ظرفیت
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minSalary">حداقل حقوق (تومان)</Label>
                <Input
                  id="minSalary"
                  type="number"
                  placeholder="مثال: 15000000"
                  value={form.minSalary}
                  onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSalary">حداکثر حقوق (تومان)</Label>
                <Input
                  id="maxSalary"
                  type="number"
                  placeholder="مثال: 35000000"
                  value={form.maxSalary}
                  onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headcount">تعداد نیروی مجاز</Label>
                <Input
                  id="headcount"
                  type="number"
                  min="1"
                  value={form.headcount}
                  onChange={(e) => setForm({ ...form, headcount: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* شرح شغل */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
              شرح شغل و الزامات
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">شرح شغل</Label>
                <Textarea
                  id="description"
                  placeholder="توضیحات و شرح وظایف این پست..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">الزامات (مهارت‌ها، مدارک و...)</Label>
                <Textarea
                  id="requirements"
                  placeholder="الزامات و شرایط احراز این پست..."
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!form.title || !form.code} className="gap-2">
            <Briefcase className="w-4 h-4" />
            {position ? 'بروزرسانی' : 'ثبت پست'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
