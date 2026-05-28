import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await db.performance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
          }
        }
      }
    })
    if (!item) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const existing = await db.performance.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })

    // اگر وضعیت به reviewed تغییر کرد و reviewerId ارسال نشده، یک مقدار پیش‌فرض قرار بده
    const data: any = { ...body }
    if (body.status === 'reviewed' && !body.reviewerId) {
      data.reviewerId = 'system'
    }

    const item = await db.performance.update({
      where: { id },
      data,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
          }
        }
      }
    })
    return NextResponse.json(item)
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const existing = await db.performance.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })

    const data: any = {}
    if (body.status) {
      data.status = body.status
      if (body.status === 'reviewed') {
        data.reviewerId = body.reviewerId || 'system'
      }
    }

    const item = await db.performance.update({
      where: { id },
      data,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
          }
        }
      }
    })
    return NextResponse.json(item)
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.performance.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    await db.performance.delete({ where: { id } })
    return NextResponse.json({ message: 'حذف شد' })
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}
