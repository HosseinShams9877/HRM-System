// src/modules/recruitment/components/tabs/assessments-tab.tsx
'use client'

import { Plus, Edit, ClipboardCheck } from 'lucide-react'
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
        </h2>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
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
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                      در حال بارگذاری...
                    </TableCell>
                  </TableRow>
                ) : assessments.length > 0 ? (
                  assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                              {assessment.application?.candidate?.firstName?.[0]}
                              {assessment.application?.candidate?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {assessment.application?.candidate?.firstName} {assessment.application?.candidate?.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{assessment.application?.job?.title || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{getAssessmentTypeLabel(assessment.type)}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{assessment.title}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {assessment.score !== null && assessment.score !== undefined ? toPersianNumber(assessment.score) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-500">{toPersianNumber(assessment.passScore)}</TableCell>
                      <TableCell className="text-right text-sm text-gray-500">
                        {assessment.deadline ? formatDate(assessment.deadline) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {assessment.result ? getStatusBadge(assessment.result) : getStatusBadge(assessment.status || 'assigned')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
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
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                      ارزیابی‌ای یافت نشد
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