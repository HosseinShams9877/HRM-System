// app/components/dashboard/AnalyticsCharts.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, Activity,
  PieChart as PieChartIcon
} from 'lucide-react';
import { toPersianDigits } from '@/core/lib/utils-fa';
import { UserRole } from "@/core/lib/auth"

// ============================================
// Types
// ============================================

interface AnalyticsChartsProps {
  userRole: UserRole;
  departmentId?: string;
}

// داده‌های نمونه
const MOCK_DATA = {
  turnoverTrend: {
    weekly: [
      { week: ' شنبه', hired: 12, left: 4, netGrowth: 8 },
      { week: ' یکشنبه', hired: 8, left: 3, netGrowth: 5 },
      { week: 'دوشنبه', hired: 15, left: 5, netGrowth: 10 },
      { week: 'سه شنبه', hired: 6, left: 2, netGrowth: 4 },
      { week: 'چهارشنبه', hired: 6, left: 2, netGrowth: 4 },
      { week: ' پنجشنبه', hired: 6, left: 2, netGrowth: 4 },
      { week: 'جمعه', hired: 6, left: 2, netGrowth: 4 },
    ],
    monthly: [
      { month: 'فروردین', hired: 45, left: 12, netGrowth: 33 },
      { month: 'اردیبهشت', hired: 38, left: 15, netGrowth: 23 },
      { month: 'خرداد', hired: 52, left: 18, netGrowth: 34 },
      { month: 'تیر', hired: 30, left: 10, netGrowth: 20 },
      { month: 'مرداد', hired: 48, left: 22, netGrowth: 26 },
      { month: 'شهریور', hired: 55, left: 14, netGrowth: 41 },
    ],
    halfYear: [
      { period: 'نیمه اول 1403', hired: 268, left: 91, netGrowth: 177 },
      { period: 'نیمه دوم 1403', hired: 312, left: 108, netGrowth: 204 },
    ],
    yearly: [
      { year: '1400', hired: 420, left: 185, netGrowth: 235 },
      { year: '1401', hired: 580, left: 210, netGrowth: 370 },
      { year: '1402', hired: 720, left: 245, netGrowth: 475 },
      { year: '1403', hired: 850, left: 290, netGrowth: 560 },
    ],
  },
  retentionRate: {
    current: 87.5,
    previous: 84.2,
    change: +3.3,
  },
  departmentDistribution: [
    { name: 'فنی و مهندسی', value: 42, color: '#3b82f6' },
    { name: 'بازاریابی و فروش', value: 28, color: '#10b981' },
    { name: 'منابع انسانی', value: 8, color: '#f59e0b' },
    { name: 'مالی و اداری', value: 12, color: '#ef4444' },
    { name: 'پشتیبانی', value: 10, color: '#8b5cf6' },
  ],
};

// هوک تشخیص دسکتاپ
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
// کامپوننت اصلی
// ============================================
function AnalyticsCharts({ userRole }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'halfYear' | 'year'>('month');
  const [chartData, setChartData] = useState(MOCK_DATA.turnoverTrend.monthly);
  const retentionData = MOCK_DATA.retentionRate;
  const distributionData = MOCK_DATA.departmentDistribution;
  
  const isDesktop = useIsDesktop();
  const isAdminOrHR = userRole === 'admin' || userRole === 'hr_manager';

  // فقط در دسکتاپ و برای نقش‌های مجاز نمایش بده
  if (!isDesktop || !isAdminOrHR) {
    return null;
  }

  // تغییر بازه زمانی
  const handleTimeRangeChange = (range: 'week' | 'month' | 'halfYear' | 'year') => {
    setTimeRange(range);
    switch (range) {
      case 'week':
        setChartData(MOCK_DATA.turnoverTrend.weekly);
        break;
      case 'month':
        setChartData(MOCK_DATA.turnoverTrend.monthly);
        break;
      case 'halfYear':
        setChartData(MOCK_DATA.turnoverTrend.halfYear);
        break;
      case 'year':
        setChartData(MOCK_DATA.turnoverTrend.yearly);
        break;
    }
  };

  // داده‌های رگرسیون
  const regressionData = chartData.map((item) => ({
    name: timeRange === 'week' ? item.week 
          : timeRange === 'month' ? item.month 
          : timeRange === 'halfYear' ? item.period 
          : item.year,
    استخدام: item.hired,
    خروج: item.left,
  }));

  return (
    <Card className="border-0 shadow-xl overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800">
      {/* هدر با دکمه‌های انتخاب بازه */}
      <div className="px-6 py-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">تحلیل نیروی انسانی</h3>
          
          <div className="flex gap-1">
            {['week', 'month', 'halfYear', 'year'].map((range) => {
              const labels = { week: 'هفته', month: 'ماه', halfYear: '۶ ماه', year: 'سال' };
              return (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange(range as any)}
                  className="text-xs px-3 py-1 h-8"
                >
                  {labels[range as keyof typeof labels]}
                </Button>
              );
            })}
          </div>
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
              <LineChart data={regressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="name" tickFormatter={(v) => toPersianDigits(v)} fontSize={11} />
                <YAxis tickFormatter={(v) => toPersianDigits(v)} fontSize={11} width={35} />
                <Tooltip
                  formatter={(value, name) => [toPersianDigits(value), name === 'استخدام' ? 'جذب' : 'خروج']}
                  contentStyle={{ borderRadius: '8px', fontFamily: 'Vazirmatn', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="استخدام" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="خروج" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mt-2 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>مجموع جذب: {toPersianDigits(chartData.reduce((s, d) => s + d.hired, 0))} نفر</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>مجموع خروج: {toPersianDigits(chartData.reduce((s, d) => s + d.left, 0))} نفر</span>
            </div>
          </div>
        </div>

        {/* نرخ ماندگاری + توزیع پرسنل - کنار هم */}
        <div className="grid grid-cols-2 divide-x divide-gray-100">
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
                    strokeDasharray={`${(retentionData.current / 100) * 251.32} 251.32`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {toPersianDigits(Math.round(retentionData.current))}%
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">ماه جاری:</span>
                  <span className="font-medium">{toPersianDigits(retentionData.current)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">ماه قبل:</span>
                  <span className="font-medium">{toPersianDigits(retentionData.previous)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">تغییرات:</span>
                  <div className={`flex items-center gap-1 ${retentionData.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {retentionData.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="font-medium">{toPersianDigits(Math.abs(retentionData.change))}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${retentionData.current}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                />
              </div>
            </div>
          </div>

          {/* توزیع پرسنل - بدون درصد */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">توزیع پرسنل بر اساس واحد</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28 h-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%" cy="50%"
                      innerRadius={25} outerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${toPersianDigits(value)} نفر`, 'تعداد']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-1.5">
                {distributionData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{item.name}</span>
                    <span className="font-medium">{toPersianDigits(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default React.memo(AnalyticsCharts);