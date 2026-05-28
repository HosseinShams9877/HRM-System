import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { SYSTEM_FORMULAS } from '../../constants'

// GET /api/payroll/formulas — لیست فرمول‌ها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || '1405')

    const formulas = await db.salaryFormula.findMany({
      where: { year },
      include: { variables: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(formulas)
  } catch (error) {
    console.error('Error fetching formulas:', error)
    return NextResponse.json({ error: 'خطا در دریافت فرمول‌ها' }, { status: 500 })
  }
}

// POST /api/payroll/formulas — ایجاد فرمول جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.code || !body.name || !body.expression || !body.year) {
      return NextResponse.json(
        { error: 'کد، نام، عبارت و سال فرمول الزامی است' },
        { status: 400 }
      )
    }

    // بررسی یکتا بودن کد در سال
    const existing = await db.salaryFormula.findFirst({
      where: { code: body.code, year: body.year },
    })
    if (existing) {
      return NextResponse.json(
        { error: `فرمول با کد "${body.code}" برای سال ${body.year} قبلاً تعریف شده است` },
        { status: 400 }
      )
    }

    // ایجاد فرمول با متغیرها
    const formula = await db.salaryFormula.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
        expression: body.expression,
        year: body.year,
        isActive: body.isActive !== false,
        variables: {
          create: (body.variables || []).map((v: any) => ({
            varName: v.varName,
            sourceType: v.sourceType,
            sourceId: v.sourceId || null,
            label: v.label || v.varName,
          })),
        },
      },
      include: { variables: true },
    })

    return NextResponse.json(formula, { status: 201 })
  } catch (error) {
    console.error('Error creating formula:', error)
    return NextResponse.json({ error: 'خطا در ایجاد فرمول' }, { status: 500 })
  }
}

// PUT /api/payroll/formulas — ایجاد فرمول‌های پیش‌فرض سیستمی
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const year = body.year || 1405

    let created = 0
    let skipped = 0

    for (const def of SYSTEM_FORMULAS) {
      const existing = await db.salaryFormula.findFirst({
        where: { code: def.code, year },
      })

      if (existing) {
        skipped++
        continue
      }

      await db.salaryFormula.create({
        data: {
          code: def.code,
          name: def.name,
          description: def.description,
          expression: def.expression,
          year,
          isActive: true,
          variables: {
            create: def.variables.map(v => ({
              varName: v.varName,
              sourceType: v.sourceType,
              sourceId: v.sourceId,
              label: v.label,
            })),
          },
        },
      })
      created++
    }

    return NextResponse.json({
      message: `${created} فرمول سیستمی ایجاد شد، ${skipped} فرمول از قبل وجود داشت`,
      created,
      skipped,
    })
  } catch (error) {
    console.error('Error seeding formulas:', error)
    return NextResponse.json({ error: 'خطا در ایجاد فرمول‌های سیستمی' }, { status: 500 })
  }
}
