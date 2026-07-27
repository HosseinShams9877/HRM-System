// modules/training/components/courses-list.tsx

import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Progress } from '@/core/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Eye, Edit2, Trash2, Users, MapPin, Calendar, Clock, UserPlus, GraduationCap } from 'lucide-react'
import { toPersianDigits } from '@/core/lib/utils-fa'
import type { Training } from '../index'
import { STATUS_MAP, CATEGORY_MAP } from '../constants'

interface CoursesListProps {
  items: Training[]
  viewMode: 'card' | 'table'
  onViewDetail: (item: Training) => void
  onEdit: (item: Training) => void
  onDelete: (id: string) => void
  onAddParticipant: (courseId: string) => void
}

export function CoursesList({
  items,
  viewMode,
  onViewDetail,
  onEdit,
  onDelete,
  onAddParticipant,
}: CoursesListProps) {
  if (items.length === 0) {
    return <EmptyState />
  }

  if (viewMode === 'table') {
    return <CoursesTableView items={items} onViewDetail={onViewDetail} onEdit={onEdit} onDelete={onDelete} />
  }

  return <CoursesCardView items={items} onViewDetail={onViewDetail} onEdit={onEdit} onDelete={onDelete} />
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
      <h3 className="text-lg font-medium">دوره‌ای یافت نشد</h3>
      <p className="text-sm mt-1">فیلتر را تغییر دهید یا دوره جدید ایجاد کنید</p>
    </div>
  )
}

function CoursesTableView({
  items,
  onViewDetail,
  onEdit,
  onDelete,
}: {
  items: Training[]
  onViewDetail: (item: Training) => void
  onEdit: (item: Training) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs text-center">اقدامات</TableHead>
            <TableHead className="text-xs text-center">شرکت‌کننده</TableHead>
            <TableHead className="text-xs">وضعیت</TableHead>
            <TableHead className="text-xs">تاریخ پایان</TableHead>
            <TableHead className="text-xs">تاریخ شروع</TableHead>
            <TableHead className="text-xs">محل برگزاری</TableHead>
            <TableHead className="text-xs">مدرس</TableHead>
            <TableHead className="text-xs">عنوان دوره</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => {
            const st = STATUS_MAP[item.status] || STATUS_MAP.planned
            const cat = item.category ? CATEGORY_MAP[item.category] : null
            return (
              <TableRow key={item.id} className="cursor-pointer" onClick={() => onViewDetail(item)}>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onViewDetail(item)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(item)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => onDelete(item.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-center">
                  {toPersianDigits(item.participants.length)}
                  {item.capacity ? <span className="text-muted-foreground"> / {toPersianDigits(item.capacity)}</span> : ''}
                </TableCell>
                <TableCell><Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge></TableCell>
                <TableCell className="text-xs" dir="ltr">{toPersianDigits(item.endDate || '—')}</TableCell>
                <TableCell className="text-xs" dir="ltr">{toPersianDigits(item.startDate)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{item.location || '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{item.instructor || '—'}</TableCell>
                <TableCell className="text-xs font-medium">
                  <div className="flex items-center gap-2">
                    {cat && <cat.icon className="w-3.5 h-3.5 text-muted-foreground" />}
                    {item.title}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function CoursesCardView({
  items,
  onViewDetail,
  onEdit,
  onDelete,
}: {
  items: Training[]
  onViewDetail: (item: Training) => void
  onEdit: (item: Training) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map(item => {
        const st = STATUS_MAP[item.status] || STATUS_MAP.planned
        const cat = item.category ? CATEGORY_MAP[item.category] : null
        return (
          <Card
            key={item.id}
            className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => onViewDetail(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge className={`text-[10px] shrink-0 ${st.color}`}>{st.label}</Badge>
                  {cat && <Badge className={`text-[10px] shrink-0 ${cat.color}`}>{cat.label}</Badge>}
                  <h3 className="text-sm font-medium truncate">{item.title}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0 mr-2" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(item)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => onDelete(item.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {item.instructor && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.instructor}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.startDate}</span>
                {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                {item.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{toPersianDigits(item.duration)} ساعت</span>}
              </div>
              {item.participants?.length > 0 && (
                <div className="mt-2 pt-2 border-t flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    شرکت‌کنندگان: {toPersianDigits(item.participants.length)} نفر
                    {item.capacity ? ` از ${toPersianDigits(item.capacity)}` : ''}
                  </span>
                  <div className="w-[80px]">
                    <Progress
                      value={item.capacity ? Math.min(Math.round((item.participants.length / item.capacity) * 100), 100) : 0}
                      className="h-1.5"
                    />
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