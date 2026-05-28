// ============================================
// Constants — Attendance Module
// ============================================

import {
  Clock, UserCheck, UserX, CalendarOff, MapPin, LogOut,
} from 'lucide-react'
import type { ChartConfig } from '@/core/components/ui/chart'

export const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; borderClass: string; icon: React.ElementType; color: string }> = {
  present: {
    label: 'حاضر',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    borderClass: 'border-r-4 border-emerald-500',
    icon: UserCheck,
    color: '#10b981',
  },
  absent: {
    label: 'غایب',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    borderClass: 'border-r-4 border-red-500',
    icon: UserX,
    color: '#ef4444',
  },
  late: {
    label: 'تاخیر',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    borderClass: 'border-r-4 border-amber-500',
    icon: Clock,
    color: '#f59e0b',
  },
  leave: {
    label: 'مرخصی',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    borderClass: 'border-r-4 border-purple-500',
    icon: CalendarOff,
    color: '#a855f7',
  },
  mission: {
    label: 'مأموریت',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    borderClass: 'border-r-4 border-sky-500',
    icon: MapPin,
    color: '#0ea5e9',
  },
  early_leave: {
    label: 'خروج زودرس',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    borderClass: 'border-r-4 border-orange-500',
    icon: LogOut,
    color: '#f97316',
  },
}

export const attendanceTrendConfig: ChartConfig = {
  rate: { label: 'نرخ حضور', color: '#10b981' },
}

export const statusDistConfig: ChartConfig = {
  present: { label: 'حاضر', color: '#10b981' },
  absent: { label: 'غایب', color: '#ef4444' },
  late: { label: 'تاخیر', color: '#f59e0b' },
  leave: { label: 'مرخصی', color: '#a855f7' },
  mission: { label: 'مأموریت', color: '#0ea5e9' },
}

export const pieConfig: ChartConfig = {
  present: { label: 'حاضر', color: '#10b981' },
  absent: { label: 'غایب', color: '#ef4444' },
  late: { label: 'تاخیر', color: '#f59e0b' },
  leave: { label: 'مرخصی', color: '#a855f7' },
  mission: { label: 'مأموریت', color: '#0ea5e9' },
}
