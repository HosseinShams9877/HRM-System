import { Badge } from '@/core/components/ui/badge'

export function AppointmentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'فعال', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    ended: { label: 'پایان‌یافته', className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800' },
    cancelled: { label: 'لغوشده', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800' },
  }
  const c = config[status] || config.active
  return <Badge variant="outline" className={`text-[10px] font-medium ${c.className}`}>{c.label}</Badge>
}
