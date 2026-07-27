'use client'

import { useState, useMemo } from 'react'
import { Award, Search, X, ChevronDown, Calendar } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/core/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Separator } from '@/core/components/ui/separator'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Badge } from '@/core/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'
import { toPersianDigits, getTodayShamsi } from '@/core/lib/utils-fa'
import { REWARD_TYPES, REWARD_TYPE_CONFIG } from '../constants'
import type { Employee, Reward } from '../index'
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

const toShamsi = (date: Date): string => {
  if (!date) return ''
  try {
    const m = moment(date)
    return m.format('jYYYY/jMM/jDD')
  } catch {
    return ''
  }
}

// ============================================
// Reward Form Dialog — پاداش
// ============================================

interface RewardFormDialogProps {
  open: boolean
  editingReward: Reward | null
  rewardForm: { employeeId: string; type: string; title: string; amount: number; reason: string; date: string }
  employees: Employee[]
  saving: boolean
  onFormChange: (form: { employeeId: string; type: string; title: string; amount: number; reason: string; date: string }) => void
  onSave: () => void
  onClose: () => void
}

export function RewardFormDialog({
  open,
  editingReward,
  rewardForm,
  employees,
  saving,
  onFormChange,
  onSave,
  onClose,
}: RewardFormDialogProps) {
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false)
  const today = getTodayShamsi()
  const defaultDate = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`

  // فیلتر کردن کارمندان بر اساس جستجو
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees
    const term = employeeSearch.trim().toLowerCase()
    return employees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
      return fullName.includes(term) || 
             (emp as any).personnelCode?.toLowerCase().includes(term) ||
             (emp as any).code?.toLowerCase().includes(term) ||
             emp.department?.toLowerCase().includes(term)
    })
  }, [employees, employeeSearch])

  const selectedEmployee = employees.find(e => e.id === rewardForm.employeeId)

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-600" />
            {editingReward ? 'ویرایش پاداش' : 'پاداش جدید'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Employee Selection with Popover Search */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">کارمند *</label>
            <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={employeePopoverOpen}
                  className="w-full justify-between h-9 text-xs font-normal"
                >
                  {selectedEmployee ? (
                    <span className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[8px] font-bold">
                          {selectedEmployee.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({(selectedEmployee as any).personnelCode || (selectedEmployee as any).code || '—'})
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">انتخاب کارمند...</span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
            <PopoverContent 
  className="w-[--radix-popover-trigger-width] p-0" 
  align="start"
  sideOffset={4}
  onWheel={(e) => e.stopPropagation()}
  onMouseEnter={(e) => e.stopPropagation()}
>
  <div className="relative border-b">
    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      placeholder="جستجوی نام، کد پرسنلی..."
      value={employeeSearch}
      onChange={(e) => setEmployeeSearch(e.target.value)}
      className="pr-10 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
    />
  </div>
  <div 
    className="max-h-[200px] overflow-y-auto overscroll-contain p-1"
    style={{ 
      scrollBehavior: 'smooth',
      touchAction: 'pan-y'
    }}
    onWheel={(e) => e.stopPropagation()}
  >
    {filteredEmployees.length === 0 ? (
      <div className="p-2 text-center text-xs text-muted-foreground">
        کارمندی یافت نشد
      </div>
    ) : (
      filteredEmployees.map(emp => (
        <div
          key={emp.id}
          className={`flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors ${
            rewardForm.employeeId === emp.id
              ? 'bg-emerald-50 dark:bg-emerald-950/30'
              : 'hover:bg-muted/50'
          }`}
          onClick={() => {
            onFormChange({ ...rewardForm, employeeId: emp.id })
            setEmployeeSearch('')
            setEmployeePopoverOpen(false)
          }}
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className={`text-white text-[10px] font-bold ${
              rewardForm.employeeId === emp.id
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                : 'bg-gradient-to-br from-emerald-400 to-teal-500'
            }`}>
              {emp.firstName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium">
              {emp.firstName} {emp.lastName}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {emp.department || 'بدون دپارتمان'}
              {emp.position && ` • ${emp.position}`}
              {(emp as any).personnelCode && ` • کد: ${toPersianDigits((emp as any).personnelCode)}`}
            </div>
          </div>
          {rewardForm.employeeId === emp.id && (
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </div>
      ))
    )}
  </div>
</PopoverContent>
            </Popover>
          </div>

          <Separator />

          {/* Type & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">نوع پاداش *</label>
              <Select
                value={rewardForm.type}
                onValueChange={(val) => onFormChange({ ...rewardForm, type: val })}
              >
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TYPES.map(t => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {REWARD_TYPE_CONFIG[t].icon} {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">مبلغ (تومان)</label>
              <Input
                type="text"
                inputMode="numeric"
                value={rewardForm.amount ? toPersianNumber(String(rewardForm.amount)) : ''}
                onChange={e => {
                  const englishNumber = toEnglishNumber(e.target.value)
                  const numeric = englishNumber.replace(/[^0-9]/g, '')
                  onFormChange({ ...rewardForm, amount: numeric ? +numeric : 0 })
                }}
                className="text-xs"
                placeholder={toPersianNumber('۰')}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">عنوان پاداش *</label>
            <Input
              value={rewardForm.title}
              onChange={e => onFormChange({ ...rewardForm, title: e.target.value })}
              className="text-xs"
              placeholder="مثلاً: پاداش عملکرد ماهانه"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">دلیل</label>
            <Input
              value={rewardForm.reason}
              onChange={e => onFormChange({ ...rewardForm, reason: e.target.value })}
              className="text-xs"
              placeholder="دلیل اعطای پاداش (اختیاری)"
            />
          </div>

          {/* Date with PersianDatePicker */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">تاریخ *</label>
            <div className="relative">
              <PersianDatePicker
                value={rewardForm.date ? toMiladi(rewardForm.date) : new Date()}
                onChange={(date) => {
                  if (date) {
                    const shamsiDate = toShamsi(date)
                    onFormChange({ ...rewardForm, date: shamsiDate })
                  }
                }}
                placeholder={toPersianNumber(defaultDate)}
                className="w-full"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            {toPersianNumber('انصراف')}
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving} className="text-xs">
            {saving ? toPersianNumber('ذخیره...') : editingReward ? toPersianNumber('بروزرسانی') : toPersianNumber('ذخیره')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}