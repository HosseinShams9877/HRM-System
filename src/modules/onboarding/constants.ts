import { TaskItem } from './types/types'

// ============================================
// Constants
// ============================================

export const REASONS = ['استعفا', 'اخراج', 'بازنشستگی', 'پایان قرارداد'] as const

export const REASON_COLORS: Record<string, string> = {
  'استعفا': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'اخراج': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'بازنشستگی': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'پایان قرارداد': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export const ONBOARDING_TEMPLATES: Record<string, TaskItem[]> = {
  'پیش‌فرض': [
    { text: 'تکمیل فرم‌ها', done: false },
    { text: 'معرفی به تیم', done: false },
    { text: 'آموزش اولیه', done: false },
    { text: 'دریافت تجهیزات', done: false },
    { text: 'آشنایی با قوانین', done: false },
  ],
  'فنی': [
    { text: 'دریافت لپ‌تاپ و تجهیزات', done: false },
    { text: 'راه‌اندازی حساب کاربری', done: false },
    { text: 'دسترسی به مخزن کد', done: false },
    { text: 'آموزش فرآیندهای توسعه', done: false },
    { text: 'جلسه معرفی با تیم فنی', done: false },
    { text: 'آشنایی با معماری سیستم', done: false },
  ],
  'مدیریتی': [
    { text: 'جلسه معرفی با مدیر', done: false },
    { text: 'بازگشت اهداف اولیه', done: false },
    { text: 'آشنایی با ساختار سازمانی', done: false },
    { text: 'دریافت دسترسی‌های لازم', done: false },
    { text: 'جلسه با منابع انسانی', done: false },
  ],
}

export const OFFBOARDING_TEMPLATES: Record<string, TaskItem[]> = {
  'پیش‌فرض': [
    { text: 'تحویل تجهیزات', done: false },
    { text: 'پاکسازی حساب کاربری', done: false },
    { text: 'تسویه حساب', done: false },
    { text: 'خروج از بیمه', done: false },
    { text: 'تحویل اسناد', done: false },
  ],
  'فنی': [
    { text: 'تحویل لپ‌تاپ و تجهیزات', done: false },
    { text: 'انتقال پروژه‌ها', done: false },
    { text: 'آرشیو کدها و اسناد', done: false },
    { text: 'غیرفعال‌سازی دسترسی‌ها', done: false },
    { text: 'جلسه انتقال دانش', done: false },
  ],
  'مدیریتی': [
    { text: 'جلسه خروج با مدیر', done: false },
    { text: 'تحویل مسئولیت‌ها', done: false },
    { text: 'تسویه مالی', done: false },
    { text: 'لغو دسترسی‌های سازمانی', done: false },
    { text: 'جلسه بازخورد نهایی', done: false },
  ],
}

export const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
