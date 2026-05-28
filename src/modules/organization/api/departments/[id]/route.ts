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
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.department.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'دپارتمان یافت نشد' }, { status: 404 })
    }

    // بررسی یکتا بودن کد (اگر تغییر کرده)
    if (body.code && body.code !== existing.code) {
      const duplicate = await db.department.findFirst({
        where: { code: body.code, id: { not: id } },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'کد دپارتمان تکراری است' },
          { status: 400 }
        )
      }
    }

    // بررسی چرخه والد-فرزندی
    if (body.parentId) {
      if (body.parentId === id) {
        return NextResponse.json(
          { error: 'دپارتمان نمی‌تواند زیرمجموعه خودش باشد' },
          { status: 400 }
        )
      }
    }

    const department = await db.department.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        code: body.code ?? existing.code,
        managerId: body.managerId !== undefined ? body.managerId : existing.managerId,
        parentId: body.parentId !== undefined ? body.parentId : existing.parentId,
      },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true } },
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Update department error:', error)
    return NextResponse.json({ error: 'خطا در ویرایش دپارتمان' }, { status: 500 })
  }
}

// DELETE /api/departments/[id] — حذف دپارتمان
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.department.findUnique({
      where: { id },
      include: {
        children: true,
        positions: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'دپارتمان یافت نشد' }, { status: 404 })
    }

    // بررسی وجود زیرمجموعه
    if (existing.children.length > 0) {
      return NextResponse.json(
        { error: `این دپارتمان ${existing.children.length} زیرمجموعه دارد و قابل حذف نیست` },
        { status: 400 }
      )
    }

    // بررسی وجود پست سازمانی
    if (existing.positions.length > 0) {
      return NextResponse.json(
        { error: `این دپارتمان ${existing.positions.length} پست سازمانی دارد و قابل حذف نیست` },
        { status: 400 }
      )
    }

    await db.department.delete({ where: { id } })

    return NextResponse.json({ message: 'دپارتمان حذف شد' })
  } catch (error) {
    console.error('Delete department error:', error)
    return NextResponse.json({ error: 'خطا در حذف دپارتمان' }, { status: 500 })
  }
}
