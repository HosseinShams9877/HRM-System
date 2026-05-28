'use client'

import {
  Mail, Phone, Briefcase, Eye, Edit, Trash2,
  MoreVertical, Shield, Users, UserPlus, Calendar,
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import { Checkbox } from '@/core/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/core/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/core/components/ui/pagination'
import { toPersianDigits } from '@/core/lib/utils-fa'
import type { Employee } from '../index'
import { STATUS_CONFIG } from '../constants'

// ============================================
// Status Badge
// ============================================

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.active
  return <Badge className={`text-[10px] ${c.className}`}>{c.label}</Badge>
}

// ============================================
// Employee Card (Grid View)
// ============================================

function EmployeeCard({
  employee,
  onSelect,
  onEdit,
  onDelete,
}: {
  employee: Employee
  onSelect: (emp: Employee) => void
  onEdit: (emp: Employee) => void
  onDelete: (emp: Employee) => void
}) {
  const initials = employee.firstName[0] + employee.lastName[0]

  const getContractTypeLabel = (type: string | null | undefined) => {
    if (type === 'official') return 'رسمی'
    if (type === 'contractual') return 'قراردادی'
    if (type === 'probation') return 'آزمایشی'
    if (type === 'temporary') return 'موقت'
    return '—'
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm" onClick={() => onSelect(employee)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
              <AvatarImage src={employee.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold">{employee.firstName} {employee.lastName}</h3>
              <p className="text-[11px] text-muted-foreground">{employee.position || 'بدون پست'}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(employee) }}>
                <Eye className="w-3.5 h-3.5 ml-2" /> مشاهده
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(employee) }}>
                <Edit className="w-3.5 h-3.5 ml-2" /> ویرایش
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(employee) }} className="text-red-600">
                <Trash2 className="w-3.5 h-3.5 ml-2" /> حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3" />
            <span>{employee.department || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3" />
            <span>نوع قرارداد: {getContractTypeLabel(employee.contractType)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>تاریخ استخدام: {employee.hireDate || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            <span>مدیر: {employee.manager?.firstName ? `${employee.manager.firstName} ${employee.manager.lastName}` : '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3" />
            <span className="truncate">{employee.email || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            <span>{employee.phone ? toPersianDigits(employee.phone) : '—'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <StatusBadge status={employee.status} />
          <span className="text-[10px] text-muted-foreground">
            کد پرسنلی: {toPersianDigits(employee.personnelCode)}
          </span>
        </div>

        {employee.user && (
          <div className="mt-2 flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">اکانت فعال</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Employee Row (List View)
// ============================================

function EmployeeRow({
  employee,
  onSelect,
  onEdit,
  onDelete,
  selected,
  onToggleSelect,
}: {
  employee: Employee
  onSelect: (emp: Employee) => void
  onEdit: (emp: Employee) => void
  onDelete: (emp: Employee) => void
  selected: boolean
  onToggleSelect: (id: string) => void
}) {
  const initials = employee.firstName[0] + employee.lastName[0]

  const getContractTypeLabel = (type: string | null | undefined) => {
    if (type === 'official') return 'رسمی'
    if (type === 'contractual') return 'قراردادی'
    if (type === 'probation') return 'آزمایشی'
    if (type === 'temporary') return 'موقت'
    return '—'
  }

  return (
    <tr className="group hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onSelect(employee)}>
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(employee.id)} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="text-sm font-medium">{employee.firstName} {employee.lastName}</span>
            {employee.user && <Shield className="w-3 h-3 text-emerald-500 inline-block mr-1" />}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-xs">{toPersianDigits(employee.personnelCode)}</td>
      <td className="px-3 py-3 text-xs">{employee.position || '—'}</td>
      <td className="px-3 py-3 text-xs">{employee.department || '—'}</td>
      <td className="px-3 py-3 text-xs">{getContractTypeLabel(employee.contractType)}</td>
      <td className="px-3 py-3 text-xs">{employee.hireDate || '—'}</td>
      <td className="px-3 py-3 text-xs">
        {employee.manager?.firstName ? `${employee.manager.firstName} ${employee.manager.lastName}` : '—'}
      </td>
      <td className="px-3 py-3 text-xs">{employee.phone ? toPersianDigits(employee.phone) : '—'}</td>
      <td className="px-3 py-3"><StatusBadge status={employee.status} /></td>
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onSelect(employee)}>
              <Eye className="w-3.5 h-3.5 ml-2" /> مشاهده
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Edit className="w-3.5 h-3.5 ml-2" /> ویرایش
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(employee)} className="text-red-600">
              <Trash2 className="w-3.5 h-3.5 ml-2" /> حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

// ============================================
// Employee Table — Grid + List + Pagination
// ============================================

interface EmployeeTableProps {
  employees: Employee[]
  viewMode: 'grid' | 'list'
  selectedIds: string[]
  onSelect: (emp: Employee) => void
  onEdit: (emp: Employee) => void
  onDelete: (emp: Employee) => void
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onAddNew: () => void
  page: number
  onPageChange: (page: number) => void
  pagination: { page: number; limit: number; total: number; totalPages: number } | null
}

export function EmployeeTable({
  employees, viewMode, selectedIds,
  onSelect, onEdit, onDelete, onToggleSelect, onToggleSelectAll, onAddNew,
  page, onPageChange, pagination,
}: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-16 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-sm font-medium text-muted-foreground">کارمندی یافت نشد</h3>
          <p className="text-xs text-muted-foreground mt-1">فیلتر جستجو را تغییر دهید یا کارمند جدید ثبت کنید</p>
          <Button onClick={onAddNew} className="mt-4 gap-2" size="sm">
            <UserPlus className="w-4 h-4" />
            ثبت کارمند جدید
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map(emp => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-3 py-3 text-right" onClick={onToggleSelectAll} style={{ cursor: 'pointer' }}>
                    <Checkbox checked={selectedIds.length === employees.length && employees.length > 0} />
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">نام و نام خانوادگی</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">کد پرسنلی</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">پست</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">دپارتمان</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">نوع قرارداد</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">تاریخ استخدام</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">مدیر مستقیم</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">تلفن</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">وضعیت</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <EmployeeRow
                    key={emp.id}
                    employee={emp}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    selected={selectedIds.includes(emp.id)}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center pt-4">
          <Pagination dir="ltr">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => {
                  if (p === 1 || p === pagination.totalPages) return true
                  if (Math.abs(p - page) <= 1) return true
                  return false
                })
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0) {
                    const prev = arr[idx - 1]
                    if (p - prev > 1) acc.push('ellipsis')
                  }
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        onClick={() => onPageChange(p)}
                        className="cursor-pointer"
                      >
                        {toPersianDigits(p)}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(pagination.totalPages, page + 1))}
                  className={page >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  )
}