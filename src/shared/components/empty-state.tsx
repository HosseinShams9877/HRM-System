'use client'

import type { LucideIcon } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

/**
 * EmptyState — consistent empty state display across all modules.
 * Renders an icon, title, description, and optional action button.
 */
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground/30" />
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground/70 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2 text-xs"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
