// src/modules/recruitment/components/recruitment.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Plus, RefreshCw, BarChart3, Briefcase, Users, Calendar, ClipboardCheck, PieChart, Activity, Loader2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/core/components/ui/tabs'
import { toast } from 'sonner'
import { RTL_STYLE } from '../constants'
import { safeArray } from '../helpers'
import { JobDialog } from './dialogs/job-dialog'
import { CandidateDialog } from './dialogs/candidate-dialog'
import { DeleteConfirmDialog } from './dialogs/delete-confirm-dialog'
import { DashboardTab } from './tabs/dashboard-tab'
import { JobsTab } from './tabs/jobs-tab'
import { useCandidates, useUpdateCandidateStatus } from '../hooks/useCandidates'
import { CandidatesTab } from './tabs/candidates-tab'
import { PipelineTab } from './tabs/pipeline-tab'
import { InterviewsTab } from './tabs/interviews-tab'
import { AssessmentsTab } from './tabs/assessments-tab'
import { InterviewDialog } from './dialogs/interview-dialog' 
import { ReportsTab } from './tabs/reports-tab'
import { ScoreDialog } from './dialogs/score-dialog'
import { AssessmentDialog } from './dialogs/assessment-dialog'  
import { OfferDialog } from './dialogs/offer-dialog'
import type { Candidate, JobPosting, JobApplication, Interview, Assessment, JobOffer, Department } from '../types/type'

export function Recruitment() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Dialog states
  const [jobDialogOpen, setJobDialogOpen] = useState(false)
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false)
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false)
  const [applicationDetailOpen, setApplicationDetailOpen] = useState(false)
  const [submittingAssessment, setSubmittingAssessment] = useState(false)
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
const [submittingOffer, setSubmittingOffer] = useState(false)
 
const [scoreDialogOpen, setScoreDialogOpen] = useState(false)        
const [submittingInterview, setSubmittingInterview] = useState(false) 
const [submittingScore, setSubmittingScore] = useState(false)         

  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ id: string; title: string } | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  // ── React Query برای Candidates ──
const { 
  data: candidates = [], 
  isLoading: candidatesLoading,
  refetch: refetchCandidates 
} = useCandidates({
  status: statusFilter !== 'all' ? statusFilter : undefined,
  source: sourceFilter !== 'all' ? sourceFilter : undefined,
  search: searchTerm || undefined,
})

