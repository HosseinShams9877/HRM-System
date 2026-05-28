'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import {  ChevronDown } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/core/components/ui/tooltip'
import { toPersianDigits } from '@/core/lib/utils-fa'

// ============================================
// Animated Counter
// ============================================

export function AnimatedCounter({ 
  target, 
  duration = 1200, 
  inView = true 
}: { 
  target: number; 
  duration?: number; 
  inView?: boolean 
}) {
  const [count, setCount] = useState(0)
  const display = useMotionValue(0)
  const spring = useSpring(display, { stiffness: 100, damping: 20 })

  useEffect(() => {
    if (!inView) return
    
    let startTime: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      display.set(eased * target)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }
    
    requestAnimationFrame(animate)
  }, [target, duration, inView, display])

  return (
    <motion.span className="tabular-nums font-bold tracking-tight">
      {toPersianDigits(Math.round(spring.get()))}
    </motion.span>
  )
}

export function ScrollCounter(props: any) {
  return <AnimatedCounter {...props} />
}

// ============================================
// Types
// ============================================

export interface PersonName {
  id: string
  name: string
}

export interface StatPillItem {
  icon: React.ElementType
  label: string
  value: number
  color: string
  total?: number
  onClick?: () => void
  people?: PersonName[]
}

// ============================================
// MIDNIGHT PRO Color Palette
// ============================================

const MIDNIGHT_STYLES: Record<string, any> = {
  amber: {
    gradient: 'from-amber-500/20 via-orange-600/15 to-yellow-500/10',
    bg: 'bg-slate-800/60',
    border: 'border-amber-500/20',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-100',
    subtext: 'text-amber-300/70',
    progressBg: 'bg-slate-900/80',
    progressFill: 'from-amber-500 to-orange-400',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    glowHover: 'shadow-[0_0_50px_rgba(245,158,11,0.25)]',
    particle: 'bg-amber-400/60',
  },

  violet: {
    gradient: 'from-violet-500/20 via-purple-600/15 to-fuchsia-500/10',
    bg: 'bg-slate-800/60',
    border: 'border-violet-500/20',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconColor: 'text-violet-400',
    textColor: 'text-violet-100',
    subtext: 'text-violet-300/70',
    progressBg: 'bg-slate-900/80',
    progressFill: 'from-violet-500 to-purple-400',
    glow: 'shadow-[0_0_30px_rgba(167,139,250,0.15)]',
    glowHover: 'shadow-[0_0_50px_rgba(167,139,250,0.25)]',
    particle: 'bg-violet-400/60',
  },

  cyan: {
    gradient: 'from-cyan-500/20 via-blue-600/15 to-sky-500/10',
    bg: 'bg-slate-800/60',
    border: 'border-cyan-500/20',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    iconColor: 'text-cyan-400',
    textColor: 'text-cyan-100',
    subtext: 'text-cyan-300/70',
    progressBg: 'bg-slate-900/80',
    progressFill: 'from-cyan-500 to-blue-400',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    glowHover: 'shadow-[0_0_50px_rgba(6,182,212,0.25)]',
    particle: 'bg-cyan-400/60',
  },

  emerald: {
    gradient: 'from-emerald-500/20 via-green-600/15 to-teal-500/10',
    bg: 'bg-slate-800/60',
    border: 'border-emerald-500/20',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-100',
    subtext: 'text-emerald-300/70',
    progressBg: 'bg-slate-900/80',
    progressFill: 'from-emerald-500 to-teal-400',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    glowHover: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]',
    particle: 'bg-emerald-400/60',
  },

  rose: {
    gradient: 'from-rose-500/20 via-pink-600/15 to-red-500/10',
    bg: 'bg-slate-800/60',
    border: 'border-rose-500/20',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    iconColor: 'text-rose-400',
    textColor: 'text-rose-100',
    subtext: 'text-rose-300/70',
    progressBg: 'bg-slate-900/80',
    progressFill: 'from-rose-500 to-pink-400',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]',
    glowHover: 'shadow-[0_0_50px_rgba(244,63,94,0.25)]',
    particle: 'bg-rose-400/60',
  },
  
  slate: {
    gradient: 'from-slate-600/20 via-gray-700/15 to-zinc-600/10',
    bg: 'bg-slate-800/60',
    border: 'border-slate-500/20',
    iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
    iconColor: 'text-slate-400',
    textColor: 'text-slate-200',
    subtext: 'text-slate-400/70',
    progressBg: 'bg-slate-900/80',
    progressFill: 'from-slate-400 to-gray-400',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.12)]',
    glowHover: 'shadow-[0_0_50px_rgba(148,163,184,0.2)]',
    particle: 'bg-slate-400/60',
  },
}

// ============================================
// MIDNIGHT Stat Box Component
// ============================================

