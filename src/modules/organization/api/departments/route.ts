import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, departmentCreateSchema } from '@/core/lib/validators'

// GET /api/departments — لیست دپارتمان‌ها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }

    const departments = await db.department.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, code: true } },
        positions: { select: { id: true, title: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Get departments error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست دپارتمان‌ها' }, { status: 500 })
  }
}

// POST /api/departments — ثبت دپارتمان جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, code, managerId, parentId } = body

    const department = await db.department.create({
      data: {
        name,
        code,
        managerId: managerId || null,
        parentId: parentId || null,
      },
    })

    // ✅ اگر managerId مشخص شده، یک Appointment هم ایجاد کن
    if (managerId) {
      // پیدا کردن یا ایجاد سمت "مدیر دپارتمان"
      let managerPosition = await db.position.findFirst({
        where: { code: `DEPT_MGR_${code}` },
      })

      if (!managerPosition) {
        managerPosition = await db.position.create({
          data: {
            title: `مدیر ${name}`,
            code: `DEPT_MGR_${code}`,
            departmentId: department.id,
            headcount: 1,
          },
        })
      }

      // ایجاد حکم انتصاب
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

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    // ...
  }
}