const updateStatus = useUpdateCandidateStatus()

  // ── Sync Portal Submissions ─────────────────────────────────
  const syncPortalSubmissions = useCallback(() => {
    try {
      const portalSubmissions: any[] = JSON.parse(localStorage.getItem('hrm_portal_submissions') || '[]')
      const unsynced = portalSubmissions.filter((s: any) => !s.synced)
      if (unsynced.length === 0) return

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
        status: 'active',
        rating: 0,
        notes: '',
        tags: 'سایت_استخدام',
        resumeUrl: s.resumeUrl || '',
        linkedinUrl: s.linkedinUrl || '',
        portfolioUrl: s.portfolioUrl || '',
        createdAt: s.appliedAt || new Date().toISOString(),
      }))

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

   refetchCandidates()
      setApplications(prev => {
        const existingIds = new Set(prev.map(a => a.id))
        const merged = [...newApplications.filter(a => !existingIds.has(a.id)), ...prev]
        return merged
      })

      const updated = portalSubmissions.map((s: any) => ({ ...s, synced: true }))
      localStorage.setItem('hrm_portal_submissions', JSON.stringify(updated))

      if (unsynced.length > 0) {
        toast.success(`${unsynced.length} درخواست جدید از سایت استخدام همگام‌سازی شد`)
      }
    } catch (error) {
      console.error('Portal sync error:', error)
    }
  }, [refetchCandidates])

  // ── Fetch Data ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [jobsRes,  applicationsRes, interviewsRes, assessmentsRes, offersRes, deptsRes] = await Promise.all([
        fetch('/api/job-postings'),
  
        fetch('/api/job-applications'),
        fetch('/api/interviews'),
        fetch('/api/assessments'),
        fetch('/api/job-offers'),
        fetch('/api/departments'),
      ])

      if (jobsRes.ok) setJobs(safeArray(await jobsRes.json()))
      if (applicationsRes.ok) setApplications(safeArray(await applicationsRes.json()))
      if (interviewsRes.ok) setInterviews(safeArray(await interviewsRes.json()))
      if (assessmentsRes.ok) setAssessments(safeArray(await assessmentsRes.json()))
      if (offersRes.ok) setJobOffers(safeArray(await offersRes.json()))
      if (deptsRes.ok) {
        const deptData = await deptsRes.json()
        if (deptData?.data?.departments && Array.isArray(deptData.data.departments)) {
          setDepartments(deptData.data.departments)
        } else if (deptData?.departments && Array.isArray(deptData.departments)) {
          setDepartments(deptData.departments)
        } else if (Array.isArray(deptData)) {
          setDepartments(deptData)
        } else {
          setDepartments([])
        }
      }
      syncPortalSubmissions()
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('خطا در دریافت اطلاعات')
    } finally {
      setLoading(false)
    }
  }, [syncPortalSubmissions])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Stats ────────────────────────────────────────────────────
  const stats = {
    totalJobs: jobs.length,
    activeCandidates: candidates.filter((c) => c.status === 'active').length,
    totalApplications: applications.length,
    upcomingInterviews: interviews.filter((i) => i.status === 'scheduled' && new Date(i.scheduledAt) >= new Date()).length,
    activeOffers: jobOffers.filter((o) => o.status === 'draft' || o.status === 'pending').length,
    conversionRate: applications.length > 0 ? Math.round((applications.filter((a) => a.status === 'hired').length / applications.length) * 100) : 0,
    sourceBreakdown: {
      website: candidates.filter((c) => c.source === 'website').length,
      referral: candidates.filter((c) => c.source === 'referral').length,
      linkedin: candidates.filter((c) => c.source === 'linkedin').length,
      job_site: candidates.filter((c) => c.source === 'job_site').length,
      other: candidates.filter((c) => c.source === 'other').length,
    },
  }

  // ── Reports calculations ────────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────
  const handleSaveJob = async (data: any) => {
    setSubmitting(true)
    try {
      const url = selectedJob ? `/api/job-postings?id=${selectedJob.id}` : '/api/job-postings'
      const method = selectedJob ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) {
        toast.success(selectedJob ? 'آگهی ویرایش شد' : 'آگهی ثبت شد')
        setJobDialogOpen(false)
        setSelectedJob(null)
        fetchData()
      } else {
        toast.error('خطا در ذخیره آگهی')
      }
    } catch { toast.error('خطا در ارتباط با سرور') }
    finally { setSubmitting(false) }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/job-postings?id=${jobId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('آگهی حذف شد')
        fetchData()
      } else {
        toast.error('خطا در حذف آگهی')
      }
    } catch { toast.error('خطا در ارتباط با سرور') }
  }

  const handlePublishJob = async (jobId: string, status: string) => {
    try {
      const res = await fetch(`/api/job-postings/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, status }),
      })
      if (res.ok) {
        toast.success(status === 'open' ? 'آگهی منتشر شد' : 'آگهی بسته شد')
        fetchData()
      } else {
        toast.error('خطا در تغییر وضعیت')
      }
    } catch { toast.error('خطا در ارتباط با سرور') }
  }

  const handleSaveCandidate = async (data: any) => {
    setSubmitting(true)
    try {
      const url = selectedCandidate 
        ? `/api/candidates/${selectedCandidate.id}`  // ← یا این روش (Route Parameter)
        : '/api/candidates'                         // ← یا این روش (Query Parameter)
      const method = selectedCandidate ? 'PUT' : 'POST'
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      })
      if (res.ok) {
        toast.success(selectedCandidate ? 'کاندیدا ویرایش شد' : 'کاندیدا ثبت شد')
        setCandidateDialogOpen(false)
        setSelectedCandidate(null)
        refetchCandidates()
      } else {
        const err = await res.json()
        toast.error(err.error || 'خطا در ذخیره کاندیدا')
      }
    } catch { 
      toast.error('خطا در ارتباط با سرور') 
    } finally { 
      setSubmitting(false) 
    }
  }
  const handleMoveStage = async (applicationId: string, currentStage: string) => {
    const stageOrder = ['applied', 'screening', 'interview', 'testing', 'offer', 'hired']
    const idx = stageOrder.indexOf(currentStage)
    if (idx === -1 || idx >= stageOrder.length - 1) return
    const nextStage = stageOrder[idx + 1]
    try {
      const res = await fetch('/api/job-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, currentStage: nextStage, status: nextStage === 'hired' ? 'hired' : currentStage }),
      })
      if (res.ok) {
        toast.success(`مرحله تغییر کرد`)
        fetchData()
      } else {
        toast.error('خطا در تغییر مرحله')
      }
    } catch { toast.error('خطا در ارتباط با سرور') }
  }

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const res = await fetch('/api/job-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status: 'rejected', currentStage: 'rejected' }),
      })
      if (res.ok) {
        toast.success('درخواست رد شد')
        fetchData()
      } else {
        toast.error('خطا در رد درخواست')
      }
    } catch { toast.error('خطا در ارتباط با سرور') }
  }

  const handleStatusChange = (candidateId: string, newStatus: string) => {
    updateStatus.mutate({ id: candidateId, status: newStatus })
  }
  // ✅ جدید: ایجاد ارزیابی
const handleCreateAssessment = async (data: any) => {
  setSubmittingAssessment(true)
  try {
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('ارزیابی با موفقیت ایجاد شد')
      setAssessmentDialogOpen(false)
      fetchData()
    } else {
      const error = await res.json()
      toast.error(error.error || 'خطا در ایجاد ارزیابی')
    }
  } catch {
    toast.error('خطا در ارتباط با سرور')
  } finally {
    setSubmittingAssessment(false)
  }
}
const handleCreateOffer = async (data: any) => {
  setSubmittingOffer(true)
  try {
    const res = await fetch('/api/job-offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('پیشنهاد شغلی با موفقیت ایجاد شد')
      setOfferDialogOpen(false)
      fetchData()
    } else {
      const error = await res.json()
      toast.error(error.error || 'خطا در ایجاد پیشنهاد')
    }
  } catch {
    toast.error('خطا در ارتباط با سرور')
  } finally {
    setSubmittingOffer(false)
  }
}
const handleOpenOfferDialog = (application: JobApplication) => {
  setSelectedApplication(application)
  setOfferDialogOpen(true)
}
  const handleUpdateInterview = async (interviewId: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: interviewId, ...data }),
      })
      if (res.ok) {
        toast.success('مصاحبه بروزرسانی شد')
        fetchData()
      } else {
        toast.error('خطا در بروزرسانی مصاحبه')
      }
    } catch { toast.error('خطا در ارتباط با سرور') }
  }
 
const handleCreateInterview = async (data: any) => {
  setSubmittingInterview(true)
  try {
    const res = await fetch('/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('مصاحبه با موفقیت زمان‌بندی شد')
      setInterviewDialogOpen(false)
      fetchData()
    } else {
      const error = await res.json()
      toast.error(error.error || 'خطا در زمان‌بندی مصاحبه')
    }
  } catch {
    toast.error('خطا در ارتباط با سرور')
  } finally {
    setSubmittingInterview(false)
  }
}


const handleSaveScore = async (data: any) => {
  setSubmittingScore(true)
  try {
    const res = await fetch('/api/assessments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('نمره با موفقیت ثبت شد')
      setScoreDialogOpen(false)
      setSelectedAssessment(null)
      fetchData()
    } else {
      const error = await res.json()
      toast.error(error.error || 'خطا در ثبت نمره')
    }
  } catch {
    toast.error('خطا در ارتباط با سرور')
  } finally {
    setSubmittingScore(false)
  }
}

  // ── Render ───────────────────────────────────────────────────
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
        <Button variant="outline" size="sm" onClick={refetchCandidates} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
  <RefreshCw className="h-4 w-4 mr-1" />
  بروزرسانی
</Button>
          <Button size="sm" onClick={() => setJobDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
            <Plus className="h-4 w-4 mr-1" />
            آگهی جدید
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-1 h-auto rounded-xl" dir="rtl">
          <TabsTrigger value="dashboard" className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline-block" />
            داشبورد
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <Briefcase className="h-4 w-4 mr-1 hidden sm:inline-block" />
            آگهی‌ها
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <Users className="h-4 w-4 mr-1 hidden sm:inline-block" />
            کاندیداها
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <Activity className="h-4 w-4 mr-1 hidden sm:inline-block" />
            خط فرآیند
          </TabsTrigger>
          <TabsTrigger value="interviews" className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <Calendar className="h-4 w-4 mr-1 hidden sm:inline-block" />
            مصاحبه‌ها
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <ClipboardCheck className="h-4 w-4 mr-1 hidden sm:inline-block" />
            ارزیابی‌ها
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 min-w-[100px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <PieChart className="h-4 w-4 mr-1 hidden sm:inline-block" />
            گزارشات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab
            stats={stats}
            applications={applications}
            candidates={candidates}
            onApplicationClick={(app) => { setSelectedApplication(app); setApplicationDetailOpen(true) }}
          />
        </TabsContent>

        <TabsContent value="jobs">
          <JobsTab
            jobs={jobs}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            departments={departments}
            onAdd={() => setJobDialogOpen(true)}
            onEdit={(job) => { setSelectedJob(job); setJobDialogOpen(true) }}
            onDelete={handleDeleteJob}
            onPublish={handlePublishJob}
          />
        </TabsContent>

        <TabsContent value="candidates">
          <CandidatesTab
            candidates={candidates}
            loading={candidatesLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onAdd={() => setCandidateDialogOpen(true)}
            onEdit={(c) => { setSelectedCandidate(c); setCandidateDialogOpen(true) }}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="pipeline">
          <PipelineTab
            applications={applications}
            loading={loading}
            onAdd={() => setJobDialogOpen(true)}
            onMoveStage={handleMoveStage}
            onReject={handleRejectApplication}
            onCreateOffer={handleOpenOfferDialog}
          />
        </TabsContent>

        <TabsContent value="interviews">
          <InterviewsTab
            interviews={interviews}
            loading={loading}
            onAdd={() => setInterviewDialogOpen(true)}
            onUpdate={handleUpdateInterview}
          />
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentsTab
            assessments={assessments}
            loading={loading}
            onAdd={() => setAssessmentDialogOpen(true)}
            onScore={(a) => { setSelectedAssessment(a)
              setScoreDialogOpen(true) 
            }}
          />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab
            applications={applications}
            jobOffers={jobOffers}
            candidates={candidates}
            stats={stats}
            timeToFill={timeToFill}
            timeToHire={timeToHire}
            offerAcceptanceRate={offerAcceptanceRate}
            offerAccepted={offerAccepted}
            totalOffers={totalOffers}
            noShowRate={noShowRate}
            noShowInterviews={noShowInterviews}
            totalInterviews={totalInterviews}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <JobDialog
        open={jobDialogOpen}
        onClose={() => { setJobDialogOpen(false); setSelectedJob(null) }}
        onSubmit={handleSaveJob}
        initialData={selectedJob}
        departments={departments}
        submitting={submitting}
      />

      <CandidateDialog
        open={candidateDialogOpen}
        onClose={() => { setCandidateDialogOpen(false); setSelectedCandidate(null) }}
        onSubmit={handleSaveCandidate}
        initialData={selectedCandidate}
        submitting={submitting}
        jobs={jobs}
      />

      <DeleteConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          if (deleteItem) {
            handleDeleteJob(deleteItem.id)
            setDeleteItem(null)
          }
        }}
        title={deleteItem?.title || ''}
      />

      <InterviewDialog
  open={interviewDialogOpen}
  onClose={() => setInterviewDialogOpen(false)}
  onSubmit={handleCreateInterview}
  applications={applications}
  submitting={submittingInterview}
/>
<ScoreDialog
  open={scoreDialogOpen}
  onClose={() => { 
    setScoreDialogOpen(false)
    setSelectedAssessment(null)
  }}
  onSubmit={handleSaveScore}
  assessment={selectedAssessment}
  submitting={submittingScore}
/>
<AssessmentDialog
  open={assessmentDialogOpen}
  onClose={() => setAssessmentDialogOpen(false)}
  onSubmit={handleCreateAssessment}
  applications={applications}
  submitting={submittingAssessment}
/>
<OfferDialog
  open={offerDialogOpen}
  onClose={() => setOfferDialogOpen(false)}
  onSubmit={handleCreateOffer}
  applications={applications}
  submitting={submittingOffer}
/>
    </div>
  )
}

export default Recruitment