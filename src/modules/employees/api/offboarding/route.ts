import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, offboardingCreateSchema } from '@/core/lib/validators'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const employeeId = url.searchParams.get('employeeId')
    const status = url.searchParams.get('status')
    const { skip, take, page, limit } = parsePagination(url.searchParams)
    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const [items, total] = await Promise.all([
      db.offboarding.findMany({
        where, include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      db.offboarding.count({ where }),
    ])
    return NextResponse.json({
      data: items,
      pagination: createPaginationMeta(page, limit, total),
    })
  } catch (error) {
    return NextResponse.json({ error: 'خطا در دریافت آفبوردینگ' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { employeeId, reason, tasks, lastDate } = body
    const validation = validateWithZod(offboardingCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data
    const item = await db.offboarding.create({
      data: { employeeId, reason, tasks: tasks || null, lastDate: lastDate || null },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'خطا در ایجاد آفبوردینگ' }, { status: 500 })
  }
}
