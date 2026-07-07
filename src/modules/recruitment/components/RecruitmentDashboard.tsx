"use client";

import React from "react";
import {
  UserPlus,
  RefreshCw,
  BarChart3,
  Briefcase,
  Users,
  FileText,
  Calendar,
  Award,
  TrendingUp,
  ClipboardList,
  UserCheck,
  MessageSquare,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatCard {
  id: string;
  title: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
}

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const tabs: Tab[] = [
  { id: "dashboard", label: "داشبورد", icon: <BarChart3 size={16} />, active: true },
  { id: "jobs", label: "آگهی‌ها", active: false },
  { id: "candidates", label: "کاندیداها", active: false },
  { id: "pipeline", label: "خط فرآیند", active: false },
  { id: "interviews", label: "مصاحبه‌ها", active: false },
  { id: "assessments", label: "ارزیابی‌ها", active: false },
  { id: "reports", label: "گزارشات", active: false },
];

const statCards: StatCard[] = [
  {
    id: "total-jobs",
    title: "کل آگهی‌ها",
    value: "۰",
    icon: <Briefcase size={28} strokeWidth={1.5} />,
    bg: "bg-blue-500",
  },
  {
    id: "active-candidates",
    title: "کاندیداهای فعال",
    value: "۱",
    icon: <Users size={28} strokeWidth={1.5} />,
    bg: "bg-emerald-500",
  },
  {
    id: "applications",
    title: "درخواست‌ها",
    value: "۰",
    icon: <FileText size={28} strokeWidth={1.5} />,
    bg: "bg-purple-500",
  },
  {
    id: "upcoming-interviews",
    title: "مصاحبه‌های پیش‌رو",
    value: "۰",
    icon: <Calendar size={28} strokeWidth={1.5} />,
    bg: "bg-orange-500",
  },
  {
    id: "job-offers",
    title: "پیشنهاد شغلی",
    value: "۰",
    icon: <Award size={28} strokeWidth={1.5} />,
    bg: "bg-teal-500",
  },
  {
    id: "conversion-rate",
    title: "نرخ تبدیل",
    value: "۰٪",
    icon: <TrendingUp size={28} strokeWidth={1.5} />,
    bg: "bg-pink-500",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function RecruitmentDashboard() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[Vazirmatn] p-3 sm:p-4 md:p-6 lg:p-8 transition-colors duration-300"
    >
      {/* ── 1. Top Header Section ─────────────────────────────────────── */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Right: Title + Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
            <UserPlus size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="text-right">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
              مدیریت استخدام
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              مدیریت فرآیند جذب و استخدام نیروی انسانی
            </p>
          </div>
        </div>
  
        {/* Left: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw size={15} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">بروزرسانی</span>
          </button>
          <button className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm transition-colors">
            <UserPlus size={15} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">آگهی جدید</span>
          </button>
        </div>
      </div>
  
      {/* ── 2. Navigation Tabs ───────────────────────────────────────── */}
      <div className="mb-4 sm:mb-6 flex items-center gap-1 overflow-x-auto rounded-2xl bg-gray-200/70 dark:bg-gray-800/70 p-1.5 scrollbar-hide">
        {Array.isArray(tabs) &&
          tabs.map((tab) => (
            <button
              key={tab.id}
              className="flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {tab.icon}
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
      </div>
  
      {/* ── 3. Statistics Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 xl:gap-4">
        {Array.isArray(statCards) &&
          statCards.map((card) => (
            <div
              key={card.id}
              className={`flex flex-col items-center justify-center rounded-2xl ${card.bg} ${card.bgDark} px-3 py-4 sm:px-4 sm:py-5 md:py-6 text-center shadow-sm transition-all hover:scale-105 hover:shadow-md duration-200`}
            >
              {/* Icon */}
              <div className="mb-2 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white/30">
                {React.cloneElement(card.icon as React.ReactElement, {
                  className: "text-white w-5 h-5 sm:w-7 sm:h-7",
                })}
              </div>
  
              {/* Title */}
              <p className="mb-0.5 sm:mb-1 text-[10px] xs:text-xs sm:text-sm font-medium text-white/80">
                {card.title}
              </p>
  
              {/* Value */}
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                {card.value}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
