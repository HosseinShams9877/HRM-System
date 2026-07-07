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
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="جستجوی آگهی..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-56"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="draft">پیش‌نویس</SelectItem>
              <SelectItem value="open">فعال</SelectItem>
              <SelectItem value="paused">متوقف</SelectItem>
              <SelectItem value="closed">بسته</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="واحد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه واحدها</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(statusFilter !== 'all' || departmentFilter !== 'all' || searchTerm) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <FilterX className="h-4 w-4 mr-1" />
              پاک کردن
            </Button>
          )}
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          آگهی جدید
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">عنوان</TableHead>
                  <TableHead className="text-right">واحد</TableHead>
                  <TableHead className="text-right">نوع</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">متقاضیان</TableHead>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      در حال بارگذاری...
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium text-right">{job.title}</TableCell>
                      <TableCell className="text-right">{job.department?.name || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {job.employmentType === 'full-time' ? 'تمام وقت' : 
                           job.employmentType === 'part-time' ? 'پاره وقت' : 
                           job.employmentType === 'contract' ? 'قراردادی' : job.employmentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-right">{toPersianNumber(job.applications)}</TableCell>
                      <TableCell className="text-right text-sm text-gray-500">{formatDate(job.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(job)} title="ویرایش">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {job.status === 'draft' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPublish(job.id, 'open')} title="انتشار">
                              <Play className="h-4 w-4 text-emerald-600" />
                            </Button>
                          )}
                          {job.status === 'open' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPublish(job.id, 'closed')} title="بستن">
                              <Pause className="h-4 w-4 text-amber-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(job.id)} title="حذف">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
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