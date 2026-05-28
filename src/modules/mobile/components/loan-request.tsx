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
  CreditCard, Send, Loader2, Clock, CheckCircle2, XCircle,
  DollarSign, Wallet, History
} from 'lucide-react'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { toast } from 'sonner'

const LOAN_TYPES = [
  { value: 'وام', label: 'وام' },
  { value: 'مساعده', label: 'مساعده' },
]

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300', icon: Clock },
  approved: { label: 'تأیید شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300', icon: CheckCircle2 },
  rejected: { label: 'رد شده', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300', icon: XCircle },
  paid: { label: 'پرداخت شده', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300', icon: CheckCircle2 },
}

export default function LoanRequest() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loans, setLoans] = useState<any[]>([])
  const [form, setForm] = useState({
    type: '',
    amount: '',
    reason: '',
    installments: '',
  })

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/loans')
      if (res.ok) {
        const data = await res.json()
        setLoans(Array.isArray(data) ? data : [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  const handleSubmit = async () => {
    if (!form.type || !form.amount) {
      toast.error('لطفاً نوع و مبلغ را مشخص کنید')
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'demo-employee-1',
          type: form.type,
          amount: parseFloat(form.amount),
          reason: form.reason || null,
          installments: form.installments ? parseInt(form.installments) : null,
        }),
      })
      if (res.ok) {
        toast.success('درخواست وام با موفقیت ثبت شد')
        setForm({ type: '', amount: '', reason: '', installments: '' })
        fetchLoans()
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
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    )
  }

  const pendingCount = loans.filter(l => l.status === 'pending').length
  const approvedCount = loans.filter(l => l.status === 'approved' || l.status === 'paid').length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 w-fit mx-auto mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{toPersianDigits(pendingCount)}</div>
            <div className="text-[10px] text-muted-foreground">در انتظار</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 w-fit mx-auto mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{toPersianDigits(approvedCount)}</div>
            <div className="text-[10px] text-muted-foreground">تأیید شده</div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Request Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <Wallet className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            درخواست وام/مساعده
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">نوع درخواست *</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {LOAN_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs">مبلغ (تومان) *</Label>
            <Input
              type="number"
              placeholder="مثلاً ۵۰۰۰۰۰۰۰"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="text-sm"
            />
          </div>

          {/* Installments */}
          <div className="space-y-1.5">
            <Label className="text-xs">تعداد اقساط</Label>
            <Input
              type="number"
              placeholder="مثلاً ۱۲"
              value={form.installments}
              onChange={e => setForm({ ...form, installments: e.target.value })}
              className="text-sm"
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs">دلیل درخواست</Label>
            <Textarea
              placeholder="توضیحات خود را وارد کنید..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              className="text-sm min-h-[80px]"
            />
          </div>

          <Button
            className="w-full gap-2 bg-purple-500 hover:bg-purple-600"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            ثبت درخواست
          </Button>
        </CardContent>
      </Card>

      {/* Loan History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30">
              <History className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            سوابق درخواست
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs">
              هیچ درخواستی یافت نشد
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loans.map((loan: any) => {
                const status = STATUS_MAP[loan.status] || STATUS_MAP.pending
                const StatusIcon = status.icon
                return (
                  <div key={loan.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs font-medium">{loan.type}</span>
                      </div>
                      <Badge className={`${status.color} text-[10px] gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">مبلغ</span>
                      <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {formatCurrency(loan.amount)}
                      </span>
                    </div>
                    {loan.installments && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>تعداد اقساط</span>
                        <span>{toPersianDigits(loan.installments)} قسط</span>
                      </div>
                    )}
                    {loan.reason && (
                      <p className="text-[11px] text-muted-foreground border-t border-border pt-2">
                        {loan.reason}
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
