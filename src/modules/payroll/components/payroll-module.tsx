'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  DollarSign, Search, Plus, Eye,
  CheckCircle2, Loader2,
  CreditCard,
  Receipt, Lock, Trash2, Edit3,
  Settings, BarChart3,
  Zap, Calculator,
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/core/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits, formatCurrency, getTodayShamsi } from '@/core/lib/utils-fa'
import { FormulaManagementTab } from './formula-management'
import { PERSIAN_MONTHS, RIALS_TO_TOMANS, STATUS_MAP } from '../constants'
import type { PaySlipRecord, PayrollSummaryResponse, EmployeeBasic, PayrollItemDefinition, GenerateResult } from '../types/types'
import { PaySlipStatusBadge } from './pay-slip-status-badge'
import { PaySlipFormDialog } from './PaySlipFormDialog/pay-slip-form-dialog'
import { PaySlipDetailDialog } from './pay-slip-detail-dialog'
import { GeneratePaySlipsDialog } from './generate-pay-slips-dialog'
import { SettingsTab } from './payroll-settings-tab'
import { MonthlyWorkListTab } from './monthly-work-list-tab'
import { Calendar } from 'lucide-react'
import { ReportsTab } from './payroll-reports-tab'
import { useActiveEmployees } from '@/modules/employees/hooks/use-employees-list'
// ============================================
// Main PayrollModule
// ============================================

export function PayrollModule({ initialTab }: { initialTab?: 'list' | 'settings' | 'reports' } = {}) {
  const [payslips, setPayslips] = useState<PaySlipRecord[]>([])
  const [summary, setSummary] = useState<PayrollSummaryResponse>({
    totalBaseSalary: 0, totalAllowances: 0, totalDeductions: 0, totalNetSalary: 0, count: 0, byStatus: {}
  })
  const { data: employees = [], isLoading: employeesLoading } = useActiveEmployees()
  const [payrollItems, setPayrollItems] = useState<PayrollItemDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const today = getTodayShamsi()
  const [yearFilter, setYearFilter] = useState(today.year)
  const [monthFilter, setMonthFilter] = useState(today.month)
  const [showCreate, setShowCreate] = useState(false)
  const [editPayslip, setEditPayslip] = useState<PaySlipRecord | null>(null)
  const [detailPayslip, setDetailPayslip] = useState<PaySlipRecord | null>(null)
  const [showGenerate, setShowGenerate] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab === 'settings' ? 'settings' : initialTab === 'reports' ? 'reports' : 'payslips')
  const { toast } = useToast()

  const fetchPayroll = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (yearFilter) params.set('year', String(yearFilter))
      if (monthFilter) params.set('month', String(monthFilter))
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/payroll?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setPayslips(json.payslips || [])
        setSummary(json.summary || { totalBaseSalary: 0, totalAllowances: 0, totalDeductions: 0, totalNetSalary: 0, count: 0, byStatus: {} })
      }
    } catch (err) {
      console.error('Fetch payroll error:', err)
    } finally {
      setLoading(false)
    }
  }, [yearFilter, monthFilter, statusFilter, search])
 


  const fetchPayrollItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/payroll/items?year=${yearFilter}`)
      if (res.ok) {
        const json = await res.json()
        setPayrollItems(json.items || [])
      }
    } catch (err) {
      console.error('Fetch payroll items error:', err)
    }
  }, [yearFilter])
  useEffect(() => {
    fetchPayroll()
    fetchPayrollItems()
  }, [fetchPayroll, fetchPayrollItems])

  const handleCreate = async (formData: {
    employeeId: string
    year: number
    month: number
    baseSalary: number
    workDays: number
    overtimeHours: number
    notes: string | null
    items: { title: string; category: string; amount: number; payrollItemId: string | null; sortOrder: number }[]
  }) => {
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast({ title: 'فیش حقوقی با موفقیت صادر شد' })
        setShowCreate(false)
        fetchPayroll()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا در صدور فیش', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleEdit = async (formData: {
    employeeId: string
    year: number
    month: number
    baseSalary: number
    workDays: number
    overtimeHours: number
    notes: string | null
    items: { title: string; category: string; amount: number; payrollItemId: string | null; sortOrder: number }[]
  }) => {
    if (!editPayslip) return
    try {
      const res = await fetch(`/api/payroll/${editPayslip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast({ title: 'فیش حقوقی بروزرسانی شد' })
        setEditPayslip(null)
        fetchPayroll()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا در بروزرسانی', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const statusLabel = STATUS_MAP[newStatus]?.label || newStatus
        toast({ title: `فیش حقوقی ${statusLabel} شد` })
        fetchPayroll()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا در تغییر وضعیت', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleBatchAction = async (action: 'confirm' | 'pay') => {
    const targetStatus = action === 'confirm' ? 'draft' : 'confirmed'
    const targetSlips = payslips.filter(p => p.status === targetStatus)
    if (targetSlips.length === 0) {
      toast({ title: `فیش ${STATUS_MAP[targetStatus]?.label || targetStatus} وجود ندارد`, variant: 'destructive' })
      return
    }
    const actionLabel = action === 'confirm' ? 'تأیید' : 'پرداخت'
    if (!confirm(`آیا از ${actionLabel} ${toPersianDigits(targetSlips.length)} فیش اطمینان دارید؟`)) return
    try {
      const res = await fetch('/api/payroll/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: targetSlips.map(s => s.id) }),
      })
      if (res.ok) {
        const json = await res.json()
        toast({ title: json.message || `${toPersianDigits(json.updated)} فیش ${actionLabel} شد` })
        fetchPayroll()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این فیش حقوقی اطمینان دارید؟ فقط فیش‌های پیش‌نویس قابل حذف هستند.')) return
    try {
      const res = await fetch(`/api/payroll/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'فیش حقوقی حذف شد' })
        fetchPayroll()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا در حذف', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    }
  }

  const handleGenerate = async (year: number, month: number): Promise<GenerateResult | null> => {
    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      })
      if (res.ok) {
        const json = await res.json()
        fetchPayroll()
        return json as GenerateResult
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا در تولید', variant: 'destructive' })
        return null
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
      return null
    }
  }

  const handleViewDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/${id}`)
      if (res.ok) {
        const json = await res.json()
        setDetailPayslip(json)
      }
    } catch {
      toast({ title: 'خطا در دریافت جزئیات', variant: 'destructive' })
    }
  }

  const draftCount = summary.byStatus?.draft || payslips.filter(p => p.status === 'draft').length
  const confirmedCount = summary.byStatus?.confirmed || payslips.filter(p => p.status === 'confirmed').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            حقوق و دستمزد
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت فیش حقوقی، محاسبه و پرداخت
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowGenerate(true)} className="gap-2">
            <Zap className="w-4 h-4" />
            تولید خودکار
          </Button>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            صدور فیش
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="payslips" className="gap-1">
            <Receipt className="w-3.5 h-3.5" />
            فیش حقوقی
          </TabsTrigger>
          <TabsTrigger value="work-records" className="gap-1">
  <Calendar className="w-3.5 h-3.5" />
  کارکرد ماهانه
