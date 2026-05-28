'use client'

import { useState } from 'react'
import {
  Eye, Loader2, CheckCircle2, XCircle, Link2,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { SOURCE_TYPE_MAP, fetchFormulaById } from '../constants'
import type { SalaryFormula } from '../types/types'

// ============================================
// Formula Detail Dialog
// ============================================

export function FormulaDetailDialog({
  open,
  onClose,
  formulaId,
}: {
  open: boolean
  onClose: () => void
  formulaId: string | null
}) {
  const { toast } = useToast()
  const [formula, setFormula] = useState<SalaryFormula | null>(null)
  const [loading, setLoading] = useState(false)
  const [prevFormulaId, setPrevFormulaId] = useState<string | null>(null)

  // Detect formulaId changes and fetch data via callback pattern
  if (open && formulaId && formulaId !== prevFormulaId) {
    setPrevFormulaId(formulaId)
    setLoading(true)
    setFormula(null)
    fetchFormulaById(formulaId)
      .then((data) => {
        setFormula(data)
        setLoading(false)
      })
      .catch((err) => {
        toast({ title: 'خطا', description: err.message, variant: 'destructive' })
        setLoading(false)
      })
  }

  if (!open && prevFormulaId !== null) {
    setPrevFormulaId(null)
    setFormula(null)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            جزئیات فرمول
          </DialogTitle>
          <DialogDescription>
            مشاهده اطلاعات کامل فرمول محاسباتی
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : formula ? (
          <div className="space-y-5 py-4">
            {/* اطلاعات فرمول */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                اطلاعات فرمول
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">نام فرمول</span>
                  <p className="font-semibold mt-0.5">{formula.name}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">کد فرمول</span>
                  <p className="font-mono mt-0.5" dir="ltr">{formula.code}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">عبارت محاسباتی</span>
                  <p className="font-mono text-sm mt-0.5 bg-background p-2 rounded border" dir="ltr">
                    {formula.expression}
                  </p>
                </div>
                {formula.description && (
                  <div className="p-3 rounded-lg bg-muted/50 sm:col-span-2">
                    <span className="text-xs text-muted-foreground">توضیحات</span>
                    <p className="text-sm mt-0.5">{formula.description}</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">سال</span>
                  <p className="mt-0.5">{toPersianDigits(formula.year)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">وضعیت</span>
                  <div className="mt-0.5">
                    {formula.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        فعال
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 gap-1">
                        <XCircle className="w-3 h-3" />
                        غیرفعال
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* متغیرها */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                متغیرها
                <Badge variant="outline" className="text-[10px]">
                  {toPersianDigits(formula.variables.length)} متغیر
                </Badge>
              </h4>
              {formula.variables.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/70">
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">نام متغیر</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">برچسب</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">نوع منبع</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">شناسه منبع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formula.variables.map((v, idx) => (
                        <tr key={v.id} className={idx % 2 === 0 ? '' : 'bg-muted/30'}>
                          <td className="px-4 py-2 font-mono" dir="ltr">{v.varName}</td>
                          <td className="px-4 py-2">{v.label}</td>
                          <td className="px-4 py-2">
                            <Badge variant="outline" className="text-[10px]">
                              {SOURCE_TYPE_MAP[v.sourceType] || v.sourceType}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 font-mono text-muted-foreground" dir="ltr">
                            {v.sourceId || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                  متغیری تعریف نشده است
                </div>
              )}
            </div>

            <Separator />

            {/* آیتم‌های متصل */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                آیتم‌های حقوقی متصل
                <Badge variant="outline" className="text-[10px]">
                  {toPersianDigits(formula.payrollItems?.length ?? 0)} آیتم
                </Badge>
              </h4>
              {formula.payrollItems && formula.payrollItems.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formula.payrollItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono" dir="ltr">
                          {item.code}
                        </Badge>
                        <Badge
                          className={
                            item.category === 'allowance'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px]'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-[10px]'
                          }
                        >
                          {item.category === 'allowance' ? 'مزایا' : 'کسورات'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                  آیتم حقوقی متصلی وجود ندارد
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            اطلاعاتی یافت نشد
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>بستن</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
