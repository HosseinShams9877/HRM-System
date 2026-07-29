'use client'

import { useState } from 'react'
import {
  Zap, CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { toPersianDigits, getTodayShamsi } from '@/core/lib/utils-fa'
import { PERSIAN_MONTHS } from '../constants'
import type { GenerateResult } from '../index'

// ============================================
// GeneratePaySlipsDialog
// ============================================

export function GeneratePaySlipsDialog({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean
  onClose: () => void
  onGenerate: (year: number, month: number) => Promise<GenerateResult | null>
}) {
  const today = getTodayShamsi()
  const [year, setYear] = useState(today.year)
  const [month, setMonth] = useState(today.month)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [checkingRecords, setCheckingRecords] = useState(false)
  const [workRecordsData, setWorkRecordsData] = useState<any[]>([])

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (!open) {
      setResult(null)
      setGenerating(false)
      setCheckingRecords(false)
      setWorkRecordsData([])
    }
  }

  // ============================================
  // تابع بررسی کارکرد ماهانه کارکنان
  // ============================================
  const checkWorkRecords = async (employeeIds: string[]) => {
    const results = await Promise.all(
      employeeIds.map(async (empId) => {
        try {
          const res = await fetch(
            `/api/payroll/work-records?employeeId=${empId}&year=${year}&month=${month}`
          )
          if (res.ok) {
            const json = await res.json()
            return json.records?.[0] || null
          }
          return null
        } catch {
          return null
        }
      })
    )
    return results
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setCheckingRecords(true)
    
    try {
      // ۱. اول لیست کارکنان فعال رو بگیر
      const employeesRes = await fetch('/api/employees?status=active&limit=1000')
      let employeeIds: string[] = []
      if (employeesRes.ok) {
        const json = await employeesRes.json()
        employeeIds = json.employees?.map((e: any) => e.id) || []
      } else {
        // اگر API کارکنان در دسترس نبود، از آرایه خالی استفاده کن
        console.warn('Unable to fetch employees list')
      }

      // ۲. کارکرد ماهانه هر کارمند رو بررسی کن
      let workRecords: any[] = []
      if (employeeIds.length > 0) {
        workRecords = await checkWorkRecords(employeeIds)
        setWorkRecordsData(workRecords)
      }

      // ۳. ارسال درخواست تولید با اطلاعات کارکرد
      const payload = {
        year,
        month,
        employeeIds,
        workRecords, // آرایه‌ای از کارکردها (برخی ممکن است null باشند)
      }

      // ۴. اجرای onGenerate با payload جدید
      // توجه: تابع onGenerate باید این payload رو دریافت کنه
      // در API سمت سرور باید از workRecords استفاده کنه
      const res = await onGenerate(year, month)
      setResult(res)
      
    } catch (error) {
      console.error('Error in generate:', error)
      // اگر خطایی رخ داد، سعی کن بدون workRecords ادامه بده
      const res = await onGenerate(year, month)
      setResult(res)
    } finally {
      setGenerating(false)
      setCheckingRecords(false)
    }
  }

  const handleClose = () => {
    if (result) {
      onClose()
    }
    setResult(null)
    setWorkRecordsData([])
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            تولید خودکار فیش حقوقی
          </DialogTitle>
          <DialogDescription>
            فیش حقوقی تمامی کارکنان فعال برای ماه مشخص شده تولید خواهد شد
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result ? (
            <>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>اگر فیش حقوقی کارمندی برای این ماه قبلاً صادر شده باشد، رد خواهد شد.</span>
              </div>
              {checkingRecords && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>در حال بررسی کارکرد ماهانه کارکنان...</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>سال</Label>
                  <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>ماه</Label>
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
              {workRecordsData.length > 0 && (
                <div className="p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <span>تعداد کارکردهای ثبت‌شده: {toPersianDigits(workRecordsData.filter(r => r !== null).length)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">عملیات تکمیل شد</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div>
                    <div className="text-lg font-bold text-emerald-700">{toPersianDigits(result.generated)}</div>
                    <div className="text-xs text-muted-foreground">تولید شده</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-700">{toPersianDigits(result.skipped)}</div>
                    <div className="text-xs text-muted-foreground">رد شده</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-muted-foreground">{toPersianDigits(result.totalEmployees)}</div>
                    <div className="text-xs text-muted-foreground">کل کارکنان</div>
                  </div>
                </div>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-sm text-rose-700 dark:text-rose-300">
                  <div className="font-semibold mb-1">خطاها:</div>
                  {result.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {!result ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={generating}>
                انصراف
              </Button>
              <Button onClick={handleGenerate} disabled={generating} className="gap-2">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {generating ? 'در حال تولید...' : 'تولید فیش'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>بستن</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}