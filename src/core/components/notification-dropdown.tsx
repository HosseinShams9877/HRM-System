'use client'

import { useState, useEffect } from 'react'
import { Bell, CalendarOff, MapPin, CreditCard, FileText } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover'
import { toPersianDigits } from '../lib/utils-fa'

interface Notification {
  id: string
  type: 'leave' | 'mission' | 'loan' | 'contract' | 'birthday' | 'anniversary'
  title: string
  subtitle?: string
  time?: string
  read: boolean
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) return
      const data = await res.json()
      
      const notifs: Notification[] = []
      
      // Pending leaves

      
      if (data.pending?.leaves > 0) {
        notifs.push({
          id: 'pending-leaves',
          type: 'leave',
          title: `${toPersianDigits(data.pending.leaves)} درخواست مرخصی`,
          subtitle: 'در انتظار بررسی',
          read: false,
        })
      }
      
      // Pending missions
      if (data.pending?.missions > 0) {
        notifs.push({
          id: 'pending-missions',
          type: 'mission',
          title: `${toPersianDigits(data.pending.missions)} درخواست ماموریت`,
          subtitle: 'در انتظار بررسی',
          read: false,
        })
      }
      
      // Pending loans
      if (data.pending?.loans > 0) {
        notifs.push({
          id: 'pending-loans',
          type: 'loan',
          title: `${toPersianDigits(data.pending.loans)} درخواست وام/مساعده`,
          subtitle: 'در انتظار بررسی',
          read: false,
        })
      }
      
      // Expiring contracts
      data.alerts?.expiringContracts?.forEach((c: { id: string; title: string; employeeName: string }) => {
        notifs.push({
          id: c.id,
          type: 'contract',
          title: `قرارداد در حال انقضا`,
          subtitle: `${c.employeeName} — ${c.title}`,
          read: false,
        })
      })
      
      // Birthdays
      data.alerts?.birthdays?.forEach((b: { id: string; name: string; date?: string | null }) => {
        notifs.push({
          id: b.id,
          type: 'birthday',
          title: `تولد ${b.name}`,
          subtitle: b.date || undefined,
          read: true,
        })
      })
      
      setNotifications(notifs)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const iconMap: Record<string, React.ElementType> = {
    leave: CalendarOff,
    mission: MapPin,
    loan: CreditCard,
    contract: FileText,
    birthday: Bell,
    anniversary: Bell,
  }

  const colorMap: Record<string, string> = {
    leave: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
    mission: 'text-sky-600 bg-sky-50 dark:bg-sky-950/30',
    loan: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    contract: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    birthday: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30',
    anniversary: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30',
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-dot" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" dir="rtl">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">اعلان‌ها</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {toPersianDigits(unreadCount)} جدید
              </Badge>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-[300px]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map(notif => {
                const Icon = iconMap[notif.type] || Bell
                return (
                  <div
                    key={notif.id}
                    className={`p-3 hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-muted/20' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg ${colorMap[notif.type] || 'text-gray-600 bg-gray-50'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-relaxed">{notif.title}</p>
                        {notif.subtitle && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{notif.subtitle}</p>
                        )}
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-xs">
              اعلان جدیدی وجود ندارد
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
