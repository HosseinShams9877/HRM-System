'use client'

import type { LucideIcon } from 'lucide-react'

/**
 * ModuleHeader — consistent header for all HR modules.
 * Renders a gradient icon, title, subtitle, and optional action area.
 */
interface ModuleHeaderProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  gradient?: string
  actions?: React.ReactNode
  badges?: React.ReactNode
}

const GRADIENT_PRESETS: Record<string, string> = {
  emerald: 'from-emerald-500 to-teal-600',
  blue: 'from-blue-500 to-cyan-600',
  purple: 'from-purple-500 to-violet-600',
  amber: 'from-amber-500 to-orange-600',
  rose: 'from-rose-500 to-pink-600',
  teal: 'from-teal-500 to-emerald-600',
  sky: 'from-sky-500 to-blue-600',
  indigo: 'from-indigo-500 to-purple-600',
}

export function ModuleHeader({
  icon: Icon,
  title,
  subtitle,
  gradient = 'emerald',
  actions,
  badges,
}: ModuleHeaderProps) {
  const gradientClass = GRADIENT_PRESETS[gradient] || GRADIENT_PRESETS.emerald

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientClass}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {badges && <div className="flex items-center gap-2 mt-1 sm:mt-0">{badges}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
