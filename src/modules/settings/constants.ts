import {
  Shield, Users, Briefcase, UserCheck, GraduationCap,
  Sun, Handshake, AlertCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ============================================
// Constants — Settings Module
// ============================================

export const HOLIDAY_TYPE_MAP: Record<string, { label: string; color: string; bgClass: string; icon: LucideIcon }> = {
  official: { label: 'رسمی', color: 'text-emerald-700 dark:text-emerald-400', bgClass: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', icon: Sun },
  agreed: { label: 'توافقی', color: 'text-blue-700 dark:text-blue-400', bgClass: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800', icon: Handshake },
  occasional: { label: 'اتفاقی', color: 'text-amber-700 dark:text-amber-400', bgClass: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800', icon: AlertCircle },
}

export const ROLES_DATA = [
  {
    id: 'admin',
    title: 'مدیر سیستم',
    titleEn: 'System Admin',
    color: 'from-rose-500 to-rose-700',
    icon: Shield,
    modules: {
      'داشبورد': true, 'کارکنان': true, 'حضور و غیاب': true,
      'حقوق و دستمزد': true, 'قرارداد': true, 'ارزیابی': true,
      'آموزش': true, 'رفاهی': true, 'تنظیمات': true,
    },
  },
  {
    id: 'hr_manager',
    title: 'مدیر منابع انسانی',
    titleEn: 'HR Manager',
    color: 'from-emerald-500 to-emerald-700',
    icon: Users,
    modules: {
      'داشبورد': true, 'کارکنان': true, 'حضور و غیاب': true,
      'حقوق و دستمزد': true, 'قرارداد': true, 'ارزیابی': true,
      'آموزش': true, 'رفاهی': true, 'تنظیمات': true,
    },
  },
  {
    id: 'dept_manager',
    title: 'مدیر دپارتمان',
    titleEn: 'Department Manager',
    color: 'from-violet-500 to-violet-700',
    icon: Briefcase,
    modules: {
      'داشبورد': true, 'کارکنان': true, 'حضور و غیاب': true,
      'حقوق و دستمزد': false, 'قرارداد': false, 'ارزیابی': true,
      'آموزش': true, 'رفاهی': true, 'تنظیمات': false,
    },
  },
  {
    id: 'employee',
    title: 'کارمند',
    titleEn: 'Employee',
    color: 'from-sky-500 to-sky-700',
    icon: UserCheck,
    modules: {
      'داشبورد': true, 'کارکنان': false, 'حضور و غیاب': true,
      'حقوق و دستمزد': false, 'قرارداد': false, 'ارزیابی': false,
      'آموزش': false, 'رفاهی': true, 'تنظیمات': false,
    },
  },
  {
    id: 'intern',
    title: 'کارآموز',
    titleEn: 'Intern',
    color: 'from-amber-500 to-amber-700',
    icon: GraduationCap,
    modules: {
      'داشبورد': true, 'کارکنان': false, 'حضور و غیاب': true,
      'حقوق و دستمزد': false, 'قرارداد': false, 'ارزیابی': false,
      'آموزش': true, 'رفاهی': false, 'تنظیمات': false,
    },
  },
]

export const DEPT_COLORS = [
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
]

export const DEFAULT_GENERAL = {
  organizationName: 'سازمان نمونه',
  fiscalYearStart: '1404/01/01',
  workHoursStart: '08:00',
  workHoursEnd: '17:00',
  gracePeriod: '15',
}

export const DEFAULT_HOLIDAY_FORM = {
  title: '', date: '', type: 'official', isRecurring: false, description: '',
}

export const DEFAULT_DEPT_FORM = { name: '', code: '' }
