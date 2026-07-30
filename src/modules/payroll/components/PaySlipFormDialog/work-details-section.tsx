// src/modules/payroll/components/PaySlipFormDialog/work-details-section.tsx

'use client'

import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { toPersianNumber, toEnglishNumber } from '@/core/lib/utils-fa'

interface WorkDetailsSectionProps {
  workDays: string
  onWorkDaysChange: (value: string) => void
  overtimeHours: string
  onOvertimeHoursChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
}

export function WorkDetailsSection({
  workDays,
  onWorkDaysChange,
  overtimeHours,
  onOvertimeHoursChange,
  notes,
  onNotesChange,
}: WorkDetailsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
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
        />
      </div>
      <div className="space-y-2">
        <Label>توضیحات</Label>
        <Input
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="اختیاری"
        />
      </div>
    </div>
  )
}