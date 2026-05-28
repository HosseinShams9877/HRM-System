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

    const validation = validateWithZod(departmentCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    const existing = await db.department.findFirst({
      where: { code: body.code },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'کد دپارتمان تکراری است' },
        { status: 400 }
      )
    }

    const department = await db.department.create({
      data: {
        name: body.name,
        code: body.code,
        managerId: body.managerId || null,
        parentId: body.parentId || null,
      },
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error('Create department error:', error)
    return NextResponse.json({ error: 'خطا در ثبت دپارتمان' }, { status: 500 })
  }
}
