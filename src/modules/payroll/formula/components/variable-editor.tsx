'use client'

import { Plus, Trash2, Variable } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Badge } from '@/core/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { SOURCE_TYPES} from '../constants'
import type { VariableFormData } from '../index'

// ============================================
// Variable Editor Section
// ============================================

export function VariableEditor({
  variables,
  onAdd,
  onRemove,
  onUpdate,
}: {
  variables: VariableFormData[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: keyof VariableFormData, value: string) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          متغیرها
          <Badge variant="outline" className="text-[10px]">
            {toPersianDigits(variables.length)} متغیر
          </Badge>
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          افزودن متغیر
        </Button>
      </div>

      {variables.length > 0 ? (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-muted/70">
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">نام متغیر</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">نوع منبع</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">شناسه منبع</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">برچسب</th>
                <th className="px-3 py-2.5 text-center font-medium text-muted-foreground w-12">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((v, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-muted/20'}>
                  <td className="px-3 py-2">
                    <Input
                      placeholder="varName"
                      value={v.varName}
                      onChange={(e) => onUpdate(idx, 'varName', e.target.value)}
                      dir="ltr"
                      className="font-mono text-xs h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={v.sourceType}
                      onValueChange={(val) => onUpdate(idx, 'sourceType', val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_TYPES.map((st) => (
                          <SelectItem key={st.value} value={st.value}>
                            {st.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      placeholder="اختیاری"
                      value={v.sourceId}
                      onChange={(e) => onUpdate(idx, 'sourceId', e.target.value)}
                      dir="ltr"
                      className="font-mono text-xs h-8"
                      disabled={v.sourceType === 'employee_field' || v.sourceType === 'constant'}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      placeholder="برچسب فارسی"
                      value={v.label}
                      onChange={(e) => onUpdate(idx, 'label', e.target.value)}
                      className="text-xs h-8"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => onRemove(idx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>حذف متغیر</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 rounded-lg border-2 border-dashed text-center">
          <Variable className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">متغیری تعریف نشده است</p>
          <p className="text-xs text-muted-foreground mt-1">
            با کلیک روی دکمه «افزودن متغیر» متغیرهای فرمول را تعریف کنید
          </p>
        </div>
      )}
    </div>
  )
}
