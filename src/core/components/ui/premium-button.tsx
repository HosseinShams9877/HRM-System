'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/core/lib/utils'

type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'ghost' 
  | 'destructive' 
  | 'outline' 
  | 'gradient' 
  | 'glass'
  | 'glow'

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ElementType
  rightIcon?: React.ElementType
  glowEffect?: boolean
  rippleEffect?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
  ghost:
    'hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
  destructive:
    'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90 active:scale-[0.98]',
  outline:
    'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50 active:scale-[0.98]',
  gradient:
    'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:from-primary hover:to-primary/90 active:scale-[0.98]',
  glass:
    'bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-white/10 text-foreground hover:bg-white/90 dark:hover:bg-slate-800/90 shadow-lg active:scale-[0.98]',
  glow:
    'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.98]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  'icon-sm': 'h-8 w-8 p-0 rounded-lg',
  icon: 'h-10 w-10 p-0 rounded-xl',
  'icon-lg': 'h-12 w-12 p-0 rounded-xl',
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      glowEffect = false,
      rippleEffect = true,
      fullWidth = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          'relative overflow-hidden select-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {/* Ripple Effect */}
        {rippleEffect && (
          <motion.span
            className="absolute inset-0 bg-white/20 rounded-inherit"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{
              scale: 2.5,
              opacity: 0,
              transition: { duration: 0.5 },
            }}
          />
        )}

        {/* Glow Sweep on Hover */}
        {glowEffect && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%', transition: { duration: 0.6 } }}
          />
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        )}

        {/* Left Icon */}
        {!isLoading && LeftIcon && (
          <LeftIcon className="w-4 h-4 shrink-0" />
        )}

        {/* Content */}
        <span className={isLoading ? 'opacity-70' : ''}>{children}</span>

        {/* Right Icon */}
        {!isLoading && RightIcon && (
          <RightIcon className="w-4 h-4 shrink-0" />
        )}
      </motion.button>
    )
  }
)

PremiumButton.displayName = 'PremiumButton'