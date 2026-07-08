// src/modules/recruitment/components/dialogs/candidate-dialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'

interface CandidateDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: any
  submitting?: boolean
}

export function CandidateDialog({ open, onClose, onSubmit, initialData, submitting = false }: CandidateDialogProps) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    birthDate: null as Date | null,
    gender: '',
    address: '',
    city: '',
    educationLevel: '',
    educationField: '',
    university: '',
    currentCompany: '',
    currentPosition: '',
    experienceYears: '',
    expectedSalary: '',
    source: 'website',
    skills: '',
    linkedinUrl: '',
    portfolioUrl: '',
    notes: '',
  })

  useEffect(() => {
    if (open && initialData) {
      setForm({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone,
        nationalId: initialData.nationalId || '',
        birthDate: initialData.birthDate ? new Date(initialData.birthDate) : null,
        gender: initialData.gender || '',
        address: initialData.address || '',
        city: initialData.city || '',
        educationLevel: initialData.educationLevel || '',
        educationField: initialData.educationField || '',
        university: initialData.university || '',
        currentCompany: initialData.currentCompany || '',
        currentPosition: initialData.currentPosition || '',
        experienceYears: initialData.experienceYears?.toString() || '',
        expectedSalary: '',
        source: initialData.source || 'website',
        skills: initialData.skills || '',
        linkedinUrl: initialData.linkedinUrl || '',
        portfolioUrl: initialData.portfolioUrl || '',
        notes: initialData.notes || '',
      })
    } else if (open) {
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationalId: '',
        birthDate: null,
        gender: '',
        address: '',
        city: '',
        educationLevel: '',
        educationField: '',
        university: '',
        currentCompany: '',
        currentPosition: '',
        experienceYears: '',
        expectedSalary: '',
        source: 'website',
        skills: '',
        linkedinUrl: '',
        portfolioUrl: '',
        notes: '',
      })
    }
  }, [open, initialData])

  const handleSubmit = () => {
    onSubmit({
      ...form,
      birthDate: form.birthDate ? form.birthDate.toISOString() : null,
      experienceYears: parseInt(form.experienceYears) || 0,
      expectedSalary: parseFloat(form.expectedSalary) || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] w-[95vw] md:w-full p-4 md:p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base md:text-lg">
            <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {isEdit ? 'ویرایش کاندیدا' : 'ثبت کاندیدای جدید'}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400 text-right text-xs md:text-sm">
            اطلاعات کاندیدا را وارد کنید
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] md:max-h-[60vh] pr-1">
          <div className="space-y-4 p-1">
            {/* اطلاعات شخصی */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 justify-end">
                <span>اطلاعات شخصی</span>
                <div className="w-1 h-4 rounded-full bg-emerald-500" />
              </h4>
              <div className="space-y-3">
                {/* نام - در موبایل زیر هم */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">نام *</Label>
                    <Input 
                      value={form.firstName} 
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">نام خانوادگی *</Label>
                    <Input 
                      value={form.lastName} 
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right h-10"
                    />
                  </div>
                </div>

                {/* ایمیل و تلفن */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">ایمیل *</Label>
                    <Input 
                      type="email" 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      dir="ltr" 
                      className="text-left bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">تلفن *</Label>
                    <Input 
                      value={form.phone} 
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                      dir="ltr" 
                      className="text-left bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 h-10"
                    />
                  </div>
                </div>

                {/* کد ملی و تاریخ تولد */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">کد ملی</Label>
                    <Input 
                      value={form.nationalId} 
                      onChange={(e) => setForm({ ...form, nationalId: e.target.value })} 
                      dir="ltr" 
                      className="text-left bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">تاریخ تولد</Label>
                    <PersianDatePicker 
                      value={form.birthDate} 
                      onChange={(d) => setForm({ ...form, birthDate: d })} 
                    />
                  </div>
                </div>

                {/* جنسیت و شهر */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">جنسیت</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right h-10">
                        <SelectValue placeholder="انتخاب" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="male" className="text-gray-900 dark:text-white text-right">مرد</SelectItem>
                        <SelectItem value="female" className="text-gray-900 dark:text-white text-right">زن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">شهر</Label>
                    <Input 
                      value={form.city} 
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right h-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* تحصیلات */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 justify-end">
                <span>تحصیلات</span>
                <div className="w-1 h-4 rounded-full bg-blue-500" />
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">سطح تحصیلات</Label>
                    <Select value={form.educationLevel} onValueChange={(v) => setForm({ ...form, educationLevel: v })}>
                      <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right h-10">
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
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">رشته تحصیلی</Label>
                    <Input 
                      value={form.educationField} 
                      onChange={(e) => setForm({ ...form, educationField: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right h-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">دانشگاه</Label>
                    <Input 
                      value={form.university} 
                      onChange={(e) => setForm({ ...form, university: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">سابقه کار (سال)</Label>
                    <Input 
                      type="number" 
                      value={form.experienceYears} 
                      onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right h-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* اطلاعات شغلی */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 justify-end">
                <span>اطلاعات شغلی</span>
                <div className="w-1 h-4 rounded-full bg-amber-500" />
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">شرکت فعلی</Label>
                    <Input 
                      value={form.currentCompany} 
                      onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">سمت فعلی</Label>
                    <Input 
                      value={form.currentPosition} 
                      onChange={(e) => setForm({ ...form, currentPosition: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right h-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">حقوق درخواستی (ریال)</Label>
                    <Input 
                      type="number" 
                      value={form.expectedSalary} 
                      onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">منبع</Label>
                    <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                      <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="website" className="text-gray-900 dark:text-white text-right">وب‌سایت</SelectItem>
                        <SelectItem value="linkedin" className="text-gray-900 dark:text-white text-right">لینکدین</SelectItem>
                        <SelectItem value="referral" className="text-gray-900 dark:text-white text-right">معرفی</SelectItem>
                        <SelectItem value="job_site" className="text-gray-900 dark:text-white text-right">سایت کاریابی</SelectItem>
                        <SelectItem value="other" className="text-gray-900 dark:text-white text-right">سایر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* مهارت‌ها و لینک‌ها */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 justify-end">
                <span>مهارت‌ها و لینک‌ها</span>
                <div className="w-1 h-4 rounded-full bg-purple-500" />
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">مهارت‌ها</Label>
                  <Textarea 
                    value={form.skills} 
                    onChange={(e) => setForm({ ...form, skills: e.target.value })} 
                    rows={2} 
                    placeholder="مهارت‌ها را با کاما جدا کنید"
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">لینکدین</Label>
                    <Input 
                      value={form.linkedinUrl} 
                      onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} 
                      dir="ltr" 
                      className="text-left bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 h-10"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">نمونه‌کار</Label>
                    <Input 
                      value={form.portfolioUrl} 
                      onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} 
                      dir="ltr" 
                      className="text-left bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 h-10"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-700 dark:text-gray-300 block text-right text-sm">یادداشت</Label>
                  <Textarea 
                    value={form.notes} 
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                    rows={2}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 flex-col sm:flex-row pt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 h-10"
          >
            انصراف
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !form.firstName || !form.lastName || !form.email || !form.phone}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-10"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <UserPlus className="w-4 h-4 ml-2" />}
            {submitting ? 'در حال ذخیره...' : isEdit ? 'بروزرسانی' : 'ثبت کاندیدا'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}