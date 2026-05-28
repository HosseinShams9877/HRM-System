'use client'

import {
  UserPlus, Rocket, TrendingUp, GraduationCap, Clock, DollarSign, LogOut,
  FileText, Calendar, ClipboardList, BookOpen, Package,
  Target, AlertTriangle, Award, HelpCircle, Users, CheckCircle,
  Clock as ClockIcon, XCircle, CreditCard, Shield, FileSpreadsheet,
  Calculator, ArrowLeft
} from 'lucide-react'

interface Metric {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}

interface ProcessCardProps {
  name: string
  icon: React.ReactNode
  iconColor: string
  metrics: Metric[]
  bgColor: string
}

const processCards: ProcessCardProps[] = [
  {
    name: 'جذب و استخدام',
    icon: <UserPlus size={20} />,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    metrics: [
      { label: 'رزومه جدید', value: 18, icon: <FileText size={12} />, color: 'text-blue-600 dark:text-blue-400' },
      { label: 'مصاحبه امروز', value: 4, icon: <Calendar size={12} />, color: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'نرخ تبدیل', value: '24%', icon: <TrendingUp size={12} />, color: 'text-purple-600 dark:text-purple-400' },
    ]
  },
  {
    name: 'آنبوردینگ',
    icon: <Rocket size={20} />,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    metrics: [
      { label: 'چک‌لیست ناقص', value: 8, icon: <ClipboardList size={12} />, color: 'text-red-500 dark:text-red-400' },
      { label: 'آموزش ناقص', value: 2, icon: <BookOpen size={12} />, color: 'text-orange-500 dark:text-orange-400' },
      { label: 'تحویل تجهیزات', value: 5, icon: <Package size={12} />, color: 'text-amber-600 dark:text-amber-400' },
    ]
  },
  {
    name: 'عملکرد',
    icon: <TrendingUp size={20} />,
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    metrics: [
      { label: 'KPI محقق نشده', value: 12, icon: <Target size={12} />, color: 'text-red-500 dark:text-red-400' },
      { label: 'در ریسک خروج', value: 3, icon: <AlertTriangle size={12} />, color: 'text-amber-600 dark:text-amber-400' },
      { label: 'High Performer', value: 8, icon: <Award size={12} />, color: 'text-emerald-600 dark:text-emerald-400' },
    ]
  },
  {
    name: 'آموزش',
    icon: <GraduationCap size={20} />,
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    metrics: [
      { label: 'آزمون معوق', value: 15, icon: <HelpCircle size={12} />, color: 'text-red-500 dark:text-red-400' },
      { label: 'نرخ مشارکت', value: '68%', icon: <Users size={12} />, color: 'text-emerald-600 dark:text-emerald-400' },
    ]
  },
  {
    name: 'حضور و غیاب',
    icon: <Clock size={20} />,
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    metrics: [
      { label: 'تاخیر امروز', value: 7, icon: <ClockIcon size={12} />, color: 'text-amber-600 dark:text-amber-400' },
      { label: 'غیبت غیرمجاز', value: 2, icon: <XCircle size={12} />, color: 'text-red-500 dark:text-red-400' },
      { label: 'اضافه‌کاری تأیید نشده', value: 12, icon: <CheckCircle size={12} />, color: 'text-orange-500 dark:text-orange-400' },
    ]
  },
  {
    name: 'حقوق و دستمزد',
    icon: <DollarSign size={20} />,
    iconColor: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    metrics: [
      { label: 'پرداخت در انتظار', value: 23, icon: <CreditCard size={12} />, color: 'text-amber-600 dark:text-amber-400' },
      { label: 'مغایرت بیمه', value: 5, icon: <Shield size={12} />, color: 'text-red-500 dark:text-red-400' },
      { label: 'مغایرت مالیاتی', value: 3, icon: <FileSpreadsheet size={12} />, color: 'text-orange-500 dark:text-orange-400' },
    ]
  },
  {
    name: 'آفبوردینگ',
    icon: <LogOut size={20} />,
    iconColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    metrics: [
      { label: 'تسویه ناقص', value: 4, icon: <Calculator size={12} />, color: 'text-red-500 dark:text-red-400' },
      { label: 'تجهیزات برگشتی نشده', value: 6, icon: <Package size={12} />, color: 'text-amber-600 dark:text-amber-400' },
      { label: 'مصاحبه خروج', value: 2, icon: <Users size={12} />, color: 'text-emerald-600 dark:text-emerald-400' },
    ]
  },
]

function ProcessCard({ data }: { data: ProcessCardProps }) {
  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Header with gradient overlay */}
      <div className={`px-4 py-3 ${data.bgColor} border-b border-gray-100 dark:border-gray-800 relative overflow-hidden`}>
        {/* Subtle gradient overlay for dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-center gap-2.5 relative z-10">
          <div className={`w-8 h-8 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center ${data.iconColor} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
            {data.icon}
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{data.name}</span>
        </div>
      </div>

      {/* Metrics */}
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
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-0">
        <button className="w-full py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 group/btn">
          <ArrowLeft size={12} className="group-hover/btn:-translate-x-1 transition-transform duration-200" />
          <span>مشاهده جزئیات</span>
        </button>
      </div>
    </div>
  )
}

export default function ProcessStatusGrid() {
  return (
    <div className="w-full" dir="rtl">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">وضعیت فرآیندهای منابع انسانی</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">خلاصه وضعیت فرآیندهای جاری سازمان</p>
      </div>
  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {processCards.map((card, index) => (
          <ProcessCard key={index} data={card} />
        ))}
      </div>
    </div>
  )
}