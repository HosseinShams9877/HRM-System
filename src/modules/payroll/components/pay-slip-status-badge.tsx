import { Badge } from '@/core/components/ui/badge'
import { STATUS_MAP } from '../constants'

// ============================================
// PaySlipStatusBadge
// ============================================

export function PaySlipStatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.draft
  const Icon = s.icon
  return (
    <Badge className={`text-[10px] gap-1 font-medium ${s.color}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </Badge>
  )
}
