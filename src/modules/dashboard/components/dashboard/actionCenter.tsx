// app/components/dashboard/actionCenter.tsx

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { motion } from 'framer-motion';
import {
  UserPlus, UserMinus, CalendarCheck, FileText, Clock,
  ClipboardList, AlertCircle, CheckCircle, Eye, Send,
  Briefcase, GraduationCap, Users, Award, Gift,
  TrendingUp, Zap, Filter, ChevronLeft, Loader2
} from 'lucide-react';
import { toPersianDigits } from '@/core/lib/utils-fa';
import { UserRole } from "@/core/lib/auth";

// ============================================
// Types
// ============================================

interface ActionItem {
  id: string;
  title: string;
  count: number;
  icon: React.ElementType;
  priority: 'urgent' | 'today' | 'week' | 'normal';
  userId?: string;
  action: () => void;
}

interface ActionCenterProps {
  userRole: UserRole;
  userId?: string;
  onNavigate?: (id: string) => void;
}

// ============================================
// داده‌های Mock برای کارمند
// ============================================

const EMPLOYEE_ACTIONS: ActionItem[] = [
  { id: 'leave', title: 'درخواست مرخصی', count: 1, icon: CalendarCheck, priority: 'normal', action: () => console.log('leave') },
  { id: 'overtime', title: 'درخواست اضافه‌کاری', count: 1, icon: Clock, priority: 'normal', action: () => console.log('overtime') },
  { id: 'mission', title: 'درخواست ماموریت', count: 0, icon: Briefcase, priority: 'normal', action: () => console.log('mission') },
  { id: 'payslip', title: 'مشاهده فیش حقوقی', count: 1, icon: FileText, priority: 'normal', action: () => console.log('payslip') },
];

// ============================================
// فیلترها
// ============================================

type FilterType = 'all' | 'urgent' | 'today' | 'week' | 'normal';

const filterLabels: Record<FilterType, string> = {
  all: 'همه',
  urgent: 'فوری',
  today: 'امروز',
  week: 'این هفته',
  normal: 'معمولی',
};

// ============================================
// کامپوننت اصلی
// ============================================

