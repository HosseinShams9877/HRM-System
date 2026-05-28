import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import { validateWithZod, contractCreateSchema } from '@/core/lib/validators'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'

// GET /api/contracts — لیست قراردادها و احکام
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const department = searchParams.get('department') || ''
    const search = searchParams.get('search') || ''
    const expiringDays = searchParams.get('expiring') || ''
    const { skip, take, page, limit } = parsePagination(searchParams)

    // Build where clause with proper AND+OR syntax
    const andConditions: Record<string, unknown>[] = []

    if (type) andConditions.push({ type })
    if (status) andConditions.push({ status })
    if (department) andConditions.push({ department })
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search } },
          { contractNumber: { contains: search } },
          { employee: { firstName: { contains: search } } },
          { employee: { lastName: { contains: search } } },
          { employee: { personnelCode: { contains: search } } },
        ],
      })
    }

    // قراردادهایی که تا N روز دیگر منقضی می‌شوند
    if (expiringDays) {
      andConditions.push({ endDate: { not: null } })
      andConditions.push({ status: 'active' })
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {}

    const contracts = await db.contract.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personnelCode: true,
            avatar: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    // فیلتر قراردادهای در حال انقضا در حافظه
    let filteredContracts = contracts
    if (expiringDays) {
      const today = getTodayShamsi()
      const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
      const days = parseInt(expiringDays) || 30

      filteredContracts = contracts.filter(c => {
        if (!c.endDate || c.status !== 'active') return false
        const [ey, em, ed] = c.endDate.split('/').map(Number)
        const [ny, nm, nd] = todayStr.split('/').map(Number)
        const endTotal = (ey * 365) + (em * 31) + ed
        const nowTotal = (ny * 365) + (nm * 31) + nd
        const diffDays = endTotal - nowTotal
        return diffDays >= 0 && diffDays <= days
      })
    }

    // تشخیص خودکار قراردادهای منقضی
    const today = getTodayShamsi()
    const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
    const expiredIds: string[] = []
    for (const c of filteredContracts) {
      if (c.status === 'active' && c.endDate) {
        const [ey, em, ed] = c.endDate.split('/').map(Number)
        const [ny, nm, nd] = todayStr.split('/').map(Number)
        const endTotal = (ey * 365) + (em * 31) + ed
        const nowTotal = (ny * 365) + (nm * 31) + nd
        if (endTotal < nowTotal) {
          expiredIds.push(c.id)
        }
      }
    }

    // بروزرسانی وضعیت قراردادهای منقضی
    if (expiredIds.length > 0) {
      await db.contract.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: 'expired' },
      })
      for (const c of filteredContracts) {
        if (expiredIds.includes(c.id)) {
          c.status = 'expired'
        }
      }
    }

    // Apply pagination to filtered results
    const total = filteredContracts.length
    const paginatedContracts = filteredContracts.slice(skip, skip + take)

    // آمار
    const allContracts = await db.contract.findMany({
      select: { status: true, type: true, endDate: true },
    })

    const stats = {
      total: allContracts.length,
      active: allContracts.filter(c => c.status === 'active').length,
      expired: allContracts.filter(c => c.status === 'expired').length,
      terminated: allContracts.filter(c => c.status === 'terminated').length,
      draft: allContracts.filter(c => c.status === 'draft').length,
      expiringSoon: allContracts.filter(c => {
        if (c.status !== 'active' || !c.endDate) return false
        const [ey, em, ed] = c.endDate.split('/').map(Number)
        const [ny, nm, nd] = todayStr.split('/').map(Number)
        const endTotal = (ey * 365) + (em * 31) + ed
        const nowTotal = (ny * 365) + (nm * 31) + nd
        const diffDays = endTotal - nowTotal
        return diffDays >= 0 && diffDays <= 30
      }).length,
      byType: {
        contract: allContracts.filter(c => c.type === 'قرارداد').length,
        appointment: allContracts.filter(c => c.type === 'حکم کارگزینی').length,
        transfer: allContracts.filter(c => c.type === 'حکم انتقال').length,
        changePosition: allContracts.filter(c => c.type === 'حکم تغییر سمت').length,
        renewal: allContracts.filter(c => c.type === 'حکم تمدید').length,
      },
    }

    return NextResponse.json({
      data: paginatedContracts,
      pagination: createPaginationMeta(page, limit, total),
      stats,
    })
  } catch (error) {
    console.error('Get contracts error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست قراردادها' }, { status: 500 })
  }
}

// POST /api/contracts — ایجاد قرارداد/حکم جدید
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'contract:create')) {
      return NextResponse.json({ error: 'شما اجازه ایجاد قرارداد را ندارید' }, { status: 403 })
    }

    const body = await req.json()

    const validation = validateWithZod(contractCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    // تولید خودکار شماره قرارداد اگر وارد نشده
    if (!body.contractNumber) {
      const today = getTodayShamsi()
      const count = await db.contract.count()
      body.contractNumber = `C-${today.year}/${String(count + 1).padStart(3, '0')}`
    }

    const contract = await db.contract.create({
      data: {
        employeeId: body.employeeId,
        type: body.type,
        contractNumber: body.contractNumber,
        title: body.title,
        startDate: body.startDate,
        endDate: body.endDate || null,
        amount: body.amount ? parseFloat(body.amount) : null,
        department: body.department || null,
        notes: body.notes || null,
        status: body.status || 'active',
        filePath: body.filePath || null,
        approvedById: body.approvedById || null,
        approvedAt: body.approvedAt || null,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personnelCode: true,
            department: true,
            position: true,
          },
        },
      },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Create contract error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد قرارداد' }, { status: 500 })
  }
}
