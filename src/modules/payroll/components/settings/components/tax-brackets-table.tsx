// src/modules/payroll/components/settings/components/tax-brackets-table.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip'
import { Plus, Edit3, Trash2, Save, X, TrendingDown, Loader2 } from 'lucide-react'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'

interface TaxBracketsTableProps {
  brackets: any[]
  loading: boolean
  year: number
  onAdd: (data: { orderNum: number; minAmount: number; maxAmount: number; rate: number }) => Promise<boolean>
  onUpdate: (id: string, data: { orderNum: number; minAmount: number; maxAmount: number; rate: number }) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
  onRefresh: () => void
}

export function TaxBracketsTable({
  brackets,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: TaxBracketsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState({ orderNum: '', minAmount: '', maxAmount: '', rate: '' })
  const [addForm, setAddForm] = useState({ orderNum: '', minAmount: '', maxAmount: '', rate: '' })
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    const data = {
      orderNum: Number(addForm.orderNum),
      minAmount: Number(addForm.minAmount),
      maxAmount: Number(addForm.maxAmount),
      rate: Number(addForm.rate),
    }
    setAdding(true)
    const success = await onAdd(data)
    setAdding(false)
    if (success) {
      setAddForm({ orderNum: '', minAmount: '', maxAmount: '', rate: '' })
    }
  }

  const handleUpdate = async (id: string) => {
    const data = {
      orderNum: Number(editingForm.orderNum),
      minAmount: Number(editingForm.minAmount),
      maxAmount: Number(editingForm.maxAmount),
      rate: Number(editingForm.rate),
    }
    const success = await onUpdate(id, data)
    if (success) {
      setEditingId(null)
    }
  }

  const startEdit = (bracket: any) => {
    setEditingId(bracket.id)
    setEditingForm({
      orderNum: String(bracket.orderNum),
      minAmount: String(bracket.minAmount),
      maxAmount: String(bracket.maxAmount),
      rate: String(bracket.rate),
    })
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
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          پله‌های مالیاتی
          <Badge variant="outline" className="text-[10px]">{toPersianDigits(brackets.length)} پله</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {brackets.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50/50 to-orange-50/50 dark:from-rose-950/10 dark:to-orange-950/10 border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-rose-100/80 to-orange-100/80 dark:from-rose-950/30 dark:to-orange-950/30">
                  <TableHead className="text-right text-xs">پله</TableHead>
                  <TableHead className="text-right text-xs">حداقل (تومان)</TableHead>
                  <TableHead className="text-right text-xs">حداکثر (تومان)</TableHead>
                  <TableHead className="text-right text-xs">نرخ (٪)</TableHead>
                  <TableHead className="text-center text-xs">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brackets.map((bracket) => (
                  <TableRow key={bracket.id}>
                    {editingId === bracket.id ? (
                      <>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingForm.orderNum}
                            onChange={(e) => setEditingForm(f => ({ ...f, orderNum: e.target.value }))}
                            dir="ltr"
                            className="h-7 text-sm w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingForm.minAmount}
                            onChange={(e) => setEditingForm(f => ({ ...f, minAmount: e.target.value }))}
                            dir="ltr"
                            className="h-7 text-sm w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingForm.maxAmount}
                            onChange={(e) => setEditingForm(f => ({ ...f, maxAmount: e.target.value }))}
                            dir="ltr"
                            className="h-7 text-sm w-32"
                            placeholder="0 = بی‌نهایت"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.5"
                            value={editingForm.rate}
                            onChange={(e) => setEditingForm(f => ({ ...f, rate: e.target.value }))}
                            dir="ltr"
                            className="h-7 text-sm w-20"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={() => handleUpdate(bracket.id)}>
                              <Save className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-sm font-medium">{toPersianDigits(bracket.orderNum)}</TableCell>
                        <TableCell className="text-sm font-mono" dir="ltr">{formatCurrency(bracket.minAmount)}</TableCell>
                        <TableCell className="text-sm font-mono" dir="ltr">
                          {bracket.maxAmount === 0 ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-[10px]">
                              بدون سقف
                            </Badge>
                          ) : (
                            formatCurrency(bracket.maxAmount)
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-0 text-[10px]">
                            {toPersianDigits(bracket.rate)}٪
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(bracket)}>
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>ویرایش</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 hover:text-rose-700" onClick={() => onDelete(bracket.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>حذف</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* فرم افزودن پله جدید */}
        <div className="flex items-end gap-3">
          <div className="space-y-1 flex-1">
            <Label className="text-xs">پله</Label>
            <Input
              type="number"
              value={addForm.orderNum}
              onChange={(e) => setAddForm(f => ({ ...f, orderNum: e.target.value }))}
              dir="ltr"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-xs">حداقل (تومان)</Label>
            <Input
              type="number"
              value={addForm.minAmount}
              onChange={(e) => setAddForm(f => ({ ...f, minAmount: e.target.value }))}
              dir="ltr"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-xs">حداکثر (تومان)</Label>
            <Input
              type="number"
              value={addForm.maxAmount}
              onChange={(e) => setAddForm(f => ({ ...f, maxAmount: e.target.value }))}
              dir="ltr"
              className="h-8 text-sm"
              placeholder="0 = بی‌نهایت"
            />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-xs">نرخ (٪)</Label>
            <Input
              type="number"
              step="0.5"
              value={addForm.rate}
              onChange={(e) => setAddForm(f => ({ ...f, rate: e.target.value }))}
              dir="ltr"
              className="h-8 text-sm"
            />
          </div>
          <Button size="sm" onClick={handleAdd} disabled={adding} className="gap-1 h-8">
            {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            افزودن
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}