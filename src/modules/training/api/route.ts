import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod } from '@/core/lib/validators'
import { trainingCreateSchema } from '../lib/validators'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')
    const { skip, take, page, limit } = parsePagination(url.searchParams)
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (category) where.category = category

    const [items, total] = await Promise.all([
      db.training.findMany({
        where,
        include: {
          participants: {
            include: {
              employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      db.training.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      pagination: createPaginationMeta(page, limit, total),
    })
  } catch (error) {
    console.error('GET training error:', error)
    return NextResponse.json({ error: 'خطا در دریافت دوره‌ها' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'training:create')) {
      return NextResponse.json({ error: 'شما اجازه ایجاد دوره آموزشی را ندارید' }, { status: 403 })
    }

    const body = await req.json()
    const { title, instructor, startDate, endDate, location, status, description, capacity, category, duration, maxScore } = body
    
    const validation = validateWithZod(trainingCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    
    const parsedMaxScore = maxScore ? parseInt(maxScore) : 5
    
    const item = await db.training.create({
      data: {
        title,
        instructor: instructor || null,
        startDate,
        endDate: endDate || null,
        location: location || null,
        status: status || 'planned',
        description: description || null,
        capacity: capacity ? parseInt(capacity) : null,
        category: category || null,
        duration: duration ? parseInt(duration) : null,
        maxScore: parsedMaxScore,
      },
    })
    
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Create training error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد دوره' }, { status: 500 })
  }
}