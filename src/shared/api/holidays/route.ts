import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, holidayCreateSchema } from '@/core/lib/validators'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'

// GET /api/holidays — لیست تعطیلات
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || ''
    const year = searchParams.get('year') || ''
    const { skip, take, page, limit } = parsePagination(searchParams)

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (year) where.date = { startsWith: year }

    const [holidays, total] = await Promise.all([
      db.holiday.findMany({
        where,
        orderBy: { date: 'asc' },
        skip,
        take,
      }),
      db.holiday.count({ where }),
    ])

    const stats = {
      total,
      official: holidays.filter(h => h.type === 'official').length,
      agreed: holidays.filter(h => h.type === 'agreed').length,
      occasional: holidays.filter(h => h.type === 'occasional').length,
    }

    return NextResponse.json({
      data: holidays,
      pagination: createPaginationMeta(page, limit, total),
      stats,
    })
  } catch (error) {
    console.error('Get holidays error:', error)
    return NextResponse.json({ error: 'خطا در دریافت تعطیلات' }, { status: 500 })
  }
}

// POST /api/holidays — ایجاد تعطیلی
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validation = validateWithZod(holidayCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    const holiday = await db.holiday.create({
      data: {
        title: body.title,
        date: body.date,
        type: body.type,
        isRecurring: body.isRecurring || false,
        description: body.description || null,
      },
    })

    return NextResponse.json(holiday, { status: 201 })
  } catch (error) {
    console.error('Create holiday error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد تعطیلی' }, { status: 500 })
  }
}
