import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/payroll/items — لیست آیتم‌های حقوقی
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (year) where.year = parseInt(year)
    if (category) where.category = category
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'

    const items = await db.payrollItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      include: { formula: { select: { id: true, code: true, name: true, expression: true } } },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Get payroll items error:', error)
    return NextResponse.json({ error: 'خطا در دریافت آیتم‌های حقوقی' }, { status: 500 })
  }
}

// POST /api/payroll/items — ایجاد آیتم حقوقی جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.title || !body.code || !body.category || !body.calculationType || !body.year) {
      return NextResponse.json(
        { error: 'عنوان، کد، دسته‌بندی، نوع محاسبه و سال الزامی است' },
        { status: 400 }
      )
    }

    // بررسی عدم تکرار کد
    const existing = await db.payrollItem.findUnique({
      where: { code: body.code },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'این کد آیتم قبلاً ثبت شده است' },
        { status: 409 }
      )
    }

    const item = await db.payrollItem.create({
      data: {
        title: body.title,
        code: body.code,
        category: body.category, // allowance | deduction
        calculationType: body.calculationType, // fixed | percentage | formula
        value: parseFloat(String(body.value || 0)),
        formulaId: body.formulaId || null,
        isInsurable: body.isInsurable !== undefined ? body.isInsurable : true,
        isTaxable: body.isTaxable !== undefined ? body.isTaxable : true,
        isEditable: body.isEditable !== undefined ? body.isEditable : true,
        isSystem: body.isSystem || false,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
        year: parseInt(String(body.year)),
        description: body.description || null,
      },
      include: { formula: true },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Create payroll item error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد آیتم حقوقی' }, { status: 500 })
  }
}

// PUT /api/payroll/items — بروزرسانی دسته‌ای
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.items && Array.isArray(body.items)) {
      // بروزرسانی ترتیب نمایش دسته‌ای
      const updates = body.items.map((item: { id: string; sortOrder: number }) =>
        db.payrollItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
      await Promise.all(updates)
      return NextResponse.json({ message: 'ترتیب نمایش بروزرسانی شد' })
    }

    return NextResponse.json({ error: 'درخواست نامعتبر' }, { status: 400 })
  } catch (error) {
    console.error('Batch update payroll items error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی آیتم‌ها' }, { status: 500 })
  }
}
