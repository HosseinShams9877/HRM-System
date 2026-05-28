'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/core/lib/utils'
import { forwardRef, ReactNode } from 'react'

type CardVariant = 'default' | 'glass' | 'gradient' | 'neon' | 'elevated' | 'stat' | 'glass-strong'

interface PremiumCardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant
  hoverEffect?: boolean
  glowColor?: string
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  padding?: 'sm' | 'md' | 'lg' | 'none'
  className?: string
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-card border border-border shadow-sm',
  glass: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl',
  'glass-strong': 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/25 dark:border-white/10 shadow-2xl',
  gradient: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-0 shadow-2xl',
  neon: 'bg-card border-2 shadow-[0_0_30px_var(--glow-color)]',
  elevated: 'bg-card border-0 shadow-xl shadow-black/5 dark:shadow-black/20 hover:shadow-2xl',
  stat: 'border-0 shadow-lg hover:shadow-2xl transition-all duration-300',
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      variant = 'elevated',
      hoverEffect = true,
      glowColor = 'rgba(16, 185, 129, 0.15)',
      children,
      header,
      footer,
      padding = 'md',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl transition-all duration-300',
          variantStyles[variant],
          paddingStyles[padding],
          hoverEffect && [
            'hover:-translate-y-1',
            'hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30',
          ],
          className
        )}
        whileHover={
          hoverEffect
            ? { scale: 1.01, transition: { duration: 0.2 } }
            : undefined
        }
        style={
          variant === 'neon'
            ? ({ '--glow-color': glowColor } as React.CSSProperties)
            : undefined
        }
        {...props}
      >
        {(variant === 'glass' || variant === 'glass-strong' || variant === 'gradient') && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
              animate={{
                x: ['100%', '-100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        )}

        {header && (
          <div className="mb-4 pb-4 border-b border-border/50">{header}</div>
        )}

        <div className="relative z-10">{children}</div>

        {footer && (
          <div className="mt-4 pt-4 border-t border-border/50">{footer}</div>
        )}
      </motion.div>
    )
  }
)

PremiumCard.displayName = 'PremiumCard'

export function StatCardWrapper({ 
  children, 
  className,
  glow = false,
  ...props 
}: HTMLMotionProps<'div'> & { glow?: boolean }) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border-0 shadow-lg',
        'hover:shadow-2xl hover:-translate-y-1',
        'transition-all duration-300 cursor-pointer',
        glow && 'hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}