// src/modules/payroll/components/PaySlipFormDialog/order-section.tsx

'use client'

import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { formatCurrency } from '@/core/lib/utils-fa'

interface OrderSectionProps {
  generateOrder: boolean
  onGenerateOrderChange: (value: boolean) => void
  orderType: string
  onOrderTypeChange: (value: string) => void
  orderEffectiveDate: string
  onOrderEffectiveDateChange: (value: string) => void
  orderDescription: string
  onOrderDescriptionChange: (value: string) => void
  orderNewPosition: string
  onOrderNewPositionChange: (value: string) => void
  orderNewDepartment: string
  onOrderNewDepartmentChange: (value: string) => void
  baseSalaryNum: number
}

export function OrderSection({
  generateOrder,
  onGenerateOrderChange,
  orderType,
  onOrderTypeChange,
  orderEffectiveDate,
  onOrderEffectiveDateChange,
  orderDescription,
  onOrderDescriptionChange,
  orderNewPosition,
  onOrderNewPositionChange,
  orderNewDepartment,
  onOrderNewDepartmentChange,
  baseSalaryNum,
}: OrderSectionProps) {
  return (
    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={generateOrder}
          onChange={(e) => onGenerateOrderChange(e.target.checked)}
          className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <span className="font-medium text-sm text-blue-700 dark:text-blue-300">
            صدور همزمان حکم کارگزینی
          </span>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            با فعال کردن این گزینه، به همراه فیش حقوقی یک حکم کارگزینی نیز صادر می‌شود.
          </p>
        </div>
      </label>

      {generateOrder && (
        <div className="mt-3 space-y-3 pt-3 border-t border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-blue-700 dark:text-blue-300">نوع حکم *</Label>
              <Select value={orderType} onValueChange={onOrderTypeChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="انتخاب نوع حکم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALARY_CHANGE">تغییر حقوق</SelectItem>
                  <SelectItem value="POSITION_CHANGE">تغییر سمت</SelectItem>
                  <SelectItem value="CONTRACT_EXTENSION">تمدید قرارداد</SelectItem>
                  <SelectItem value="PROMOTION">ارتقا</SelectItem>
                  <SelectItem value="TRANSFER">انتقال</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-blue-700 dark:text-blue-300">تاریخ اجرا *</Label>
              <Input
                type="text"
                value={orderEffectiveDate}
                onChange={(e) => onOrderEffectiveDateChange(e.target.value)}
                placeholder="مثلاً ۱۴۰۴/۰۱/۰۱"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-blue-700 dark:text-blue-300">سمت جدید (اختیاری)</Label>
              <Input
                type="text"
                value={orderNewPosition}
                onChange={(e) => onOrderNewPositionChange(e.target.value)}
                placeholder="سمت جدید کارمند"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-blue-700 dark:text-blue-300">دپارتمان جدید (اختیاری)</Label>
              <Input
                type="text"
                value={orderNewDepartment}
                onChange={(e) => onOrderNewDepartmentChange(e.target.value)}
                placeholder="دپارتمان جدید"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-blue-700 dark:text-blue-300">توضیحات حکم (اختیاری)</Label>
            <Input
              value={orderDescription}
              onChange={(e) => onOrderDescriptionChange(e.target.value)}
              placeholder="توضیحات مربوط به حکم"
              className="h-8 text-xs"
            />
          </div>

          <div className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
            <span className="font-medium">توجه:</span> حقوق پایه جدید به طور خودکار از مبلغ وارد شده در فیش (
            <span className="font-bold">{formatCurrency(baseSalaryNum)}</span> تومان ) گرفته می‌شود.
          </div>
        </div>
      )}
    </div>
  )
}