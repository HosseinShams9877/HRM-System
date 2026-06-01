import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod } from '@/core/lib/validators'
import {  employeeUpdateSchema } from '@/modules/employees/lib/validators'
import { getSessionUser, hasPermission } from '@/core/lib/auth'

// GET /api/employees/[id] — دریافت اطلاعات یک کارمند
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 1. اول کارمند رو بگیر
    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true, lastLogin: true } },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })
    }

    // 2. بعد (در صورت وجود) نام دپارتمان رو بگیر
    let departmentName = null
    if (employee.department) {
      const department = await db.department.findUnique({
        where: { id: employee.department },
        select: { name: true }
      })
      departmentName = department?.name || null
    }

    // 3. بعد (در صورت وجود) نام سمت رو بگیر
    let positionName = null
    if (employee.position) {
      const position = await db.position.findUnique({
        where: { id: employee.position },
        select: { title: true }
      })
      positionName = position?.title || null
    }

    // 4. ترکیب نهایی
    const formattedEmployee = {
      ...employee,
      departmentName,
      positionName,
    }

    return NextResponse.json({ data: formattedEmployee })
  } catch (error) {
    console.error('Get employee error:', error)
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات کارمند' }, { status: 500 })
  }
}

// PUT /api/employees/[id] — بروزرسانی اطلاعات کارمند
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'employee:update')) {
      return NextResponse.json({ error: 'شما اجازه انجام این عمل را ندارید' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await db.employee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })
    }

    const validation = validateWithZod(employeeUpdateSchema, { ...body, id })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'خطای اعتبارسنجی', fieldErrors: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const { id: _, userRole, ...updateData } = data
    const cleanedData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        cleanedData[key] = value === '' ? null : value
      }
    }

    // ✅ اضافه کردن فیلدهای گمشده
    if (body.education !== undefined) cleanedData.education = body.education === '' ? null : body.education
    if (body.contractMonths !== undefined) cleanedData.contractMonths = body.contractMonths
    if (body.secondaryPhone !== undefined) cleanedData.secondaryPhone = body.secondaryPhone === '' ? null : body.secondaryPhone
    if (body.birthCertificateNo !== undefined) cleanedData.birthCertificateNo = body.birthCertificateNo === '' ? null : body.birthCertificateNo
    if (body.issuePlace !== undefined) cleanedData.issuePlace = body.issuePlace === '' ? null : body.issuePlace
    if (body.fieldOfStudy !== undefined) cleanedData.fieldOfStudy = body.fieldOfStudy === '' ? null : body.fieldOfStudy

    const employee = await db.employee.update({
      where: { id },
      data: cleanedData,
    })

    if (userRole) {
      await db.user.updateMany({
        where: { employeeId: id },
        data: { role: userRole },
      })
    }

    return NextResponse.json({ data: employee })
  } catch (error) {
    console.error('Update employee error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی اطلاعات کارمند' }, { status: 500 })
  }
}
// DELETE /api/employees/[id] — حذف کارمند
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'employee:delete')) {
      return NextResponse.json({ error: 'شما اجازه انجام این عمل را ندارید' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.employee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })
    }

    // Delete associated user first
    await db.user.deleteMany({ where: { employeeId: id } })
    
    // Delete employee (cascading will handle related records)
    await db.employee.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json({ error: 'خطا در حذف کارمند' }, { status: 500 })
  }
}
