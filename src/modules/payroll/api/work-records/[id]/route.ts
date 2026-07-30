import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { db } from '@/core/lib/db'

// ============================================
// GET /api/payroll/work-records/:id
// ============================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { id } = await params

    const record = await db.monthlyWorkRecord.findUnique({
      where: { id },
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

// ============================================
// PUT /api/payroll/work-records/:id
// ============================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'payroll:manage')) {
      return NextResponse.json({ error: 'شما اجازه این عمل را ندارید' }, { status: 403 })
    }

    // ✅ دریافت id با await
    const { id } = await params
    const body = await req.json()

    console.log('🔍 PUT - ID:', id)
    console.log('🔍 PUT - Body:', body)

    // بررسی وجود رکورد
    const existing = await db.monthlyWorkRecord.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'کارکرد یافت نشد' }, { status: 404 })
    }

    // ساخت داده‌های به‌روزرسانی با مقادیر موجود
    const updateData: any = {
      status: body.status || existing.status,
    }

    // فقط فیلدهایی که در body وجود دارند را به‌روزرسانی کن
    if (body.workDays !== undefined) updateData.workDays = body.workDays
    if (body.normalHours !== undefined) updateData.normalHours = body.normalHours
    if (body.overtimeHours !== undefined) updateData.overtimeHours = body.overtimeHours
    if (body.nightShiftHours !== undefined) updateData.nightShiftHours = body.nightShiftHours
    if (body.shiftType !== undefined) updateData.shiftType = body.shiftType
    if (body.fridayWorkHours !== undefined) updateData.fridayWorkHours = body.fridayWorkHours
    if (body.holidayWorkHours !== undefined) updateData.holidayWorkHours = body.holidayWorkHours
    if (body.missionDays !== undefined) updateData.missionDays = body.missionDays
    if (body.leaveDays !== undefined) updateData.leaveDays = body.leaveDays
    if (body.unpaidLeaveDays !== undefined) updateData.unpaidLeaveDays = body.unpaidLeaveDays
    if (body.absenceDays !== undefined) updateData.absenceDays = body.absenceDays
    if (body.delayHours !== undefined) updateData.delayHours = body.delayHours
    if (body.earlyLeaveHours !== undefined) updateData.earlyLeaveHours = body.earlyLeaveHours
    if (body.shortWorkHours !== undefined) updateData.shortWorkHours = body.shortWorkHours
    if (body.notes !== undefined) updateData.notes = body.notes

    const record = await db.monthlyWorkRecord.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ record })
  } catch (error) {
    console.error('PUT work-record error:', error)
    return NextResponse.json({ 
      error: 'خطا در بروزرسانی کارکرد',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================
// DELETE /api/payroll/work-records/:id
// ============================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'payroll:manage')) {
      return NextResponse.json({ error: 'شما اجازه این عمل را ندارید' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.monthlyWorkRecord.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'کارکرد یافت نشد' }, { status: 404 })
    }

    await db.monthlyWorkRecord.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE work-record error:', error)
    return NextResponse.json({ 
      error: 'خطا در حذف کارکرد',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}