function MidnightStatBox({ 
  icon: Icon, 
  label, 
  value, 
  color = 'amber', 
  total, 
  onClick, 
  people = [], 
  delay = 0,
}: StatPillItem & { delay?: number }) {
  const s = MIDNIGHT_STYLES[color] || MIDNIGHT_STYLES.slate
  const [expanded, setExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const pct = total && total > 0 ? Math.round((value / total) * 100) : null
  
  const boxRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(boxRef, { once: true, margin: '-30px' })

  const listContainerClass = `
    space-y-1.5 pr-2 overflow-y-auto scrollbar-thin
    scrollbar-thumb-slate-600/40 scrollbar-track-transparent
    ${expanded ? 'max-h-[140px]' : 'max-h-[72px]'}
    transition-[max-height] duration-400 ease-out
  `

  return (
    <motion.div
      ref={boxRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ 
        y: -6, 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl min-h-[180px]
        cursor-pointer group
        ${s.bg} ${s.border} ${s.glow} ${s.glowHover}
        backdrop-blur-xl
        transition-all duration-400 ease-out
      `}
    >
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px'
           }} 
      />

      {/* Gradient Mesh Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-60`}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: isHovered 
            ? `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px ${s.glowHover?.split(' ')[1]?.replace(']', '') || 'rgba(255,255,255,0.05)'}`
            : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${s.particle}`}
          style={{
            left: `${10 + i * 16}%`,
            top: `${15 + (i % 4) * 22}%`,
          }}
          animate={{
            y: [0, -12, 0],
            opacity: [0, 0.7, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-20 p-4 flex flex-col h-full">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-auto">
          <div className="flex items-center gap-3">
            
            {/* Icon Container - ✅ FIXED: Removed whileHover with multi-keyframes */}
            <motion.div
              className={`
                relative p-2.5 rounded-xl
                ${s.iconBg}
                shadow-lg
              `}
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={isInView ? { scale: 1, rotate: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: delay + 0.1, type: 'spring', stiffness: 200, damping: 18 }}
            >
              <Icon className={`w-5 h-5 ${s.iconColor}`} />
              
              {/* Icon Inner Glow */}
              <motion.div
                className={`absolute inset-0 rounded-xl ${s.iconBg} blur-md opacity-50`}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Value & Label */}
            <div>
              <motion.div
                className={`text-2xl font-black tabular-nums tracking-wide ${s.textColor}`}
                initial={{ opacity: 0, x: -15 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: delay + 0.2 }}
              >
                <ScrollCounter target={value} inView={isInView} duration={1400} />
                
                {/* Live Indicator */}
                <motion.span
                  className="inline-block w-2 h-2 rounded-full bg-emerald-400 ml-2 align-middle shadow-lg shadow-emerald-400/50"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
              
              <motion.div
                className={`text-xs font-medium mt-1 ${s.subtext}`}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.35, delay: delay + 0.28 }}
              >
                {label}
              </motion.div>
            </div>
          </div>

          {/* Badge */}
          {pct !== null && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: delay + 0.35, type: 'spring', stiffness: 280, damping: 18 }}
              whileHover={{ scale: 1.08 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="
                      px-2.5 py-1 rounded-lg text-xs font-bold
                      bg-white/10 backdrop-blur-sm
                      border border-white/20
                      text-slate-200
                    "
                    animate={{
                      boxShadow: [
                        `0 0 0px rgba(255,255,255,0)`,
                        `0 0 15px rgba(255,255,255,0.1)`,
                        `0 0 0px rgba(255,255,255,0)`,
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {toPersianDigits(pct)}%
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={8}>
                  <p className="font-medium">{toPersianDigits(value)} از {toPersianDigits(total)} نفر</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </div>

        {/* Progress Bar */}
        {pct !== null && (
          <motion.div
            className={`mt-3 h-1.5 rounded-full overflow-hidden ${s.progressBg}`}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: delay + 0.45 }}
          >
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${s.progressFill} relative`}
              initial={{ width: '0%' }}
              animate={isInView ? { width: `${pct}%` } : {}}
              transition={{ duration: 1.2, delay: delay + 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* People List */}
        {people.length > 0 && (
          <div className="mt-3 flex-1 min-h-0">
            <div ref={listRef} className={listContainerClass} style={{ direction: 'rtl' }}>
              {people.slice(0, expanded ? undefined : 3).map((p, idx) => (
                <motion.div
                  key={p.id || idx}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + idx * 0.06 }}
                  className="
                    flex items-center gap-2.5 px-3 py-2 
                    rounded-xl bg-white/5 
                    hover:bg-white/10
                    transition-all duration-200
                  "
                  whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  {/* Avatar */}
                  <motion.div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center shrink-0 
                      text-[11px] font-bold
                      bg-gradient-to-br ${s.iconBg}
                      ${s.textColor}
                      shadow-md
                    `}
                    whileHover={{ scale: 1.15 }}
                  >
                    {p.name.charAt(0)}
                  </motion.div>
                  
                  {/* Name */}
                  <span className={`text-xs font-medium truncate ${s.textColor}`}>
                    {p.name}
                  </span>

                  {/* Status Dot */}
                  <motion.div
                    className="w-2 h-2 rounded-full bg-emerald-400 ml-auto shadow-sm shadow-emerald-400/50"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: idx * 0.2 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Expand Button */}
            {people.length > 3 && (
              <motion.button
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                className="
                  w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 
                  rounded-xl bg-white/5 hover:bg-white/10
                  text-xs text-slate-400 
                  font-medium transition-all duration-200
                "
                whileHover={{ color: '#94a3b8' }}
              >
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
                {expanded ? 'بستن' : `${toPersianDigits(people.length - 3)} نفر دیگر`}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Accent Line */}
      <motion.div
        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-white/10"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: delay + 0.7 }}
      />
    </motion.div>
  )
}

// ============================================
// Main Export
// ============================================

export function PeopleStatBar({ items }: { items: StatPillItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-2"
    >
      {items.map((item, i) => (
        <MidnightStatBox key={item.label} {...item} delay={i * 0.07} />
      ))}
    </motion.div>
  )
}

export default PeopleStatBar