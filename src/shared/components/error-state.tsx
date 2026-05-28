'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

/**
 * ErrorState — consistent error display with retry action.
 * Used when API calls fail or unexpected errors occur.
 */
interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'خطا در بارگذاری',
  message = 'لطفاً دوباره تلاش کنید',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2 text-xs"
          onClick={onRetry}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          تلاش مجدد
        </Button>
      )}
    </div>
  )
}
