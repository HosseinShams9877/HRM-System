import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { requireRole } from '@/core/lib/auth'

// GET /api/payroll — لیست فیش‌های حقوقی با فیلتر
export async function GET(req: NextRequest) {
  try {

    await requireRole('admin', 'hr_manager', 'department_manager')

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (year) where.year = parseInt(year)
    if (month) where.month = parseInt(month)
    if (status) where.status = status

    if (department || search) {
      const employeeWhere: Record<string, unknown> = {}
      if (department) employeeWhere.department = department
      if (search) {
        employeeWhere.OR = [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { personnelCode: { contains: search } },
        ]
      }
      where.employee = employeeWhere
    }

    const payslips = await db.paySlip.findMany({
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
            maritalStatus: true,
            childrenCount: true,
            contractType: true,
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    // محاسبه آمار خلاصه
    const summary = {
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      count: payslips.length,
      byStatus: {} as Record<string, number>,
    }

    for (const slip of payslips) {
      summary.totalBaseSalary += slip.baseSalary
      summary.totalAllowances += slip.totalAllowances
      summary.totalDeductions += slip.totalDeductions
      summary.totalNetSalary += slip.netSalary
      summary.byStatus[slip.status] = (summary.byStatus[slip.status] || 0) + 1
    }

    return NextResponse.json({ payslips, summary })
  } catch (error) {
    console.error('Get payslips error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست فیش‌های حقوقی' }, { status: 500 })
  }
}

// POST /api/payroll — ایجاد فیش حقوقی تکی با آیتم‌ها
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.employeeId || !body.year || !body.month) {
      return NextResponse.json(
        { error: 'کارمند، سال و ماه الزامی است' },
        { status: 400 }
      )
    }

    const year = parseInt(String(body.year))
    const month = parseInt(String(body.month))

    const employeeId = String(body.employeeId).trim()

    console.log('📊 [POST] employeeId:', employeeId)
    console.log('📊 [POST] employeeId length:', employeeId.length)

    // بررسی وجود فیش قبلی
    const existing = await db.paySlip.findUnique({
      where: {
        employeeId_year_month: {
          employeeId: employeeId,
          year,
          month,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'فیش حقوقی این کارمند برای این ماه قبلاً صادر شده است' },
        { status: 409 }
      )
    }

    // بررسی وجود کارمند
    const employee = await db.employee.findUnique({
      where: { id: employeeId },
    })
    if (!employee) {
      return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })
    }

    console.log('✅ کارمند پیدا شد:', employee.firstName, employee.lastName)

    const baseSalary = parseFloat(String(body.baseSalary || 0))
    const items: { title: string; category: string; amount: number; payrollItemId?: string | null; sortOrder: number }[] = body.items || []

    console.log('📊 [POST] ===== بررسی آیتم‌ها =====')
    console.log('📊 [POST] تعداد آیتم‌ها:', items.length)
    
    // ✅ لاگ جزییات هر آیتم
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      console.log(`📊 [POST] آیتم ${i + 1}:`, {
        title: item.title,
        category: item.category,
        amount: item.amount,
        payrollItemId: item.payrollItemId,
        sortOrder: item.sortOrder,
      })
    }
    
    // ✅ جمع‌آوری و بررسی payrollItemId ها
    const itemIds = items
      .map(item => item.payrollItemId)
      .filter(id => id !== null && id !== undefined && id !== '')
    
    console.log('📊 [POST] payrollItemId های موجود:', itemIds)
    
    // ✅ چک کن همه payrollItemId ها در دیتابیس وجود دارن
    if (itemIds.length > 0) {
      const existingItems = await db.payrollItem.findMany({
        where: {
          id: { in: itemIds },
          year: year,
          isActive: true
        },
        select: { id: true, code: true, title: true }
      })
      
      console.log('📊 [POST] آیتم‌های موجود در دیتابیس:', existingItems)
      
      const existingIds = new Set(existingItems.map(i => i.id))
      const invalidIds = itemIds.filter(id => !existingIds.has(id))
      
      if (invalidIds.length > 0) {
        console.error('❌ payrollItemId های نامعتبر:', invalidIds)
        
        const invalidItems = items.filter(item => 
          item.payrollItemId && invalidIds.includes(item.payrollItemId)
        )
        console.error('❌ آیتم‌های مشکل‌دار:', JSON.stringify(invalidItems, null, 2))
        
        return NextResponse.json(
          { 
            error: `آیتم‌های حقوقی با شناسه های ${invalidIds.join(', ')} یافت نشدند`,
            invalidIds: invalidIds,
            invalidItems: invalidItems
          },
          { status: 400 }
        )
      }
      
      console.log('✅ همه payrollItemId ها معتبر هستند')
    }

    let totalAllowances = 0
    let totalDeductions = 0

    for (const item of items) {
      if (item.category === 'allowance') {
        totalAllowances += parseFloat(String(item.amount || 0))
      } else {
        totalDeductions += parseFloat(String(item.amount || 0))
      }
    }

    const grossSalary = baseSalary + totalAllowances
    const netSalary = grossSalary - totalDeductions

    console.log('📊 [POST] ===== خلاصه نهایی =====')
    console.log('📊 [POST] baseSalary:', baseSalary)
    console.log('📊 [POST] totalAllowances:', totalAllowances)
    console.log('📊 [POST] totalDeductions:', totalDeductions)
    console.log('📊 [POST] grossSalary:', grossSalary)
    console.log('📊 [POST] netSalary:', netSalary)

    const paySlip = await db.paySlip.create({
      data: {
        employeeId: employeeId,
        year,
        month,
        baseSalary,
        totalAllowances,
        totalDeductions,
        grossSalary,
        netSalary,
        workDays: parseFloat(String(body.workDays || 30)),
        overtimeHours: parseFloat(String(body.overtimeHours || 0)),
        status: body.status || 'draft',
        notes: body.notes || null,
        items: {
          create: items.map((item, index) => ({
            title: item.title,
            category: item.category,
            amount: parseFloat(String(item.amount || 0)),
            payrollItemId: item.payrollItemId || null,
            sortOrder: item.sortOrder ?? index,
          })),
        },
      },
      include: {
        items: true,
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

    console.log('✅ فیش حقوقی با موفقیت ایجاد شد:', paySlip.id)
    return NextResponse.json(paySlip, { status: 201 })
  } catch (error) {
    console.error('❌ Create payslip error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد فیش حقوقی' }, { status: 500 })
  }
}