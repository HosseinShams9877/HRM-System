import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// PUT /api/payroll/tax-brackets/[id] — بروزرسانی یک پله مالیاتی
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.taxBracket.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'پله مالیاتی یافت نشد' }, { status: 404 })
    }

    const bracket = await db.taxBracket.update({
      where: { id },
      data: {
        orderNum: body.orderNum !== undefined ? parseInt(String(body.orderNum)) : undefined,
        minAmount: body.minAmount !== undefined ? parseFloat(String(body.minAmount)) : undefined,
        maxAmount: body.maxAmount !== undefined ? parseFloat(String(body.maxAmount)) : undefined,
        rate: body.rate !== undefined ? parseFloat(String(body.rate)) : undefined,
      },
    })

    return NextResponse.json(bracket)
  } catch (error) {
    console.error('Update tax bracket error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی پله مالیاتی' }, { status: 500 })
  }
}

// DELETE /api/payroll/tax-brackets/[id] — حذف یک پله مالیاتی
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.taxBracket.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'پله مالیاتی یافت نشد' }, { status: 404 })
    }

    await db.taxBracket.delete({ where: { id } })

    return NextResponse.json({ message: 'پله مالیاتی حذف شد' })
  } catch (error) {
    console.error('Delete tax bracket error:', error)
    return NextResponse.json({ error: 'خطا در حذف پله مالیاتی' }, { status: 500 })
  }
}
