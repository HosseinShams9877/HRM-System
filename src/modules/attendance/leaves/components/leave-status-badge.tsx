import { Badge } from '@/core/components/ui/badge'
import { STATUS_CONFIG } from '../constants'

export function LeaveStatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return <Badge className={`text-[10px] ${c.badgeClass}`}>{c.label}</Badge>
}
