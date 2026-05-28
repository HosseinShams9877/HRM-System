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
      className="min-h-screen bg-gray-100 font-[Vazirmatn] p-4 sm:p-6 lg:p-8"
    >
      {/* ── 1. Top Header Section ─────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Right: Title + Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <UserPlus size={22} />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
              مدیریت استخدام
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              مدیریت فرآیند جذب و استخدام نیروی انسانی
            </p>
          </div>
        </div>

        {/* Left: Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <RefreshCw size={16} />
            بروزرسانی
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700">
            <UserPlus size={16} />
            آگهی جدید
          </button>
        </div>
      </div>

      {/* ── 2. Navigation Tabs ───────────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-2xl bg-gray-200/70 p-1.5">
        {Array.isArray(tabs) &&
          tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                tab.active
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
      </div>

      {/* ── 3. Statistics Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:gap-5">
        {Array.isArray(statCards) &&
          statCards.map((card) => (
            <div
              key={card.id}
              className={`flex flex-col items-center justify-center rounded-2xl ${card.bg} px-4 py-6 text-center shadow-sm`}
            >
              {/* Icon */}
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30">
                {React.cloneElement(card.icon as React.ReactElement, {
                  className: "text-white",
                })}
              </div>

              {/* Title */}
              <p className="mb-1 text-xs font-medium text-white/80">
                {card.title}
              </p>

              {/* Value */}
              <span className="text-2xl font-bold text-white">{card.value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
