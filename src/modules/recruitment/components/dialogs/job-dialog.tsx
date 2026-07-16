// src/modules/recruitment/components/dialogs/job-dialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Loader2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Switch } from '@/core/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'

interface JobDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: any
  departments: any[]
  submitting?: boolean
}

export function JobDialog({ open, onClose, onSubmit, initialData, departments, submitting = false }: JobDialogProps) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    title: '',
    departmentId: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'monthly',
    employmentType: 'full-time',
    experienceMin: '',
    experienceMax: '',
    educationLevel: '',
    location: '',
    remoteWork: false,
    deadline: null as Date | null,
  })

  useEffect(() => {
    if (open && initialData) {
      setForm({
        title: initialData.title,
        departmentId: initialData.departmentId,
        description: initialData.description,
        requirements: initialData.requirements,
        responsibilities: initialData.responsibilities || '',
        benefits: initialData.benefits || '',
        salaryMin: initialData.salaryMin?.toString() || '',
        salaryMax: initialData.salaryMax?.toString() || '',
        salaryType: initialData.salaryType || 'monthly',
        employmentType: initialData.employmentType || 'full-time',
        experienceMin: initialData.experienceMin?.toString() || '',
        experienceMax: initialData.experienceMax?.toString() || '',
        educationLevel: initialData.educationLevel || '',
        location: initialData.location || '',
        remoteWork: initialData.remoteWork || false,
        deadline: initialData.deadline ? new Date(initialData.deadline) : null,
      })
    } else if (open) {
      setForm({
        title: '',
        departmentId: '',
        description: '',
        requirements: '',
        responsibilities: '',
        benefits: '',
        salaryMin: '',
        salaryMax: '',
        salaryType: 'monthly',
        employmentType: 'full-time',
        experienceMin: '',
        experienceMax: '',
        educationLevel: '',
        location: '',
        remoteWork: false,
        deadline: null,
      })
    }
  }, [open, initialData])

  const handleSubmit = () => {
    onSubmit({
      ...form,
      salaryMin: parseFloat(form.salaryMin) || 0,
      salaryMax: parseFloat(form.salaryMax) || 0,
      experienceMin: parseInt(form.experienceMin) || 0,
      experienceMax: parseInt(form.experienceMax) || 0,
      deadline: form.deadline ? form.deadline.toISOString() : null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
     <DialogContent className="max-w-2xl max-h-[85vh] w-[95vw] md:w-full p-4 md:p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            {isEdit ? 'ویرایش آگهی شغلی' : 'ثبت آگهی شغلی جدید'}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-right">
            اطلاعات آگهی شغلی را وارد کنید
          </DialogDescription>
        </DialogHeader>

        
          <div className="space-y-4 md:space-y-5 py-2">
            {/* بخش اطلاعات پایه */}
            <div>
              <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300 justify-end">
                <span>اطلاعات پایه</span>
                <div className="w-1 h-3 md:h-4 rounded-full bg-emerald-500" />
              </h4>
              <div className="space-y-3 md:space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">عنوان شغل <span className="text-red-500">*</span></Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="مثلاً: توسعه‌دهنده فرانت‌اند"
                    className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">واحد سازمانی <span className="text-red-500">*</span></Label>
                    <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                      <SelectTrigger className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right">
                        <SelectValue placeholder="انتخاب واحد" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id} className="text-gray-900 dark:text-white text-right">{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">نوع استخدام</Label>
                    <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v })}>
                      <SelectTrigger className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="full-time" className="text-gray-900 dark:text-white text-right">تمام وقت</SelectItem>
                        <SelectItem value="part-time" className="text-gray-900 dark:text-white text-right">پاره وقت</SelectItem>
                        <SelectItem value="contract" className="text-gray-900 dark:text-white text-right">قراردادی</SelectItem>
                        <SelectItem value="internship" className="text-gray-900 dark:text-white text-right">کارآموزی</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* بخش شرح و الزامات */}
            <div>
              <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300 justify-end">
                <span>شرح و الزامات</span>
                <div className="w-1 h-3 md:h-4 rounded-full bg-blue-500" />
              </h4>
              <div className="space-y-3 md:space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">توضیحات شغل <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="شرح وظایف و مسئولیت‌ها"
                    className="text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">الزامات</Label>
                  <Textarea
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    rows={2}
                    placeholder="مهارت‌ها و شرایط لازم"
                    className="text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">مسئولیت‌ها</Label>
                    <Textarea
                      value={form.responsibilities}
                      onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                      rows={2}
                      placeholder="مسئولیت‌ها"
                      className="text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">مزایا</Label>
                    <Textarea
                      value={form.benefits}
                      onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                      rows={2}
                      placeholder="مزایا"
                      className="text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* بخش حقوق و شرایط */}
            <div>
              <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300 justify-end">
                <span>حقوق و شرایط</span>
                <div className="w-1 h-3 md:h-4 rounded-full bg-amber-500" />
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">حداقل حقوق (ریال)</Label>
                  <Input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                    className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                    placeholder="۰"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">حداکثر حقوق (ریال)</Label>
                  <Input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                    className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                    placeholder="۰"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">نوع حقوق</Label>
                  <Select value={form.salaryType} onValueChange={(v) => setForm({ ...form, salaryType: v })}>
                    <SelectTrigger className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="monthly" className="text-gray-900 dark:text-white text-right">ماهانه</SelectItem>
                      <SelectItem value="yearly" className="text-gray-900 dark:text-white text-right">سالانه</SelectItem>
                      <SelectItem value="hourly" className="text-gray-900 dark:text-white text-right">ساعتی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">سطح تحصیلات</Label>
                  <Select value={form.educationLevel} onValueChange={(v) => setForm({ ...form, educationLevel: v })}>
                    <SelectTrigger className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right">
                      <SelectValue placeholder="انتخاب" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="diploma" className="text-gray-900 dark:text-white text-right">دیپلم</SelectItem>
                      <SelectItem value="associate" className="text-gray-900 dark:text-white text-right">کاردانی</SelectItem>
                      <SelectItem value="bachelor" className="text-gray-900 dark:text-white text-right">کارشناسی</SelectItem>
                      <SelectItem value="master" className="text-gray-900 dark:text-white text-right">کارشناسی ارشد</SelectItem>
                      <SelectItem value="phd" className="text-gray-900 dark:text-white text-right">دکتری</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">حداقل سابقه (سال)</Label>
                  <Input
                    type="number"
                    value={form.experienceMin}
                    onChange={(e) => setForm({ ...form, experienceMin: e.target.value })}
                    className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                    placeholder="۰"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">حداکثر سابقه (سال)</Label>
                  <Input
                    type="number"
                    value={form.experienceMax}
                    onChange={(e) => setForm({ ...form, experienceMax: e.target.value })}
                    className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                    placeholder="۰"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">محل کار</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="مثلاً: تهران"
                    className="h-9 md:h-10 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 dark:text-gray-300 block text-right">مهلت ارسال رزومه</Label>
                  <PersianDatePicker
                    value={form.deadline}
                    onChange={(d) => setForm({ ...form, deadline: d })}
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 flex items-center gap-3 pt-2">
                  <Switch
                    checked={form.remoteWork}
                    onCheckedChange={(v) => setForm({ ...form, remoteWork: v })}
                    className="dark:data-[state=checked]:bg-emerald-500"
                  />
                  <Label className="text-sm text-gray-700 dark:text-gray-300">امکان دورکاری</Label>
                </div>
              </div>
            </div>
          </div>
        
        <DialogFooter className="gap-2 md:gap-3 pt-2 flex-col-reverse sm:flex-row">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="h-9 md:h-10 px-4 md:px-6 text-sm w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !form.title || !form.departmentId || !form.description}
            className="h-9 md:h-10 px-4 md:px-6 text-sm gap-2 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm w-full sm:w-auto dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
            {submitting ? 'در حال ذخیره...' : isEdit ? 'بروزرسانی' : 'ثبت آگهی'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}