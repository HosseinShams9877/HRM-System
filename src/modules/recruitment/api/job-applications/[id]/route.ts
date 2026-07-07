// src/app/api/job-applications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/job-applications/[id] - دریافت جزئیات درخواست
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const application = await db.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        jobPosting: {
          include: {
            department: true,
          },
        },
        interviews: {
          include: {
            evaluations: true,
          },
        },
        timeline: {
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'درخواست یافت نشد' }, { status: 404 })
    }

    const formatted = {
      ...application,
      job: application.jobPosting,
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('GET /api/job-applications/[id] error:', error)
    return NextResponse.json({ error: 'خطا در دریافت درخواست' }, { status: 500 })
  }
}