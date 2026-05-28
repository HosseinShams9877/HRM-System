'use client'

import { CreditCard, Calculator } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/core/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Separator } from '@/core/components/ui/separator'
import { formatCurrency } from '@/core/lib/utils-fa'
import { LOAN_TYPES } from '../constants'
import type { Employee, Loan } from '../index'

// ============================================
// Loan Form Dialog — وام
// ============================================

interface LoanFormDialogProps {
  open: boolean
  editingLoan: Loan | null
  loanForm: { employeeId: string; type: string; amount: number; reason: string; installments: number }
  employees: Employee[]
  saving: boolean
  onFormChange: (form: { employeeId: string; type: string; amount: number; reason: string; installments: number }) => void
  onSave: () => void
  onClose: () => void
}

export function LoanFormDialog({
  open,
  editingLoan,
  loanForm,
  employees,
  saving,
  onFormChange,
  onSave,
  onClose,
}: LoanFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-sky-600" />
            {editingLoan ? 'ویرایش درخواست' : 'درخواست وام'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Employee Selection */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">کارمند *</label>
            <Select
              value={loanForm.employeeId}
              onValueChange={(val) => onFormChange({ ...loanForm, employeeId: val })}
            >
              <SelectTrigger className="w-full text-xs h-9">
                <SelectValue placeholder="انتخاب کارمند" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id} className="text-xs">
                    {e.firstName} {e.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Type & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">نوع *</label>
              <Select
                value={loanForm.type}
                onValueChange={(val) => onFormChange({ ...loanForm, type: val })}
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
            <div>
              <label className="text-xs font-medium mb-1.5 block">مبلغ (تومان) *</label>
              <Input
                type="number"
                value={loanForm.amount || ''}
                onChange={e => onFormChange({ ...loanForm, amount: +e.target.value })}
                className="text-xs"
                placeholder="۰"
              />
            </div>
          </div>

          {/* Installments & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">تعداد اقساط</label>
              <Input
                type="number"
                value={loanForm.installments || ''}
                onChange={e => onFormChange({ ...loanForm, installments: +e.target.value })}
                className="text-xs"
                placeholder="۱۲"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">دلیل</label>
              <Input
                value={loanForm.reason}
                onChange={e => onFormChange({ ...loanForm, reason: e.target.value })}
                className="text-xs"
                placeholder="دلیل درخواست (اختیاری)"
              />
            </div>
          </div>

          {/* Calculated Monthly Installment */}
          {loanForm.amount > 0 && loanForm.installments > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">مبلغ هر قسط:</span>
              <span className="text-xs font-bold text-foreground">
                {formatCurrency(Math.round(loanForm.amount / loanForm.installments))}
              </span>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">انصراف</Button>
          <Button size="sm" onClick={onSave} disabled={saving} className="text-xs">
            {saving ? 'ذخیره...' : editingLoan ? 'بروزرسانی' : 'ذخیره'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
