// src/modules/recruitment/api/interviews/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

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
    if (body.link) data.link = body.link
    if (body.type) data.type = body.type

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

    // ✅ اگر مصاحبه کامل شد و نتیجه داشت
    if (body.status === 'completed' && body.result) {
      const passed = body.result === 'passed'
      const nextStage = passed ? 'testing' : 'rejected'
      
      // 1️⃣ بروزرسانی Application
      await db.application.update({
        where: { id: interview.applicationId },
        data: {
          currentStage: nextStage,
          status: nextStage === 'rejected' ? 'rejected' : 'pending',
          updatedAt: new Date(),
        },
      })

      // 2️⃣ ثبت تایم‌لاین
      await db.applicationTimeline.create({
        data: {
          applicationId: interview.applicationId,
          stage: nextStage,
          description: passed ? 'مصاحبه قبول شد - منتظر آزمون' : 'مصاحبه رد شد',
          date: new Date(),
        },
      })

      // 3️⃣ ✅ اگر قبول شد، خودکار آزمون بساز
      if (passed) {
        // چک کن که قبلاً آزمونی برای این درخواست ساخته نشده باشه
        const existingAssessment = await db.assessment.findFirst({
          where: { applicationId: interview.applicationId }
        })

        if (!existingAssessment) {
          const assessment = await db.assessment.create({
            data: {
              applicationId: interview.applicationId,
              type: 'technical_exam',
              title: `آزمون تخصصی - ${interview.application.candidate?.firstName || ''} ${interview.application.candidate?.lastName || ''}`,
              status: 'assigned',
              passScore: 60,
              deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // ۱۴ روز بعد
              assignedAt: new Date(),
            },
          })

          console.log('✅ آزمون خودکار ساخته شد:', assessment.id)
        }
      }
    }

    return NextResponse.json(interview)
  } catch (error) {
    console.error('PUT /api/interviews/[id] error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی مصاحبه' }, { status: 500 })
  }
}

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

    const existing = await db.interview.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'مصاحبه یافت نشد' }, { status: 404 })
    }

    await db.interview.delete({
      where: { id },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'مصاحبه با موفقیت حذف شد' 
    })
  } catch (error) {
    console.error('DELETE /api/interviews/[id] error:', error)
    return NextResponse.json({ error: 'خطا در حذف مصاحبه' }, { status: 500 })
  }
}