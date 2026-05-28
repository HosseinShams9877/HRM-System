import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, rewardCreateSchema } from '@/core/lib/validators'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const employeeId = url.searchParams.get('employeeId')
    const type = url.searchParams.get('type')
    const { skip, take, page, limit } = parsePagination(url.searchParams)
    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (type) where.type = type

    const [items, total] = await Promise.all([
      db.reward.findMany({
        where, include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      db.reward.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      pagination: createPaginationMeta(page, limit, total),
    })
  } catch (error) {
    return NextResponse.json({ error: 'خطا در دریافت پاداش‌ها' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'reward:create')) {
      return NextResponse.json({ error: 'شما اجازه ایجاد پاداش را ندارید' }, { status: 403 })
    }

    const body = await req.json()
    const { employeeId, type, title, amount, reason, date } = body
    const validation = validateWithZod(rewardCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data
    const item = await db.reward.create({
      data: { employeeId, type: type || 'نقدی', title, amount: amount || null, reason: reason || null, date },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'خطا در ایجاد پاداش' }, { status: 500 })
  }
}
