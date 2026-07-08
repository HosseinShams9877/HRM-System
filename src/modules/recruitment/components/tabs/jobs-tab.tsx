// src/modules/recruitment/components/tabs/jobs-tab.tsx
'use client'

import { Search, Plus, Edit, Play, Pause, Trash2, FilterX } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { getStatusBadge, toPersianNumber, formatDate } from '../../helpers'
import type { JobPosting, Department } from '../../types/type'

interface JobsTabProps {
  jobs: JobPosting[]
  loading: boolean
  searchTerm: string
  setSearchTerm: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  departmentFilter: string
  setDepartmentFilter: (v: string) => void
  departments: Department[]
  onAdd: () => void
  onEdit: (job: JobPosting) => void
  onDelete: (jobId: string) => void
  onPublish: (jobId: string, status: string) => void
}

export function JobsTab({
  jobs,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  departments,
  onAdd,
  onEdit,
  onDelete,
  onPublish,
}: JobsTabProps) {
  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    if (departmentFilter !== 'all' && j.departmentId !== departmentFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return j.title.toLowerCase().includes(s) || (j.department?.name || '').toLowerCase().includes(s)
    }
    return true
  })

  const resetFilters = () => {
    setStatusFilter('all')
    setDepartmentFilter('all')
    setSearchTerm('')
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="جستجوی آگهی..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-full sm:w-56 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="all" className="text-gray-900 dark:text-white">همه</SelectItem>
              <SelectItem value="draft" className="text-gray-900 dark:text-white">پیش‌نویس</SelectItem>
              <SelectItem value="open" className="text-gray-900 dark:text-white">فعال</SelectItem>
              <SelectItem value="paused" className="text-gray-900 dark:text-white">متوقف</SelectItem>
              <SelectItem value="closed" className="text-gray-900 dark:text-white">بسته</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder="واحد" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="all" className="text-gray-900 dark:text-white">همه واحدها</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id} className="text-gray-900 dark:text-white">{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(statusFilter !== 'all' || departmentFilter !== 'all' || searchTerm) && (
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
          آگهی جدید
        </Button>
      </div>

      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="text-right text-gray-600 dark:text-gray-400">عنوان</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden sm:table-cell">واحد</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden md:table-cell">نوع</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400">وضعیت</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden lg:table-cell">متقاضیان</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-400 hidden xl:table-cell">تاریخ</TableHead>
                  <TableHead className="text-center text-gray-600 dark:text-gray-400">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400 dark:text-gray-500">
                      در حال بارگذاری...
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id} className="border-b border-gray-200 dark:border-gray-700">
                      <TableCell className="font-medium text-right text-gray-900 dark:text-white">
                        {job.title}
                      </TableCell>
                      <TableCell className="text-right text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                        {job.department?.name || '—'}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                          {job.employmentType === 'full-time' ? 'تمام وقت' : 
                           job.employmentType === 'part-time' ? 'پاره وقت' : 
                           job.employmentType === 'contract' ? 'قراردادی' : job.employmentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-right text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                        {toPersianNumber(job.applications)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-500 dark:text-gray-400 hidden xl:table-cell">
                        {formatDate(job.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" 
                            onClick={() => onEdit(job)} 
                            title="ویرایش"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {job.status === 'draft' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700" 
                              onClick={() => onPublish(job.id, 'open')} 
                              title="انتشار"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {job.status === 'open' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-amber-600 hover:text-amber-700" 
                              onClick={() => onPublish(job.id, 'closed')} 
                              title="بستن"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700" 
                            onClick={() => onDelete(job.id)} 
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400 dark:text-gray-500">
                      آگهی‌ای یافت نشد
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