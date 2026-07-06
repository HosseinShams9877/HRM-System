// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET /api/orders — دریافت لیست احکام
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'contract:view')) {
      return NextResponse.json({ error: 'شما اجازه دیدن احکام را ندارید' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const employeeId = searchParams.get('employeeId') || ''
    const { skip, take, page, limit } = parsePagination(searchParams)

    const andConditions: Record<string, unknown>[] = []

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search } },
          { orderNumber: { contains: search } },
          { employee: { firstName: { contains: search } } },
          { employee: { lastName: { contains: search } } },
          { employee: { personnelCode: { contains: search } } },
        ],
      })
    }
    if (type) andConditions.push({ orderType: type })
    if (status) andConditions.push({ status })
    if (employeeId) andConditions.push({ employeeId })

    const where = andConditions.length > 0 ? { AND: andConditions } : {}

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              personnelCode: true,
          
            
            },
          },
          contract: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      db.order.count({ where }),
    ])

    // آمار احکام
    const allOrders = await db.order.findMany({
      select: { status: true, orderType: true },
    })

    const stats = {
      total: allOrders.length,
      draft: allOrders.filter(o => o.status === 'draft').length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      approved: allOrders.filter(o => o.status === 'approved').length,
      active: allOrders.filter(o => o.status === 'active').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length,
      replaced: allOrders.filter(o => o.status === 'replaced').length,
      byType: {
        employment: allOrders.filter(o => o.orderType === 'employment').length,
        extension: allOrders.filter(o => o.orderType === 'extension').length,
        salary_increase: allOrders.filter(o => o.orderType === 'salary_increase').length,
        position_change: allOrders.filter(o => o.orderType === 'position_change').length,
        department_change: allOrders.filter(o => o.orderType === 'department_change').length,
        promotion: allOrders.filter(o => o.orderType === 'promotion').length,
        transfer: allOrders.filter(o => o.orderType === 'transfer').length,
        suspension: allOrders.filter(o => o.orderType === 'suspension').length,
        termination: allOrders.filter(o => o.orderType === 'termination').length,
        other: allOrders.filter(o => o.orderType === 'other').length,
      },
    }

    return NextResponse.json({
      data: orders,
      pagination: createPaginationMeta(page, limit, total),
      stats,
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست احکام' }, { status: 500 })
  }
}

// POST /api/orders — ایجاد حکم جدید (با آپلود فایل)
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'contract:create')) {
      return NextResponse.json({ error: 'شما اجازه ایجاد حکم را ندارید' }, { status: 403 })
    }

    // ✅ دریافت FormData
    const formData = await req.formData()
    
    // گرفتن فایل
    const file = formData.get('file') as File | null
    
    // گرفتن بقیه فیلدها
    const orderType = formData.get('orderType') as string
    const employeeId = formData.get('employeeId') as string
    const title = formData.get('title') as string
    const orderNumber = formData.get('orderNumber') as string
    const issueDate = formData.get('issueDate') as string
    const effectiveDate = formData.get('effectiveDate') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string || 'draft'
    const newPosition = formData.get('newPosition') as string || null
    const newDepartment = formData.get('newDepartment') as string || null
    const newManagerId = formData.get('newManagerId') as string || null
    const baseSalary = formData.get('baseSalary') as string || null
    const housingAllowance = formData.get('housingAllowance') as string || null
    const foodAllowance = formData.get('foodAllowance') as string || null
    const attractionAllowance = formData.get('attractionAllowance') as string || null
    const responsibilityAllowance = formData.get('responsibilityAllowance') as string || null
    const otherAllowances = formData.get('otherAllowances') as string || null
    const fixedDeductions = formData.get('fixedDeductions') as string || null
    const contractId = formData.get('contractId') as string || null

    // اعتبارسنجی
    if (!orderType || !employeeId || !title || !orderNumber || !issueDate || !effectiveDate) {
      return NextResponse.json(
        { error: 'همه فیلدهای الزامی را پر کنید' },
        { status: 400 }
      )
    }

    // تولید خودکار شماره حکم
    let finalOrderNumber = orderNumber
    if (!finalOrderNumber) {
      const today = getTodayShamsi()
      const count = await db.order.count()
      finalOrderNumber = `H-${today.year}/${String(count + 1).padStart(3, '0')}`
    }

    // چک کردن تکراری نبودن شماره حکم
    const existingOrder = await db.order.findUnique({
      where: { orderNumber: finalOrderNumber },
    })
    if (existingOrder) {
      return NextResponse.json(
        { error: 'شماره حکم تکراری است' },
        { status: 409 }
      )
    }

    // ✅ ذخیره فایل (اگه وجود داشته باشه)
    let fileUrl: string | null = null
    let fileName: string | null = null

    if (file) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'orders')
        await mkdir(uploadDir, { recursive: true })

        const timestamp = Date.now()
        const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = path.join(uploadDir, safeFileName)

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        fileUrl = `/uploads/orders/${safeFileName}`
        fileName = file.name
      } catch (error) {
        console.error('File upload error:', error)
      }
    }

    // ایجاد حکم
    const order = await db.order.create({
      data: {
        orderType,
        employeeId,
        title,
        orderNumber: finalOrderNumber,
        issueDate,
        effectiveDate,
        description: description || null,
        status,
        newPosition: newPosition || null,
        newDepartment: newDepartment || null,
        newManagerId: newManagerId || null,
        baseSalary: baseSalary ? parseFloat(baseSalary) : null,
        housingAllowance: housingAllowance ? parseFloat(housingAllowance) : null,
        foodAllowance: foodAllowance ? parseFloat(foodAllowance) : null,
        attractionAllowance: attractionAllowance ? parseFloat(attractionAllowance) : null,
        responsibilityAllowance: responsibilityAllowance ? parseFloat(responsibilityAllowance) : null,
        otherAllowances: otherAllowances ? parseFloat(otherAllowances) : null,
        fixedDeductions: fixedDeductions ? parseFloat(fixedDeductions) : null,
        contractId: contractId || null,
        fileUrl,
        fileName,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personnelCode: true,
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد حکم', details: error.message },
      { status: 500 }
    )
  }
}