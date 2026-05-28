'use client'

import { Loader2 } from 'lucide-react'

/**
 * PageLoading — consistent loading indicator for modules.
 * Replaces ad-hoc "در حال بارگذاری..." patterns across all modules.
 */
interface PageLoadingProps {
  message?: string
  fullHeight?: boolean
}

export function PageLoading({
  message = 'در حال بارگذاری...',
  fullHeight = true,
}: PageLoadingProps) {
  return (
    <div className={`flex items-center justify-center ${fullHeight ? 'h-[60vh]' : 'py-16'}`}>
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        </div>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}
