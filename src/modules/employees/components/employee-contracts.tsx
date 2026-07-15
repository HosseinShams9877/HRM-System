// src/modules/employees/components/EmployeeContracts.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Eye, Download, FileText, Loader2, Calendar } from 'lucide-react'
import { useEmployeeContracts } from '../hooks/use-employee-contracts'
import { formatShamsi, toPersianDigits } from '@/core/lib/utils-fa'
import { ContractDetailDialog } from '../../contracts/components/contract-detail-dialog'

interface EmployeeContractsProps {
  employeeId: string
  employeeName?: string
}
const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '—'
    const persian = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
    // تبدیل اعداد به فارسی
    return persian.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
  } catch {
    return '—'
  }
}
const getTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    'permanent': 'دائم',
    'temporary': 'موقت',
    'official': 'دائم',
    'contractual': 'قراردادی',
    'hourly': 'ساعتی',
    'part_time': 'پاره‌وقت',
    'full_time': 'تمام‌وقت',
    'contract': 'قراردادی',
    'freelance': 'آزاد',
  }
  return map[type] || type
}

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: 'فعال', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    expired: { label: 'منقضی', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    terminated: { label: 'فسخ شده', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    draft: { label: 'پیش‌نویس', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300' },
  }
  return map[status] || map.draft
}

export function EmployeeContracts({ employeeId, employeeName }: EmployeeContractsProps) {
  const { data: contracts = [], isLoading, error } = useEmployeeContracts(employeeId)
  const [detailContract, setDetailContract] = useState<any>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p className="text-sm">خطا در دریافت قراردادها</p>
        <p className="text-xs mt-1">{(error as Error).message}</p>
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">هیچ قراردادی ثبت نشده</p>
        <p className="text-xs mt-1">برای ثبت قرارداد، از بخش مدیریت قراردادها استفاده کنید</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">لیست قراردادها</h4>
        <span className="text-xs text-muted-foreground">
          {toPersianDigits(contracts.length)} قرارداد
        </span>
      </div>

      <div className="space-y-3">
        {contracts.map((contract: any) => {
          const status = getStatusBadge(contract.status)
          const isActive = contract.status === 'active'

          return (
            <div
              key={contract.id}
              className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-2 mb-1 justify-end flex-wrap">
                    <h5 className="font-medium">{contract.title || 'بدون عنوان'}</h5>
                    <Badge className={`text-[10px] ${status.className}`}>
                      {status.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {getTypeLabel(contract.type)}
                    </Badge>
                    {isActive && (
                      <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        جاری
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground justify-end flex-wrap">
                    <span className="flex items-center gap-1" dir='rtl'>
                      <Calendar className="w-3 h-3" />
                      {toPersianDigits(contract.startDate)} - 
                      {contract.endDate ? toPersianDigits(contract.endDate) : 'نامحدود'}
                    </span>
                    {contract.contractNumber && (
                      <span dir='rtl'>شماره: {contract.contractNumber}</span>
                    )}
                    {contract.amount && (
                      <span>مبلغ: {toPersianDigits(contract.amount.toLocaleString())} ریال</span>
                    )}
                  </div>

                  {contract.notes && (
                    <p className="text-xs text-muted-foreground mt-2" dir='rtl'>{contract.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    onClick={() => setDetailContract(contract)}
                    title="جزئیات"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Contract Detail Dialog */}
      <ContractDetailDialog
        open={!!detailContract}
        onClose={() => setDetailContract(null)}
        contract={detailContract}
      />
    </div>
  )
}