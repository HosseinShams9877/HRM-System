// src/modules/recruitment/components/tabs/interviews-tab.tsx
'use client'

import { Plus, Calendar, CheckCircle, XCircle, User } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { getStatusBadge, getInterviewTypeLabel, toPersianNumber, formatDateTime } from '../../helpers'
import type { Interview } from '../../types/type'

interface InterviewsTabProps {
  interviews: Interview[]
  loading: boolean
  onAdd: () => void
  onUpdate: (id: string, data: Record<string, unknown>) => void
}

export function InterviewsTab({ interviews, loading, onAdd, onUpdate }: InterviewsTabProps) {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          مدیریت مصاحبه‌ها
        </h2>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
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
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      در حال بارگذاری...
                    </TableCell>
                  </TableRow>
                ) : interviews.length > 0 ? (
                  interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                              {interview.candidate?.firstName?.[0]}{interview.candidate?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {interview.candidate?.firstName} {interview.candidate?.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{interview.job?.title || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{getInterviewTypeLabel(interview.type)}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatDateTime(interview.scheduledAt)}</TableCell>
                      <TableCell className="text-right text-sm">{toPersianNumber(interview.duration)} دقیقه</TableCell>
                      <TableCell className="text-right">{getStatusBadge(interview.status)}</TableCell>
                      <TableCell className="text-right">
                        {interview.result ? getStatusBadge(interview.result) : <span className="text-gray-400 text-sm">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          {interview.status === 'scheduled' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onUpdate(interview.id, { status: 'completed', result: 'passed' })}
                                title="قبول"
                              >
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onUpdate(interview.id, { status: 'completed', result: 'failed' })}
                                title="رد"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onUpdate(interview.id, { status: 'no_show' })}
                                title="حاضر نشد"
                              >
                                <User className="h-4 w-4 text-orange-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onUpdate(interview.id, { status: 'cancelled' })}
                                title="لغو"
                              >
                                <XCircle className="h-4 w-4 text-gray-400" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      مصاحبه‌ای یافت نشد
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