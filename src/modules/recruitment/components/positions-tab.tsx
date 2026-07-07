// src/modules/recruitment/components/PositionsTab.tsx
'use client'

import { Search, Plus, LayoutGrid, List, Edit2, Trash2, Building2, Briefcase, Users, CalendarDays } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Separator } from '@/core/components/ui/separator'
import { STATUS_MAP, STATUS_FILTER_OPTIONS } from './recruitment-module'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

interface Recruitment {
  id: string
  title: string
  department: string | null
  position: string | null
  status: string
  applicants: number
  createdAt: string
  updatedAt: string
}

export function PositionsTab({
  items,
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  onAdd,
  onEdit,
  onDelete,
}: {
  items: Recruitment[]
  loading: boolean
  search: string
  setSearch: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  viewMode: 'card' | 'table'
  setViewMode: (v: 'card' | 'table') => void
  onAdd: () => void
  onEdit: (item: Recruitment) => void
  onDelete: (item: Recruitment) => void
}) {
  const filtered = items.filter(i =>
    i.title.includes(search) ||
    (i.department || '').includes(search) ||
    (i.position || '').includes(search)
  )

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const shamsi = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
      return formatShamsi(shamsi)
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 w-[200px] text-xs pr-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map(opt => (
                <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0 rounded-l-none"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0 rounded-r-none"
              onClick={() => setViewMode('table')}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={onAdd}>
          <Plus className="w-3.5 h-3.5" /> افزودن موقعیت
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">در حال بارگذاری...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <span className="text-4xl block mb-3 opacity-30">📋</span>
          <p className="text-sm">موقعیت شغلی یافت نشد</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const st = STATUS_MAP[item.status] || STATUS_MAP.open
            return (
              <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge className={`text-[10px] shrink-0 ${st.color}`}>{st.label}</Badge>
                      <h3 className="text-sm font-medium truncate">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(item)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => onDelete(item)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {item.department && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />{item.department}
                      </span>
                    )}
                    {item.position && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />{item.position}
                      </span>
                    )}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {toPersianDigits(item.applicants)} متقاضی
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">عنوان موقعیت</TableHead>
                <TableHead className="text-xs">دپارتمان</TableHead>
                <TableHead className="text-xs">سمت</TableHead>
                <TableHead className="text-xs">وضعیت</TableHead>
                <TableHead className="text-xs text-center">تعداد متقاضی</TableHead>
                <TableHead className="text-xs">تاریخ ایجاد</TableHead>
                <TableHead className="text-xs text-center">اقدامات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => {
                const st = STATUS_MAP[item.status] || STATUS_MAP.open
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs font-medium">{item.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.department || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.position || '—'}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">{toPersianDigits(item.applicants)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(item)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => onDelete(item)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}