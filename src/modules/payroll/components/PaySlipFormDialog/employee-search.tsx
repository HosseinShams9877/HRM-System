// src/modules/payroll/components/PaySlipFormDialog/employee-search.tsx

'use client'

import { Search } from 'lucide-react'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { toPersianDigits } from '@/core/lib/utils-fa'
import type { EmployeeBasic } from '../../types'

interface EmployeeSearchProps {
  employees: EmployeeBasic[]
  employeeId: string
  onEmployeeChange: (id: string) => void
  search: string
  onSearchChange: (value: string) => void
  disabled?: boolean
}

export function EmployeeSearch({
  employees,
  employeeId,
  onEmployeeChange,
  search,
  onSearchChange,
  disabled,
}: EmployeeSearchProps) {
  const filteredEmployees = search
    ? employees.filter(e =>
        `${e.firstName} ${e.lastName}`.includes(search) ||
        e.personnelCode.includes(search)
      )
    : employees

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="جستجو نام یا کد..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 mb-2"
          disabled={disabled}
        />
      </div>
      <Select value={employeeId} onValueChange={onEmployeeChange} disabled={disabled}>
        <SelectTrigger><SelectValue placeholder="انتخاب کارمند" /></SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {filteredEmployees.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              {search ? 'کارمندی یافت نشد' : 'کارمندی موجود نیست'}
            </div>
          ) : (
            filteredEmployees.map(emp => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({toPersianDigits(emp.personnelCode)})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}