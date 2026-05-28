import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, regulationCreateSchema } from '@/core/lib/validators'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'

// GET /api/regulations — لیست آیین‌نامه‌ها
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const isActive = url.searchParams.get('isActive')
    const category = url.searchParams.get('category')
    const { skip, take, page, limit } = parsePagination(url.searchParams)

    const where: any = {}
    if (isActive !== null) where.isActive = isActive === 'true'
    if (category) where.category = category

    const [regulations, total] = await Promise.all([
      db.regulation.findMany({
        where,
        orderBy: [{ publishDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      db.regulation.count({ where }),
    ])

    return NextResponse.json({
      data: regulations,
      pagination: createPaginationMeta(page, limit, total),
    })
  } catch (error) {
    console.error('Error fetching regulations:', error)
    return NextResponse.json({ error: 'خطا در دریافت آیین‌نامه‌ها' }, { status: 500 })
  }
}

// POST /api/regulations — ایجاد آیین‌نامه جدید
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'announcement:create')) {
      return NextResponse.json({ error: 'شما اجازه ایجاد آیین‌نامه را ندارید' }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, category, version, filePath, isActive, publishDate } = body

    const validation = validateWithZod(regulationCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    const regulation = await db.regulation.create({
      data: {
        title,
        content,
        category,
        version: version || '1.0',
        filePath: filePath || null,
        isActive: isActive !== undefined ? isActive : true,
        publishDate,
      },
    })

    return NextResponse.json(regulation, { status: 201 })
  } catch (error) {
    console.error('Error creating regulation:', error)
    return NextResponse.json({ error: 'خطا در ایجاد آیین‌نامه' }, { status: 500 })
  }
}
