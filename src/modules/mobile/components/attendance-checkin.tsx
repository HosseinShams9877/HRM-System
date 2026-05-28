'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  Clock, MapPin, LogIn, LogOut, Loader2, CheckCircle2,
  AlertCircle, Timer
} from 'lucide-react'
import { toPersianDigits, getTodayFormatted, getTodayShamsi } from '@/core/lib/utils-fa'
import { toast } from 'sonner'
import { useIsMobile } from '@/core/hooks/use-mobile'

interface AttendanceRecord {
  id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  workHours: number | null
  overtime: number | null
}

interface AttendanceCheckinProps {
  currentUser?: { role: string; employeeId?: string; name?: string }
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  present: { label: 'حاضر', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
  late: { label: 'تاخیر', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
  early_leave: { label: 'خروج زودرس', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300' },
  absent: { label: 'غایب', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300' },
  leave: { label: 'مرخصی', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300' },
  mission: { label: 'ماموریت', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300' },
}

export default function AttendanceCheckin({ currentUser }: AttendanceCheckinProps) {
  const isMobile = useIsMobile()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [gpsActive, setGpsActive] = useState(false)

  if (!isMobile) return null

  const todayShamsi = getTodayShamsi()
  const todayStr = `${todayShamsi.year}/${String(todayShamsi.month).padStart(2, '0')}/${String(todayShamsi.day).padStart(2, '0')}`

  const fetchTodayRecord = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/attendance?date=${todayStr}`)
      if (res.ok) {
        const data = await res.json()
        // Find current employee's record (first one for demo)
        if (data.records && data.records.length > 0) {
          setTodayRecord(data.records[0])
        } else {
          setTodayRecord(null)
        }
      }
    } catch {
      toast.error('خطا در دریافت اطلاعات تردد')
    } finally {
      setLoading(false)
    }
  }, [todayStr])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchTodayRecord()
  }, [fetchTodayRecord])

  // Check GPS
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsActive(true),
        () => setGpsActive(false)
      )
    }
  }, [])

  const handleCheckIn = async () => {
    try {
      setSubmitting(true)
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser?.employeeId,
          date: todayStr,
          checkIn: timeStr,
          status: 'present',
        }),
      })
      if (res.ok) {
        toast.success('ورود با موفقیت ثبت شد')
        fetchTodayRecord()
      } else {
        toast.error('خطا در ثبت ورود')
      }
    } catch {
      toast.error('خطا در ثبت ورود')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setSubmitting(true)
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser?.employeeId,
          date: todayStr,
          checkIn: todayRecord?.checkIn || timeStr,
          checkOut: timeStr,
          status: todayRecord?.status || 'present',
        }),
      })
      if (res.ok) {
        toast.success('خروج با موفقیت ثبت شد')
        fetchTodayRecord()
      } else {
        toast.error('خطا در ثبت خروج')
      }
    } catch {
      toast.error('خطا در ثبت خروج')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (date: Date) => {
    return toPersianDigits(
      `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    )
  }

  const isCheckedIn = !!todayRecord?.checkIn
  const isCheckedOut = !!todayRecord?.checkOut
  const currentStatus = todayRecord?.status ? STATUS_MAP[todayRecord.status] : null

  return (
    <div className="space-y-4">
      {/* Time Display */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-sky-500 to-blue-600 text-white">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="w-4 h-4 opacity-80" />
            <span className="text-xs opacity-80">{getTodayFormatted()}</span>
          </div>
          <div className="text-4xl font-bold tracking-wider mb-3" dir="ltr">
            {formatTime(currentTime)}
          </div>
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-3.5 h-3.5 opacity-80" />
            <span className="text-xs opacity-80">
              {gpsActive ? 'موقعیت‌یاب فعال' : 'موقعیت‌یاب غیرفعال'}
            </span>
            <span className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Check-in/out Buttons */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          {!isCheckedIn ? (
            <Button
              className="w-full h-14 text-base gap-2 bg-sky-500 hover:bg-sky-600"
              onClick={handleCheckIn}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              ثبت ورود
            </Button>
          ) : !isCheckedOut ? (
            <Button
              className="w-full h-14 text-base gap-2 bg-red-500 hover:bg-red-600"
              onClick={handleCheckOut}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
              ثبت خروج
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">تردد امروز ثبت شده است</span>
            </div>
          )}

          {currentStatus && (
            <div className="flex items-center justify-center">
              <Badge className={`${currentStatus.color} text-xs`}>
                {currentStatus.label}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Log */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            ثبت تردد امروز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <LogIn className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-muted-foreground">ساعت ورود</span>
            </div>
            <span className="text-sm font-medium" dir="ltr">
              {todayRecord?.checkIn ? toPersianDigits(todayRecord.checkIn) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs text-muted-foreground">ساعت خروج</span>
            </div>
            <span className="text-sm font-medium" dir="ltr">
              {todayRecord?.checkOut ? toPersianDigits(todayRecord.checkOut) : '—'}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-xs text-muted-foreground">ساعات کارکرد</span>
            </div>
            <span className="text-sm font-medium">
              {todayRecord?.workHours ? toPersianDigits(todayRecord.workHours) + ' ساعت' : '—'}
            </span>
          </div>
          {todayRecord?.overtime && todayRecord.overtime > 0 && (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-amber-700 dark:text-amber-300">اضافه‌کاری</span>
              </div>
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {toPersianDigits(todayRecord.overtime)} ساعت
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
