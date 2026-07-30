// src/modules/payroll/components/PaySlipFormDialog/basic-info-section.tsx

'use client'

import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { toPersianDigits, toPersianNumber, toEnglishNumber } from '@/core/lib/utils-fa'
import { PERSIAN_MONTHS } from '../../constants'
import { EmployeeSearch } from './employee-search'
import type { EmployeeBasic } from '../../types'

interface BasicInfoSectionProps {
  employees: EmployeeBasic[]
  employeeId: string
  onEmployeeChange: (id: string) => void
  employeeSearch: string
  onEmployeeSearchChange: (value: string) => void
  year: number
  onYearChange: (value: number) => void
  month: number
  onMonthChange: (value: number) => void
  baseSalary: string
  onBaseSalaryChange: (value: string) => void
  isEdit: boolean
  isLoadingEmployee?: boolean
}

export function BasicInfoSection({
  employees,
  employeeId,
  onEmployeeChange,
  employeeSearch,
  onEmployeeSearchChange,
  year,
  onYearChange,
  month,
  onMonthChange,
  baseSalary,
  onBaseSalaryChange,
  isEdit,
  isLoadingEmployee,
}: BasicInfoSectionProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        اطلاعات پایه
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>کارمند *</Label>
          {isEdit ? (
            <Input
              value="کارمند انتخاب شده"
              disabled
              className="bg-muted"
            />
          ) : (
            <EmployeeSearch
              employees={employees}
              employeeId={employeeId}
              onEmployeeChange={onEmployeeChange}
              search={employeeSearch}
              onSearchChange={onEmployeeSearchChange}
              disabled={isLoadingEmployee}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>سال *</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={toPersianNumber(String(year))}
            onChange={(e) => {
              const englishNumber = toEnglishNumber(e.target.value)
              const numeric = englishNumber.replace(/[^0-9]/g, '')
              if (numeric) onYearChange(Number(numeric))
            }}
            dir="ltr"
            placeholder={toPersianNumber('۱۴۰۴')}
          />
        </div>

        <div className="space-y-2">
          <Label>ماه *</Label>
          <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERSIAN_MONTHS.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              حقوق پایه *
              <span className="text-muted-foreground text-xs mr-1">(تومان)</span>
            </Label>
            {!isEdit && employeeId && (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">
                از کارمند
              </Badge>
            )}
          </div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder={toPersianNumber('حقوق پایه')}
            value={toPersianNumber(baseSalary)}
            onChange={(e) => {
              const englishNumber = toEnglishNumber(e.target.value)
              const numeric = englishNumber.replace(/[^0-9.]/g, '')
              onBaseSalaryChange(numeric)
            }}
            dir="ltr"
            className={!isEdit && employeeId ? 'bg-muted/50' : ''}
            readOnly={!isEdit && !!employeeId}
          />
          {!isEdit && employeeId && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              از اطلاعات مالی کارمند دریافت شده است.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}