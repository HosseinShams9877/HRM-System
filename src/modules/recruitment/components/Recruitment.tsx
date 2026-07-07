'use client'

import { useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Badge } from '@/core/components/ui/badge'
import { Textarea } from '@/core/components/ui/textarea'
import { Progress } from '@/core/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import { Switch } from '@/core/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { Separator } from '@/core/components/ui/separator'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { PersianDatePicker } from '@/core/components/ui/persian-date-picker'
import {
  Plus,
  Briefcase,
  Users,
  User,
  Calendar,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Star,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building2,
  Video,
  MessageSquare,
  BarChart3,
  Send,
  UserPlus,
  CalendarDays,
  Target,
  Award,
  ClipboardCheck,
  ChevronRight,
  Edit,
  Trash2,
  ExternalLink,
  Download,
  UserCog,
  Sparkles,
  FilterX,
  MoreHorizontal,
  Globe,
  PieChart,
  Activity,
  ArrowRight,
  RefreshCw,
  Play,
  Pause,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  nationalId?: string
  birthDate?: string
  gender?: string
  address?: string
  city?: string
  experienceYears: number
  educationLevel?: string
  educationField?: string
  university?: string
  currentCompany?: string
  currentPosition?: string
  skills?: string
  languages?: string
  source: string
  status: string
  rating: number
  notes?: string
  tags?: string
  resumeUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  createdAt: string
  jobApplications?: JobApplication[]
  _count?: { jobApplications: number; interviews: number }
}

interface JobPosting {
  id: string
  title: string
  departmentId: string
  department?: { name: string }
  description: string
  requirements: string
  responsibilities?: string
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
  status: string
  publishDate?: string
  deadline?: string
  views: number
  applications: number
  createdAt: string
}

interface JobApplication {
  id: string
  jobId: string
  candidateId: string
  candidate?: Candidate
  job?: JobPosting
  coverLetter?: string
  expectedSalary?: number
  status: string
  currentStage: string
  matchScore: number
  screeningScore: number
  appliedAt: string
  rejectionReason?: string
  offeredSalary?: number
  interviews?: Interview[]
  evaluations?: ApplicationEvaluation[]
}

interface Interview {
  id: string
  applicationId: string
  candidateId: string
  jobId: string
  candidate?: Candidate
  job?: JobPosting
  type: string
  round: number
  scheduledAt: string
  duration: number
  location?: string
  meetingLink?: string
  status: string
  result?: string
  notes?: string
  reminderSent: boolean
  evaluations?: InterviewEvaluation[]
}

interface InterviewEvaluation {
  id: string
  interviewId: string
  technicalSkills: number
  communication: number
  problemSolving: number
  cultureFit: number
  motivation: number
  experience: number
  overallScore: number
  recommendation?: string
  strengths?: string
  weaknesses?: string
  comments?: string
  evaluatedAt: string
}

interface ApplicationEvaluation {
  id: string
  applicationId: string
  resumeScore: number
  experienceMatch: number
  educationMatch: number
  skillsMatch: number
  comments?: string
  recommendation?: string
  evaluatedAt: string
}

interface Assessment {
  id: string
  applicationId: string
  type: string
  title: string
  score?: number | null
  passScore: number
  deadline?: string | null
  status: string
  result?: string | null
  notes?: string | null
  assignedAt: string
  application?: {
    candidate?: { firstName: string; lastName: string; email: string; phone: string; photoUrl?: string }
    job?: { title: string; department?: { name: string } }
  }
}

interface JobOffer {
  id: string
  applicationId: string
  status: string
  employmentType: string
  baseSalary?: number | null
  startDate?: string | null
  workLocation?: string | null
  offerExpiryDate?: string | null
  createdAt: string
  application?: {
    candidate?: {
      firstName: string; lastName: string; email: string; phone: string; photoUrl?: string
      experienceYears?: number; educationLevel?: string; currentCompany?: string; currentPosition?: string
    }
    job?: { title: string; department?: { name: string } }
  }
}

interface Department {
  id: string
  name: string
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)])
}

const formatDate = (date: string | Date): string => {
  try {
    return new Date(date).toLocaleDateString('fa-IR')
  } catch {
    return '—'
  }
}

const formatDateTime = (date: string | Date): string => {
  try {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

const formatCurrency = (amount: number): string => {
  return toPersianNumber(amount.toLocaleString('en-US')) + ' ریال'
}

const safeArray = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data) {
    const d = (data as { data: unknown }).data
    return Array.isArray(d) ? d : []
  }
  return []
}

const getSourceLabel = (source: string): string => {
  const sources: Record<string, string> = {
    website: 'وب‌سایت',
    referral: 'معرفی',
    job_site: 'سایت کاریابی',
    linkedin: 'لینکدین',
    other: 'سایر',
  }
  return sources[source] || source
}

const getStageLabel = (stage: string): string => {
  const stages: Record<string, string> = {
    applied: 'ثبت شده',
    screening: 'غربالگری',
    interview: 'مصاحبه',
    testing: 'آزمون',
    offer: 'پیشنهاد',
    hired: 'استخدام شده',
    rejected: 'رد شده',
    withdrawn: 'انصراف',
  }
  return stages[stage] || stage
}

const getInterviewTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    phone: 'تلفنی',
    video: 'تصویری',
    onsite: 'حضوری',
    technical: 'فنی',
    hr: 'منابع انسانی',
    manager: 'مدیریتی',
  }
  return types[type] || type
}

const getAssessmentTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    written_test: 'آزمون کتبی',
    practical_task: 'تکلیف عملی',
    psychological: 'آزمون روان‌شناختی',
    technical_exam: 'آزمون فنی',
  }
  return types[type] || type
}

const getStatusBadge = (status: string): ReactNode => {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: 'پیش‌نویس', cls: 'bg-gray-500' },
    new: { label: 'جدید', cls: 'bg-cyan-500' },
    open: { label: 'فعال', cls: 'bg-emerald-500' },
    paused: { label: 'متوقف', cls: 'bg-amber-500' },
    closed: { label: 'بسته', cls: 'bg-red-500' },
    filled: { label: 'پر شده', cls: 'bg-blue-500' },
    applied: { label: 'ثبت شده', cls: 'bg-blue-500' },
    screening: { label: 'غربالگری', cls: 'bg-amber-500' },
    interview: { label: 'مصاحبه', cls: 'bg-purple-500' },
    testing: { label: 'آزمون', cls: 'bg-violet-500' },
    offer: { label: 'پیشنهاد', cls: 'bg-teal-500' },
    hired: { label: 'استخدام', cls: 'bg-emerald-600' },
    rejected: { label: 'رد شده', cls: 'bg-red-500' },
    scheduled: { label: 'برنامه‌ریزی', cls: 'bg-blue-500' },
    completed: { label: 'انجام شده', cls: 'bg-emerald-500' },
    cancelled: { label: 'لغو شده', cls: 'bg-red-500' },
    no_show: { label: 'حاضر نشد', cls: 'bg-orange-500' },
    active: { label: 'فعال', cls: 'bg-emerald-500' },
    archived: { label: 'بایگانی', cls: 'bg-gray-500' },
    pending: { label: 'در انتظار', cls: 'bg-amber-500' },
    passed: { label: 'قبول', cls: 'bg-emerald-500' },
    failed: { label: 'مردود', cls: 'bg-red-500' },
    accepted: { label: 'پذیرفته شده', cls: 'bg-emerald-500' },
    declined: { label: 'رد شده', cls: 'bg-red-500' },
    revoked: { label: 'ابطال شده', cls: 'bg-gray-500' },
    assigned: { label: 'تعیین شده', cls: 'bg-blue-500' },
    in_progress: { label: 'در حال انجام', cls: 'bg-amber-500' },
  }
  const info = map[status]
  if (!info) return <Badge variant="outline">{status}</Badge>
  return <Badge className={`${info.cls} text-white border-0`}>{info.label}</Badge>
}

const getStageColor = (stage: string): string => {
  const colors: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-800 border-blue-200',
    screening: 'bg-amber-100 text-amber-800 border-amber-200',
    interview: 'bg-purple-100 text-purple-800 border-purple-200',
    testing: 'bg-violet-100 text-violet-800 border-violet-200',
    offer: 'bg-teal-100 text-teal-800 border-teal-200',
    hired: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const RTL_STYLE = { fontFamily: 'Vazirmatn, sans-serif' }

// ═══════════════════════════════════════════════════════════════
// Animated Components
// ═══════════════════════════════════════════════════════════════

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
}

function AnimatedCounter({ value, duration = 2, suffix = '', prefix = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration,
        ease: 'easeOut',
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      })
      return () => controls.stop()
    }
  }, [isInView, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {toPersianNumber(displayValue)}
      {suffix}
    </span>
  )
}

