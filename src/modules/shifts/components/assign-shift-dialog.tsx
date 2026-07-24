// modules/shifts/components/assign-shift-dialog.tsx

import { useState, useEffect, useMemo } from 'react'
import { Search, UserCheck } from 'lucide-react'
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
import { Badge } from '@/core/components/ui/badge'
import { Card, CardContent } from '@/core/components/ui/card'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Switch } from '@/core/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { getTodayShamsi, toPersianDigits } from '@/core/lib/utils-fa'
import { WorkShiftData, EmployeeBasic } from '../types'
import { MiniWeeklyView } from './mini-weekly-view'

interface AssignShiftDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  employees: EmployeeBasic[]
  shifts: WorkShiftData[]
}

export function AssignShiftDialog({
  open,
  onClose,
  onSubmit,
  employees,
  shifts,
}: AssignShiftDialogProps) {
  const today = useMemo(() => getTodayShamsi(), [])
  const [form, setForm] = useState({
    employeeId: '',
    shiftId: '',
    startDate: '',
    isDefault: false,
  })
  const [empSearch, setEmpSearch] = useState('')

  // تنظیم مقدار اولیه فقط یک بار و زمانی که دیالوگ باز میشه
  useEffect(() => {
    if (open) {
      setForm({
        employeeId: '',
        shiftId: '',
        startDate: `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`,
        isDefault: false,
      })
      setEmpSearch('')
    }
  }, [open, today])

  const filteredEmployees = empSearch
    ? employees.filter(e =>
        `${e.firstName} ${e.lastName}`.includes(empSearch) ||
        e.personnelCode.includes(empSearch)
      )
    : employees

  const selectedShift = shifts.find(s => s.id === form.shiftId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            انتساب شیفت به کارمند
          </DialogTitle>
          <DialogDescription>
            شیفت کاری مورد نظر را به کارمند اختصاص دهید
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>شیفت کاری *</Label>
              <Select
                value={form.shiftId}
                onValueChange={(v) => setForm({ ...form, shiftId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب شیفت" />
                </SelectTrigger>
                <SelectContent>
                  {shifts
                    .filter(s => s.isActive)
                    .map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.name} ({s.code})
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تاریخ شروع *</Label>
              <Input
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                dir="ltr"
                placeholder="1405/01/01"
              />
            </div>
          </div>

          {selectedShift && (
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedShift.color }}
                  />
                  <span className="text-sm font-medium">{selectedShift.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {selectedShift.code}
                  </Badge>
                </div>
                <MiniWeeklyView
                  schedules={selectedShift.schedules}
                  color={selectedShift.color}
                />
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label>کارمند *</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجو نام یا کد پرسنلی..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="pr-10 mb-2"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto border rounded-lg">
              {filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  کارمندی یافت نشد
                </div>
              ) : (
                filteredEmployees.map(emp => (
                  <button
                    key={emp.id}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                      form.employeeId === emp.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setForm({ ...form, employeeId: emp.id })
                      setEmpSearch('')
                    }}
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[9px] font-bold">
                        {emp.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-right">
                      <span className="text-xs font-medium">
                        {emp.firstName} {emp.lastName}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {emp.department || '—'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {toPersianDigits(emp.personnelCode)}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.isDefault}
              onCheckedChange={(v) => setForm({ ...form, isDefault: v })}
            />
            <Label className="text-xs">تنظیم به‌عنوان شیفت پیش‌فرض</Label>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button
            onClick={() => onSubmit(form)}
            disabled={!form.employeeId || !form.shiftId}
            className="gap-2"
          >
            <UserCheck className="w-4 h-4" />
            انتساب
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}