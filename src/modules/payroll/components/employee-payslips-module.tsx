'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Receipt,
  Eye,
  Calendar,
  Loader2,
  Search,
  TrendingUp,
  Clock,
  FileText,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
} from 'lucide-react';
import { Card, CardContent } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa';
import { RIALS_TO_TOMANS, STATUS_MAP } from '../constants';
import { useToast } from '@/core/hooks/use-toast';

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

interface EmployeePayslipsModuleProps {
  employeeId: string;
  employeeName?: string;
}

// ============================================
// 🆕 توابع تبدیل تاریخ شمسی
// ============================================

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

function getCurrentShamsiYear(): number {
  const now = new Date();
  // محاسبه سال شمسی از روی میلادی
  const gregorianYear = now.getFullYear();
  let shamsiYear = gregorianYear - 621;
  // بررسی دقیق‌تر برای روزهای ابتدایی سال
  const gregorianMonth = now.getMonth() + 1;
  const gregorianDay = now.getDate();
  // اگر قبل از 21 مارس (1 فروردین) باشه، سال شمسی یک سال کمتره
  if (gregorianMonth < 3 || (gregorianMonth === 3 && gregorianDay < 21)) {
    shamsiYear = shamsiYear - 1;
  }
  return shamsiYear;
}

function getCurrentShamsiMonth(): number {
  const now = new Date();
  const gregorianMonth = now.getMonth() + 1;
  const gregorianDay = now.getDate();
  
  // فروردین = 1 ≈ 21 مارس
  if (gregorianMonth < 3 || (gregorianMonth === 3 && gregorianDay < 21)) {
    // دی، بهمن، اسفند
    if (gregorianMonth === 12) return 10; // اسفند = 12
    if (gregorianMonth === 1) return 11; // بهمن = 11
    if (gregorianMonth === 2) return 12; // دی = 12
    return 12 - (3 - gregorianMonth);
  }
  // فروردین تا آذر
  return gregorianMonth - 2;
}

// ============================================
// Detail Dialog
// ============================================

