// src/modules/orders/components/order-stats.tsx
'use client'

import { Card, CardContent } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface OrderStats {
  total: number
  executed: number
  active: number
  pending: number
}

const statsConfig = [
  { title: 'کل احکام', key: 'total', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { title: 'اجرا شده', key: 'executed', icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { title: 'در حال اجرا', key: 'active', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  { title: 'در انتظار تایید', key: 'pending', icon: AlertCircle, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
]

export function OrderStats({ stats }: { stats: OrderStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statsConfig.map(({ title, key, icon: Icon, color, bgColor }) => (
        <Card key={key} className="border-0 shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{title}</p>
                <p className="text-2xl font-bold mt-1">{toPersianDigits(stats[key as keyof OrderStats])}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}