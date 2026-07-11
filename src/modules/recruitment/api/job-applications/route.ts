// src/app/api/job-applications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// GET /api/job-applications - لیست درخواست‌ها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const stage = searchParams.get('stage') || ''
    const jobId = searchParams.get('jobId') || ''
    const candidateId = searchParams.get('candidateId') || ''

    const where: any = {}
    if (status) where.status = status
    if (stage) where.currentStage = stage
    if (jobId) where.jobPostingId = jobId
    if (candidateId) where.candidateId = candidateId

    const applications = await db.application.findMany({
      where,
      include: {
        candidate: true,
        jobPosting: {
          include: {
            department: true,
          },
        },
        interviews: true,
        timeline: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { appliedAt: 'desc' },
    })

    const formatted = applications.map((app) => ({
      id: app.id,
      jobId: app.jobPostingId,
      candidateId: app.candidateId,
      candidate: app.candidate,
      job: {
        ...app.jobPosting,
        department: app.jobPosting.department,
      },
      coverLetter: app.notes,
      expectedSalary: 0,
      status: app.status,
      currentStage: app.currentStage,
      matchScore: 0,
      screeningScore: 0,
      appliedAt: app.appliedAt,
      interviews: app.interviews,
      timeline: app.timeline,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('GET /api/job-applications error:', error)
    return NextResponse.json({ error: 'خطا در دریافت درخواست‌ها' }, { status: 500 })
  }
}
// POST /api/job-applications - ثبت درخواست جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1. اول کاندیدا رو پیدا کن یا ایجاد کن
    let candidate = await db.candidate.findFirst({
      where: { email: body.email }
    })

    if (!candidate) {
      candidate = await db.candidate.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          nationalId: body.nationalId || '',
          gender: body.gender || '',
          city: body.city || '',
          educationLevel: body.educationLevel || '',
          educationField: body.educationField || '',
          university: body.university || '',
          experienceYears: parseInt(body.experienceYears) || 0,
          currentCompany: body.currentCompany || '',
          skills: Array.isArray(body.skills) ? body.skills.join('، ') : '',
          linkedinUrl: body.linkedinUrl || '',
          portfolioUrl: body.portfolioUrl || '',
          resumeUrl: body.resumeUrl || '',
          source: 'website',
          status: 'active',
        }
      })
    }

    // 2. بعد درخواست رو ایجاد کن
    const application = await db.application.create({
      data: {
        jobPostingId: body.jobId,
        candidateId: candidate.id,
        notes: body.coverLetter || '',
        status: 'pending',
        currentStage: 'applied',
        appliedAt: new Date(),
      },
      include: {
        candidate: true,
        jobPosting: {
          include: {
            department: true,
          },
        },
      },
    })

    // 3. تایم‌لاین ثبت کن
    await db.applicationTimeline.create({
      data: {
        applicationId: application.id,
        stage: 'applied',
        description: 'درخواست استخدام ثبت شد',
        date: new Date(),
      },
    })

    // 4. افزایش تعداد درخواست‌های آگهی
    await db.jobPosting.update({
      where: { id: body.jobId },
      data: {
        applicationCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      id: application.id,
      applicationId: application.id,
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/job-applications error:', error)
    return NextResponse.json(
      { error: 'خطا در ثبت درخواست' },
      { status: 500 }
    )
  }
}

// PUT /api/job-applications - بروزرسانی درخواست
export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const body = await req.json()
    const { id, status, currentStage, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'شناسه درخواست الزامی است' }, { status: 400 })
    }

    const application = await db.application.update({
      where: { id },
      data: {
        status: status,
        currentStage: currentStage,
        notes: notes,
        updatedAt: new Date(),
      },
      include: {
        candidate: true,
        jobPosting: true,
      },
    })

    // ثبت تایم‌لاین
    if (currentStage) {
      await db.applicationTimeline.create({
        data: {
          applicationId: id,
          stage: currentStage,
          description: `مرحله به "${currentStage}" تغییر کرد`,
          date: new Date(),
        },
      })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('PUT /api/job-applications error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی درخواست' }, { status: 500 })
  }
}