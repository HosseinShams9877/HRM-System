// src/modules/recruitment/components/animated/animated-progress.tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function AnimatedProgress({ value, className = '', delay = 0 }: { value: number; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className={`relative h-2 rounded-full bg-gray-200 ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-500"
        initial={{ width: 0 }}
        animate={isInView ? { width: `${Math.min(value, 100)}%` } : { width: 0 }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
      />
    </div>
  )
}