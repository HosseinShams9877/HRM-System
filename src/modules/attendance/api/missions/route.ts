import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'
import { cookies } from 'next/headers'


// GET /api/missions — لیست مأموریت‌ها
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('hr-session')
    let currentUser = null
    if (sessionCookie) {
      try {
        currentUser = JSON.parse(sessionCookie.value)
      } catch (e) {}
    }

    if (!currentUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const department = searchParams.get('department') || ''
    const search = searchParams.get('search') || ''
    const { skip, take, page, limit } = parsePagination(searchParams)

    // Build where clause with proper AND+OR syntax
    const andConditions: Record<string, unknown>[] = []

    if (currentUser.role === 'employee') {
      andConditions.push({ employeeId: currentUser.employeeId })
    }

    if (status) andConditions.push({ status })
    if (department) andConditions.push({ employee: { department } })
    if (search) {
      andConditions.push({
        OR: [
          { employee: { firstName: { contains: search } } },
          { employee: { lastName: { contains: search } } },
          { employee: { personnelCode: { contains: search } } },
          { title: { contains: search } },
          { destination: { contains: search } },
        ],
      })
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {}

    // Compute stats from all matching records
    const allMissions = await db.mission.findMany({
      where,
      select: { status: true },
    })

    const stats = {
      total: allMissions.length,
      pending: allMissions.filter(m => m.status === 'pending').length,
      approved: allMissions.filter(m => m.status === 'approved').length,
      rejected: allMissions.filter(m => m.status === 'rejected').length,
    }

    const total = allMissions.length

    const missions = await db.mission.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, avatar: true, department: true, position: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    })

    return NextResponse.json({
      data: missions,
      pagination: createPaginationMeta(page, limit, total),
      stats,
    })
  } catch (error) {
    console.error('Get missions error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست مأموریت‌ها' }, { status: 500 })
  }
}

// POST /api/missions — ثبت درخواست مأموریت
export async function POST(req: NextRequest) {
  try {
    
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('hr-session')
    let currentUser = null
    if (sessionCookie) {
      try {
        currentUser = JSON.parse(sessionCookie.value)
      } catch (e) {}
    }

    if (!currentUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    
    const body = await req.json()

    if (!body.employeeId || !body.title || !body.startDate || !body.endDate || !body.totalDays) {
      return NextResponse.json(
        { error: 'کارمند، عنوان، تاریخ شروع و پایان و تعداد روزها الزامی است' },
        { status: 400 }
      )
    }
    let targetEmployeeId = body.employeeId
    if (currentUser.role === 'employee') {
      targetEmployeeId = currentUser.employeeId
      if (body.employeeId && body.employeeId !== targetEmployeeId) {
        return NextResponse.json(
          { error: 'شما فقط می‌توانید برای خودتان درخواست مأموریت ثبت کنید' },
          { status: 403 }
        )
      }
    }
    if (!targetEmployeeId) {
      return NextResponse.json(
        { error: 'شناسه کارمند نامعتبر است' },
        { status: 400 }
      )
    }

    const mission = await db.mission.create({
      data: {
        employeeId: body.employeeId,
        title: body.title,
        destination: body.destination || null,
        startDate: body.startDate,
        endDate: body.endDate,
        totalDays: body.totalDays,
        status: 'pending',
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true } },
      },
    })

    return NextResponse.json(mission, { status: 201 })
  } catch (error) {
    console.error('Create mission error:', error)
    return NextResponse.json({ error: 'خطا در ثبت درخواست مأموریت' }, { status: 500 })
  }
}
