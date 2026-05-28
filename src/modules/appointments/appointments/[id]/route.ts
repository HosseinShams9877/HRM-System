import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/appointments/[id] — جزئیات انتصاب
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, avatar: true, department: true } },
        position: { include: { department: { select: { id: true, name: true } } } },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'انتصاب یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات انتصاب' }, { status: 500 })
  }
}

// PUT /api/appointments/[id] — ویرایش انتصاب
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        type: body.type,
        startDate: body.startDate,
        endDate: body.endDate,
        decreeNumber: body.decreeNumber,
        status: body.status,
        notes: body.notes,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, avatar: true, department: true } },
        position: { include: { department: { select: { id: true, name: true } } } },
      },
    })

    // اگر وضعیت به ended تغییر کرد، بروزرسانی پست کارمند
    if (body.status === 'ended' && appointment.employee) {
      // پیدا کردن انتصاب فعال بعدی
      const nextActive = await db.appointment.findFirst({
        where: {
          employeeId: appointment.employee.id,
          status: 'active',
          id: { not: id },
        },
        include: { position: { include: { department: true } } },
      })

      if (nextActive) {
        await db.employee.update({
          where: { id: appointment.employee.id },
          data: {
            position: nextActive.position.title,
            department: nextActive.position.department?.name || null,
            jobGrade: nextActive.position.jobGrade || null,
          },
        })
      } else {
        await db.employee.update({
          where: { id: appointment.employee.id },
          data: {
            position: null,
            jobGrade: null,
          },
        })
      }
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json({ error: 'خطا در ویرایش انتصاب' }, { status: 500 })
  }
}

// DELETE /api/appointments/[id] — لغو انتصاب
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ message: 'انتصاب لغو شد' })
  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json({ error: 'خطا در لغو انتصاب' }, { status: 500 })
  }
}
