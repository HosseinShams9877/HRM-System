import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod} from '@/core/lib/validators'
import { announcementCreateSchema } from '@/modules/announcements/lib/validators'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'

// GET /api/announcements — لیست اطلاعیه‌ها
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const isActive = url.searchParams.get('isActive')
    const priority = url.searchParams.get('priority')
    const targetAudience = url.searchParams.get('targetAudience')
    const { skip, take, page, limit } = parsePagination(url.searchParams)

    const where: any = {}
    if (isActive !== null) where.isActive = isActive === 'true'
    if (priority) where.priority = priority
    if (targetAudience) where.targetAudience = targetAudience

    const [announcements, total] = await Promise.all([
      db.announcement.findMany({
        where,
        orderBy: [{ publishDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      db.announcement.count({ where }),
    ])

    return NextResponse.json({
      data: announcements,
      pagination: createPaginationMeta(page, limit, total),
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'خطا در دریافت اطلاعیه‌ها' }, { status: 500 })
  }
}

// POST /api/announcements — ایجاد اطلاعیه جدید
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'announcement:create')) {
      return NextResponse.json({ error: 'شما اجازه ایجاد اطلاعیه را ندارید' }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, priority, targetAudience, department, isActive, publishDate, expiryDate } = body

    const validation = validateWithZod(announcementCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        priority: priority || 'normal',
        targetAudience: targetAudience || 'all',
        department: department || null,
        isActive: isActive !== undefined ? isActive : true,
        publishDate,
        expiryDate: expiryDate || null,
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ error: 'خطا در ایجاد اطلاعیه' }, { status: 500 })
  }
}
