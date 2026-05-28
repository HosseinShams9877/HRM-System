import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET participants of a training
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const training = await db.training.findUnique({ where: { id } })
    if (!training) return NextResponse.json({ error: 'دوره یافت نشد' }, { status: 404 })

    const participants = await db.trainingParticipant.findMany({
      where: { trainingId: id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(participants)
  } catch (error) {
    return NextResponse.json({ error: 'خطا در دریافت شرکت‌کنندگان' }, { status: 500 })
  }
}

// POST add participant to training
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { employeeId, status } = body

    if (!employeeId) return NextResponse.json({ error: 'شناسه کارمند الزامی است' }, { status: 400 })

    const training = await db.training.findUnique({ where: { id } })
    if (!training) return NextResponse.json({ error: 'دوره یافت نشد' }, { status: 404 })

    const employee = await db.employee.findUnique({ where: { id: employeeId } })
    if (!employee) return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })

    // Check for duplicate
    const existing = await db.trainingParticipant.findUnique({
      where: { trainingId_employeeId: { trainingId: id, employeeId } },
    })
    if (existing) return NextResponse.json({ error: 'این کارمند قبلاً ثبت‌نام شده است' }, { status: 409 })

    const participant = await db.trainingParticipant.create({
      data: {
        trainingId: id,
        employeeId,
        status: status || 'registered',
      },
      include: { employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true } } },
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'خطا در افزودن شرکت‌کننده' }, { status: 500 })
  }
}

// DELETE remove participant from training
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const participantId = searchParams.get('participantId')

    if (!participantId) return NextResponse.json({ error: 'شناسه شرکت‌کننده الزامی است' }, { status: 400 })

    const participant = await db.trainingParticipant.findUnique({ where: { id: participantId } })
    if (!participant) return NextResponse.json({ error: 'شرکت‌کننده یافت نشد' }, { status: 404 })
    if (participant.trainingId !== id) return NextResponse.json({ error: 'عدم تطابق' }, { status: 400 })

    await db.trainingParticipant.delete({ where: { id: participantId } })
    return NextResponse.json({ message: 'شرکت‌کننده حذف شد' })
  } catch (error) {
    return NextResponse.json({ error: 'خطا در حذف شرکت‌کننده' }, { status: 500 })
  }
}
