'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  FileBadge, Loader2, Calendar, Building2, DollarSign,
  User, FileText, AlertTriangle, CheckCircle2
} from 'lucide-react'
import { toPersianDigits, formatShamsi, formatCurrency, getTodayShamsi } from '@/core/lib/utils-fa'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'فعال', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
  expired: { label: 'منقضی', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300' },
  terminated: { label: 'فسخ شده', color: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300' },
  draft: { label: 'پیش‌نویس', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
}

export default function ContractView() {
  const [loading, setLoading] = useState(true)
  const [contracts, setContracts] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/contracts?type=قرارداد')
        if (res.ok) {
          const data = await res.json()
          setContracts(data.contracts || [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <FileBadge className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">قراردادی یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract: any) => {
        const status = STATUS_MAP[contract.status] || STATUS_MAP.draft
        const isExpiring = contract.endDate && (() => {
          const today = getTodayShamsi()
          const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
          const [ey, em, ed] = contract.endDate.split('/').map(Number)
          const [ny, nm, nd] = todayStr.split('/').map(Number)
          const endTotal = (ey * 365) + (em * 31) + ed
          const nowTotal = (ny * 365) + (nm * 31) + nd
          const diff = endTotal - nowTotal
          return diff >= 0 && diff <= 30
        })()

        return (
          <Card key={contract.id} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <FileBadge className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  {contract.title}
                </CardTitle>
                <Badge className={`${status.color} text-[10px]`}>
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Contract Number */}
              {contract.contractNumber && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-muted-foreground">شماره قرارداد</span>
                  </div>
                  <span className="text-sm font-medium">{toPersianDigits(contract.contractNumber)}</span>
                </div>
              )}

              {/* Employee */}
              {contract.employee && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-sky-500" />
                    <span className="text-xs text-muted-foreground">کارمند</span>
                  </div>
                  <span className="text-sm font-medium">
                    {contract.employee.firstName} {contract.employee.lastName}
                  </span>
                </div>
              )}

              {/* Department */}
              {contract.department && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">دپارتمان</span>
                  </div>
                  <span className="text-sm font-medium">{contract.department}</span>
                </div>
              )}

              <Separator />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
                  <Calendar className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-[10px] text-muted-foreground">تاریخ شروع</div>
                  <div className="text-xs font-medium">{formatShamsi(contract.startDate)}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-center">
                  <Calendar className="w-3.5 h-3.5 mx-auto mb-1 text-red-600 dark:text-red-400" />
                  <div className="text-[10px] text-muted-foreground">تاریخ پایان</div>
                  <div className="text-xs font-medium">
                    {contract.endDate ? formatShamsi(contract.endDate) : 'نامحدود'}
                  </div>
                </div>
              </div>

              {/* Amount */}
              {contract.amount && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-amber-700 dark:text-amber-300">مبلغ قرارداد</span>
                  </div>
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                    {formatCurrency(contract.amount)}
                  </span>
                </div>
              )}

              {/* Expiring Warning */}
              {isExpiring && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/20 border-r-4 border-r-red-500">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs text-red-700 dark:text-red-300">قرارداد در حال انقضا!</span>
                </div>
              )}

              {/* Notes */}
              {contract.notes && (
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-[10px] text-muted-foreground block mb-1">توضیحات</span>
                  <p className="text-xs">{contract.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
