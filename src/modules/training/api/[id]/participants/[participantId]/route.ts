import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// PUT update participant score/status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; participantId: string }> }) {
  try {
    const { id, participantId } = await params
    const body = await req.json()
    const { status, score } = body

    const participant = await db.trainingParticipant.findUnique({ where: { id: participantId } })
    if (!participant) return NextResponse.json({ error: 'شرکت‌کننده یافت نشد' }, { status: 404 })
    if (participant.trainingId !== id) return NextResponse.json({ error: 'عدم تطابق' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (score !== undefined) updateData.score = score

    const updated = await db.trainingParticipant.update({
      where: { id: participantId },
      data: updateData,
      include: { employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'خطا در بروزرسانی شرکت‌کننده' }, { status: 500 })
  }
}
