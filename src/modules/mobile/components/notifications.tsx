'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  Bell, Loader2, CalendarOff, FileBadge, Megaphone,
  CreditCard, CheckCircle2, XCircle, Clock, Award,
  GraduationCap, BarChart3
} from 'lucide-react'
import { toPersianDigits, formatRelativeTime } from '@/core/lib/utils-fa'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  time: Date
  read: boolean
  icon: React.ElementType
  color: string
}

// Demo notifications - in a real app, these would come from an API
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'leave_approved',
    title: 'تأیید مرخصی',
    message: 'درخواست مرخصی استحقاقی شما از ۱۴۰۵/۰۱/۱۵ تا ۱۴۰۵/۰۱/۱۷ تأیید شد.',
    time: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: '2',
    type: 'leave_rejected',
    title: 'رد مرخصی',
    message: 'درخواست مرخصی استعلاجی شما رد شد. لطفاً با مدیر خود تماس بگیرید.',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
  },
  {
    id: '3',
    type: 'contract_expiring',
    title: 'انقضای قرارداد',
    message: 'قرارداد کاری شما تا ۳۰ روز دیگر منقضی می‌شود. لطفاً با واحد منابع انسانی تماس بگیرید.',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    icon: FileBadge,
    color: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: '4',
    type: 'announcement',
    title: 'اطلاعیه جدید',
    message: 'اطلاعیه‌ای جدید در خصوص تغییر ساعات کاری منتشر شده است.',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    icon: Megaphone,
    color: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: '5',
    type: 'payslip',
    title: 'فیش حقوقی',
    message: 'فیش حقوقی ماه فروردین ۱۴۰۵ صادر شد. برای مشاهده روی بخش حقوق و دستمزد کلیک کنید.',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    icon: CreditCard,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: '6',
    type: 'training',
    title: 'دوره آموزشی',
    message: 'شما در دوره «مدیریت پروژه» ثبت‌نام شده‌اید. شروع دوره از ۱۴۰۵/۰۲/۰۱',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    icon: GraduationCap,
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: '7',
    type: 'performance',
    title: 'نتایج ارزیابی',
    message: 'نتایج ارزیابی عملکرد دوره Q1 منتشر شد. نمره شما: ۴.۲ از ۵',
    time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true,
    icon: BarChart3,
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: '8',
    type: 'reward',
    title: 'پاداش',
    message: 'پاداش عملکرد سه ماهه اول به حساب شما واریز شد.',
    time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
    icon: Award,
    color: 'text-purple-600 dark:text-purple-400',
  },
]

export default function Notifications() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    // In a real app, fetch from API
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
      </div>
    )
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span className="text-sm font-medium">
                {toPersianDigits(unreadCount)} خوانده‌نشده
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
              >
                خواندن همه
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              همه
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              خوانده‌نشده
              {unreadCount > 0 && (
                <span className="mr-1">({toPersianDigits(unreadCount)})</span>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notification List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? 'همه اعلان‌ها خوانده شده‌اند' : 'اعلانی وجود ندارد'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon
            return (
              <Card
                key={notification.id}
                className={`border-0 shadow-sm cursor-pointer transition-colors ${
                  !notification.read ? 'bg-pink-50/50 dark:bg-pink-950/10' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl bg-muted/50 shrink-0 ${!notification.read ? 'bg-pink-100 dark:bg-pink-950/30' : ''}`}>
                      <Icon className={`w-4 h-4 ${notification.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatRelativeTime(notification.time)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
