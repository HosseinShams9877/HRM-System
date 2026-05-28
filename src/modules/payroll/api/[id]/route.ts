import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/payroll/[id] — دریافت یک فیش حقوقی
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const paySlip = await db.paySlip.findUnique({
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
            maritalStatus: true,
            childrenCount: true,
            contractType: true,
            nationalCode: true,
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            payrollItem: {
              select: {
                id: true,
                code: true,
                category: true,
                calculationType: true,
                formulaId: true,
                formula: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!paySlip) {
      return NextResponse.json({ error: 'فیش حقوقی یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(paySlip)
  } catch (error) {
    console.error('Get payslip error:', error)
    return NextResponse.json({ error: 'خطا در دریافت فیش حقوقی' }, { status: 500 })
  }
}

// PUT /api/payroll/[id] — بروزرسانی فیش حقوقی
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.paySlip.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'فیش حقوقی یافت نشد' }, { status: 404 })
    }

    // فیش‌های پرداخت‌شده یا بسته‌شده قابل ویرایش نیستند
    if (existing.status === 'paid' || existing.status === 'closed') {
      return NextResponse.json(
        { error: 'فیش حقوقی پرداخت‌شده یا بسته‌شده قابل ویرایش نیست' },
        { status: 403 }
      )
    }

    // ─── تغییر وضعیت ساده ───
    if (body.status && !body.items) {
      const validTransitions: Record<string, string[]> = {
        draft: ['confirmed'],
        confirmed: ['paid', 'draft'],
        paid: ['closed', 'confirmed'],
      }

      const allowed = validTransitions[existing.status] || []
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `تغییر وضعیت از "${existing.status}" به "${body.status}" مجاز نیست` },
          { status: 400 }
        )
      }

      const updated = await db.paySlip.update({
        where: { id },
        data: { status: body.status },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              personnelCode: true,
              department: true,
              position: true,
            },
          },
          items: { orderBy: { sortOrder: 'asc' } },
        },
      })

      return NextResponse.json(updated)
    }

    // ─── بروزرسانی کامل با آیتم‌ها ───
    const baseSalary = body.baseSalary !== undefined ? parseFloat(String(body.baseSalary)) : existing.baseSalary
    const workDays = body.workDays !== undefined ? parseFloat(String(body.workDays)) : existing.workDays
    const overtimeHours = body.overtimeHours !== undefined ? parseFloat(String(body.overtimeHours)) : existing.overtimeHours
    const notes = body.notes !== undefined ? body.notes : existing.notes

    let totalAllowances = 0
    let totalDeductions = 0

    // اگر آیتم‌های جدید ارائه شده
    if (body.items && Array.isArray(body.items)) {
      // حذف آیتم‌های قبلی
      await db.paySlipItem.deleteMany({ where: { paySlipId: id } })

      for (const item of body.items) {
        const amount = parseFloat(String(item.amount || 0))
        if (item.category === 'allowance') {
          totalAllowances += amount
        } else {
          totalDeductions += amount
        }
      }

      // ایجاد آیتم‌های جدید
      await db.paySlipItem.createMany({
        data: body.items.map((item: { title: string; category: string; amount: number; payrollItemId?: string | null; sortOrder?: number }, index: number) => ({
          paySlipId: id,
          title: item.title,
          category: item.category,
          amount: parseFloat(String(item.amount || 0)),
          payrollItemId: item.payrollItemId || null,
          sortOrder: item.sortOrder ?? index,
        })),
      })
    } else {
      // استفاده از مقادیر موجود
      totalAllowances = existing.totalAllowances
      totalDeductions = existing.totalDeductions
    }

    const grossSalary = baseSalary + totalAllowances
    const netSalary = grossSalary - totalDeductions

    const updated = await db.paySlip.update({
      where: { id },
      data: {
        baseSalary,
        totalAllowances,
        totalDeductions,
        grossSalary,
        netSalary,
        workDays,
        overtimeHours,
        notes,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personnelCode: true,
            department: true,
            position: true,
          },
        },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update payslip error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی فیش حقوقی' }, { status: 500 })
  }
}

// DELETE /api/payroll/[id] — حذف فیش حقوقی (فقط پیش‌نویس)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.paySlip.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'فیش حقوقی یافت نشد' }, { status: 404 })
    }

    // فقط فیش‌های پیش‌نویس قابل حذف هستند
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'فقط فیش‌های حقوقی با وضعیت پیش‌نویس قابل حذف هستند' },
        { status: 403 }
      )
    }

    // حذف فیش (آیتم‌ها به صورت Cascade حذف می‌شوند)
    await db.paySlip.delete({ where: { id } })

    return NextResponse.json({ message: 'فیش حقوقی حذف شد' })
  } catch (error) {
    console.error('Delete payslip error:', error)
    return NextResponse.json({ error: 'خطا در حذف فیش حقوقی' }, { status: 500 })
  }
}
