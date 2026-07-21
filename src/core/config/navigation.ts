/**
 * Navigation Configuration — Single Source of Truth
 *
 * ⚠️ IMPORTANT: This is the ONLY place where menu items are defined.
 * Both desktop and mobile sidebars import from here.
 * Do NOT add navigation items directly in page components.
 *
 * To add a new menu item:
 * 1. Add entry to NAV_ITEMS below
 * 2. Add the icon name to the ICON_MAP in both page.tsx files
 * 3. That's it — no duplication, no missed items
 */
 import { UserRole } from '@/core/lib/auth'  
import { LucideIcon } from 'lucide-react'

// src/core/config/navigation.ts

export interface NavChild {
  id: string
  label: string
  icon: string 
  allowedRoles?: string[]
  children?: NavChild[]  
}

export interface NavItem {
  id: string
  label: string
  icon: string     // lucide icon name as string
  children?: NavChild[]
  href?: string         // external link (e.g. /mobile)
  desktopOnly?: boolean // only show on desktop
  mobileOnly?: boolean  // only show on mobile
  allowedRoles?: UserRole[]
}

/**
 * Master navigation items — ORDER MATTERS
 *
 * Current order (approved):
 *  1. داشبورد
 *  2. اطلاعیه و آیین‌نامه‌ها
 *  3. آنبوردینگ
 *  4. سازمان و نمودار
 *  5. کارکنان
 *  6. حضور و غیاب
 *  7. قرارداد و احکام
 *  8. حقوق و دستمزد
 *  9. جذب و استخدام
 * 10. ارزیابی عملکرد
 * 11. آموزش
 * 12. رفاهی
 * 13. آفبوردینگ
 * 14. تنظیمات
 * 15. اپلیکیشن موبایل (desktop only)
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'داشبورد',
    icon: 'Home',
    allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee', 'intern'],
  },
  {
  id: 'organization',
  label: 'سازمان و پرسنل',
  icon: 'Network',
  allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee'],
  children: [
    { 
      id: 'employees', 
      label: 'کارکنان', 
      icon: 'Users', 
      allowedRoles: ['admin', 'hr_manager', 'department_manager'] 
    },
    { 
      id: 'org-employee', 
      label: 'پرونده پرسنلی', 
      icon: 'Folder', 
      allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee'] 
    },
    {
      id: 'org-chart-group',
      label: 'چارت سازمانی',
      icon: 'Network',
      allowedRoles: ['admin', 'hr_manager', 'department_manager'],
      children: [
        { id: 'org-chart', label: 'نمودار سازمانی', icon: 'Network' },
        { id: 'org-departments', label: 'ساختار دپارتمان‌ها', icon: 'Building2' },
        { id: 'org-positions', label: 'پست‌های سازمانی', icon: 'Briefcase' },
      ],
    },
    { 
      id: 'employee-contracts', 
      label: 'قرارداد و حکم', 
      icon: 'FileBadge',
      allowedRoles: ['employee']  
    },
    { 
      id: 'contract-view', 
      label: 'قرارداد', 
      icon: 'FileBadge', 
      allowedRoles: ['admin', 'hr_manager', 'department_manager'] 
    },
    { 
      id: 'contract-order', 
      label: 'حکم کاری', 
      icon: 'UserCheck', 
      allowedRoles: ['admin', 'hr_manager', 'department_manager'] 
    },
    { 
      id: 'work-history', 
      label: 'سوابق شغلی', 
      icon: 'Briefcase', 
      allowedRoles: ['admin', 'hr_manager', 'department_manager'] 
    },
    { 
      id: 'employee-archive', 
      label: 'آرشیو کارکنان', 
      icon: 'Archive', 
      allowedRoles: ['admin', 'hr_manager', 'department_manager'] 
    },
    { 
      id: 'hr-settings', 
      label: 'تنظیمات منابع انسانی', 
      icon: 'Settings', 
      allowedRoles: ['admin', 'hr_manager'] 
    },
  ],
},
  {
    id: 'recruitment',
    label: 'جذب و استخدام',
    icon: 'UserPlus',
    allowedRoles: ['admin', 'hr_manager', 'department_manager'],
    children: [
      { id: 'recruitment-jobs', label: 'جذب و استخدام',icon: 'Briefcase' },
      { id: 'onboarding', label: 'آنبوردینگ', icon: 'PlaneTakeoff' },
      { id: 'recruitment-applications', label: 'سایت استخدام', icon: 'FileText' },
    ],
  },
  {
    id: 'attendance',
    label: 'حضور و غیاب',
    icon: 'Clock',
    allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee', 'intern'],
    children: [
      { id: 'att-today', label: 'تردد', icon: 'UserCheck' },
      { id: 'att-leave', label: 'مرخصی', icon: 'CalendarOff' },
      { id: 'att-mission', label: 'ماموریت', icon: 'MapPin' },
      { id: 'att-leave-balance', label: 'موجودی مرخصی', icon: 'TrendingUp' },
      { id: 'att-shifts', label: 'شیفت کاری', icon: 'Settings2' },
    ],
  },
  {
    id: 'performance',
    label: 'ارزیابی عملکرد',
    icon: 'BarChart3',
    allowedRoles: ['admin', 'hr_manager', 'department_manager']
  },
  {
    id: 'payroll',
    label: 'حقوق و دستمزد',
    icon: 'DollarSign',
    allowedRoles: ['admin', 'hr_manager'],
    children: [
      { id: 'payroll-list', label: 'فیش حقوقی', icon: 'CreditCard' },
      { id: 'payroll-settings', label: 'تنظیمات حقوقی', icon: 'Settings2' },
      { id: 'payroll-reports', label: 'گزارشات', icon: 'BarChart3' },
    ],
  },
  {
    id: 'training',
    label: 'آموزش',
    icon: 'GraduationCap',
    allowedRoles: ['admin', 'hr_manager', 'department_manager', 'intern'],
  },
  {
    id: 'welfare',
    label: 'رفاهی',
    icon: 'Award',
    allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee'],
    children: [
      { id: 'welfare-rewards', label: 'پاداش و تشویق', icon: 'Award' },
      { id: 'welfare-loans', label: 'وام و مساعده', icon: 'CreditCard' },
    ],
  },
  {
    id: 'offboarding',
    label: 'آفبوردینگ',
    icon: 'LogOut',
    allowedRoles: ['admin', 'hr_manager', 'department_manager'],
  },
  {
    id: 'settings',
    label: 'تنظیمات',
    icon: 'Settings',
    allowedRoles: ['admin', 'hr_manager'], 
    children: [
      { id: 'settings-general', label: 'عمومی', icon: 'Settings' },
      { id: 'settings-access', label: 'تعریف دسترسی', icon: 'ClipboardList' },
    ],
  },
  {
    id: 'notifications',
    label: 'نوتیفیکیشن‌ها',
    icon: 'Bell',
    mobileOnly: true,
    allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee', 'intern'],
  },
  {
    id: 'profile',
    label: 'پروفایل شخصی',
    icon: 'User',
    mobileOnly: true,
    allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee', 'intern'],
  },
  {
    id: 'mobile-app',
    label: 'اپلیکیشن موبایل',
    icon: 'Smartphone',
    href: '/mobile',
    desktopOnly: true,
    allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee', 'intern'],
  },
  {
    id: 'employee-create',
    label: 'ثبت کارمند جدید',
    icon: 'UserPlus',
    allowedRoles: ['admin', 'hr_manager'],
  }
]
