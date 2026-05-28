import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// PUT /api/shifts/[id] — بروزرسانی شیفت
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.workShift.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'شیفت یافت نشد' }, { status: 404 })
    }

    // بروزرسانی اطلاعات پایه شیفت
    const shift = await db.workShift.update({
      where: { id },
      data: {
        name: body.name || undefined,
        code: body.code || undefined,
        color: body.color || undefined,
        description: body.description !== undefined ? body.description : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
      include: {
        schedules: { orderBy: { dayOfWeek: 'asc' } },
      },
    })

    // اگر برنامه هفتگی جدید ارسال شده
    if (body.schedules && Array.isArray(body.schedules)) {
      // حذف برنامه‌های قبلی
      await db.shiftSchedule.deleteMany({ where: { shiftId: id } })

      // ایجاد برنامه‌های جدید
      await db.shiftSchedule.createMany({
        data: body.schedules.map((s: Record<string, unknown>) => ({
          shiftId: id,
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
      })

      // برگرداندن شیفت آپدیت شده با برنامه‌های جدید
      const updated = await db.workShift.findUnique({
        where: { id },
        include: {
          schedules: { orderBy: { dayOfWeek: 'asc' } },
          assignments: {
            where: { status: 'active' },
            include: {
              employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true } },
            },
          },
        },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Update shift error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی شیفت' }, { status: 500 })
  }
}

// DELETE /api/shifts/[id] — حذف شیفت
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.workShift.findUnique({
      where: { id },
      include: { _count: { select: { assignments: { where: { status: 'active' } } } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'شیفت یافت نشد' }, { status: 404 })
    }

    if (existing._count.assignments > 0) {
      return NextResponse.json(
        { error: `این شیفت ${existing._count.assignments} انتساب فعال دارد. ابتدا انتساب‌ها را حذف کنید.` },
        { status: 400 }
      )
    }

    // حذف برنامه‌ها و خود شیفت
    await db.shiftSchedule.deleteMany({ where: { shiftId: id } })
    await db.workShift.delete({ where: { id } })

    return NextResponse.json({ message: 'شیفت حذف شد' })
  } catch (error) {
    console.error('Delete shift error:', error)
    return NextResponse.json({ error: 'خطا در حذف شیفت' }, { status: 500 })
  }
}
