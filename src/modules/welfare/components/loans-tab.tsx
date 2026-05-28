'use client'

import { CreditCard, Edit2, Trash2, LayoutGrid, List, CheckCircle2, XCircle, Banknote, Calculator, Eye } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Separator } from '@/core/components/ui/separator'
import { Skeleton } from '@/core/components/ui/skeleton'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { LOAN_TYPES, LOAN_TYPE_CONFIG, LOAN_STATUS } from '../constants'
import type { Loan } from '../index'

// ============================================
// Loans Tab — وام
// ============================================

interface LoansTabProps {
  filteredLoans: Loan[]
  loading: boolean
  loanTypeFilter: string
  loanStatusFilter: string
  viewMode: 'card' | 'table'
  onEdit: (item: Loan) => void
  onDelete: (id: string) => void
  onTypeFilterChange: (type: string) => void
  onStatusFilterChange: (status: string) => void
  onViewModeChange: (mode: 'card' | 'table') => void
  onUpdateLoanStatus: (id: string, status: string) => void
  loanSummary: { total: number; pending: number; approved: number; totalAmount: number }
}

export function LoansTab({
  filteredLoans,
  loading,
  loanTypeFilter,
  loanStatusFilter,
  viewMode,
  onEdit,
  onDelete,
  onTypeFilterChange,
  onStatusFilterChange,
  onViewModeChange,
  onUpdateLoanStatus,
  loanSummary,
}: LoansTabProps) {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30">
              <CreditCard className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">کل درخواست‌ها</p>
              <p className="text-sm font-bold">{toPersianDigits(loanSummary.total)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Eye className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">در انتظار تایید</p>
              <p className="text-sm font-bold">{toPersianDigits(loanSummary.pending)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">تایید شده</p>
              <p className="text-sm font-bold">{toPersianDigits(loanSummary.approved)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
              <Banknote className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">مجموع مبالغ</p>
              <p className="text-sm font-bold">{formatCurrency(loanSummary.totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">نوع:</span>
            {['همه', ...LOAN_TYPES].map(t => (
              <Button
                key={t}
                variant={loanTypeFilter === t ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-[11px] px-2.5"
                onClick={() => onTypeFilterChange(t)}
              >
                {t}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">وضعیت:</span>
            {['همه', 'pending', 'approved', 'rejected', 'paid'].map(s => (
              <Button
                key={s}
                variant={loanStatusFilter === s ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-[11px] px-2.5"
                onClick={() => onStatusFilterChange(s)}
              >
                {s === 'همه' ? 'همه' : LOAN_STATUS[s]?.label || s}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
          <Button
            variant={viewMode === 'card' ? 'secondary' : 'ghost'}
            size="sm" className="h-7 w-7 p-0"
            onClick={() => onViewModeChange('card')}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm" className="h-7 w-7 p-0"
            onClick={() => onViewModeChange('table')}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Loans Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">درخواست وامی ثبت نشده</p>
          <p className="text-xs mt-1">درخواست وام جدید از دکمه «درخواست وام» ایجاد کنید</p>
        </div>
      ) : viewMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map(item => {
            const st = LOAN_STATUS[item.status] || LOAN_STATUS.pending
            const lt = LOAN_TYPE_CONFIG[item.type] || LOAN_TYPE_CONFIG['وام']
            const monthlyInstallment = item.installments ? Math.round(item.amount / item.installments) : 0
            return (
              <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.employee?.firstName} {item.employee?.lastName}</p>
                        <Badge className={`text-[10px] ${lt.color}`}>{lt.label}</Badge>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                  </div>

                  <p className="text-base font-bold text-foreground mb-1">
                    {formatCurrency(item.amount)}
                  </p>

                  {item.installments && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Calculator className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {toPersianDigits(item.installments)} قسط — هر قسط: {formatCurrency(monthlyInstallment)}
                      </span>
                    </div>
                  )}

                  {item.reason && (
                    <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">{item.reason}</p>
                  )}

                  <Separator className="my-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR'))}
                    </span>
                    <div className="flex items-center gap-1">
                      {/* Approval Workflow */}
                      {item.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost" size="sm"
                            className="h-6 w-6 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                            title="تایید"
                            onClick={() => onUpdateLoanStatus(item.id, 'approved')}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                            title="رد"
                            onClick={() => onUpdateLoanStatus(item.id, 'rejected')}
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </>
                      )}
                      {item.status === 'approved' && (
                        <Button
                          variant="ghost" size="sm"
                          className="h-6 w-6 p-0 hover:bg-sky-100 dark:hover:bg-sky-900/30"
                          title="پرداخت شد"
                          onClick={() => onUpdateLoanStatus(item.id, 'paid')}
                        >
                          <Banknote className="w-3.5 h-3.5 text-sky-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEdit(item)}
                      >
                        <Edit2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">کارمند</TableHead>
                    <TableHead className="text-xs">نوع</TableHead>
                    <TableHead className="text-xs">مبلغ</TableHead>
                    <TableHead className="text-xs">اقساط</TableHead>
                    <TableHead className="text-xs">وضعیت</TableHead>
                    <TableHead className="text-xs">دلیل</TableHead>
                    <TableHead className="text-xs">اقدامات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map(item => {
                    const st = LOAN_STATUS[item.status] || LOAN_STATUS.pending
                    const lt = LOAN_TYPE_CONFIG[item.type] || LOAN_TYPE_CONFIG['وام']
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">
                          {item.employee?.firstName} {item.employee?.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${lt.color}`}>{lt.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.installments ? toPersianDigits(item.installments) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                          {item.reason || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {item.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost" size="sm" className="h-7 w-7 p-0"
                                  title="تایید"
                                  onClick={() => onUpdateLoanStatus(item.id, 'approved')}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                </Button>
                                <Button
                                  variant="ghost" size="sm" className="h-7 w-7 p-0"
                                  title="رد"
                                  onClick={() => onUpdateLoanStatus(item.id, 'rejected')}
                                >
                                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                                </Button>
                              </>
                            )}
                            {item.status === 'approved' && (
                              <Button
                                variant="ghost" size="sm" className="h-7 w-7 p-0"
                                title="پرداخت شد"
                                onClick={() => onUpdateLoanStatus(item.id, 'paid')}
                              >
                                <Banknote className="w-3.5 h-3.5 text-sky-600" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(item)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost" size="sm" className="h-7 w-7 p-0"
                              onClick={() => onDelete(item.id)}
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
