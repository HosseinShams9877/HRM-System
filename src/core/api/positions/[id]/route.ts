import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/positions/[id] — جزئیات پست سازمانی
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const position = await db.position.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        appointments: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!position) {
      return NextResponse.json({ error: 'پست سازمانی یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(position)
  } catch (error) {
    console.error('Get position error:', error)
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات پست' }, { status: 500 })
  }
}

// PUT /api/positions/[id] — ویرایش پست سازمانی
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const position = await db.position.update({
      where: { id },
      data: {
        title: body.title,
        code: body.code,
        level: body.level,
        departmentId: body.departmentId,
        jobGrade: body.jobGrade,
        minSalary: body.minSalary ? parseFloat(body.minSalary) : null,
        maxSalary: body.maxSalary ? parseFloat(body.maxSalary) : null,
        description: body.description,
        requirements: body.requirements,
        headcount: body.headcount ? parseInt(body.headcount) : undefined,
        status: body.status,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    })

    return NextResponse.json(position)
  } catch (error) {
    console.error('Update position error:', error)
    return NextResponse.json({ error: 'خطا در ویرایش پست سازمانی' }, { status: 500 })
  }
}

// DELETE /api/positions/[id] — حذف (غیرفعال‌سازی) پست سازمانی
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // بررسی اینکه پست انتصاب فعال دارد یا نه
    const activeAppointments = await db.appointment.count({
      where: { positionId: id, status: 'active' },
    })

    if (activeAppointments > 0) {
      return NextResponse.json(
        { error: `این پست ${activeAppointments} انتصاب فعال دارد و قابل حذف نیست` },
        { status: 400 }
      )
    }

    await db.position.update({
      where: { id },
      data: { status: 'inactive' },
    })

    return NextResponse.json({ message: 'پست سازمانی غیرفعال شد' })
  } catch (error) {
    console.error('Delete position error:', error)
    return NextResponse.json({ error: 'خطا در حذف پست سازمانی' }, { status: 500 })
  }
}
