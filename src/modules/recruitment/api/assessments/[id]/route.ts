// src/app/api/assessments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// GET /api/assessments/[id] - دریافت جزئیات ارزیابی
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const assessment = await db.assessment.findUnique({
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

    if (!assessment) {
      return NextResponse.json({ error: 'ارزیابی یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('GET /api/assessments/[id] error:', error)
    return NextResponse.json({ error: 'خطا در دریافت ارزیابی' }, { status: 500 })
  }
}

// DELETE /api/assessments/[id] - حذف ارزیابی
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

    await db.assessment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'ارزیابی با موفقیت حذف شد' })
  } catch (error) {
    console.error('DELETE /api/assessments/[id] error:', error)
    return NextResponse.json({ error: 'خطا در حذف ارزیابی' }, { status: 500 })
  }
}