'use client'

import {
  GraduationCap, Edit2, Trash2, Users, UserPlus, Clock, BookOpen
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Separator } from '@/core/components/ui/separator'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Progress } from '@/core/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/core/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/core/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/core/components/ui/table'
import { toPersianDigits } from '@/core/lib/utils-fa'
import type { Training, EmployeeBasic } from '../index'
import { STATUS_MAP, CATEGORY_MAP, PARTICIPANT_STATUS_MAP } from '../constants'

// ============================================
// Course Detail Dialog
// ============================================

export interface CourseDetailDialogProps {
  open: boolean
  onClose: () => void
  course: Training | null
  onEdit: () => void
  onDelete: () => void
  onAddParticipant: () => void
  onUpdateParticipant: (participantId: string, data: { status?: string; score?: number | null }) => void
  onRemoveParticipant: (participantId: string) => void
  employees: EmployeeBasic[]
}

export function CourseDetailDialog({
  open, onClose, course, onEdit, onDelete, onAddParticipant, onUpdateParticipant, onRemoveParticipant, employees,
}: CourseDetailDialogProps) {
  if (!course) return null

  const st = STATUS_MAP[course.status] || STATUS_MAP.planned
  const cat = course.category ? CATEGORY_MAP[course.category] : null
  const CatIcon = cat?.icon || BookOpen

  const completedCount = course.participants.filter(p => p.status === 'completed').length
  const progressPercent = course.participants.length > 0 ? Math.round((completedCount / course.participants.length) * 100) : 0

  const scores = course.participants.filter(p => p.score !== null).map(p => p.score as number)
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            {course.title}
            <Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge>
            {cat && <Badge className={`text-[10px] ${cat.color}`}><CatIcon className="w-3 h-3 ml-1" />{cat.label}</Badge>}
          </DialogTitle>
          <DialogDescription>
            {course.instructor && <span>مدرس: {course.instructor}</span>}
            {course.location && <span> • محل: {course.location}</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* Info cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold">{toPersianDigits(course.startDate)}</div>
                <div className="text-[10px] text-muted-foreground">تاریخ شروع</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold">{course.endDate ? toPersianDigits(course.endDate) : '—'}</div>
                <div className="text-[10px] text-muted-foreground">تاریخ پایان</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-amber-600">{toPersianDigits(course.participants.length)}{course.capacity ? ` / ${toPersianDigits(course.capacity)}` : ''}</div>
                <div className="text-[10px] text-muted-foreground">شرکت‌کنندگان</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-emerald-600">{avgScore !== null ? toPersianDigits(avgScore.toFixed(1)) : '—'}</div>
                <div className="text-[10px] text-muted-foreground">میانگین نمره</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">پیشرفت تکمیل دوره</span>
              <span className="font-medium">{toPersianDigits(progressPercent)}٪</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {course.description && (
            <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">{course.description}</div>
          )}

          {course.duration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              مدت دوره: {toPersianDigits(course.duration)} ساعت
            </div>
          )}

          <Separator />

          {/* Participants table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                شرکت‌کنندگان ({toPersianDigits(course.participants.length)})
              </h4>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onAddParticipant}>
                <UserPlus className="w-3.5 h-3.5" />
                افزودن
              </Button>
            </div>
            {course.participants.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                هنوز شرکت‌کننده‌ای اضافه نشده
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">نام کارمند</TableHead>
                      <TableHead className="text-xs">وضعیت</TableHead>
                      <TableHead className="text-xs">نمره</TableHead>
                      <TableHead className="text-xs text-center">اقدامات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.participants.map(p => {
                      const pSt = PARTICIPANT_STATUS_MAP[p.status] || PARTICIPANT_STATUS_MAP.registered
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[8px] font-bold">
                                  {p.employee.firstName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{p.employee.firstName} {p.employee.lastName}</div>
                                <div className="text-[10px] text-muted-foreground">{p.employee.department || '—'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={p.status}
                              onValueChange={v => onUpdateParticipant(p.id, { status: v })}
                            >
                              <SelectTrigger className="h-7 text-[10px] w-[110px]">
                                <Badge className={`text-[9px] ${pSt.color}`}>{pSt.label}</Badge>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(PARTICIPANT_STATUS_MAP).map(([key, val]) => (
                                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={p.score !== null ? p.score : ''}
                              onChange={e => {
                                const val = e.target.value
                                onUpdateParticipant(p.id, { score: val ? parseFloat(val) : null })
                              }}
                              placeholder="—"
                              className="h-7 text-xs w-[60px] text-center"
                              dir="ltr"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => onRemoveParticipant(p.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>بستن</Button>
          <Button variant="outline" className="gap-1.5" onClick={onEdit}>
            <Edit2 className="w-3.5 h-3.5" />
            ویرایش
          </Button>
          <Button variant="destructive" className="gap-1.5" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
