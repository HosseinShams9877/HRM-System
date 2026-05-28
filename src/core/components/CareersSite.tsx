'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Badge } from '@/core/components/ui/badge'
import { Textarea } from '@/core/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/core/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Separator } from '@/core/components/ui/separator'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Briefcase, MapPin, Clock, DollarSign, GraduationCap, Users,
  ChevronLeft, Check, Building2, Calendar, FileText, User, Mail,
  Phone, Award, Globe, Upload, AlertCircle, CheckCircle,
  Loader2, ArrowLeft, Star, X, Eye, Bell, LogIn, LogOut,
  Search, Filter, Send, Plus, Heart, Shield, Key, Smartphone,
  Lock, UserCheck, FileCheck, Timer, Target, TrendingUp,
  MessageSquare, Settings, ChevronDown, Copy, Share2, Zap,
  BookOpen, Edit, Trash2, ExternalLink, BarChart3,
  type LucideIcon
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface Education {
  degree: string; field: string; university: string; gpa?: number
  start_year: number; end_year?: number; is_studying: boolean
}

interface WorkExperience {
  company: string; position: string; start_date: string
  end_date?: string; is_current: boolean; salary?: number
  reason_for_leaving?: string; description?: string
}

interface Skill { name: string; level: string }
interface LanguageSkill { name: string; level: string }

interface ApplicantUser {
  id: string; email: string; phone: string; is_verified: boolean
  personal: {
    first_name: string; last_name: string; national_id?: string
    birth_date?: string; gender?: string; marital_status?: string
    military_status?: string; profile_photo?: string
    city?: string; address?: string
  }
  education: Education[]; work_experience: WorkExperience[]
  skills: Skill[]; languages: LanguageSkill[]
  resume_file?: string; portfolio_url?: string; linkedin_url?: string
  expected_salary?: number; available_from?: string
  job_alert_enabled: boolean; created_at: string
}

interface OnlineApplication {
  id: string; job_posting_id: string
  job?: { title: string; department?: { name: string } }
  cover_letter?: string; expected_salary?: number
  status: string; status_message?: string
  submitted_at: string; last_updated: string
}

interface Notification {
  id: string; type: string; channel: string; title: string; body: string
  related_application_id?: string; is_read: boolean; sent_at: string
}

interface AssessmentQuestion {
  id: string; order: number; type: string; text: string
  options?: string[]; score_weight: number
}

interface OnlineAssessment {
  id: string; application_id: string; title: string; description?: string
  type: string; duration_minutes: number; pass_score: number
  assigned_at: string; deadline: string; started_at?: string
  submitted_at?: string; score?: number; result?: string
  questions?: AssessmentQuestion[]
}

interface JobOffer {
  id: string; application_id: string
  job?: { title: string; department?: { name: string } }
  employment_type: string; base_salary?: number; start_date?: string
  work_location?: string; offer_expiry_date?: string; status: string
  created_at: string
}

interface JobPosting {
  id: string; title: string; departmentId?: string
  department?: { name: string }; description: string; requirements: string
  responsibilities?: string; benefits?: string; salaryMin: number
  salaryMax: number; salaryType: string; employmentType: string
  experienceMin: number; experienceMax: number; educationLevel?: string
  location?: string; remoteWork: boolean; status?: string
  deadline?: string; views: number; applications: number; createdAt: string
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const RTL_STYLE = { fontFamily: 'Vazirmatn, sans-serif' }

const toPN = (n: number | string): string =>
  n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])

const fDate = (d: string | Date) => {
  try { return new Date(d).toLocaleDateString('fa-IR') } catch { return '—' }
}

const fRelativeTime = (d: string): string => {
  const now = new Date()
  const date = new Date(d)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'لحظاتی پیش'
  if (diff < 3600) return `${toPN(Math.floor(diff / 60))} دقیقه پیش`
  if (diff < 86400) return `${toPN(Math.floor(diff / 3600))} ساعت پیش`
  if (diff < 2592000) return `${toPN(Math.floor(diff / 86400))} روز پیش`
  return fDate(d)
}

const safe = <T,>(d: unknown): T[] => Array.isArray(d) ? d : []

const statusLabel = (s: string) => {
  const m: Record<string, string> = {
    submitted: 'ثبت شده', under_review: 'در حال بررسی', hr_interview: 'مصاحبه منابع انسانی',
    technical_interview: 'مصاحبه فنی', assessment: 'آزمون', offer_sent: 'پیشنهاد شغلی',
    hired: 'استخدام شده', rejected: 'رد شده', withdrawn: 'انصراف داده',
    draft: 'پیش‌نویس', open: 'فعال', paused: 'متوقف', closed: 'بسته', published: 'منتشر شده',
    pending: 'در انتظار', in_progress: 'در حال انجام', completed: 'تکمیل شده',
    passed: 'قبول', failed: 'مردود', accepted: 'پذیرفته شده', declined: 'رد شده',
    scheduled: 'برنامه‌ریزی شده', expired: 'منقضی شده',
  }
  return m[s] || s
}

const statusColor = (s: string) => {
  const m: Record<string, string> = {
    submitted: 'bg-blue-500', under_review: 'bg-amber-500', hr_interview: 'bg-purple-500',
    technical_interview: 'bg-violet-600', assessment: 'bg-yellow-500', offer_sent: 'bg-teal-500',
    hired: 'bg-emerald-600', rejected: 'bg-red-500', withdrawn: 'bg-gray-500',
    pending: 'bg-amber-500', in_progress: 'bg-blue-500', completed: 'bg-emerald-500',
    passed: 'bg-emerald-500', failed: 'bg-red-500', accepted: 'bg-emerald-500', declined: 'bg-red-500',
    open: 'bg-emerald-500', expired: 'bg-gray-400',
  }
  return m[s] || 'bg-gray-500'
}

const empTypeLabel = (t: string) => {
  const m: Record<string, string> = {
    'full-time': 'تمام وقت', 'part-time': 'پاره وقت', 'contract': 'قراردادی',
    'internship': 'کارآموزی', 'project': 'پروژه‌ای',
    'full_time': 'تمام وقت', 'part_time': 'پاره وقت',
  }
  return m[t] || t
}

