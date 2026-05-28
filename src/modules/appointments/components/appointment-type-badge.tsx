import { Badge } from '@/core/components/ui/badge'

export function AppointmentTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    'اصلی': { label: 'اصلی', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
    'سرپرست': { label: 'سرپرست', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    'موقت': { label: 'موقت', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    'Acting': { label: 'سرپرست موقت', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  }
  const c = config[type] || { label: type, className: 'bg-muted text-muted-foreground border-border' }
  return <Badge variant="outline" className={`text-[10px] font-medium ${c.className}`}>{c.label}</Badge>
}
