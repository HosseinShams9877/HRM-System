'use client'

import {
  FileBadge, Shield
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { toPersianDigits, formatCurrency, formatShamsi, getTodayShamsi } from '@/core/lib/utils-fa'
import type { ContractRecord } from '../index'
import { CONTRACT_TYPES, STATUS_MAP } from '../constants'

// ============================================
// Status Badge
// ============================================

export function ContractStatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.draft
  const Icon = s.icon
  return (
    <Badge className={`text-[10px] gap-1 ${s.color}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </Badge>
  )
}

// ============================================
// Type Badge
// ============================================

export function ContractTypeBadge({ type }: { type: string }) {
  const t = CONTRACT_TYPES.find(c => c.value === type)
  if (!t) return <Badge variant="outline" className="text-[10px]">{type}</Badge>
  return <Badge className={`text-[10px] ${t.color}`}>{t.label}</Badge>
}

// ============================================
// Days Until Expiry
// ============================================

export function DaysUntilExpiry({ endDate, status }: { endDate: string | null; status: string }) {
  if (!endDate || status !== 'active') return null
  const today = getTodayShamsi()
  const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
  const [ey, em, ed] = endDate.split('/').map(Number)
  const [ny, nm, nd] = todayStr.split('/').map(Number)
  const endTotal = (ey * 365) + (em * 31) + ed
  const nowTotal = (ny * 365) + (nm * 31) + nd
  const diff = endTotal - nowTotal

  if (diff < 0) return <span className="text-[10px] text-red-600 font-medium">منقضی شده</span>
  if (diff === 0) return <span className="text-[10px] text-red-600 font-medium">امروز!</span>
  if (diff <= 7) return <span className="text-[10px] text-red-600 font-medium">{toPersianDigits(diff)} روز مانده</span>
  if (diff <= 30) return <span className="text-[10px] text-amber-600 font-medium">{toPersianDigits(diff)} روز مانده</span>
  return <span className="text-[10px] text-muted-foreground">{toPersianDigits(diff)} روز مانده</span>
}

// ============================================
// Contract Detail Dialog
// ============================================

export function ContractDetailDialog({
  open,
  onClose,
  contract,
}: {
  open: boolean
  onClose: () => void
  contract: ContractRecord | null
}) {
  if (!contract) return null

  const typeInfo = CONTRACT_TYPES.find(t => t.value === contract.type)
  const statusInfo = STATUS_MAP[contract.status] || STATUS_MAP.draft

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-blue-600" />
            جزئیات قرارداد/حکم
          </DialogTitle>
          <DialogDescription>
            {contract.contractNumber || '—'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* اطلاعات کارمند */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold">
                {contract.employee.firstName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{contract.employee.firstName} {contract.employee.lastName}</h3>
              <p className="text-sm text-muted-foreground">
                کد پرسنلی: {toPersianDigits(contract.employee.personnelCode)}
                {contract.employee.department && ` • ${contract.employee.department}`}
              </p>
            </div>
            <div className="mr-auto">
              <ContractStatusBadge status={contract.status} />
            </div>
          </div>

          {/* اطلاعات سند */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">نوع سند</div>
              {typeInfo ? (
                <Badge className={`text-xs ${typeInfo.color}`}>{typeInfo.label}</Badge>
              ) : contract.type}
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">شماره</div>
              <div className="text-sm font-mono" dir="ltr">{contract.contractNumber || '—'}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">تاریخ شروع</div>
              <div className="text-sm">{formatShamsi(contract.startDate)}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">تاریخ پایان</div>
              <div className="text-sm">
                {contract.endDate ? (
                  <div className="flex items-center gap-2">
                    {formatShamsi(contract.endDate)}
                    <DaysUntilExpiry endDate={contract.endDate} status={contract.status} />
                  </div>
                ) : 'نامحدود'}
              </div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">مبلغ</div>
              <div className="text-sm font-semibold text-emerald-600">
                {contract.amount ? formatCurrency(contract.amount) : '—'}
              </div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">دپارتمان</div>
              <div className="text-sm">{contract.department || '—'}</div>
            </div>
          </div>

          {/* عنوان */}
          <div className="p-3 rounded-lg border">
            <div className="text-xs text-muted-foreground mb-1">عنوان</div>
            <div className="text-sm font-medium">{contract.title}</div>
          </div>

          {/* توضیحات */}
          {contract.notes && (
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">توضیحات</div>
              <div className="text-sm whitespace-pre-wrap">{contract.notes}</div>
            </div>
          )}

          {/* تأیید */}
          {contract.approvedAt && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">تأیید شده در {formatShamsi(contract.approvedAt)}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>بستن</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
