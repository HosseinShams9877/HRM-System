import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod } from '@/core/lib/validators'
import  { shiftCreateSchema } from '../lib/validators'

// GET /api/shifts — لیست شیفت‌ها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const activeOnly = searchParams.get('active') === 'true'

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }
    if (activeOnly) where.isActive = true

    const shifts = await db.workShift.findMany({
      where,
      include: {
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        assignments: {
          where: { status: 'active' },
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true, position: true } },
          },
        },
        _count: { select: { assignments: { where: { status: 'active' } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const stats = {
      total: shifts.length,
      active: shifts.filter(s => s.isActive).length,
      totalEmployees: shifts.reduce((sum, s) => sum + s._count.assignments, 0),
    }

    return NextResponse.json({ shifts, stats })
  } catch (error) {
    console.error('Get shifts error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست شیفت‌ها' }, { status: 500 })
  }
}

// POST /api/shifts — ایجاد شیفت جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validation = validateWithZod(shiftCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    // بررسی تکراری نبودن کد
    const existing = await db.workShift.findUnique({ where: { code: body.code } })
    if (existing) {
      return NextResponse.json({ error: 'کد شیفت تکراری است' }, { status: 400 })
    }

    const shift = await db.workShift.create({
      data: {
        name: body.name,
        code: body.code,
        color: body.color || '#10b981',
        description: body.description || null,
        isActive: body.isActive !== false,
        schedules: {
          create: (body.schedules || []).map((s: Record<string, unknown>) => ({
            dayOfWeek: s.dayOfWeek as number,
            dayName: s.dayName as string,
            isWorkingDay: s.isWorkingDay !== false,
            startTime: (s.startTime as string) || '08:00',
            endTime: (s.endTime as string) || '17:00',
            breakStart: (s.breakStart as string) || null,
            breakEnd: (s.breakEnd as string) || null,
            lateThreshold: (s.lateThreshold as string) || null,
            earlyLeaveThreshold: (s.earlyLeaveThreshold as string) || null,
            minWorkHours: (s.minWorkHours as number) || 8,
          })),
        },
      },
      include: {
        schedules: { orderBy: { dayOfWeek: 'asc' } },
      },
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error('Create shift error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد شیفت' }, { status: 500 })
  }
}
