import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { db } from '@/core/lib/db'

// GET /api/payroll/work-records
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const year = Number(searchParams.get('year'))
    const month = Number(searchParams.get('month'))
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    if (year) where.year = year
    if (month) where.month = month
    if (employeeId) where.employeeId = employeeId
    if (status && status !== 'all') where.status = status

    // جستجو در نام کارمند
    if (search) {
      where.employee = {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { personnelCode: { contains: search } },
        ],
      }
    }

    const records = await db.monthlyWorkRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personnelCode: true,
            avatar: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { employee: { firstName: 'asc' } },
      ],
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('GET work-records error:', error)
    return NextResponse.json({ error: 'خطا در دریافت کارکردها' }, { status: 500 })
  }
}

// POST /api/payroll/work-records
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'payroll:manage')) {
      return NextResponse.json({ error: 'شما اجازه این عمل را ندارید' }, { status: 403 })
    }

    const body = await req.json()

    // بررسی وجود کارکرد قبلی
    const existing = await db.monthlyWorkRecord.findFirst({
      where: {
        employeeId: body.employeeId,
        year: body.year,
        month: body.month,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'کارکرد این ماه قبلاً ثبت شده است' },
        { status: 409 }
      )
    }

    const record = await db.monthlyWorkRecord.create({
      data: {
        employeeId: body.employeeId,
        year: body.year,
        month: body.month,
        workDays: body.workDays || 30,
        normalHours: body.normalHours || 0,
        overtimeHours: body.overtimeHours || 0,
        nightShiftHours: body.nightShiftHours || 0,
        shiftType: body.shiftType,
        fridayWorkHours: body.fridayWorkHours || 0,
        holidayWorkHours: body.holidayWorkHours || 0,
        missionDays: body.missionDays || 0,
        leaveDays: body.leaveDays || 0,
        unpaidLeaveDays: body.unpaidLeaveDays || 0,
        absenceDays: body.absenceDays || 0,
        delayHours: body.delayHours || 0,
        earlyLeaveHours: body.earlyLeaveHours || 0,
        shortWorkHours: body.shortWorkHours || 0,
        notes: body.notes,
        status: 'draft',
      },
    })

    return NextResponse.json({ record }, { status: 201 })
  } catch (error) {
    console.error('POST work-records error:', error)
    return NextResponse.json({ error: 'خطا در ثبت کارکرد' }, { status: 500 })
  }
}