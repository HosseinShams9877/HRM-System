'use client'

import { useState } from 'react'
import { motion, AnimatePresence, layout } from 'framer-motion'
import { cn } from '@/core/lib/utils'
import { LucideIcon } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon?: LucideIcon
  content: React.ReactNode
  badge?: number
  disabled?: boolean
  description?: string
}

interface PremiumTabsProps {
  tabs: Tab[]
  defaultTab?: string
  variant?: 'pills' | 'underline' | 'cards' | 'neon'
  onChange?: (tabId: string) => void
  fullWidth?: boolean
  animated?: boolean
  className?: string
}

export function PremiumTabs({
  tabs,
  defaultTab,
  variant = 'pills',
  onChange,
  fullWidth = false,
  animated = true,
  className,
}: PremiumTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    if (tabs.find(t => t.id === tabId)?.disabled) return
    
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const tabContent = tabs.find(t => t.id === activeTab)?.content

  // محاسبه سبک برای cards variant
  const getCardsContainerStyle = () => {
    if (variant === 'cards' && fullWidth) {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
      }
    }
    return undefined
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab Headers */}
      <div
        role="tablist"
        style={getCardsContainerStyle()}
        className={cn(
          'flex items-center',
          variant === 'pills' && 'gap-1.5 bg-muted/60 p-1.5 rounded-2xl',
          variant === 'underline' && 'gap-6 border-b-2 border-border/50',
          variant === 'cards' && !fullWidth && 'gap-2.5',
          variant === 'neon' && 'gap-1 bg-slate-900/5 dark:bg-slate-800/30 p-1 rounded-2xl'
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          
          return (
            <motion.button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'relative flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium',
                'transition-all duration-200 outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
                
                // Variant Styles
                variant === 'pills' && [
                  'rounded-xl min-h-[44px]',
                  isActive
                    ? 'bg-background text-foreground shadow-md font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                ],
                
                variant === 'underline' && [
                  '-mb-px pb-3 pt-1',
                  isActive
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
                ],
                
                variant === 'cards' && [
                  'flex-col gap-1.5 p-3 rounded-xl border-2 min-h-[80px]',
                  isActive
                    ? 'border-primary bg-primary/5 text-primary shadow-md'
                    : 'border-transparent bg-card hover:border-border text-muted-foreground hover:text-foreground'
                ],
                
                variant === 'neon' && [
                  'rounded-xl relative overflow-hidden',
                  isActive && 'text-primary'
                ],
                
                fullWidth && variant !== 'underline' && variant !== 'cards' && 'flex-1'
              )}
              whileHover={!tab.disabled ? { scale: 1.03 } : undefined}
              whileTap={!tab.disabled ? { scale: 0.97 } : undefined}
              layout
            >
              {/* Active Background Animation (Pills) */}
              {variant === 'pills' && isActive && (
                <motion.div
                  layoutId="activePillBg"
                  className="absolute inset-0 bg-background rounded-xl shadow-md"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Active Underline Animation */}
              {variant === 'underline' && isActive && (
                <motion.div
                  layoutId="activeUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              {/* Neon Glow Effect */}
              {variant === 'neon' && isActive && (
                <>
                  <motion.div
                    layoutId="neonGlow"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                  <motion.div
                    layoutId="neonBorder"
                    className="absolute inset-0 rounded-xl border border-primary/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </>
              )}

              {/* Content Container */}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon && (
                  <motion.div
                    animate={isActive ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {/* ✅ اصلاح: w-4.5 → w-[18px] */}
                    <tab.icon className="w-[18px] h-[18px]" />
                  </motion.div>
                )}
                
                <span>{tab.label}</span>
                
                {/* Badge */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      'px-1.5 py-0.5 text-[10px] font-bold rounded-full',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {tab.badge}
                  </motion.span>
                )}
              </span>

              {/* Description for Cards variant */}
              {variant === 'cards' && tab.description && (
                <span className="text-[10px] text-muted-foreground relative z-10">
                  {tab.description}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Tab Panel with Animation */}
      {animated ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {tabContent}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div role="tabpanel" id={`tabpanel-${activeTab}`}>
          {tabContent}
        </div>
      )}
    </div>
  )
}