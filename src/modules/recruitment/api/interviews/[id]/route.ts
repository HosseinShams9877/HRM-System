// src/app/api/interviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// PUT /api/interviews/[id] - بروزرسانی مصاحبه
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

    const data: any = {}
    if (body.status) data.status = body.status
    if (body.result) data.result = body.result
    if (body.notes) data.notes = body.notes
    if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt)
    if (body.duration) data.duration = parseInt(body.duration)
    if (body.location) data.location = body.location
    if (body.meetingLink) data.meetingLink = body.meetingLink

    const interview = await db.interview.update({
      where: { id },
      data,
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
    })

    // اگر مصاحبه کامل شد و نتیجه ثبت شد
    if (body.status === 'completed' && body.result) {
      const nextStage = body.result === 'passed' ? 'offer' : 'rejected'
      await db.application.update({
        where: { id: interview.applicationId },
        data: {
          currentStage: nextStage,
          status: nextStage === 'rejected' ? 'rejected' : 'pending',
          updatedAt: new Date(),
        },
      })

      await db.applicationTimeline.create({
        data: {
          applicationId: interview.applicationId,
          stage: nextStage,
          description: `مصاحبه ${body.result === 'passed' ? 'قبول' : 'رد'} شد`,
          date: new Date(),
        },
      })
    }

    return NextResponse.json(interview)
  } catch (error) {
    console.error('PUT /api/interviews/[id] error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی مصاحبه' }, { status: 500 })
  }
}