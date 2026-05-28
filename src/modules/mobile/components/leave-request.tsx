'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Label } from '@/core/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/core/components/ui/select'
import { Separator } from '@/core/components/ui/separator'
import {
  CalendarOff, Send, Loader2, Clock, CheckCircle2, XCircle,
  Paperclip
} from 'lucide-react'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { toast } from 'sonner'

const LEAVE_TYPES = [
  { value: 'استحقاقی', label: 'استحقاقی' },
  { value: 'استعلاجی', label: 'استعلاجی' },
  { value: 'بدون حقوق', label: 'بدون حقوق' },
  { value: 'ازدواج', label: 'ازدواج' },
  { value: 'فوت', label: 'فوت' },
  { value: 'تولد', label: 'تولد' },
  { value: 'سایر', label: 'سایر' },
]

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300', icon: Clock },
  approved: { label: 'تأیید شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300', icon: CheckCircle2 },
  rejected: { label: 'رد شده', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300', icon: XCircle },
}

export default function LeaveRequest() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [leaves, setLeaves] = useState<any[]>([])
  const [form, setForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
    totalDays: '',
    reason: '',
  })

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/leaves')
      if (res.ok) {
        const data = await res.json()
        setLeaves(data.leaves || [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaves()
  }, [fetchLeaves])

  const handleSubmit = async () => {
    if (!form.type || !form.startDate || !form.endDate || !form.totalDays) {
      toast.error('لطفاً تمام فیلدهای الزامی را پر کنید')
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'demo-employee-1',
          type: form.type,
          startDate: form.startDate,
          endDate: form.endDate,
          totalDays: parseInt(form.totalDays),
          reason: form.reason || null,
        }),
      })
      if (res.ok) {
        toast.success('درخواست مرخصی با موفقیت ثبت شد')
        setForm({ type: '', startDate: '', endDate: '', totalDays: '', reason: '' })
        fetchLeaves()
      } else {
        toast.error('خطا در ثبت درخواست')
      }
    } catch {
      toast.error('خطا در ثبت درخواست')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Leave Request Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30">
              <CalendarOff className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            درخواست مرخصی جدید
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">نوع مرخصی *</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">تاریخ شروع *</Label>
              <Input
                placeholder="1405/01/01"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="text-sm"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">تاریخ پایان *</Label>
              <Input
                placeholder="1405/01/03"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="text-sm"
                dir="ltr"
              />
            </div>
          </div>

          {/* Total Days */}
          <div className="space-y-1.5">
            <Label className="text-xs">تعداد روزها *</Label>
            <Input
              type="number"
              placeholder="۱"
              value={form.totalDays}
              onChange={e => setForm({ ...form, totalDays: e.target.value })}
              className="text-sm"
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs">دلیل مرخصی</Label>
            <Textarea
              placeholder="توضیحات خود را وارد کنید..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              className="text-sm min-h-[80px]"
            />
          </div>

          {/* Attachment Placeholder */}
          <div className="space-y-1.5">
            <Label className="text-xs">پیوست</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors">
              <Paperclip className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">برای آپلود فایل کلیک کنید</span>
            </div>
          </div>

          <Button
            className="w-full gap-2 bg-sky-500 hover:bg-sky-600"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            ثبت درخواست
          </Button>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            سوابق مرخصی
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs">
              هیچ درخواست مرخصی یافت نشد
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {leaves.map((leave: any) => {
                const status = STATUS_MAP[leave.status] || STATUS_MAP.pending
                const StatusIcon = status.icon
                return (
                  <div key={leave.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{leave.type}</span>
                      <Badge className={`${status.color} text-[10px] gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatShamsi(leave.startDate)} تا {formatShamsi(leave.endDate)}</span>
                      <span>{toPersianDigits(leave.totalDays)} روز</span>
                    </div>
                    {leave.reason && (
                      <p className="text-[11px] text-muted-foreground border-t border-border pt-2 mt-1">
                        {leave.reason}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
