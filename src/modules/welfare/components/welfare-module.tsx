'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Award, CreditCard, BarChart3, Search, Plus,
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/core/components/ui/dialog'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { toast } from 'sonner'

import { RewardsTab } from './rewards-tab'
import { LoansTab } from './loans-tab'
import { StatisticsTab } from './statistics-tab'
import { RewardFormDialog } from './reward-form-dialog'
import { LoanFormDialog } from './loan-form-dialog'
import { LOAN_STATUS, emptyRewardForm, emptyLoanForm } from '../constants'
import type { Employee, Reward, Loan } from '../index'

// ============================================
// Main Component — رفاهی
// ============================================

export function WelfareModule() {
  // --- State ---
  const [activeTab, setActiveTab] = useState('rewards')
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // View toggles
  const [rewardView, setRewardView] = useState<'card' | 'table'>('card')
  const [loanView, setLoanView] = useState<'card' | 'table'>('card')

  // Filters
  const [rewardTypeFilter, setRewardTypeFilter] = useState('همه')
  const [loanTypeFilter, setLoanTypeFilter] = useState('همه')
  const [loanStatusFilter, setLoanStatusFilter] = useState('همه')

  // Dialogs
  const [showRewardDialog, setShowRewardDialog] = useState(false)
  const [showLoanDialog, setShowLoanDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit state
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'reward' | 'loan'; id: string } | null>(null)

  // Forms
  const [rewardForm, setRewardForm] = useState(emptyRewardForm)
  const [loanForm, setLoanForm] = useState(emptyLoanForm)

  // --- Data Fetching ---
  const fetchRewards = useCallback(async () => {
    try {
      const r = await fetch('/api/rewards')
      if (r.ok) {
        const result = await r.json()
        // Handle both old (array) and new ({ data, pagination }) format
        const items = Array.isArray(result) ? result : (result.data || [])
        setRewards(items)
      }
    } catch (e) { console.error(e) }
  }, [])

  const fetchLoans = useCallback(async () => {
    try {
      const r = await fetch('/api/loans')
      if (r.ok) {
        const result = await r.json()
        // Handle both old (array) and new ({ data, pagination }) format
        const items = Array.isArray(result) ? result : (result.data || [])
        setLoans(items)
      }
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await Promise.all([fetchRewards(), fetchLoans()])
      setLoading(false)
    })()
    fetch('/api/employees')
      .then(r => (r.ok ? r.json() : []))
      .then(result => {
        const d = Array.isArray(result) ? result : (result.data || result.employees || [])
        setEmployees(d)
      })
      .catch(() => {})
  }, [fetchRewards, fetchLoans])

  // --- Filtered Data ---
  const filteredRewards = useMemo(() => {
    return rewards.filter(r => {
      const matchSearch = `${r.employee?.firstName} ${r.employee?.lastName} ${r.title} ${r.reason || ''}`.includes(search)
      const matchType = rewardTypeFilter === 'همه' || r.type === rewardTypeFilter
      return matchSearch && matchType
    })
  }, [rewards, search, rewardTypeFilter])

  const filteredLoans = useMemo(() => {
    return loans.filter(l => {
      const matchSearch = `${l.employee?.firstName} ${l.employee?.lastName} ${l.reason || ''}`.includes(search)
      const matchType = loanTypeFilter === 'همه' || l.type === loanTypeFilter
      const matchStatus = loanStatusFilter === 'همه' || l.status === loanStatusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [loans, search, loanTypeFilter, loanStatusFilter])

  // --- Summary Calculations ---
  const rewardSummary = useMemo(() => {
    const total = rewards.length
    const cash = rewards.filter(r => r.type === 'نقدی').length
    const nonCash = rewards.filter(r => r.type === 'غیرنقدی').length
    const totalAmount = rewards.reduce((sum, r) => sum + (r.amount || 0), 0)
    return { total, cash, nonCash, totalAmount }
  }, [rewards])

  const loanSummary = useMemo(() => {
    const total = loans.length
    const pending = loans.filter(l => l.status === 'pending').length
    const approved = loans.filter(l => l.status === 'approved').length
    const totalAmount = loans.reduce((sum, l) => sum + l.amount, 0)
    return { total, pending, approved, totalAmount }
  }, [loans])

  // --- CRUD Operations ---
  const saveReward = async () => {
    if (!rewardForm.employeeId || !rewardForm.title || !rewardForm.date) {
      toast.error('لطفاً فیلدهای الزامی را پر کنید')
      return
    }
    setSaving(true)
    try {
      const body = { ...rewardForm, amount: rewardForm.amount || null, reason: rewardForm.reason || null }
      if (editingReward) {
        const res = await fetch(`/api/rewards/${editingReward.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) { toast.success('پاداش با موفقیت بروزرسانی شد'); await fetchRewards(); closeRewardDialog() }
        else { toast.error('خطا در بروزرسانی پاداش') }
      } else {
        const res = await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) { toast.success('پاداش با موفقیت ایجاد شد'); await fetchRewards(); closeRewardDialog() }
        else { toast.error('خطا در ایجاد پاداش') }
      }
    } catch (e) { console.error(e); toast.error('خطای شبکه') } finally { setSaving(false) }
  }

  const saveLoan = async () => {
    if (!loanForm.employeeId || !loanForm.amount) {
      toast.error('لطفاً فیلدهای الزامی را پر کنید')
      return
    }
    setSaving(true)
    try {
      const body = { ...loanForm, reason: loanForm.reason || null, installments: loanForm.installments || null }
      if (editingLoan) {
        const res = await fetch(`/api/loans/${editingLoan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) { toast.success('درخواست وام بروزرسانی شد'); await fetchLoans(); closeLoanDialog() }
        else { toast.error('خطا در بروزرسانی وام') }
      } else {
        const res = await fetch('/api/loans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) { toast.success('درخواست وام ثبت شد'); await fetchLoans(); closeLoanDialog() }
        else { toast.error('خطا در ثبت درخواست وام') }
      }
    } catch (e) { console.error(e); toast.error('خطای شبکه') } finally { setSaving(false) }
  }

  const updateLoanStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/loans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const statusLabels: Record<string, string> = { approved: 'تایید', rejected: 'رد', paid: 'پرداخت' }
        toast.success(`وام ${statusLabels[status] || status} شد`)
        await fetchLoans()
      } else { toast.error('خطا در تغییر وضعیت وام') }
    } catch (e) { console.error(e); toast.error('خطای شبکه') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const url = deleteTarget.type === 'reward' ? `/api/rewards/${deleteTarget.id}` : `/api/loans/${deleteTarget.id}`
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) {
        toast.success(deleteTarget.type === 'reward' ? 'پاداش حذف شد' : 'درخواست وام حذف شد')
        if (deleteTarget.type === 'reward') await fetchRewards()
        else await fetchLoans()
      } else { toast.error('خطا در حذف') }
    } catch (e) { console.error(e); toast.error('خطای شبکه') } finally { setDeleteTarget(null); setShowDeleteDialog(false) }
  }

  // --- Dialog Helpers ---
  const openCreateReward = () => {
    setEditingReward(null)
    setRewardForm(emptyRewardForm)
    setShowRewardDialog(true)
  }

  const openEditReward = (reward: Reward) => {
    setEditingReward(reward)
    setRewardForm({
      employeeId: reward.employeeId,
      type: reward.type,
      title: reward.title,
      amount: reward.amount || 0,
      reason: reward.reason || '',
      date: reward.date,
    })
    setShowRewardDialog(true)
  }

  const closeRewardDialog = () => {
    setShowRewardDialog(false)
    setEditingReward(null)
    setRewardForm(emptyRewardForm)
  }

  const openCreateLoan = () => {
    setEditingLoan(null)
    setLoanForm(emptyLoanForm)
    setShowLoanDialog(true)
  }

  const openEditLoan = (loan: Loan) => {
    setEditingLoan(loan)
    setLoanForm({
      employeeId: loan.employeeId,
      type: loan.type,
      amount: loan.amount,
      reason: loan.reason || '',
      installments: loan.installments || 12,
    })
    setShowLoanDialog(true)
  }

  const closeLoanDialog = () => {
    setShowLoanDialog(false)
    setEditingLoan(null)
    setLoanForm(emptyLoanForm)
  }

  // --- Statistics Data ---
  const rewardsByTypeData = useMemo(() => {
    const map: Record<string, number> = {}
    rewards.forEach(r => {
      map[r.type] = (map[r.type] || 0) + (r.amount || 0)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }))
  }, [rewards])

  const loanStatusData = useMemo(() => {
    const map: Record<string, number> = {}
    loans.forEach(l => {
      const label = LOAN_STATUS[l.status]?.label || l.status
      map[label] = (map[label] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [loans])

  const statsMetrics = useMemo(() => {
    const totalRewards = rewards.length
    const totalLoans = loans.length
    const approvedLoans = loans.filter(l => l.status === 'approved' || l.status === 'paid').length
    const approvalRate = totalLoans > 0 ? Math.round((approvedLoans / totalLoans) * 100) : 0
    const avgLoanAmount = totalLoans > 0 ? Math.round(loans.reduce((s, l) => s + l.amount, 0) / totalLoans) : 0
    return { totalRewards, totalLoans, approvalRate, avgLoanAmount }
  }, [rewards, loans])

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">رفاهی</h2>
          <p className="text-xs text-muted-foreground">پاداش، تشویق و وام مساعده</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <TabsList className="grid w-[320px] grid-cols-3">
            <TabsTrigger value="rewards" className="gap-1.5 text-xs">
              <Award className="w-3.5 h-3.5" />
              پاداش
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{toPersianDigits(rewards.length)}</Badge>
            </TabsTrigger>
            <TabsTrigger value="loans" className="gap-1.5 text-xs">
              <CreditCard className="w-3.5 h-3.5" />
              وام
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{toPersianDigits(loans.length)}</Badge>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              آمار
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {(activeTab === 'rewards' || activeTab === 'loans') && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="جستجو..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 w-[180px] text-xs pr-9"
                />
              </div>
            )}
            {activeTab === 'rewards' && (
              <Button size="sm" className="gap-1.5 text-xs" onClick={openCreateReward}>
                <Plus className="w-3.5 h-3.5" />
                پاداش جدید
              </Button>
            )}
            {activeTab === 'loans' && (
              <Button size="sm" className="gap-1.5 text-xs" onClick={openCreateLoan}>
                <Plus className="w-3.5 h-3.5" />
                درخواست وام
              </Button>
            )}
          </div>
        </div>

        {/* ===================== REWARDS TAB ===================== */}
        <TabsContent value="rewards">
          <RewardsTab
            filteredRewards={filteredRewards}
            loading={loading}
            rewardTypeFilter={rewardTypeFilter}
            viewMode={rewardView}
            onEdit={openEditReward}
            onDelete={(id) => { setDeleteTarget({ type: 'reward', id }); setShowDeleteDialog(true) }}
            onTypeFilterChange={setRewardTypeFilter}
            onViewModeChange={setRewardView}
            rewardSummary={rewardSummary}
          />
        </TabsContent>

        {/* ===================== LOANS TAB ===================== */}
        <TabsContent value="loans">
          <LoansTab
            filteredLoans={filteredLoans}
            loading={loading}
            loanTypeFilter={loanTypeFilter}
            loanStatusFilter={loanStatusFilter}
            viewMode={loanView}
            onEdit={openEditLoan}
            onDelete={(id) => { setDeleteTarget({ type: 'loan', id }); setShowDeleteDialog(true) }}
            onTypeFilterChange={setLoanTypeFilter}
            onStatusFilterChange={setLoanStatusFilter}
            onViewModeChange={setLoanView}
            onUpdateLoanStatus={updateLoanStatus}
            loanSummary={loanSummary}
          />
        </TabsContent>

        {/* ===================== STATISTICS TAB ===================== */}
        <TabsContent value="stats">
          <StatisticsTab
            rewards={rewards}
            loans={loans}
            loading={loading}
            rewardSummary={rewardSummary}
            loanSummary={loanSummary}
            rewardsByTypeData={rewardsByTypeData}
            loanStatusData={loanStatusData}
            statsMetrics={statsMetrics}
          />
        </TabsContent>
      </Tabs>

      {/* ===================== REWARD CREATE/EDIT DIALOG ===================== */}
      <RewardFormDialog
        open={showRewardDialog}
        editingReward={editingReward}
        rewardForm={rewardForm}
        employees={employees}
        saving={saving}
        onFormChange={setRewardForm}
        onSave={saveReward}
        onClose={closeRewardDialog}
      />

      {/* ===================== LOAN CREATE/EDIT DIALOG ===================== */}
      <LoanFormDialog
        open={showLoanDialog}
        editingLoan={editingLoan}
        loanForm={loanForm}
        employees={employees}
        saving={saving}
        onFormChange={setLoanForm}
        onSave={saveLoan}
        onClose={closeLoanDialog}
      />

      {/* ===================== DELETE CONFIRMATION DIALOG ===================== */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">تایید حذف</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">آیا از حذف اطمینان دارید؟ این عمل قابل بازگشت نیست.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(false)} className="text-xs">انصراف</Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="text-xs">حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
