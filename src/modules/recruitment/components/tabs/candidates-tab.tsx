// src/modules/recruitment/components/tabs/candidates-tab.tsx
'use client'

import { Search, Plus, Edit, Download, Star, FilterX, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { getStatusBadge, getSourceLabel, getEducationLabel, toPersianNumber } from '../../helpers'
import type { Candidate } from '../../types/type'

// وضعیت‌های کاندیدا
const CANDIDATE_STATUSES = [
  { value: 'active', label: 'فعال', color: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'inactive', label: 'غیرفعال', color: 'text-gray-600 dark:text-gray-400' },
  { value: 'blocked', label: 'مسدود', color: 'text-red-600 dark:text-red-400' },
]

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
  onStatusChange: (candidateId: string, newStatus: string) => void  // ← اضافه شد
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
  onStatusChange,  // ← اضافه شد
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

  // تابع برای دریافت رنگ وضعیت
  const getStatusColor = (status: string) => {
    const found = CANDIDATE_STATUSES.find(s => s.value === status)
    return found?.color || 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="جستجوی کاندیدا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-full sm:w-56 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full sm:w-36 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right">
              <SelectValue placeholder="منبع" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="all" className="text-gray-900 dark:text-white text-right">همه</SelectItem>
              <SelectItem value="website" className="text-gray-900 dark:text-white text-right">وب‌سایت</SelectItem>
              <SelectItem value="linkedin" className="text-gray-900 dark:text-white text-right">لینکدین</SelectItem>
              <SelectItem value="referral" className="text-gray-900 dark:text-white text-right">معرفی</SelectItem>
              <SelectItem value="job_site" className="text-gray-900 dark:text-white text-right">سایت کاریابی</SelectItem>
              <SelectItem value="other" className="text-gray-900 dark:text-white text-right">سایر</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="all" className="text-gray-900 dark:text-white text-right">همه</SelectItem>
              <SelectItem value="active" className="text-gray-900 dark:text-white text-right">فعال</SelectItem>
              <SelectItem value="inactive" className="text-gray-900 dark:text-white text-right">غیرفعال</SelectItem>
              <SelectItem value="blocked" className="text-gray-900 dark:text-white text-right">مسدود</SelectItem>
            </SelectContent>
          </Select>
          {(sourceFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FilterX className="h-4 w-4 ml-1" />
              پاک کردن
            </Button>
          )}
        </div>
        <Button 
          onClick={onAdd}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4 ml-1" />
          کاندیدای جدید
        </Button>
      </div>

      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="text-right text-gray-600 dark:text-gray-400">نام</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden sm:table-cell">ایمیل</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden md:table-cell">تلفن</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden lg:table-cell">منبع</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden xl:table-cell">تحصیلات</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden 2xl:table-cell">سابقه</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400">وضعیت</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden lg:table-cell">رزومه</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500">
                      در حال بارگذاری...
                    </TableCell>
                  </TableRow>
                ) : filteredCandidates.length > 0 ? (
                  filteredCandidates.map((c) => (
                    <TableRow key={c.id} className="border-b border-gray-200 dark:border-gray-700">
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs">
                              {c.firstName?.[0]}{c.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                              {c.firstName} {c.lastName}
                            </p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < c.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                        {c.email}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell" dir="ltr">
                        {c.phone}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell">
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                          {getSourceLabel(c.source)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-700 dark:text-gray-300 hidden xl:table-cell">
                        {getEducationLabel(c.educationLevel)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-700 dark:text-gray-300 hidden 2xl:table-cell">
                        {toPersianNumber(c.experienceYears)} سال
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-medium ${getStatusColor(c.status)}`}>
                          {c.status === 'active' ? 'فعال' : 
                           c.status === 'inactive' ? 'غیرفعال' : 
                           c.status === 'blocked' ? 'مسدود' : c.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell">
                        {c.resumeUrl ? (
                          <a 
                            href={c.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium"
                          >
                            <Download className="w-3.5 h-3.5" />
                            مشاهده
                          </a>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" 
                            onClick={() => onEdit(c)} 
                            title="ویرایش"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {/* Dropdown تغییر وضعیت */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                title="تغییر وضعیت"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 min-w-[120px]">
                              {CANDIDATE_STATUSES.map((status) => (
                                <DropdownMenuItem 
                                  key={status.value}
                                  onClick={() => onStatusChange(c.id, status.value)}
                                  className={`text-right ${status.color} hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer`}
                                >
                                  {status.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500">
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