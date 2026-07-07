// src/app/api/job-postings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// GET /api/job-postings - لیست آگهی‌ها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const departmentId = searchParams.get('departmentId') || ''
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (status) where.status = status
    if (departmentId) where.departmentId = departmentId
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const jobPostings = await db.jobPosting.findMany({
      where,
      include: {
        department: true,
        applications: {
          select: {
            id: true,
            status: true,
            candidateId: true,
            appliedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // تبدیل به فرمت مورد نیاز فرانت
    const formatted = jobPostings.map((job) => ({
      ...job,
      applications: job.applications.length,
      department: job.department || { name: job.department || '' },
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('GET /api/job-postings error:', error)
    return NextResponse.json({ error: 'خطا در دریافت آگهی‌ها' }, { status: 500 })
  }
}

// POST /api/job-postings - ایجاد آگهی جدید
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const body = await req.json()

    const jobPosting = await db.jobPosting.create({
      data: {
        title: body.title,
        departmentId: body.departmentId,
        description: body.description,
        requirements: body.requirements,
        responsibilities: body.responsibilities,
        qualifications: body.qualifications,
        benefits: body.benefits,
        salaryMin: parseFloat(body.salaryMin) || 0,
        salaryMax: parseFloat(body.salaryMax) || 0,
        salaryType: body.salaryType || 'monthly',
        employmentType: body.employmentType || 'full-time',
        experienceMin: parseInt(body.experienceMin) || 0,
        experienceMax: parseInt(body.experienceMax) || 0,
        educationLevel: body.educationLevel,
        location: body.location,
        remoteWork: body.remoteWork || false,
        deadline: body.deadline,
        status: body.status || 'draft',
        createdBy: sessionUser.id,
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json(jobPosting, { status: 201 })
  } catch (error) {
    console.error('POST /api/job-postings error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد آگهی' }, { status: 500 })
  }
}