// src/modules/employees/components/HRSettings.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Users, Briefcase, FileBadge, UserCircle, 
  CreditCard, Settings, ChevronLeft, ArrowLeft,
  Building, UserCheck, FileText, DollarSign, Shield
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { useRouter } from 'next/navigation'

// ============================================
// Types
// ============================================

interface SettingCardProps {
  title: string
  description: string
  icon: React.ElementType
  color: string
  href?: string
  onClick?: () => void
}

interface HRSettingsProps {
  onNavigate?: (id: string) => void
  currentUser?: { role: string; employeeId?: string }
}

// ============================================
// Setting Card Component
// ============================================

function SettingCard({ title, description, icon: Icon, color, href, onClick }: SettingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
      onClick={onClick || (href ? () => window.location.href = href : undefined)}
    >
      <Card className={`border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${color}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-sm text-white/70 mt-1 max-w-[200px]">{description}</p>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-1 bg-white/20 text-white hover:bg-white/30 border-0"
              >
                <Settings className="w-3 h-3" />
                تنظیمات
                <ChevronLeft className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// Main Component
// ============================================

export function HRSettings({ onNavigate, currentUser }: HRSettingsProps) {
  const router = useRouter()

  const settingsCards = [
    {
      id: 'org-info',
      title: 'اطلاعات سازمان',
      description: 'ویرایش اطلاعات پایه سازمان، لوگو، نام و ...',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      onClick: () => onNavigate?.('org-info-settings')
    },
    {
      id: 'org-structure',
      title: 'ساختار سازمان',
      description: 'مدیریت دپارتمان‌ها، واحدها و زیرمجموعه‌ها',
      icon: Building,
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => onNavigate?.('org-departments')
    },
    {
      id: 'positions',
      title: 'سمت‌ها و مشاغل',
      description: 'تعریف و ویرایش عناوین شغلی و شرح وظایف',
      icon: Briefcase,
      color: 'from-amber-500 to-amber-600',
      onClick: () => onNavigate?.('org-positions')
    },
    {
      id: 'contracts',
      title: 'قراردادها',
      description: 'مدیریت انواع قراردادها، قالب‌ها و ضوابط',
      icon: FileBadge,
      color: 'from-purple-500 to-purple-600',
      onClick: () => onNavigate?.('contract-view')
    },
    {
      id: 'employee-info',
      title: 'اطلاعات پرسنلی',
      description: 'فیلدهای پرسنلی، مدارک مورد نیاز و ...',
      icon: UserCircle,
      color: 'from-rose-500 to-rose-600',
      onClick: () => onNavigate?.('org-employee')
    },
    {
      id: 'financial',
      title: 'اطلاعات مالی',
      description: 'تنظیمات حقوق و دستمزد، بیمه و مالیات',
      icon: DollarSign,
      color: 'from-teal-500 to-teal-600',
      onClick: () => onNavigate?.('payroll-settings')
    }
  ]

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-800">تنظیمات منابع انسانی</h1>
        </div>
        <p className="text-gray-500 mr-4">مدیریت و پیکربندی ماژول‌های منابع انسانی</p>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {settingsCards.map((card) => (
          <SettingCard
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            color={card.color}
            onClick={card.onClick}
          />
        ))}
      </div>

      {/* Bottom Info */}
      <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">تنظیمات پیشرفته</p>
            <p className="text-xs text-gray-400">
              تغییرات در این بخش فقط توسط مدیر سیستم قابل انجام است
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}