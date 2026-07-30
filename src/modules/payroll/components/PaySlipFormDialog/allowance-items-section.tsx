// src/modules/payroll/components/PaySlipFormDialog/allowance-items-section.tsx

'use client'

import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip'
import { Info, Lock } from 'lucide-react'
import { toPersianDigits, toPersianNumber, toEnglishNumber } from '@/core/lib/utils-fa'
import { FORMULA_DESCRIPTIONS } from '../../constants'
import type { PayrollItemDefinition, CalculatedAmounts } from './types'

interface AllowanceItemsSectionProps {
  items: PayrollItemDefinition[]
  calculatedAmounts: CalculatedAmounts
  itemAmounts: Record<string, string>
  onItemAmountChange: (itemId: string, value: string) => void
  baseSalaryNum: number
  hasEmployeeBenefits: boolean
}

export function AllowanceItemsSection({
  items,
  calculatedAmounts,
  itemAmounts,
  onItemAmountChange,
  baseSalaryNum,
  hasEmployeeBenefits,
}: AllowanceItemsSectionProps) {
  if (items.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        مزایا و پرداختی
        <Badge variant="outline" className="text-[10px]">
          {toPersianDigits(items.length)} آیتم
        </Badge>
        {hasEmployeeBenefits && (
          <Badge className="text-[10px] bg-emerald-100 text-emerald-700">
            از اطلاعات کارمند
          </Badge>
        )}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const isFormula = item.calculationType === 'formula'
          const isPercentage = item.calculationType === 'percentage'
          const isReadonly = isFormula || (item.calculationType === 'fixed' && !item.isEditable)
          const displayValue = calculatedAmounts[item.id] || 0

          return (
            <div key={item.id} className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                {item.title}
                <span className="text-[10px] text-muted-foreground">(تومان)</span>
                {isFormula && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {FORMULA_DESCRIPTIONS[item.formula?.code || ''] || item.formula?.name || 'محاسبه خودکار'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {isPercentage && (
                  <span className="text-muted-foreground text-[10px]">
                    ({toPersianDigits(item.value)}٪ حقوق پایه)
                  </span>
                )}
                {item.calculationType === 'fixed' && !item.isEditable && (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                )}
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={isReadonly ? toPersianNumber(String(displayValue)) : toPersianNumber(itemAmounts[item.id] || '')}
                  onChange={(e) => {
                    if (isReadonly) return
                    const englishNumber = toEnglishNumber(e.target.value)
                    const numeric = englishNumber.replace(/[^0-9.]/g, '')
                    onItemAmountChange(item.id, numeric)
                  }}
                  disabled={isReadonly}
                  dir="ltr"
                  className={isReadonly ? 'bg-muted/50' : ''}
                  placeholder={toPersianNumber('۰')}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}