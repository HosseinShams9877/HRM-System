import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import bcrypt from 'bcryptjs'
import {  validateWithZod } from '@/core/lib/validators'
import { employeeCreateSchema } from '@/modules/employees/lib/validators'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'


// Generate a random password
function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// GET /api/employees — لیست کارکنان
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'employee:view')) {
      return NextResponse.json({ error: 'شما اجازه دیدن لیست کارکنان را ندارید' }, { status: 403 })
    }
    
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const status = searchParams.get('status') || ''
    const { skip, take, page, limit } = parsePagination(searchParams)

    const andConditions: Record<string, unknown>[] = []

    if (search) {
      andConditions.push({
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { nationalCode: { contains: search } },
          { personnelCode: { contains: search } },
        ],
      })
    }
    if (department) andConditions.push({ department })
    if (status) andConditions.push({ status })

    const where = andConditions.length > 0 ? { AND: andConditions } : {}

    const [employees, total] = await Promise.all([
      db.employee.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, role: true, isActive: true, lastLogin: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      db.employee.count({ where }),
    ])

    // ✅ گرفتن اسامی دپارتمان‌ها
    const departmentIds = [...new Set(employees.map(e => e.department).filter(Boolean))]
    const departments = await db.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true }
    })
    
    const departmentMap = departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name
      return acc
    }, {} as Record<string, string>)

    // ✅ گرفتن اسامی سمت‌ها (position)
    const positionIds = [...new Set(employees.map(e => e.position).filter(Boolean))]
    let positionMap: Record<string, string> = {}
    
    if (positionIds.length > 0) {
      const positions = await db.position.findMany({
        where: { id: { in: positionIds } },
        select: { id: true, title: true }
      })
      positionMap = positions.reduce((acc, pos) => {
        acc[pos.id] = pos.title
        return acc
      }, {} as Record<string, string>)
    }

    const formattedEmployees = employees.map(emp => ({
      ...emp,
      departmentName: departmentMap[emp.department] || null,
      positionName: positionMap[emp.position] || emp.position || null,  // ✅ اضافه شد
    }))

    return NextResponse.json({
      data: formattedEmployees,
      pagination: createPaginationMeta(page, limit, total),
    })
  } catch (error) {
    console.error('Get employees error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست کارکنان' }, { status: 500 })
  }
}

// POST /api/employees — ثبت کارمند جدید + ساخت اکانت خودکار
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    console.log("user" , sessionUser)

    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'employee:create')) {
      return NextResponse.json({ error: 'شما اجازه انجام این عمل را ندارید' }, { status: 403 })
    }

    const body = await req.json()

    // Validate with Zod
    const validation = validateWithZod(employeeCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'خطای اعتبارسنجی', fieldErrors: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // بررسی تکراری نبودن کد ملی و پرسنلی
    const existing = await db.employee.findFirst({
      where: {
        OR: [
          { nationalCode: data.nationalCode },
          { personnelCode: data.personnelCode },
        ],
      },
    })
    if (existing) {
      const field = existing.nationalCode === data.nationalCode ? 'nationalCode' : 'personnelCode'
      return NextResponse.json(
        { 
          error: 'کد ملی یا کد پرسنلی تکراری است',
          fieldErrors: { [field]: field === 'nationalCode' ? 'کد ملی تکراری است' : 'کد پرسنلی تکراری است' }
        },
        { status: 409 }
      )
    }

    // ساخت ایمیل سازمانی اگر نداشت
    const orgEmail = data.email || `${data.personnelCode.toLowerCase()}@company.ir`

    // ---- ۱. ثبت کارمند ----
    const employee = await db.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        nationalCode: data.nationalCode,
        personnelCode: data.personnelCode,
        email: orgEmail,
        phone: data.phone || null,
        avatar: null,
        birthDate: data.birthDate || null,
        birthPlace: data.birthPlace || null,
        gender: data.gender || null,
        maritalStatus: data.maritalStatus || null,
        marriageDate: data.marriageDate || null,
        childrenCount: data.childrenCount || 0,
        bloodType: data.bloodType || null,
        medicalInfo: data.medicalInfo || null,
        address: data.address || null,
        homePhone: data.homePhone || null,
        education: data.education || null,
        fieldOfStudy: data.fieldOfStudy || null,
        university: data.university || null,
        militaryStatus: data.militaryStatus || null,
        hireDate: data.hireDate,
        fatherName: body.fatherName,
        status: data.status || 'active',
        contractType: data.contractType || null,
        probationEnd: data.probationEnd || null,
        position: data.position || null,
        department: data.department || null,
        jobGrade: data.jobGrade || null,
        workLocation: data.workLocation || null,
        accessCardNo: data.accessCardNo || null,
        managerId: null,
        birthCertificateNo: data.birthCertificateNo || null,   
        issuePlace: data.issuePlace || null,                   
        secondaryPhone: data.secondaryPhone || null,         
        postalCode: data.postalCode || null,                  
        contractMonths: data.contractMonths || null,          
        contractEndDate: data.contractEndDate || null,
      },
    })

    const username = data.phone

    if (!username) {
      return NextResponse.json({ error: 'شماره موبایل الزامی است' }, { status: 400 })
    }

    // ---- ۲. ساخت اکانت ورود خودکار ----
    const rawPassword = data.nationalCode
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    const existingUser = await db.user.findFirst({
      where: { OR: [{ email: username }, { mobile: username }] }
    })
    if (existingUser) {
      return NextResponse.json({ error: 'این شماره موبایل قبلاً ثبت شده است' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        email: orgEmail,
        password: hashedPassword,
        role: data.userRole || 'employee',
        employeeId: employee.id,
        mobile: username,
        isActive: true,
      },
    })

    // SECURITY: Return password only ONCE and never store it in plain text
    // The frontend should display this to the admin once and then it's gone
    return NextResponse.json({
      employee,
      account: {
        email: orgEmail,
        temporaryPassword: rawPassword,  // Only shown once!
        role: user.role,
        message: 'حساب کاربری ایجاد شد. رمز عبور موقت فقط یکبار نمایش داده می‌شود.',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json({ error: 'خطا در ثبت کارمند' }, { status: 500 })
  }
}
