import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { db } from '@/core/lib/db'

// GET /api/payroll/work-records/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const record = await db.monthlyWorkRecord.findUnique({
      where: { id: params.id },
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
    })

    if (!record) {
      return NextResponse.json({ error: 'کارکرد یافت نشد' }, { status: 404 })
    }

    return NextResponse.json({ record })
  } catch (error) {
    console.error('GET work-record error:', error)
    return NextResponse.json({ error: 'خطا در دریافت کارکرد' }, { status: 500 })
  }
}

// PUT /api/payroll/work-records/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'payroll:manage')) {
      return NextResponse.json({ error: 'شما اجازه این عمل را ندارید' }, { status: 403 })
    }

    const body = await req.json()
    const { id } = params

    const record = await db.monthlyWorkRecord.update({
      where: { id },
      data: {
        workDays: body.workDays,
        normalHours: body.normalHours,
        overtimeHours: body.overtimeHours,
        nightShiftHours: body.nightShiftHours,
        shiftType: body.shiftType,
        fridayWorkHours: body.fridayWorkHours,
        holidayWorkHours: body.holidayWorkHours,
        missionDays: body.missionDays,
        leaveDays: body.leaveDays,
        unpaidLeaveDays: body.unpaidLeaveDays,
        absenceDays: body.absenceDays,
        delayHours: body.delayHours,
        earlyLeaveHours: body.earlyLeaveHours,
        shortWorkHours: body.shortWorkHours,
        notes: body.notes,
        status: body.status || 'draft',
      },
    })

    return NextResponse.json({ record })
  } catch (error) {
    console.error('PUT work-record error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی کارکرد' }, { status: 500 })
  }
}

// DELETE /api/payroll/work-records/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'payroll:manage')) {
      return NextResponse.json({ error: 'شما اجازه این عمل را ندارید' }, { status: 403 })
    }

    await db.monthlyWorkRecord.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE work-record error:', error)
    return NextResponse.json({ error: 'خطا در حذف کارکرد' }, { status: 500 })
  }
}