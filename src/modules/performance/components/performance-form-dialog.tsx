'use client'

import { useMemo, useState } from 'react'
import {
  BarChart3, Plus, Edit2, ChevronLeft, Search, X, Check, ChevronDown
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Label } from '@/core/components/ui/label'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Separator } from '@/core/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/core/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/core/components/ui/command'
import { toPersianDigits } from '@/core/lib/utils-fa'
import type { Employee, FormData, Performance } from '../index'
import { KPI_LABELS, initialForm } from '../constants'

interface PerformanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Performance | null
  form: FormData
  onFormChange: (form: FormData) => void
  employees: Employee[]
  saving: boolean
  onSave: () => void
}

export function PerformanceFormDialog({
  open,
  onOpenChange,
  editing,
  form,
  onFormChange,
  employees,
  saving,
  onSave,
}: PerformanceFormDialogProps) {

  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false)

  // فیلتر کردن کارمندان بر اساس جستجو
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees
    const search = employeeSearch.toLowerCase().trim()
    return employees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
      const code = (emp as any).personnelCode || (emp as any).code || ''
      return fullName.includes(search) ||
             code.toLowerCase().includes(search) ||
             emp.department?.toLowerCase().includes(search)
    })
  }, [employees, employeeSearch])

  const selectedEmployee = employees.find(e => e.id === form.employeeId)

  // ---- Auto-calculated score ----
  const autoScore = useMemo(() => {
    const kpiValues = [form.kpi1, form.kpi2, form.kpi3, form.kpi4].filter((v): v is number => v !== null && v > 0)
    return kpiValues.length > 0
      ? +(kpiValues.reduce((s, v) => s + v, 0) / kpiValues.length).toFixed(2)
      : form.score
  }, [form.kpi1, form.kpi2, form.kpi3, form.kpi4, form.score])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            {editing ? 'ویرایش ارزیابی' : 'ارزیابی جدید'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* بخش اطلاعات پایه */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <ChevronLeft className="w-3 h-3" />
              اطلاعات پایه
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* کارمند با جستجو */}
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-medium block">کارمند *</Label>
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
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-fuchsia-500 text-white text-[8px] font-bold">
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
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput
                        placeholder="جستجوی نام، کد پرسنلی..."
                        value={employeeSearch}
                        onValueChange={setEmployeeSearch}
                        className="h-9"
                      />
                      <CommandList className="max-h-56">
                        <CommandEmpty>کارمندی یافت نشد</CommandEmpty>
                        <CommandGroup>
                          {filteredEmployees.map((emp) => (
                            <CommandItem
                              key={emp.id}
                              value={`${emp.firstName} ${emp.lastName}`}
                              onSelect={() => {
                                onFormChange({ ...form, employeeId: emp.id })
                                setEmployeeSearch('')
                                setEmployeePopoverOpen(false)
                              }}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-fuchsia-500 text-white text-[9px] font-bold">
                                    {emp.firstName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-sm">{emp.firstName} {emp.lastName}</span>
                                  <span className="text-[10px] text-muted-foreground block">
                                    {emp.department || 'بدون دپارتمان'}
                                    {emp.position && ` • ${emp.position}`}
                                    {(emp as any).personnelCode && ` • کد: ${(emp as any).personnelCode}`}
                                  </span>
                                </div>
                              </div>
                              {form.employeeId === emp.id && (
                                <Check className="h-4 w-4 text-emerald-500" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs font-medium mb-1 block">دوره *</Label>
                <Select value={form.period} onValueChange={v => onFormChange({ ...form, period: v })}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder="انتخاب دوره" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1404/Q1">۱۴۰۴/سهمیه اول</SelectItem>
                    <SelectItem value="1404/Q2">۱۴۰۴/سهمیه دوم</SelectItem>
                    <SelectItem value="1404/Q3">۱۴۰۴/سهمیه سوم</SelectItem>
                    <SelectItem value="1404/Q4">۱۴۰۴/سهمیه چهارم</SelectItem>
                    <SelectItem value="1405/Q1">۱۴۰۵/سهمیه اول</SelectItem>
                    <SelectItem value="1405/Q2">۱۴۰۵/سهمیه دوم</SelectItem>
                    <SelectItem value="1405/Q3">۱۴۰۵/سهمیه سوم</SelectItem>
                    <SelectItem value="1405/Q4">۱۴۰۵/سهمیه چهارم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium mb-1 block">وضعیت</Label>
                <Select value={form.status} onValueChange={v => onFormChange({ ...form, status: v })}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="completed">تکمیل شده</SelectItem>
                    <SelectItem value="reviewed">بررسی شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* بخش شاخص‌های کلیدی */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <ChevronLeft className="w-3 h-3" />
              شاخص‌های کلیدی عملکرد (۰ تا ۵)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {(['kpi1', 'kpi2', 'kpi3', 'kpi4'] as const).map(key => (
                <div key={key}>
                  <Label className="text-xs font-medium mb-1 block">{KPI_LABELS[key]}</Label>
                  <Select
                    value={form[key] !== null ? String(form[key]) : 'null'}
                    onValueChange={v => onFormChange({ ...form, [key]: v === 'null' ? null : +v })}
                  >
                    <SelectTrigger className="w-full text-xs h-9">
                      <SelectValue placeholder="انتخاب نمره" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">بدون نمره</SelectItem>
                      {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(v => (
                        <SelectItem key={v} value={String(v)}>{toPersianDigits(v)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* بخش جمع‌بندی */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <ChevronLeft className="w-3 h-3" />
              جمع‌بندی
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1 block">نمره کل (محاسبه خودکار)</Label>
                <Input
                  type="number"
                  value={autoScore}
                  readOnly
                  className="text-xs bg-muted"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  میانگین شاخص‌های کلیدی
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium mb-1 block">هدف</Label>
                <Select value={String(form.target)} onValueChange={v => onFormChange({ ...form, target: +v })}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(v => (
                      <SelectItem key={v} value={String(v)}>{toPersianDigits(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs font-medium mb-1 block">توضیحات</Label>
              <Textarea
                value={form.comments}
                onChange={e => onFormChange({ ...form, comments: e.target.value })}
                placeholder="توضیحات تکمیلی..."
                className="text-xs min-h-[70px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">انصراف</Button>
          <Button size="sm" onClick={onSave} disabled={saving || !form.employeeId || !form.period} className="text-xs">
            {saving ? 'ذخیره...' : 'ذخیره'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}