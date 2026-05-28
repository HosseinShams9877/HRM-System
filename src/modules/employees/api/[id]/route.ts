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
    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true, lastLogin: true } },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })
    }

    return NextResponse.json({ data: employee })
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

    // Check employee exists
    const existing = await db.employee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })
    }

    // Validate update data
    const validation = validateWithZod(employeeUpdateSchema, { ...body, id })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'خطای اعتبارسنجی', fieldErrors: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    // Remove id and undefined fields
    const { id: _, userRole, ...updateData } = data
    // Clean up undefined/null values
    const cleanedData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        cleanedData[key] = value === '' ? null : value
      }
    }

    // Update employee
    const employee = await db.employee.update({
      where: { id },
      data: cleanedData,
    })

    // Update user role if provided
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
