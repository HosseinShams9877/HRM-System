import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/payroll/formulas/[id] — دریافت یک فرمول
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formula = await db.salaryFormula.findUnique({
      where: { id },
      include: { variables: true, payrollItems: true },
    })

    if (!formula) {
      return NextResponse.json({ error: 'فرمول یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(formula)
  } catch (error) {
    console.error('Error fetching formula:', error)
    return NextResponse.json({ error: 'خطا در دریافت فرمول' }, { status: 500 })
  }
}

// PUT /api/payroll/formulas/[id] — ویرایش فرمول
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.salaryFormula.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'فرمول یافت نشد' }, { status: 404 })
    }

    // اگر کد تغییر کرده، بررسی یکتا بودن
    if (body.code && body.code !== existing.code) {
      const duplicate = await db.salaryFormula.findFirst({
        where: { code: body.code, year: body.year || existing.year, id: { not: id } },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: `فرمول با کد "${body.code}" قبلاً تعریف شده است` },
          { status: 400 }
        )
      }
    }

    // ویرایش فرمول
    const formula = await db.salaryFormula.update({
      where: { id },
      data: {
        code: body.code ?? existing.code,
        name: body.name ?? existing.name,
        description: body.description !== undefined ? body.description : existing.description,
        expression: body.expression ?? existing.expression,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      },
      include: { variables: true },
    })

    // اگر متغیرها هم ارسال شده، جایگزین کن
    if (body.variables && Array.isArray(body.variables)) {
      // حذف متغیرهای قبلی
      await db.salaryFormulaVariable.deleteMany({
        where: { formulaId: id },
      })

      // ایجاد متغیرهای جدید
      await db.salaryFormulaVariable.createMany({
        data: body.variables.map((v: any) => ({
          formulaId: id,
          varName: v.varName,
          sourceType: v.sourceType,
          sourceId: v.sourceId || null,
          label: v.label || v.varName,
        })),
      })

      // بارگذاری مجدد با متغیرهای جدید
      const reloaded = await db.salaryFormula.findUnique({
        where: { id },
        include: { variables: true },
      })
      return NextResponse.json(reloaded)
    }

    return NextResponse.json(formula)
  } catch (error) {
    console.error('Error updating formula:', error)
    return NextResponse.json({ error: 'خطا در ویرایش فرمول' }, { status: 500 })
  }
}

// DELETE /api/payroll/formulas/[id] — حذف فرمول
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.salaryFormula.findUnique({
      where: { id },
      include: { payrollItems: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'فرمول یافت نشد' }, { status: 404 })
    }

    // بررسی استفاده در آیتم‌های حقوقی
    if (existing.payrollItems.length > 0) {
      return NextResponse.json(
        { error: `این فرمول در ${existing.payrollItems.length} آیتم حقوقی استفاده شده و قابل حذف نیست. ابتدا اتصال را حذف کنید.` },
        { status: 400 }
      )
    }

    // حذف متغیرها و فرمول
    await db.salaryFormulaVariable.deleteMany({ where: { formulaId: id } })
    await db.salaryFormula.delete({ where: { id } })

    return NextResponse.json({ message: 'فرمول حذف شد' })
  } catch (error) {
    console.error('Error deleting formula:', error)
    return NextResponse.json({ error: 'خطا در حذف فرمول' }, { status: 500 })
  }
}
