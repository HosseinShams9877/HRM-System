// src/modules/recruitment/components/tabs/candidates-tab.tsx
'use client'

import { Search, Plus, Edit, Trash2, Download, Star, FilterX } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { getStatusBadge, getSourceLabel, toPersianNumber } from '../../helpers'
import type { Candidate } from '../../types/type'

interface CandidatesTabProps {
  candidates: Candidate[]
  loading: boolean
  searchTerm: string
  setSearchTerm: (v: string) => void
  sourceFilter: string
  setSourceFilter: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  onAdd: () => void
  onEdit: (candidate: Candidate) => void
}

export function CandidatesTab({
  candidates,
  loading,
  searchTerm,
  setSearchTerm,
  sourceFilter,
  setSourceFilter,
  statusFilter,
  setStatusFilter,
  onAdd,
  onEdit,
}: CandidatesTabProps) {
  const filteredCandidates = candidates.filter((c) => {
    if (sourceFilter !== 'all' && c.source !== sourceFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (
        c.firstName.toLowerCase().includes(s) ||
        c.lastName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone.includes(s)
      )
    }
    return true
  })

  const resetFilters = () => {
    setSourceFilter('all')
    setStatusFilter('all')
    setSearchTerm('')
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="جستجوی کاندیدا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-56"
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="منبع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="website">وب‌سایت</SelectItem>
              <SelectItem value="linkedin">لینکدین</SelectItem>
              <SelectItem value="referral">معرفی</SelectItem>
              <SelectItem value="job_site">سایت کاریابی</SelectItem>
              <SelectItem value="other">سایر</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="new">جدید</SelectItem>
              <SelectItem value="hired">استخدام شده</SelectItem>
              <SelectItem value="rejected">رد شده</SelectItem>
              <SelectItem value="archived">بایگانی</SelectItem>
            </SelectContent>
          </Select>
          {(sourceFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <FilterX className="h-4 w-4 mr-1" />
              پاک کردن
            </Button>
          )}
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          کاندیدای جدید
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">ایمیل</TableHead>
                  <TableHead className="text-right">تلفن</TableHead>
                  <TableHead className="text-right">منبع</TableHead>
                  <TableHead className="text-right">تحصیلات</TableHead>
                  <TableHead className="text-right">سابقه</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">رزومه</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                      در حال بارگذاری...
                    </TableCell>
                  </TableRow>
                ) : filteredCandidates.length > 0 ? (
                  filteredCandidates.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                              {c.firstName?.[0]}{c.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < c.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{c.email}</TableCell>
                      <TableCell className="text-right text-sm" dir="ltr">{c.phone}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{getSourceLabel(c.source)}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{c.educationLevel || '—'}</TableCell>
                      <TableCell className="text-right text-sm">{toPersianNumber(c.experienceYears)} سال</TableCell>
                      <TableCell className="text-right">{getStatusBadge(c.status)}</TableCell>
                      <TableCell className="text-right">
                        {c.resumeUrl ? (
                          <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium">
                            <Download className="w-3.5 h-3.5" />
                            مشاهده
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(c)} title="ویرایش">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                      کاندیدایی یافت نشد
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}