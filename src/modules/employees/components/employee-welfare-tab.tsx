// src/modules/employees/components/employee-welfare-tab.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Award, CreditCard, Loader2, Eye, Plus,
  Banknote, Calendar, FileText, Tag, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/core/components/ui/dialog';
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa';
import { LOAN_STATUS, LOAN_TYPE_CONFIG } from '@/modules/welfare/constants';
import { EmployeeLoanFormDialog } from '@/modules/welfare/components/employee-loan-form-dialog';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================

interface Loan {
  id: string;
  type: string;
  amount: number;
  reason: string | null;
  status: string;
  installments: number | null;
  createdAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    department: string | null;
    position: string | null;
  };
}

interface Reward {
  id: string;
  type: string;
  title: string;
  amount: number | null;
  reason: string | null;
  date: string;
  createdAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    department: string | null;
    position: string | null;
  };
}

interface EmployeeWelfareTabProps {
  employeeId: string;
  employeeName?: string;
  employeeDepartment?: string | null;
}

// ============================================
// Detail Dialog
// ============================================

function WelfareDetailDialog({
  open,
  onClose,
  title,
  type,
  data,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  type: 'loan' | 'reward';
  data: any;
}) {
  if (!data) return null;

  const isLoan = type === 'loan';
  const st = isLoan ? LOAN_STATUS[data.status] || LOAN_STATUS.pending : null;
  const lt = isLoan ? LOAN_TYPE_CONFIG[data.type] || LOAN_TYPE_CONFIG['وام'] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            {isLoan ? (
              <CreditCard className="w-4 h-4 text-sky-600" />
            ) : (
              <Award className="w-4 h-4 text-pink-600" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {data.employee && (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-bold">
                    {data.employee.firstName?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">
                    {data.employee.firstName} {data.employee.lastName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {data.employee.department || 'بدون دپارتمان'}
                    {data.employee.position && ` • ${data.employee.position}`}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          <div className="space-y-3">
            {isLoan ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Banknote className="w-3.5 h-3.5" />
                      مبلغ
                    </div>
                    <p className="text-sm font-bold mt-0.5">{formatCurrency(data.amount)}</p>
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
                      {toPersianDigits(data.installments)} قسط — هر قسط:{' '}
                      {formatCurrency(Math.round(data.amount / data.installments))}
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

                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      تاریخ ثبت
                    </div>
                    <p className="text-sm font-medium mt-0.5">
                      {toPersianDigits(new Date(data.createdAt).toLocaleDateString('fa-IR'))}
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
          <Button variant="outline" size="sm" onClick={onClose}>
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Component
// ============================================

export function EmployeeWelfareTab({
  employeeId,
  employeeName = '',
  employeeDepartment = null,
}: EmployeeWelfareTabProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Detail Dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailType, setDetailType] = useState<'loan' | 'reward'>('loan');
  const [detailTitle, setDetailTitle] = useState('');

  const openDetail = (data: any, type: 'loan' | 'reward', title: string) => {
    setDetailData(data);
    setDetailType(type);
    setDetailTitle(title);
    setDetailOpen(true);
  };

  // Fetch loans
  const fetchLoans = useCallback(async () => {
    if (!employeeId) return;
    try {
      const res = await fetch(`/api/loans?employeeId=${employeeId}`);
      if (res.ok) {
        const result = await res.json();
        const items = Array.isArray(result) ? result : (result.data || []);
        setLoans(items);
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
    }
  }, [employeeId]);

  // Fetch rewards
  const fetchRewards = useCallback(async () => {
    if (!employeeId) return;
    try {
      const res = await fetch(`/api/rewards?employeeId=${employeeId}`);
      if (res.ok) {
        const result = await res.json();
        const items = Array.isArray(result) ? result : (result.data || []);
        setRewards(items);
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
    }
  }, [employeeId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLoans(), fetchRewards()]);
      setLoading(false);
    };
    loadData();
  }, [fetchLoans, fetchRewards]);

  // Handle loan submit
  const handleLoanSubmit = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success('درخواست وام با موفقیت ثبت شد');
        setShowLoanDialog(false);
        fetchLoans();
      } else {
        const err = await res.json();
        toast.error(err.error || 'خطا در ثبت درخواست');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSaving(false);
    }
  };

  // Summary
  const loanSummary = useMemo(() => {
    const total = loans.length;
    const pending = loans.filter(l => l.status === 'pending').length;
    const approved = loans.filter(l => l.status === 'approved' || l.status === 'paid').length;
    const totalAmount = loans.reduce((sum, l) => sum + l.amount, 0);
    return { total, pending, approved, totalAmount };
  }, [loans]);

  const rewardSummary = useMemo(() => {
    const total = rewards.length;
    const totalAmount = rewards.reduce((sum, r) => sum + (r.amount || 0), 0);
    return { total, totalAmount };
  }, [rewards]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir='rtl'>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
            <Award className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">رفاهی</h4>
            <p className="text-[10px] text-muted-foreground">پاداش، تشویق و وام</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {employeeName && (
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-medium">{employeeName}</span>
              {employeeDepartment && (
                <span className="text-[10px] text-muted-foreground">• {employeeDepartment}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-sky-600">{toPersianDigits(loanSummary.total)}</div>
            <div className="text-[10px] text-muted-foreground">کل وام‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-amber-600">{toPersianDigits(loanSummary.pending)}</div>
            <div className="text-[10px] text-muted-foreground">در انتظار تایید</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-emerald-600">{toPersianDigits(loanSummary.approved)}</div>
            <div className="text-[10px] text-muted-foreground">تایید شده</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-rose-600">{formatCurrency(loanSummary.totalAmount)}</div>
            <div className="text-[10px] text-muted-foreground">مجموع مبالغ</div>
          </CardContent>
        </Card>
      </div>

      {/* Loans List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-sky-500" />
            وام‌ها
            <Badge variant="secondary" className="text-[10px]">
              {toPersianDigits(loans.length)}
            </Badge>
          </h5>
        </div>

        {loans.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">درخواست وامی ثبت نشده</p>
          </div>
        ) : (
          <div className="space-y-2">
            {loans.slice(0, 5).map(item => {
              const st = LOAN_STATUS[item.status] || LOAN_STATUS.pending;
              const lt = LOAN_TYPE_CONFIG[item.type] || LOAN_TYPE_CONFIG['وام'];
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => openDetail(item, 'loan', 'جزئیات وام')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${lt.color}`}>{lt.label}</Badge>
                        <Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                      </div>
                      <p className="text-xs font-medium mt-0.5">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">
                      {toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR'))}
                    </p>
                    {item.reason && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[120px]">
                        {item.reason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {loans.length > 5 && (
              <p className="text-center text-[10px] text-muted-foreground">
                و {toPersianDigits(loans.length - 5)} مورد دیگر
              </p>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Rewards List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-500" />
            پاداش‌ها
            <Badge variant="secondary" className="text-[10px]">
              {toPersianDigits(rewards.length)}
            </Badge>
          </h5>
        </div>

        {rewards.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">پاداشی ثبت نشده</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rewards.slice(0, 5).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => openDetail(item, 'reward', 'جزئیات پاداش')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{item.title}</p>
                    <Badge className="text-[10px] bg-pink-100 text-pink-700">{item.type}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  {item.amount ? (
                    <p className="text-xs font-medium text-emerald-600">{formatCurrency(item.amount)}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">بدون مبلغ</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR'))}
                  </p>
                </div>
              </div>
            ))}
            {rewards.length > 5 && (
              <p className="text-center text-[10px] text-muted-foreground">
                و {toPersianDigits(rewards.length - 5)} مورد دیگر
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <WelfareDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailTitle}
        type={detailType}
        data={detailData}
      />

     
    </div>
  );
}