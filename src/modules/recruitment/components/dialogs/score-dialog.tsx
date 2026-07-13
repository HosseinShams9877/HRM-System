// src/modules/recruitment/components/dialogs/score-dialog.tsx

'use client'

import { useState, useEffect } from 'react'
import { ClipboardCheck, Loader2, Star, User, Briefcase, Calendar } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { toast } from 'sonner'

interface ScoreDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  assessment: {
    id: string
    title: string
    type: string
    passScore: number
    application?: {
      candidate?: {
        firstName: string
        lastName: string
        email?: string
      }
      jobPosting?: {
        title: string
      }
    }
  } | null
  submitting?: boolean
}

export function ScoreDialog({ open, onClose, onSubmit, assessment, submitting = false }: ScoreDialogProps) {
  const [form, setForm] = useState({
    score: '',
    result: '',
    notes: '',
    status: 'completed',
  })

  useEffect(() => {
    if (open && assessment) {
      setForm({
        score: '',
        result: '',
        notes: '',
        status: 'completed',
      })
    }
  }, [open, assessment])

  if (!assessment) return null

  const candidateName = assessment.application?.candidate 
    ? `${assessment.application.candidate.firstName} ${assessment.application.candidate.lastName}`
    : 'نامشخص'

  const jobTitle = assessment.application?.jobPosting?.title || 'نامشخص'

  const handleSubmit = () => {
    if (!form.score) {
      toast.error('لطفاً نمره را وارد کنید')
      return
    }

    const scoreNum = parseFloat(form.score)
    if (isNaN(scoreNum)) {
      toast.error('نمره معتبر وارد کنید')
      return
    }

    // تعیین نتیجه بر اساس نمره و حد نصاب
    let result = form.result
    if (!result) {
      result = scoreNum >= (assessment.passScore || 60) ? 'passed' : 'failed'
    }

    onSubmit({
      id: assessment.id,
      score: scoreNum,
      result: result,
      notes: form.notes || '',
      status: 'completed',
    })
  }

  const getAssessmentTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'written_test': 'آزمون کتبی',
      'practical_task': 'تکلیف عملی',
      'psychological': 'ارزیابی روانشناسی',
      'technical_exam': 'آزمون تخصصی',
      'interview': 'مصاحبه',
      'other': 'سایر',
    }
    return map[type] || type
  }

  const isPassed = form.score && assessment.passScore 
    ? parseFloat(form.score) >= assessment.passScore 
    : false

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-violet-500" />
            ثبت نمره ارزیابی
          </DialogTitle>
          <DialogDescription>
            نمره و نتیجه ارزیابی را وارد کنید
          </DialogDescription>
        </DialogHeader>

        {/* اطلاعات کاندیدا */}
        <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300 text-sm">
                {candidateName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{candidateName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
              {getAssessmentTypeLabel(assessment.type)}
            </Badge>
            <span className="text-gray-500 dark:text-gray-400">
              حد نصاب: {assessment.passScore || 60}
            </span>
          </div>
        </div>

        <div className="space-y-4 py-2">
          {/* نمره */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              نمره <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={form.score}
                onChange={(e) => {
                  const val = e.target.value
                  setForm({ ...form, score: val })
                  // اگر نتیجه دستی انتخاب نشده، خودکار تعیین کن
                  if (!form.result) {
                    const num = parseFloat(val)
                    if (!isNaN(num) && assessment.passScore) {
                      setForm(prev => ({
                        ...prev,
                        score: val,
                        result: num >= assessment.passScore ? 'passed' : 'failed'
                      }))
                    }
                  }
                }}
                placeholder="مثلاً: 85"
                className="pl-12"
                min="0"
                max="100"
                step="0.5"
                dir="ltr"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            {form.score && assessment.passScore && (
              <div className="flex items-center gap-2 text-sm">
                <span className={`font-medium ${isPassed ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPassed ? '✅ قبول' : '❌ رد'}
                </span>
                <span className="text-gray-400 text-xs">
                  (حد نصاب: {assessment.passScore})
                </span>
              </div>
            )}
          </div>

          {/* نتیجه (دستی) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">نتیجه</Label>
            <Select 
              value={form.result} 
              onValueChange={(v) => setForm({ ...form, result: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب نتیجه..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passed">✅ قبول</SelectItem>
                <SelectItem value="failed">❌ رد</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              اگر نمره وارد کنید، نتیجه به‌طور خودکار محاسبه می‌شود
            </p>
          </div>

          {/* توضیحات */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">توضیحات</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="توضیحات تکمیلی درباره ارزیابی..."
              rows={3}
              className="text-sm"
            />
          </div>

          {/* خلاصه */}
          {form.score && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">نمره ثبت‌شده:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {form.score} از {assessment.passScore || 60}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-500 dark:text-gray-400">نتیجه:</span>
                <Badge className={form.result === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                  {form.result === 'passed' ? '✅ قبول' : form.result === 'failed' ? '❌ رد' : '—'}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !form.score}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ClipboardCheck className="h-4 w-4 mr-2" />
            )}
            {submitting ? 'در حال ذخیره...' : 'ثبت نمره'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}