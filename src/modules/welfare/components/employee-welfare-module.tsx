'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Award, CreditCard, Search, Loader2, Eye,
  LayoutGrid, List, ChevronRight, ChevronLeft, X,
  Banknote, Calendar, User, FileText, Tag, CheckCircle2, Clock, AlertCircle
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/core/components/ui/dialog'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'
import { Card, CardContent } from '@/core/components/ui/card'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Separator } from '@/core/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { LOAN_STATUS, LOAN_TYPE_CONFIG } from '../constants'
import type { Employee, Reward, Loan } from '../index'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { EmployeeLoanFormDialog } from './employee-loan-form-dialog'
import { toast } from 'sonner'

// ============================================
// Detail Dialog Component
// ============================================

function DetailDialog({
  open,
  onClose,
  title,
  type,
  data,
}: {
  open: boolean
  onClose: () => void
  title: string
  type: 'loan' | 'reward'
  data: any
}) {
  if (!data) return null
  const [showLoanDialog, setShowLoanDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const isLoan = type === 'loan'
  const st = isLoan ? LOAN_STATUS[data.status] || LOAN_STATUS.pending : null
  const lt = isLoan ? LOAN_TYPE_CONFIG[data.type] || LOAN_TYPE_CONFIG['وام'] : null

  const handleLoanSubmit = async (data: any) => {
  setSaving(true)
  try {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('درخواست وام با موفقیت ثبت شد')
      setShowLoanDialog(false)
      fetchEmployeeLoans()
    } else {
      const err = await res.json()
      toast.error(err.error || 'خطا در ثبت درخواست')
    }
  } catch {
    toast.error('خطا در ارتباط با سرور')
  } finally {
    setSaving(false)
  }
}
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm flex items-center gap-2">
              {isLoan ? (
                <CreditCard className="w-4 h-4 text-sky-600" />
              ) : (
                <Award className="w-4 h-4 text-pink-600" />
              )}
              {title}
            </DialogTitle>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-bold">
                {data.employee?.firstName?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">
                {data.employee?.firstName} {data.employee?.lastName}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {data.employee?.department || 'بدون دپارتمان'}
                {data.employee?.position && ` • ${data.employee.position}`}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {isLoan ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Banknote className="w-3.5 h-3.5" />
                      مبلغ
                    </div>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {formatCurrency(data.amount)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Tag className="w-3.5 h-3.5" />
                      نوع
                    </div>
                    <p className="text-sm font-medium mt-0.5">
                      <Badge className={`text-[10px] ${lt?.color}`}>{lt?.label || data.type}</Badge>
                    </p>
                  </div>
                </div>

                {data.installments && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      اقساط
                    </div>
                    <p className="text-sm font-medium mt-0.5">
                      {toPersianDigits(data.installments)} قسط — هر قسط: {formatCurrency(Math.round(data.amount / data.installments))}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      تاریخ ثبت
                    </div>
                    <p className="text-sm font-medium mt-0.5">
                      {toPersianDigits(new Date(data.createdAt).toLocaleDateString('fa-IR'))}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      وضعیت
                    </div>
                    <div className="mt-0.5">
                      <Badge className={`text-[10px] ${st?.color}`}>{st?.label || data.status}</Badge>
                    </div>
                  </div>
                </div>

                {data.reason && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <FileText className="w-3.5 h-3.5" />
                      دلیل
                    </div>
                    <p className="text-sm mt-0.5">{data.reason}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Tag className="w-3.5 h-3.5" />
                      نوع
                    </div>
                    <p className="text-sm font-medium mt-0.5">
                      <Badge className="text-[10px] bg-pink-100 text-pink-700">{data.type}</Badge>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Award className="w-3.5 h-3.5" />
                      عنوان
                    </div>
                    <p className="text-sm font-medium mt-0.5">{data.title}</p>
                  </div>
                </div>

                {data.amount ? (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Banknote className="w-3.5 h-3.5" />
                      مبلغ
                    </div>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatCurrency(data.amount)}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <AlertCircle className="w-3.5 h-3.5" />
                      بدون مبلغ
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      تاریخ ثبت
                    </div>
                    <p className="text-sm font-medium mt-0.5">
                      {toPersianDigits(new Date(data.createdAt).toLocaleDateString('fa-IR'))}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      تاریخ
                    </div>
                    <p className="text-sm font-medium mt-0.5">
                      {toPersianDigits(data.date ? new Date(data.date).toLocaleDateString('fa-IR') : '—')}
                    </p>
                  </div>
                </div>

                {data.reason && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <FileText className="w-3.5 h-3.5" />
                      دلیل
                    </div>
                    <p className="text-sm mt-0.5">{data.reason}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">بستن</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Employee Welfare Module
// ============================================

interface EmployeeWelfareModuleProps {
  employeeId: string
}

export function EmployeeWelfareModule({ employeeId }: EmployeeWelfareModuleProps) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('loans')
  const [search, setSearch] = useState('')
  const [loanStatusFilter, setLoanStatusFilter] = useState('همه')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  // Detail Dialog
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailData, setDetailData] = useState<any>(null)
  const [detailType, setDetailType] = useState<'loan' | 'reward'>('loan')
  const [detailTitle, setDetailTitle] = useState('')

  const openDetail = (data: any, type: 'loan' | 'reward', title: string) => {
    setDetailData(data)
    setDetailType(type)
    setDetailTitle(title)
    setDetailOpen(true)
  }

  // Fetch employee data
  useEffect(() => {
    if (!employeeId) return
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${employeeId}`)
        if (res.ok) {
          const data = await res.json()
          setEmployee(data.data || data)
        }
      } catch (err) {
        console.error('Error fetching employee:', err)
      }
    }
    fetchEmployee()
  }, [employeeId])

  // Fetch employee's loans
  const fetchEmployeeLoans = useCallback(async () => {
    if (!employeeId) return
    try {
      const res = await fetch(`/api/loans?employeeId=${employeeId}`)
      if (res.ok) {
        const result = await res.json()
        const items = Array.isArray(result) ? result : (result.data || [])
        setLoans(items)
      }
    } catch (err) {
      console.error('Error fetching loans:', err)
    }
  }, [employeeId])

  // Fetch employee's rewards
  const fetchEmployeeRewards = useCallback(async () => {
    if (!employeeId) return
    try {
      const res = await fetch(`/api/rewards?employeeId=${employeeId}`)
      if (res.ok) {
        const result = await res.json()
        const items = Array.isArray(result) ? result : (result.data || [])
        setRewards(items)
      }
    } catch (err) {
      console.error('Error fetching rewards:', err)
    }
  }, [employeeId])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchEmployeeLoans(), fetchEmployeeRewards()])
      setLoading(false)
    }
    loadData()
  }, [fetchEmployeeLoans, fetchEmployeeRewards])

  // Filtered loans
  const filteredLoans = useMemo(() => {
    return loans.filter(l => {
      const matchSearch = `${l.reason || ''}`.includes(search)
      const matchStatus = loanStatusFilter === 'همه' || l.status === loanStatusFilter
      return matchSearch && matchStatus
    })
  }, [loans, search, loanStatusFilter])

  // Rewards pagination
  const totalRewards = rewards.length
  const totalRewardPages = Math.ceil(totalRewards / itemsPerPage)
  const paginatedRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return rewards.slice(startIndex, endIndex)
  }, [rewards, currentPage, itemsPerPage])

  // Loans pagination
  const totalLoans = filteredLoans.length
  const totalLoanPages = Math.ceil(totalLoans / itemsPerPage)
  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredLoans.slice(startIndex, endIndex)
  }, [filteredLoans, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (activeTab === 'loans' ? totalLoanPages : totalRewardPages)) {
      setCurrentPage(page)
    }
  }

  // Summary
  const loanSummary = useMemo(() => {
    const total = loans.length
    const pending = loans.filter(l => l.status === 'pending').length
    const approved = loans.filter(l => l.status === 'approved' || l.status === 'paid').length
    const totalAmount = loans.reduce((sum, l) => sum + l.amount, 0)
    return { total, pending, approved, totalAmount }
  }, [loans])

  const rewardSummary = useMemo(() => {
    const total = rewards.length
    const totalAmount = rewards.reduce((sum, r) => sum + (r.amount || 0), 0)
    return { total, totalAmount }
  }, [rewards])

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">رفاهی</h2>
            <p className="text-xs text-muted-foreground">پاداش، تشویق و وام مساعده</p>
          </div>
        </div>
        {employee && (
          <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[10px] font-bold">
                {employee.firstName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{employee.firstName} {employee.lastName}</p>
              <p className="text-[10px] text-muted-foreground">{employee.department || 'بدون دپارتمان'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" dir='rtl'>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-sky-600">{toPersianDigits(loanSummary.total)}</div>
            <div className="text-[10px] text-muted-foreground">کل وام‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{toPersianDigits(loanSummary.pending)}</div>
            <div className="text-[10px] text-muted-foreground">در انتظار تایید</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{toPersianDigits(loanSummary.approved)}</div>
            <div className="text-[10px] text-muted-foreground">تایید شده</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-rose-600">{formatCurrency(loanSummary.totalAmount)}</div>
            <div className="text-[10px] text-muted-foreground">مجموع مبالغ وام</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <TabsList className="grid w-[280px] grid-cols-2">
            <TabsTrigger value="loans" className="gap-1.5 text-xs">
              <CreditCard className="w-3.5 h-3.5" />
              وام‌های من
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{toPersianDigits(loans.length)}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="gap-1.5 text-xs">
              <Award className="w-3.5 h-3.5" />
              پاداش‌های من
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{toPersianDigits(rewards.length)}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {(activeTab === 'loans') && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="جستجو..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-8 w-[180px] text-xs pr-9"
                  />
                </div>
                <Select value={loanStatusFilter} onValueChange={(v) => {
                  setLoanStatusFilter(v)
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="همه">همه</SelectItem>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="approved">تایید شده</SelectItem>
                    <SelectItem value="rejected">رد شده</SelectItem>
                    <SelectItem value="paid">پرداخت شده</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                  <Button
                    variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setViewMode('card')
                      setCurrentPage(1)
                    }}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setViewMode('table')
                      setCurrentPage(1)
                    }}
                  >
                    <List className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
            {activeTab === 'rewards' && (
              <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                <Button
                  variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setViewMode('card')
                    setCurrentPage(1)
                  }}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setViewMode('table')
                    setCurrentPage(1)
                  }}
                >
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Loans Tab */}
        <TabsContent value="loans">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">درخواست وامی ثبت نشده</p>
              <p className="text-xs mt-1">برای درخواست وام با مدیریت تماس بگیرید</p>
            </div>
          ) : viewMode === 'card' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedLoans.map(item => {
                  const st = LOAN_STATUS[item.status] || LOAN_STATUS.pending
                  const lt = LOAN_TYPE_CONFIG[item.type] || LOAN_TYPE_CONFIG['وام']
                  const monthlyInstallment = item.installments ? Math.round(item.amount / item.installments) : 0
                  return (
                    <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-sky-600" />
                            </div>
                            <div>
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
                            <span className="text-[11px] text-muted-foreground">
                              {toPersianDigits(item.installments)} قسط — هر قسط: {formatCurrency(monthlyInstallment)}
                            </span>
                          </div>
                        )}

                        {item.reason && (
                          <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">
                            دلیل: {item.reason}
                          </p>
                        )}

                        <Separator className="my-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            {toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR'))}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => openDetail(item, 'loan', 'جزئیات وام')}
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {totalLoans > itemsPerPage && (
                <div className="flex items-center justify-center gap-4 px-2 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalLoanPages, 5) }, (_, i) => {
                        let pageNum
                        if (totalLoanPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalLoanPages - 2) {
                          pageNum = totalLoanPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className={`h-8 w-8 p-0 text-sm ${
                              currentPage === pageNum 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                          >
                            {toPersianDigits(pageNum)}
                          </Button>
                        )
                      }).reverse()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalLoanPages}
                      className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    نمایش {toPersianDigits(paginatedLoans.length)} از {toPersianDigits(totalLoans)} وام
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">جزئیات</TableHead>
                          <TableHead className="text-xs">تاریخ</TableHead>
                          <TableHead className="text-xs">دلیل</TableHead>
                          <TableHead className="text-xs">اقساط</TableHead>
                          <TableHead className="text-xs">مبلغ</TableHead>
                          <TableHead className="text-xs">نوع</TableHead>
                          <TableHead className="text-xs">وضعیت</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedLoans.map(item => {
                          const st = LOAN_STATUS[item.status] || LOAN_STATUS.pending
                          const lt = LOAN_TYPE_CONFIG[item.type] || LOAN_TYPE_CONFIG['وام']
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => openDetail(item, 'loan', 'جزئیات وام')}
                                >
                                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                </Button>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR'))}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                                {item.reason || '—'}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {item.installments ? toPersianDigits(item.installments) : '—'}
                              </TableCell>
                              <TableCell className="text-xs font-medium">
                                {formatCurrency(item.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] ${lt.color}`}>{lt.label}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {totalLoans > itemsPerPage && (
                <div className="flex items-center justify-center gap-4 px-2 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalLoanPages, 5) }, (_, i) => {
                        let pageNum
                        if (totalLoanPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalLoanPages - 2) {
                          pageNum = totalLoanPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className={`h-8 w-8 p-0 text-sm ${
                              currentPage === pageNum 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                          >
                            {toPersianDigits(pageNum)}
                          </Button>
                        )
                      }).reverse()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalLoanPages}
                      className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    نمایش {toPersianDigits(paginatedLoans.length)} از {toPersianDigits(totalLoans)} وام
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          {rewards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">پاداشی ثبت نشده</p>
              <p className="text-xs mt-1">پاداش‌ها و تشویق‌های شما در اینجا نمایش داده می‌شود</p>
            </div>
          ) : viewMode === 'card' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedRewards.map(item => (
                  <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                            <Award className="w-4 h-4 text-pink-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <Badge className="text-[10px] bg-pink-100 text-pink-700">
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => openDetail(item, 'reward', 'جزئیات پاداش')}
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>

                      {item.amount ? (
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                          {formatCurrency(item.amount)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mb-1">بدون مبلغ</p>
                      )}

                      {item.reason && (
                        <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">
                          دلیل: {item.reason}
                        </p>
                      )}

                      <Separator className="my-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR'))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalRewards > itemsPerPage && (
                <div className="flex items-center justify-center gap-4 px-2 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalRewardPages, 5) }, (_, i) => {
                        let pageNum
                        if (totalRewardPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalRewardPages - 2) {
                          pageNum = totalRewardPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className={`h-8 w-8 p-0 text-sm ${
                              currentPage === pageNum 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                          >
                            {toPersianDigits(pageNum)}
                          </Button>
                        )
                      }).reverse()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalRewardPages}
                      className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    نمایش {toPersianDigits(paginatedRewards.length)} از {toPersianDigits(totalRewards)} پاداش
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">جزئیات</TableHead>
                          <TableHead className="text-xs">تاریخ</TableHead>
                          <TableHead className="text-xs">دلیل</TableHead>
                          <TableHead className="text-xs">مبلغ</TableHead>
                          <TableHead className="text-xs">عنوان</TableHead>
                          <TableHead className="text-xs">نوع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRewards.map(item => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => openDetail(item, 'reward', 'جزئیات پاداش')}
                              >
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR'))}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                              {item.reason || '—'}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-emerald-600">
                              {item.amount ? formatCurrency(item.amount) : '—'}
                            </TableCell>
                            <TableCell className="text-xs">{item.title}</TableCell>
                            <TableCell>
                              <Badge className="text-[10px] bg-pink-100 text-pink-700">{item.type}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {totalRewards > itemsPerPage && (
                <div className="flex items-center justify-center gap-4 px-2 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalRewardPages, 5) }, (_, i) => {
                        let pageNum
                        if (totalRewardPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalRewardPages - 2) {
                          pageNum = totalRewardPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className={`h-8 w-8 p-0 text-sm ${
                              currentPage === pageNum 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                          >
                            {toPersianDigits(pageNum)}
                          </Button>
                        )
                      }).reverse()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalRewardPages}
                      className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    نمایش {toPersianDigits(paginatedRewards.length)} از {toPersianDigits(totalRewards)} پاداش
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <DetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailTitle}
        type={detailType}
        data={detailData}
      />
    </div>
  )
}