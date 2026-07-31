// src/modules/payroll/components/settings/components/payroll-items-table.tsx

'use client'

import { useMemo } from 'react'
import { Button } from '@/core/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Switch } from '@/core/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip'
import { Plus, Edit3, Trash2, Loader2, Receipt, Shield, FileText, Lock } from 'lucide-react'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { RIALS_TO_TOMANS, FORMULA_DESCRIPTIONS } from '../../../constants'

interface PayrollItemsTableProps {
  items: any[]
  loading: boolean
  togglingId: string | null
  year: number
  onToggleActive: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
  onEdit: (item: any) => void
  onAdd: () => void
  onRefresh: () => void
}

export function PayrollItemsTable({
  items,
  loading,
  togglingId,
  onToggleActive,
  onDelete,
  onEdit,
  onAdd,
}: PayrollItemsTableProps) {
  const allowanceItems = useMemo(() =>
    items.filter(i => i.category === 'allowance').sort((a, b) => a.sortOrder - b.sortOrder),
    [items]
  )

  const deductionItems = useMemo(() =>
    items.filter(i => i.category === 'deduction').sort((a, b) => a.sortOrder - b.sortOrder),
    [items]
  )

  const getCalculationTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed': return 'ثابت'
      case 'percentage': return 'درصدی'
      case 'formula': return 'فرمول'
      case 'employee_field': return 'از کارمند'
      default: return type
    }
  }

  const getCalculationTypeColor = (type: string) => {
    switch (type) {
      case 'fixed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      case 'percentage': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
      case 'formula': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
      case 'employee_field': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const renderValue = (item: any) => {
    switch (item.calculationType) {
      case 'fixed':
        return <span className="font-mono" dir="ltr">{formatCurrency(RIALS_TO_TOMANS(item.value))}</span>
      case 'percentage':
        return <span className="font-mono">{toPersianDigits(item.value)}٪ حقوق پایه</span>
      case 'employee_field':
        return <span className="font-mono text-emerald-600">از {item.employeeField || 'کارمند'}</span>
      case 'formula':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-help text-violet-600 dark:text-violet-400">
                  {item.formula?.name || 'فرمول'}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs" dir="rtl">
                <p className="font-semibold mb-1">{item.formula?.name || 'فرمول'}</p>
                {item.formula?.expression && (
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded block mt-1" dir="ltr">
                    {item.formula.expression}
                  </code>
                )}
                {FORMULA_DESCRIPTIONS[item.formula?.code || ''] && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    {FORMULA_DESCRIPTIONS[item.formula?.code || '']}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      default:
        return '—'
    }
  }

  const renderFlags = (item: any) => {
    const flags = []
    if (item.isInsurable) flags.push({ icon: Shield, color: 'text-blue-600', label: 'مشمول بیمه' })
    if (item.isTaxable) flags.push({ icon: FileText, color: 'text-amber-600', label: 'مشمول مالیات' })
    if (item.isSystem) flags.push({ icon: Lock, color: 'text-slate-500', label: 'سیستمی' })
    if (item.calculationType === 'employee_field') flags.push({ 
      icon: () => <span className="text-[9px] font-medium">📁</span>, 
      color: 'text-emerald-600', 
      label: 'از کارمند' 
    })

    if (flags.length === 0) return <span className="text-[10px] text-muted-foreground">—</span>

    return (
      <div className="flex items-center gap-1">
        {flags.map((flag, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`p-0.5 rounded ${flag.color} bg-opacity-10`}>
                  <flag.icon className={`w-3 h-3 ${flag.color}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>{flag.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }

  const renderTable = (items: any[], title: string, icon: React.ReactNode, color: string) => {
    if (items.length === 0) return null

    return (
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <span className={`text-sm font-semibold ${color.replace('bg-', 'text-')}`}>
            {title}
          </span>
          <Badge className={`text-[9px] ${color.replace('bg-', 'bg-')}100 text-${color.replace('bg-', '')}700 dark:${color.replace('bg-', 'bg-')}900/40 dark:text-${color.replace('bg-', '')}300 border-0`}>
            {toPersianDigits(items.length)} آیتم
          </Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow className={`${color.replace('bg-', 'bg-')}50/50 dark:${color.replace('bg-', 'bg-')}950/20`}>
              <TableHead className="text-right text-xs">عنوان</TableHead>
              <TableHead className="text-right text-xs">کد</TableHead>
              <TableHead className="text-right text-xs">نوع محاسبه</TableHead>
              <TableHead className="text-right text-xs">مقدار/فرمول</TableHead>
              <TableHead className="text-right text-xs">پرچم‌ها</TableHead>
              <TableHead className="text-center text-xs">وضعیت</TableHead>
              <TableHead className="text-center text-xs">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className={!item.isActive ? 'opacity-50' : ''}>
                <TableCell className="text-sm font-medium">{item.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono" dir="ltr">{item.code}</TableCell>
                <TableCell>
                  <Badge className={`text-[9px] border-0 ${getCalculationTypeColor(item.calculationType)}`}>
                    {getCalculationTypeLabel(item.calculationType)}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{renderValue(item)}</TableCell>
                <TableCell>{renderFlags(item)}</TableCell>
                <TableCell className="text-center">
                  {togglingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                  ) : (
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={(checked) => onToggleActive(item.id, checked)}
                    />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>ویرایش</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {!item.isSystem && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 hover:text-rose-700" onClick={() => onDelete(item.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>حذف</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            آیتم‌های حقوقی
            <Badge variant="outline" className="text-[10px]">{toPersianDigits(items.length)} آیتم</Badge>
          </CardTitle>
          <Button size="sm" onClick={onAdd} className="gap-1">
            <Plus className="w-3 h-3" />
            آیتم جدید
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            آیتم حقوقی برای سال جاری تعریف نشده است
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto space-y-4">
            {renderTable(allowanceItems, 'مزایا و پرداختی', null, 'bg-emerald-500')}
            {renderTable(deductionItems, 'کسورات', null, 'bg-rose-500')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}