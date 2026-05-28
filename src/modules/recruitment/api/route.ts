import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, recruitmentCreateSchema } from '@/core/lib/validators'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const status = url.searchParams.get('status')
    const { skip, take, page, limit } = parsePagination(url.searchParams)
    const where: any = {}
    if (status) where.status = status

    const [items, total] = await Promise.all([
      db.recruitment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      db.recruitment.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      pagination: createPaginationMeta(page, limit, total),
    })
  } catch (error) {
    console.error('Error fetching recruitments:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست استخدام' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'recruitment:create')) {
      return NextResponse.json({ error: 'شما اجازه ایجاد موقعیت استخدامی را ندارید' }, { status: 403 })
    }

    const body = await req.json()
    const { title, department, position, status, applicants } = body
    const validation = validateWithZod(recruitmentCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    const item = await db.recruitment.create({
      data: {
        title,
        department: department || null,
        position: position || null,
        status: status || 'open',
        applicants: applicants || 0,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating recruitment:', error)
    return NextResponse.json({ error: 'خطا در ایجاد استخدام' }, { status: 500 })
  }
}
