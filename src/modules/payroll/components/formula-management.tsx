'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Calculator, Plus, Edit3, Trash2, Eye,
  CheckCircle2, XCircle, AlertTriangle, Zap,
  Variable, Code, Link2,
  Loader2, Search, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { YEAR_OPTIONS, fetchFormulas, createFormula, updateFormula, deleteFormula, seedSystemFormulas } from '../formula/constants'
import { FormulaFormDialog } from '../formula/components/formula-form-dialog'
import { FormulaDetailDialog } from '../formula/components/formula-detail-dialog'
import type { SalaryFormula, FormulaFormData } from '../formula/index'

// ============================================
// Sub-Components
// ============================================

function StatsCards({
  total,
  active,
  connectedItems,
}: {
  total: number
  active: number
  connectedItems: number
}) {
  const cards = [
    {
      title: 'کل فرمول‌ها',
      value: total,
      icon: Calculator,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'فرمول‌های فعال',
      value: active,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      title: 'آیتم‌های متصل',
      value: connectedItems,
      icon: Link2,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.title} className={`${c.bg} ${c.border} border`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{c.title}</p>
                  <p className={`text-2xl font-bold ${c.color}`}>
                    {toPersianDigits(c.value)}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${c.bg}`}>
                  <Icon className={`w-5 h-5 ${c.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ============================================
// Main Component: FormulaManagementTab
// ============================================

export function FormulaManagementTab({ year, onRefresh }: { year: number; onRefresh?: () => void }) {
  const { toast } = useToast()
  const [formulas, setFormulas] = useState<SalaryFormula[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(year)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialogs
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null)
  const [editingFormula, setEditingFormula] = useState<SalaryFormula | null>(null)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingFormula, setDeletingFormula] = useState<SalaryFormula | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Sync year prop
  useEffect(() => {
    setSelectedYear(year)
  }, [year])

  // Fetch formulas
  const loadFormulas = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchFormulas(selectedYear)
      setFormulas(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در دریافت فرمول‌ها'
      toast({ title: 'خطا', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [selectedYear, toast])

  useEffect(() => {
    loadFormulas()
  }, [loadFormulas])

  // Filter formulas by search
  const filteredFormulas = useMemo(() => {
    if (!searchQuery.trim()) return formulas
    const q = searchQuery.trim().toLowerCase()
    return formulas.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.expression.toLowerCase().includes(q)
    )
  }, [formulas, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = formulas.length
    const active = formulas.filter((f) => f.isActive).length
    const connectedItems = formulas.reduce((sum, f) => sum + (f.payrollItems?.length ?? 0), 0)
    return { total, active, connectedItems }
  }, [formulas])

  // Handlers
  const handleSeedSystem = async () => {
    setSeeding(true)
    try {
      const result = await seedSystemFormulas(selectedYear)
      toast({
        title: 'فرمول‌های سیستمی ایجاد شد',
        description: `${toPersianDigits(result.created ?? 0)} فرمول جدید ایجاد و ${toPersianDigits(result.updated ?? 0)} فرمول بروزرسانی شد`,
      })
      await loadFormulas()
      onRefresh?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ایجاد فرمول‌های سیستمی'
      toast({ title: 'خطا', description: message, variant: 'destructive' })
    } finally {
      setSeeding(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingFormula(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (formula: SalaryFormula) => {
    setEditingFormula(formula)
    setFormOpen(true)
  }

  const handleOpenDetail = (id: string) => {
    setSelectedFormulaId(id)
    setDetailOpen(true)
  }

  const handleOpenDeleteConfirm = (formula: SalaryFormula) => {
    setDeletingFormula(formula)
    setDeleteConfirmOpen(true)
  }

  const handleSave = async (data: FormulaFormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        year: selectedYear,
        variables: data.variables.map((v) => ({
          varName: v.varName,
          sourceType: v.sourceType,
          sourceId: v.sourceId || null,
          label: v.label,
        })),
      }
      if (editingFormula) {
        await updateFormula(editingFormula.id, payload)
        toast({ title: 'فرمول بروزرسانی شد', description: `فرمول «${data.name}» با موفقیت بروزرسانی شد` })
      } else {
        await createFormula(payload)
        toast({ title: 'فرمول ایجاد شد', description: `فرمول «${data.name}» با موفقیت ایجاد شد` })
      }
      setFormOpen(false)
      await loadFormulas()
      onRefresh?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ذخیره فرمول'
      toast({ title: 'خطا', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingFormula) return
    setDeleting(true)
    try {
      await deleteFormula(deletingFormula.id)
      toast({ title: 'فرمول حذف شد', description: `فرمول «${deletingFormula.name}» با موفقیت حذف شد` })
      setDeleteConfirmOpen(false)
      setDeletingFormula(null)
      await loadFormulas()
      onRefresh?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در حذف فرمول'
      toast({ title: 'خطا', description: message, variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Year selector + search + actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap text-sm">سال:</Label>
            <Select
              value={String(selectedYear)}
              onValueChange={(val) => setSelectedYear(Number(val))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {toPersianDigits(y)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی فرمول..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 w-[220px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:mr-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadFormulas}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            بروزرسانی
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedSystem}
            disabled={seeding}
            className="gap-1.5"
          >
            {seeding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-600" />
            )}
            ایجاد فرمول سیستمی
          </Button>
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            فرمول جدید
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards
        total={stats.total}
        active={stats.active}
        connectedItems={stats.connectedItems}
      />

      {/* Formulas table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-5 h-5 text-blue-600" />
            فرمول‌های محاسباتی
            <Badge variant="outline" className="text-[10px]">
              {toPersianDigits(filteredFormulas.length)} فرمول
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFormulas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">نام فرمول</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">کد</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">عبارت محاسباتی</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">تعداد متغیرها</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">وضعیت</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">آیتم‌های متصل</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFormulas.map((formula, idx) => (
                    <tr
                      key={formula.id}
                      className={`border-b transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-blue-500 shrink-0" />
                          <div>
                            <p className="font-medium text-sm">{formula.name}</p>
                            {formula.description && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                {formula.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-mono text-[10px]" dir="ltr">
                          {formula.code}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <code
                          className="text-xs bg-muted px-2 py-1 rounded font-mono block max-w-[280px] truncate"
                          dir="ltr"
                        >
                          {formula.expression}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="cursor-help gap-1">
                                <Variable className="w-3 h-3" />
                                {toPersianDigits(formula.variables.length)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {formula.variables.length > 0
                                ? formula.variables.map((v) => `${v.varName} (${v.label})`).join('، ')
                                : 'بدون متغیر'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formula.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            فعال
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 gap-1 text-[10px]">
                            <XCircle className="w-3 h-3" />
                            غیرفعال
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formula.payrollItems && formula.payrollItems.length > 0 ? (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 gap-1 text-[10px]">
                            <Link2 className="w-3 h-3" />
                            {toPersianDigits(formula.payrollItems.length)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  onClick={() => handleOpenDetail(formula.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>مشاهده</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                  onClick={() => handleOpenEdit(formula)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>ویرایش</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                                  onClick={() => handleOpenDeleteConfirm(formula)}
                                  disabled={!!formula.payrollItems && formula.payrollItems.length > 0}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {formula.payrollItems && formula.payrollItems.length > 0
                                  ? 'حذف ممکن نیست — آیتم‌های متصل وجود دارد'
                                  : 'حذف'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <Calculator className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">فرمول محاسباتی یافت نشد</p>
              <p className="text-sm text-muted-foreground mt-1">
                برای سال {toPersianDigits(selectedYear)} فرمولی تعریف نشده است
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={handleSeedSystem} disabled={seeding}>
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  ایجاد فرمول‌های سیستمی
                </Button>
                <Button size="sm" onClick={handleOpenCreate}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  فرمول جدید
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formula Detail Dialog */}
      <FormulaDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        formulaId={selectedFormulaId}
      />

      {/* Formula Create/Edit Dialog */}
      <FormulaFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editingFormula}
        year={selectedYear}
        saving={saving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              تأیید حذف فرمول
            </DialogTitle>
            <DialogDescription>
              آیا از حذف این فرمول اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </DialogDescription>
          </DialogHeader>

          {deletingFormula && (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">نام:</span>
                <span className="font-medium text-sm">{deletingFormula.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">کد:</span>
                <code className="text-xs font-mono" dir="ltr">{deletingFormula.code}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">عبارت:</span>
                <code className="text-xs font-mono" dir="ltr">{deletingFormula.expression}</code>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setDeletingFormula(null)
              }}
              disabled={deleting}
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              حذف فرمول
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
