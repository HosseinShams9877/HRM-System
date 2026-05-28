import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/regulations/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const regulation = await db.regulation.findUnique({ where: { id } })
    if (!regulation) {
      return NextResponse.json({ error: 'آیین‌نامه یافت نشد' }, { status: 404 })
    }
    return NextResponse.json(regulation)
  } catch (error) {
    console.error('Error fetching regulation:', error)
    return NextResponse.json({ error: 'خطا در دریافت آیین‌نامه' }, { status: 500 })
  }
}

// PUT /api/regulations/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, content, category, version, filePath, isActive, publishDate } = body

    const existing = await db.regulation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'آیین‌نامه یافت نشد' }, { status: 404 })
    }

    const regulation = await db.regulation.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(version !== undefined && { version }),
        ...(filePath !== undefined && { filePath }),
        ...(isActive !== undefined && { isActive }),
        ...(publishDate !== undefined && { publishDate }),
      },
    })

    return NextResponse.json(regulation)
  } catch (error) {
    console.error('Error updating regulation:', error)
    return NextResponse.json({ error: 'خطا در به‌روزرسانی آیین‌نامه' }, { status: 500 })
  }
}

// DELETE /api/regulations/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.regulation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'آیین‌نامه یافت نشد' }, { status: 404 })
    }

    await db.regulation.delete({ where: { id } })
    return NextResponse.json({ message: 'آیین‌نامه حذف شد' })
  } catch (error) {
    console.error('Error deleting regulation:', error)
    return NextResponse.json({ error: 'خطا در حذف آیین‌نامه' }, { status: 500 })
  }
}
