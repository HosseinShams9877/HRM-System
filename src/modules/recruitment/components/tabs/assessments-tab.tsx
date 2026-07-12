// src/modules/recruitment/components/tabs/assessments-tab.tsx

'use client'

import { Plus, Edit, ClipboardCheck, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { getStatusBadge, getAssessmentTypeLabel, toPersianNumber, formatDate } from '../../helpers'
import type { Assessment } from '../../types/type'

interface AssessmentsTabProps {
  assessments: Assessment[]
  loading: boolean
  onAdd: () => void
  onScore: (assessment: Assessment) => void
}

export function AssessmentsTab({ assessments, loading, onAdd, onScore }: AssessmentsTabProps) {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-violet-500" />
          ارزیابی‌ها و آزمون‌ها
          {!loading && (
            <Badge variant="secondary" className="text-xs">
              {toPersianNumber(assessments.length)}
            </Badge>
          )}
        </h2>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          ارزیابی جدید
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
                  <TableHead className="text-right">نوع آزمون</TableHead>
                  <TableHead className="text-right">عنوان</TableHead>
                  <TableHead className="text-right">نمره</TableHead>
                  <TableHead className="text-right">حد نصاب</TableHead>
                  <TableHead className="text-right">مهلت</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-500" />
                      <p className="text-gray-400 text-sm mt-2">در حال بارگذاری...</p>
                    </TableCell>
                  </TableRow>
                ) : assessments.length > 0 ? (
                  assessments.map((assessment) => (
                    <TableRow key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 text-xs">
                              {assessment.application?.candidate?.firstName?.[0]}
                              {assessment.application?.candidate?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {assessment.application?.candidate?.firstName} {assessment.application?.candidate?.lastName}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {assessment.application?.candidate?.email || '—'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {assessment.application?.jobPosting?.title || assessment.application?.job?.title || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                          {getAssessmentTypeLabel(assessment.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{assessment.title}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {assessment.score !== null && assessment.score !== undefined ? (
                          <span className={`text-sm font-medium ${assessment.score >= assessment.passScore ? 'text-emerald-600' : 'text-red-500'}`}>
                            {toPersianNumber(assessment.score)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-gray-500">{toPersianNumber(assessment.passScore || 60)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-gray-500">
                          {assessment.deadline ? formatDate(assessment.deadline) : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {assessment.result ? (
                          getStatusBadge(assessment.result)
                        ) : (
                          getStatusBadge(assessment.status || 'assigned')
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                          onClick={() => onScore(assessment)}
                          title="ثبت نمره"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardCheck className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-400 dark:text-gray-500">ارزیابی‌ای یافت نشد</p>
                        <p className="text-xs text-gray-300 dark:text-gray-600">
                          با انتقال کاندیدا به مرحله آزمون، به‌طور خودکار ایجاد می‌شود
                        </p>
                        <Button variant="outline" size="sm" onClick={onAdd} className="mt-2 dark:border-gray-600 dark:text-gray-300">
                          <Plus className="h-3 w-3 mr-1" />
                          ارزیابی دستی
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