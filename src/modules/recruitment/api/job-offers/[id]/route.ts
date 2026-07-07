// src/app/api/recruitment/job-offers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// GET /api/recruitment/job-offers/[id] - دریافت جزئیات پیشنهاد شغلی
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const offer = await db.jobOffer.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'پیشنهاد شغلی یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error('GET /api/recruitment/job-offers/[id]:', error)
    return NextResponse.json({ error: 'خطا در دریافت پیشنهاد شغلی' }, { status: 500 })
  }
}

// PUT /api/recruitment/job-offers/[id] - بروزرسانی پیشنهاد شغلی
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

    const existing = await db.jobOffer.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'پیشنهاد شغلی یافت نشد' }, { status: 404 })
    }

    const offer = await db.jobOffer.update({
      where: { id },
      data: {
        status: body.status,
        employmentType: body.employmentType,
        baseSalary: body.baseSalary ? parseFloat(body.baseSalary) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        workLocation: body.workLocation,
        offerExpiryDate: body.offerExpiryDate ? new Date(body.offerExpiryDate) : null,
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

    // اگر پیشنهاد پذیرفته شد، مرحله درخواست رو به hired تغییر بده
    if (body.status === 'accepted') {
      await db.application.update({
        where: { id: offer.applicationId },
        data: {
          currentStage: 'hired',
          status: 'hired',
          updatedAt: new Date(),
        },
      })

      await db.applicationTimeline.create({
        data: {
          applicationId: offer.applicationId,
          stage: 'hired',
          description: 'پیشنهاد شغلی پذیرفته شد',
          date: new Date(),
        },
      })

      // بررسی اینکه آیا کاندیدا وجود دارد و آیا می‌تواند به Employee تبدیل شود
      const app = await db.application.findUnique({
        where: { id: offer.applicationId },
        include: { candidate: true },
      })

      if (app?.candidate) {
        // بررسی اینکه آیا کاندیدا قبلاً به Employee تبدیل شده یا نه
        const existingEmployee = await db.employee.findFirst({
          where: {
            OR: [
              { nationalCode: app.candidate.nationalId || '' },
              { email: app.candidate.email || '' },
              { phone: app.candidate.phone || '' },
            ],
          },
        })

        if (!existingEmployee) {
          // تبدیل کاندیدا به کارمند
          await db.employee.create({
            data: {
              firstName: app.candidate.firstName,
              lastName: app.candidate.lastName,
              nationalCode: app.candidate.nationalId || `NAT-${Date.now()}`,
              personnelCode: `EMP-${Date.now()}`,
              email: app.candidate.email || '',
              phone: app.candidate.phone || '',
              gender: app.candidate.gender,
              birthDate: app.candidate.birthDate,
              hireDate: new Date().toISOString().split('T')[0],
              status: 'active',
              contractType: 'official',
              department: app.jobPosting?.department || '',
              position: app.jobPosting?.title || '',
              education: app.candidate.educationLevel || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })

          // بروزرسانی CandidateOnboarding
          await db.candidateOnboarding.upsert({
            where: { candidateId: app.candidateId },
            update: {
              status: 'completed',
              startDate: new Date().toISOString().split('T')[0],
              progress: 100,
              updatedAt: new Date(),
            },
            create: {
              candidateId: app.candidateId,
              status: 'completed',
              startDate: new Date().toISOString().split('T')[0],
              progress: 100,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
        }
      }
    }

    // اگر پیشنهاد رد شد
    if (body.status === 'declined') {
      await db.application.update({
        where: { id: offer.applicationId },
        data: {
          currentStage: 'rejected',
          status: 'rejected',
          updatedAt: new Date(),
        },
      })

      await db.applicationTimeline.create({
        data: {
          applicationId: offer.applicationId,
          stage: 'rejected',
          description: 'پیشنهاد شغلی رد شد',
          date: new Date(),
        },
      })
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error('PUT /api/recruitment/job-offers/[id]:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی پیشنهاد شغلی' }, { status: 500 })
  }
}

// DELETE /api/recruitment/job-offers/[id] - حذف پیشنهاد شغلی
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

    const existing = await db.jobOffer.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'پیشنهاد شغلی یافت نشد' }, { status: 404 })
    }

    await db.jobOffer.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'پیشنهاد شغلی با موفقیت حذف شد' })
  } catch (error) {
    console.error('DELETE /api/recruitment/job-offers/[id]:', error)
    return NextResponse.json({ error: 'خطا در حذف پیشنهاد شغلی' }, { status: 500 })
  }
}