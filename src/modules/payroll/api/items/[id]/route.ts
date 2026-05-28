import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/payroll/items/[id] — دریافت یک آیتم حقوقی
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await db.payrollItem.findUnique({ where: { id } })

    if (!item) {
      return NextResponse.json({ error: 'آیتم حقوقی یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Get payroll item error:', error)
    return NextResponse.json({ error: 'خطا در دریافت آیتم حقوقی' }, { status: 500 })
  }
}

// PUT /api/payroll/items/[id] — بروزرسانی آیتم حقوقی
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.payrollItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'آیتم حقوقی یافت نشد' }, { status: 404 })
    }

    const item = await db.payrollItem.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        code: body.code !== undefined ? body.code : undefined,
        category: body.category !== undefined ? body.category : undefined,
        calculationType: body.calculationType !== undefined ? body.calculationType : undefined,
        value: body.value !== undefined ? parseFloat(String(body.value)) : undefined,
        formulaId: body.formulaId !== undefined ? body.formulaId : undefined,
        isInsurable: body.isInsurable !== undefined ? body.isInsurable : undefined,
        isTaxable: body.isTaxable !== undefined ? body.isTaxable : undefined,
        isEditable: body.isEditable !== undefined ? body.isEditable : undefined,
        isSystem: body.isSystem !== undefined ? body.isSystem : undefined,
        sortOrder: body.sortOrder !== undefined ? body.sortOrder : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        description: body.description !== undefined ? body.description : undefined,
      },
      include: { formula: { select: { id: true, code: true, name: true, expression: true } } },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Update payroll item error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی آیتم حقوقی' }, { status: 500 })
  }
}

// DELETE /api/payroll/items/[id] — حذف آیتم حقوقی
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.payrollItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'آیتم حقوقی یافت نشد' }, { status: 404 })
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'آیتم‌های سیستمی قابل حذف نیستند' },
        { status: 403 }
      )
    }

    await db.payrollItem.delete({ where: { id } })

    return NextResponse.json({ message: 'آیتم حقوقی حذف شد' })
  } catch (error) {
    console.error('Delete payroll item error:', error)
    return NextResponse.json({ error: 'خطا در حذف آیتم حقوقی' }, { status: 500 })
  }
}
