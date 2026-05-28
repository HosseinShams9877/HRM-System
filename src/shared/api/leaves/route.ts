import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'
import { cookies } from 'next/headers'

// GET /api/leaves — لیست مرخصی‌ها
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
    const type = searchParams.get('type') || ''
    const department = searchParams.get('department') || ''
    const search = searchParams.get('search') || ''
    const employeeId = searchParams.get('employeeId') || ''
    const { skip, take, page, limit } = parsePagination(searchParams)

    // Build where clause with proper AND+OR syntax
    const andConditions: Record<string, unknown>[] = []

    if (currentUser.role === 'employee') {
      andConditions.push({ employeeId: currentUser.employeeId })
    }

    if (status) andConditions.push({ status })
    if (type) andConditions.push({ type })
    if (employeeId) andConditions.push({ employeeId })
    if (department) andConditions.push({ employee: { department } })
    if (search) {
      andConditions.push({
        OR: [
          { employee: { firstName: { contains: search } } },
          { employee: { lastName: { contains: search } } },
          { employee: { personnelCode: { contains: search } } },
          { reason: { contains: search } },
        ],
      })
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {}

    // Compute stats from all matching records
    const allLeaves = await db.leave.findMany({
      where,
      select: { status: true },
    })

    const stats = {
      total: allLeaves.length,
      pending: allLeaves.filter(l => l.status === 'pending').length,
      approved: allLeaves.filter(l => l.status === 'approved').length,
      rejected: allLeaves.filter(l => l.status === 'rejected').length,
    }

    const total = allLeaves.length

    const leaves = await db.leave.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, avatar: true, department: true, position: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    })

    return NextResponse.json({
      data: leaves,
      pagination: createPaginationMeta(page, limit, total),
      stats,
    })
  } catch (error) {
    console.error('Get leaves error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست مرخصی‌ها' }, { status: 500 })
  }
}

// POST /api/leaves — ثبت درخواست مرخصی
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

    if ( !body.type || !body.startDate || !body.endDate || !body.totalDays) {
      return NextResponse.json(
        { error: 'کارمند، نوع مرخصی، تاریخ شروع و پایان و تعداد روزها الزامی است' },
        { status: 400 }
      )
    }

    let targetEmployeeId = body.employeeId
    if (currentUser.role === 'employee') {
      targetEmployeeId = currentUser.employeeId
      // اگر کارمند سعی کرد برای دیگری ثبت کند، خطا بده
      if (body.employeeId && body.employeeId !== targetEmployeeId) {
        return NextResponse.json(
          { error: 'شما فقط می‌توانید برای خودتان درخواست مرخصی ثبت کنید' },
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

    const leave = await db.leave.create({
      data: {
        employeeId: targetEmployeeId,
        type: body.type,
        startDate: body.startDate,
        endDate: body.endDate,
        totalDays: body.totalDays,
        reason: body.reason || null,
        status: 'pending',
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, department: true } },
      },
    })

    return NextResponse.json(leave, { status: 201 })
  } catch (error) {
    console.error('Create leave error:', error)
    return NextResponse.json({ error: 'خطا در ثبت درخواست مرخصی' }, { status: 500 })
  }
}
