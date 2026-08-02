// app/components/dashboard/AnalyticsCharts.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, Activity,
  PieChart as PieChartIcon, Loader2
} from 'lucide-react';
import { toPersianDigits } from '@/core/lib/utils-fa';
import { UserRole } from "@/core/lib/auth";
import { useQuery } from '@tanstack/react-query';

// ✅ استفاده از هوک موجود
import { useEmployeesList } from '@/modules/employees/hooks/use-employees-list';

// ============================================
// Types
// ============================================

interface AnalyticsChartsProps {
  userRole: UserRole;
  departmentId?: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  personnelCode: string;
  status: string;
  department: string | null;
  departmentName: string | null;
  position: string | null;
  positionName: string | null;
  createdAt: string;
  updatedAt: string;
  hireDate: string;
  exitReason?: string | null;
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  } | null;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

// ============================================
// هوک تشخیص دسکتاپ
// ============================================

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const check = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  return isDesktop;
};

// ============================================
// توابع تبدیل تاریخ
// ============================================

function convertShamsiToGregorian(shamsiDate: string): Date {
  try {
    if (!shamsiDate) return new Date();
    
    const parts = shamsiDate.split('/').map(Number);
    if (parts.length !== 3) return new Date();
    
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    const gregorianYear = year - 621;
    const gregorianMonth = month - 1;
    
    const date = new Date(gregorianYear, gregorianMonth, day);
    
    if (isNaN(date.getTime())) {
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.error('Error converting date:', shamsiDate, error);
    return new Date();
  }
}

function getPeriodKey(date: Date, range: string): string {
  const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 
                      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

  switch (range) {
    case 'week': {
      const weekNumber = Math.ceil((date.getDate() + 1) / 7);
      return `هفته ${weekNumber}`;
    }
    case 'month':
      return monthNames[date.getMonth()];
    case 'halfYear':
      return date.getMonth() < 6 ? 'نیمه اول ۱۴۰۳' : 'نیمه دوم ۱۴۰۳';
    case 'year':
      return `سال ${date.getFullYear()}`;
    default:
      return monthNames[date.getMonth()];
  }
}

function getStartDate(range: string): Date {
  const now = new Date();
  const startDate = new Date(now);

  switch (range) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'halfYear':
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }
  
  return startDate;
}

// ============================================
// توابع پردازش داده‌ها
// ============================================

function processTurnoverData(
  employees: Employee[],
  range: 'week' | 'month' | 'halfYear' | 'year',
  departmentId?: string
) {
  let filtered = employees;
  if (departmentId) {
    filtered = employees.filter(emp => emp.department === departmentId);
  }

  const now = new Date();
  const startDate = getStartDate(range);

  // ✅ جذب‌ها: کارمندانی که hireDate در بازه هست
  const hired = filtered.filter(emp => {
    if (!emp.hireDate) return false;
    const hireDate = convertShamsiToGregorian(emp.hireDate);
    return hireDate >= startDate && hireDate <= now;
  });

  // ✅ خروج‌ها: کارمندانی که status === 'inactive'
  const left = filtered.filter(emp => {
    if (emp.status !== 'inactive') return false;
    const updatedAt = new Date(emp.updatedAt);
    return updatedAt >= startDate && updatedAt <= now;
  });

  // گروه‌بندی بر اساس بازه زمانی
  const groups = new Map<string, { hired: number; left: number; period: string }>();

  hired.forEach(emp => {
    if (!emp.hireDate) return;
    const hireDate = convertShamsiToGregorian(emp.hireDate);
    const key = getPeriodKey(hireDate, range);
    if (!groups.has(key)) {
      groups.set(key, { period: key, hired: 0, left: 0 });
    }
    groups.get(key)!.hired++;
  });

  left.forEach(emp => {
    const key = getPeriodKey(new Date(emp.updatedAt), range);
    if (!groups.has(key)) {
      groups.set(key, { period: key, hired: 0, left: 0 });
    }
    groups.get(key)!.left++;
  });

  let trend = Array.from(groups.values())
    .sort((a, b) => a.period.localeCompare(b.period))
    .map(item => ({
      period: item.period,
      hired: item.hired,
      left: item.left,
      netGrowth: item.hired - item.left,
    }));

  if (trend.length === 0) {
    const defaultPeriod = range === 'week' ? 'هفته جاری' 
                        : range === 'month' ? 'ماه جاری'
                        : range === 'halfYear' ? 'نیمسال جاری'
                        : 'سال جاری';
    trend.push({
      period: defaultPeriod,
      hired: 0,
      left: 0,
      netGrowth: 0,
    });
  }

  return {
    trend,
    summary: {
      totalHired: hired.length,
      totalLeft: left.length,
      netChange: hired.length - left.length,
      totalActive: filtered.filter(emp => emp.status === 'active').length,
    },
  };
}

