'use client'

import {
  Edit, Trash2, Eye, MoreVertical, Clock,
} from 'lucide-react'
import { Card } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/core/components/ui/dropdown-menu'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { TYPE_GRADIENT_MAP } from '../constants'
import { AppointmentStatusBadge } from './appointment-status-badge'
import { AppointmentTypeBadge } from './appointment-type-badge'
import type { Appointment } from '../index'

export function AppointmentTableView({
  appointments,
  onView,
  onEdit,
  onEnd,
  onDelete,
}: {
  appointments: Appointment[]
  onView: (apt: Appointment) => void
  onEdit: (apt: Appointment) => void
  onEnd: (apt: Appointment) => void
  onDelete: (apt: Appointment) => void
}) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-right text-xs font-medium">کارمند</TableHead>
            <TableHead className="text-right text-xs font-medium">پست سازمانی</TableHead>
            <TableHead className="text-right text-xs font-medium">نوع</TableHead>
            <TableHead className="text-right text-xs font-medium">شماره حکم</TableHead>
            <TableHead className="text-right text-xs font-medium">تاریخ شروع</TableHead>
            <TableHead className="text-right text-xs font-medium">تاریخ پایان</TableHead>
            <TableHead className="text-right text-xs font-medium">وضعیت</TableHead>
            <TableHead className="text-right text-xs font-medium w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => (
            <TableRow
              key={apt.id}
              className="cursor-pointer"
              onClick={() => onView(apt)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={`bg-gradient-to-br ${TYPE_GRADIENT_MAP[apt.type] || 'from-gray-400 to-gray-500'} text-white text-[10px] font-bold`}>
                      {apt.employee.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-medium">{apt.employee.firstName} {apt.employee.lastName}</span>
                    <p className="text-[10px] text-muted-foreground">{toPersianDigits(apt.employee.personnelCode)}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <span className="text-sm">{apt.position.title}</span>
                  <p className="text-[10px] text-muted-foreground">{apt.position.department?.name || ''}</p>
                </div>
              </TableCell>
              <TableCell><AppointmentTypeBadge type={apt.type} /></TableCell>
              <TableCell className="text-xs font-mono" dir="ltr">{apt.decreeNumber || '—'}</TableCell>
              <TableCell className="text-xs">{formatShamsi(apt.startDate)}</TableCell>
              <TableCell className="text-xs">{apt.endDate ? formatShamsi(apt.endDate) : 'فعلی'}</TableCell>
              <TableCell><AppointmentStatusBadge status={apt.status} /></TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => onView(apt)}>
                      <Eye className="w-3.5 h-3.5 ml-2" /> مشاهده
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(apt)}>
                      <Edit className="w-3.5 h-3.5 ml-2" /> ویرایش
                    </DropdownMenuItem>
                    {apt.status === 'active' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEnd(apt)} className="text-amber-600">
                          <Clock className="w-3.5 h-3.5 ml-2" /> پایان انتصاب
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(apt)} className="text-red-600">
                          <Trash2 className="w-3.5 h-3.5 ml-2" /> لغو انتصاب
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
