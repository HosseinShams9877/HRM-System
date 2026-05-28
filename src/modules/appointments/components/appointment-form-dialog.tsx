'use client'

import { useState } from 'react'
import { UserCheck, Search } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Textarea } from '@/core/components/ui/textarea'
import { Separator } from '@/core/components/ui/separator'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import type { Appointment, EmployeeBasic, PositionBasic } from '../index'

export function AppointmentFormDialog({
  open,
  onClose,
  onSubmit,
  appointment,
  employees,
  positions,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  appointment: Appointment | null
  employees: EmployeeBasic[]
  positions: PositionBasic[]
}) {
  const today = getTodayShamsi()
  const defaultStartDate = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`

  const [form, setForm] = useState(() => {
    if (appointment) {
      return {
        employeeId: appointment.employeeId,
        positionId: appointment.positionId,
        type: appointment.type,
        startDate: appointment.startDate,
        endDate: appointment.endDate || '',
        decreeNumber: appointment.decreeNumber || '',
        status: appointment.status,
        notes: appointment.notes || '',
      }
    }
    return {
      employeeId: '', positionId: '', type: 'اصلی',
      startDate: defaultStartDate,
      endDate: '', decreeNumber: '', status: 'active', notes: '',
    }
  })
  const [employeeSearch, setEmployeeSearch] = useState('')

  const filteredEmployees = employeeSearch
    ? employees.filter(e =>
        `${e.firstName} ${e.lastName}`.includes(employeeSearch) ||
        e.personnelCode.includes(employeeSearch)
      )
    : employees

  const selectedPosition = positions.find(p => p.id === form.positionId)

  const handleSubmit = () => {
    if (!form.employeeId || !form.positionId || !form.type || !form.startDate) return
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            {appointment ? 'ویرایش انتصاب' : 'ثبت انتصاب جدید'}
          </DialogTitle>
          <DialogDescription>
            {appointment ? 'اطلاعات انتصاب را ویرایش کنید' : 'انتساب کارمند به پست سازمانی'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* انتخاب کارمند */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              انتخاب کارمند
            </h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>کارمند *</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجو نام یا کد پرسنلی..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <Select value={form.employeeId} onValueChange={(v) => { setForm({ ...form, employeeId: v }); setEmployeeSearch('') }}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کارمند" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {filteredEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.personnelCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.employeeId && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-emerald-400 text-white text-xs">
                      {employees.find(e => e.id === form.employeeId)?.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-medium">
                      {(() => {
                        const emp = employees.find(e => e.id === form.employeeId)
                        return emp ? `${emp.firstName} ${emp.lastName}` : ''
                      })()}
                    </span>
                    <span className="text-xs text-muted-foreground mr-2">
                      {employees.find(e => e.id === form.employeeId)?.department || ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* انتخاب پست */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-sky-500 rounded-full" />
              انتخاب پست سازمانی
            </h4>
            <div className="space-y-3">
              <Select value={form.positionId} onValueChange={(v) => setForm({ ...form, positionId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب پست سازمانی" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {positions.filter(p => p.id !== 'none').map(pos => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title} — {pos.department?.name || 'بدون دپارتمان'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPosition && (
                <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedPosition.title}</span>
                    <span className="text-xs text-muted-foreground">{selectedPosition.code}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {selectedPosition.department && <span>{selectedPosition.department.name}</span>}
                    {selectedPosition.jobGrade && <span>گروه {selectedPosition.jobGrade}</span>}
                    {selectedPosition.level && <span>سطح {selectedPosition.level}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* جزئیات انتصاب */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
              جزئیات انتصاب
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع انتصاب *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="اصلی">اصلی</SelectItem>
                    <SelectItem value="سرپرست">سرپرست</SelectItem>
                    <SelectItem value="موقت">موقت</SelectItem>
                    <SelectItem value="Acting">سرپرست موقت (Acting)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="ended">پایان‌یافته</SelectItem>
                    <SelectItem value="cancelled">لغوشده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>شماره حکم</Label>
                <Input
                  placeholder="مثال: H-1405/123"
                  value={form.decreeNumber}
                  onChange={(e) => setForm({ ...form, decreeNumber: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>تاریخ شروع *</Label>
                <Input
                  placeholder="1405/01/01"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>تاریخ پایان</Label>
                <Input
                  placeholder="خالی = فعلی"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>توضیحات</Label>
              <Textarea
                placeholder="توضیحات انتصاب..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.employeeId || !form.positionId || !form.startDate}
            className="gap-2"
          >
            <UserCheck className="w-4 h-4" />
            {appointment ? 'بروزرسانی' : 'ثبت انتصاب'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
