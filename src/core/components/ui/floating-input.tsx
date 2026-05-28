'use client'

import { useState, forwardRef, InputHTMLAttributes } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/core/lib/utils'

interface FloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  success?: string
  hint?: string
  icon?: React.ElementType
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined' | 'ghost'
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      icon: Icon,
      size = 'md',
      variant = 'outlined',
      type,
      className,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    // Spring animation for floating label
    const labelScale = useMotionValue(isFocused || hasValue ? 0.85 : 1)
    const labelY = useMotionValue(isFocused || hasValue ? -28 : 0)
    
    const springScale = useSpring(labelScale, { stiffness: 300, damping: 20 })
    const springY = useSpring(labelY, { stiffness: 300, damping: 20 })

    const sizeConfig = {
      sm: { container: 'py-2 text-xs', input: 'h-9', label: 'text-[11px]' },
      md: { container: 'py-3 text-sm', input: 'h-11', label: 'text-xs' },
      lg: { container: 'py-4 text-base', input: 'h-13', label: 'text-sm' },
    }

    const variantStyles = {
      default: 'bg-muted/30 border-border focus:border-primary focus:ring-4 focus:ring-primary/10',
      filled: 'bg-muted/50 border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10',
      outlined: 'bg-transparent border-2 focus:border-primary focus:ring-4 focus:ring-primary/10',
      ghost: 'bg-transparent border-transparent border-b-2 border-border rounded-none focus:border-primary px-0',
    }

    return (
      <div className="relative w-full group/input">
        {/* Input Container */}
        <motion.div
          className={cn(
            'relative flex items-center px-4 rounded-xl border-2 transition-all duration-200',
            'bg-background',
            sizeConfig[size].container,
            !error && !success && isFocused && 'border-primary shadow-lg shadow-primary/10 ring-4 ring-primary/5',
            error && 'border-destructive shadow-lg shadow-destructive/10 ring-4 ring-destructive/5',
            success && !error && 'border-emerald-500 shadow-lg shadow-emerald-500/10',
            variantStyles[variant],
            className
          )}
        >
          {/* Icon */}
          {Icon && (
            <Icon
              className={cn(
                'w-5 h-5 ml-3 shrink-0 transition-all duration-200',
                isFocused
                  ? 'text-primary scale-110'
                  : error
                  ? 'text-destructive'
                  : success
                  ? 'text-emerald-500'
                  : 'text-muted-foreground group-hover/input:text-foreground'
              )}
            />
          )}

          {/* Main Input */}
          <input
            ref={ref}
            type={inputType}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false)
              setHasValue(e.target.value.length > 0)
            }}
            className={cn(
              'flex-1 bg-transparent outline-none text-foreground placeholder-transparent',
              'font-medium tracking-wide',
              sizeConfig[size].input
            )}
            placeholder={label}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Status Icons */}
          <AnimatePresence mode="wait">
            {error && !isFocused && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 12 }}
                transition={{ duration: 0.2 }}
              >
                {/* ✅ اصلاح: w-4.5 → w-[18px] */}
                <AlertCircle className="w-[18px] h-[18px] text-destructive ml-2" />
              </motion.div>
            )}
            
            {success && !isFocused && !error && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 12 }}
                transition={{ duration: 0.2 }}
              >
                {/* ✅ اصلاح: w-4.5 → w-[18px] */}
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 ml-2" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Label */}
          <motion.label
            style={{
              scale: springScale,
              y: springY,
            }}
            className={cn(
              'absolute right-4 pointer-events-none origin-top-right',
              'font-semibold transition-colors duration-200',
              sizeConfig[size].label,
              isFocused
                ? 'text-primary'
                : error
                ? 'text-destructive'
                : success
                ? 'text-emerald-600'
                : 'text-muted-foreground group-hover/input:text-foreground/70'
            )}
          >
            {label}
          </motion.label>
        </motion.div>

        {/* Helper Text / Error Message / Success Message */}
        <AnimatePresence>
          {(error || success || hint) && (
            <motion.p
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'mt-1.5 text-xs flex items-center gap-1.5 px-1',
                error && 'text-destructive',
                success && !error && 'text-emerald-600',
                hint && !error && !success && 'text-muted-foreground'
              )}
            >
              {error && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              {success && !error && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
              {hint && !error && !success && <Info className="w-3.5 h-3.5 shrink-0" />}
              {error || success || hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'