const notifIcon = (t: string): LucideIcon => {
  const m: Record<string, LucideIcon> = {
    application_received: CheckCircle, stage_changed: ArrowLeft,
    interview_scheduled: Calendar, assessment_assigned: BookOpen,
    offer_sent: Award, rejection: XCircle, job_alert: Bell,
  }
  return m[t] || Bell
}

// ═══════════════════════════════════════════════════════════════
// Content Component
// ═══════════════════════════════════════════════════════════════

function CareersContent() {
  const [view, setView] = useState('home')
  const [user, setUser] = useState<ApplicantUser | null>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [applications, setApplications] = useState<OnlineApplication[]>([])
  const [assessments, setAssessments] = useState<OnlineAssessment[]>([])
  const [offers, setOffers] = useState<JobOffer[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const [notifDialogOpen, setNotifDialogOpen] = useState(false)
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null)

  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form')
  const [authLoading, setAuthLoading] = useState(false)
  const [authForm, setAuthForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '' })
  const [otpCode, setOtpCode] = useState('')
  const [otpTimer, setOtpTimer] = useState(120)
  const [otpInterval, setOtpInterval] = useState<NodeJS.Timeout | null>(null)

  // Assessment state
  const [activeAssessment, setActiveAssessment] = useState<OnlineAssessment | null>(null)
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string | string[]>>({})
  const [assessmentTimer, setAssessmentTimer] = useState(0)
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  // Profile state
  const [profileForm, setProfileForm] = useState({
    first_name: '', last_name: '', national_id: '', birth_date: '', gender: '',
    marital_status: '', military_status: '', city: '', address: '',
    linkedin_url: '', portfolio_url: '', expected_salary: '', available_from: '',
    job_alert_enabled: false, alert_keywords: '', alert_types: '', alert_cities: '',
  })
  const [educationList, setEducationList] = useState<Education[]>([{ degree: '', field: '', university: '', gpa: 0, start_year: 1400, end_year: null, is_studying: false }])
  const [workList, setWorkList] = useState<WorkExperience[]>([{ company: '', position: '', start_date: '', end_date: null, is_current: true, salary: 0, reason_for_leaving: '', description: '' }])
  const [skillList, setSkillList] = useState<Skill[]>([])
  const [langList, setLangList] = useState<LanguageSkill[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('intermediate')
  const [newLang, setNewLang] = useState('')
  const [newLangLevel, setNewLangLevel] = useState('intermediate')
  const [profileSaving, setProfileSaving] = useState(false)

  // ─── Data Fetching ───
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/job-postings?status=open')
      if (res.ok) {
        const data = await res.json()
        setJobs(safe<JobPosting>(data))
      }
    } catch { /* silent */ }
  }, [])

  const fetchProfile = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/v1/portal/profile')
      if (res.ok) {
        const data = await res.json()
        setProfileForm({
          first_name: data.personal?.first_name || '', last_name: data.personal?.last_name || '',
          national_id: data.personal?.national_id || '', birth_date: data.personal?.birth_date || '',
          gender: data.personal?.gender || '', marital_status: data.personal?.marital_status || '',
          military_status: data.personal?.military_status || '', city: data.personal?.city || '',
          address: data.personal?.address || '', linkedin_url: data.linkedin_url || '',
          portfolio_url: data.portfolio_url || '',
          expected_salary: data.expected_salary?.toString() || '',
          available_from: data.available_from || '', job_alert_enabled: data.job_alert_enabled || false,
          alert_keywords: data.job_alert_filters?.keywords?.join(', ') || '',
          alert_types: data.job_alert_filters?.employment_type?.join(', ') || '',
          alert_cities: data.job_alert_filters?.city?.join(', ') || '',
        })
        if (Array.isArray(data.education) && data.education.length > 0) setEducationList(data.education)
        if (Array.isArray(data.work_experience) && data.work_experience.length > 0) setWorkList(data.work_experience)
        if (Array.isArray(data.skills)) setSkillList(data.skills)
        if (Array.isArray(data.languages)) setLangList(data.languages)
      }
    } catch { /* silent */ }
  }, [user])

  const fetchApplications = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/v1/portal/applications')
      if (res.ok) setApplications(safe<OnlineApplication>(await res.json()))
    } catch { /* silent */ }
  }, [user])

  const fetchAssessments = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/v1/portal/assessments')
      if (res.ok) setAssessments(safe<OnlineAssessment>(await res.json()))
    } catch { /* silent */ }
  }, [user])

  const fetchOffers = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/v1/portal/offers')
      if (res.ok) setOffers(safe<JobOffer>(await res.json()))
    } catch { /* silent */ }
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/v1/portal/notifications')
      if (res.ok) setNotifications(safe<Notification>(await res.json()))
    } catch { /* silent */ }
  }, [user])

  useEffect(() => { fetchJobs() }, [fetchJobs])
  useEffect(() => {
    if (user) { fetchProfile(); fetchApplications(); fetchAssessments(); fetchOffers(); fetchNotifications() }
  }, [user, fetchProfile, fetchApplications, fetchAssessments, fetchOffers, fetchNotifications])

  // ─── Auth Handlers ───
  const startOtpTimer = () => {
    setOtpTimer(120)
    if (otpInterval) clearInterval(otpInterval)
    const iv = setInterval(() => {
      setOtpTimer(prev => { if (prev <= 1) { clearInterval(iv); return 0 } return prev - 1 })
    }, 1000)
    setOtpInterval(iv)
  }

  const handleRegister = async () => {
    setAuthLoading(true)
    try {
      const res = await fetch('/api/v1/portal/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      })
      const data = await res.json()
      if (res.ok) { setAuthStep('otp'); startOtpTimer(); toast.success('کد تأیید ارسال شد') }
      else toast.error(data.error || 'خطا در ثبت‌نام')
    } catch { toast.error('خطا در ارتباط') }
    setAuthLoading(false)
  }

  const handleLogin = async () => {
    setAuthLoading(true)
    try {
      const res = await fetch('/api/v1/portal/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data); setView('dashboard')
        toast.success(`خوش آمدید ${data.personal?.first_name || ''}`)
      } else {
        if (data.needs_verification) { setAuthStep('otp'); startOtpTimer(); }
        else toast.error(data.error || 'خطا در ورود')
      }
    } catch { toast.error('خطا در ارتباط') }
    setAuthLoading(false)
  }

  const handleVerifyOtp = async () => {
    setAuthLoading(true)
    try {
      const res = await fetch('/api/v1/portal/auth/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, code: otpCode }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data); setView('dashboard'); setAuthStep('form')
        toast.success('حساب شما تأیید شد')
      } else toast.error(data.error || 'کد نامعتبر')
    } catch { toast.error('خطا در ارتباط') }
    setAuthLoading(false)
  }

  const handleLogout = () => {
    setUser(null); setView('home'); setAuthStep('form'); setAuthForm({ first_name: '', last_name: '', email: '', phone: '', password: '' })
    toast.success('با موفقیت خارج شدید')
  }

  // ─── Assessment Handlers ───
  const startAssessment = async (a: OnlineAssessment) => {
    try {
      const res = await fetch(`/api/v1/portal/assessments/${a.id}/start`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setActiveAssessment({ ...a, ...data, questions: data.questions || a.questions })
        setAssessmentStarted(true); setAssessmentTimer(a.duration_minutes * 60); setCurrentQuestion(0)
        setAssessmentAnswers({})
        autoSaveRef.current = setInterval(() => { /* auto-save placeholder */ }, 30000)
      } else toast.error('خطا در شروع آزمون')
    } catch { toast.error('خطا در ارتباط') }
  }

  useEffect(() => {
    if (!assessmentStarted || assessmentTimer <= 0) return
    const iv = setInterval(() => {
      setAssessmentTimer(prev => {
        if (prev <= 1) {
          clearInterval(iv)
          toast.error('زمان آزمون به پایان رسید!')
          if (autoSaveRef.current) clearInterval(autoSaveRef.current)
          setAssessmentStarted(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [assessmentStarted, assessmentTimer])

  const submitAssessment = async () => {
    if (!activeAssessment) return
    if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    try {
      const res = await fetch(`/api/v1/portal/assessments/${activeAssessment.id}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: assessmentAnswers }),
      })
      if (res.ok) {
        toast.success('آزمون ارسال شد')
        setAssessmentStarted(false); setActiveAssessment(null); fetchAssessments()
      } else toast.error('خطا در ارسال آزمون')
    } catch { toast.error('خطا در ارتباط') }
  }

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60
    return `${toPN(m.toString().padStart(2, '0'))}:${toPN(sec.toString().padStart(2, '0'))}`
  }

  // ─── Offer Handlers ───
  const respondOffer = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/portal/offers/${id}/respond`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) { toast.success(status === 'accepted' ? 'پیشنهاد پذیرفته شد' : 'پیشنهاد رد شد'); setOfferDialogOpen(false); fetchOffers() }
      else toast.error('خطا در ثبت پاسخ')
    } catch { toast.error('خطا در ارتباط') }
  }

  // ─── Mark Notification ───
  const markNotifRead = async (id: string) => {
    try {
      await fetch(`/api/v1/portal/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch { /* silent */ }
  }

  // ─── Filtered Jobs ───
  const filteredJobs = jobs.filter(j => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      if (!j.title.toLowerCase().includes(s) && !(j.department?.name || '').toLowerCase().includes(s)) return false
    }
    if (filterType !== 'all' && j.employmentType !== filterType) return false
    if (filterLocation === 'remote' && !j.remoteWork) return false
    if (filterLocation === 'onsite' && j.remoteWork) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  // ─── Render ───
  return (
    <div dir="rtl" style={RTL_STYLE} className="min-h-screen bg-gray-50">
      {/* ═══ Floating Public Link Badge ═══ */}
      <div className="fixed bottom-4 left-4 z-[60]">
        <a
          href="http://localhost:3000/careers"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/80 backdrop-blur-sm text-white rounded-xl text-xs hover:bg-gray-900 transition-all shadow-lg group"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">لینک انتشار:</span>
          <span className="font-mono text-emerald-400 group-hover:text-emerald-300 transition-colors" dir="ltr">localhost:3000/careers</span>
          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
        </a>
      </div>

      {/* ═══ NAVBAR ═══ */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 cursor-pointer" onClick={() => setView('home')}>
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800 hidden sm:block">سایت استخدام</h1>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setView('jobs')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'jobs' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              آگهی‌ها
            </button>

            {user ? (
              <>
                <button onClick={() => setView('dashboard')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <User className="w-4 h-4 inline ml-1" /> پنل من
                </button>
                <button onClick={() => { fetchNotifications(); setNotifDialogOpen(true) }} className="relative p-2 rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && <span className="absolute -top-0.5 -left-0.5 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">{toPN(unreadCount)}</span>}
                </button>
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={() => { setAuthMode('login'); setAuthStep('form'); setView('auth') }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                <LogIn className="w-4 h-4 inline ml-1" /> ورود / ثبت‌نام
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* HOME */}
        {view === 'home' && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="bg-gradient-to-bl from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-8 sm:p-12 text-white text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">فرصت‌های شغلی ما را کشف کنید</h2>
              <p className="text-emerald-100 mb-8 max-w-xl mx-auto">به تیم ما بپیوندید و در مسیر رشد حرفه‌ای خود گام بردارید</p>
              <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="جستجوی عنوان شغل یا شهر..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-3 rounded-xl border-0 text-gray-800 text-sm focus:ring-2 focus:ring-emerald-400" />
                </div>
                <button onClick={() => setView('jobs')} className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
                  جستجو
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'موقعیت فعال', value: jobs.length, icon: Briefcase, color: 'from-emerald-500 to-teal-500' },
                { label: 'درخواست ثبت شده', value: jobs.reduce((s, j) => s + j.applications, 0), icon: Users, color: 'from-blue-500 to-indigo-500' },
                { label: 'استخدام موفق', value: 12, icon: CheckCircle, color: 'from-purple-500 to-fuchsia-500' },
                { label: 'بازدید کل', value: jobs.reduce((s, j) => s + j.views, 0), icon: Eye, color: 'from-amber-500 to-orange-500' },
              ].map((s, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${s.color} text-white shadow-md`}><s.icon className="w-5 h-5" /></div>
                    <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-800">{toPN(s.value)}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Jobs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-600" /> آخرین آگهی‌ها</h3>
                <button onClick={() => setView('jobs')} className="text-emerald-600 text-sm font-medium hover:underline">مشاهده همه ←</button>
              </div>
              <div className="grid gap-4">
                {safe(jobs).slice(0, 6).map(job => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-row-reverse items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-bold text-gray-800">{job.title}</h4>
                            <Badge className="bg-gray-100 text-gray-600">{empTypeLabel(job.employmentType)}</Badge>
                            {job.remoteWork && <Badge className="bg-emerald-100 text-emerald-700">دورکاری</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.department?.name || '—'}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location || '—'}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fDate(job.createdAt)}</span>
                          </div>
                        </div>
                        <button onClick={() => { setSelectedJob(job); setView('job-detail') }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 whitespace-nowrap">
                          مشاهده جزئیات
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {jobs.length === 0 && <Card><CardContent className="py-12 text-center text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>آگهی فعالی وجود ندارد</p></CardContent></Card>}
              </div>
            </div>
          </div>
        )}

        {/* JOBS LISTING */}
        {view === 'jobs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">آگهی‌های شغلی</h2>
            {/* Filters */}
            <Card>
              <CardContent className="p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="جستجوی عنوان شغل..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                  <option value="all">همه انواع</option>
                  <option value="full-time">تمام وقت</option>
                  <option value="part-time">پاره وقت</option>
                  <option value="contract">قراردادی</option>
                  <option value="internship">کارآموزی</option>
                </select>
                <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                  <option value="all">همه محل‌ها</option>
                  <option value="onsite">حضوری</option>
                  <option value="remote">دورکاری</option>
                </select>
              </CardContent>
            </Card>
            {/* Job Cards */}
            <div className="grid gap-4">
              {filteredJobs.map(job => (
                <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedJob(job); setView('job-detail') }}>
                  <CardContent className="p-5">
                    <div className="flex flex-row-reverse items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                          <Badge className="bg-gray-100 text-gray-600">{empTypeLabel(job.employmentType)}</Badge>
                          {job.remoteWork && <Badge className="bg-emerald-100 text-emerald-700">دورکاری</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.department?.name || '—'}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location || '—'}</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.salaryMin > 0 ? `${toPN(job.salaryMin / 1000000)}-${toPN(job.salaryMax / 1000000)} میلیون` : 'توافقی'}</span>
                          <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{job.educationLevel || 'بدون محدودیت'}</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{toPN(job.applications)} متقاضی</span>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        {job.deadline && <p className="text-xs text-gray-400 mb-2">مهلت: {fDate(job.deadline)}</p>}
                        <button onClick={e => { e.stopPropagation(); if (!user) { setView('auth') } else { setSelectedJob(job); setView('job-detail') } }} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
                          ارسال درخواست
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredJobs.length === 0 && <Card><CardContent className="py-12 text-center text-gray-400">نتیجه‌ای یافت نشد</CardContent></Card>}
            </div>
          </div>
        )}

        {/* JOB DETAIL */}
        {view === 'job-detail' && selectedJob && (
          <div className="space-y-6">
            <button onClick={() => setView('jobs')} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 text-sm"><ArrowLeft className="w-4 h-4" /> بازگشت به لیست</button>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedJob.title}</h2>
                  <Badge className="bg-gray-100 text-gray-600">{empTypeLabel(selectedJob.employmentType)}</Badge>
                  {selectedJob.remoteWork && <Badge className="bg-emerald-100 text-emerald-700">دورکاری</Badge>}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{selectedJob.department?.name}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedJob.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{fDate(selectedJob.createdAt)}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{selectedJob.salaryMin > 0 ? `${toPN(selectedJob.salaryMin / 1000000)}-${toPN(selectedJob.salaryMax / 1000000)} میلیون تومان` : 'توافقی'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div><h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600" /> شرح شغل</h3><p className="text-gray-600 text-sm leading-7 whitespace-pre-line">{selectedJob.description}</p></div>
                <div><h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> شرایط احراز</h3><p className="text-gray-600 text-sm leading-7 whitespace-pre-line">{selectedJob.requirements}</p></div>
                {selectedJob.responsibilities && <div><h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" /> مسئولیت‌ها</h3><p className="text-gray-600 text-sm leading-7 whitespace-pre-line">{selectedJob.responsibilities}</p></div>}
                {selectedJob.benefits && <div><h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Award className="w-4 h-4 text-purple-500" /> مزایا</h3><p className="text-gray-600 text-sm leading-7 whitespace-pre-line">{selectedJob.benefits}</p></div>}
                <Separator />
                <div className="flex items-center justify-between">
                  {selectedJob.deadline && <span className="text-sm text-amber-600 flex items-center gap-1"><Timer className="w-4 h-4" /> مهلت ارسال: {fDate(selectedJob.deadline)}</span>}
                  <button onClick={() => { if (!user) { setAuthMode('login'); setAuthStep('form'); setView('auth') } else { toast.success('درخواست شما ثبت شد'); setView('dashboard') } }} className="px-8 py-3 bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 shadow-lg">
                    ارسال درخواست
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AUTH */}
        {view === 'auth' && !user && (
          <div className="max-w-md mx-auto space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25"><Shield className="w-8 h-8 text-white" /></div>
                <CardTitle>{authStep === 'otp' ? 'تأیید هویت' : authMode === 'register' ? 'ثبت‌نام' : 'ورود'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {authStep === 'form' && (
                  <>
                    <div className="flex rounded-xl bg-gray-100 p-1">
                      <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMode === 'login' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>ورود</button>
                      <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMode === 'register' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>ثبت‌نام</button>
                    </div>
                    {authMode === 'register' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label className="text-xs text-gray-500 mb-1 block">نام</Label><Input value={authForm.first_name} onChange={e => setAuthForm({ ...authForm, first_name: e.target.value })} placeholder="نام" /></div>
                          <div><Label className="text-xs text-gray-500 mb-1 block">نام خانوادگی</Label><Input value={authForm.last_name} onChange={e => setAuthForm({ ...authForm, last_name: e.target.value })} placeholder="نام خانوادگی" /></div>
                        </div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">شماره موبایل</Label><Input value={authForm.phone} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} placeholder="09xxxxxxxxx" dir="ltr" className="text-left" /></div>
                      </>
                    )}
                    <div><Label className="text-xs text-gray-500 mb-1 block">ایمیل</Label><Input type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} placeholder="example@email.com" dir="ltr" className="text-left" /></div>
                    <div><Label className="text-xs text-gray-500 mb-1 block">رمز عبور</Label><Input type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} placeholder="حداقل ۸ کاراکتر" /></div>
                    <Button onClick={authMode === 'register' ? handleRegister : handleLogin} disabled={authLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : authMode === 'register' ? 'ثبت‌نام و دریافت کد تأیید' : 'ورود'}
                    </Button>
                  </>
                )}
                {authStep === 'otp' && (
                  <>
                    <div className="text-center text-sm text-gray-500 mb-4">
                      کد تأیید ۶ رقمی به <span className="font-bold text-gray-700">{authForm.phone || authForm.email}</span> ارسال شد
                    </div>
                    <div className="flex gap-2 justify-center" dir="ltr">
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <input key={i} type="text" maxLength={1} value={otpCode[i] || ''} onChange={e => {
                          const v = otpCode.split(''); v[i] = e.target.value.slice(-1); setOtpCode(v.join(''))
                          if (e.target.value && i < 5) { const next = e.target.nextElementSibling as HTMLInputElement; next?.focus() }
                        }} className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400" />
                      ))}
                    </div>
                    <Button onClick={handleVerifyOtp} disabled={authLoading || otpCode.length < 6} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4">
                      {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تأیید و ورود'}
                    </Button>
                    <p className="text-center text-sm text-gray-500">
                      {otpTimer > 0 ? `ارسال مجدد تا ${formatTimer(otpTimer)}` : (
                        <button onClick={startOtpTimer} className="text-emerald-600 font-medium">ارسال مجدد کد</button>
                      )}
                    </p>
                    <button onClick={() => setAuthStep('form')} className="w-full text-center text-sm text-gray-500 hover:text-gray-700">بازگشت</button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* APPLICANT DASHBOARD */}
        {view === 'dashboard' && user && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-emerald-500/20"><AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">{user.personal?.first_name?.[0] || '?'}</AvatarFallback></Avatar>
                <div><h2 className="text-xl font-bold text-gray-800">سلام {user.personal?.first_name}!</h2><p className="text-sm text-gray-500">خوش آمدید به پنل متقاضی</p></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'کل درخواست‌ها', value: applications.length, icon: FileCheck, color: 'text-blue-600 bg-blue-50' },
                { label: 'در حال بررسی', value: applications.filter(a => !['hired', 'rejected', 'withdrawn'].includes(a.status)).length, icon: Timer, color: 'text-amber-600 bg-amber-50' },
                { label: 'آزمون فعال', value: assessments.filter(a => a.status === 'pending' || a.status === 'in_progress').length, icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
                { label: 'پیشنهاد شغلی', value: offers.filter(o => o.status === 'pending').length, icon: Award, color: 'text-emerald-600 bg-emerald-50' },
              ].map((s, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
                    <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold">{toPN(s.value)}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'پروفایل من', icon: User, v: 'profile' },
                { label: 'درخواست‌های من', icon: FileText, v: 'my-applications' },
                { label: 'آزمون‌ها', icon: BookOpen, v: 'my-assessments' },
                { label: 'پیشنهادات شغلی', icon: Award, v: 'my-offers' },
              ].map(l => (
                <button key={l.v} onClick={() => setView(l.v)} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all flex items-center gap-3">
                  <l.icon className="w-5 h-5 text-emerald-600" /><span className="text-sm font-medium text-gray-700">{l.label}</span>
                </button>
              ))}
            </div>

            {/* Recent Applications */}
            <Card>
              <CardHeader><CardTitle className="text-lg">آخرین درخواست‌ها</CardTitle></CardHeader>
              <CardContent>
                {safe(applications).length === 0 ? <p className="text-center text-gray-400 py-8">درخواستی ثبت نشده</p> : (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map(app => (
                      <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${statusColor(app.status)}`} />
                          <div><p className="text-sm font-medium">{app.job?.title}</p><p className="text-xs text-gray-400">{fDate(app.submitted_at)}</p></div>
                        </div>
                        <Badge className={`${statusColor(app.status)} text-white border-0 text-xs`}>{statusLabel(app.status)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* PROFILE */}
        {view === 'profile' && user && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold text-gray-800">پروفایل من</h2>
            </div>
            <Tabs defaultValue="personal" dir="rtl">
              <TabsList className="w-full flex flex-wrap gap-1 bg-gray-100 p-1 h-auto" dir="rtl">
                {[
                  { v: 'personal', l: 'اطلاعات شخصی', i: User },
                  { v: 'education', l: 'تحصیلات', i: GraduationCap },
                  { v: 'work', l: 'سوابق شغلی', i: Briefcase },
                  { v: 'skills', l: 'مهارت‌ها و زبان‌ها', i: Star },
                  { v: 'docs', l: 'مدارک و لینک‌ها', i: FileText },
                  { v: 'alerts', l: 'هشدار شغلی', i: Bell },
                ].map(t => (
                  <TabsTrigger key={t.v} value={t.v} className="flex-1 min-w-[100px]"><t.i className="w-4 h-4 ml-1 hidden sm:inline-block" />{t.l}</TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="personal" className="mt-4">
                <Card><CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-xs text-gray-500 mb-1 block">نام</Label><Input value={profileForm.first_name} onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })} /></div>
                    <div><Label className="text-xs text-gray-500 mb-1 block">نام خانوادگی</Label><Input value={profileForm.last_name} onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })} /></div>
                    <div><Label className="text-xs text-gray-500 mb-1 block">کد ملی</Label><Input value={profileForm.national_id} onChange={e => setProfileForm({ ...profileForm, national_id: e.target.value })} dir="ltr" /></div>
                    <div><Label className="text-xs text-gray-500 mb-1 block">تاریخ تولد</Label><Input type="date" value={profileForm.birth_date} onChange={e => setProfileForm({ ...profileForm, birth_date: e.target.value })} /></div>
                    <div><Label className="text-xs text-gray-500 mb-1 block">جنسیت</Label><select value={profileForm.gender} onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"><option value="">انتخاب</option><option value="male">مرد</option><option value="female">زن</option></select></div>
                    <div><Label className="text-xs text-gray-500 mb-1 block">وضعیت تأهل</Label><select value={profileForm.marital_status} onChange={e => setProfileForm({ ...profileForm, marital_status: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"><option value="">انتخاب</option><option value="single">مجرد</option><option value="married">متأهل</option></select></div>
                    <div><Label className="text-xs text-gray-500 mb-1 block">وضعیت نظام وظیفه</Label><select value={profileForm.military_status} onChange={e => setProfileForm({ ...profileForm, military_status: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"><option value="">انتخاب</option><option value="completed">پایان خدمت</option><option value="exempted">معاف</option><option value="student">مشغول تحصیل</option></select></div>
                    <div><Label className="text-xs text-gray-500 mb-1 block">شهر</Label><Input value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} /></div>
                    <div className="md:col-span-2"><Label className="text-xs text-gray-500 mb-1 block">آدرس</Label><Input value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} /></div>
                  </div>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="education" className="mt-4">
                <Card><CardContent className="p-6 space-y-4">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="p-4 border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">تحصیلات {toPN(idx + 1)}</h4>
                        {educationList.length > 1 && <button onClick={() => setEducationList(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div><Label className="text-xs text-gray-500 mb-1 block">مقطع</Label><select value={edu.degree} onChange={e => { const l = [...educationList]; l[idx] = { ...l[idx], degree: e.target.value }; setEducationList(l) }} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"><option value="">انتخاب</option><option value="diploma">دیپلم</option><option value="associate">کاردانی</option><option value="bachelor">کارشناسی</option><option value="master">ارشد</option><option value="phd">دکتری</option></select></div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">رشته</Label><Input value={edu.field} onChange={e => { const l = [...educationList]; l[idx] = { ...l[idx], field: e.target.value }; setEducationList(l) }} /></div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">دانشگاه</Label><Input value={edu.university} onChange={e => { const l = [...educationList]; l[idx] = { ...l[idx], university: e.target.value }; setEducationList(l) }} /></div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">سال ورود</Label><Input type="number" value={edu.start_year} onChange={e => { const l = [...educationList]; l[idx] = { ...l[idx], start_year: parseInt(e.target.value) || 0 }; setEducationList(l) }} dir="ltr" /></div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">سال فارغ‌التحصیلی</Label><Input type="number" value={edu.end_year || ''} onChange={e => { const l = [...educationList]; l[idx] = { ...l[idx], end_year: e.target.value ? parseInt(e.target.value) : null }; setEducationList(l) }} dir="ltr" /></div>
                        <label className="flex items-center gap-2 pt-6"><input type="checkbox" checked={edu.is_studying} onChange={e => { const l = [...educationList]; l[idx] = { ...l[idx], is_studying: e.target.checked }; setEducationList(l) }} /><span className="text-sm">مشغول تحصیل</span></label>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setEducationList(prev => [...prev, { degree: '', field: '', university: '', start_year: 1400, end_year: null, is_studying: false }])} className="flex items-center gap-2 text-emerald-600 text-sm font-medium hover:underline"><Plus className="w-4 h-4" /> افزودن تحصیلات</button>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="work" className="mt-4">
                <Card><CardContent className="p-6 space-y-4">
                  {workList.map((w, idx) => (
                    <div key={idx} className="p-4 border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">سابقه {toPN(idx + 1)}</h4>
                        {workList.length > 1 && <button onClick={() => setWorkList(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><Label className="text-xs text-gray-500 mb-1 block">شرکت</Label><Input value={w.company} onChange={e => { const l = [...workList]; l[idx] = { ...l[idx], company: e.target.value }; setWorkList(l) }} /></div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">سمت</Label><Input value={w.position} onChange={e => { const l = [...workList]; l[idx] = { ...l[idx], position: e.target.value }; setWorkList(l) }} /></div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">تاریخ شروع</Label><Input type="date" value={w.start_date} onChange={e => { const l = [...workList]; l[idx] = { ...l[idx], start_date: e.target.value }; setWorkList(l) }} /></div>
                        <div><Label className="text-xs text-gray-500 mb-1 block">تاریخ پایان</Label><Input type="date" value={w.end_date || ''} onChange={e => { const l = [...workList]; l[idx] = { ...l[idx], end_date: e.target.value || null }; setWorkList(l) }} /></div>
                        <label className="flex items-center gap-2 pt-6"><input type="checkbox" checked={w.is_current} onChange={e => { const l = [...workList]; l[idx] = { ...l[idx], is_current: e.target.checked }; setWorkList(l) }} /><span className="text-sm">شغل فعلی</span></label>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setWorkList(prev => [...prev, { company: '', position: '', start_date: '', end_date: null, is_current: false, salary: 0, reason_for_leaving: '', description: '' }])} className="flex items-center gap-2 text-emerald-600 text-sm font-medium hover:underline"><Plus className="w-4 h-4" /> افزودن سابقه</button>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="skills" className="mt-4">
                <Card><CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">مهارت‌ها</h4>
                    <div className="flex gap-2 mb-3">
                      <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="نام مهارت" className="flex-1" />
                      <select value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white w-32">
                        <option value="beginner">مبتدی</option><option value="intermediate">متوسط</option><option value="advanced">پیشرفته</option><option value="expert">حرفه‌ای</option>
                      </select>
                      <Button onClick={() => { if (newSkill.trim()) { setSkillList(prev => [...prev, { name: newSkill.trim(), level: newSkillLevel }]); setNewSkill('') } }} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillList.map((s, i) => <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm">{s.name} ({statusLabel(s.level)})<button onClick={() => setSkillList(prev => prev.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button></span>)}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">زبان‌ها</h4>
                    <div className="flex gap-2 mb-3">
                      <Input value={newLang} onChange={e => setNewLang(e.target.value)} placeholder="نام زبان" className="flex-1" />
                      <select value={newLangLevel} onChange={e => setNewLangLevel(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white w-32">
                        <option value="elementary">مبتدی</option><option value="intermediate">متوسط</option><option value="advanced">پیشرفته</option><option value="native">زبان مادری</option>
                      </select>
                      <Button onClick={() => { if (newLang.trim()) { setLangList(prev => [...prev, { name: newLang.trim(), level: newLangLevel }]); setNewLang('') } }} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {langList.map((l, i) => <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">{l.name} ({statusLabel(l.level)})<button onClick={() => setLangList(prev => prev.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button></span>)}
                    </div>
                  </div>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="docs" className="mt-4">
                <Card><CardContent className="p-6 space-y-4">
                  <div><Label className="text-xs text-gray-500 mb-1 block">لینکدین</Label><Input value={profileForm.linkedin_url} onChange={e => setProfileForm({ ...profileForm, linkedin_url: e.target.value })} dir="ltr" placeholder="https://linkedin.com/in/..." /></div>
                  <div><Label className="text-xs text-gray-500 mb-1 block">نمونه‌کار</Label><Input value={profileForm.portfolio_url} onChange={e => setProfileForm({ ...profileForm, portfolio_url: e.target.value })} dir="ltr" placeholder="https://..." /></div>
                  <div><Label className="text-xs text-gray-500 mb-1 block">رزومه (فایل)</Label><div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"><Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-500">فایل رزومه را اینجا بکشید یا کلیک کنید</p><p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — حداکثر ۵ مگابایت</p></div></div>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="alerts" className="mt-4">
                <Card><CardContent className="p-6 space-y-4">
                  <label className="flex items-center justify-between p-3 rounded-xl border"><span className="text-sm font-medium text-gray-700">فعال‌سازی هشدار شغلی</span><input type="checkbox" checked={profileForm.job_alert_enabled} onChange={e => setProfileForm({ ...profileForm, job_alert_enabled: e.target.checked })} /></label>
                  <div><Label className="text-xs text-gray-500 mb-1 block">کلمات کلیدی (با کاما جدا کنید)</Label><Input value={profileForm.alert_keywords} onChange={e => setProfileForm({ ...profileForm, alert_keywords: e.target.value })} placeholder="مثال: react, next.js, توسعه وب" /></div>
                  <div><Label className="text-xs text-gray-500 mb-1 block">نوع همکاری مورد نظر</Label><Input value={profileForm.alert_types} onChange={e => setProfileForm({ ...profileForm, alert_types: e.target.value })} placeholder="تمام وقت، پاره وقت، دورکاری" /></div>
                  <div><Label className="text-xs text-gray-500 mb-1 block">شهرهای مورد نظر</Label><Input value={profileForm.alert_cities} onChange={e => setProfileForm({ ...profileForm, alert_cities: e.target.value })} placeholder="تهران، اصفهان، شیراز" /></div>
                </CardContent></Card>
              </TabsContent>
            </Tabs>

            <Button onClick={async () => {
              setProfileSaving(true)
              try {
                const res = await fetch('/api/v1/portal/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personal: profileForm, education: educationList, work_experience: workList, skills: skillList, languages: langList }) })
                if (res.ok) { toast.success('پروفایل ذخیره شد') } else { toast.error('خطا در ذخیره') }
              } catch { toast.error('خطا در ارتباط') }
              setProfileSaving(false)
            }} disabled={profileSaving} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4">
              {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ذخیره پروفایل'}
            </Button>
          </div>
        )}

        {/* MY APPLICATIONS */}
        {view === 'my-applications' && user && (
          <div className="space-y-6">
            <div className="flex items-center gap-3"><button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button><h2 className="text-xl font-bold text-gray-800">درخواست‌های من</h2></div>
            {safe(applications).length === 0 ? <Card><CardContent className="py-12 text-center text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>درخواستی ثبت نشده است</p></CardContent></Card> : (
              <div className="space-y-4">
                {applications.map(app => (
                  <Card key={app.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-row-reverse items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{app.job?.title || 'بدون عنوان'}</h3>
                          <p className="text-sm text-gray-500">{app.job?.department?.name} • {fDate(app.submitted_at)}</p>
                        </div>
                        <Badge className={`${statusColor(app.status)} text-white border-0`}>{statusLabel(app.status)}</Badge>
                      </div>
                      {/* Timeline */}
                      <div className="border-r-2 border-gray-200 pr-4 mr-2 space-y-4">
                        <div className="relative flex items-start gap-3">
                          <div className="absolute -right-[21px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                          <div><p className="text-sm font-medium text-gray-700">ثبت درخواست</p><p className="text-xs text-gray-400">{fDate(app.submitted_at)}</p></div>
                        </div>
                        {app.last_updated && app.last_updated !== app.submitted_at && (
                          <div className="relative flex items-start gap-3">
                            <div className="absolute -right-[21px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
                            <div><p className="text-sm font-medium text-gray-700">{statusLabel(app.status)}</p><p className="text-xs text-gray-400">{fDate(app.last_updated)}</p></div>
                          </div>
                        )}
                      </div>
                      {app.status_message && <p className="text-sm text-gray-500 mt-3 bg-gray-50 p-3 rounded-lg">{app.status_message}</p>}
                      {!['hired', 'rejected', 'withdrawn'].includes(app.status) && (
                        <button onClick={async () => { try { await fetch(`/api/v1/portal/applications/${app.id}/withdraw`, { method: 'PATCH' }); toast.success('درخواست انصراف داده شد'); fetchApplications() } catch { toast.error('خطا') } }} className="mt-3 text-red-500 text-sm hover:underline">انصراف از درخواست</button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY ASSESSMENTS */}
        {view === 'my-assessments' && user && !assessmentStarted && (
          <div className="space-y-6">
            <div className="flex items-center gap-3"><button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button><h2 className="text-xl font-bold text-gray-800">آزمون‌های من</h2></div>
            {safe(assessments).length === 0 ? <Card><CardContent className="py-12 text-center text-gray-400"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>آزمونی تعیین نشده</p></CardContent></Card> : (
              <div className="grid gap-4">
                {assessments.map(a => (
                  <Card key={a.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-row-reverse items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{a.title}</h3>
                          <p className="text-sm text-gray-500">{toPN(a.duration_minutes)} دقیقه • نمره قبولی: {toPN(a.pass_score)}</p>
                          <p className="text-xs text-gray-400 mt-1">مهلت: {fDate(a.deadline)}</p>
                        </div>
                        <div className="text-left flex flex-col items-end gap-2">
                          <Badge className={`${statusColor(a.result || a.status)} text-white border-0`}>{statusLabel(a.result || a.status)}</Badge>
                          {a.score !== null && a.score !== undefined && <span className="text-sm font-bold text-gray-700">نمره: {toPN(a.score)}</span>}
                          {(a.status === 'pending' || a.status === 'assigned') && (
                            <Button onClick={() => startAssessment(a)} className="bg-emerald-600 hover:bg-emerald-700 text-sm">شروع آزمون</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ASSESSMENT IN PROGRESS */}
        {assessmentStarted && activeAssessment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => { setAssessmentStarted(false); setActiveAssessment(null); if (autoSaveRef.current) clearInterval(autoSaveRef.current) }} className="flex items-center gap-2 text-red-500 text-sm"><X className="w-4 h-4" /> خروج از آزمون</button>
              <div className="flex items-center gap-3">
                <Badge className={`${assessmentTimer < 300 ? 'bg-red-500' : 'bg-blue-500'} text-white border-0`}>
                  <Timer className="w-3 h-3 ml-1" /> {formatTimer(assessmentTimer)}
                </Badge>
                <span className="text-sm text-gray-500">سؤال {toPN(currentQuestion + 1)} از {toPN(safe(activeAssessment.questions).length)}</span>
              </div>
            </div>
            {/* Progress */}
            <div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / safe(activeAssessment.questions).length) * 100}%` }} /></div>
            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2">
              {safe(activeAssessment.questions).map((q, i) => (
                <button key={q.id} onClick={() => setCurrentQuestion(i)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${i === currentQuestion ? 'bg-emerald-600 text-white' : assessmentAnswers[q.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{toPN(i + 1)}</button>
              ))}
            </div>
            {/* Question */}
            {safe(activeAssessment.questions).map((q, i) => i === currentQuestion && (
              <Card key={q.id}>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-gray-800">{q.text}</h3>
                  {q.type === 'single_choice' && safe(q.options).map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${assessmentAnswers[q.id] === opt ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name={q.id} checked={assessmentAnswers[q.id] === opt} onChange={() => setAssessmentAnswers({ ...assessmentAnswers, [q.id]: opt })} className="accent-emerald-600" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                  {q.type === 'multi_choice' && safe(q.options).map((opt, oi) => {
                    const current = (assessmentAnswers[q.id] as string[]) || []
                    return (
                      <label key={oi} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${current.includes(opt) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={current.includes(opt)} onChange={() => {
                          const updated = current.includes(opt) ? current.filter(x => x !== opt) : [...current, opt]
                          setAssessmentAnswers({ ...assessmentAnswers, [q.id]: updated })
                        }} className="accent-emerald-600" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    )
                  })}
                  {q.type === 'text' && <Textarea value={(assessmentAnswers[q.id] as string) || ''} onChange={e => setAssessmentAnswers({ ...assessmentAnswers, [q.id]: e.target.value })} rows={4} placeholder="پاسخ خود را بنویسید..." />}
                  {q.type === 'file' && <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400"><Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-500">آپلود فایل</p></div>}
                </CardContent>
              </Card>
            ))}
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} variant="outline">سؤال قبلی</Button>
              {currentQuestion < safe(activeAssessment.questions).length - 1 ? (
                <Button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="bg-emerald-600 hover:bg-emerald-700">سؤال بعدی</Button>
              ) : (
                <Button onClick={submitAssessment} className="bg-emerald-600 hover:bg-emerald-700">ثبت آزمون</Button>
              )}
            </div>
          </div>
        )}

        {/* MY OFFERS */}
        {view === 'my-offers' && user && (
          <div className="space-y-6">
            <div className="flex items-center gap-3"><button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button><h2 className="text-xl font-bold text-gray-800">پیشنهادات شغلی</h2></div>
            {safe(offers).length === 0 ? <Card><CardContent className="py-12 text-center text-gray-400"><Award className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>پیشنهاد شغلی موجود نیست</p></CardContent></Card> : (
              <div className="grid gap-4">
                {offers.map(o => (
                  <Card key={o.id} className="border-2 border-emerald-200 bg-gradient-to-bl from-emerald-50/50 to-white">
                    <CardContent className="p-5">
                      <div className="flex flex-row-reverse items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <h3 className="font-bold text-gray-800">{o.job?.title}</h3>
                          <p className="text-sm text-gray-500">{o.job?.department?.name}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-gray-400">نوع همکاری:</span> <span className="font-medium">{empTypeLabel(o.employment_type)}</span></div>
                            <div><span className="text-gray-400">مکان:</span> <span className="font-medium">{o.work_location === 'remote' ? 'دورکار' : o.work_location === 'onsite' ? 'حضوری' : 'ترکیبی'}</span></div>
                            {o.base_salary && <div><span className="text-gray-400">حقوق پایه:</span> <span className="font-bold text-emerald-700">{toPN(o.base_salary.toLocaleString())} ریال</span></div>}
                            {o.start_date && <div><span className="text-gray-400">تاریخ شروع:</span> <span className="font-medium">{fDate(o.start_date)}</span></div>}
                            {o.offer_expiry_date && <div><span className="text-gray-400">مهلت پاسخ:</span> <span className="font-medium">{fDate(o.offer_expiry_date)}</span></div>}
                          </div>
                        </div>
                        <Badge className={`${statusColor(o.status)} text-white border-0`}>{statusLabel(o.status)}</Badge>
                      </div>
                      {o.status === 'pending' && (
                        <div className="flex gap-3 mt-4 pt-4 border-t">
                          <Button onClick={() => respondOffer(o.id, 'accepted')} className="flex-1 bg-emerald-600 hover:bg-emerald-700">✓ قبول پیشنهاد</Button>
                          <Button onClick={() => respondOffer(o.id, 'declined')} variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50">✗ رد پیشنهاد</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══ NOTIFICATIONS DIALOG ═══ */}
      <Dialog open={notifDialogOpen} onOpenChange={setNotifDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl" style={RTL_STYLE}>
          <DialogHeader><DialogTitle>اعلان‌ها</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 p-1">
              {safe(notifications).length === 0 ? <p className="text-center text-gray-400 py-8">اعلانی وجود ندارد</p> : safe(notifications).map(n => {
                const Icon = notifIcon(n.type)
                return (
                  <div key={n.id} onClick={() => markNotifRead(n.id)} className={`p-3 rounded-xl border cursor-pointer transition-colors ${n.is_read ? 'bg-white border-gray-100' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className={`p-2 rounded-lg ${n.is_read ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-600'}`}><Icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'font-bold text-gray-800'}`}>{n.title}</p>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{fRelativeTime(n.sent_at)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.body}</p>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════

export function CareersSite() {
  return (
    <Suspense fallback={<div dir="rtl" style={RTL_STYLE} className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>}>
      <CareersContent />
    </Suspense>
  )
}
