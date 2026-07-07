// src/modules/recruitment/components/animated/animated-counter.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { toPersianNumber } from '../helpers'

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function AnimatedCounter({ value, duration = 2, suffix = '', prefix = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration,
        ease: 'easeOut',
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      })
      return () => controls.stop()
    }
  }, [isInView, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {toPersianNumber(displayValue)}
      {suffix}
    </span>
  )
}