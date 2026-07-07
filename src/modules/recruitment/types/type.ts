// src/modules/recruitment/components/types.ts
export interface Recruitment {
    id: string
    title: string
    department: string | null
    position: string | null
    status: string
    applicants: number
    createdAt: string
    updatedAt: string
  }
  // src/modules/recruitment/components/types.ts
export interface Candidate {
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

export interface JobPosting {
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

export interface JobApplication {
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

export interface Interview {
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

export interface InterviewEvaluation {
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

export interface ApplicationEvaluation {
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

export interface Assessment {
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

export interface JobOffer {
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

export interface Department {
  id: string
  name: string
}