'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Calendar, Search, Plus, Edit3, Trash2, Eye,
  CheckCircle2, XCircle, Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/core/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits, getTodayShamsi } from '@/core/lib/utils-fa'
import { PERSIAN_MONTHS } from '../constants'
import { MonthlyWorkRecordDialog } from './monthly-work-record-dialog'
import { MonthlyWorkRecordDetailDialog } from './monthly-work-record-detail-dialog'
import type { MonthlyWorkRecord } from '../types/monthly-work-record'
import type { EmployeeBasic } from '../types'

// ============================================
// MonthlyWorkListTab
// ============================================

export function MonthlyWorkListTab({
  employees,
  year: defaultYear,
}: {
  employees: EmployeeBasic[]
  year: number
}) {
  const { toast } = useToast()
  const today = getTodayShamsi()

  const [records, setRecords] = useState<MonthlyWorkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(defaultYear || today.year)
  const [month, setMonth] = useState(today.month)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MonthlyWorkRecord | null>(null)
  const [editingRecord, setEditingRecord] = useState<MonthlyWorkRecord | null>(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('year', String(year))
      params.set('month', String(month))
      if (employeeSearch) params.set('search', employeeSearch)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/payroll/work-records?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setRecords(json.records || [])
      } else {
        toast({ title: 'خطا در دریافت کارکردها', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [year, month, employeeSearch, statusFilter, toast])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleSave = async (data: any) => {
    try {
      const url = editingRecord
        ? `/api/payroll/work-records/${editingRecord.id}`
        : '/api/payroll/work-records'
      const method = editingRecord ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast({ title: editingRecord ? 'کارکرد بروزرسانی شد' : 'کارکرد ثبت شد' })
        setFormOpen(false)
        setEditingRecord(null)
        fetchRecords()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این کارکرد اطمینان دارید؟')) return
    try {
      const res = await fetch(`/api/payroll/work-records/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'کارکرد حذف شد' })
        fetchRecords()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/payroll/work-records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast({ title: `وضعیت به ${newStatus === 'confirmed' ? 'تأیید شده' : 'بسته شده'} تغییر یافت` })
        fetchRecords()
      }
    } catch {
      toast({ title: 'خطا', variant: 'destructive' })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">پیش‌نویس</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">تأیید شده</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400">بسته شده</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* فیلترها */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">سال:</Label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            dir="ltr"
            className="w-24 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">ماه:</Label>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERSIAN_MONTHS.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">وضعیت:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="draft">پیش‌نویس</SelectItem>
              <SelectItem value="confirmed">تأیید شده</SelectItem>
              <SelectItem value="closed">بسته شده</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="جستجو نام یا کد پرسنلی..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="pr-9 h-8 text-sm"
          />
        </div>
        <Button size="sm" onClick={() => { setEditingRecord(null); setFormOpen(true) }} className="gap-1">
          <Plus className="w-3.5 h-3.5" />
          ثبت کارکرد
        </Button>
      </div>

      {/* لیست */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">کارکرد ماهانه‌ای ثبت نشده است</p>
          <p className="text-xs mt-1">با کلیک روی &ldquo;ثبت کارکرد&rdquo; شروع کنید</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-3 py-2.5 text-right font-medium text-xs">#</th>
                  <th className="px-3 py-2.5 text-right font-medium text-xs">کارمند</th>
                  <th className="px-3 py-2.5 text-right font-medium text-xs">کد پرسنلی</th>
                  <th className="px-3 py-2.5 text-right font-medium text-xs">روزهای کارکرد</th>
                  <th className="px-3 py-2.5 text-right font-medium text-xs">اضافه‌کاری</th>
                  <th className="px-3 py-2.5 text-right font-medium text-xs">شب‌کاری</th>
                  <th className="px-3 py-2.5 text-right font-medium text-xs">نوبت‌کاری</th>
                  <th className="px-3 py-2.5 text-right font-medium text-xs">وضعیت</th>
                  <th className="px-3 py-2.5 text-center font-medium text-xs">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => {
                  const emp = record.employee
                  const shiftLabel = record.shiftType
                    ? SHIFT_TYPES.find(s => s.value === record.shiftType)?.label || record.shiftType
                    : '—'
                  return (
                    <tr key={record.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 text-muted-foreground">{toPersianDigits(idx + 1)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                              {emp?.firstName?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{emp?.firstName} {emp?.lastName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">{toPersianDigits(emp?.personnelCode || '')}</td>
                      <td className="px-3 py-2.5 font-mono text-xs">{toPersianDigits(record.workDays)}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-amber-600">{toPersianDigits(record.overtimeHours)}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-indigo-600">{toPersianDigits(record.nightShiftHours)}</td>
                      <td className="px-3 py-2.5 text-xs text-purple-600">{shiftLabel}</td>
                      <td className="px-3 py-2.5">{getStatusBadge(record.status)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[140px]">
                            {/* مشاهده - در همه وضعیت‌ها */}
                            <DropdownMenuItem onClick={() => { setSelectedRecord(record); setDetailOpen(true) }} className="gap-2">
                              <Eye className="w-3.5 h-3.5" />
                              مشاهده
                            </DropdownMenuItem>

                            {/* ✨ ویرایش - در همه وضعیت‌ها (حتی بسته) */}
                            <DropdownMenuItem 
                              onClick={() => { setEditingRecord(record); setFormOpen(true) }} 
                              className="gap-2 text-blue-600 focus:text-blue-700"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              ویرایش
                              {record.status === 'closed' && (
                                <span className="text-[9px] text-amber-600 mr-1">(باز)</span>
                              )}
                            </DropdownMenuItem>

                            {/* تأیید - فقط پیش‌نویس */}
                            {record.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(record.id, 'confirmed')} className="gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                تأیید
                              </DropdownMenuItem>
                            )}

                            {/* بستن - فقط تأیید شده */}
                            {record.status === 'confirmed' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(record.id, 'closed')} className="gap-2">
                                <XCircle className="w-3.5 h-3.5" />
                                بستن
                              </DropdownMenuItem>
                            )}

                            {/* حذف - فقط پیش‌نویس */}
                            {record.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleDelete(record.id)} className="gap-2 text-rose-600 focus:text-rose-700">
                                <Trash2 className="w-3.5 h-3.5" />
                                حذف
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <MonthlyWorkRecordDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingRecord(null) }}
        onSave={handleSave}
        initialData={editingRecord}
        employees={employees}
        year={year}
      />

      <MonthlyWorkRecordDetailDialog
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedRecord(null) }}
        record={selectedRecord}
      />
    </div>
  )
}

// SHIFT_TYPES برای استفاده در جدول
const SHIFT_TYPES = [
  { value: 'none', label: 'بدون نوبت‌کاری' },
  { value: 'morning_evening', label: 'صبح و عصر' },
  { value: 'morning_evening_night', label: 'صبح، عصر و شب' },
  { value: 'morning_night', label: 'صبح و شب' },
  { value: 'evening_night', label: 'عصر و شب' },
]