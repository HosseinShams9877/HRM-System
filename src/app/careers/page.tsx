'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Briefcase, MapPin, Clock, DollarSign, GraduationCap, Users,
  ChevronRight, Check, Building2, Calendar, FileText, User,
  Mail, Phone, Globe, Linkedin, AlertCircle, CheckCircle,
  Loader2, Star, X, Eye, Search, LogIn, UserPlus,
  Copy, Share2, Zap, Target, Shield, ExternalLink
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface JobPosting {
  id: string
  title: string
  department: { id: string; name: string }
  description: string
  requirements: string
  responsibilities?: string
  qualifications?: string
  benefits?: string
  salaryMin: number
  salaryMax: number
  salaryType: string
  employmentType: string
  experienceMin: number
  experienceMax: number
  educationLevel?: string
  location?: string
  remoteWork: boolean
  deadline?: string
  views: number
  applications: number
  createdAt: string
}

interface StoredApplication {
  id: string
  jobId: string
  jobTitle: string
  departmentName: string
  appliedAt: string
  status: string
  currentStage: string
  candidateEmail: string
  candidateName: string
  timeline: { stage: string; date: string; description: string }[]
  interviewDetails?: { time: string; location: string; link?: string }
  offerDetails?: { salary: string; startDate: string; position: string }
}

type ViewType = 'home' | 'job-detail' | 'apply' | 'auth' | 'my-applications' | 'application-detail' | 'offer-response'

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)])
}

const formatDate = (date: string | Date): string => {
  try { return new Date(date).toLocaleDateString('fa-IR') } catch { return '...' }
}

const formatSalary = (min: number, max: number): string => {
  if (min === 0 && max === 0) return 'توافقی'
  const fmt = (n: number) => toPersianNumber((n / 1000000).toFixed(0)) + ' میلیون'
  return min === max || max === 0 ? fmt(min) : `${fmt(min)} - ${fmt(max)}`
}

const getEmploymentTypeLabel = (type: string) => ({
  'full-time': 'تمام وقت', 'part-time': 'پاره وقت',
  'contract': 'قراردادی', 'internship': 'کارآموزی'
})[type] || type

const getEducationLabel = (level?: string) => ({
  'diploma': 'دیپلم', 'associate': 'فوق دیپلم', 'bachelor': 'لیسانس',
  'master': 'فوق لیسانس', 'phd': 'دکتری'
})[level || ''] || level

const getStageLabel = (stage: string) => ({
  'applied': 'ثبت شده', 'screening': 'بررسی', 'interview': 'مصاحبه',
  'testing': 'آزمون', 'offer': 'پیشنهاد', 'hired': 'استخدام', 'rejected': 'رد شده'
})[stage] || stage

const getStageColor = (stage: string) => ({
  'applied': 'bg-blue-100 text-blue-700', 'screening': 'bg-yellow-100 text-yellow-700',
  'interview': 'bg-purple-100 text-purple-700', 'testing': 'bg-orange-100 text-orange-700',
  'offer': 'bg-emerald-100 text-emerald-700', 'hired': 'bg-green-100 text-green-700',
  'rejected': 'bg-red-100 text-red-700'
})[stage] || 'bg-gray-100 text-gray-700'

const isNew = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff < 7 * 24 * 60 * 60 * 1000
}

const STAGES = ['applied', 'screening', 'interview', 'testing', 'offer', 'hired']
const STAGE_ICONS = ['✅', '⏳', '📞', '📝', '🤝', '✅']
const STAGE_LABELS = ['ثبت درخواست', 'بررسی', 'مصاحبه', 'آزمون', 'پیشنهاد', 'استخدام']

const departmentIcons: Record<string, string> = {
  'فناوری اطلاعات': '💻',
  'مهندسی': '⚙️',
  'بازاریابی': '📢',
  'مالی': '💰',
  'منابع انسانی': '👥',
  'طراحی': '🎨',
  'فروش': '📊',
  'پشتیبانی': '🎧',
}

const getDepartmentIcon = (name: string) => departmentIcons[name] || '🏢'

// ═══════════════════════════════════════════════════════════════
// Navigation Bar Component
// ═══════════════════════════════════════════════════════════════

