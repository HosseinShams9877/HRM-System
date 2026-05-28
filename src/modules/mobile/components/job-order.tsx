'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  FileBadge, Loader2, Calendar, Building2, User,
  Briefcase, UserCheck, FileText
} from 'lucide-react'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

const ORDER_TYPES = ['حکم کارگزینی', 'حکم انتقال', 'حکم تغییر سمت', 'حکم تمدید']

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'فعال', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
  expired: { label: 'منقضی', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300' },
  terminated: { label: 'فسخ شده', color: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300' },
  draft: { label: 'پیش‌نویس', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
}

const TYPE_ICON_MAP: Record<string, React.ElementType> = {
  'حکم کارگزینی': UserCheck,
  'حکم انتقال': Building2,
  'حکم تغییر سمت': Briefcase,
  'حکم تمدید': FileText,
}

export default function JobOrder() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all contract types that are orders
        const allOrders: any[] = []
        for (const type of ORDER_TYPES) {
          const res = await fetch(`/api/contracts?type=${encodeURIComponent(type)}`)
          if (res.ok) {
            const data = await res.json()
            allOrders.push(...(data.contracts || []))
          }
        }
        setOrders(allOrders)
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

  if (orders.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <FileBadge className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">حکم کاری یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order: any) => {
        const status = STATUS_MAP[order.status] || STATUS_MAP.draft
        const TypeIcon = TYPE_ICON_MAP[order.type] || FileBadge

        return (
          <Card key={order.id} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <TypeIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  {order.title}
                </CardTitle>
                <Badge className={`${status.color} text-[10px]`}>
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Order Type */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs text-amber-700 dark:text-amber-300">نوع حکم</span>
                </div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{order.type}</span>
              </div>

              {/* Contract Number */}
              {order.contractNumber && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-muted-foreground">شماره حکم</span>
                  </div>
                  <span className="text-sm font-medium">{toPersianDigits(order.contractNumber)}</span>
                </div>
              )}

              {/* Employee */}
              {order.employee && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-sky-500" />
                    <span className="text-xs text-muted-foreground">کارمند</span>
                  </div>
                  <span className="text-sm font-medium">
                    {order.employee.firstName} {order.employee.lastName}
                  </span>
                </div>
              )}

              {/* Position/Department */}
              {order.department && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">دپارتمان</span>
                  </div>
                  <span className="text-sm font-medium">{order.department}</span>
                </div>
              )}

              <Separator />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
                  <Calendar className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-[10px] text-muted-foreground">تاریخ صدور</div>
                  <div className="text-xs font-medium">{formatShamsi(order.startDate)}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-center">
                  <Calendar className="w-3.5 h-3.5 mx-auto mb-1 text-red-600 dark:text-red-400" />
                  <div className="text-[10px] text-muted-foreground">تاریخ پایان</div>
                  <div className="text-xs font-medium">
                    {order.endDate ? formatShamsi(order.endDate) : 'نامحدود'}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-[10px] text-muted-foreground block mb-1">توضیحات</span>
                  <p className="text-xs">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