function AnimatedProgress({ value, className = '', delay = 0 }: { value: number; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className={`relative h-2 rounded-full bg-gray-200 ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-500"
        initial={{ width: 0 }}
        animate={isInView ? { width: `${Math.min(value, 100)}%` } : { width: 0 }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function Recruitment() {
  // ── State ──────────────────────────────────────────────────
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Dialogs
  const [jobDialogOpen, setJobDialogOpen] = useState(false)
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false)
  const [applicationDetailOpen, setApplicationDetailOpen] = useState(false)
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false)
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false)
  const [jobOfferDialogOpen, setJobOfferDialogOpen] = useState(false)

  // Selected items
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  // ── Form data ─────────────────────────────────────────────
  const [jobFormData, setJobFormData] = useState({
    title: '',
    departmentId: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'monthly',
    employmentType: 'full-time',
    experienceMin: '',
    experienceMax: '',
    educationLevel: '',
    location: '',
    remoteWork: false,
    deadline: null as Date | null,
  })

  const [candidateFormData, setCandidateFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    birthDate: null as Date | null,
    gender: '',
    address: '',
    city: '',
    educationLevel: '',
    educationField: '',
    university: '',
    currentCompany: '',
    currentPosition: '',
    experienceYears: '',
    expectedSalary: '',
    source: 'website',
    skills: '',
    linkedinUrl: '',
    portfolioUrl: '',
    notes: '',
  })

  const [interviewFormData, setInterviewFormData] = useState({
    applicationId: '',
    candidateId: '',
    jobId: '',
    type: 'onsite',
    round: '1',
    scheduledAt: '',
    duration: '60',
    location: '',
    meetingLink: '',
    notes: '',
  })

  const [assessmentFormData, setAssessmentFormData] = useState({
    applicationId: '',
    type: 'written_test',
    title: '',
    deadline: null as Date | null,
    passScore: '60',
    notes: '',
  })

  const [scoreFormData, setScoreFormData] = useState({
    id: '',
    score: '',
    result: '' as string,
  })

  const [jobOfferFormData, setJobOfferFormData] = useState({
    applicationId: '',
    employmentType: 'full_time',
    baseSalary: '',
    startDate: null as Date | null,
    workLocation: 'onsite',
    offerExpiryDate: null as Date | null,
    notes: '',
  })

  // ── Data Fetching ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [jobsRes, candidatesRes, applicationsRes, interviewsRes, assessmentsRes, offersRes, deptsRes] = await Promise.all([
        fetch('/api/job-postings'),
        fetch('/api/candidates'),
        fetch('/api/job-applications'),
        fetch('/api/interviews'),
        fetch('/api/assessments'),
        fetch('/api/job-offers'),
        fetch('/api/departments'),
      ])

      if (jobsRes.ok) setJobs(safeArray(await jobsRes.json()))
      if (candidatesRes.ok) setCandidates(safeArray(await candidatesRes.json()))
      if (applicationsRes.ok) setApplications(safeArray(await applicationsRes.json()))
      if (interviewsRes.ok) setInterviews(safeArray(await interviewsRes.json()))
      if (assessmentsRes.ok) setAssessments(safeArray(await assessmentsRes.json()))
      if (offersRes.ok) setJobOffers(safeArray(await offersRes.json()))
      if (deptsRes.ok) {
        const deptData = await deptsRes.json()
        // چک کردن ساختار درست: data.departments
        if (deptData?.data?.departments && Array.isArray(deptData.data.departments)) {
          setDepartments(deptData.data.departments)  // ✅ درسته
        } 
        // fallback برای ساختارهای دیگه
        else if (deptData?.departments && Array.isArray(deptData.departments)) {
          setDepartments(deptData.departments)
        } 
        else if (Array.isArray(deptData)) {
          setDepartments(deptData)
        } 
        else {
          console.warn('Unexpected departments response structure:', deptData)
          setDepartments([])
        }
      }
      // ═══ Auto-Sync از سایت استخدام (Portal → HR) ═══
      syncPortalSubmissions()
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('خطا در دریافت اطلاعات')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Portal Sync: تبدیل درخواست‌های سایت استخدام به کاندیدا + درخواست ──
  const syncPortalSubmissions = useCallback(() => {
    try {
      const portalSubmissions: any[] = JSON.parse(localStorage.getItem('hrm_portal_submissions') || '[]')
      const unsynced = portalSubmissions.filter((s: any) => !s.synced)
      if (unsynced.length === 0) return

      // تبدیل به Candidate
      const newCandidates: Candidate[] = unsynced.map((s: any) => ({
        id: s.candidateId || `portal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        email: s.email || '',
        phone: s.phone || '',
        nationalId: s.nationalId || '',
        gender: s.gender || '',
        city: s.city || '',
        experienceYears: s.experienceYears || 0,
        educationLevel: s.educationLevel || '',
        educationField: s.educationField || '',
        university: s.university || '',
        currentCompany: s.currentCompany || '',
        currentPosition: '',
        skills: s.skills || '',
        languages: '',
        source: 'website',
        status: 'new',
        rating: 0,
        notes: '',
        tags: 'سایت_استخدام',
        resumeUrl: s.resumeUrl || '',
        linkedinUrl: s.linkedinUrl || '',
        portfolioUrl: s.portfolioUrl || '',
        createdAt: s.appliedAt || new Date().toISOString(),
      }))

      // تبدیل به JobApplication
      const newApplications: JobApplication[] = unsynced.map((s: any) => ({
        id: s.id || Date.now().toString(),
        jobId: s.jobId || '',
        candidateId: s.candidateId || '',
        coverLetter: s.coverLetter || '',
        expectedSalary: 0,
        status: 'new',
        currentStage: 'applied',
        matchScore: 0,
        screeningScore: 0,
        appliedAt: s.appliedAt || new Date().toISOString(),
        rejectionReason: '',
        offeredSalary: 0,
      }))

      // ادغام با لیست‌های موجود
      setCandidates(prev => {
        const existingIds = new Set(prev.map(c => c.id))
        const merged = [...newCandidates.filter(c => !existingIds.has(c.id)), ...prev]
        return merged
      })
      setApplications(prev => {
        const existingIds = new Set(prev.map(a => a.id))
        const merged = [...newApplications.filter(a => !existingIds.has(a.id)), ...prev]
        return merged
      })

      // علامت‌گذاری همگام‌شده
      const updated = portalSubmissions.map((s: any) => ({ ...s, synced: true }))
      localStorage.setItem('hrm_portal_submissions', JSON.stringify(updated))

      if (unsynced.length > 0) {
        toast.success(`${unsynced.length} درخواست جدید از سایت استخدام همگام‌سازی شد`)
      }
    } catch (error) {
      console.error('Portal sync error:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Stats ─────────────────────────────────────────────────
  const stats = {
    totalJobs: jobs.length,
    activeCandidates: candidates.filter((c) => c.status === 'active').length,
    totalApplications: applications.length,
    upcomingInterviews: interviews.filter((i) => {
      if (i.status !== 'scheduled') return false
      return new Date(i.scheduledAt) >= new Date()
    }).length,
    activeOffers: jobOffers.filter((o) => o.status === 'draft' || o.status === 'pending').length,
    conversionRate: applications.length > 0 ? Math.round((applications.filter((a) => a.status === 'hired').length / applications.length) * 100) : 0,
    hired: applications.filter((a) => a.status === 'hired').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    sourceBreakdown: {
      website: candidates.filter((c) => c.source === 'website').length,
      referral: candidates.filter((c) => c.source === 'referral').length,
      linkedin: candidates.filter((c) => c.source === 'linkedin').length,
      job_site: candidates.filter((c) => c.source === 'job_site').length,
      other: candidates.filter((c) => c.source === 'other').length,
    },
  }

  // Pipeline stages
  const pipelineStages = [
    { id: 'applied', label: 'ثبت شده', color: 'bg-blue-500', border: 'border-blue-300' },
    { id: 'screening', label: 'غربالگری', color: 'bg-amber-500', border: 'border-amber-300' },
    { id: 'interview', label: 'مصاحبه', color: 'bg-purple-500', border: 'border-purple-300' },
    { id: 'testing', label: 'آزمون', color: 'bg-violet-500', border: 'border-violet-300' },
    { id: 'offer', label: 'پیشنهاد', color: 'bg-teal-500', border: 'border-teal-300' },
    { id: 'hired', label: 'استخدام', color: 'bg-emerald-600', border: 'border-emerald-300' },
  ]

  // ── Handlers ──────────────────────────────────────────────

  const handleSubmitJob = async () => {
    try {
      const url = selectedJob ? `/api/job-postings?id=${selectedJob.id}` : '/api/job-postings'
      const method = selectedJob ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobFormData,
          salaryMin: parseFloat(jobFormData.salaryMin) || 0,
          salaryMax: parseFloat(jobFormData.salaryMax) || 0,
          experienceMin: parseInt(jobFormData.experienceMin) || 0,
          experienceMax: parseInt(jobFormData.experienceMax) || 0,
          deadline: jobFormData.deadline ? jobFormData.deadline.toISOString() : null,
        }),
      })

      if (response.ok) {
        toast.success(selectedJob ? 'آگهی ویرایش شد' : 'آگهی ثبت شد')
        setJobDialogOpen(false)
        resetJobForm()
        fetchData()
      } else {
        toast.error('خطا در ذخیره آگهی')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/job-postings?id=${jobId}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('آگهی حذف شد')
        fetchData()
      } else {
        toast.error('خطا در حذف آگهی')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handlePublishJob = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/job-postings/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, status: newStatus }),
      })
      if (response.ok) {
        toast.success(newStatus === 'open' ? 'آگهی منتشر شد' : 'آگهی بسته شد')
        fetchData()
      } else {
        toast.error('خطا در تغییر وضعیت')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleSubmitCandidate = async () => {
    try {
      const url = selectedCandidate ? `/api/candidates?id=${selectedCandidate.id}` : '/api/candidates'
      const method = selectedCandidate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...candidateFormData,
          birthDate: candidateFormData.birthDate ? candidateFormData.birthDate.toISOString() : null,
          experienceYears: parseInt(candidateFormData.experienceYears) || 0,
          expectedSalary: parseFloat(candidateFormData.expectedSalary) || null,
        }),
      })

      if (response.ok) {
        toast.success(selectedCandidate ? 'کاندیدا ویرایش شد' : 'کاندیدا ثبت شد')
        setCandidateDialogOpen(false)
        resetCandidateForm()
        fetchData()
      } else {
        const err = await response.json()
        toast.error(err.error || 'خطا در ذخیره کاندیدا')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleScheduleInterview = async () => {
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...interviewFormData,
          round: parseInt(interviewFormData.round) || 1,
          duration: parseInt(interviewFormData.duration) || 60,
        }),
      })
      if (response.ok) {
        toast.success('مصاحبه زمان‌بندی شد')
        setInterviewDialogOpen(false)
        resetInterviewForm()
        fetchData()
      } else {
        toast.error('خطا در زمان‌بندی مصاحبه')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleUpdateInterview = async (interviewId: string, data: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/interviews?id=${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: interviewId, ...data }),
      })
      if (response.ok) {
        toast.success('مصاحبه بروزرسانی شد')
        fetchData()
      } else {
        toast.error('خطا در بروزرسانی مصاحبه')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleCreateAssessment = async () => {
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assessmentFormData,
          passScore: parseFloat(assessmentFormData.passScore) || 60,
          deadline: assessmentFormData.deadline ? assessmentFormData.deadline.toISOString() : null,
        }),
      })
      if (response.ok) {
        toast.success('ارزیابی ثبت شد')
        setAssessmentDialogOpen(false)
        resetAssessmentForm()
        fetchData()
      } else {
        toast.error('خطا در ثبت ارزیابی')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleUpdateAssessmentScore = async () => {
    try {
      const response = await fetch('/api/assessments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: scoreFormData.id,
          score: parseFloat(scoreFormData.score) || 0,
          result: scoreFormData.result,
          status: scoreFormData.result ? 'completed' : 'in_progress',
        }),
      })
      if (response.ok) {
        toast.success('نمره ثبت شد')
        setScoreDialogOpen(false)
        fetchData()
      } else {
        toast.error('خطا در ثبت نمره')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleCreateJobOffer = async () => {
    try {
      const response = await fetch('/api/job-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobOfferFormData,
          baseSalary: parseFloat(jobOfferFormData.baseSalary) || null,
          startDate: jobOfferFormData.startDate ? jobOfferFormData.startDate.toISOString() : null,
          offerExpiryDate: jobOfferFormData.offerExpiryDate ? jobOfferFormData.offerExpiryDate.toISOString() : null,
        }),
      })
      if (response.ok) {
        toast.success('پیشنهاد شغلی ثبت شد')
        setJobOfferDialogOpen(false)
        resetJobOfferForm()
        fetchData()
      } else {
        const err = await response.json()
        toast.error(err.error || 'خطا در ثبت پیشنهاد شغلی')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleUpdateJobOffer = async (offerId: string, status: string) => {
    try {
      const response = await fetch('/api/job-offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offerId, status }),
      })
      if (response.ok) {
        toast.success('وضعیت پیشنهاد بروزرسانی شد')
        fetchData()
      } else {
        toast.error('خطا در بروزرسانی')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleMoveToNextStage = async (applicationId: string, currentStage: string) => {
    const stageOrder = ['applied', 'screening', 'interview', 'testing', 'offer', 'hired']
    const idx = stageOrder.indexOf(currentStage)
    if (idx === -1 || idx >= stageOrder.length - 1) return

    const nextStage = stageOrder[idx + 1]
    const newStatus = nextStage === 'hired' ? 'hired' : currentStage

    try {
      const response = await fetch('/api/job-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, currentStage: nextStage, status: newStatus }),
      })
      if (response.ok) {
        toast.success(`مرحله به «${getStageLabel(nextStage)}» تغییر کرد`)
        fetchData()
      } else {
        toast.error('خطا در تغییر مرحله')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const response = await fetch('/api/job-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status: 'rejected', currentStage: 'rejected' }),
      })
      if (response.ok) {
        toast.success('درخواست رد شد')
        fetchData()
      } else {
        toast.error('خطا در رد درخواست')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  // ── Reset Forms ───────────────────────────────────────────
  const resetJobForm = () => {
    setJobFormData({
      title: '', departmentId: '', description: '', requirements: '',
      responsibilities: '', benefits: '', salaryMin: '', salaryMax: '',
      salaryType: 'monthly', employmentType: 'full-time', experienceMin: '',
      experienceMax: '', educationLevel: '', location: '', remoteWork: false,
      deadline: null,
    })
    setSelectedJob(null)
  }

  const resetCandidateForm = () => {
    setCandidateFormData({
      firstName: '', lastName: '', email: '', phone: '', nationalId: '',
      birthDate: null, gender: '', address: '', city: '', educationLevel: '',
      educationField: '', university: '', currentCompany: '', currentPosition: '',
      experienceYears: '', expectedSalary: '', source: 'website', skills: '',
      linkedinUrl: '', portfolioUrl: '', notes: '',
    })
    setSelectedCandidate(null)
  }

  const resetInterviewForm = () => {
    setInterviewFormData({
      applicationId: '', candidateId: '', jobId: '', type: 'onsite',
      round: '1', scheduledAt: '', duration: '60', location: '',
      meetingLink: '', notes: '',
    })
    setSelectedInterview(null)
  }

  const resetAssessmentForm = () => {
    setAssessmentFormData({
      applicationId: '', type: 'written_test', title: '',
      deadline: null, passScore: '60', notes: '',
    })
  }

  const resetJobOfferForm = () => {
    setJobOfferFormData({
      applicationId: '', employmentType: 'full_time', baseSalary: '',
      startDate: null, workLocation: 'onsite', offerExpiryDate: null, notes: '',
    })
  }

  // ── Dialog Openers ────────────────────────────────────────
  const openJobDialog = (job?: JobPosting) => {
    if (job) {
      setSelectedJob(job)
      setJobFormData({
        title: job.title, departmentId: job.departmentId,
        description: job.description, requirements: job.requirements,
        responsibilities: job.responsibilities || '', benefits: job.benefits || '',
        salaryMin: job.salaryMin?.toString() || '', salaryMax: job.salaryMax?.toString() || '',
        salaryType: job.salaryType || 'monthly', employmentType: job.employmentType || 'full-time',
        experienceMin: job.experienceMin?.toString() || '', experienceMax: job.experienceMax?.toString() || '',
        educationLevel: job.educationLevel || '', location: job.location || '',
        remoteWork: job.remoteWork || false,
        deadline: job.deadline ? new Date(job.deadline) : null,
      })
    } else {
      resetJobForm()
    }
    setJobDialogOpen(true)
  }

  const openCandidateDialog = (candidate?: Candidate) => {
    if (candidate) {
      setSelectedCandidate(candidate)
      setCandidateFormData({
        firstName: candidate.firstName, lastName: candidate.lastName,
        email: candidate.email, phone: candidate.phone,
        nationalId: candidate.nationalId || '',
        birthDate: candidate.birthDate ? new Date(candidate.birthDate) : null,
        gender: candidate.gender || '', address: candidate.address || '',
        city: candidate.city || '', educationLevel: candidate.educationLevel || '',
        educationField: candidate.educationField || '', university: candidate.university || '',
        currentCompany: candidate.currentCompany || '',
        currentPosition: candidate.currentPosition || '',
        experienceYears: candidate.experienceYears?.toString() || '',
        expectedSalary: '', source: candidate.source || 'website',
        skills: candidate.skills || '', linkedinUrl: candidate.linkedinUrl || '',
        portfolioUrl: candidate.portfolioUrl || '', notes: candidate.notes || '',
      })
    } else {
      resetCandidateForm()
    }
    setCandidateDialogOpen(true)
  }

  const openInterviewDialog = (application?: JobApplication) => {
    if (application) {
      setInterviewFormData({
        ...interviewFormData,
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
      })
    } else {
      resetInterviewForm()
    }
    setInterviewDialogOpen(true)
  }

  const openAssessmentDialog = () => {
    resetAssessmentForm()
    setAssessmentDialogOpen(true)
  }

  const openScoreDialog = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setScoreFormData({
      id: assessment.id,
      score: assessment.score?.toString() || '',
      result: assessment.result || '',
    })
    setScoreDialogOpen(true)
  }

  const openJobOfferDialog = (application?: JobApplication) => {
    if (application) {
      setJobOfferFormData({
        ...jobOfferFormData,
        applicationId: application.id,
      })
    } else {
      resetJobOfferForm()
    }
    setJobOfferDialogOpen(true)
  }

  // ── Filtering ─────────────────────────────────────────────
  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    if (departmentFilter !== 'all' && j.departmentId !== departmentFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return j.title.toLowerCase().includes(s) || (j.department?.name || '').toLowerCase().includes(s)
    }
    return true
  })

  const filteredCandidates = candidates.filter((c) => {
    if (sourceFilter !== 'all' && c.source !== sourceFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (
        c.firstName.toLowerCase().includes(s) ||
        c.lastName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone.includes(s)
      )
    }
    return true
  })

  // ── Reports calculations ──────────────────────────────────
  const hiredApps = applications.filter((a) => a.status === 'hired')
  const timeToFill = hiredApps.length > 0
    ? Math.round(
        hiredApps.reduce((sum, a) => {
          const job = jobs.find((j) => j.id === a.jobId)
          if (!job || !job.createdAt) return sum
          const hireDate = a.hiredAt ? new Date(a.hiredAt) : new Date()
          const postDate = new Date(job.createdAt)
          return sum + Math.max(0, (hireDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))
        }, 0) / hiredApps.length
      )
    : 0

  const timeToHire = hiredApps.length > 0
    ? Math.round(
        hiredApps.reduce((sum, a) => {
          const applyDate = new Date(a.appliedAt)
          const hireDate = a.hiredAt ? new Date(a.hiredAt) : new Date()
          return sum + Math.max(0, (hireDate.getTime() - applyDate.getTime()) / (1000 * 60 * 60 * 24))
        }, 0) / hiredApps.length
      )
    : 0

  const offerAccepted = jobOffers.filter((o) => o.status === 'accepted').length
  const totalOffers = jobOffers.filter((o) => o.status === 'accepted' || o.status === 'declined').length
  const offerAcceptanceRate = totalOffers > 0 ? Math.round((offerAccepted / totalOffers) * 100) : 0

  const noShowInterviews = interviews.filter((i) => i.status === 'no_show').length
  const totalInterviews = interviews.length
  const noShowRate = totalInterviews > 0 ? Math.round((noShowInterviews / totalInterviews) * 100) : 0

  const stageFunnel = pipelineStages.map((stage) => ({
    ...stage,
    count: applications.filter((a) => a.currentStage === stage.id).length,
  }))

  const maxFunnelCount = Math.max(...stageFunnel.map((s) => s.count), 1)

  // ═══════════════════════════════════════════════════════════
  // Render: Loading
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div dir="rtl" style={RTL_STYLE} className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <p className="text-gray-500 text-lg">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // Render: Main
  // ═══════════════════════════════════════════════════════════
  return (
    <div dir="rtl" style={RTL_STYLE} className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
  <UserPlus className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
  مدیریت استخدام
</h1>
<p className="text-gray-500 dark:text-gray-400 mt-1">مدیریت فرآیند جذب و استخدام نیروی انسانی</p>
        </div>
        <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={fetchData} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
  <RefreshCw className="h-4 w-4 mr-1" />
  بروزرسانی
</Button>
<Button size="sm" onClick={() => openJobDialog()} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
  <Plus className="h-4 w-4 mr-1" />
  آگهی جدید
</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList  className="w-full flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-1 h-auto rounded-xl" dir="rtl">
          <TabsTrigger value="dashboard" className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
  >
            <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline-block" />
            داشبورد
          </TabsTrigger>
          <TabsTrigger value="jobs"  className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
  >
            <Briefcase className="h-4 w-4 mr-1 hidden sm:inline-block" />
            آگهی‌ها
          </TabsTrigger>
          <TabsTrigger value="candidates"  className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
  >
            <Users className="h-4 w-4 mr-1 hidden sm:inline-block" />
            کاندیداها
          </TabsTrigger>
          <TabsTrigger value="pipeline"  className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
  >
            <Activity className="h-4 w-4 mr-1 hidden sm:inline-block" />
            خط فرآیند
          </TabsTrigger>
          <TabsTrigger value="interviews"  className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
  >
            <Calendar className="h-4 w-4 mr-1 hidden sm:inline-block" />
            مصاحبه‌ها
          </TabsTrigger>
          <TabsTrigger value="assessments"  className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
  >
            <ClipboardCheck className="h-4 w-4 mr-1 hidden sm:inline-block" />
            ارزیابی‌ها
          </TabsTrigger>
          <TabsTrigger value="reports"  className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
  >
            <PieChart className="h-4 w-4 mr-1 hidden sm:inline-block" />
            گزارشات
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 1: Dashboard                                     */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4 text-center">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-xs opacity-80 mb-1">کل آگهی‌ها</p>
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.totalJobs} /></p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-xs opacity-80 mb-1">کاندیداهای فعال</p>
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.activeCandidates} /></p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-xs opacity-80 mb-1">درخواست‌ها</p>
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.totalApplications} /></p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-xs opacity-80 mb-1">مصاحبه‌های پیش‌رو</p>
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.upcomingInterviews} /></p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-xs opacity-80 mb-1">پیشنهاد شغلی</p>
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.activeOffers} /></p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-500 to-rose-600 text-white">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-xs opacity-80 mb-1">نرخ تبدیل</p>
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.conversionRate} suffix="%" /></p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source of Hire Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-500" />
                  منبع جذب کاندیداها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.sourceBreakdown).map(([source, count]) => {
                  const total = Object.values(stats.sourceBreakdown).reduce((a, b) => a + b, 0)
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  const colors: Record<string, string> = {
                    website: 'bg-blue-500',
                    referral: 'bg-emerald-500',
                    linkedin: 'bg-sky-500',
                    job_site: 'bg-amber-500',
                    other: 'bg-gray-400',
                  }
                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{getSourceLabel(source)}</span>
                        <span className="text-gray-500">{toPersianNumber(count)} نفر ({toPersianNumber(pct)}٪)</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-100">
                        <motion.div
                          className={`h-full rounded-full ${colors[source] || 'bg-gray-400'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  آخرین درخواست‌ها
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(applications) && applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedApplication(app)
                          setApplicationDetailOpen(true)
                        }}
                      >
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                              {app.candidate?.firstName?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {app.candidate?.firstName} {app.candidate?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{app.job?.title}</p>
                          </div>
                        </div>
                        <div className="text-left flex flex-col items-end gap-1">
                          {getStatusBadge(app.currentStage || app.status)}
                          <span className="text-xs text-gray-400">{formatDate(app.appliedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">درخواستی یافت نشد</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 2: Job Postings                                 */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="jobs" className="space-y-4 mt-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="جستجوی آگهی..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-56"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="draft">پیش‌نویس</SelectItem>
                  <SelectItem value="open">فعال</SelectItem>
                  <SelectItem value="paused">متوقف</SelectItem>
                  <SelectItem value="closed">بسته</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="واحد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه واحدها</SelectItem>
                  {Array.isArray(departments) && departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(statusFilter !== 'all' || departmentFilter !== 'all' || searchTerm) && (
                <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setDepartmentFilter('all'); setSearchTerm('') }}>
                  <FilterX className="h-4 w-4 mr-1" />
                  پاک کردن
                </Button>
              )}
            </div>
            <Button onClick={() => openJobDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              آگهی جدید
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">عنوان</TableHead>
                      <TableHead className="text-right">واحد</TableHead>
                      <TableHead className="text-right">نوع</TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                      <TableHead className="text-right">متقاضیان</TableHead>
                      <TableHead className="text-right">تاریخ</TableHead>
                      <TableHead className="text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(filteredJobs) && filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium text-right">{job.title}</TableCell>
                          <TableCell className="text-right">{job.department?.name || '—'}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">
                              {job.employmentType === 'full-time' ? 'تمام وقت' : job.employmentType === 'part-time' ? 'پاره وقت' : job.employmentType === 'contract' ? 'قراردادی' : job.employmentType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{getStatusBadge(job.status)}</TableCell>
                          <TableCell className="text-right">{toPersianNumber(job.applications)}</TableCell>
                          <TableCell className="text-right text-sm text-gray-500">{formatDate(job.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openJobDialog(job)} title="ویرایش">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {job.status === 'draft' && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePublishJob(job.id, 'open')} title="انتشار">
                                  <Play className="h-4 w-4 text-emerald-600" />
                                </Button>
                              )}
                              {job.status === 'open' && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePublishJob(job.id, 'closed')} title="بستن">
                                  <Pause className="h-4 w-4 text-amber-600" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteJob(job.id)} title="حذف">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                          آگهی‌ای یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 3: Candidates                                   */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="candidates" className="space-y-4 mt-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="جستجوی کاندیدا..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-56"
                />
              </div>
              <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="منبع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="website">وب‌سایت</SelectItem>
                  <SelectItem value="linkedin">لینکدین</SelectItem>
                  <SelectItem value="referral">معرفی</SelectItem>
                  <SelectItem value="job_site">سایت کاریابی</SelectItem>
                  <SelectItem value="other">سایر</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="new">جدید</SelectItem>
                  <SelectItem value="hired">استخدام شده</SelectItem>
                  <SelectItem value="rejected">رد شده</SelectItem>
                  <SelectItem value="archived">بایگانی</SelectItem>
                </SelectContent>
              </Select>
              {(sourceFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
                <Button variant="ghost" size="sm" onClick={() => { setSourceFilter('all'); setStatusFilter('all'); setSearchTerm('') }}>
                  <FilterX className="h-4 w-4 mr-1" />
                  پاک کردن
                </Button>
              )}
            </div>
            <Button onClick={() => openCandidateDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              کاندیدای جدید
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">نام</TableHead>
                      <TableHead className="text-right">ایمیل</TableHead>
                      <TableHead className="text-right">تلفن</TableHead>
                      <TableHead className="text-right">منبع</TableHead>
                      <TableHead className="text-right">تحصیلات</TableHead>
                      <TableHead className="text-right">سابقه</TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                      <TableHead className="text-right">رزومه</TableHead>
                      <TableHead className="text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(filteredCandidates) && filteredCandidates.length > 0 ? (
                      filteredCandidates.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 flex-row-reverse">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                  {c.firstName?.[0]}{c.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i < c.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm">{c.email}</TableCell>
                          <TableCell className="text-right text-sm" dir="ltr">{c.phone}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{getSourceLabel(c.source)}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">{c.educationLevel || '—'}</TableCell>
                          <TableCell className="text-right text-sm">{toPersianNumber(c.experienceYears)} سال</TableCell>
                          <TableCell className="text-right">{getStatusBadge(c.status)}</TableCell>
                          <TableCell className="text-right">
                            {c.resumeUrl ? (
                              <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium">
                                <Download className="w-3.5 h-3.5" />
                                مشاهده
                              </a>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCandidateDialog(c)} title="ویرایش">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                          کاندیدایی یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 4: Pipeline (Kanban)                            */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="pipeline" className="mt-6">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: `${pipelineStages.length * 280}px` }}>
              {pipelineStages.map((stage) => {
                const stageApps = Array.isArray(applications)
                  ? applications.filter((a) => a.currentStage === stage.id)
                  : []
                return (
                  <div key={stage.id} className={`min-w-[260px] w-[260px] flex-shrink-0 rounded-lg border-t-4 ${stage.border} bg-gray-50`}>
                    {/* Column Header */}
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <h3 className="font-semibold text-sm">{stage.label}</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs">{toPersianNumber(stageApps.length)}</Badge>
                    </div>

                    {/* Cards */}
                    <ScrollArea className="max-h-[500px]">
                      <div className="p-2 space-y-2">
                        {stageApps.length > 0 ? (
                          stageApps.map((app) => (
                            <Card key={app.id} className="p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-center gap-2 flex-row-reverse mb-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                    {app.candidate?.firstName?.[0]}{app.candidate?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-right min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {app.candidate?.firstName} {app.candidate?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">{app.job?.title}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                <span>{formatDate(app.appliedAt)}</span>
                                {app.matchScore > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {toPersianNumber(app.matchScore)}٪
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                {stage.id !== 'hired' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs flex-1"
                                    onClick={() => handleMoveToNextStage(app.id, app.currentStage)}
                                  >
                                    <ChevronRight className="h-3 w-3 mr-1" />
                                    مرحله بعد
                                  </Button>
                                )}
                                {stage.id !== 'hired' && stage.id !== 'rejected' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRejectApplication(app.id)}
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-400 text-xs">بدون درخواست</div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )
              })}

              {/* Rejected column */}
              <div className="min-w-[260px] w-[260px] flex-shrink-0 rounded-lg border-t-4 border-red-300 bg-gray-50">
                <div className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <h3 className="font-semibold text-sm">رد شده</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {toPersianNumber(Array.isArray(applications) ? applications.filter((a) => a.currentStage === 'rejected').length : 0)}
                  </Badge>
                </div>
                <ScrollArea className="max-h-[500px]">
                  <div className="p-2 space-y-2">
                    {Array.isArray(applications) && applications.filter((a) => a.currentStage === 'rejected').length > 0 ? (
                      applications
                        .filter((a) => a.currentStage === 'rejected')
                        .map((app) => (
                          <Card key={app.id} className="p-3 shadow-sm opacity-70">
                            <div className="flex items-center gap-2 flex-row-reverse">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-red-100 text-red-700 text-xs">
                                  {app.candidate?.firstName?.[0]}{app.candidate?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-right min-w-0">
                                <p className="text-sm font-medium truncate">{app.candidate?.firstName} {app.candidate?.lastName}</p>
                                <p className="text-xs text-gray-500 truncate">{app.job?.title}</p>
                              </div>
                            </div>
                          </Card>
                        ))
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs">بدون درخواست</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 5: Interviews                                   */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="interviews" className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              مدیریت مصاحبه‌ها
            </h2>
            <Button onClick={() => openInterviewDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              زمان‌بندی مصاحبه
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">کاندیدا</TableHead>
                      <TableHead className="text-right">شغل</TableHead>
                      <TableHead className="text-right">نوع</TableHead>
                      <TableHead className="text-right">تاریخ</TableHead>
                      <TableHead className="text-right">مدت</TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                      <TableHead className="text-right">نتیجه</TableHead>
                      <TableHead className="text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(interviews) && interviews.length > 0 ? (
                      interviews.map((interview) => (
                        <TableRow key={interview.id}>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 flex-row-reverse">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                  {interview.candidate?.firstName?.[0]}{interview.candidate?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {interview.candidate?.firstName} {interview.candidate?.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm">{interview.job?.title || '—'}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{getInterviewTypeLabel(interview.type)}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatDateTime(interview.scheduledAt)}</TableCell>
                          <TableCell className="text-right text-sm">{toPersianNumber(interview.duration)} دقیقه</TableCell>
                          <TableCell className="text-right">{getStatusBadge(interview.status)}</TableCell>
                          <TableCell className="text-right">{interview.result ? getStatusBadge(interview.result) : <span className="text-gray-400 text-sm">—</span>}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1">
                              {interview.status === 'scheduled' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleUpdateInterview(interview.id, { status: 'completed', result: 'passed' })}
                                    title="قبول"
                                  >
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleUpdateInterview(interview.id, { status: 'completed', result: 'failed' })}
                                    title="رد"
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleUpdateInterview(interview.id, { status: 'no_show' })}
                                    title="حاضر نشد"
                                  >
                                    <User className="h-4 w-4 text-orange-500" />
                                  </Button>
                                </>
                              )}
                              {interview.status === 'scheduled' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleUpdateInterview(interview.id, { status: 'cancelled' })}
                                  title="لغو"
                                >
                                  <XCircle className="h-4 w-4 text-gray-400" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                          مصاحبه‌ای یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 6: Assessments                                  */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="assessments" className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-violet-500" />
              ارزیابی‌ها و آزمون‌ها
            </h2>
            <Button onClick={openAssessmentDialog}>
              <Plus className="h-4 w-4 mr-1" />
              ارزیابی جدید
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">کاندیدا</TableHead>
                      <TableHead className="text-right">شغل</TableHead>
                      <TableHead className="text-right">نوع آزمون</TableHead>
                      <TableHead className="text-right">عنوان</TableHead>
                      <TableHead className="text-right">نمره</TableHead>
                      <TableHead className="text-right">حد نصاب</TableHead>
                      <TableHead className="text-right">مهلت</TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                      <TableHead className="text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(assessments) && assessments.length > 0 ? (
                      assessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 flex-row-reverse">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                                  {assessment.application?.candidate?.firstName?.[0]}{assessment.application?.candidate?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {assessment.application?.candidate?.firstName} {assessment.application?.candidate?.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm">{assessment.application?.job?.title || '—'}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{getAssessmentTypeLabel(assessment.type)}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">{assessment.title}</TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {assessment.score !== null && assessment.score !== undefined ? toPersianNumber(assessment.score) : '—'}
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray-500">{toPersianNumber(assessment.passScore)}</TableCell>
                          <TableCell className="text-right text-sm text-gray-500">
                            {assessment.deadline ? formatDate(assessment.deadline) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {assessment.result ? getStatusBadge(assessment.result) : getStatusBadge(assessment.status || 'assigned')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openScoreDialog(assessment)}
                              title="ثبت نمره"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                          ارزیابی‌ای یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 7: Reports                                      */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="reports" className="space-y-6 mt-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">زمان پر کردن جایگاه</p>
                <p className="text-2xl font-bold text-blue-600">{toPersianNumber(timeToFill)} روز</p>
                <p className="text-xs text-gray-400 mt-1">میانگین از انتشار تا استخدام</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">زمان استخدام</p>
                <p className="text-2xl font-bold text-purple-600">{toPersianNumber(timeToHire)} روز</p>
                <p className="text-xs text-gray-400 mt-1">میانگین از درخواست تا استخدام</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">نرخ پذیرش پیشنهاد</p>
                <p className="text-2xl font-bold text-emerald-600">{toPersianNumber(offerAcceptanceRate)}٪</p>
                <p className="text-xs text-gray-400 mt-1">{toPersianNumber(offerAccepted)} از {toPersianNumber(totalOffers)} پیشنهاد</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">نرخ عدم حضور</p>
                <p className="text-2xl font-bold text-orange-600">{toPersianNumber(noShowRate)}٪</p>
                <p className="text-xs text-gray-400 mt-1">{toPersianNumber(noShowInterviews)} از {toPersianNumber(totalInterviews)} مصاحبه</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  توزیع منابع درخواست
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats.sourceBreakdown).map(([source, count]) => {
                  const total = Object.values(stats.sourceBreakdown).reduce((a, b) => a + b, 0)
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  const colors: Record<string, string> = {
                    website: 'bg-blue-500',
                    referral: 'bg-emerald-500',
                    linkedin: 'bg-sky-500',
                    job_site: 'bg-amber-500',
                    other: 'bg-gray-400',
                  }
                  return (
                    <div key={source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{getSourceLabel(source)}</span>
                        <span className="text-gray-500">{toPersianNumber(count)} ({toPersianNumber(pct)}٪)</span>
                      </div>
                      <div className="h-4 rounded-full bg-gray-100">
                        <motion.div
                          className={`h-full rounded-full ${colors[source] || 'bg-gray-400'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Stage Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  قیف تبدیل مراحل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageFunnel.map((stage, idx) => (
                  <div key={stage.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded ${stage.color}`} />
                        {stage.label}
                      </span>
                      <span className="text-gray-600 font-medium">{toPersianNumber(stage.count)} درخواست</span>
                    </div>
                    <div className="h-6 rounded bg-gray-100 relative overflow-hidden">
                      <motion.div
                        className={`h-full rounded ${stage.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${maxFunnelCount > 0 ? (stage.count / maxFunnelCount) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                        {maxFunnelCount > 0 ? toPersianNumber(Math.round((stage.count / maxFunnelCount) * 100)) : 0}٪
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Job Offers Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-teal-500" />
                خلاصه پیشنهادات شغلی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{toPersianNumber(jobOffers.length)}</p>
                  <p className="text-xs text-gray-500">کل پیشنهادات</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{toPersianNumber(jobOffers.filter((o) => o.status === 'draft' || o.status === 'pending').length)}</p>
                  <p className="text-xs text-gray-500">در انتظار</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{toPersianNumber(jobOffers.filter((o) => o.status === 'accepted').length)}</p>
                  <p className="text-xs text-gray-500">پذیرفته شده</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{toPersianNumber(jobOffers.filter((o) => o.status === 'declined').length)}</p>
                  <p className="text-xs text-gray-500">رد شده</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{toPersianNumber(jobOffers.filter((o) => o.status === 'revoked').length)}</p>
                  <p className="text-xs text-gray-500">ابطال شده</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* DIALOGS                                               */}
      {/* ═══════════════════════════════════════════════════════ */}

{/* ── Job Create/Edit Dialog ──────────────────────────── */}
<Dialog open={jobDialogOpen} onOpenChange={(open) => { setJobDialogOpen(open); if (!open) resetJobForm() }}>
  <DialogContent className="max-w-2xl max-h-[85vh]" dir="rtl" style={RTL_STYLE}>
    <DialogHeader className="space-y-1.5">
      <DialogTitle className="text-lg font-semibold flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        {selectedJob ? 'ویرایش آگهی شغلی' : 'ثبت آگهی شغلی جدید'}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        اطلاعات آگهی شغلی را وارد کنید
      </DialogDescription>
    </DialogHeader>
    
    <ScrollArea className="max-h-[60vh] pr-1">
      <div className="space-y-5 py-2">
        {/* بخش اطلاعات پایه */}
        <div>
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <div className="w-1 h-4 rounded-full bg-emerald-500" />
            اطلاعات پایه
          </h4>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">عنوان شغل <span className="text-red-500">*</span></Label>
              <Input
                value={jobFormData.title}
                onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                placeholder="مثلاً: توسعه‌دهنده فرانت‌اند"
                className="h-10 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">واحد سازمانی <span className="text-red-500">*</span></Label>
                <Select value={jobFormData.departmentId} onValueChange={(v) => setJobFormData({ ...jobFormData, departmentId: v })}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="انتخاب واحد" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(departments) && departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">نوع استخدام</Label>
                <Select value={jobFormData.employmentType} onValueChange={(v) => setJobFormData({ ...jobFormData, employmentType: v })}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">تمام وقت</SelectItem>
                    <SelectItem value="part-time">پاره وقت</SelectItem>
                    <SelectItem value="contract">قراردادی</SelectItem>
                    <SelectItem value="internship">کارآموزی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* بخش شرح و الزامات */}
        <div>
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <div className="w-1 h-4 rounded-full bg-blue-500" />
            شرح و الزامات
          </h4>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">توضیحات شغل <span className="text-red-500">*</span></Label>
              <Textarea
                value={jobFormData.description}
                onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                rows={3}
                placeholder="شرح وظایف و مسئولیت‌ها"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">الزامات</Label>
              <Textarea
                value={jobFormData.requirements}
                onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                rows={2}
                placeholder="مهارت‌ها و شرایط لازم"
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">مسئولیت‌ها</Label>
                <Textarea
                  value={jobFormData.responsibilities}
                  onChange={(e) => setJobFormData({ ...jobFormData, responsibilities: e.target.value })}
                  rows={2}
                  placeholder="مسئولیت‌ها"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">مزایا</Label>
                <Textarea
                  value={jobFormData.benefits}
                  onChange={(e) => setJobFormData({ ...jobFormData, benefits: e.target.value })}
                  rows={2}
                  placeholder="مزایا"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* بخش حقوق و شرایط */}
        <div>
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <div className="w-1 h-4 rounded-full bg-amber-500" />
            حقوق و شرایط
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">حداقل حقوق (ریال)</Label>
              <Input
                type="number"
                value={jobFormData.salaryMin}
                onChange={(e) => setJobFormData({ ...jobFormData, salaryMin: e.target.value })}
                className="h-10 text-sm"
                placeholder="۰"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">حداکثر حقوق (ریال)</Label>
              <Input
                type="number"
                value={jobFormData.salaryMax}
                onChange={(e) => setJobFormData({ ...jobFormData, salaryMax: e.target.value })}
                className="h-10 text-sm"
                placeholder="۰"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">نوع حقوق</Label>
              <Select value={jobFormData.salaryType} onValueChange={(v) => setJobFormData({ ...jobFormData, salaryType: v })}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">ماهانه</SelectItem>
                  <SelectItem value="yearly">سالانه</SelectItem>
                  <SelectItem value="hourly">ساعتی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">سطح تحصیلات</Label>
              <Select value={jobFormData.educationLevel} onValueChange={(v) => setJobFormData({ ...jobFormData, educationLevel: v })}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="انتخاب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diploma">دیپلم</SelectItem>
                  <SelectItem value="associate">کاردانی</SelectItem>
                  <SelectItem value="bachelor">کارشناسی</SelectItem>
                  <SelectItem value="master">کارشناسی ارشد</SelectItem>
                  <SelectItem value="phd">دکتری</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">حداقل سابقه (سال)</Label>
              <Input
                type="number"
                value={jobFormData.experienceMin}
                onChange={(e) => setJobFormData({ ...jobFormData, experienceMin: e.target.value })}
                className="h-10 text-sm"
                placeholder="۰"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">حداکثر سابقه (سال)</Label>
              <Input
                type="number"
                value={jobFormData.experienceMax}
                onChange={(e) => setJobFormData({ ...jobFormData, experienceMax: e.target.value })}
                className="h-10 text-sm"
                placeholder="۰"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">محل کار</Label>
              <Input
                value={jobFormData.location}
                onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                placeholder="مثلاً: تهران"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">مهلت ارسال رزومه</Label>
              <PersianDatePicker
                value={jobFormData.deadline}
                onChange={(d) => setJobFormData({ ...jobFormData, deadline: d })}
              />
            </div>
            <div className="col-span-2 flex items-center gap-3 pt-2">
              <Switch
                checked={jobFormData.remoteWork}
                onCheckedChange={(v) => setJobFormData({ ...jobFormData, remoteWork: v })}
              />
              <Label className="text-sm font-medium">امکان دورکاری</Label>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
    
    <DialogFooter className="gap-3 pt-2">
      <Button variant="outline" onClick={() => { setJobDialogOpen(false); resetJobForm() }} className="h-10 px-6 text-sm">
        انصراف
      </Button>
      <Button
        onClick={handleSubmitJob}
        disabled={!jobFormData.title || !jobFormData.departmentId || !jobFormData.description}
        className="h-10 px-6 text-sm gap-2 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm"
      >
        <FileText className="w-4 h-4" />
        {selectedJob ? 'بروزرسانی' : 'ثبت آگهی'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* ── Candidate Create/Edit Dialog ────────────────────── */}
      <Dialog open={candidateDialogOpen} onOpenChange={(open) => { setCandidateDialogOpen(open); if (!open) resetCandidateForm() }}>
        <DialogContent className="max-w-2xl max-h-[85vh]" dir="rtl" style={RTL_STYLE}>
          <DialogHeader>
            <DialogTitle>{selectedCandidate ? 'ویرایش کاندیدا' : 'ثبت کاندیدای جدید'}</DialogTitle>
            <DialogDescription>اطلاعات کاندیدا را وارد کنید</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pl-1">
            <div className="grid grid-cols-2 gap-4 p-1">
              {/* Personal Info */}
              <div>
                <Label>نام *</Label>
                <Input value={candidateFormData.firstName} onChange={(e) => setCandidateFormData({ ...candidateFormData, firstName: e.target.value })} />
              </div>
              <div>
                <Label>نام خانوادگی *</Label>
                <Input value={candidateFormData.lastName} onChange={(e) => setCandidateFormData({ ...candidateFormData, lastName: e.target.value })} />
              </div>
              <div>
                <Label>ایمیل *</Label>
                <Input type="email" value={candidateFormData.email} onChange={(e) => setCandidateFormData({ ...candidateFormData, email: e.target.value })} dir="ltr" className="text-left" />
              </div>
              <div>
                <Label>تلفن *</Label>
                <Input value={candidateFormData.phone} onChange={(e) => setCandidateFormData({ ...candidateFormData, phone: e.target.value })} dir="ltr" className="text-left" />
              </div>
              <div>
                <Label>کد ملی</Label>
                <Input value={candidateFormData.nationalId} onChange={(e) => setCandidateFormData({ ...candidateFormData, nationalId: e.target.value })} dir="ltr" className="text-left" />
              </div>
              <div>
                <Label>تاریخ تولد</Label>
                <PersianDatePicker value={candidateFormData.birthDate} onChange={(d) => setCandidateFormData({ ...candidateFormData, birthDate: d })} />
              </div>
              <div>
                <Label>جنسیت</Label>
                <Select value={candidateFormData.gender} onValueChange={(v) => setCandidateFormData({ ...candidateFormData, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">مرد</SelectItem>
                    <SelectItem value="female">زن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>شهر</Label>
                <Input value={candidateFormData.city} onChange={(e) => setCandidateFormData({ ...candidateFormData, city: e.target.value })} />
              </div>

              <Separator className="col-span-2" />

              {/* Education */}
              <div>
                <Label>سطح تحصیلات</Label>
                <Select value={candidateFormData.educationLevel} onValueChange={(v) => setCandidateFormData({ ...candidateFormData, educationLevel: v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diploma">دیپلم</SelectItem>
                    <SelectItem value="associate">کاردانی</SelectItem>
                    <SelectItem value="bachelor">کارشناسی</SelectItem>
                    <SelectItem value="master">کارشناسی ارشد</SelectItem>
                    <SelectItem value="phd">دکتری</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>رشته تحصیلی</Label>
                <Input value={candidateFormData.educationField} onChange={(e) => setCandidateFormData({ ...candidateFormData, educationField: e.target.value })} />
              </div>
              <div>
                <Label>دانشگاه</Label>
                <Input value={candidateFormData.university} onChange={(e) => setCandidateFormData({ ...candidateFormData, university: e.target.value })} />
              </div>
              <div>
                <Label>سابقه کار (سال)</Label>
                <Input type="number" value={candidateFormData.experienceYears} onChange={(e) => setCandidateFormData({ ...candidateFormData, experienceYears: e.target.value })} />
              </div>

              <Separator className="col-span-2" />

              {/* Work */}
              <div>
                <Label>شرکت فعلی</Label>
                <Input value={candidateFormData.currentCompany} onChange={(e) => setCandidateFormData({ ...candidateFormData, currentCompany: e.target.value })} />
              </div>
              <div>
                <Label>سمت فعلی</Label>
                <Input value={candidateFormData.currentPosition} onChange={(e) => setCandidateFormData({ ...candidateFormData, currentPosition: e.target.value })} />
              </div>
              <div>
                <Label>حقوق درخواستی (ریال)</Label>
                <Input type="number" value={candidateFormData.expectedSalary} onChange={(e) => setCandidateFormData({ ...candidateFormData, expectedSalary: e.target.value })} />
              </div>
              <div>
                <Label>منبع</Label>
                <Select value={candidateFormData.source} onValueChange={(v) => setCandidateFormData({ ...candidateFormData, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">وب‌سایت</SelectItem>
                    <SelectItem value="linkedin">لینکدین</SelectItem>
                    <SelectItem value="referral">معرفی</SelectItem>
                    <SelectItem value="job_site">سایت کاریابی</SelectItem>
                    <SelectItem value="other">سایر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="col-span-2" />

              {/* Skills & Links */}
              <div className="col-span-2">
                <Label>مهارت‌ها</Label>
                <Textarea value={candidateFormData.skills} onChange={(e) => setCandidateFormData({ ...candidateFormData, skills: e.target.value })} rows={2} placeholder="مهارت‌ها را با کاما جدا کنید" />
              </div>
              <div>
                <Label>لینکدین</Label>
                <Input value={candidateFormData.linkedinUrl} onChange={(e) => setCandidateFormData({ ...candidateFormData, linkedinUrl: e.target.value })} dir="ltr" className="text-left" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <Label>نمونه‌کار</Label>
                <Input value={candidateFormData.portfolioUrl} onChange={(e) => setCandidateFormData({ ...candidateFormData, portfolioUrl: e.target.value })} dir="ltr" className="text-left" placeholder="https://..." />
              </div>
              <div className="col-span-2">
                <Label>یادداشت</Label>
                <Textarea value={candidateFormData.notes} onChange={(e) => setCandidateFormData({ ...candidateFormData, notes: e.target.value })} rows={2} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCandidateDialogOpen(false); resetCandidateForm() }}>انصراف</Button>
            <Button onClick={handleSubmitCandidate} disabled={!candidateFormData.firstName || !candidateFormData.lastName || !candidateFormData.email || !candidateFormData.phone}>
              {selectedCandidate ? 'بروزرسانی' : 'ثبت کاندیدا'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Application Detail Dialog ───────────────────────── */}
      <Dialog open={applicationDetailOpen} onOpenChange={setApplicationDetailOpen}>
        <DialogContent className="max-w-lg" dir="rtl" style={RTL_STYLE}>
          <DialogHeader>
            <DialogTitle>جزئیات درخواست</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-row-reverse">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {selectedApplication.candidate?.firstName?.[0]}{selectedApplication.candidate?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <h3 className="font-semibold">{selectedApplication.candidate?.firstName} {selectedApplication.candidate?.lastName}</h3>
                  <p className="text-sm text-gray-500">{selectedApplication.job?.title}</p>
                  <p className="text-xs text-gray-400">{selectedApplication.candidate?.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-right">
                  <p className="text-gray-500">مرحله فعلی</p>
                  <div className="mt-1">{getStatusBadge(selectedApplication.currentStage || selectedApplication.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">تاریخ درخواست</p>
                  <p className="font-medium mt-1">{formatDate(selectedApplication.appliedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">نمره تطابق</p>
                  <p className="font-medium mt-1">{toPersianNumber(selectedApplication.matchScore)}٪</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">نمره غربالگری</p>
                  <p className="font-medium mt-1">{toPersianNumber(selectedApplication.screeningScore)}٪</p>
                </div>
              </div>

              {selectedApplication.coverLetter && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">COVER LETTER</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedApplication.coverLetter}</p>
                </div>
              )}

              {selectedApplication.expectedSalary && (
                <div className="text-sm text-right">
                  <span className="text-gray-500">حقوق درخواستی: </span>
                  <span className="font-medium">{formatCurrency(selectedApplication.expectedSalary)}</span>
                </div>
              )}

              {/* Interviews for this application */}
              {Array.isArray(selectedApplication.interviews) && selectedApplication.interviews.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">مصاحبه‌ها</p>
                  <div className="space-y-2">
                    {selectedApplication.interviews.map((interview) => (
                      <div key={interview.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span>{getInterviewTypeLabel(interview.type)} - دور {toPersianNumber(interview.round)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{formatDate(interview.scheduledAt)}</span>
                          {getStatusBadge(interview.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedApplication.currentStage !== 'hired' && selectedApplication.currentStage !== 'rejected' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => { handleMoveToNextStage(selectedApplication.id, selectedApplication.currentStage); setApplicationDetailOpen(false) }}>
                      <ChevronRight className="h-4 w-4 mr-1" />
                      مرحله بعد
                    </Button>
                    <Button size="sm" variant="outline" className="text-purple-600" onClick={() => { openInterviewDialog(selectedApplication); setApplicationDetailOpen(false) }}>
                      <Calendar className="h-4 w-4 mr-1" />
                      زمان‌بندی مصاحبه
                    </Button>
                    <Button size="sm" variant="outline" className="text-violet-600" onClick={() => { openAssessmentDialog(); setAssessmentFormData({ ...assessmentFormData, applicationId: selectedApplication.id }); setApplicationDetailOpen(false) }}>
                      <ClipboardCheck className="h-4 w-4 mr-1" />
                      ارزیابی
                    </Button>
                    <Button size="sm" variant="outline" className="text-teal-600" onClick={() => { openJobOfferDialog(selectedApplication); setApplicationDetailOpen(false) }}>
                      <Award className="h-4 w-4 mr-1" />
                      پیشنهاد شغلی
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => { handleRejectApplication(selectedApplication.id); setApplicationDetailOpen(false) }}>
                      <XCircle className="h-4 w-4 mr-1" />
                      رد
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Interview Schedule Dialog ───────────────────────── */}
      <Dialog open={interviewDialogOpen} onOpenChange={(open) => { setInterviewDialogOpen(open); if (!open) resetInterviewForm() }}>
        <DialogContent className="max-w-lg" dir="rtl" style={RTL_STYLE}>
          <DialogHeader>
            <DialogTitle>زمان‌بندی مصاحبه</DialogTitle>
            <DialogDescription>اطلاعات مصاحبه را وارد کنید</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>درخواست / کاندیدا</Label>
              <Select
                value={interviewFormData.applicationId}
                onValueChange={(v) => {
                  const app = applications.find((a) => a.id === v)
                  setInterviewFormData({
                    ...interviewFormData,
                    applicationId: v,
                    candidateId: app?.candidateId || '',
                    jobId: app?.jobId || '',
                  })
                }}
              >
                <SelectTrigger><SelectValue placeholder="انتخاب درخواست" /></SelectTrigger>
                <SelectContent>
                  {Array.isArray(applications) && applications
                    .filter((a) => a.status !== 'hired' && a.status !== 'rejected')
                    .map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.candidate?.firstName} {app.candidate?.lastName} — {app.job?.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع مصاحبه</Label>
              <Select value={interviewFormData.type} onValueChange={(v) => setInterviewFormData({ ...interviewFormData, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">تلفنی</SelectItem>
                  <SelectItem value="video">تصویری</SelectItem>
                  <SelectItem value="onsite">حضوری</SelectItem>
                  <SelectItem value="technical">فنی</SelectItem>
                  <SelectItem value="hr">منابع انسانی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>دور</Label>
              <Select value={interviewFormData.round} onValueChange={(v) => setInterviewFormData({ ...interviewFormData, round: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">اول</SelectItem>
                  <SelectItem value="2">دوم</SelectItem>
                  <SelectItem value="3">سوم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>تاریخ و ساعت</Label>
              <Input
                type="datetime-local"
                value={interviewFormData.scheduledAt}
                onChange={(e) => setInterviewFormData({ ...interviewFormData, scheduledAt: e.target.value })}
              />
            </div>
            <div>
              <Label>مدت (دقیقه)</Label>
              <Input type="number" value={interviewFormData.duration} onChange={(e) => setInterviewFormData({ ...interviewFormData, duration: e.target.value })} />
            </div>
            <div>
              <Label>محل</Label>
              <Input value={interviewFormData.location} onChange={(e) => setInterviewFormData({ ...interviewFormData, location: e.target.value })} placeholder="اتاق جلسات یا آدرس" />
            </div>
            <div>
              <Label>لینک جلسه</Label>
              <Input value={interviewFormData.meetingLink} onChange={(e) => setInterviewFormData({ ...interviewFormData, meetingLink: e.target.value })} dir="ltr" className="text-left" placeholder="https://meet.google.com/..." />
            </div>
            <div className="col-span-2">
              <Label>یادداشت</Label>
              <Textarea value={interviewFormData.notes} onChange={(e) => setInterviewFormData({ ...interviewFormData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setInterviewDialogOpen(false); resetInterviewForm() }}>انصراف</Button>
            <Button onClick={handleScheduleInterview} disabled={!interviewFormData.applicationId || !interviewFormData.scheduledAt}>
              ثبت مصاحبه
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Assessment Create Dialog ────────────────────────── */}
      <Dialog open={assessmentDialogOpen} onOpenChange={(open) => { setAssessmentDialogOpen(open); if (!open) resetAssessmentForm() }}>
        <DialogContent className="max-w-lg" dir="rtl" style={RTL_STYLE}>
          <DialogHeader>
            <DialogTitle>ثبت ارزیابی جدید</DialogTitle>
            <DialogDescription>آزمون یا ارزیابی برای کاندیدا تعیین کنید</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>درخواست / کاندیدا *</Label>
              <Select value={assessmentFormData.applicationId} onValueChange={(v) => setAssessmentFormData({ ...assessmentFormData, applicationId: v })}>
                <SelectTrigger><SelectValue placeholder="انتخاب درخواست" /></SelectTrigger>
                <SelectContent>
                  {Array.isArray(applications) && applications
                    .filter((a) => a.status !== 'hired' && a.status !== 'rejected')
                    .map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.candidate?.firstName} {app.candidate?.lastName} — {app.job?.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع آزمون</Label>
              <Select value={assessmentFormData.type} onValueChange={(v) => setAssessmentFormData({ ...assessmentFormData, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="written_test">آزمون کتبی</SelectItem>
                  <SelectItem value="practical_task">تکلیف عملی</SelectItem>
                  <SelectItem value="psychological">آزمون روان‌شناختی</SelectItem>
                  <SelectItem value="technical_exam">آزمون فنی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>عنوان *</Label>
              <Input value={assessmentFormData.title} onChange={(e) => setAssessmentFormData({ ...assessmentFormData, title: e.target.value })} placeholder="مثلاً: آزمون جاوااسکریپت" />
            </div>
            <div>
              <Label>حد نصاب قبولی</Label>
              <Input type="number" value={assessmentFormData.passScore} onChange={(e) => setAssessmentFormData({ ...assessmentFormData, passScore: e.target.value })} />
            </div>
            <div>
              <Label>مهلت</Label>
              <PersianDatePicker value={assessmentFormData.deadline} onChange={(d) => setAssessmentFormData({ ...assessmentFormData, deadline: d })} />
            </div>
            <div className="col-span-2">
              <Label>یادداشت</Label>
              <Textarea value={assessmentFormData.notes} onChange={(e) => setAssessmentFormData({ ...assessmentFormData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssessmentDialogOpen(false); resetAssessmentForm() }}>انصراف</Button>
            <Button onClick={handleCreateAssessment} disabled={!assessmentFormData.applicationId || !assessmentFormData.title}>
              ثبت ارزیابی
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Score Entry Dialog ──────────────────────────────── */}
      <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl" style={RTL_STYLE}>
          <DialogHeader>
            <DialogTitle>ثبت نمره ارزیابی</DialogTitle>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-right">
                <p className="font-medium">{selectedAssessment.application?.candidate?.firstName} {selectedAssessment.application?.candidate?.lastName}</p>
                <p className="text-gray-500">{selectedAssessment.title} — {getAssessmentTypeLabel(selectedAssessment.type)}</p>
                <p className="text-gray-400">حد نصاب: {toPersianNumber(selectedAssessment.passScore)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نمره *</Label>
                  <Input type="number" value={scoreFormData.score} onChange={(e) => setScoreFormData({ ...scoreFormData, score: e.target.value })} placeholder="۰ تا ۱۰۰" />
                </div>
                <div>
                  <Label>نتیجه</Label>
                  <Select value={scoreFormData.result} onValueChange={(v) => setScoreFormData({ ...scoreFormData, result: v })}>
                    <SelectTrigger><SelectValue placeholder="انتخاب نتیجه" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passed">قبول</SelectItem>
                      <SelectItem value="failed">مردود</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setScoreDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleUpdateAssessmentScore} disabled={!scoreFormData.score}>
              ثبت نمره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Job Offer Dialog ────────────────────────────────── */}
      <Dialog open={jobOfferDialogOpen} onOpenChange={(open) => { setJobOfferDialogOpen(open); if (!open) resetJobOfferForm() }}>
        <DialogContent className="max-w-lg" dir="rtl" style={RTL_STYLE}>
          <DialogHeader>
            <DialogTitle>ثبت پیشنهاد شغلی</DialogTitle>
            <DialogDescription>جزئیات پیشنهاد شغلی را وارد کنید</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>درخواست / کاندیدا *</Label>
              <Select value={jobOfferFormData.applicationId} onValueChange={(v) => setJobOfferFormData({ ...jobOfferFormData, applicationId: v })}>
                <SelectTrigger><SelectValue placeholder="انتخاب درخواست" /></SelectTrigger>
                <SelectContent>
                  {Array.isArray(applications) && applications
                    .filter((a) => a.status !== 'hired' && a.status !== 'rejected' && (a.currentStage === 'offer' || a.currentStage === 'interview' || a.currentStage === 'testing'))
                    .map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.candidate?.firstName} {app.candidate?.lastName} — {app.job?.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع استخدام</Label>
              <Select value={jobOfferFormData.employmentType} onValueChange={(v) => setJobOfferFormData({ ...jobOfferFormData, employmentType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">تمام وقت</SelectItem>
                  <SelectItem value="part_time">پاره وقت</SelectItem>
                  <SelectItem value="contract">قراردادی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>مکان کار</Label>
              <Select value={jobOfferFormData.workLocation} onValueChange={(v) => setJobOfferFormData({ ...jobOfferFormData, workLocation: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">حضوری</SelectItem>
                  <SelectItem value="remote">دورکار</SelectItem>
                  <SelectItem value="hybrid">ترکیبی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>حقوق پایه (ریال)</Label>
              <Input type="number" value={jobOfferFormData.baseSalary} onChange={(e) => setJobOfferFormData({ ...jobOfferFormData, baseSalary: e.target.value })} />
            </div>
            <div>
              <Label>تاریخ شروع</Label>
              <PersianDatePicker value={jobOfferFormData.startDate} onChange={(d) => setJobOfferFormData({ ...jobOfferFormData, startDate: d })} />
            </div>
            <div>
              <Label>مهلت پاسخ</Label>
              <PersianDatePicker value={jobOfferFormData.offerExpiryDate} onChange={(d) => setJobOfferFormData({ ...jobOfferFormData, offerExpiryDate: d })} />
            </div>
            <div className="col-span-2">
              <Label>یادداشت</Label>
              <Textarea value={jobOfferFormData.notes} onChange={(e) => setJobOfferFormData({ ...jobOfferFormData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setJobOfferDialogOpen(false); resetJobOfferForm() }}>انصراف</Button>
            <Button onClick={handleCreateJobOffer} disabled={!jobOfferFormData.applicationId}>
              ثبت پیشنهاد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
