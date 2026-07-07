// src/app/api/job-postings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// GET /api/job-postings/[id] - دریافت جزئیات آگهی
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const jobPosting = await db.jobPosting.findUnique({
      where: { id },
      include: {
        department: true,
        applications: {
          include: {
            candidate: true,
          },
        },
      },
    })

    if (!jobPosting) {
      return NextResponse.json({ error: 'آگهی یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(jobPosting)
  } catch (error) {
    console.error('GET /api/job-postings/[id] error:', error)
    return NextResponse.json({ error: 'خطا در دریافت آگهی' }, { status: 500 })
  }
}

// PUT /api/job-postings/[id] - ویرایش آگهی
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await db.jobPosting.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'آگهی یافت نشد' }, { status: 404 })
    }

    const jobPosting = await db.jobPosting.update({
      where: { id },
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
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json(jobPosting)
  } catch (error) {
    console.error('PUT /api/job-postings/[id] error:', error)
    return NextResponse.json({ error: 'خطا در ویرایش آگهی' }, { status: 500 })
  }
}

// DELETE /api/job-postings/[id] - حذف آگهی
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.jobPosting.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'آگهی یافت نشد' }, { status: 404 })
    }

    await db.jobPosting.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'آگهی با موفقیت حذف شد' })
  } catch (error) {
    console.error('DELETE /api/job-postings/[id] error:', error)
    return NextResponse.json({ error: 'خطا در حذف آگهی' }, { status: 500 })
  }
}