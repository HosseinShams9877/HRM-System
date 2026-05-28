'use client'

import { Briefcase, Users, UserCheck, UserX } from 'lucide-react'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Progress } from '@/core/components/ui/progress'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toPersianDigits, formatCurrency, formatShamsi } from '@/core/lib/utils-fa'
import type { Position } from '../index'

// ============================================
// Position Status Badge
// ============================================

export function PositionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'فعال', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    inactive: { label: 'غیرفعال', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  }
  const c = config[status] || config.active
  return <Badge className={`text-[10px] ${c.className}`}>{c.label}</Badge>
}

// ============================================
// Level Badge
// ============================================

export function LevelBadge({ level }: { level: string | null }) {
  if (!level) return null
  const config: Record<string, { label: string; className: string }> = {
    'ارشد': { label: 'ارشد', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    'میانره': { label: 'میانره', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
    'مبتدی': { label: 'مبتدی', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  }
  const c = config[level] || { label: level, className: 'bg-muted text-muted-foreground' }
  return <Badge variant="outline" className={`text-[10px] ${c.className}`}>{c.label}</Badge>
}

// ============================================
// Position Detail Dialog
// ============================================

export function PositionDetailDialog({
  open,
  onClose,
  position,
}: {
  open: boolean
  onClose: () => void
  position: Position | null
}) {
  if (!position) return null

  const fillPct = position.headcount > 0 ? Math.round((position.occupiedCount / position.headcount) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            {position.title}
          </DialogTitle>
          <DialogDescription>
            کد پست: {position.code} | {position.department?.name || 'بدون دپارتمان'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <PositionStatusBadge status={position.status} />
            <LevelBadge level={position.level} />
            {position.jobGrade && (
              <Badge variant="outline" className="text-[10px]">
                گروه {position.jobGrade}
              </Badge>
            )}
          </div>

          {/* اطلاعات کلی */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">سطح</span>
              <div className="mt-1">{position.level ? <LevelBadge level={position.level} /> : '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">گروه شغلی</span>
              <div className="mt-1 text-sm font-medium">{position.jobGrade || '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">حداقل حقوق</span>
              <div className="mt-1 text-sm font-medium">{position.minSalary ? formatCurrency(position.minSalary) : '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">حداکثر حقوق</span>
              <div className="mt-1 text-sm font-medium">{position.maxSalary ? formatCurrency(position.maxSalary) : '—'}</div>
            </div>
          </div>

          {/* ظرفیت */}
          <div className="p-4 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                ظرفیت پست
              </span>
              <span className="text-xs text-muted-foreground">
                {toPersianDigits(fillPct)}٪ اشغال
              </span>
            </div>
            <Progress
              value={fillPct}
              className="h-3"
            />
            <div className="flex items-center justify-between mt-3">
              <PositionStatusBadge status={position.status} />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  {toPersianDigits(position.occupiedCount)} اشغال
                </span>
                <span className="flex items-center gap-1">
                  <UserX className="w-3 h-3" />
                  {toPersianDigits(position.availableCount)} خالی
                </span>
              </div>
            </div>
          </div>

          {/* اشغال‌کنندگان فعلی */}
          {position.appointments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                اشغال‌کنندگان فعلی
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {position.appointments.map((apt, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        {apt.employee.firstName[0]}
                        {apt.employee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        {apt.employee.firstName} {apt.employee.lastName}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono" dir="ltr">
                      {apt.employee.personnelCode}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {position.appointments.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <UserX className="w-8 h-8 mx-auto mb-2 opacity-30" />
              هیچ نیرویی در این پست مشغول نیست
            </div>
          )}

          {/* شرح شغل */}
          {position.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">شرح شغل</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">{position.description}</p>
            </div>
          )}

          {position.requirements && (
            <div>
              <h4 className="text-sm font-medium mb-2">الزامات</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">{position.requirements}</p>
            </div>
          )}

          {/* تاریخ ایجاد */}
          <div className="text-[11px] text-muted-foreground text-left" dir="ltr">
            ایجاد: {position.createdAt ? formatShamsi(position.createdAt.slice(0, 10).replace(/-/g, '/')) : '—'}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>بستن</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
