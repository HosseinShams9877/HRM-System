// src/app/api/job-offers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// GET /api/job-offers - لیست پیشنهادات شغلی
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''

    const where: any = {}
    if (status) where.status = status

    const offers = await db.jobOffer.findMany({
      where,
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(offers)
  } catch (error) {
    console.error('GET /api/job-offers error:', error)
    return NextResponse.json({ error: 'خطا در دریافت پیشنهادات' }, { status: 500 })
  }
}

// POST /api/job-offers - ایجاد پیشنهاد شغلی جدید
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const body = await req.json()

    const offer = await db.jobOffer.create({
      data: {
        applicationId: body.applicationId,
        employmentType: body.employmentType || 'full_time',
        baseSalary: body.baseSalary ? parseFloat(body.baseSalary) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        workLocation: body.workLocation || 'onsite',
        offerExpiryDate: body.offerExpiryDate ? new Date(body.offerExpiryDate) : null,
        status: 'pending',
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

    // بروزرسانی مرحله درخواست به offer
    await db.application.update({
      where: { id: body.applicationId },
      data: {
        currentStage: 'offer',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    console.error('POST /api/job-offers error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد پیشنهاد' }, { status: 500 })
  }
}