</TabsTrigger>
          <TabsTrigger value="formulas" className="gap-1">
            <Calculator className="w-3.5 h-3.5" />
            فرمول‌ها
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1">
            <Settings className="w-3.5 h-3.5" />
            تنظیمات
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            گزارشات
          </TabsTrigger>
        </TabsList>

        {/* فیش حقوقی Tab */}
        <TabsContent value="payslips" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{toPersianDigits(summary.count)}</div>
                <div className="text-xs text-muted-foreground">کل فیش‌ها</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(RIALS_TO_TOMANS(summary.totalNetSalary))}</div>
                <div className="text-xs text-muted-foreground">جمع خالص پرداختی</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-teal-700 dark:text-teal-300">{formatCurrency(RIALS_TO_TOMANS(summary.totalAllowances))}</div>
                <div className="text-xs text-muted-foreground">جمع مزایا</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-rose-700 dark:text-rose-300">{formatCurrency(RIALS_TO_TOMANS(summary.totalDeductions))}</div>
                <div className="text-xs text-muted-foreground">جمع کسورات</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">سال:</Label>
              <Input
                type="number"
                value={yearFilter}
                onChange={(e) => setYearFilter(Number(e.target.value))}
                dir="ltr"
                className="w-24 h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">ماه:</Label>
              <Select value={String(monthFilter)} onValueChange={(v) => setMonthFilter(Number(v))}>
                <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERSIAN_MONTHS.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">وضعیت:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="draft">پیش‌نویس</SelectItem>
                  <SelectItem value="confirmed">تأیید شده</SelectItem>
                  <SelectItem value="paid">پرداخت شده</SelectItem>
                  <SelectItem value="closed">بسته شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="جستجو نام یا کد پرسنلی..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9 h-8 text-sm"
              />
            </div>
            {(draftCount > 0 || confirmedCount > 0) && (
              <div className="flex items-center gap-2">
                {draftCount > 0 && (
                  <Button variant="outline" size="sm" onClick={() => handleBatchAction('confirm')} className="gap-1 text-xs h-7">
                    <CheckCircle2 className="w-3 h-3" />
                    تأیید همه ({toPersianDigits(draftCount)})
                  </Button>
                )}
                {confirmedCount > 0 && (
                  <Button variant="outline" size="sm" onClick={() => handleBatchAction('pay')} className="gap-1 text-xs h-7">
                    <CreditCard className="w-3 h-3" />
                    پرداخت همه ({toPersianDigits(confirmedCount)})
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Payslips Table */}
          {payslips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">فیش حقوقی یافت نشد</p>
              <p className="text-xs mt-1">با کلیک روی &ldquo;تولید خودکار&rdquo; یا &ldquo;صدور فیش&rdquo; شروع کنید</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-3 py-2.5 text-right font-medium text-xs">#</th>
                      <th className="px-3 py-2.5 text-right font-medium text-xs">کارمند</th>
                      <th className="px-3 py-2.5 text-right font-medium text-xs">کد پرسنلی</th>
                      <th className="px-3 py-2.5 text-right font-medium text-xs">دپارتمان</th>
                      <th className="px-3 py-2.5 text-right font-medium text-xs">حقوق پایه</th>
                      <th className="px-3 py-2.5 text-right font-medium text-xs">مزایا</th>
                      <th className="px-3 py-2.5 text-right font-medium text-xs">کسورات</th>
                      <th className="px-3 py-2.5 text-right font-medium text-xs">خالص</th>
                      <th className="px-3 py-2.5 text-right font-medium text-xs">وضعیت</th>
                      <th className="px-3 py-2.5 text-right font-medium text-xs">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map((slip, idx) => (
                      <tr key={slip.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2.5 text-muted-foreground">{toPersianDigits(idx + 1)}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="text-[10px] bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                                {slip.employee?.firstName?.[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{slip.employee?.firstName} {slip.employee?.lastName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs">{toPersianDigits(slip.employee?.personnelCode || '')}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{slip.employee?.department || '—'}</td>
                        <td className="px-3 py-2.5 font-mono text-xs">{formatCurrency(RIALS_TO_TOMANS(slip.baseSalary))}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-teal-700 dark:text-teal-300">{formatCurrency(RIALS_TO_TOMANS(slip.totalAllowances))}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-rose-700 dark:text-rose-300">{formatCurrency(RIALS_TO_TOMANS(slip.totalDeductions))}</td>
                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(RIALS_TO_TOMANS(slip.netSalary))}</td>
                        <td className="px-3 py-2.5">
                          <PaySlipStatusBadge status={slip.status} />
                        </td>
                        <td className="px-3 py-2.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[140px]">
                              <DropdownMenuItem onClick={() => handleViewDetail(slip.id)} className="gap-2">
                                <Eye className="w-3.5 h-3.5" />
                                مشاهده
                              </DropdownMenuItem>
                              {slip.status === 'draft' && (
                                <DropdownMenuItem onClick={() => setEditPayslip(slip)} className="gap-2">
                                  <Edit3 className="w-3.5 h-3.5" />
                                  ویرایش
                                </DropdownMenuItem>
                              )}
                              {slip.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(slip.id, 'confirmed')} className="gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  تأیید
                                </DropdownMenuItem>
                              )}
                              {slip.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(slip.id, 'paid')} className="gap-2">
                                  <CreditCard className="w-3.5 h-3.5" />
                                  ثبت پرداخت
                                </DropdownMenuItem>
                              )}
                              {slip.status === 'paid' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(slip.id, 'closed')} className="gap-2">
                                  <Lock className="w-3.5 h-3.5" />
                                  بستن
                                </DropdownMenuItem>
                              )}
                              {slip.status === 'draft' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDelete(slip.id)} className="gap-2 text-rose-600 focus:text-rose-700">
                                    <Trash2 className="w-3.5 h-3.5" />
                                    حذف
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="work-records" className="space-y-4">
  <MonthlyWorkListTab employees={employees} year={yearFilter} />
</TabsContent>

        {/* فرمول‌ها Tab */}
        <TabsContent value="formulas">
          <FormulaManagementTab year={yearFilter} onRefresh={fetchPayrollItems} />
        </TabsContent>

        {/* تنظیمات Tab */}
        <TabsContent value="settings">
          <SettingsTab year={yearFilter} />
        </TabsContent>

        {/* گزارشات Tab */}
        <TabsContent value="reports">
          <ReportsTab year={yearFilter} month={monthFilter} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PaySlipFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        employees={employees}
        payrollItems={payrollItems}
        year={yearFilter}
      />

      <PaySlipFormDialog
        open={!!editPayslip}
        onClose={() => setEditPayslip(null)}
        onSubmit={handleEdit}
        employees={employees}
        initialData={editPayslip}
        payrollItems={payrollItems}
        year={yearFilter}
      />

      <PaySlipDetailDialog
        open={!!detailPayslip}
        onClose={() => setDetailPayslip(null)}
        payslip={detailPayslip}
      />

      <GeneratePaySlipsDialog
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerate={handleGenerate}
      />
    </div>
  )
}