function calculateRetentionRate(employees: Employee[], departmentId?: string) {
  let filtered = employees;
  if (departmentId) {
    filtered = employees.filter(emp => emp.department === departmentId);
  }

  const totalActive = filtered.filter(emp => emp.status === 'active').length;

  // نرخ ماندگاری ۶ ماه
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const retainedSixMonths = filtered.filter(emp => {
    if (emp.status !== 'active') return false;
    if (!emp.hireDate) return false;
    const hireDate = convertShamsiToGregorian(emp.hireDate);
    return hireDate <= sixMonthsAgo;
  }).length;

  const currentRate = totalActive > 0 ? (retainedSixMonths / totalActive) * 100 : 0;

  // نرخ ماندگاری ۱ سال
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const retainedOneYear = filtered.filter(emp => {
    if (emp.status !== 'active') return false;
    if (!emp.hireDate) return false;
    const hireDate = convertShamsiToGregorian(emp.hireDate);
    return hireDate <= oneYearAgo;
  }).length;

  const longTermRate = totalActive > 0 ? (retainedOneYear / totalActive) * 100 : 0;

  return {
    current: Math.round(currentRate * 10) / 10,
    longTerm: Math.round(longTermRate * 10) / 10,
    totalActive,
    retainedSixMonths,
    retainedOneYear,
  };
}

// ✅ محاسبه توزیع دپارتمان از داده‌های کارمندان
function calculateDepartmentDistribution(
  employees: Employee[]
) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // ✅ محاسبه تعداد کارمندان فعال هر دپارتمان
  const deptMap = new Map<string, { name: string; count: number }>();
  
  employees.forEach(emp => {
    if (emp.status === 'active' && emp.department) {
      const deptId = emp.department;
      const deptName = emp.departmentName || deptId;
      if (!deptMap.has(deptId)) {
        deptMap.set(deptId, { name: deptName, count: 0 });
      }
      deptMap.get(deptId)!.count++;
    }
  });

  // ساخت لیست توزیع
  let distribution = Array.from(deptMap.entries()).map(([deptId, data], index) => ({
    departmentId: deptId,
    name: data.name,
    value: data.count,
    color: colors[index % colors.length],
  }));

  // مرتب‌سازی بر اساس تعداد (نزولی)
  distribution.sort((a, b) => b.value - a.value);

  // محاسبه درصد
  const total = distribution.reduce((sum, item) => sum + item.value, 0);
  const distributionWithPercent = distribution.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));

  return {
    distribution: distributionWithPercent,
    total,
  };
}

// ============================================
// کامپوننت اصلی
// ============================================

