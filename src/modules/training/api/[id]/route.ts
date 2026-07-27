import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await db.training.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true, position: true } },
          },
        },
      },
    })
    if (!item) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) { 
    console.error('GET training error:', error)
    return NextResponse.json({ error: 'خطا' }, { status: 500 }) 
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const existing = await db.training.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })

    // ✅ maxScore رو به allowedFields اضافه کن
    const allowedFields = ['title', 'instructor', 'startDate', 'endDate', 'location', 'status', 'description', 'capacity', 'category', 'duration', 'maxScore']
    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // ✅ برای maxScore اطمینان حاصل کن که عدد هست
        if (field === 'maxScore') {
          data[field] = body[field] ? parseInt(body[field]) : null
        } else {
          data[field] = body[field] || null
        }
      }
    }

    const item = await db.training.update({ where: { id }, data })
    return NextResponse.json(item)
  } catch (error) { 
    console.error('PUT training error:', error)
    return NextResponse.json({ error: 'خطا' }, { status: 500 }) 
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.training.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    await db.trainingParticipant.deleteMany({ where: { trainingId: id } })
    await db.training.delete({ where: { id } })
    return NextResponse.json({ message: 'حذف شد' })
  } catch (error) { 
    console.error('DELETE training error:', error)
    return NextResponse.json({ error: 'خطا' }, { status: 500 }) 
  }
}