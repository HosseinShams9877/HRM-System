// src/app/api/interviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// GET /api/interviews - لیست مصاحبه‌ها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const interviews = await db.interview.findMany({
      where,
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    })

    const formatted = interviews.map((i) => ({
      id: i.id,
      applicationId: i.applicationId,
      candidateId: i.application.candidateId,
      jobId: i.application.jobPostingId,
      candidate: i.application.candidate,
      job: i.application.jobPosting,
      type: i.type,
      round: i.round,
      scheduledAt: i.scheduledAt,
      duration: i.duration,
      location: i.location,
      meetingLink: i.meetingLink,
      status: i.status,
      result: i.result,
      notes: i.notes,
      reminderSent: i.reminderSent,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('GET /api/interviews error:', error)
    return NextResponse.json({ error: 'خطا در دریافت مصاحبه‌ها' }, { status: 500 })
  }
}

// POST /api/interviews - ایجاد مصاحبه جدید
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const body = await req.json()

    const interview = await db.interview.create({
      data: {
        applicationId: body.applicationId,
        interviewerId: body.interviewerId || null,
        type: body.type || 'onsite',
        scheduledAt: new Date(body.scheduledAt),
        duration: parseInt(body.duration) || 60,
        location: body.location,
        meetingLink: body.meetingLink,
        status: 'scheduled',
        notes: body.notes,
      },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
    })

    // بروزرسانی مرحله درخواست به interview
    await db.application.update({
      where: { id: body.applicationId },
      data: {
        currentStage: 'interview',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(interview, { status: 201 })
  } catch (error) {
    console.error('POST /api/interviews error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد مصاحبه' }, { status: 500 })
  }
}