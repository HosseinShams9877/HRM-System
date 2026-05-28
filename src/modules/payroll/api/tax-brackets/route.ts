import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/payroll/tax-brackets — لیست پله‌های مالیاتی
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')

    const where: Record<string, unknown> = {}
    if (year) where.year = parseInt(year)

    const brackets = await db.taxBracket.findMany({
      where,
      orderBy: { orderNum: 'asc' },
    })

    return NextResponse.json({ brackets })
  } catch (error) {
    console.error('Get tax brackets error:', error)
    return NextResponse.json({ error: 'خطا در دریافت پله‌های مالیاتی' }, { status: 500 })
  }
}

// POST /api/payroll/tax-brackets — ایجاد پله مالیاتی
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.year || body.orderNum === undefined || body.rate === undefined) {
      return NextResponse.json(
        { error: 'سال، شماره پله و نرخ الزامی است' },
        { status: 400 }
      )
    }

    const bracket = await db.taxBracket.create({
      data: {
        year: parseInt(String(body.year)),
        orderNum: parseInt(String(body.orderNum)),
        minAmount: parseFloat(String(body.minAmount || 0)),
        maxAmount: parseFloat(String(body.maxAmount || 0)),
        rate: parseFloat(String(body.rate)),
      },
    })

    return NextResponse.json(bracket, { status: 201 })
  } catch (error) {
    console.error('Create tax bracket error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد پله مالیاتی' }, { status: 500 })
  }
}

// PUT /api/payroll/tax-brackets — بروزرسانی دسته‌ای پله‌ها
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.year && body.brackets && Array.isArray(body.brackets)) {
      const year = parseInt(String(body.year))

      // حذف پله‌های قبلی
      await db.taxBracket.deleteMany({ where: { year } })

      // ایجاد پله‌های جدید
      const brackets = await db.taxBracket.createMany({
        data: body.brackets.map((b: { orderNum: number; minAmount: number; maxAmount: number; rate: number }) => ({
          year,
          orderNum: b.orderNum,
          minAmount: parseFloat(String(b.minAmount)),
          maxAmount: parseFloat(String(b.maxAmount)),
          rate: parseFloat(String(b.rate)),
        })),
      })

      return NextResponse.json({ count: brackets.count })
    }

    return NextResponse.json({ error: 'درخواست نامعتبر' }, { status: 400 })
  } catch (error) {
    console.error('Batch update tax brackets error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی پله‌های مالیاتی' }, { status: 500 })
  }
}

// DELETE /api/payroll/tax-brackets — حذف پله‌های یک سال
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')

    if (!year) {
      return NextResponse.json({ error: 'سال الزامی است' }, { status: 400 })
    }

    await db.taxBracket.deleteMany({ where: { year: parseInt(year) } })

    return NextResponse.json({ message: 'پله‌های مالیاتی حذف شدند' })
  } catch (error) {
    console.error('Delete tax brackets error:', error)
    return NextResponse.json({ error: 'خطا در حذف پله‌های مالیاتی' }, { status: 500 })
  }
}
