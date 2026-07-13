// src/modules/recruitment/components/tabs/candidates-tab.tsx

'use client'

import { Search, Plus, Edit, Download, Star, FilterX, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { CandidatePDF } from '../candidate-pdf'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { pdf } from '@react-pdf/renderer'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { getStatusBadge, getSourceLabel, getEducationLabel, toPersianNumber } from '../../helpers'
import type { Candidate } from '../../types/type'
import { useState, useMemo } from 'react'

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
  onStatusChange: (candidateId: string, newStatus: string) => void
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
  onStatusChange,
}: CandidatesTabProps) {
  // ============================================
  // Pagination State
  // ============================================
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  // ============================================
  // Filter Candidates
  // ============================================
  const filteredCandidates = candidates.filter((c) => {
    if (sourceFilter !== 'all' && c.source !== sourceFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (
        c.firstName.toLowerCase().includes(s) ||
        c.lastName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone?.includes(s)
      )
    }
    return true
  })

  // ============================================
  // Pagination Logic
  // ============================================
  const totalItems = filteredCandidates.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, sourceFilter, statusFilter])

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredCandidates.slice(startIndex, endIndex)
  }, [filteredCandidates, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const resetFilters = () => {
    setSourceFilter('all')
    setStatusFilter('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const getStatusColor = (status: string) => {
    const found = CANDIDATE_STATUSES.find(s => s.value === status)
    return found?.color || 'text-gray-600 dark:text-gray-400'
  }

  // ============================================
  // ✅ تابع دانلود رزومه - برای همه کاندیداها
  // ============================================
  const handleDownloadResume = async (candidate: Candidate) => {
    try {
      // ایجاد PDF از اطلاعات کاندیدا
      const pdfDoc = <CandidatePDF candidate={candidate} />
      const blob = await pdf(pdfDoc).toBlob()
      
      // ایجاد لینک دانلود
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `رزومه-${candidate.firstName}-${candidate.lastName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('رزومه با موفقیت دانلود شد')
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('خطا در دانلود رزومه')
    }
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
                  <TableHead className="text-right text-gray-600 dark:text-gray-400">رزومه</TableHead>
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
                ) : paginatedCandidates.length > 0 ? (
                  paginatedCandidates.map((c) => (
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
                                  className={`h-3 w-3 ${i < (c.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-600'}`}
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
                        {c.phone || '—'}
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
                      
                      {/* ✅ ستون رزومه - برای همه کاندیداها */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          onClick={() => handleDownloadResume(c)}
                        >
                          <Download className="w-3.5 h-3.5 ml-1" />
                          دانلود
                        </Button>
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

      {/* ✅ Pagination - کاملاً راست‌چین و وسط */}
      {totalItems > 0 && (
        <div className="flex items-center justify-center gap-4 px-2 py-3">
          {/* سمت راست - دکمه‌های صفحه‌بندی */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className={`h-8 w-8 p-0 text-sm ${
                      currentPage === pageNum 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {toPersianNumber(pageNum)}
                  </Button>
                )
              }).reverse()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          {/* سمت چپ - اطلاعات تعداد */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            نمایش {toPersianNumber(paginatedCandidates.length)} از {toPersianNumber(totalItems)} کاندیدا
          </p>
        </div>
      )}
    </div>
  )
}