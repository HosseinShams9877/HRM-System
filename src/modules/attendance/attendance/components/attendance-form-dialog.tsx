// src/modules/attendance/components/attendance-form-dialog.tsx

'use client'

import { useState } from 'react'
import {
  Search, Loader2, LogIn, LogOut,
} from 'lucide-react'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import type { EmployeeBasic } from '../index'
import moment from 'moment-jalaali'

// ============================================
// تبدیل تاریخ با moment-jalaali
// ============================================

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)])
}

const toEnglishNumber = (str: string): string => {
  const map: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  }
  return str.replace(/[۰-۹]/g, (d) => map[d] || d)
}

// تبدیل تاریخ شمسی به میلادی (Date)
const toMiladi = (shamsiDate: string): Date | null => {
  if (!shamsiDate) return null
  try {
    const englishDate = toEnglishNumber(shamsiDate)
    const parts = englishDate.split('/').map(Number)
    if (parts.length !== 3) return null
    // استفاده از moment-jalaali
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
    return toPersianNumber(shamsiStr)
  } catch {
    return ''
  }
}

export function CheckInDialog({
  open,
  onClose,
  onSubmit,
  employees,
  type,
  currentUser
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  employees: EmployeeBasic[]
  type: 'checkIn' | 'checkOut'
  currentUser?: { role: string; employeeId?: string } 
}) {
  const isEmployee = currentUser?.role === 'employee'

  function getDefaultForm() {
    const today = getTodayShamsi()
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const defaultEmployeeId = isEmployee ? currentUser?.employeeId || '' : ''
    
    const dateStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
    
    return {
      employeeId: defaultEmployeeId,
      date: toPersianNumber(dateStr),
      time: toPersianNumber(`${hours}:${minutes}`),
    }
  }

  const [form, setForm] = useState(getDefaultForm)
  const [empSearch, setEmpSearch] = useState('')
  const [prevOpen, setPrevOpen] = useState(false)

  if (open && !prevOpen) {
    setPrevOpen(true)
    setForm(getDefaultForm())
    setEmpSearch('')
  } else if (!open && prevOpen) {
    setPrevOpen(false)
  }

  const filtered = isEmployee 
    ? employees.filter(e => e.id === currentUser?.employeeId)
    : empSearch
      ? employees.filter(e => `${e.firstName} ${e.lastName}`.includes(empSearch) || e.personnelCode.includes(empSearch))
      : employees

  const handleSubmit = () => {
    if (!form.employeeId || !form.date || !form.time) return
    const englishDate = toEnglishNumber(form.date)
    const englishTime = toEnglishNumber(form.time)
    onSubmit({
      employeeId: form.employeeId,
      date: englishDate,
      checkIn: type === 'checkIn' ? englishTime : undefined,
      checkOut: type === 'checkOut' ? englishTime : undefined,
    })
  }

  // تابع تبدیل تاریخ انتخاب شده از تقویم به فارسی
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const shamsiDate = toShamsi(date)
      setForm({ ...form, date: shamsiDate })
    } else {
      setForm({ ...form, date: '' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'checkIn' ? (
              <LogIn className="w-5 h-5 text-emerald-600" />
            ) : (
              <LogOut className="w-5 h-5 text-sky-600" />
            )}
            {type === 'checkIn' ? 'ثبت ورود' : 'ثبت خروج'}
          </DialogTitle>
          <DialogDescription>
            {type === 'checkIn' ? 'ساعت ورود کارمند را ثبت کنید' : 'ساعت خروج کارمند را ثبت کنید'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isEmployee && (
            <div className="space-y-2">
              <Label>کارمند *</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو نام یا کد پرسنلی..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={form.employeeId} onValueChange={(v) => { setForm({ ...form, employeeId: v }); setEmpSearch('') }}>
                <SelectTrigger><SelectValue placeholder="انتخاب کارمند" /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {filtered.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.personnelCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isEmployee && (
            <div className="space-y-2">
              <Label>کارمند</Label>
              <div className="p-2 rounded-md bg-muted text-center font-medium">
                {employees.find(e => e.id === currentUser?.employeeId)?.firstName} {employees.find(e => e.id === currentUser?.employeeId)?.lastName}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاریخ</Label>
              <PersianDatePicker
                value={form.date ? toMiladi(form.date) : new Date()}
                onChange={handleDateChange}
                placeholder="۱۴۰۴/۰۴/۱۶"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
  <Label>ساعت</Label>
  <Input 
    type="text"
    value={form.time}
    onChange={(e) => {
      // ۱. فقط اعداد رو بگیر (انگلیسی)
      let val = e.target.value.replace(/\D/g, '')
      
      // ۲. محدود به ۴ عدد (ساعت و دقیقه)
      if (val.length > 4) val = val.slice(0, 4)
      
      // ۳. ساختار ساعت:دقیقه
      let hours = val.slice(0, 2)
      let minutes = val.slice(2, 4)
      
      // ۴. محدود کردن ساعت (۰-۲۳)
      if (hours.length === 2 && parseInt(hours) > 23) hours = '23'
      
      // ۵. محدود کردن دقیقه (۰-۵۹)
      if (minutes.length === 2 && parseInt(minutes) > 59) minutes = '59'
      
      // ۶. ساخت مقدار نهایی
      let result = hours
      if (minutes) {
        result += ':' + minutes
      } else if (hours.length === 2) {
        result += ':'
      }
      
      // ۷. تبدیل به فارسی
      const persianVal = result.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
      setForm({ ...form, time: persianVal })
    }}
    onKeyDown={(e) => {
      // فقط اعداد و Backspace مجاز
      if (!/[\d]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
        e.preventDefault()
      }
    }}
    placeholder="۲۲:۳۰"
    dir="ltr"
    className="font-mono text-lg tracking-wider text-center"
  />
</div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!form.employeeId} className="gap-2">
            {type === 'checkIn' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
            {type === 'checkIn' ? 'ثبت ورود' : 'ثبت خروج'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}