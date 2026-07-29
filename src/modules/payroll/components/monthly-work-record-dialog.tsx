'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Calendar, Search, Save, X, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
import { Badge } from '@/core/components/ui/badge'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits, getTodayShamsi } from '@/core/lib/utils-fa'
import { PERSIAN_MONTHS } from '../constants'
import { SHIFT_TYPES, type MonthlyWorkRecordFormData, type MonthlyWorkRecord } from '../types/monthly-work-record'
import type { EmployeeBasic } from '../types'

// ============================================
// تبدیل اعداد فارسی به انگلیسی
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
// MonthlyWorkRecordDialog
// ============================================

export function MonthlyWorkRecordDialog({
  open,
  onClose,
  onSave,
  initialData,
  employees,
  year: defaultYear,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: MonthlyWorkRecordFormData) => void
  initialData?: MonthlyWorkRecord | null
  employees: EmployeeBasic[]
  year: number
}) {
  const { toast } = useToast()
  const isEdit = !!initialData
  const today = getTodayShamsi()

  const [employeeId, setEmployeeId] = useState('')
  const [year, setYear] = useState(defaultYear || today.year)
  const [month, setMonth] = useState(today.month)
  const [workDays, setWorkDays] = useState('30')
  const [normalHours, setNormalHours] = useState('0')
  const [overtimeHours, setOvertimeHours] = useState('0')
  const [nightShiftHours, setNightShiftHours] = useState('0')
  const [shiftType, setShiftType] = useState<string>('none')
  const [fridayWorkHours, setFridayWorkHours] = useState('0')
  const [holidayWorkHours, setHolidayWorkHours] = useState('0')
  const [missionDays, setMissionDays] = useState('0')
  const [leaveDays, setLeaveDays] = useState('0')
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState('0')
  const [absenceDays, setAbsenceDays] = useState('0')
  const [delayHours, setDelayHours] = useState('0')
  const [earlyLeaveHours, setEarlyLeaveHours] = useState('0')
  const [shortWorkHours, setShortWorkHours] = useState('0')
  const [notes, setNotes] = useState('')
  const [empSearch, setEmpSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const hasInitialized = useRef(false)

  // فیلتر کارمندان
  const filteredEmployees = empSearch
    ? employees.filter(e =>
        `${e.firstName} ${e.lastName}`.includes(empSearch) ||
        e.personnelCode.includes(empSearch)
      )
    : employees

  // تنظیم مقدار اولیه
  useEffect(() => {
    if (open && !hasInitialized.current) {
      hasInitialized.current = true
      if (initialData) {
        setEmployeeId(initialData.employeeId)
        setYear(initialData.year)
        setMonth(initialData.month)
        setWorkDays(String(initialData.workDays))
        setNormalHours(String(initialData.normalHours))
        setOvertimeHours(String(initialData.overtimeHours))
        setNightShiftHours(String(initialData.nightShiftHours))
        setShiftType(initialData.shiftType || 'none')
        setFridayWorkHours(String(initialData.fridayWorkHours))
        setHolidayWorkHours(String(initialData.holidayWorkHours))
        setMissionDays(String(initialData.missionDays))
        setLeaveDays(String(initialData.leaveDays))
        setUnpaidLeaveDays(String(initialData.unpaidLeaveDays))
        setAbsenceDays(String(initialData.absenceDays))
        setDelayHours(String(initialData.delayHours))
        setEarlyLeaveHours(String(initialData.earlyLeaveHours))
        setShortWorkHours(String(initialData.shortWorkHours))
        setNotes(initialData.notes || '')
      } else {
        setEmployeeId('')
        setYear(defaultYear || today.year)
        setMonth(today.month)
        setWorkDays('30')
        setNormalHours('0')
        setOvertimeHours('0')
        setNightShiftHours('0')
        setShiftType('none')
        setFridayWorkHours('0')
        setHolidayWorkHours('0')
        setMissionDays('0')
        setLeaveDays('0')
        setUnpaidLeaveDays('0')
        setAbsenceDays('0')
        setDelayHours('0')
        setEarlyLeaveHours('0')
        setShortWorkHours('0')
        setNotes('')
      }
      setEmpSearch('')
    }
    if (!open) {
      hasInitialized.current = false
    }
  }, [open, initialData, defaultYear, today])

  const handleSubmit = async () => {
    if (!employeeId) {
      toast({ title: 'لطفاً کارمند را انتخاب کنید', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const data: MonthlyWorkRecordFormData = {
        employeeId,
        year,
        month,
        workDays: Number(workDays) || 0,
        normalHours: Number(normalHours) || 0,
        overtimeHours: Number(overtimeHours) || 0,
        nightShiftHours: Number(nightShiftHours) || 0,
        shiftType: shiftType === 'none' ? null : shiftType,
        fridayWorkHours: Number(fridayWorkHours) || 0,
        holidayWorkHours: Number(holidayWorkHours) || 0,
        missionDays: Number(missionDays) || 0,
        leaveDays: Number(leaveDays) || 0,
        unpaidLeaveDays: Number(unpaidLeaveDays) || 0,
        absenceDays: Number(absenceDays) || 0,
        delayHours: Number(delayHours) || 0,
        earlyLeaveHours: Number(earlyLeaveHours) || 0,
        shortWorkHours: Number(shortWorkHours) || 0,
        notes: notes || null,
      }
      await onSave(data)
    } finally {
      setSaving(false)
    }
  }

  // کارمندی که انتخاب شده
  const selectedEmployee = employees.find(e => e.id === employeeId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {isEdit ? 'ویرایش کارکرد ماهانه' : 'ثبت کارکرد ماهانه'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات کارکرد ماهانه را ویرایش کنید' : 'کارکرد ماهانه پرسنل را ثبت کنید'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* انتخاب کارمند و سال/ماه */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label>کارمند *</Label>
              {isEdit ? (
                <Input
                  value={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''}
                  disabled
                  className="bg-muted"
                />
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="جستجو نام یا کد..."
                      value={empSearch}
                      onChange={(e) => setEmpSearch(e.target.value)}
                      className="pr-10 mb-2"
                    />
                  </div>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="انتخاب کارمند" /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {filteredEmployees.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          {empSearch ? 'کارمندی یافت نشد' : 'کارمندی موجود نیست'}
                        </div>
                      ) : (
                        filteredEmployees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({toPersianDigits(emp.personnelCode)})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label>سال *</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={toPersianNumber(String(year))}
                onChange={(e) => {
                  const englishNumber = toEnglishNumber(e.target.value)
                  const numeric = englishNumber.replace(/[^0-9]/g, '')
                  if (numeric) setYear(Number(numeric))
                }}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>ماه *</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERSIAN_MONTHS.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* کارکرد */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              کارکرد ماهانه
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">روزهای کارکرد</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(workDays)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setWorkDays(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">ساعات کار عادی</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(normalHours)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setNormalHours(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-amber-600">اضافه‌کاری</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(overtimeHours)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setOvertimeHours(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-amber-200 focus:border-amber-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-indigo-600">شب‌کاری</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(nightShiftHours)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setNightShiftHours(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-indigo-200 focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* نوبت‌کاری و تعطیلات */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              نوبت‌کاری و تعطیلات
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">نوع نوبت‌کاری</Label>
                <Select value={shiftType} onValueChange={setShiftType}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SHIFT_TYPES.map(st => (
                      <SelectItem key={st.value} value={st.value}>
                        {st.label} {st.rate > 0 && `(${toPersianDigits(st.rate)}%)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-rose-600">جمعه‌کاری (ساعت)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(fridayWorkHours)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setFridayWorkHours(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-rose-200 focus:border-rose-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-orange-600">تعطیل‌کاری (ساعت)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(holidayWorkHours)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setHolidayWorkHours(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-orange-200 focus:border-orange-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-blue-600">مأموریت (روز)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(missionDays)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setMissionDays(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* مرخصی و غیبت */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              مرخصی و غیبت
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-emerald-600">مرخصی استحقاقی (روز)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(leaveDays)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setLeaveDays(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-emerald-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-rose-600">مرخصی بدون حقوق (روز)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(unpaidLeaveDays)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setUnpaidLeaveDays(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-rose-200 focus:border-rose-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-red-600">غیبت (روز)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(absenceDays)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setAbsenceDays(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-red-200 focus:border-red-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-orange-600">تأخیر (ساعت)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(delayHours)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setDelayHours(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-orange-200 focus:border-orange-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-amber-600">تعجیل (ساعت)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(earlyLeaveHours)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setEarlyLeaveHours(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-amber-200 focus:border-amber-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">کسرکار (ساعت)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={toPersianNumber(shortWorkHours)}
                  onChange={(e) => {
                    const en = toEnglishNumber(e.target.value)
                    setShortWorkHours(en.replace(/[^0-9.]/g, ''))
                  }}
                  dir="ltr"
                  className="h-9 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* توضیحات */}
          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="توضیحات اختیاری"
            />
          </div>

          {/* هشدار */}
          {selectedEmployee && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                ثبت کارکرد برای <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong> -
                کد پرسنلی: {toPersianDigits(selectedEmployee.personnelCode)}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={!employeeId || saving} className="gap-2">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? 'بروزرسانی' : 'ثبت کارکرد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}