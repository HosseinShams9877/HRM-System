import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, loanCreateSchema } from '@/core/lib/validators'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const employeeId = url.searchParams.get('employeeId')
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')
    const { skip, take, page, limit } = parsePagination(url.searchParams)
    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status
    if (type) where.type = type

    const [items, total] = await Promise.all([
      db.loanRequest.findMany({
        where, include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      db.loanRequest.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      pagination: createPaginationMeta(page, limit, total),
    })
  } catch (error) {
    return NextResponse.json({ error: 'خطا در دریافت وام‌ها' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { employeeId, type, amount, reason, installments } = body
    const validation = validateWithZod(loanCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data
    const item = await db.loanRequest.create({
      data: { employeeId, type, amount, reason: reason || null, installments: installments || null },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'خطا در ایجاد درخواست وام' }, { status: 500 })
  }
}
