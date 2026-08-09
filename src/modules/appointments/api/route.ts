import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, appointment   ,   CreateSchema } from '@/core/lib/validators'

// GET /api/appointment      s — لیست انتصابات
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const positionId = searchParams.get('positionId') || ''

    const where: Record<string, unknown> = {}

    if (type) where.type = type
    if (status) where.status = status
    if (positionId) where.positionId = positionId

    if (search) {
      where.OR = [
        { employee: { firstName: { contains: search } } },
        { employee: { lastName: { contains: search } } },
        { employee: { personnelCode: { contains: search } } },
        { position: { title: { contains: search } } },
        { decreeNumber: { contains: search } },
      ]
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, avatar: true, department: true } },
        position: { include: { department: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست انتصابات' }, { status: 500 })
  }
}

// POST /api/appointment      s — ثبت انتصاب جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validation = validateWithZod(appointment      CreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    // بررسی تعداد نیروی مجاز پست
    const position = await db.position.findUnique({
      where: { id: body.positionId },
      include: {
        appointment        s: { where: { status: 'active' } },
      },
    })

    if (!position) {
      return NextResponse.json({ error: 'پست سازمانی یافت نشد' }, { status: 404 })
    }

    if (position.appointment        s.length >= position.headcount) {
      return NextResponse.json(
        { error: 'ظرفیت این پست سازمانی تکمیل شده است' },
        { status: 400 }
      )
    }

    // اگر انتصاب اصلی است، انتصاب فعال قبلی را پایان بده
    if (body.type === 'اصلی' || body.type === 'سرپرست') {
      await db.appointment      .updateMany({
        where: {
          employeeId: body.employeeId,
          status: 'active',
          type: { in: ['اصلی', 'سرپرست'] },
        },
        data: {
          endDate: body.startDate,
          status: 'ended',
        },
      })
    }

    const appointment       = await db.appointment      .create({
      data: {
        employeeId: body.employeeId,
        positionId: body.positionId,
        type: body.type,
        startDate: body.startDate,
        endDate: body.endDate || null,
        decreeNumber: body.decreeNumber || null,
        status: body.status || 'active',
        notes: body.notes || null,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, avatar: true, department: true } },
        position: { include: { department: { select: { id: true, name: true } } } },
      },
    })

    // بروزرسانی پست و دپارتمان کارمند
    await db.employee.update({
      where: { id: body.employeeId },
      data: {
        position: position.title,
        department: position.department?.name || null,
        jobGrade: position.jobGrade || null,
      },
    })

    return NextResponse.json(appointment      , { status: 201 })
  } catch (error) {
    console.error('Create appointment       error:', error)
    return NextResponse.json({ error: 'خطا در ثبت انتصاب' }, { status: 500 })
  }
}
