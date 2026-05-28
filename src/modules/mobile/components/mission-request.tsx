'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import {
  MapPin, Send, Loader2, Clock, CheckCircle2, XCircle,
  Briefcase
} from 'lucide-react'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { toast } from 'sonner'

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300', icon: Clock },
  approved: { label: 'تأیید شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300', icon: CheckCircle2 },
  rejected: { label: 'رد شده', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300', icon: XCircle },
}

export default function MissionRequest() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [missions, setMissions] = useState<any[]>([])
  const [form, setForm] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    totalDays: '',
  })

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/missions')
      if (res.ok) {
        const data = await res.json()
        setMissions(data.missions || [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  const handleSubmit = async () => {
    if (!form.title || !form.startDate || !form.endDate || !form.totalDays) {
      toast.error('لطفاً تمام فیلدهای الزامی را پر کنید')
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'demo-employee-1',
          title: form.title,
          destination: form.destination || null,
          startDate: form.startDate,
          endDate: form.endDate,
          totalDays: parseInt(form.totalDays),
        }),
      })
      if (res.ok) {
        toast.success('درخواست ماموریت با موفقیت ثبت شد')
        setForm({ title: '', destination: '', startDate: '', endDate: '', totalDays: '' })
        fetchMissions()
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
      {/* Mission Request Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            درخواست ماموریت جدید
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs">عنوان ماموریت *</Label>
            <Input
              placeholder="عنوان ماموریت را وارد کنید"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="text-sm"
            />
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <Label className="text-xs">مقصد</Label>
            <Input
              placeholder="شهر یا محل ماموریت"
              value={form.destination}
              onChange={e => setForm({ ...form, destination: e.target.value })}
              className="text-sm"
            />
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

          <Button
            className="w-full gap-2 bg-sky-500 hover:bg-sky-600"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            ثبت درخواست ماموریت
          </Button>
        </CardContent>
      </Card>

      {/* Mission History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <Briefcase className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            </div>
            سوابق ماموریت
          </CardTitle>
        </CardHeader>
        <CardContent>
          {missions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs">
              هیچ درخواست ماموریتی یافت نشد
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {missions.map((mission: any) => {
                const status = STATUS_MAP[mission.status] || STATUS_MAP.pending
                const StatusIcon = status.icon
                return (
                  <div key={mission.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{mission.title}</span>
                      <Badge className={`${status.color} text-[10px] gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                    {mission.destination && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{mission.destination}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatShamsi(mission.startDate)} تا {formatShamsi(mission.endDate)}</span>
                      <span>{toPersianDigits(mission.totalDays)} روز</span>
                    </div>
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