export function ActionCenter({ userRole, userId, onNavigate }: ActionCenterProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [pendingData, setPendingData] = useState({
    leaves: [],
    missions: [],
    overtime: [],
    onboarding: [],
    performance: [],
    orders: [],
    interviews: [],
  });

  // ============================================
  // دریافت داده‌های واقعی برای مدیر و ادمین
  // ============================================

  useEffect(() => {
    const fetchAllPendingRequests = async () => {
      // اگر کارمند هست، نیازی به fetch نیست
      if (userRole === 'employee') {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const [
          leavesRes,
          missionsRes,
          overtimeRes,
          onboardingRes,
          performanceRes,
          ordersRes,
          interviewsRes, 
        ] = await Promise.all([
          fetch('/api/leaves?status=pending'),
          fetch('/api/missions?status=pending'),
          fetch('/api/overtime?status=pending'),
          fetch('/api/onboarding?status=in_progress'),
          fetch('/api/performance?status=pending'),
          fetch('/api/orders?status=pending'),
          fetch('/api/interviews?status=scheduled'),
        ]);

        const [
          leavesData,
          missionsData,
          overtimeData,
          onboardingData,
          performanceData,
          ordersData,
          interviewsData,
        ] = await Promise.all([
          leavesRes.ok ? leavesRes.json() : { data: [] },
          missionsRes.ok ? missionsRes.json() : { data: [] },
          overtimeRes.ok ? overtimeRes.json() : { data: [] },
          onboardingRes.ok ? onboardingRes.json() : { data: [] },
          performanceRes.ok ? performanceRes.json() : { data: [] },
          ordersRes.ok ? ordersRes.json() : { data: [] },
          interviewsRes.ok ? interviewsRes.json() : { data: [] },
        ]);

        const allInterviews = interviewsData.data || interviewsData || [];
        const uniqueCandidates = new Map();
        
        allInterviews.forEach((interview: any) => {
          if (interview.candidateId && !uniqueCandidates.has(interview.candidateId)) {
            uniqueCandidates.set(interview.candidateId, {
              id: interview.candidateId,
              name: interview.candidate ? `${interview.candidate.firstName} ${interview.candidate.lastName}` : 'نامشخص',
              email: interview.candidate?.email || '',
              jobTitle: interview.job?.title || '',
            });
          }
        });

        const interviewingCandidates = Array.from(uniqueCandidates.values());

        setPendingData({
          leaves: leavesData.data || leavesData || [],
          missions: missionsData.data || missionsData || [],
          overtime: overtimeData.data || overtimeData || [],
          onboarding: onboardingData.data || onboardingData || [],
          performance: performanceData.data || performanceData || [],
          orders: ordersData.data || ordersData || [],
          interviews: interviewingCandidates,
        });
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPendingRequests();
  }, [userRole]);

  // ============================================
  // ساخت لیست اقدامات بر اساس نقش
  // ============================================

  const actions = useMemo(() => {
    // ✅ برای کارمند: از داده‌های Mock استفاده کن
    if (userRole === 'employee') {
      return EMPLOYEE_ACTIONS;
    }

    const actionsList: ActionItem[] = [];

    // 1️⃣ مرخصی‌های در انتظار
    if (pendingData.leaves.length > 0) {
      actionsList.push({
        id: 'leave',
        title: 'تأیید مرخصی',
        count: pendingData.leaves.length,
        icon: CalendarCheck,
        priority: 'urgent',
        action: () => onNavigate?.('att-leave'),
      });
    }

    // 2️⃣ ماموریت‌های در انتظار
    if (pendingData.missions.length > 0) {
      actionsList.push({
        id: 'mission',
        title: 'تأیید ماموریت',
        count: pendingData.missions.length,
        icon: Briefcase,
        priority: 'today',
        action: () => onNavigate?.('att-mission'),
      });
    }

    // 3️⃣ اضافه‌کاری‌های در انتظار
    if (pendingData.overtime.length > 0) {
      actionsList.push({
        id: 'overtime',
        title: 'تأیید اضافه‌کاری',
        count: pendingData.overtime.length,
        icon: Clock,
        priority: 'today',
        action: () => onNavigate?.('att-overtime'),
      });
    }

    // 4️⃣ انبوردینگ‌های ناقص (فقط برای ادمین)
    if (userRole === 'admin' && pendingData.onboarding.length > 0) {
      actionsList.push({
        id: 'onboarding',
        title: 'تکمیل انبوردینگ',
        count: pendingData.onboarding.length,
        icon: UserPlus,
        priority: 'urgent',
        action: () => onNavigate?.('onboarding'),
      });
    }

    // 5️⃣ ارزیابی‌های در انتظار
    if (pendingData.performance.length > 0) {
      actionsList.push({
        id: 'performance',
        title: 'تکمیل ارزیابی',
        count: pendingData.performance.length,
        icon: ClipboardList,
        priority: 'urgent',
        action: () => onNavigate?.('performance'),
      });
    }

    // 6️⃣ احکام در انتظار (فقط برای ادمین)
    if (userRole === 'admin' && pendingData.orders.length > 0) {
      actionsList.push({
        id: 'orders',
        title: 'تأیید حکم',
        count: pendingData.orders.length,
        icon: FileText,
        priority: 'week',
        action: () => onNavigate?.('orders'),
      });
    }

    // 7️⃣ درخواست‌های استخدام (فقط برای ادمین)
    if (userRole === 'admin' && pendingData.interviews.length > 0) {
      actionsList.push({
        id: 'hiring',
        title: 'درخواست استخدام',
        count: pendingData.interviews.length,
        icon: Users,
        priority: 'urgent',
        action: () => onNavigate?.('recruitment-jobs'),
      });
    }

    // ✅ اگر هیچ داده‌ای نبود، یک پیام نمایش بده
    if (actionsList.length === 0) {
      actionsList.push({
        id: 'empty',
        title: 'هیچ اقدامی برای تایید وجود ندارد',
        count: 0,
        icon: CheckCircle,
        priority: 'normal',
        action: () => {},
      });
    }

    return actionsList;
  }, [userRole, pendingData, onNavigate]);

  // ============================================
  // فیلتر کردن تسک‌ها
  // ============================================

  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    return action.priority === filter;
  });

  // ============================================
  // آمار برای هر فیلتر
  // ============================================

  const stats = {
    all: actions.length,
    urgent: actions.filter(a => a.priority === 'urgent').length,
    today: actions.filter(a => a.priority === 'today').length,
    week: actions.filter(a => a.priority === 'week').length,
    normal: actions.filter(a => a.priority === 'normal').length,
  };

  const filters: FilterType[] = ['all', 'urgent', 'today', 'week', 'normal'];

  // ============================================
  // نمایش لودینگ
  // ============================================

  if (loading && userRole !== 'employee') {
    return (
      <Card className="border-0 shadow-xl overflow-hidden h-full flex flex-col dark:bg-gray-900">
        <CardContent className="flex-1 flex items-center justify-center flex-col gap-4 p-8">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-gray-500 text-sm">در حال بارگذاری اقدامات...</p>
        </CardContent>
      </Card>
    );
  }

  // ============================================
  // رندر اصلی
  // ============================================

  return (
    <Card className="border-0 shadow-xl overflow-hidden h-full flex flex-col dark:bg-gray-900">
      {/* هدر با فیلترها */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b dark:from-gray-800 dark:to-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">مرکز اقدامات شما</h3>
        </div>

        {/* فیلترها */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-white shadow-md dark:bg-emerald-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {filterLabels[f]}
              {stats[f] > 0 && (
                <span className={`mr-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === f ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {toPersianDigits(stats[f])}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* لیست تسک‌ها */}
      <CardContent className="p-4 flex-1 overflow-y-auto dark:bg-gray-900">
        {filteredActions.length === 0 || (filteredActions.length === 1 && filteredActions[0].id === 'empty') ? (
          <div className="text-center py-8">
            <CheckCircle className="w-10 h-10 text-green-300 dark:text-green-700 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">هیچ اقدامی در این دسته وجود ندارد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const priorityColors = {
                urgent: 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400',
                today: 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400',
                week: 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400',
                normal: 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
              };

              // اگر action.id === 'empty' باشه، نباید کلیک‌پذیر باشه
              const isClickable = action.id !== 'empty';

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={isClickable ? { scale: 1.02, y: -2 } : {}}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  onClick={isClickable ? action.action : undefined}
                  className={`p-3 rounded-xl border transition-all ${
                    isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                  } ${priorityColors[action.priority]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/60 dark:bg-gray-800 shadow-sm">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium line-clamp-1 dark:text-gray-200">{action.title}</span>
                    </div>
                    {action.count > 0 && (
                      <span className="text-xs font-bold bg-white/60 dark:bg-gray-800 px-2 py-0.5 rounded-full dark:text-gray-300">
                        {toPersianDigits(action.count)}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* دکمه تمام عرض - مشاهده همه اقدامات */}
      <div className="p-4 pt-0 border-t mt-auto dark:border-gray-800">
        <Button
          variant="outline"
          className="w-full py-2.5 text-sm gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-600"
          onClick={() => onNavigate?.('all-actions')}
        >
          <Eye className="w-4 h-4" />
          مشاهده همه اقدامات
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}

export default ActionCenter;