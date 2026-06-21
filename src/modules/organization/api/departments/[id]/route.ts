import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/departments/[id] — دریافت اطلاعات یک دپارتمان
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const department = await db.department.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true } },
        positions: { select: { id: true, title: true, code: true } },
      },
    })

    if (!department) {
      return NextResponse.json({ error: 'دپارتمان یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error('Get department error:', error)
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات دپارتمان' }, { status: 500 })
  }
}

// PUT /api/departments/[id] — ویرایش دپارتمان
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, code, managerId, parentId } = body

    const oldDepartment = await db.department.findUnique({
      where: { id },
      include: { positions: { where: { code: { startsWith: 'DEPT_MGR_' } } } },
    })

    // بروزرسانی دپارتمان
    const department = await db.department.update({
      where: { id },
      data: {
        name: name ?? oldDepartment?.name,
        code: code ?? oldDepartment?.code,
        managerId: managerId !== undefined ? managerId : oldDepartment?.managerId,
        parentId: parentId !== undefined ? parentId : oldDepartment?.parentId,
      },
    })

    // ✅ اگر managerId تغییر کرده
    if (managerId !== undefined && managerId !== oldDepartment?.managerId) {
      // پیدا کردن سمت مدیریت
      let managerPosition = await db.position.findFirst({
        where: { code: `DEPT_MGR_${code ?? oldDepartment?.code}` },
      })

      if (!managerPosition) {
        managerPosition = await db.position.create({
          data: {
            title: `مدیر ${name ?? oldDepartment?.name}`,
            code: `DEPT_MGR_${code ?? oldDepartment?.code}`,
            departmentId: department.id,
            headcount: 1,
          },
        })
      }

      // پایان حکم قبلی (اگه وجود داشته)
      if (oldDepartment?.managerId) {
        await db.appointment.updateMany({
          where: {
            employeeId: oldDepartment.managerId,
            positionId: managerPosition.id,
            status: 'active',
          },
          data: { status: 'ended', endDate: new Date().toISOString().split('T')[0] },
        })
      }

      // ایجاد حکم جدید (اگه manager جدید انتخاب شده)
      if (managerId) {
        await db.appointment.create({
          data: {
            employeeId: managerId,
            positionId: managerPosition.id,
            type: 'main',
            startDate: new Date().toISOString().split('T')[0],
            status: 'active',
          },
        })
      }
    }

    return NextResponse.json(department)
  } catch (error) {
    // ...
  }
}

// DELETE /api/departments/[id] — حذف دپارتمان
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // بررسی وجود دپارتمان با اطلاعات کامل
    const existing = await db.department.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            positions: {
              include: {
                appointments: {
                  include: { employee: true }
                }
              }
            }
          }
        },
        positions: {
          include: {
            appointments: {
              include: { employee: true }
            }
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'دپارتمان یافت نشد' }, { status: 404 })
    }

    // جمع‌آوری همه positionهای مربوطه
    const allPositions = [...existing.positions, ...existing.children.flatMap(c => c.positions)]
    const allPositionIds = allPositions.map(p => p.id)

    // جمع‌آوری همه کارمندانی که به این positionها متصل هستند
    const affectedEmployees: string[] = []
    for (const position of allPositions) {
      const appointments = await db.appointment.findMany({
        where: {
          positionId: position.id,
          status: 'active'
        },
        include: { employee: true }
      })
      for (const app of appointments) {
        if (app.employee) {
          affectedEmployees.push(app.employee.id)
        }
      }
    }

    // ✅ استفاده از تراکنش
    await db.$transaction(async (tx) => {
      // 1️⃣ به‌روزرسانی کارمندان: position و department را null کن
      for (const employeeId of affectedEmployees) {
        await tx.employee.update({
          where: { id: employeeId },
          data: {
            position: null,
            department: null
          }
        })
      }

      // 2️⃣ حذف همه انتصابات (Appointment) مربوط به positionها
      if (allPositionIds.length > 0) {
        await tx.appointment.deleteMany({
          where: {
            positionId: { in: allPositionIds }
          }
        })
      }

      // 3️⃣ حذف همه positionهای مربوطه
      if (allPositionIds.length > 0) {
        await tx.position.deleteMany({
          where: {
            id: { in: allPositionIds }
          }
        })
      }

      // 4️⃣ حذف زیرمجموعه‌ها
      for (const child of existing.children) {
        await tx.department.delete({
          where: { id: child.id }
        })
      }

      // 5️⃣ حذف دپارتمان اصلی
      await tx.department.delete({
        where: { id }
      })
    })

    return NextResponse.json({ 
      message: 'دپارتمان و تمام سمت‌های مرتبط حذف شدند',
      details: {
        departmentId: id,
        positionsDeleted: allPositions.length,
        employeesUpdated: affectedEmployees.length,
        childrenDeleted: existing.children.length
      }
    })
  } catch (error) {
    console.error('Delete department error:', error)
    return NextResponse.json({ 
      error: 'خطا در حذف دپارتمان', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}