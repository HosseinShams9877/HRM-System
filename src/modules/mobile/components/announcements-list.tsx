'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  Megaphone, Loader2, AlertTriangle, Info, Bell,
  Calendar, ChevronDown, ChevronUp
} from 'lucide-react'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

const PRIORITY_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  urgent: { label: 'فوری', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300', icon: AlertTriangle },
  high: { label: 'مهم', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300', icon: Bell },
  normal: { label: 'عادی', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300', icon: Info },
  low: { label: 'کم اهمیت', color: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300', icon: Info },
}

export default function AnnouncementsList() {
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/announcements?isActive=true')
        if (res.ok) {
          const data = await res.json()
          setAnnouncements(Array.isArray(data) ? data : [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <Megaphone className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">اطلاعیه‌ای یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {announcements.map((ann: any) => {
        const priority = PRIORITY_MAP[ann.priority] || PRIORITY_MAP.normal
        const PriorityIcon = priority.icon
        const isExpanded = expandedId === ann.id

        return (
          <Card key={ann.id} className={`border-0 shadow-sm ${
            ann.priority === 'urgent' ? 'ring-1 ring-red-200 dark:ring-red-800' : ''
          }`}>
            <CardContent className="p-4">
              <button
                className="w-full text-right"
                onClick={() => setExpandedId(isExpanded ? null : ann.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      ann.priority === 'urgent'
                        ? 'bg-red-50 dark:bg-red-950/30'
                        : ann.priority === 'high'
                          ? 'bg-amber-50 dark:bg-amber-950/30'
                          : 'bg-sky-50 dark:bg-sky-950/30'
                    }`}>
                      <PriorityIcon className={`w-3.5 h-3.5 ${
                        ann.priority === 'urgent'
                          ? 'text-red-600 dark:text-red-400'
                          : ann.priority === 'high'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-sky-600 dark:text-sky-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-relaxed">{ann.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${priority.color} text-[10px] gap-1`}>
                          {priority.label}
                        </Badge>
                        {ann.targetAudience && ann.targetAudience !== 'all' && (
                          <Badge variant="secondary" className="text-[10px]">
                            {ann.targetAudience === 'managers' ? 'مدیران' : ann.targetAudience === 'employees' ? 'کارکنان' : ann.targetAudience}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 space-y-3">
                  <Separator />
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatShamsi(ann.publishDate)}</span>
                    </div>
                    {ann.expiryDate && (
                      <span>انقضا: {formatShamsi(ann.expiryDate)}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
