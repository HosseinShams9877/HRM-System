// src/modules/payroll/components/PaySlipFormDialog/work-details-section.tsx

'use client'

import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Badge } from '@/core/components/ui/badge'
import { toPersianNumber, toEnglishNumber } from '@/core/lib/utils-fa'

interface WorkDetailsSectionProps {
  workDays: string
  onWorkDaysChange: (value: string) => void
  overtimeHours: string
  onOvertimeHoursChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
  // ✅ فیلدهای جدید برای سنوات و عیدی
  yearsOfService?: string
  onYearsOfServiceChange?: (value: string) => void
  workDaysInYear?: string
  onWorkDaysInYearChange?: (value: string) => void
  formMonth?: number
  isLoading?: boolean
  isEditing?: boolean
}

export function WorkDetailsSection({
  workDays,
  onWorkDaysChange,
  overtimeHours,
  onOvertimeHoursChange,
  notes,
  onNotesChange,
  yearsOfService,
  onYearsOfServiceChange,
  workDaysInYear,
  onWorkDaysInYearChange,
  formMonth,
  isLoading,
  isEditing,
}: WorkDetailsSectionProps) {
  const isEsfand = formMonth === 12

  return (
    <div className="space-y-4">
      {/* ردیف اول: کارکرد پایه */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>روزهای کارکرد</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={toPersianNumber(workDays)}
            onChange={(e) => {
              const englishNumber = toEnglishNumber(e.target.value)
              const numeric = englishNumber.replace(/[^0-9.]/g, '')
              onWorkDaysChange(numeric)
            }}
            dir="ltr"
            placeholder={toPersianNumber('مثلاً ۳۰')}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label>ساعات اضافه‌کاری</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={toPersianNumber(overtimeHours)}
            onChange={(e) => {
              const englishNumber = toEnglishNumber(e.target.value)
              const numeric = englishNumber.replace(/[^0-9.]/g, '')
              onOvertimeHoursChange(numeric)
            }}
            dir="ltr"
            placeholder={toPersianNumber('مثلاً ۵')}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label>توضیحات</Label>
          <Input
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="اختیاری"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* ✅ فیلدهای سنوات و عیدی - فقط در اسفند */}
      {isEsfand && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span>سال سابقه کار</span>
              <span className="text-xs text-muted-foreground">(برای سنوات)</span>
              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                سنوات
              </Badge>
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              value={yearsOfService ? toPersianNumber(yearsOfService) : ''}
              onChange={(e) => {
                const en = toEnglishNumber(e.target.value)
                const numeric = en.replace(/[^0-9]/g, '')
                if (onYearsOfServiceChange) {
                  onYearsOfServiceChange(numeric)
                }
              }}
              placeholder="مثلاً ۵ سال"
              dir="ltr"
              disabled={isLoading}
            />
            <p className="text-[10px] text-muted-foreground">
              در صورت خالی بودن، از تاریخ استخدام محاسبه می‌شود
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span>روزهای کارکرد در سال</span>
              <span className="text-xs text-muted-foreground">(برای عیدی و سنوات)</span>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                عیدی و سنوات
              </Badge>
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              value={workDaysInYear ? toPersianNumber(workDaysInYear) : ''}
              onChange={(e) => {
                const en = toEnglishNumber(e.target.value)
                const numeric = en.replace(/[^0-9]/g, '')
                if (onWorkDaysInYearChange) {
                  onWorkDaysInYearChange(numeric)
                }
              }}
              placeholder="مثلاً ۳۶۰ روز"
              dir="ltr"
              disabled={isLoading}
            />
            <p className="text-[10px] text-muted-foreground">
              در صورت خالی بودن، ۳۶۵ روز محاسبه می‌شود (حداکثر ۳۶۵)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}