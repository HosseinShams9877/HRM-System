// src/modules/payroll/components/settings/components/settings-empty-state.tsx

'use client'

import { Button } from '@/core/components/ui/button'
import { Plus, Sparkles, Zap, ShieldCheck, TrendingDown, Calculator } from 'lucide-react'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits } from '@/core/lib/utils-fa'

interface SettingsEmptyStateProps {
  year: number
  onRefresh: () => void
  onEdit: () => void
}

export function SettingsEmptyState({ year, onRefresh, onEdit }: SettingsEmptyStateProps) {
  const { toast } = useToast()

  const handleSeed = async () => {
    try {
      const res = await fetch('/api/payroll/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year }),
      })
      if (res.ok) {
        const json = await res.json()
        toast({ title: json.message || 'داده‌های پیش‌فرض ایجاد شد' })
        onRefresh()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 border border-emerald-200 dark:border-emerald-800/50 p-6">
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-200/30 dark:bg-emerald-700/10 rounded-full -translate-x-8 -translate-y-8" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-teal-200/30 dark:bg-teal-700/10 rounded-full translate-x-6 translate-y-6" />
      <div className="relative flex flex-col items-center text-center">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-1">
          تنظیمات حقوقی سال {toPersianDigits(year)}
        </h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4 max-w-md">
          با شروع سریع، تنظیمات حقوقی، آیتم‌های حقوقی (مزایا و کسورات) و پله‌های مالیاتی سال {toPersianDigits(year)} به‌صورت خودکار ایجاد خواهند شد.
        </p>
        <div className="flex items-center gap-4 mb-5 text-xs text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{toPersianDigits(6)} آیتم مزایا</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            <span>{toPersianDigits(4)} آیتم کسورات</span>
          </div>
          <div className="flex items-center gap-1">
            <Calculator className="w-4 h-4" />
            <span>{toPersianDigits(5)} پله مالیاتی</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSeed}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md px-6"
          >
            <Zap className="w-4 h-4" />
            شروع سریع
          </Button>
          <Button
            variant="outline"
            onClick={onEdit}
            className="gap-1 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <Plus className="w-3 h-3" />
            ایجاد دستی
          </Button>
        </div>
      </div>
    </div>
  )
}