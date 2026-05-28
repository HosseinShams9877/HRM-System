import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// PUT /api/holidays/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.holiday.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'تعطیلی یافت نشد' }, { status: 404 })
    }

    const holiday = await db.holiday.update({
      where: { id },
      data: {
        title: body.title || undefined,
        date: body.date || undefined,
        type: body.type || undefined,
        isRecurring: body.isRecurring !== undefined ? body.isRecurring : undefined,
        description: body.description !== undefined ? body.description : undefined,
      },
    })

    return NextResponse.json(holiday)
  } catch (error) {
    console.error('Update holiday error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی' }, { status: 500 })
  }
}

// DELETE /api/holidays/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.holiday.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'تعطیلی یافت نشد' }, { status: 404 })
    }

    await db.holiday.delete({ where: { id } })
    return NextResponse.json({ message: 'تعطیلی حذف شد' })
  } catch (error) {
    console.error('Delete holiday error:', error)
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 })
  }
}
