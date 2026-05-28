import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// PUT /api/shift-assignments/[id] — بروزرسانی/پایان انتساب
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.employeeShiftAssignment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'انتساب یافت نشد' }, { status: 404 })
    }

    if (body.action === 'end') {
      // پایان انتساب
      const assignment = await db.employeeShiftAssignment.update({
        where: { id },
        data: {
          status: 'ended',
          endDate: body.endDate || existing.startDate,
        },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true } },
          shift: { select: { id: true, name: true, code: true, color: true } },
        },
      })
      return NextResponse.json(assignment)
    }

    // بروزرسانی عمومی
    const assignment = await db.employeeShiftAssignment.update({
      where: { id },
      data: {
        shiftId: body.shiftId || undefined,
        startDate: body.startDate || undefined,
        endDate: body.endDate !== undefined ? body.endDate : undefined,
        isDefault: body.isDefault !== undefined ? body.isDefault : undefined,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true } },
        shift: { select: { id: true, name: true, code: true, color: true } },
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Update shift assignment error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی انتساب' }, { status: 500 })
  }
}

// DELETE /api/shift-assignments/[id] — حذف انتساب
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.employeeShiftAssignment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'انتساب یافت نشد' }, { status: 404 })
    }

    await db.employeeShiftAssignment.delete({ where: { id } })

    return NextResponse.json({ message: 'انتساب حذف شد' })
  } catch (error) {
    console.error('Delete shift assignment error:', error)
    return NextResponse.json({ error: 'خطا در حذف انتساب' }, { status: 500 })
  }
}
