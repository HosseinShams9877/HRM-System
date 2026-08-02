// src/modules/employees/components/employee-payroll-tab.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DollarSign, Receipt, Eye, CreditCard, Lock,
  Loader2, Calendar, CheckCircle2, Clock, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/core/components/ui/dialog';
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa';
import { RIALS_TO_TOMANS, STATUS_MAP } from '@/modules/payroll/constants';

// ============================================
// Types
// ============================================

interface PaySlipItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  sortOrder: number;
  payrollItemId: string | null;
}

interface PaySlip {
  id: string;
  employeeId: string;
  year: number;
  month: number;
  baseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  workDays: number;
  overtimeHours: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: PaySlipItem[];
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    personnelCode: string;
    department: string | null;
  };
}

interface EmployeePayrollTabProps {
  employeeId: string;
  employeeName?: string;
}

// ============================================
// Detail Dialog
// ============================================

function PaySlipDetailDialog({
    open,
    onClose,
    payslip,
  }: {
    open: boolean;
    onClose: () => void;
    payslip: PaySlip | null;
  }) {
    const [departmentName, setDepartmentName] = useState<string | null>(null);
  
    // ✅ دریافت نام دپارتمان - این باید قبل از return null باشه
    useEffect(() => {
      const fetchDepartmentName = async () => {
        if (payslip?.employee?.department && !payslip.employee.department.startsWith('_')) {
          try {
            const res = await fetch(`/api/departments/${payslip.employee.department}`);
            if (res.ok) {
              const data = await res.json();
              setDepartmentName(data.name || data.title || payslip.employee.department);
            }
          } catch (e) {
            console.error('Error fetching department:', e);
          }
        }
      };
      fetchDepartmentName();
    }, [payslip?.employee?.department]);
  
    // ❌ اینجا return null بعد از useEffect باید باشه
    if (!payslip) return null;
  
    const statusInfo = STATUS_MAP[payslip.status] || STATUS_MAP.draft;
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  
    const allowances = payslip.items.filter(item => item.category === 'allowance');
    const deductions = payslip.items.filter(item => item.category === 'deduction');
  
    const displayDepartment = departmentName || payslip.employee?.department || null;
  
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto p-0 rounded-2xl shadow-2xl dark:bg-gray-950/95 backdrop-blur-sm border-0">
          {/* ✅ برای accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle>جزئیات فیش حقوقی</DialogTitle>
          </DialogHeader>
  
          {/* هدر */}
          <div className="sticky top-0 z-10 bg-gradient-to-l from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 px-5 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">فیش حقوقی</h3>
                  <p className="text-[10px] text-white/70">
                    {monthNames[payslip.month - 1]} {toPersianDigits(payslip.year)}
                  </p>
                </div>
              </div>
              <Badge className={`text-[10px] ${statusInfo.color} border-0 shadow-sm`}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
  
          {/* محتوا */}
          <div className="px-5 py-4 space-y-4">
            {/* اطلاعات کارمند با دپارتمان */}
            {payslip.employee && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                  {payslip.employee.firstName?.[0] || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {payslip.employee.firstName} {payslip.employee.lastName}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {toPersianDigits(payslip.employee.personnelCode)}
                    {displayDepartment && ` • ${displayDepartment}`}
                  </p>
                </div>
              </div>
            )}
  
            {/* کارت‌های خلاصه */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-sky-50 dark:bg-sky-950/30 rounded-xl p-3 text-center border border-sky-100/50 dark:border-sky-800/30">
                <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">حقوق پایه</p>
                <p className="text-xs font-bold text-sky-700 dark:text-sky-300 mt-0.5">
                  {toPersianDigits(RIALS_TO_TOMANS(payslip.baseSalary))}
                </p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/30 rounded-xl p-3 text-center border border-teal-100/50 dark:border-teal-800/30">
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">مزایا</p>
                <p className="text-xs font-bold text-teal-700 dark:text-teal-300 mt-0.5">
                  {toPersianDigits(RIALS_TO_TOMANS(payslip.totalAllowances))}
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-center border border-rose-100/50 dark:border-rose-800/30">
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">کسورات</p>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                  {toPersianDigits(RIALS_TO_TOMANS(payslip.totalDeductions))}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center border border-emerald-100/50 dark:border-emerald-800/30">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">خالص</p>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {toPersianDigits(RIALS_TO_TOMANS(payslip.netSalary))}
                </p>
              </div>
            </div>
  
            {/* کارکرد */}
            <div className="flex items-center justify-between gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">کارکرد:</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {toPersianDigits(payslip.workDays)} روز
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">اضافه‌کاری:</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {toPersianDigits(payslip.overtimeHours)} ساعت
                </span>
              </div>
            </div>
  
            {/* آیتم‌ها */}
            {(allowances.length > 0 || deductions.length > 0) && (
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-right">جزئیات آیتم‌ها</p>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {allowances.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">مزایا</p>
                      {allowances.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-xs py-1 px-2 rounded-lg bg-teal-50/50 dark:bg-teal-950/20">
                          <span className="text-gray-600 dark:text-gray-400">{item.title}</span>
                          <span className="font-medium text-teal-700 dark:text-teal-300">
                            {toPersianDigits(RIALS_TO_TOMANS(item.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {deductions.length > 0 && (
                    <div className="space-y-1 mt-1">
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">کسورات</p>
                      {deductions.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-xs py-1 px-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20">
                          <span className="text-gray-600 dark:text-gray-400">{item.title}</span>
                          <span className="font-medium text-rose-600 dark:text-rose-400">
                            {toPersianDigits(RIALS_TO_TOMANS(item.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
  
            {/* یادداشت */}
            {payslip.notes && (
              <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-700/50">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-right mb-0.5">یادداشت</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-right">{payslip.notes}</p>
              </div>
            )}
  
            {/* تاریخ ثبت */}
            <div className="text-[9px] text-gray-400 dark:text-gray-500 text-left border-t border-gray-100/50 dark:border-gray-700/50 pt-2">
              ثبت: {toPersianDigits(new Date(payslip.createdAt).toLocaleDateString('fa-IR'))}
            </div>
          </div>
  
          {/* فوتر */}
          <div className="sticky bottom-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-5 py-3 rounded-b-2xl border-t border-gray-100/50 dark:border-gray-700/50">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full text-xs gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              بستن
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

// ============================================
// Main Component
// ============================================

export function EmployeePayrollTab({ employeeId, employeeName = '' }: EmployeePayrollTabProps) {
  const [payslips, setPayslips] = useState<PaySlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<PaySlip | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ✅ دریافت فیش‌های حقوقی - فیلتر در فرانت
  const fetchPayslips = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      
      // ✅ دریافت همه فیش‌ها (بدون فیلتر در API چون قبول نمیکنه)
      const res = await fetch(`/api/payroll`);
      
      if (res.ok) {
        const result = await res.json();
        const allPayslips = result.payslips || [];
        
        // ✅ فیلتر کردن در فرانت بر اساس employeeId
        const filtered = allPayslips.filter((p: PaySlip) => p.employeeId === employeeId);
        
        console.log(`📊 [Payroll] کل فیش‌ها: ${allPayslips.length}, فیش‌های کارمند: ${filtered.length}`);
        
        setPayslips(filtered);
      }
    } catch (err) {
      console.error('Error fetching payslips:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  // آمار
  const stats = useMemo(() => {
    const total = payslips.length;
    const totalNetSalary = payslips.reduce((sum, p) => sum + p.netSalary, 0);
    const totalAllowances = payslips.reduce((sum, p) => sum + p.totalAllowances, 0);
    const totalDeductions = payslips.reduce((sum, p) => sum + p.totalDeductions, 0);
    const statusCounts = payslips.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, totalNetSalary, totalAllowances, totalDeductions, statusCounts };
  }, [payslips]);

  const openDetail = (payslip: PaySlip) => {
    setSelectedPayslip(payslip);
    setDetailOpen(true);
  };

  // مرتب‌سازی فیش‌ها بر اساس تاریخ (جدیدترین اول)
  const sortedPayslips = [...payslips].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between" dir='rtl'>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-right">حقوق و دستمزد</h4>
            <p className="text-[10px] text-muted-foreground text-right">سوابق فیش حقوقی کارمند</p>
          </div>
        </div>
        {employeeName && (
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-medium">{employeeName}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-emerald-600">{toPersianDigits(stats.total)}</div>
            <div className="text-[10px] text-muted-foreground">کل فیش‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-sky-600">{toPersianDigits(RIALS_TO_TOMANS(stats.totalNetSalary))}</div>
            <div className="text-[10px] text-muted-foreground">جمع خالص</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-teal-600">{toPersianDigits(RIALS_TO_TOMANS(stats.totalAllowances))}</div>
            <div className="text-[10px] text-muted-foreground">جمع مزایا</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-rose-600">{toPersianDigits(RIALS_TO_TOMANS(stats.totalDeductions))}</div>
            <div className="text-[10px] text-muted-foreground">جمع کسورات</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      {Object.keys(stats.statusCounts).length > 0 && (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className="text-[10px] text-muted-foreground">وضعیت فیش‌ها:</span>
          {Object.entries(stats.statusCounts).map(([status, count]) => {
            const statusInfo = STATUS_MAP[status] || STATUS_MAP.draft;
            return (
              <Badge key={status} className={`text-[10px] ${statusInfo.color}`}>
                {statusInfo.label}: {toPersianDigits(count)}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Payslips List */}
      {payslips.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-medium">فیش حقوقی ثبت نشده</p>
          <p className="text-[10px] mt-1">هیچ فیش حقوقی برای این کارمند ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPayslips.map(payslip => {
            const statusInfo = STATUS_MAP[payslip.status] || STATUS_MAP.draft;
            const monthName = monthNames[payslip.month - 1];

            return (
              <div
                key={payslip.id}
                className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                onClick={() => openDetail(payslip)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className="text-sm font-semibold">
                        {monthName} {toPersianDigits(payslip.year)}
                      </span>
                      <Badge className={`text-[10px] ${statusInfo.color}`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap justify-end">
                      <span>روزهای کارکرد: {toPersianDigits(payslip.workDays)}</span>
                      <span>اضافه‌کاری: {toPersianDigits(payslip.overtimeHours)} ساعت</span>
                      {payslip.notes && (
                        <span className="truncate max-w-[150px]">{payslip.notes}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => { e.stopPropagation(); openDetail(payslip); }}
                  >
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>

                <div className="mt-2 flex items-center gap-4 text-xs flex-wrap justify-end">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">حقوق پایه:</span>
                    <span className="font-medium">{toPersianDigits(RIALS_TO_TOMANS(payslip.baseSalary))}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">مزایا:</span>
                    <span className="font-medium text-teal-600">{toPersianDigits(RIALS_TO_TOMANS(payslip.totalAllowances))}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">کسورات:</span>
                    <span className="font-medium text-rose-600">{toPersianDigits(RIALS_TO_TOMANS(payslip.totalDeductions))}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">خالص:</span>
                    <span className="font-bold text-emerald-600">{toPersianDigits(RIALS_TO_TOMANS(payslip.netSalary))}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <PaySlipDetailDialog
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedPayslip(null); }}
        payslip={selectedPayslip}
      />
    </div>
  );
}