function PayslipDetailDialog({
  open,
  onClose,
  payslip,
}: {
  open: boolean;
  onClose: () => void;
  payslip: PaySlip | null;
}) {
  const [departmentName, setDepartmentName] = useState<string | null>(null);

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

  if (!payslip) return null;

  const statusInfo = STATUS_MAP[payslip.status] || STATUS_MAP.draft;
  const allowances = payslip.items.filter((item) => item.category === 'allowance');
  const deductions = payslip.items.filter((item) => item.category === 'deduction');
  const displayDepartment = departmentName || payslip.employee?.department || null;

  const handlePrint = () => {
    const printContent = document.getElementById('payslip-print-content')
    if (!printContent) return
  
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
  
    const styles = `
      <style>
        @page { margin: 20px; }
        body { font-family: 'Tahoma', 'Verdana', sans-serif; direction: rtl; padding: 20px; background: #fff; }
        .print-container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #065f46; font-size: 24px; }
        .header h2 { margin: 5px 0 0; color: #6b7280; font-size: 16px; font-weight: normal; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .info-row .label { color: #6b7280; font-size: 14px; }
        .info-row .value { font-weight: bold; font-size: 14px; }
        .section { margin-top: 20px; }
        .section-title { background: #f3f4f6; padding: 8px 12px; font-weight: bold; font-size: 14px; border-radius: 4px; }
        .item-row { display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 12px; font-weight: bold; border-top: 2px solid #10b981; margin-top: 5px; font-size: 15px; }
        .net-row { background: #ecfdf5; padding: 12px; border-radius: 6px; margin-top: 15px; display: flex; justify-content: space-between; font-size: 18px; }
        .net-row .label { color: #065f46; }
        .net-row .value { color: #047857; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .status-draft { background: #f3f4f6; color: #6b7280; }
        .status-confirmed { background: #dbeafe; color: #1d4ed8; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-closed { background: #fef3c7; color: #92400e; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .text-center { text-align: center; }
        .mb-2 { margin-bottom: 8px; }
      </style>
    `
  
    const statusClass = `status-${payslip.status || 'draft'}`
    const statusLabel = STATUS_MAP[payslip.status]?.label || payslip.status || 'پیش‌نویس'
  
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>فیش حقوقی ${PERSIAN_MONTHS[payslip.month - 1]} ${toPersianDigits(payslip.year)}</title>
          ${styles}
        </head>
        <body>
          <div class="print-container" id="payslip-print-content">
            <div class="header">
              <h1>🧾 فیش حقوقی</h1>
              <h2>${PERSIAN_MONTHS[payslip.month - 1]} ${toPersianDigits(payslip.year)}</h2>
            </div>
  
            <!-- اطلاعات کارمند -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <div class="info-row">
                <span class="label">کارمند</span>
                <span class="value">${payslip.employee?.firstName || ''} ${payslip.employee?.lastName || ''}</span>
              </div>
              <div class="info-row">
                <span class="label">کد پرسنلی</span>
                <span class="value">${toPersianDigits(payslip.employee?.personnelCode || '')}</span>
              </div>
              <div class="info-row">
                <span class="label">وضعیت</span>
                <span class="value"><span class="status-badge ${statusClass}">${statusLabel}</span></span>
              </div>
            </div>
  
            <!-- اطلاعات پایه -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <div class="info-row">
                <span class="label">حقوق پایه</span>
                <span class="value">${toPersianDigits(RIALS_TO_TOMANS(payslip.baseSalary))} تومان</span>
              </div>
              <div class="info-row">
                <span class="label">کارکرد</span>
                <span class="value">${toPersianDigits(payslip.workDays)} روز</span>
              </div>
              <div class="info-row">
                <span class="label">اضافه‌کاری</span>
                <span class="value">${toPersianDigits(payslip.overtimeHours)} ساعت</span>
              </div>
            </div>
  
            <!-- مزایا -->
            ${allowances.length > 0 ? `
              <div class="section">
                <div class="section-title">✅ مزایا</div>
                ${allowances.map(item => `
                  <div class="item-row">
                    <span>${item.title}</span>
                    <span>${toPersianDigits(RIALS_TO_TOMANS(item.amount))} تومان</span>
                  </div>
                `).join('')}
                <div class="total-row">
                  <span>جمع مزایا</span>
                  <span>${toPersianDigits(RIALS_TO_TOMANS(payslip.totalAllowances))} تومان</span>
                </div>
              </div>
            ` : ''}
  
            <!-- کسورات -->
            ${deductions.length > 0 ? `
              <div class="section">
                <div class="section-title">❌ کسورات</div>
                ${deductions.map(item => `
                  <div class="item-row">
                    <span>${item.title}</span>
                    <span>${toPersianDigits(RIALS_TO_TOMANS(item.amount))} تومان</span>
                  </div>
                `).join('')}
                <div class="total-row">
                  <span>جمع کسورات</span>
                  <span>${toPersianDigits(RIALS_TO_TOMANS(payslip.totalDeductions))} تومان</span>
                </div>
              </div>
            ` : ''}
  
            <!-- جمع نهایی -->
            <div class="net-row">
              <span class="label">💰 خالص پرداختی</span>
              <span class="value">${toPersianDigits(RIALS_TO_TOMANS(payslip.netSalary))} تومان</span>
            </div>
  
            <!-- یادداشت -->
            ${payslip.notes ? `
              <div style="margin-top: 16px; padding: 10px 12px; background: #f9fafb; border-radius: 6px; font-size: 13px; color: #4b5563;">
                <strong>یادداشت:</strong> ${payslip.notes}
              </div>
            ` : ''}
  
            <!-- تاریخ -->
            <div class="footer">
              تاریخ ثبت: ${toPersianDigits(new Date(payslip.createdAt).toLocaleDateString('fa-IR'))}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print()
              window.close()
            }
          <\/script>
        </body>
      </html>
    `
  
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto p-0 rounded-2xl shadow-2xl dark:bg-gray-950/95 backdrop-blur-sm border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>جزئیات فیش حقوقی</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-l from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 px-5 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">فیش حقوقی</h3>
                <p className="text-[10px] text-white/70">
                  {PERSIAN_MONTHS[payslip.month - 1]} {toPersianDigits(payslip.year)}
                </p>
              </div>
            </div>
            <Badge className={`text-[10px] ${statusInfo.color} border-0 shadow-sm`}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Employee Info */}
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

          {/* Summary Cards */}
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

          {/* Work Details */}
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

          {/* Items */}
          {(allowances.length > 0 || deductions.length > 0) && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-right">
                جزئیات آیتم‌ها
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {allowances.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">مزایا</p>
                    {allowances.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-xs py-1 px-2 rounded-lg bg-teal-50/50 dark:bg-teal-950/20"
                      >
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
                    {deductions.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-xs py-1 px-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20"
                      >
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

          {/* Note */}
          {payslip.notes && (
            <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-700/50">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 text-right mb-0.5">یادداشت</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 text-right">{payslip.notes}</p>
            </div>
          )}

          {/* Created At */}
          <div className="text-[9px] text-gray-400 dark:text-gray-500 text-left border-t border-gray-100/50 dark:border-gray-700/50 pt-2">
            ثبت: {toPersianDigits(new Date(payslip.createdAt).toLocaleDateString('fa-IR'))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-5 py-3 rounded-b-2xl border-t border-gray-100/50 dark:border-gray-700/50">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 text-xs gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              بستن
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              <Printer className="w-3.5 h-3.5" />
              پرینت
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Component
// ============================================

export function EmployeePayslipsModule({
  employeeId,
  employeeName = '',
}: EmployeePayslipsModuleProps) {
  const [payslips, setPayslips] = useState<PaySlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ✅ سال و ماه شمسی فعلی
  const currentShamsiYear = getCurrentShamsiYear();
  const currentShamsiMonth = getCurrentShamsiMonth();

  const [yearFilter, setYearFilter] = useState<number>(currentShamsiYear);
  const [monthFilter, setMonthFilter] = useState<number | 'all'>('all');

  const [selectedPayslip, setSelectedPayslip] = useState<PaySlip | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  // ✅ دریافت فیش‌های حقوقی
  const fetchPayslips = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      console.log('🔍 Fetching payslips for employee:', employeeId);

      const res = await fetch(`/api/payroll/employee`);

      if (res.ok) {
        const result = await res.json();
        const allPayslips = result.payslips || [];

        // فیلتر بر اساس employeeId
        const filtered = allPayslips.filter(
          (p: PaySlip) => p.employeeId === employeeId
        );

        console.log(
          `📊 [EmployeePayslips] کل فیش‌ها: ${allPayslips.length}, فیش‌های کارمند: ${filtered.length}`
        );
        console.log('📄 نمونه فیش:', filtered[0]);

        setPayslips(filtered);

        // ✅ اگر فیشی وجود داره، سال فیلتر رو بر اساس آخرین فیش تنظیم کن
        if (filtered.length > 0) {
          const latestYear = filtered.reduce(
            (max, p) => (p.year > max ? p.year : max),
            filtered[0].year
          );
          setYearFilter(latestYear);
        }
      } else {
        console.error('❌ Error fetching payslips:', await res.text());
        toast({
          title: 'خطا در دریافت فیش‌های حقوقی',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('❌ Error fetching payslips:', err);
      toast({
        title: 'خطا در ارتباط با سرور',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [employeeId, toast]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  // ✅ فیلتر کردن فیش‌ها
  const filteredPayslips = useMemo(() => {
    let result = [...payslips];

    // فیلتر سال
    if (yearFilter) {
      result = result.filter((p) => p.year === yearFilter);
    }

    // فیلتر ماه
    if (monthFilter !== 'all') {
      result = result.filter((p) => p.month === monthFilter);
    }

    // جستجو
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.notes?.toLowerCase().includes(query) ||
          String(p.year).includes(query) ||
          PERSIAN_MONTHS[p.month - 1].includes(query)
      );
    }

    // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
    result.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });


    return result;
  }, [payslips, yearFilter, monthFilter, search]);

  // ✅ آمار
  const stats = useMemo(() => {
    const total = filteredPayslips.length;
    const totalNetSalary = filteredPayslips.reduce((sum, p) => sum + p.netSalary, 0);
    const totalAllowances = filteredPayslips.reduce((sum, p) => sum + p.totalAllowances, 0);
    const totalDeductions = filteredPayslips.reduce((sum, p) => sum + p.totalDeductions, 0);
    const totalBaseSalary = filteredPayslips.reduce((sum, p) => sum + p.baseSalary, 0);
    const statusCounts = filteredPayslips.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const latest = filteredPayslips.length > 0 ? filteredPayslips[0] : null;

    return {
      total,
      totalNetSalary,
      totalAllowances,
      totalDeductions,
      totalBaseSalary,
      statusCounts,
      latest,
    };
  }, [filteredPayslips]);

  const openDetail = (payslip: PaySlip) => {
    setSelectedPayslip(payslip);
    setDetailOpen(true);
  };

  // ✅ سال‌های موجود در فیش‌ها (مرتب شده نزولی)
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    payslips.forEach((p) => years.add(p.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [payslips]);

  // ✅ ماه‌های موجود در فیش‌ها برای سال انتخاب شده
  const availableMonths = useMemo(() => {
    const months = new Set<number>();
    payslips
      .filter((p) => p.year === yearFilter)
      .forEach((p) => months.add(p.month));
    return Array.from(months).sort((a, b) => a - b);
  }, [payslips, yearFilter]);

  // داخل PayslipDetailDialog، قبل از return، این تابع رو اضافه کن:



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground">در حال بارگذاری فیش‌های حقوقی...</p>
      </div>
    );
  }

  // ✅ اگر هیچ فیشی وجود نداره
  if (payslips.length === 0) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">فیش حقوقی من</h2>
              <p className="text-xs text-muted-foreground">
                {employeeName ? `کارمند: ${employeeName}` : 'مشاهده و مدیریت فیش‌های حقوقی'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-16 text-muted-foreground">
          <Receipt className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-base font-medium">هیچ فیش حقوقی ثبت نشده است</p>
          <p className="text-sm mt-1">هنوز هیچ فیش حقوقی برای شما صادر نشده است</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">فیش حقوقی من</h2>
            <p className="text-xs text-muted-foreground">
              {employeeName ? `کارمند: ${employeeName}` : 'مشاهده و مدیریت فیش‌های حقوقی'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs">
          <FileText className="w-3.5 h-3.5" />
          {toPersianDigits(stats.total)} فیش
        </Badge>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {toPersianDigits(stats.total)}
            </p>
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">کل فیش‌ها</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-sky-700 dark:text-sky-300">
              {toPersianDigits(RIALS_TO_TOMANS(stats.totalNetSalary))}
            </p>
            <p className="text-[10px] text-sky-600/70 dark:text-sky-400/70">جمع خالص</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-teal-700 dark:text-teal-300">
              {toPersianDigits(RIALS_TO_TOMANS(stats.totalAllowances))}
            </p>
            <p className="text-[10px] text-teal-600/70 dark:text-teal-400/70">جمع مزایا</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-rose-700 dark:text-rose-300">
              {toPersianDigits(RIALS_TO_TOMANS(stats.totalDeductions))}
            </p>
            <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70">جمع کسورات</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== آخرین فیش ===== */}
      {stats.latest && (
        <Card className="border-0 shadow-sm bg-gradient-to-l from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">آخرین فیش</p>
                  <p className="text-sm font-semibold">
                    {PERSIAN_MONTHS[stats.latest.month - 1]} {toPersianDigits(stats.latest.year)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs flex-wrap">
                <span className="text-muted-foreground">خالص:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {toPersianDigits(RIALS_TO_TOMANS(stats.latest.netSalary))}
                </span>
                <Badge
                  className={`text-[10px] ${
                    STATUS_MAP[stats.latest.status]?.color || ''
                  }`}
                >
                  {STATUS_MAP[stats.latest.status]?.label || stats.latest.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== Filters ===== */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap text-muted-foreground">سال:</Label>
          <Select
            value={String(yearFilter)}
            onValueChange={(v) => setYearFilter(Number(v))}
          >
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {toPersianDigits(year)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={String(currentShamsiYear)}>
                  {toPersianDigits(currentShamsiYear)}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap text-muted-foreground">ماه:</Label>
          <Select
            value={String(monthFilter)}
            onValueChange={(v) => setMonthFilter(v === 'all' ? 'all' : Number(v))}
          >
            <SelectTrigger className="w-28 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه ماه‌ها</SelectItem>
              {availableMonths.length > 0 ? (
                availableMonths.map((month) => (
                  <SelectItem key={month} value={String(month)}>
                    {PERSIAN_MONTHS[month - 1]}
                  </SelectItem>
                ))
              ) : (
                PERSIAN_MONTHS.map((name, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="جستجو در فیش‌ها..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* وضعیت‌ها */}
        {Object.keys(stats.statusCounts).length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {Object.entries(stats.statusCounts).map(([status, count]) => {
              const statusInfo = STATUS_MAP[status] || STATUS_MAP.draft;
              return (
                <Badge key={status} className={`text-[9px] ${statusInfo.color}`}>
                  {statusInfo.label}: {toPersianDigits(count)}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== Payslips List ===== */}
      {filteredPayslips.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">فیش حقوقی یافت نشد</p>
          <p className="text-xs mt-1">
            {payslips.length === 0
              ? 'هنوز هیچ فیش حقوقی برای شما ثبت نشده است'
              : 'با فیلترهای انتخاب شده، فیشی پیدا نشد'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayslips.map((payslip) => {
            const statusInfo = STATUS_MAP[payslip.status] || STATUS_MAP.draft;
            const monthName = PERSIAN_MONTHS[payslip.month - 1];

            return (
              <div
                key={payslip.id}
                className="group p-4 rounded-xl bg-card hover:shadow-md transition-all duration-200 border border-border/50 hover:border-emerald-200 dark:hover:border-emerald-800 cursor-pointer"
                onClick={() => openDetail(payslip)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Right side */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">
                          {monthName} {toPersianDigits(payslip.year)}
                        </span>
                        <Badge className={`text-[10px] ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>کارکرد: {toPersianDigits(payslip.workDays)} روز</span>
                        <span>اضافه‌کاری: {toPersianDigits(payslip.overtimeHours)} ساعت</span>
                      </div>
                    </div>
                  </div>

                  {/* Left side - Amounts */}
                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">پایه:</span>
                      <span className="font-medium">
                        {toPersianDigits(RIALS_TO_TOMANS(payslip.baseSalary))}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">مزایا:</span>
                      <span className="font-medium text-teal-600 dark:text-teal-400">
                        {toPersianDigits(RIALS_TO_TOMANS(payslip.totalAllowances))}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">کسورات:</span>
                      <span className="font-medium text-rose-600 dark:text-rose-400">
                        {toPersianDigits(RIALS_TO_TOMANS(payslip.totalDeductions))}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">خالص:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {toPersianDigits(RIALS_TO_TOMANS(payslip.netSalary))}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(payslip);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Detail Dialog ===== */}
      <PayslipDetailDialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedPayslip(null);
        }}
        payslip={selectedPayslip}
      />
    </div>
  );
}