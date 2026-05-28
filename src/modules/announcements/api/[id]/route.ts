import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/announcements/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const announcement = await db.announcement.findUnique({ where: { id } })
    if (!announcement) {
      return NextResponse.json({ error: 'اطلاعیه یافت نشد' }, { status: 404 })
    }
    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Error fetching announcement:', error)
    return NextResponse.json({ error: 'خطا در دریافت اطلاعیه' }, { status: 500 })
  }
}

// PUT /api/announcements/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, content, priority, targetAudience, department, isActive, publishDate, expiryDate } = body

    const existing = await db.announcement.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'اطلاعیه یافت نشد' }, { status: 404 })
    }

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(priority !== undefined && { priority }),
        ...(targetAudience !== undefined && { targetAudience }),
        ...(department !== undefined && { department }),
        ...(isActive !== undefined && { isActive }),
        ...(publishDate !== undefined && { publishDate }),
        ...(expiryDate !== undefined && { expiryDate }),
      },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json({ error: 'خطا در به‌روزرسانی اطلاعیه' }, { status: 500 })
  }
}

// DELETE /api/announcements/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.announcement.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'اطلاعیه یافت نشد' }, { status: 404 })
    }

    await db.announcement.delete({ where: { id } })
    return NextResponse.json({ message: 'اطلاعیه حذف شد' })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json({ error: 'خطا در حذف اطلاعیه' }, { status: 500 })
  }
}