function NavBar({
  view, setView, isLoggedIn, user, handleLogout
}: {
  view: ViewType
  setView: (v: ViewType) => void
  isLoggedIn: boolean
  user: any
  handleLogout: () => void
}) {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setView('home')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800">فرصت‌های شغلی</h1>
            <p className="text-xs text-gray-500">به تیم ما بپیوندید</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('home')}
            className={`text-sm px-3 py-2 rounded-lg transition-colors ${view === 'home' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-emerald-600'}`}
          >
            مشاغل
          </button>
          {isLoggedIn && (
            <button
              onClick={() => setView('my-applications')}
              className={`text-sm px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${view === 'my-applications' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">پیگیری درخواست</span>
            </button>
          )}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-700 hidden sm:inline">{user?.firstName} {user?.lastName}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                خروج
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView('auth')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md"
            >
              <span className="flex items-center gap-1">
                <LogIn className="w-4 h-4" />
                ورود / ثبت‌نام
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════
// Footer Component
// ═══════════════════════════════════════════════════════════════

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-12 mt-auto" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">فرصت‌های شغلی</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              ما همیشه به دنبال افراد مستعد و با انگیزه هستیم. اگر به دنبال یک محیط کاری پویا و حرفه‌ای هستید، به تیم ما بپیوندید.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" />مشاغل فعال</li>
              <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" />درباره ما</li>
              <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" />تماس با ما</li>
              <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" />قوانین و مقررات</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">ارتباط با ما</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" />info@company.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" />۰۲۱-۱۲۳۴۵۶۷۸</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" />تهران، ایران</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-500">
            تمامی حقوق محفوظ است © {toPersianNumber(new Date().getFullYear())}
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIEW 1: Home
// ═══════════════════════════════════════════════════════════════

function HomeView({
  jobs, loading, searchQuery, setSearchQuery, cityQuery, setCityQuery,
  handleSearch, activeFilter, setActiveFilter, setView, setSelectedJob
}: {
  jobs: JobPosting[]
  loading: boolean
  searchQuery: string
  setSearchQuery: (v: string) => void
  cityQuery: string
  setCityQuery: (v: string) => void
  handleSearch: () => void
  activeFilter: string
  setActiveFilter: (v: string) => void
  setView: (v: ViewType) => void
  setSelectedJob: (j: JobPosting) => void
}) {
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !searchQuery ||
      job.title.includes(searchQuery) ||
      (job.department?.name || '').includes(searchQuery)
    const matchesCity = !cityQuery || (job.location || '').includes(cityQuery)
    const matchesType = !activeFilter || job.employmentType === activeFilter
    return matchesSearch && matchesCity && matchesType
  })

  const departments = Array.isArray(jobs)
    ? jobs.reduce((acc, job) => {
        const name = job.department?.name || 'سایر'
        if (!acc[name]) acc[name] = 0
        acc[name]++
        return acc
      }, {} as Record<string, number>)
    : {}

  const totalApplications = Array.isArray(jobs)
    ? jobs.reduce((sum, j) => sum + j.applications, 0)
    : 0

  const departmentCount = Object.keys(departments).length

  return (
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              به خانواده بزرگ ما بپیوندید
            </h2>
            <p className="text-emerald-100 text-lg md:text-xl mb-10 leading-relaxed">
              ما به دنبال افراد مستعد و باانگیزه هستیم که بخواهند در کنار ما رشد کنند
            </p>

            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="عنوان شغل یا تخصص..."
                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  dir="rtl"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="شهر..."
                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  dir="rtl"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-xl font-medium hover:from-emerald-800 hover:to-teal-800 transition-all flex items-center justify-center gap-2 min-w-[120px]"
              >
                <Search className="w-5 h-5" />
                جستجو
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">نوع همکاری:</span>
            <button
              onClick={() => setActiveFilter('')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${!activeFilter ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              همه
            </button>
            {[
              { key: 'full-time', label: 'تمام وقت' },
              { key: 'part-time', label: 'پاره وقت' },
              { key: 'contract', label: 'قراردادی' },
              { key: 'internship', label: 'کارآموزی' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveFilter(activeFilter === item.key ? '' : item.key)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${activeFilter === item.key ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{toPersianNumber(jobs.length)}</p>
                <p className="text-sm text-gray-500">تعداد مشاغل</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{toPersianNumber(totalApplications)}</p>
                <p className="text-sm text-gray-500">تعداد درخواست‌ها</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{toPersianNumber(departmentCount)}</p>
                <p className="text-sm text-gray-500">تعداد واحدها</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Cards */}
        {Object.keys(departments).length > 0 && (
          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              دسته‌بندی مشاغل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(departments).map(([name, count]) => (
                <div
                  key={name}
                  onClick={() => {
                    setSearchQuery(name)
                    setActiveFilter('')
                  }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getDepartmentIcon(name)}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">{name}</h4>
                        <p className="text-sm text-gray-500">{toPersianNumber(count)} موقعیت شغلی</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Jobs */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            آخرین مشاغل
          </h3>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          ) : !Array.isArray(filteredJobs) || filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery || cityQuery || activeFilter ? 'نتیجه‌ای یافت نشد' : 'فرصت شغلی فعلی وجود ندارد'}
              </h4>
              <p className="text-gray-500">
                {searchQuery || cityQuery || activeFilter
                  ? 'لطفاً معیارهای جستجوی خود را تغییر دهید'
                  : 'در حال حاضر موقعیت شغلی فعالی برای استخدام وجود ندارد'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="text-lg font-bold text-gray-800">{job.title}</h4>
                          {isNew(job.createdAt) && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                              جدید
                            </span>
                          )}
                          {job.remoteWork && (
                            <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full">
                              دورکاری
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 ml-1" />
                            {job.department?.name || 'نامشخص'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 ml-1" />
                            {job.location || 'نامشخص'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 ml-1" />
                            {getEmploymentTypeLabel(job.employmentType)}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 ml-1" />
                            {formatSalary(job.salaryMin, job.salaryMax)} تومان
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">{formatDate(job.createdAt)}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                          {toPersianNumber(job.applications)} درخواست
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
                      {job.educationLevel && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 ml-1" />
                          {getEducationLabel(job.educationLevel)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4 ml-1" />
                        {job.experienceMin > 0 ? `${toPersianNumber(job.experienceMin)}+ سال تجربه` : 'بدون نیاز به سابقه'}
                      </span>
                      {job.deadline && (
                        <span className={`flex items-center gap-1 ${new Date(job.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 ? 'text-red-500' : ''}`}>
                          <Calendar className="w-4 h-4 ml-1" />
                          مهلت: {formatDate(job.deadline)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => { setSelectedJob(job); setView('job-detail') }}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        مشاهده جزئیات
                      </button>
                      <button
                        onClick={() => { setSelectedJob(job); setView('apply') }}
                        className="px-5 py-2.5 border-2 border-emerald-600 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-all flex items-center gap-2"
                      >
                        ثبت درخواست
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIEW 2: Job Detail
// ═══════════════════════════════════════════════════════════════

function JobDetailView({
  job, setView
}: {
  job: JobPosting
  setView: (v: ViewType) => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUrgent = job.deadline && (new Date(job.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000)

  return (
    <div className="animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white py-10">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
            بازگشت به لیست مشاغل
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                {isNew(job.createdAt) && (
                  <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full backdrop-blur-sm">جدید</span>
                )}
                {job.remoteWork && (
                  <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full backdrop-blur-sm">دورکاری</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-emerald-100">
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4 ml-1" />{job.department?.name}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 ml-1" />{job.location || 'نامشخص'}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 ml-1" />{getEmploymentTypeLabel(job.employmentType)}</span>
              </div>
            </div>
            {job.deadline && (
              <div className={`px-4 py-2 rounded-xl text-sm ${isUrgent ? 'bg-red-500/30 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                <Calendar className="w-4 h-4 inline ml-1" />
                {isUrgent ? 'مهلت رو به اتمام: ' : 'مهلت ارسال: '}
                {formatDate(job.deadline)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">حقوق</p>
            <p className="text-sm font-semibold text-gray-800">{formatSalary(job.salaryMin, job.salaryMax)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <GraduationCap className="w-5 h-5 text-teal-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">تحصیلات</p>
            <p className="text-sm font-semibold text-gray-800">{getEducationLabel(job.educationLevel) || 'محلول'}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <Briefcase className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">تجربه</p>
            <p className="text-sm font-semibold text-gray-800">
              {job.experienceMin > 0 ? `${toPersianNumber(job.experienceMin)} تا ${toPersianNumber(job.experienceMax)} سال` : 'مهم نیست'}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">درخواست‌ها</p>
            <p className="text-sm font-semibold text-gray-800">{toPersianNumber(job.applications)} نفر</p>
          </div>
        </div>

        {/* Detail Sections */}
        <div className="space-y-6">
          {job.description && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                شرح وظایف
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {job.requirements && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                شرایط احراز
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </div>
          )}

          {job.responsibilities && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                مسئولیت‌ها
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}

          {job.benefits && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-500" />
                مزایا
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.benefits}</p>
            </div>
          )}
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            اشتراک‌گذاری
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'کپی شد!' : 'کپی لینک'}
            </button>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm hover:bg-blue-100 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              لینکدین
            </a>
          </div>
        </div>

        {/* Apply CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setView('apply')}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            ارسال فرم درخواست
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIEW 3: Apply (Stepper Form)
// ═══════════════════════════════════════════════════════════════

function ApplyView({
  job, setView, onApplicationSubmitted
}: {
  job: JobPosting
  setView: (v: ViewType) => void
  onApplicationSubmitted: (app: StoredApplication) => void
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const steps = [
    { id: 1, title: 'اطلاعات شخصی', icon: User },
    { id: 2, title: 'تحصیلات و تجربه', icon: GraduationCap },
    { id: 3, title: 'مهارت‌ها و رزومه', icon: Star },
    { id: 4, title: 'تایید نهایی', icon: CheckCircle },
  ]

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', nationalId: '',
    gender: '', city: '',
    educationLevel: '', educationField: '', university: '',
    experienceYears: '', currentCompany: '',
    skills: [] as string[], newSkill: '',
    linkedinUrl: '', portfolioUrl: '', resumeUrl: '',
    coverLetter: ''
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddItem = (field: string, value: string, setter: string) => {
    if (value.trim()) {
      const currentArray = formData[field as keyof typeof formData] as string[]
      updateFormData(field, [...currentArray, value.trim()])
      updateFormData(setter, '')
    }
  }

  const handleRemoveItem = (field: string, index: number) => {
    const currentArray = formData[field as keyof typeof formData] as string[]
    updateFormData(field, currentArray.filter((_, i) => i !== index))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return !!(formData.firstName && formData.lastName && formData.email && formData.phone)
      case 2: return !!(formData.educationLevel && formData.educationField)
      case 3: return true
      case 4: return true
      default: return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/job-applications',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          ...formData,
          experienceYears: parseInt(formData.experienceYears) || 0,
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'خطا در ثبت درخواست')

      const applicationId = data.applicationId || Date.now().toString()
      const newApp: StoredApplication = {
        id: applicationId,
        jobId: job.id,
        jobTitle: job.title,
        departmentName: job.department?.name || '',
        appliedAt: new Date().toISOString(),
        status: 'applied',
        currentStage: 'applied',
        candidateEmail: formData.email,
        candidateName: `${formData.firstName} ${formData.lastName}`,
        timeline: [{ stage: 'applied', date: new Date().toISOString(), description: 'درخواست استخدام ثبت شد' }]
      }

      // ذخیره برای کارجو (پیگیری درخواست من)
      const existingApps: StoredApplication[] = JSON.parse(localStorage.getItem('myApplications') || '[]')
      existingApps.push(newApp)
      localStorage.setItem('myApplications', JSON.stringify(existingApps))

      // ═══ Auto-Sync با مدیریت استخدام (HR) ═══
      const candidateId = `portal-${Date.now()}`
      const portalSubmission = {
        id: applicationId,
        candidateId: candidateId,
        jobId: job.id,
        jobTitle: job.title,
        departmentName: job.department?.name || '',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nationalId: formData.nationalId || '',
        gender: formData.gender || '',
        city: formData.city || '',
        educationLevel: formData.educationLevel || '',
        educationField: formData.educationField || '',
        university: formData.university || '',
        experienceYears: parseInt(formData.experienceYears) || 0,
        currentCompany: formData.currentCompany || '',
        skills: formData.skills.join('، '),
        linkedinUrl: formData.linkedinUrl || '',
        portfolioUrl: formData.portfolioUrl || '',
        resumeUrl: formData.resumeUrl || '',
        coverLetter: formData.coverLetter || '',
        source: 'website',
        status: 'active',
        appliedAt: new Date().toISOString(),
        synced: false
      }
      const portalSubmissions: any[] = JSON.parse(localStorage.getItem('hrm_portal_submissions') || '[]')
      portalSubmissions.push(portalSubmission)
      localStorage.setItem('hrm_portal_submissions', JSON.stringify(portalSubmissions))

      onApplicationSubmitted(newApp)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-fadeIn" dir="rtl">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">درخواست شما ثبت شد</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            درخواست استخدام شما برای موقعیت <strong>{job.title}</strong> با موفقیت ثبت شد.
            نتیجه از طریق ایمیل به شما اطلاع‌رسانی خواهد شد.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setView('home')}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all"
            >
              بازگشت به لیست مشاغل
            </button>
          </div>
        </div>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="animate-fadeIn" dir="rtl">
      {/* Stepper Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => setView('job-detail')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors text-sm"
          >
            <ChevronRight className="w-4 h-4" />
            بازگشت به جزئیات شغل
          </button>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep > step.id
                        ? 'bg-emerald-600 text-white'
                        : currentStep === step.id
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-4 ring-emerald-100'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1.5 whitespace-nowrap ${currentStep >= step.id ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-12 sm:w-20 mx-2 rounded mt-[-12px] ${currentStep > step.id ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="font-semibold text-gray-800">{job.title}</h4>
              <p className="text-sm text-gray-500">{job.department?.name} • {job.location}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-3">اطلاعات شخصی</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>نام <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.firstName} onChange={(e) => updateFormData('firstName', e.target.value)} className={inputClass} placeholder="نام خود را وارد کنید" />
                </div>
                <div>
                  <label className={labelClass}>نام خانوادگی <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.lastName} onChange={(e) => updateFormData('lastName', e.target.value)} className={inputClass} placeholder="نام خانوادگی خود را وارد کنید" />
                </div>
                <div>
                  <label className={labelClass}>ایمیل <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} className={inputClass} placeholder="example@email.com" dir="ltr" />
                </div>
                <div>
                  <label className={labelClass}>شماره موبایل <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} className={inputClass} placeholder="09xxxxxxxxx" dir="ltr" />
                </div>
                <div>
                  <label className={labelClass}>کد ملی</label>
                  <input type="text" value={formData.nationalId} onChange={(e) => updateFormData('nationalId', e.target.value)} className={inputClass} placeholder="کد ملی ۱۰ رقمی" dir="ltr" maxLength={10} />
                </div>
                <div>
                  <label className={labelClass}>جنسیت</label>
                  <select value={formData.gender} onChange={(e) => updateFormData('gender', e.target.value)} className={inputClass}>
                    <option value="">انتخاب کنید</option>
                    <option value="male">مرد</option>
                    <option value="female">زن</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>شهر</label>
                  <input type="text" value={formData.city} onChange={(e) => updateFormData('city', e.target.value)} className={inputClass} placeholder="شهر محل سکونت" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education & Experience */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-3">تحصیلات و تجربه</h3>
              <div className="bg-emerald-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                  تحصیلات
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>مقطع تحصیلی <span className="text-red-500">*</span></label>
                    <select value={formData.educationLevel} onChange={(e) => updateFormData('educationLevel', e.target.value)} className={inputClass}>
                      <option value="">انتخاب کنید</option>
                      <option value="diploma">دیپلم</option>
                      <option value="associate">فوق دیپلم</option>
                      <option value="bachelor">لیسانس</option>
                      <option value="master">فوق لیسانس</option>
                      <option value="phd">دکتری</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>رشته تحصیلی <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.educationField} onChange={(e) => updateFormData('educationField', e.target.value)} className={inputClass} placeholder="رشته تحصیلی" />
                  </div>
                  <div>
                    <label className={labelClass}>دانشگاه</label>
                    <input type="text" value={formData.university} onChange={(e) => updateFormData('university', e.target.value)} className={inputClass} placeholder="نام دانشگاه" />
                  </div>
                </div>
              </div>
              <div className="bg-teal-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  تجربه کاری
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>شرکت فعلی</label>
                    <input type="text" value={formData.currentCompany} onChange={(e) => updateFormData('currentCompany', e.target.value)} className={inputClass} placeholder="نام شرکت فعلی" />
                  </div>
                  <div>
                    <label className={labelClass}>سال‌های تجربه</label>
                    <input type="number" value={formData.experienceYears} onChange={(e) => updateFormData('experienceYears', e.target.value)} className={inputClass} placeholder="تعداد سال" dir="ltr" min="0" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills & Resume */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-3">مهارت‌ها و رزومه</h3>

              <div>
                <label className={labelClass}>مهارت‌ها</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.newSkill}
                    onChange={(e) => updateFormData('newSkill', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleAddItem('skills', formData.newSkill, 'newSkill') }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                    placeholder="مهارت جدید را وارد کرده و اینتر بزنید"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem('skills', formData.newSkill, 'newSkill')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm transition-colors"
                  >
                    افزودن
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(formData.skills) && formData.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                      {skill}
                      <button type="button" onClick={() => handleRemoveItem('skills', index)} className="hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>لینکدین</label>
                  <div className="relative">
                    <Linkedin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="url" value={formData.linkedinUrl} onChange={(e) => updateFormData('linkedinUrl', e.target.value)} className={`${inputClass} pr-10`} placeholder="آدرس پروفایل لینکدین" dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>وبسایت / نمونه‌کار</label>
                  <div className="relative">
                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="url" value={formData.portfolioUrl} onChange={(e) => updateFormData('portfolioUrl', e.target.value)} className={`${inputClass} pr-10`} placeholder="آدرس نمونه‌کار" dir="ltr" />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>لینک رزومه</label>
                <div className="relative">
                  <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="url" value={formData.resumeUrl} onChange={(e) => updateFormData('resumeUrl', e.target.value)} className={`${inputClass} pr-10`} placeholder="آدرس فایل رزومه (Google Drive و ...)" dir="ltr" />
                </div>
              </div>

              <div>
                <label className={labelClass}>متن پوششی</label>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => updateFormData('coverLetter', e.target.value)}
                  className={inputClass}
                  placeholder="اگر مایلید توضیحات بیشتری درباره خودتان بنویسید..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-3">تایید نهایی</h3>
              <div className="bg-emerald-50 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  اطلاعات شخصی
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">نام:</span> <span className="font-medium text-gray-800 mr-1">{formData.firstName} {formData.lastName}</span></div>
                  <div><span className="text-gray-500">ایمیل:</span> <span className="font-medium text-gray-800 mr-1" dir="ltr">{formData.email}</span></div>
                  <div><span className="text-gray-500">موبایل:</span> <span className="font-medium text-gray-800 mr-1" dir="ltr">{formData.phone}</span></div>
                  <div><span className="text-gray-500">شهر:</span> <span className="font-medium text-gray-800 mr-1">{formData.city || '-'}</span></div>
                </div>
              </div>
              <div className="bg-teal-50 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                  تحصیلات و تجربه
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">تحصیلات:</span> <span className="font-medium text-gray-800 mr-1">{getEducationLabel(formData.educationLevel)} - {formData.educationField}</span></div>
                  <div><span className="text-gray-500">دانشگاه:</span> <span className="font-medium text-gray-800 mr-1">{formData.university || '-'}</span></div>
                  <div><span className="text-gray-500">تجربه:</span> <span className="font-medium text-gray-800 mr-1">{formData.experienceYears ? `${toPersianNumber(formData.experienceYears)} سال` : '-'}</span></div>
                  <div><span className="text-gray-500">شرکت فعلی:</span> <span className="font-medium text-gray-800 mr-1">{formData.currentCompany || '-'}</span></div>
                </div>
              </div>
              {formData.skills.length > 0 && (
                <div className="bg-cyan-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-cyan-600" />
                    مهارت‌ها
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(formData.skills) && formData.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                مرحله قبل
              </button>
            ) : (
              <button
                onClick={() => setView('job-detail')}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                بازگشت
              </button>
            )}
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                مرحله بعد
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                ارسال درخواست
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIEW 4: Auth (Login / Register)
// ═══════════════════════════════════════════════════════════════

function AuthView({
  setView, setIsLoggedIn, setUser
}: {
  setView: (v: ViewType) => void
  setIsLoggedIn: (v: boolean) => void
  setUser: (u: any) => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!loginEmail || !loginPassword) {
      setError('لطفاً ایمیل و رمز عبور را وارد کنید')
      return
    }
    const storedUsers: any[] = JSON.parse(localStorage.getItem('careerUsers') || '[]')
    const found = storedUsers.find((u) => u.email === loginEmail)
    if (found) {
      const userData = { email: found.email, firstName: found.firstName, lastName: found.lastName, phone: found.phone, token: 'demo' }
      localStorage.setItem('careerCurrentUser', JSON.stringify(userData))
      setIsLoggedIn(true)
      setUser(userData)
      setView('home')
    } else {
      setError('حساب کاربری با این ایمیل یافت نشد')
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!regName || !regEmail || !regPhone || !regPassword) {
      setError('لطفاً تمام فیلدها را پر کنید')
      return
    }
    if (regPassword !== regConfirm) {
      setError('رمز عبور و تکرار آن مطابقت ندارند')
      return
    }
    if (regPassword.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد')
      return
    }
    const parts = regName.trim().split(/\s+/)
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ') || ''
    const newUser = { email: regEmail, firstName, lastName, phone: regPhone, password: regPassword }
    const storedUsers: any[] = JSON.parse(localStorage.getItem('careerUsers') || '[]')
    if (storedUsers.find((u) => u.email === regEmail)) {
      setError('این ایمیل قبلاً ثبت شده است')
      return
    }
    storedUsers.push(newUser)
    localStorage.setItem('careerUsers', JSON.stringify(storedUsers))
    const userData = { email: newUser.email, firstName, lastName, phone: newUser.phone, token: 'demo' }
    localStorage.setItem('careerCurrentUser', JSON.stringify(userData))
    setIsLoggedIn(true)
    setUser(userData)
    setView('home')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            {mode === 'login' ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-bold">{mode === 'login' ? 'ورود به حساب' : 'ثبت‌نام'}</h2>
          <p className="text-emerald-100 text-sm mt-1">
            {mode === 'login' ? 'برای پیگیری درخواست‌های خود وارد شوید' : 'یک حساب جدید ایجاد کنید'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'login' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ورود
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'register' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ثبت‌نام
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelClass}>ایمیل</label>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} placeholder="example@email.com" dir="ltr" />
              </div>
              <div>
                <label className={labelClass}>رمز عبور</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputClass} placeholder="رمز عبور" dir="ltr" />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm"
              >
                ورود
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={labelClass}>نام و نام خانوادگی <span className="text-red-500">*</span></label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className={inputClass} placeholder="نام و نام خانوادگی" />
              </div>
              <div>
                <label className={labelClass}>ایمیل <span className="text-red-500">*</span></label>
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputClass} placeholder="example@email.com" dir="ltr" />
              </div>
              <div>
                <label className={labelClass}>شماره موبایل <span className="text-red-500">*</span></label>
                <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className={inputClass} placeholder="09xxxxxxxxx" dir="ltr" />
              </div>
              <div>
                <label className={labelClass}>رمز عبور <span className="text-red-500">*</span></label>
                <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className={inputClass} placeholder="حداقل ۶ کاراکتر" dir="ltr" />
              </div>
              <div>
                <label className={labelClass}>تکرار رمز عبور <span className="text-red-500">*</span></label>
                <input type="password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} className={inputClass} placeholder="تکرار رمز عبور" dir="ltr" />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm"
              >
                ثبت‌نام
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIEW 5: My Applications
// ═══════════════════════════════════════════════════════════════

function MyApplicationsView({
  myApplications, setView, setSelectedApplication
}: {
  myApplications: StoredApplication[]
  setView: (v: ViewType) => void
  setSelectedApplication: (app: StoredApplication) => void
}) {
  if (!Array.isArray(myApplications) || myApplications.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fadeIn" dir="rtl">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">درخواستی ثبت نشده</h3>
          <p className="text-gray-500 text-sm mb-6">هنوز هیچ درخواست استخدامی ثبت نکرده‌اید</p>
          <button
            onClick={() => setView('home')}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            مشاهده مشاغل
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600" />
          درخواست‌های من
        </h2>

        <div className="space-y-4">
          {myApplications.map((app) => {
            const stageIndex = STAGES.indexOf(app.currentStage)
            return (
              <div
                key={app.id}
                onClick={() => { setSelectedApplication(app); setView('application-detail') }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">{app.jobTitle}</h4>
                    <p className="text-sm text-gray-500">{app.departmentName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(app.currentStage)}`}>
                      {getStageLabel(app.currentStage)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>

                {/* Mini Timeline */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {STAGE_LABELS.map((label, idx) => (
                    <div key={label} className="flex items-center flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${idx <= stageIndex ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                        {idx <= stageIndex ? '✓' : ''}
                      </div>
                      {idx < STAGE_LABELS.length - 1 && (
                        <div className={`w-6 h-0.5 mx-0.5 ${idx < stageIndex ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(app.appliedAt)}
                  </span>
                  <span>آخرین بروزرسانی: {formatDate(app.timeline[app.timeline.length - 1]?.date || app.appliedAt)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIEW 6: Application Detail
// ═══════════════════════════════════════════════════════════════

function ApplicationDetailView({
  application, setView, setSelectedApplication
}: {
  application: StoredApplication
  setView: (v: ViewType) => void
  setSelectedApplication: (app: StoredApplication) => void
}) {
  const stageIndex = STAGES.indexOf(application.currentStage)

  return (
    <div className="animate-fadeIn" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => setView('my-applications')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors text-sm"
        >
          <ChevronRight className="w-4 h-4" />
          بازگشت به لیست درخواست‌ها
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{application.jobTitle}</h2>
              <p className="text-gray-500 text-sm">{application.departmentName}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStageColor(application.currentStage)}`}>
              {getStageLabel(application.currentStage)}
            </span>
          </div>
        </div>

        {/* Full Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">مراحل فرآیند استخدام</h3>
          <div className="relative">
            {STAGES.map((stage, idx) => {
              const isCurrent = idx === stageIndex
              const isCompleted = idx < stageIndex
              const isPending = idx > stageIndex
              const timelineEntry = application.timeline.find((t) => t.stage === stage)

              return (
                <div key={stage} className="flex gap-4 pb-8 last:pb-0 relative">
                  {/* Line */}
                  {idx < STAGES.length - 1 && (
                    <div className={`absolute right-[15px] top-[32px] w-0.5 h-[calc(100%-16px)] ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                  {/* Circle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    isCompleted ? 'bg-emerald-600 text-white' :
                    isCurrent ? 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : (
                      <span className="text-sm font-bold">{toPersianNumber(idx + 1)}</span>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h4 className={`font-semibold ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                      {STAGE_LABELS[idx]}
                    </h4>
                    {timelineEntry ? (
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">{timelineEntry.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(timelineEntry.date)}</p>
                      </div>
                    ) : isPending ? (
                      <p className="text-sm text-gray-400 mt-1">در انتظار</p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Interview Details */}
        {application.currentStage === 'interview' && application.interviewDetails && (
          <div className="bg-purple-50 rounded-2xl p-6 mb-6 border border-purple-100">
            <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
              📞 جزئیات مصاحبه
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-purple-600">زمان:</span>
                <span className="text-gray-700 mr-2">{application.interviewDetails.time}</span>
              </div>
              <div>
                <span className="text-purple-600">مکان:</span>
                <span className="text-gray-700 mr-2">{application.interviewDetails.location}</span>
              </div>
              {application.interviewDetails.link && (
                <div className="md:col-span-2">
                  <a href={application.interviewDetails.link} target="_blank" rel="noopener noreferrer" className="text-purple-700 underline hover:text-purple-800">
                    لینک جلسه آنلاین
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Offer Section */}
        {application.currentStage === 'offer' && (
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
              🤝 پیشنهاد استخدام
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              تبریک! ما به شما پیشنهاد استخدام ارسال کرده‌ایم. لطفاً پاسخ خود را اعلام کنید.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedApplication({ ...application, offerDetails: application.offerDetails || { salary: 'توافقی', startDate: 'به زودی', position: application.jobTitle } })
                  setView('offer-response')
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all"
              >
                مشاهده پیشنهاد
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIEW 7: Offer Response
// ═══════════════════════════════════════════════════════════════

function OfferResponseView({
  application, setView
}: {
  application: StoredApplication
  setView: (v: ViewType) => void
}) {
  const [response, setResponse] = useState<'none' | 'accepted' | 'rejected'>('none')
  const [rejectReason, setRejectReason] = useState('')

  const handleAccept = () => {
    const apps: StoredApplication[] = JSON.parse(localStorage.getItem('myApplications') || '[]')
    const idx = apps.findIndex((a) => a.id === application.id)
    if (idx >= 0) {
      apps[idx].currentStage = 'hired'
      apps[idx].status = 'hired'
      apps[idx].timeline.push({ stage: 'hired', date: new Date().toISOString(), description: 'پیشنهاد استخدام پذیرفته شد' })
      localStorage.setItem('myApplications', JSON.stringify(apps))
    }
    setResponse('accepted')
  }

  const handleReject = () => {
    const apps: StoredApplication[] = JSON.parse(localStorage.getItem('myApplications') || '[]')
    const idx = apps.findIndex((a) => a.id === application.id)
    if (idx >= 0) {
      apps[idx].currentStage = 'rejected'
      apps[idx].status = 'rejected'
      apps[idx].timeline.push({ stage: 'rejected', date: new Date().toISOString(), description: `پیشنهاد استخدام رد شد. دلیل: ${rejectReason || 'بدون دلیل'}` })
      localStorage.setItem('myApplications', JSON.stringify(apps))
    }
    setResponse('rejected')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {response === 'none' && (
          <>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm text-3xl">
                🤝
              </div>
              <h2 className="text-2xl font-bold">پیشنهاد استخدام</h2>
              <p className="text-emerald-100 text-sm mt-1">پاسخ خود را به پیشنهاد استخدام اعلام کنید</p>
            </div>
            <div className="p-6">
              <div className="bg-emerald-50 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">موقعیت شغلی:</span>
                  <span className="font-medium text-gray-800">{application.jobTitle}</span>
                </div>
                {application.offerDetails && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">حقوق پیشنهادی:</span>
                      <span className="font-medium text-gray-800">{application.offerDetails.salary}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">تاریخ شروع:</span>
                      <span className="font-medium text-gray-800">{application.offerDetails.startDate}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">واحد سازمانی:</span>
                  <span className="font-medium text-gray-800">{application.departmentName}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  قبول پیشنهاد
                </button>
                <button
                  onClick={() => setResponse('rejected')}
                  className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  رد پیشنهاد
                </button>
              </div>
            </div>
          </>
        )}

        {response === 'rejected' && (
          <>
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm text-3xl">
                😔
              </div>
              <h2 className="text-2xl font-bold">رد پیشنهاد</h2>
              <p className="text-red-100 text-sm mt-1">متاسفیم که نتوانستیم با هم همکاری کنیم</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">دلیل رد پیشنهاد (اختیاری)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none text-sm"
                placeholder="اگر مایلید دلیل خود را بنویسید..."
                rows={3}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleReject}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
                >
                  تایید و ارسال
                </button>
                <button
                  onClick={() => setResponse('none')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  بازگشت
                </button>
              </div>
            </div>
          </>
        )}

        {response === 'accepted' && (
          <>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm text-3xl">
                🎉
              </div>
              <h2 className="text-2xl font-bold">تبریک!</h2>
              <p className="text-emerald-100 text-sm mt-1">پیشنهاد استخدام شما با موفقیت تایید شد</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">
                به تیم ما خوش آمدید! اطلاعات تکمیلی و مراحل بعدی از طریق ایمیل برای شما ارسال خواهد شد.
              </p>
              <button
                onClick={() => setView('home')}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all"
              >
                بازگشت به صفحه اصلی
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Content Component
// ═══════════════════════════════════════════════════════════════

function CareersContent() {
  const searchParams = useSearchParams()
  const applyJobId = searchParams.get('apply')

  const [view, setView] = useState<ViewType>('home')
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<StoredApplication | null>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [myApplications, setMyApplications] = useState<StoredApplication[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  // Load auth state
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('careerCurrentUser')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setIsLoggedIn(true)
        setUser(userData)
      }
      const storedApps = localStorage.getItem('myApplications')
      if (storedApps) {
        setMyApplications(JSON.parse(storedApps))
      }
    } catch { /* ignore */ }
  }, [])

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/job-postings?status=open')
        const data = await response.json()
        setJobs(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  // Handle direct apply URL
  useEffect(() => {
    if (applyJobId && Array.isArray(jobs) && jobs.length > 0) {
      const job = jobs.find((j) => j.id === applyJobId)
      if (job) {
        setSelectedJob(job)
        setView('apply')
      }
    }
  }, [applyJobId, jobs])

  const handleSearch = useCallback(() => {
    // Search is handled reactively via filteredJobs
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('careerCurrentUser')
    setIsLoggedIn(false)
    setUser(null)
    setView('home')
  }, [])

  const handleApplicationSubmitted = useCallback((app: StoredApplication) => {
    setMyApplications((prev) => [...prev, app])
  }, [])

  const handleLogin = useCallback((u: any) => {
    setIsLoggedIn(true)
    setUser(u)
  }, [])

  const handleSetView = useCallback((v: ViewType) => {
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>
      {/* Floating Public Link Badge */}
      <div className="fixed bottom-4 left-4 z-50">
        <a
          href="http://localhost:3000/careers"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/80 backdrop-blur-sm text-white rounded-xl text-xs hover:bg-gray-900 transition-all shadow-lg group"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">لینک انتشار:</span>
          <span className="font-mono text-emerald-400 group-hover:text-emerald-300 transition-colors" dir="ltr">localhost:4000/careers</span>
          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
        </a>
      </div>

      <NavBar
        view={view}
        setView={handleSetView}
        isLoggedIn={isLoggedIn}
        user={user}
        handleLogout={handleLogout}
      />

      <main className="flex-1">
        {view === 'home' && (
          <HomeView
            jobs={jobs}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cityQuery={cityQuery}
            setCityQuery={setCityQuery}
            handleSearch={handleSearch}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            setView={handleSetView}
            setSelectedJob={setSelectedJob}
          />
        )}

        {view === 'job-detail' && selectedJob && (
          <JobDetailView job={selectedJob} setView={handleSetView} />
        )}

        {view === 'apply' && selectedJob && (
          <ApplyView
            job={selectedJob}
            setView={handleSetView}
            onApplicationSubmitted={handleApplicationSubmitted}
          />
        )}

        {view === 'auth' && (
          <AuthView
            setView={handleSetView}
            setIsLoggedIn={handleLogin}
            setUser={setUser}
          />
        )}

        {view === 'my-applications' && (
          <MyApplicationsView
            myApplications={myApplications}
            setView={handleSetView}
            setSelectedApplication={setSelectedApplication}
          />
        )}

        {view === 'application-detail' && selectedApplication && (
          <ApplicationDetailView
            application={selectedApplication}
            setView={handleSetView}
            setSelectedApplication={setSelectedApplication}
          />
        )}

        {view === 'offer-response' && selectedApplication && (
          <OfferResponseView
            application={selectedApplication}
            setView={handleSetView}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Export with Suspense
// ═══════════════════════════════════════════════════════════════

export default function CareersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">در حال بارگذاری...</p>
          </div>
        </div>
      }
    >
      <CareersContent />
    </Suspense>
  )
}
