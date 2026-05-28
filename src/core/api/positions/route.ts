import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, positionCreateSchema } from '@/core/lib/validators'

// GET /api/positions — لیست پست‌های سازمانی
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const departmentId = searchParams.get('departmentId') || ''
    const status = searchParams.get('status') || ''
    const level = searchParams.get('level') || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { code: { contains: search } },
      ]
    }
    if (departmentId) where.departmentId = departmentId
    if (status) where.status = status
    if (level) where.level = level

    const positions = await db.position.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        appointments: {
          where: { status: 'active' },
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // اضافه کردن تعداد اشغال شده
    const enriched = positions.map(pos => ({
      ...pos,
      occupiedCount: pos.appointments.length,
      availableCount: pos.headcount - pos.appointments.length,
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Get positions error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست پست‌ها' }, { status: 500 })
  }
}

// POST /api/positions — ثبت پست سازمانی جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validation = validateWithZod(positionCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    // بررسی تکراری نبودن کد پست
    const existing = await db.position.findFirst({
      where: { code: body.code },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'کد پست تکراری است' },
        { status: 400 }
      )
    }

    const position = await db.position.create({
      data: {
        title: body.title,
        code: body.code,
        level: body.level || null,
        departmentId: body.departmentId || null,
        jobGrade: body.jobGrade || null,
        minSalary: body.minSalary ? parseFloat(body.minSalary) : null,
        maxSalary: body.maxSalary ? parseFloat(body.maxSalary) : null,
        description: body.description || null,
        requirements: body.requirements || null,
        headcount: body.headcount ? parseInt(body.headcount) : 1,
        status: body.status || 'active',
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    })

    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    console.error('Create position error:', error)
    return NextResponse.json({ error: 'خطا در ثبت پست سازمانی' }, { status: 500 })
  }
}
