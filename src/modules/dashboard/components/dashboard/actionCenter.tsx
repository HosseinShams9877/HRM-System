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
  TrendingUp, Zap, Filter, ChevronLeft,Loader2  
} from 'lucide-react';
import { toPersianDigits } from '@/core/lib/utils-fa';
import { UserRole } from "@/core/lib/auth"

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
  onNavigate?: (id: string) => void;
}

const fetchPendingRequests = async (userRole: UserRole, userId?: string): Promise<{ leaves: any[], missions: any[] }> => {
  if (userRole === 'employee') return { leaves: [], missions: [] };
  
  try {
    const leavesRes = await fetch(`/api/leaves?status=pending&limit=10`)
    const leavesData = await leavesRes.json()
    const leaves = leavesData.data || leavesData.records || []
    const pendingLeaves = Array.isArray(leaves) ? leaves.filter((l: any) => l.status === 'pending') : []
    
    const missionsRes = await fetch(`/api/missions?status=pending&limit=10`)
    const missionsData = await missionsRes.json()
    const missions = missionsData.data || missionsData.records || []
    const pendingMissions = Array.isArray(missions) ? missions.filter((m: any) => m.status === 'pending') : []
    
    return { leaves: pendingLeaves, missions: pendingMissions }
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    return { leaves: [], missions: [] }
  }
}

// داده‌های دمو (در پروژه واقعی از API میاد)
// داده‌های دمو برای ادمین و مدیر
const ADMIN_ACTIONS: ActionItem[] = [
  { id: 'onboarding', title: 'تأیید انبوردینگ', count: 3, icon: UserPlus, priority: 'urgent', action: () => console.log('onboarding') },
  { id: 'leave', title: 'تأیید مرخصی', count: 5, icon: CalendarCheck, priority: 'urgent', action: () => console.log('leave') },
  { id: 'overtime', title: 'تأیید اضافه‌کاری', count: 2, icon: Clock, priority: 'today', action: () => console.log('overtime') },
  { id: 'training', title: 'پایان دوره آموزشی', count: 8, icon: GraduationCap, priority: 'today', action: () => console.log('training') },
  { id: 'evaluation', title: 'ارزیابی عملکرد معوق', count: 12, icon: ClipboardList, priority: 'urgent', action: () => console.log('evaluation') },
  { id: 'documents', title: 'مدارک ناقص کارکنان', count: 7, icon: FileText, priority: 'week', action: () => console.log('documents') },
  { id: 'salary', title: 'تأیید افزایش حقوق', count: 4, icon: TrendingUp, priority: 'week', action: () => console.log('salary') },
  { id: 'mission', title: 'تأیید ماموریت', count: 3, icon: Briefcase, priority: 'today', action: () => console.log('mission') },
  { id: 'hiring', title: 'درخواست استخدام', count: 6, icon: Users, priority: 'urgent', action: () => console.log('hiring') },
];

const MANAGER_ACTIONS: ActionItem[] = [
  { id: 'leave', title: 'تأیید مرخصی', count: 3, icon: CalendarCheck, priority: 'urgent', action: () => console.log('leave') },
  { id: 'overtime', title: 'تأیید اضافه‌کاری', count: 2, icon: Clock, priority: 'today', action: () => console.log('overtime') },
  { id: 'mission', title: 'تأیید ماموریت', count: 1, icon: Briefcase, priority: 'today', action: () => console.log('mission') },
  { id: 'evaluation', title: 'ارزیابی تیم', count: 8, icon: ClipboardList, priority: 'urgent', action: () => console.log('evaluation') },
];

// ✅ داده‌های کارمند - باید از API بیاید (اینجا نمونه)
const getEmployeeActions = (employeeId: string): ActionItem[] => {
  // در پروژه واقعی، این داده‌ها از API می‌آیند
  return [
    { id: 'leave', title: 'درخواست مرخصی', count: 1, icon: CalendarCheck, priority: 'normal', action: () => console.log('leave'), userId: employeeId },
    { id: 'overtime', title: 'درخواست اضافه‌کاری', count: 1, icon: Clock, priority: 'normal', action: () => console.log('overtime'), userId: employeeId },
    { id: 'mission', title: 'درخواست ماموریت', count: 0, icon: Briefcase, priority: 'normal', action: () => console.log('mission'), userId: employeeId },
    { id: 'payslip', title: 'مشاهده فیش حقوقی', count: 1, icon: FileText, priority: 'normal', action: () => console.log('payslip'), userId: employeeId },
  ];
};

// فیلترها
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
export function ActionCenter({ userRole,userId , onNavigate }: ActionCenterProps & { userId?: string }) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [pendingData, setPendingData] = useState<{ leaves: any[], missions: any[] }>({ leaves: [], missions: [] })
  const [loadingActions, setLoadingActions] = useState(true)

  useEffect(() => {
    const loadPendingRequests = async () => {
      setLoadingActions(true)
      const data = await fetchPendingRequests(userRole, userId)
      setPendingData({ leaves: data.leaves || [], missions: data.missions || [] })
      setLoadingActions(false)
    }
    loadPendingRequests()
  }, [userRole, userId])
  
  // در actionCenter.tsx
  const actions = useMemo(() => {
    if (userRole === 'employee' && userId) {
      return getEmployeeActions(userId);
    }
    
    // برای مدیر و ادمین، از داده‌های API استفاده کن
    const actionsList: ActionItem[] = [];
    
    // اضافه کردن مرخصی‌های در انتظار
    if (pendingData.leaves.length > 0) {
      actionsList.push({
        id: 'leave',
        title: 'تأیید مرخصی',
        count: pendingData.leaves.length,
        icon: CalendarCheck,
        priority: 'urgent',
        action: () => onNavigate?.('att-leave')
      });
    }
    
    // اضافه کردن ماموریت‌های در انتظار
    if (pendingData.missions.length > 0) {
      actionsList.push({
        id: 'mission',
        title: 'تأیید ماموریت',
        count: pendingData.missions.length,
        icon: Briefcase,
        priority: 'today',
        action: () => onNavigate?.('att-mission')
      });
    }
    
    // اضافه کردن اقدامات پیش‌فرض برای مدیر (اگر داده واقعی نبود)
    if (actionsList.length === 0 && userRole !== 'admin') {
      return MANAGER_ACTIONS;
    }
    if (actionsList.length === 0 && userRole === 'admin') {
      return ADMIN_ACTIONS;
    }
    
    return actionsList;
  }, [userRole, userId, pendingData, onNavigate]);

  // فیلتر کردن تسک‌ها
  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    return action.priority === filter;
  });

  // آمار برای هر فیلتر
  const stats = {
    all: actions.length,
    urgent: actions.filter(a => a.priority === 'urgent').length,
    today: actions.filter(a => a.priority === 'today').length,
    week: actions.filter(a => a.priority === 'week').length,
    normal: actions.filter(a => a.priority === 'normal').length,
  };

  // دکمه‌های فیلتر
  const filters: FilterType[] = ['all', 'urgent', 'today', 'week', 'normal'];

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
        {filteredActions.length === 0 ? (
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
              
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  onClick={action.action}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${priorityColors[action.priority]} hover:shadow-md`}
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