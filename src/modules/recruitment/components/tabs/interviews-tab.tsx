// src/modules/recruitment/components/tabs/interviews-tab.tsx

'use client'

import { Plus, Calendar, CheckCircle, XCircle, User, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { getStatusBadge, getInterviewTypeLabel, toPersianNumber } from '../../helpers'
import type { Interview } from '../../types/type'

interface InterviewsTabProps {
  interviews: Interview[]
  loading: boolean
  onAdd: () => void
  onUpdate: (id: string, data: Record<string, unknown>) => void
}


export const formatDateTime = (date: string | Date): string => {
  if (!date) return '—'
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  const persianDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
  
  const toPersianNumber = (str: string) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
    return str.replace(/\d/g, (d) => persianDigits[parseInt(d)])
  }
  
  const parts = persianDate.split('،')
  if (parts.length === 2) {
    // ✅ ساعت اول، تاریخ دوم: "۲۰:۳۰ - ۱۴۰۵/۱۲/۲۹"
    return `${toPersianNumber(parts[1].trim())} - ${toPersianNumber(parts[0].trim())}`
  }
  
  return toPersianNumber(persianDate)
}


export function InterviewsTab({ interviews, loading, onAdd, onUpdate }: InterviewsTabProps) {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          مدیریت مصاحبه‌ها
          {!loading && (
            <Badge variant="secondary" className="text-xs">
              {toPersianNumber(interviews.length)}
            </Badge>
          )}
        </h2>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          زمان‌بندی مصاحبه
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">کاندیدا</TableHead>
                  <TableHead className="text-right">شغل</TableHead>
                  <TableHead className="text-right">نوع</TableHead>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">مدت</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">نتیجه</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-500" />
                      <p className="text-gray-400 text-sm mt-2">در حال بارگذاری...</p>
                    </TableCell>
                  </TableRow>
                ) : interviews.length > 0 ? (
                  interviews.map((interview) => (
                    <TableRow key={interview.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 text-xs">
                              {interview.candidate?.firstName?.[0]}{interview.candidate?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {interview.candidate?.firstName} {interview.candidate?.lastName}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {interview.candidate?.email || '—'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {interview.jobPosting?.title || interview.job?.title || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                          {getInterviewTypeLabel(interview.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDateTime(interview.scheduledAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-700 dark:text-gray-300">
                        {toPersianNumber(interview.duration || 30)} دقیقه
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(interview.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {interview.result ? (
                          getStatusBadge(interview.result)
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {interview.status === 'scheduled' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => onUpdate(interview.id, { status: 'completed', result: 'passed' })}
                                title="قبول"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => onUpdate(interview.id, { status: 'completed', result: 'failed' })}
                                title="رد"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                                onClick={() => onUpdate(interview.id, { status: 'no_show' })}
                                title="حاضر نشد"
                              >
                                <User className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => onUpdate(interview.id, { status: 'cancelled' })}
                                title="لغو"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {interview.status === 'completed' && (
                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                              {interview.result === 'passed' ? '✅ قبول' : interview.result === 'failed' ? '❌ رد' : 'انجام شد'}
                            </Badge>
                          )}
                          {interview.status === 'no_show' && (
                            <Badge variant="outline" className="text-xs text-orange-500 border-orange-200">
                              عدم حضور
                            </Badge>
                          )}
                          {interview.status === 'cancelled' && (
                            <Badge variant="outline" className="text-xs text-gray-400 border-gray-200">
                              لغو شد
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-400 dark:text-gray-500">مصاحبه‌ای یافت نشد</p>
                        <p className="text-xs text-gray-300 dark:text-gray-600">
                          با انتقال کاندیدا به مرحله مصاحبه، به‌طور خودکار ایجاد می‌شود
                        </p>
                        <Button variant="outline" size="sm" onClick={onAdd} className="mt-2 dark:border-gray-600 dark:text-gray-300">
                          <Plus className="h-3 w-3 mr-1" />
                          زمان‌بندی دستی
                        </Button>
                      </div>
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