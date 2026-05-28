import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser, hasPermission } from '@/core/lib/auth'

// PUT /api/missions/[id] — تایید/رد/ویرایش مأموریت
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // RBAC: if approving, need mission:approve permission
    if (body.status === 'approved') {
      const sessionUser = await getSessionUser()
      if (!sessionUser) {
        return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
      }
      if (!hasPermission(sessionUser.role, 'mission:approve')) {
        return NextResponse.json({ error: 'شما اجازه تایید مأموریت را ندارید' }, { status: 403 })
      }
    }

    const mission = await db.mission.update({
      where: { id },
      data: {
        status: body.status || undefined,
        approverId: body.approverId || undefined,
        title: body.title || undefined,
        destination: body.destination || undefined,
        startDate: body.startDate || undefined,
        endDate: body.endDate || undefined,
        totalDays: body.totalDays || undefined,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true } },
      },
    })

    // اگر مأموریت تایید شد، رکورد حضور رو هم بروز کن
    if (body.status === 'approved') {
      const start = mission.startDate.split('/')
      const end = mission.endDate.split('/')
      const sy = parseInt(start[0]), sm = parseInt(start[1]), sd = parseInt(start[2])
      const ey = parseInt(end[0]), em = parseInt(end[1]), ed = parseInt(end[2])

      for (let d = sd; d <= ed; d++) {
        const dateStr = `${sy}/${String(sm).padStart(2, '0')}/${String(d).padStart(2, '0')}`
        await db.attendance.upsert({
          where: { employeeId_date: { employeeId: mission.employeeId, date: dateStr } },
          update: { status: 'mission', checkIn: null, checkOut: null, workHours: 0, overtime: 0 },
          create: { employeeId: mission.employeeId, date: dateStr, status: 'mission', workHours: 0, overtime: 0 },
        })
      }
    }

    return NextResponse.json(mission)
  } catch (error) {
    console.error('Update mission error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی مأموریت' }, { status: 500 })
  }
}

// DELETE /api/missions/[id] — حذف مأموریت
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.mission.delete({ where: { id } })
    return NextResponse.json({ message: 'مأموریت حذف شد' })
  } catch (error) {
    console.error('Delete mission error:', error)
    return NextResponse.json({ error: 'خطا در حذف مأموریت' }, { status: 500 })
  }
}
