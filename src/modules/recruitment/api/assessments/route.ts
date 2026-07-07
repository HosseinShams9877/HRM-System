// src/app/api/assessments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// GET /api/assessments - لیست ارزیابی‌ها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const assessments = await db.assessment.findMany({
      where,
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('GET /api/assessments error:', error)
    return NextResponse.json({ error: 'خطا در دریافت ارزیابی‌ها' }, { status: 500 })
  }
}

// POST /api/assessments - ایجاد ارزیابی جدید
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const body = await req.json()

    const assessment = await db.assessment.create({
      data: {
        applicationId: body.applicationId,
        type: body.type || 'written_test',
        title: body.title,
        passScore: parseFloat(body.passScore) || 60,
        deadline: body.deadline ? new Date(body.deadline) : null,
        status: 'assigned',
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

    return NextResponse.json(assessment, { status: 201 })
  } catch (error) {
    console.error('POST /api/assessments error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد ارزیابی' }, { status: 500 })
  }
}

// PUT /api/assessments - بروزرسانی ارزیابی (ثبت نمره)
export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const body = await req.json()
    const { id, score, result, status, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'شناسه ارزیابی الزامی است' }, { status: 400 })
    }

    const assessment = await db.assessment.update({
      where: { id },
      data: {
        score: score ? parseFloat(score) : undefined,
        result: result,
        status: status || (result ? 'completed' : 'in_progress'),
        notes: notes,
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

    // اگر قبول شد، مرحله به offer بره
    if (result === 'passed') {
      await db.application.update({
        where: { id: assessment.applicationId },
        data: {
          currentStage: 'offer',
          updatedAt: new Date(),
        },
      })

      await db.applicationTimeline.create({
        data: {
          applicationId: assessment.applicationId,
          stage: 'offer',
          description: 'ارزیابی با موفقیت پشت سر گذاشته شد',
          date: new Date(),
        },
      })
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('PUT /api/assessments error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی ارزیابی' }, { status: 500 })
  }
}