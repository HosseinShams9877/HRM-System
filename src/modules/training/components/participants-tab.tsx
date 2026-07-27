// modules/training/components/participants-tab.tsx

'use client'

import { useState, useMemo } from 'react'
import { 
  Users, UserPlus, Award, AlertCircle, Trash2, GraduationCap,
  Search, X, Star
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toPersianDigits } from '@/core/lib/utils-fa'
import type { Training } from '../index'
import { PARTICIPANT_STATUS_MAP, STATUS_MAP } from '../constants'

interface ParticipantsTabProps {
  items: Training[]
  selectedCourseId: string
  onSelectCourse: (id: string) => void
  selectedCourse: Training | undefined
  selectedCourseAvgScore: number | null
  onAddParticipant: (courseId: string) => void
  onUpdateParticipant: (participantId: string, courseId: string, data: { status?: string; score?: number | null }) => void
  onRemoveParticipant: (participantId: string, courseId: string) => void
}

export function ParticipantsTab({
  items,
  selectedCourseId,
  onSelectCourse,
  selectedCourse,
  selectedCourseAvgScore,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
}: ParticipantsTabProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
const maxScore = selectedCourse?.maxScore || 5
  // فیلتر کردن شرکت‌کنندگان
  const filteredParticipants = useMemo(() => {
    if (!selectedCourse) return []

    let participants = selectedCourse.participants

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim()
      participants = participants.filter(p => 
        p.employee.firstName.toLowerCase().includes(searchLower) ||
        p.employee.lastName.toLowerCase().includes(searchLower) ||
        p.employee.personnelCode?.toLowerCase().includes(searchLower) ||
        p.employee.department?.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      participants = participants.filter(p => p.status === statusFilter)
    }

    return participants
  }, [selectedCourse, search, statusFilter])

  const participantStats = useMemo(() => {
    if (!selectedCourse) return { total: 0, registered: 0, attending: 0, completed: 0, absent: 0 }

    const participants = selectedCourse.participants
    return {
      total: participants.length,
      registered: participants.filter(p => p.status === 'registered').length,
      attending: participants.filter(p => p.status === 'attending').length,
      completed: participants.filter(p => p.status === 'completed').length,
      absent: participants.filter(p => p.status === 'absent').length,
    }
  }, [selectedCourse])

  return (
    <div className="space-y-4">
      {/* انتخاب دوره و دکمه افزودن - همیشه نمایش داده میشه */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-xs whitespace-nowrap">انتخاب دوره:</Label>
          <Select value={selectedCourseId} onValueChange={onSelectCourse}>
            <SelectTrigger className="h-8 w-full sm:w-[280px] text-xs">
              <SelectValue placeholder="یک دوره انتخاب کنید" />
            </SelectTrigger>
            <SelectContent>
              {items.length === 0 ? (
                <SelectItem value="no-course" disabled>هیچ دوره‌ای وجود ندارد</SelectItem>
              ) : (
                items.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title} — {toPersianDigits(item.participants.length)} شرکت‌کننده
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        {selectedCourseId && (
          <Button size="sm" className="gap-1.5 text-xs w-full sm:w-auto" onClick={() => onAddParticipant(selectedCourseId)}>
            <UserPlus className="w-3.5 h-3.5" />
            افزودن شرکت‌کننده
          </Button>
        )}
      </div>

      {/* اگر دوره‌ای انتخاب نشده */}
      {!selectedCourseId ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium">لطفاً یک دوره انتخاب کنید</h3>
          <p className="text-sm mt-1">از لیست بالا یک دوره را انتخاب کنید</p>
        </div>
      ) : !selectedCourse ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium">دوره یافت نشد</h3>
        </div>
      ) : (
        <>
          {/* اطلاعات دوره */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium">{selectedCourse.title}</span>
                  <Badge className={`text-[10px] ${(STATUS_MAP[selectedCourse.status] || STATUS_MAP.planned).color}`}>
                    {(STATUS_MAP[selectedCourse.status] || STATUS_MAP.planned).label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {selectedCourseAvgScore !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-amber-600">{toPersianDigits(selectedCourseAvgScore.toFixed(1))}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-emerald-600">ثبت‌نام: {toPersianDigits(participantStats.registered)}</span>
                    <span className="text-amber-600">در حال: {toPersianDigits(participantStats.attending)}</span>
                    <span className="text-emerald-600">تکمیل: {toPersianDigits(participantStats.completed)}</span>
                    <span className="text-red-500">غایب: {toPersianDigits(participantStats.absent)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                {selectedCourse.instructor && <span>مدرس: {selectedCourse.instructor}</span>}
                <span>تعداد کل: {toPersianDigits(participantStats.total)} نفر</span>
              </div>
            </CardContent>
          </Card>

          {/* جستجو و فیلتر */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجوی نام، کد پرسنلی یا دپارتمان..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 w-full pr-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  {Object.entries(PARTICIPANT_STATUS_MAP).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(search || statusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => { setSearch(''); setStatusFilter('all') }}
                >
                  <X className="w-3.5 h-3.5 ml-1" />
                  پاک کردن
                </Button>
              )}
            </div>
          </div>

          {/* لیست شرکت‌کنندگان */}
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">
                {search || statusFilter !== 'all' ? 'نتیجه‌ای یافت نشد' : 'هنوز شرکت‌کننده‌ای ثبت نشده'}
              </h3>
              <p className="text-sm mt-1">
                {search || statusFilter !== 'all' 
                  ? 'فیلترها را تغییر دهید' 
                  : 'با کلیک روی دکمه افزودن، اولین شرکت‌کننده را اضافه کنید'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button size="sm" className="mt-3 gap-1.5 text-xs" onClick={() => onAddParticipant(selectedCourseId)}>
                  <UserPlus className="w-3.5 h-3.5" />
                  افزودن شرکت‌کننده
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b">
                <span>نمایش {toPersianDigits(filteredParticipants.length)} از {toPersianDigits(participantStats.total)} شرکت‌کننده</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {toPersianDigits(participantStats.total)} نفر
                </span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs text-center">ردیف</TableHead>
                    <TableHead className="text-xs text-center">حذف</TableHead>
                    <TableHead className="text-xs">نمره</TableHead>
                    <TableHead className="text-xs">وضعیت</TableHead>
                    <TableHead className="text-xs">دپارتمان</TableHead>
                    <TableHead className="text-xs">نام کارمند</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((p, index) => {
                    const pSt = PARTICIPANT_STATUS_MAP[p.status] || PARTICIPANT_STATUS_MAP.registered
                    return (
                      <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {toPersianDigits(index + 1)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onRemoveParticipant(p.id, selectedCourseId)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={p.score !== null && p.score !== undefined ? p.score : ''}
                              onChange={e => {
                                const val = e.target.value.replace(/[^0-9.]/g, '')
                                const num = val ? parseFloat(val) : null
                               if (num === null || (num >= 0 && num <= maxScore)) {
                                  onUpdateParticipant(p.id, selectedCourseId, { score: num })
                                }
                              }}
                              placeholder="—"
                              className="h-7 text-xs w-[60px] text-center"
                              dir="ltr"
                            />
                          <span className="text-[10px] text-muted-foreground">/{toPersianDigits(maxScore)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={p.status}
                            onValueChange={v => onUpdateParticipant(p.id, selectedCourseId, { status: v })}
                          >
                            <SelectTrigger className="h-7 text-[10px] w-[120px]">
                              <Badge className={`text-[9px] ${pSt.color}`}>{pSt.label}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PARTICIPANT_STATUS_MAP).map(([key, val]) => (
                                <SelectItem key={key} value={key}>{val.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.employee.department || '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[9px] font-bold">
                                {p.employee.firstName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {p.employee.firstName} {p.employee.lastName}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {p.employee.personnelCode || ''}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  )
}