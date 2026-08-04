import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod } from '@/core/lib/validators'
import { performanceCreateSchema } from '../lib/validators'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'
//api/performance
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const status = url.searchParams.get('status')
    const employeeId = url.searchParams.get('employeeId')
    const { skip, take, page, limit } = parsePagination(url.searchParams)
    const where: any = {}
    if (status) where.status = status
    if (employeeId) where.employeeId = employeeId

    const [items, total] = await Promise.all([
      db.performance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
              position: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      db.performance.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      pagination: createPaginationMeta(page, limit, total),
    })
  } catch (error) {
    console.error('Error fetching performances:', error)
    return NextResponse.json({ error: 'خطا در دریافت ارزیابی‌ها' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { employeeId, period, score, target, kpi1, kpi2, kpi3, kpi4, comments, status } = body
    const validation = validateWithZod(performanceCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data
    const item = await db.performance.create({
      data: {
        employeeId, period, score, target: target || 3,
        kpi1: kpi1 ?? null, kpi2: kpi2 ?? null, kpi3: kpi3 ?? null, kpi4: kpi4 ?? null,
        comments: comments || null, status: status || 'pending',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
          }
        }
      }
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating performance:', error)
    return NextResponse.json({ error: 'خطا در ایجاد ارزیابی' }, { status: 500 })
  }
}
