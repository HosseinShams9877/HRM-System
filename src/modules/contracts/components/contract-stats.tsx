'use client'

import { Card, CardContent } from '@/core/components/ui/card'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { FileText, CheckCircle, AlertCircle } from 'lucide-react'
import {Contract } from '../index'


interface ContractStatsProps {
  contracts: Contract[]
}

const StatsCard = ({ title, value, icon: Icon, color, bgColor, subText }: { 
  title: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
  subText?: string
}) => {
  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{toPersianDigits(value)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
            {subText && <p className="text-[9px] text-muted-foreground mt-0.5">{subText}</p>}
          </div>
          <div className={`p-3 rounded-2xl ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ContractStats({ contracts }: { contracts: Contract[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      <StatsCard 
        title="کل قراردادها" 
        value={contracts.length} 
        icon={FileText}
        color="text-blue-600 dark:text-blue-400"
        bgColor="bg-blue-50 dark:bg-blue-950/30"
      />
      <StatsCard 
        title="فعال" 
        value={contracts.filter(c => c.status === 'active').length} 
        icon={CheckCircle}
        color="text-emerald-600 dark:text-emerald-400"
        bgColor="bg-emerald-50 dark:bg-emerald-950/30"
      />
      <StatsCard 
        title="دائم" 
        value={contracts.filter(c => c.type === 'official' && c.status === 'active').length} 
        icon={CheckCircle}
        color="text-emerald-600 dark:text-emerald-400"
        bgColor="bg-emerald-50 dark:bg-emerald-950/30"
      />
      <StatsCard 
        title="موقت" 
        value={contracts.filter(c => c.type === 'temporary' && c.status === 'active').length} 
        icon={AlertCircle}
        color="text-amber-600 dark:text-amber-400"
        bgColor="bg-amber-50 dark:bg-amber-950/30"
      />
    </div>
  )
}