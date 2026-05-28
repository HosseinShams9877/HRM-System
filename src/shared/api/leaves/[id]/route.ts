import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser, hasPermission } from '@/core/lib/auth'

// PUT /api/leaves/[id] — تایید/رد/ویرایش مرخصی
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // RBAC: if approving, need leave:approve permission
    if (body.status === 'approved') {
      const sessionUser = await getSessionUser()
      if (!sessionUser) {
        return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
      }
      if (!hasPermission(sessionUser.role, 'leave:approve')) {
        return NextResponse.json({ error: 'شما اجازه تایید مرخصی را ندارید' }, { status: 403 })
      }
    }

    const leave = await db.leave.update({
      where: { id },
      data: {
        status: body.status || undefined,
        approverId: body.approverId || undefined,
        reason: body.reason || undefined,
        type: body.type || undefined,
        startDate: body.startDate || undefined,
        endDate: body.endDate || undefined,
        totalDays: body.totalDays || undefined,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true } },
      },
    })

    // اگر مرخصی تایید شد، رکورد حضور رو هم بروز کن
    if (body.status === 'approved') {
      const start = leave.startDate.split('/')
      const end = leave.endDate.split('/')
      const sy = parseInt(start[0]), sm = parseInt(start[1]), sd = parseInt(start[2])
      const ey = parseInt(end[0]), em = parseInt(end[1]), ed = parseInt(end[2])

      // ساخت لیست تاریخ‌های مرخصی (ساده - فقط روزهای ماه)
      for (let d = sd; d <= ed; d++) {
        const dateStr = `${sy}/${String(sm).padStart(2, '0')}/${String(d).padStart(2, '0')}`
        await db.attendance.upsert({
          where: { employeeId_date: { employeeId: leave.employeeId, date: dateStr } },
          update: { status: 'leave', checkIn: null, checkOut: null, workHours: 0, overtime: 0 },
          create: { employeeId: leave.employeeId, date: dateStr, status: 'leave', workHours: 0, overtime: 0 },
        })
      }
    }

    return NextResponse.json(leave)
  } catch (error) {
    console.error('Update leave error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی مرخصی' }, { status: 500 })
  }
}

// DELETE /api/leaves/[id] — حذف مرخصی
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.leave.delete({ where: { id } })
    return NextResponse.json({ message: 'مرخصی حذف شد' })
  } catch (error) {
    console.error('Delete leave error:', error)
    return NextResponse.json({ error: 'خطا در حذف مرخصی' }, { status: 500 })
  }
}
