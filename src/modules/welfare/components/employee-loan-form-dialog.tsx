'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Calculator, X } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/core/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Separator } from '@/core/components/ui/separator'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { LOAN_TYPES } from '../constants'
import { toast } from 'sonner'

// ============================================
// Employee Loan Form Dialog — بدون سلکتور کارمند
// ============================================

interface EmployeeLoanFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { employeeId: string; type: string; amount: number; reason: string | null; installments: number | null }) => Promise<void>
  employeeId: string
  employeeName: string
  employeeDepartment: string | null
  saving: boolean
}

export function EmployeeLoanFormDialog({
  open,
  onClose,
  onSubmit,
  employeeId,
  employeeName,
  employeeDepartment,
  saving,
}: EmployeeLoanFormDialogProps) {
  const [form, setForm] = useState({
    type: LOAN_TYPES[0] || 'وام',
    amount: '',
    reason: '',
    installments: '',
  })

  useEffect(() => {
    if (open) {
      setForm({
        type: LOAN_TYPES[0] || 'وام',
        amount: '',
        reason: '',
        installments: '',
      })
    }
  }, [open])

  const handleSubmit = async () => {
    if (!form.amount) {
      toast.error('لطفاً مبلغ وام را وارد کنید')
      return
    }
    await onSubmit({
      employeeId,
      type: form.type,
      amount: parseFloat(form.amount),
      reason: form.reason || null,
      installments: form.installments ? parseInt(form.installments) : null,
    })
  }

  const monthlyInstallment = form.amount && form.installments
    ? Math.round(parseFloat(form.amount) / parseInt(form.installments))
    : 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-600" />
              درخواست وام جدید
            </DialogTitle>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* نمایش اطلاعات کارمند (فقط خواندنی) */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-bold">
                {employeeName?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{employeeName}</p>
              <p className="text-[10px] text-muted-foreground">{employeeDepartment || 'بدون دپارتمان'}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">نوع وام *</label>
              <Select
                value={form.type}
                onValueChange={(val) => setForm({ ...form, type: val })}
              >
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TYPES.map(t => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">مبلغ (تومان) *</label>
              <Input
                type="text"
                inputMode="numeric"
                value={form.amount}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  setForm({ ...form, amount: val })
                }}
                className="text-xs"
                placeholder="۰"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium">تعداد اقساط</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.installments}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setForm({ ...form, installments: val })
                  }}
                  className="text-xs"
                  placeholder="۱۲"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">دلیل</label>
                <Input
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="text-xs"
                  placeholder="دلیل (اختیاری)"
                />
              </div>
            </div>

            {form.amount && form.installments && (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">مبلغ هر قسط:</span>
                <span className="text-xs font-bold text-foreground">
                  {formatCurrency(monthlyInstallment)}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            انصراف
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving || !form.amount} className="text-xs">
            {saving ? 'در حال ثبت...' : 'ثبت درخواست'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}