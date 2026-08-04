// src/modules/dashboard/components/process-status-grid.tsx

'use client';
import * as jalaali from 'jalaali-js';
import { useQuery } from '@tanstack/react-query';
import {
  UserPlus, Rocket, TrendingUp, GraduationCap, Clock, DollarSign, LogOut,
  FileText, Calendar, ClipboardList, BookOpen, Package,
  Target, AlertTriangle, Award, HelpCircle, Users, CheckCircle,
  Clock as ClockIcon, XCircle, CreditCard, Shield, FileSpreadsheet,
  Calculator, ArrowLeft, Loader2
} from 'lucide-react';
import { toPersianDigits } from '@/core/lib/utils-fa';

// ============================================
// Types
// ============================================

interface Metric {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

interface ProcessCardProps {
  name: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  metrics: Metric[];
  isLoading?: boolean;
}

// ============================================
// API Functions
// ============================================
// ============================================
// 1️⃣ دریافت آمار جذب و استخدام - نهایی
// ============================================
const fetchRecruitmentStats = async () => {
  try {
    // ۱. دریافت درخواست‌ها (برای نرخ تبدیل و رزومه‌های جدید)
    const applicationsRes = await fetch('/api/job-applications');
    const applicationsData = await applicationsRes.json();
    const allApplications = applicationsData.data || applicationsData || [];

    // ۲. دریافت مصاحبه‌ها (برای مصاحبه امروز)
    const interviewsRes = await fetch('/api/interviews?status=scheduled');
    const interviewsData = await interviewsRes.json();
    const allInterviews = interviewsData.data || interviewsData || [];

    // ✅ ۱. رزومه‌های جدید: درخواست‌هایی با currentStage = 'applied'
    const newResumes = allApplications.filter((app: any) => {
      return app.currentStage === 'applied';
    }).length;

    // ✅ ۲. مصاحبه‌های امروز
    const today = new Date().toISOString().split('T')[0];
    const interviewsToday = allInterviews.filter((i: any) => {
      if (!i.scheduledAt) return false;
      const scheduledAt = new Date(i.scheduledAt).toISOString().split('T')[0];
      return scheduledAt === today && i.status === 'scheduled';
    }).length;

    // ✅ ۳. نرخ تبدیل: (تعداد درخواست‌های استخدام‌شده / کل درخواست‌ها) * ۱۰۰
    // دقیقاً مثل کاری که در recruitment.tsx انجام شده
    const hiredApplications = allApplications.filter((a: any) => a.status === 'hired').length;
    const totalApplications = allApplications.length;
    const conversionRate = totalApplications > 0 
      ? Math.round((hiredApplications / totalApplications) * 100) 
      : 0;

    // ✅ ۴. تعداد کاندیداهای در حال مصاحبه
    const interviewingCandidates = allApplications.filter((app: any) => {
      return app.currentStage === 'interview' || app.currentStage === 'interviewing';
    }).length;

    return {
      newResumes,
      interviewsToday,
      conversionRate: `${conversionRate}%`,
      interviewingCandidates,
      totalApplications,
      hiredApplications,
    };
  } catch (error) {
    console.error('Error fetching recruitment stats:', error);
    return {
      newResumes: 0,
      interviewsToday: 0,
      conversionRate: '0%',
      interviewingCandidates: 0,
      totalApplications: 0,
      hiredApplications: 0,
    };
  }
};

// 2️⃣ دریافت آمار آنبوردینگ
const fetchOnboardingStats = async () => {
  try {
    const res = await fetch('/api/onboarding?status=in_progress');
    const data = await res.json();
    const onboardings = data.data || data || [];

    const incompleteChecklist = onboardings.filter((o: any) => o.progress < 100).length;
    const incompleteTraining = onboardings.filter((o: any) => {
      const tasks = o.tasks ? JSON.parse(o.tasks) : [];
      return tasks.some((t: any) => t.status !== 'completed');
    }).length;
    const pendingEquipment = onboardings.filter((o: any) => {
      const tasks = o.tasks ? JSON.parse(o.tasks) : [];
      return tasks.some((t: any) => t.category === 'equipment' && t.status !== 'completed');
    }).length;

    return {
      incompleteChecklist: incompleteChecklist || 0,
      incompleteTraining: incompleteTraining || 0,
      pendingEquipment: pendingEquipment || 0,
    };
  } catch (error) {
    console.error('Error fetching onboarding stats:', error);
    return { incompleteChecklist: 0, incompleteTraining: 0, pendingEquipment: 0 };
  }
};

// 3️⃣ دریافت آمار عملکرد
const fetchPerformanceStats = async () => {
  try {
    const res = await fetch('/api/performance');
    const data = await res.json();
    const performances = data.data || data || [];


    if (performances.length === 0) {
      return { unmetKpi: 0, riskOfExit: 0, highPerformers: 0 };
    }

    // ============================================
    // ❌ فقط ارزیابی‌های تکمیل‌شده یا بررسی‌شده را در نظر بگیر
    // ============================================
    const validStatuses = ['completed', 'reviewed'];
    const validItems = performances
      .filter((p: any) => validStatuses.includes(p.status))
      .filter((p: any) => {
        // فقط مواردی که نمره و هدف معتبر دارند
        const hasValidScore = p.score !== null && p.score !== undefined && p.score > 0;
        const hasValidTarget = p.target !== null && p.target !== undefined && p.target > 0;
        return hasValidScore && hasValidTarget;
      });


    if (validItems.length === 0) {
      console.log('⚠️ هیچ ارزیابی معتبری برای تحلیل وجود ندارد!');
      return { unmetKpi: 0, riskOfExit: 0, highPerformers: 0 };
    }

    // ============================================
    // 📊 تحلیل هر آیتم
    // ============================================
 

    let riskOfExit = 0;
    let highPerformers = 0;
    let unmetKpi = 0;

    validItems.forEach((p: any) => {
      const score = p.score;
      const target = p.target;
      const ratio = score / target;


      // ============================================
      // 🎯 دسته‌بندی
      // ============================================
      
      // شرط High Performer: نمره >= 4.5 یا نسبت >= 1.2
      if (score >= 4.5 || ratio >= 1.2) {
        highPerformers++;
      
      }
      // شرط ریسک خروج: نمره < 2 یا نسبت < 0.5
      else if (score < 2 || ratio < 0.5) {
        riskOfExit++;
       
      }
      // شرط KPI محقق نشده: نمره < هدف
      else if (score < target) {
        unmetKpi++;
      
      } else {
        console.log(`  ✅ موفق (${score} >= ${target})`);
      }
    });

   

    return {
      unmetKpi: unmetKpi || 0,
      riskOfExit: riskOfExit || 0,
      highPerformers: highPerformers || 0,
    };
  } catch (error) {
    console.error('❌ Error fetching performance stats:', error);
    return { unmetKpi: 0, riskOfExit: 0, highPerformers: 0 };
  }
};

// 4️⃣ دریافت آمار آموزش
const fetchTrainingStats = async () => {
  try {
    const res = await fetch('/api/training');
    const data = await res.json();
    const trainings = data.data || data || [];


    // ============================================
    // 1️⃣ آزمون معوق
    // ============================================
    const now = new Date();
    
    const overdueTests = trainings.filter((t: any) => {
      const endDate = new Date(t.endDate);
      return t.status === 'in_progress' && endDate < now;
    }).length;


    // ============================================
    // 2️⃣ نرخ مشارکت (فقط دوره‌های تکمیل‌شده)
    // ============================================
    
    // ✅ فقط دوره‌هایی که وضعیت completed دارند
    const completedTrainings = trainings.filter((t: any) => t.status === 'completed');
    
    const totalParticipants = completedTrainings.reduce((sum: number, t: any) => {
      return sum + (t.participants?.length || 0);
    }, 0);

    const completedParticipants = completedTrainings.reduce((sum: number, t: any) => {
      return sum + (t.participants?.filter((p: any) => p.status === 'completed').length || 0);
    }, 0);

    const participationRate = totalParticipants > 0 
      ? Math.round((completedParticipants / totalParticipants) * 100) 
      : 0;

    return {
      overdueTests: overdueTests || 0,
      participationRate: `${participationRate}%`,
    };
  } catch (error) {
    console.error('Error fetching training stats:', error);
    return { overdueTests: 0, participationRate: '0%' };
  }
};
// 5️⃣ دریافت آمار حضور و غیاب
const fetchAttendanceStats = async () => {
  try {
    // ✅ از همان API داشبورد استفاده می‌کنیم
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    
    if (!data || !data.stats) {
      return { lateToday: 0, absentToday: 0, leavesToday: 0 };
    }

    const stats = data.stats;


    return {
      lateToday: stats.lateToday || 0,
      absentToday: stats.absentToday || 0,
      leavesToday: stats.leaveToday || 0,
    };
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return { lateToday: 0, absentToday: 0, leavesToday: 0 };
  }
};

// 6️⃣ دریافت آمار حقوق و دستمزد
const fetchPayrollStats = async () => {
  try {
    // 📅 تبدیل تاریخ امروز به شمسی
    const now = new Date();
    const { jy, jm } = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const currentYear = jy;
    const currentMonth = jm;

    // 📊 دریافت فیش‌های حقوقی ماه جاری (با سال و ماه شمسی)
    const res = await fetch(`/api/payroll?year=${currentYear}&month=${currentMonth}`);
    const data = await res.json();
    const payslips = data.payslips || [];

    // ✅ فقط پرداخت نشده‌های این ماه (draft یا confirmed)
    const pendingPayments = payslips.filter((p: any) => 
      p.status === 'draft' || p.status === 'confirmed'
    ).length;

    return {
      pendingPayments: pendingPayments || 0,
    };
  } catch (error) {
    console.error('Error fetching payroll stats:', error);
    return { pendingPayments: 0 };
  }
};

// 7️⃣ دریافت آمار آفبوردینگ
const fetchOffboardingStats = async () => {
  try {
    // ✅ دریافت همه آفبوردینگ‌های در حال انجام
    const res = await fetch('/api/offboarding');
    const data = await res.json();
    const offboardings = data.data || data || [];

    // ✅ تسویه ناقص = تعداد آفبوردینگ‌های در حال انجام
    const incompleteSettlement = offboardings.filter((o: any) => 
      o.status === 'in_progress'
    ).length;

    return {
      incompleteSettlement: incompleteSettlement || 0,
    };
  } catch (error) {
    console.error('Error fetching offboarding stats:', error);
    return { incompleteSettlement: 0 };
  }
};

// ============================================
// Process Card Component
// ============================================

function ProcessCard({ data, onNavigate }: { data: ProcessCardProps; onNavigate: (id: string) => void }) {
  if (data.isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex items-center justify-center h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }
  const getNavigatePath = (name: string) => {
    const map: Record<string, string> = {
      'جذب و استخدام': 'recruitment',
      'آنبوردینگ': 'onboarding',
      'عملکرد': 'performance',
      'آموزش': 'training',
      'حضور و غیاب': 'att-today',
      'حقوق و دستمزد': 'payroll',
      'آفبوردینگ': 'offboarding',
    };
    return map[name] || 'dashboard';
  };

  const handleNavigate = () => {
    const path = getNavigatePath(data.name);
    onNavigate(path);  // ← هدایت به صفحه مربوطه
  };
  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className={`px-4 py-3 ${data.bgColor} border-b border-gray-100 dark:border-gray-800 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center gap-2.5 relative z-10">
          <div className={`w-8 h-8 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center ${data.iconColor} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
            {data.icon}
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{data.name}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {data.metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between group/metric">
              <div className="flex items-center gap-2">
                <div className={`${metric.color} transition-colors duration-200`}>
                  {metric.icon}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 group-hover/metric:text-gray-700 dark:group-hover/metric:text-gray-300 transition-colors">
                  {metric.label}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover/metric:scale-105 transition-transform duration-200">
                {typeof metric.value === 'number' ? toPersianDigits(metric.value) : metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 pt-0">
        <button 
        onClick={handleNavigate}
        className="w-full py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 group/btn">
          <ArrowLeft size={12} className="group-hover/btn:-translate-x-1 transition-transform duration-200" />
          <span>مشاهده جزئیات</span>
        </button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function ProcessStatusGrid({ onNavigate }: { onNavigate: (id: string) => void }) {
  // 1️⃣ جذب و استخدام
  const { data: recruitmentStats, isLoading: recruitmentLoading } = useQuery({
    queryKey: ['recruitment-stats'],
    queryFn: fetchRecruitmentStats,
    staleTime: 5 * 60 * 1000,
  });

  // 2️⃣ آنبوردینگ
  const { data: onboardingStats, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding-stats'],
    queryFn: fetchOnboardingStats,
    staleTime: 5 * 60 * 1000,
  });

  // 3️⃣ عملکرد
  const { data: performanceStats, isLoading: performanceLoading } = useQuery({
    queryKey: ['performance-stats'],
    queryFn: fetchPerformanceStats,
    staleTime: 5 * 60 * 1000,
  });

  // 4️⃣ آموزش
  const { data: trainingStats, isLoading: trainingLoading } = useQuery({
    queryKey: ['training-stats'],
    queryFn: fetchTrainingStats,
    staleTime: 5 * 60 * 1000,
  });

  // 5️⃣ حضور و غیاب
  const { data: attendanceStats, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: fetchAttendanceStats,
    staleTime: 5 * 60 * 1000,
  });

  // 6️⃣ حقوق و دستمزد
  const { data: payrollStats, isLoading: payrollLoading } = useQuery({
    queryKey: ['payroll-stats'],
    queryFn: fetchPayrollStats,
    staleTime: 5 * 60 * 1000,
  });

  // 7️⃣ آفبوردینگ
  const { data: offboardingStats, isLoading: offboardingLoading } = useQuery({
    queryKey: ['offboarding-stats'],
    queryFn: fetchOffboardingStats,
    staleTime: 5 * 60 * 1000,
  });

  const processCards: ProcessCardProps[] = [
    {
      name: 'جذب و استخدام',
      icon: <UserPlus size={20} />,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      isLoading: recruitmentLoading,
      metrics: [
        { 
          label: 'رزومه جدید', 
          value: recruitmentStats?.newResumes || 0, 
          icon: <FileText size={12} />, 
          color: 'text-blue-600 dark:text-blue-400' 
        },
        { 
          label: 'مصاحبه امروز', 
          value: recruitmentStats?.interviewsToday || 0, 
          icon: <Calendar size={12} />, 
          color: 'text-emerald-600 dark:text-emerald-400' 
        },
        { 
          label: 'نرخ تبدیل', 
          value: recruitmentStats?.conversionRate || '0%', 
          icon: <TrendingUp size={12} />, 
          color: 'text-purple-600 dark:text-purple-400' 
        },
      ]
    },
    {
      name: 'آنبوردینگ',
      icon: <Rocket size={20} />,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      isLoading: onboardingLoading,
      metrics: [
        { 
          label: 'چک‌لیست ناقص', 
          value: onboardingStats?.incompleteChecklist || 0, 
          icon: <ClipboardList size={12} />, 
          color: 'text-red-500 dark:text-red-400' 
        },
      ]
    },
    {
      name: 'عملکرد',
      icon: <TrendingUp size={20} />,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      isLoading: performanceLoading,
      metrics: [
        { 
          label: 'KPI محقق نشده', 
          value: performanceStats?.unmetKpi || 0, 
          icon: <Target size={12} />, 
          color: 'text-red-500 dark:text-red-400' 
        },
        { 
          label: 'در ریسک خروج', 
          value: performanceStats?.riskOfExit || 0, 
          icon: <AlertTriangle size={12} />, 
          color: 'text-amber-600 dark:text-amber-400' 
        },
        { 
          label: 'High Performer', 
          value: performanceStats?.highPerformers || 0, 
          icon: <Award size={12} />, 
          color: 'text-emerald-600 dark:text-emerald-400' 
        },
      ]
    },
    {
      name: 'آموزش',
      icon: <GraduationCap size={20} />,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      isLoading: trainingLoading,
      metrics: [
        { 
          label: 'آزمون معوق', 
          value: trainingStats?.overdueTests || 0, 
          icon: <HelpCircle size={12} />, 
          color: 'text-red-500 dark:text-red-400' 
        },
        { 
          label: 'نرخ مشارکت', 
          value: trainingStats?.participationRate || '0%', 
          icon: <Users size={12} />, 
          color: 'text-emerald-600 dark:text-emerald-400' 
        },
      ]
    },
    {
      name: 'حضور و غیاب',
      icon: <Clock size={20} />,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
      isLoading: attendanceLoading,
      metrics: [
        { 
          label: 'تاخیر امروز', 
          value: attendanceStats?.lateToday || 0, 
          icon: <ClockIcon size={12} />, 
          color: 'text-amber-600 dark:text-amber-400' 
        },
        { 
          label: 'غیبت امروز', 
          value: attendanceStats?.absentToday || 0, 
          icon: <XCircle size={12} />, 
          color: 'text-red-500 dark:text-red-400' 
        },
        { 
          label: 'مرخصی امروز',  
          value: attendanceStats?.leavesToday || 0, 
          icon: <Calendar size={12} />, 
          color: 'text-blue-600 dark:text-blue-400' 
        },
      ]
    },
    {
      name: 'حقوق و دستمزد',
      icon: <DollarSign size={20} />,
      iconColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      isLoading: payrollLoading,
      metrics: [
        { 
          label: 'پرداخت نشده این ماه', 
          value: payrollStats?.pendingPayments || 0, 
          icon: <CreditCard size={12} />, 
          color: 'text-amber-600 dark:text-amber-400' 
        },
      ]
    },
    {
      name: 'آفبوردینگ',
      icon: <LogOut size={20} />,
      iconColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      isLoading: offboardingLoading,
      metrics: [
        { 
          label: 'تسویه ناقص', 
          value: offboardingStats?.incompleteSettlement || 0, 
          icon: <Calculator size={12} />, 
          color: 'text-red-500 dark:text-red-400' 
        },
      ]
    },
  ];

  return (
    <div className="w-full" dir="rtl">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">وضعیت فرآیندهای منابع انسانی</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">خلاصه وضعیت فرآیندهای جاری سازمان</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {processCards.map((card, index) => (
          <ProcessCard key={index} data={card} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}