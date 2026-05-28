import { Badge } from '@/core/components/ui/badge'
import { LEAVE_TYPE_CONFIG, DEFAULT_LEAVE_TYPE } from '../constants'

export function LeaveTypeBadge({ type }: { type: string }) {
  const c = LEAVE_TYPE_CONFIG[type] || DEFAULT_LEAVE_TYPE
  return <Badge variant="outline" className={`text-[10px] ${c.badgeClass}`}>{c.label}</Badge>
}
