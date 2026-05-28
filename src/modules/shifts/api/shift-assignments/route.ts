import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import { validateWithZod, shiftAssignmentCreateSchema } from '@/core/lib/validators'

// GET /api/shift-assignments — لیست انتساب شیفت‌ها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shiftId = searchParams.get('shiftId') || ''
    const employeeId = searchParams.get('employeeId') || ''
    const department = searchParams.get('department') || ''
    const status = searchParams.get('status') || 'active'
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (shiftId) where.shiftId = shiftId
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status
    if (department) {
      where.employee = { department }
    }
    if (search) {
      where.OR = [
        { employee: { firstName: { contains: search } } },
        { employee: { lastName: { contains: search } } },
        { employee: { personnelCode: { contains: search } } },
      ]
    }

    const assignments = await db.employeeShiftAssignment.findMany({
      where,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true, position: true, avatar: true },
        },
        shift: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
      orderBy: [{ startDate: 'desc' }],
    })

    // شیفت فعلی هر کارمند (بدون endDate)
    const today = getTodayShamsi()
    const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`

    return NextResponse.json({ assignments, today: todayStr })
  } catch (error) {
    console.error('Get shift assignments error:', error)
    return NextResponse.json({ error: 'خطا در دریافت انتساب‌ها' }, { status: 500 })
  }
}

// POST /api/shift-assignments — انتساب شیفت به کارمند
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validation = validateWithZod(shiftAssignmentCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    // بررسی وجود شیفت
    const shift = await db.workShift.findUnique({ where: { id: body.shiftId } })
    if (!shift) {
      return NextResponse.json({ error: 'شیفت یافت نشد' }, { status: 404 })
    }

    // پایان انتساب قبلی فعال اگر هست
    if (body.endPrevious !== false) {
      const today = getTodayShamsi()
      const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
      await db.employeeShiftAssignment.updateMany({
        where: {
          employeeId: body.employeeId,
          status: 'active',
          endDate: null,
        },
        data: {
          endDate: body.startDate,
          status: 'ended',
        },
      })
    }

    const assignment = await db.employeeShiftAssignment.create({
      data: {
        employeeId: body.employeeId,
        shiftId: body.shiftId,
        startDate: body.startDate,
        endDate: body.endDate || null,
        isDefault: body.isDefault || false,
        status: 'active',
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true } },
        shift: { select: { id: true, name: true, code: true, color: true } },
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Create shift assignment error:', error)
    return NextResponse.json({ error: 'خطا در انتساب شیفت' }, { status: 500 })
  }
}
