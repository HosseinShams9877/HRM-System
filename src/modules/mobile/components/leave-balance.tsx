'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Progress } from '@/core/components/ui/progress'
import { Separator } from '@/core/components/ui/separator'
import {
  CalendarOff, Loader2, TrendingUp, TrendingDown, Minus,
  CalendarDays, Heart, UserX, PartyPopper
} from 'lucide-react'
import { toPersianDigits } from '@/core/lib/utils-fa'

interface LeaveBalanceItem {
  type: string
  label: string
  total: number
  used: number
  remaining: number
  icon: React.ElementType
  color: string
  bgColor: string
}

// Default leave balance data for demo
const DEFAULT_BALANCES: LeaveBalanceItem[] = [
  {
    type: 'استحقاقی',
    label: 'مرخصی استحقاقی',
    total: 26,
    used: 8,
    remaining: 18,
    icon: CalendarDays,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/30',
  },
  {
    type: 'استعلاجی',
    label: 'مرخصی استعلاجی',
    total: 15,
    used: 3,
    remaining: 12,
    icon: Heart,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
  },
  {
    type: 'بدون حقوق',
    label: 'مرخصی بدون حقوق',
    total: 30,
    used: 0,
    remaining: 30,
    icon: UserX,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    type: 'ازدواج',
    label: 'مرخصی ازدواج',
    total: 7,
    used: 0,
    remaining: 7,
    icon: PartyPopper,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    type: 'فوت',
    label: 'مرخصی فوت',
    total: 5,
    used: 0,
    remaining: 5,
    icon: CalendarOff,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
  },
]

export default function LeaveBalance() {
  const [loading, setLoading] = useState(true)
  const [balances, setBalances] = useState<LeaveBalanceItem[]>(DEFAULT_BALANCES)
  const [leaves, setLeaves] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/leaves')
        if (res.ok) {
          const data = await res.json()
          const allLeaves = data.leaves || []
          setLeaves(allLeaves)

          // Calculate leave balances from actual data
          const usedByType: Record<string, number> = {}
          for (const leave of allLeaves) {
            if (leave.status === 'approved') {
              usedByType[leave.type] = (usedByType[leave.type] || 0) + leave.totalDays
            }
          }

          const updatedBalances = DEFAULT_BALANCES.map(b => ({
            ...b,
            used: usedByType[b.type] || b.used,
            remaining: b.total - (usedByType[b.type] || b.used),
          }))
          setBalances(updatedBalances)
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    )
  }

  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0)
  const totalRemaining = balances.reduce((sum, b) => sum + b.remaining, 0)
  const totalAll = balances.reduce((sum, b) => sum + b.total, 0)

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-sky-500 to-blue-600 text-white">
        <CardContent className="p-5">
          <div className="text-center mb-3">
            <span className="text-xs opacity-80">موجودی کل مرخصی</span>
            <div className="text-3xl font-bold mt-1">{toPersianDigits(totalRemaining)} روز</div>
            <span className="text-xs opacity-70">از {toPersianDigits(totalAll)} روز</span>
          </div>
          <Progress value={(totalUsed / totalAll) * 100} className="h-2 bg-white/20" />
          <div className="flex justify-between mt-2 text-xs opacity-80">
            <span>استفاده شده: {toPersianDigits(totalUsed)} روز</span>
            <span>باقیمانده: {toPersianDigits(totalRemaining)} روز</span>
          </div>
        </CardContent>
      </Card>

      {/* Individual Balances */}
      <div className="space-y-3">
        {balances.map((balance) => {
          const percentage = balance.total > 0 ? (balance.used / balance.total) * 100 : 0
          const trend = balance.used === 0 ? 'neutral' : percentage > 60 ? 'high' : 'low'
          const Icon = balance.icon

          return (
            <Card key={balance.type} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${balance.bgColor}`}>
                    <Icon className={`w-4 h-4 ${balance.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{balance.label}</span>
                      <div className="flex items-center gap-1">
                        {trend === 'high' && <TrendingUp className="w-3 h-3 text-red-500" />}
                        {trend === 'low' && <TrendingDown className="w-3 h-3 text-emerald-500" />}
                        {trend === 'neutral' && <Minus className="w-3 h-3 text-gray-400" />}
                        <span className={`text-sm font-bold ${balance.color}`}>
                          {toPersianDigits(balance.remaining)} روز
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Progress value={percentage} className="h-2 mb-2" />

                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>استفاده: {toPersianDigits(balance.used)} روز</span>
                  <span>کل: {toPersianDigits(balance.total)} روز</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