function AnalyticsCharts({ userRole, departmentId }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'halfYear' | 'year'>('month');
  
  const isDesktop = useIsDesktop();
  const isAdminOrHR = userRole === 'admin' || userRole === 'hr_manager';

  // ✅ استفاده از هوک موجود برای دریافت همه کارمندان
  const { 
    data: employeesData = [], 
    isLoading: isLoadingEmployees, 
    error: employeesError,
    isFetching: isFetchingEmployees,
  } = useEmployeesList({ status: 'all' }); // همه کارمندان (فعال + غیرفعال)

  // ✅ تبدیل داده‌ها به فرمت استاندارد
  const employees = useMemo(() => {
    return employeesData.map((emp: any) => ({
      id: emp.id,
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      nationalCode: emp.nationalCode || '',
      personnelCode: emp.personnelCode || '',
      status: emp.status || 'active',
      department: emp.department || null,
      departmentName: emp.departmentName || null,
      position: emp.position || null,
      positionName: emp.positionName || null,
      createdAt: emp.createdAt || new Date().toISOString(),
      updatedAt: emp.updatedAt || new Date().toISOString(),
      hireDate: emp.hireDate || '',
      exitReason: emp.exitReason || null,
      user: emp.user || null,
    }));
  }, [employeesData]);

  // پردازش داده‌ها
  const turnoverData = useMemo(() => {
    return processTurnoverData(employees, timeRange, departmentId);
  }, [employees, timeRange, departmentId]);

  const retentionData = useMemo(() => {
    return calculateRetentionRate(employees, departmentId);
  }, [employees, departmentId]);

  const distributionData = useMemo(() => {
    return calculateDepartmentDistribution(employees);
  }, [employees]);

  // فقط در دسکتاپ و برای نقش‌های مجاز نمایش بده
  if (!isDesktop || !isAdminOrHR) {
    return null;
  }

  // نمایش لودینگ
  const isLoading = isLoadingEmployees || isFetchingEmployees;
  
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800">
        <CardContent className="flex-1 flex items-center justify-center flex-col gap-4 p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500 text-sm">در حال بارگذاری داده‌ها...</p>
        </CardContent>
      </Card>
    );
  }

  // نمایش خطا
  if (employeesError) {
    return (
      <Card className="border-0 shadow-xl overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800">
        <CardContent className="flex-1 flex items-center justify-center flex-col gap-4 p-8">
          <p className="text-red-500 text-sm">خطا در دریافت لیست کارمندان</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  const chartData = turnoverData?.trend || [];
  const retention = retentionData || { current: 0, longTerm: 0, totalActive: 0 };
  const distribution = distributionData?.distribution || [];
  const totalEmployees = employees.length;

  // ============================================
  // رندر اصلی
  // ============================================

  return (
    <Card className="border-0 shadow-xl overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800">
      {/* هدر */}
      <div className="px-6 py-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">تحلیل نیروی انسانی</h3>
          
          <div className="flex gap-1">
            {(['week', 'month', 'halfYear', 'year'] as const).map((range) => {
              const labels = { week: 'هفته', month: 'ماه', halfYear: '۶ ماه', year: 'سال' };
              return (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="text-xs px-3 py-1 h-8"
                >
                  {labels[range]}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
          <span>مجموع کارمندان: {toPersianDigits(totalEmployees)} نفر</span>
          <span>|</span>
          <span>فعال: {toPersianDigits(employees.filter(e => e.status === 'active').length)} نفر</span>
          <span>|</span>
          <span>غیرفعال: {toPersianDigits(employees.filter(e => e.status === 'inactive').length)} نفر</span>
          {departmentId && (
            <>
              <span>|</span>
              <span>دپارتمان: {employees.find(e => e.department === departmentId)?.departmentName || 'نامشخص'}</span>
            </>
          )}
        </div>
      </div>

      <CardContent className="p-0">
        {/* نمودار جذب و خروج */}
        <div className="p-5 pb-3 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">روند جذب و خروج پرسنل</span>
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-gray-500">جذب</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-gray-500">خروج</span>
              </div>
            </div>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="period" tickFormatter={(v) => toPersianDigits(v)} fontSize={11} />
                <YAxis tickFormatter={(v) => toPersianDigits(v)} fontSize={11} width={35} />
                <Tooltip
                  formatter={(value, name) => [
                    toPersianDigits(value as number),
                    name === 'hired' ? 'جذب' : 'خروج'
                  ]}
                  contentStyle={{ borderRadius: '8px', fontFamily: 'Vazirmatn', fontSize: '12px' }}
                />
                <Legend formatter={(value) => value === 'hired' ? 'جذب' : 'خروج'} />
                <Line 
                  type="monotone" 
                  dataKey="hired" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="left" 
                  stroke="#ef4444" 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mt-2 pt-2 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>مجموع جذب: {toPersianDigits(turnoverData?.summary.totalHired || 0)} نفر</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>مجموع خروج: {toPersianDigits(turnoverData?.summary.totalLeft || 0)} نفر</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">فعال:</span>
              <span className="font-medium">{toPersianDigits(turnoverData?.summary.totalActive || 0)} نفر</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">تغییرات:</span>
              <span className={`font-medium ${(turnoverData?.summary.netChange || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {toPersianDigits(turnoverData?.summary.netChange || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* نرخ ماندگاری + توزیع پرسنل */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* نرخ ماندگاری */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-700">نرخ ماندگاری</span>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="48" cy="48" r="40"
                    stroke="#10b981" strokeWidth="8" fill="none"
                    strokeDasharray={`${(retention.current / 100) * 251.32} 251.32`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {toPersianDigits(Math.round(retention.current))}%
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">نرخ ۶ ماهه:</span>
                  <span className="font-medium">{toPersianDigits(retention.current)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">نرخ ۱ ساله:</span>
                  <span className="font-medium">{toPersianDigits(retention.longTerm)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">کارمندان فعال:</span>
                  <span className="font-medium">{toPersianDigits(retention.totalActive)} نفر</span>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(retention.current, 0)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                />
              </div>
            </div>
          </div>

          {/* توزیع پرسنل */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">توزیع پرسنل بر اساس واحد</span>
              <span className="text-xs text-gray-400">({distribution.length} واحد)</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28 h-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution.length > 0 ? distribution : [{ name: 'بدون داده', value: 1, color: '#e5e7eb' }]}
                      cx="50%" cy="50%"
                      innerRadius={25} outerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {distribution.length > 0 ? (
                        distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      ) : (
                        <Cell fill="#e5e7eb" />
                      )}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (distribution.length === 0) return ['داده‌ای وجود ندارد', 'وضعیت'];
                        const item = distribution.find(d => d.value === value);
                        return [`${toPersianDigits(value as number)} نفر (${item?.percentage || 0}%)`, 'تعداد'];
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-1.5 max-h-32 overflow-y-auto">
                {distribution.length > 0 ? (
                  distribution.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{item.name}</span>
                      <span className="font-medium">{toPersianDigits(item.value)}</span>
                      <span className="text-gray-400 text-[10px]">({item.percentage}%)</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 text-center py-4">
                    هیچ دپارتمانی ثبت نشده است
                  </div>
                )}
              </div>
            </div>

            {distribution.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
                  <div>تعداد دپارتمان‌ها: {toPersianDigits(distribution.length)}</div>
                  <div>مجموع کارمندان فعال: {toPersianDigits(distribution.reduce((sum, d) => sum + d.value, 0))}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default React.memo(AnalyticsCharts);