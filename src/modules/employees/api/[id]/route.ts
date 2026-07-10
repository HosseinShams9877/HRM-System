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

    if (body.contractType === 'official') {
      cleanedData.contractMonths = null
      cleanedData.contractEndDate = null
    } else if (body.contractMonths !== undefined) {
      cleanedData.contractMonths = body.contractMonths
    }
    const positionChanged = body.position !== undefined && body.position !== existing.position
    const departmentChanged = body.department !== undefined && body.department !== existing.department
    const newHireDate = body.hireDate !== undefined ? body.hireDate : existing.hireDate

    if (positionChanged || departmentChanged) {
      const employee = await db.$transaction(async (tx) => {

        // ✅ دریافت نام سمت و دپارتمان قبلی و جدید (داخل تراکنش)
        let oldPositionName = existing.position || 'نامشخص'
        let oldDepartmentName = existing.department || 'نامشخص'
        let newPositionName = body.position || 'نامشخص'
        let newDepartmentName = body.department || 'نامشخص'

        // اگر position ID بود، نامش رو از جدول Position بگیر
        if (existing.position) {
          const oldPos = await tx.position.findUnique({
            where: { id: existing.position },
            select: { title: true }
          })
          if (oldPos) oldPositionName = oldPos.title
        }

        if (body.position) {
          const newPos = await tx.position.findUnique({
            where: { id: body.position },
            select: { title: true }
          })
          if (newPos) newPositionName = newPos.title
        }

        if (existing.department) {
          const oldDept = await tx.department.findUnique({
            where: { id: existing.department },
            select: { name: true }
          })
          if (oldDept) oldDepartmentName = oldDept.name
        }

        if (body.department) {
          const newDept = await tx.department.findUnique({
            where: { id: body.department },
            select: { name: true }
          })
          if (newDept) newDepartmentName = newDept.name
        }

        // ساخت description با نام‌ها
        let description = ''
        if (positionChanged && departmentChanged) {
          description = `تغییر سمت از ${oldPositionName} به ${newPositionName} و تغییر دپارتمان از ${oldDepartmentName} به ${newDepartmentName}`
        } else if (positionChanged) {
          description = `تغییر سمت از ${oldPositionName} به ${newPositionName}`
        } else if (departmentChanged) {
          description = `تغییر دپارتمان از ${oldDepartmentName} به ${newDepartmentName}`
        }

        let currentHistory = await tx.workHistory.findFirst({
          where: {
            employeeId: id,
            isCurrent: true
          }
        })
        
        // اگر سابقه جاری وجود نداشت، یکی بساز
        if (!currentHistory) {
          currentHistory = await tx.workHistory.create({
            data: {
              employeeId: id,
              position: existing.position || 'نامشخص',
              department: existing.department || 'نامشخص',
              startDate: new Date(newHireDate),
              endDate: null,
              isCurrent: true,
              source: 'SYSTEM',
              description: description
            }
          })
        }

        // 2. بستن سابقه فعلی (اگر وجود داشته باشد)
        if (currentHistory) {
          await tx.workHistory.update({
            where: { id: currentHistory.id },
            data: {
              endDate: new Date(),
              isCurrent: false
            }
          })
        }

        // 3. ایجاد سابقه جدید با سمت جدید
        const newPosition = body.position !== undefined ? body.position : existing.position
        const newDepartment = body.department !== undefined ? body.department : existing.department
        
        await tx.workHistory.create({
          data: {
            employeeId: id,
            position: newPosition,
            department: newDepartment,
            startDate: new Date(newHireDate),
            endDate: null,
            isCurrent: true,
            source: 'SYSTEM',
            description: description  // ✅ استفاده از description با نام‌ها
          }
        })
        
        const updated = await tx.employee.update({
          where: { id },
          data: cleanedData,
        })

        return updated
      })

      // بروزرسانی نقش کاربر (اگر نیاز باشد)
      if (userRole) {
        await db.user.updateMany({
          where: { employeeId: id },
          data: { role: userRole },
        })
      }

      return NextResponse.json({ 
        data: employee,
        message: 'اطلاعات کارمند و سوابق شغلی با موفقیت به‌روز شد'
      })
    }
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
// DELETE /api/employees/[id] — غیرفعال کردن کارمند
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
    
    const body = await req.json()
    const { reason, exitReason  } = body

    const existing = await db.employee.findUnique({ 
      where: { id },
      include: { user: true }
    })
    
    if (!existing) {
      return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })
    }

    // ---- شروع تراکنش ----
    await db.$transaction(async (tx) => {
      
      // 1. پیدا کردن سابقه جاری
      let currentHistory = await tx.workHistory.findFirst({
        where: {
          employeeId: id,
          isCurrent: true
        }
      })

      // ✅ اگر سابقه جاری وجود نداشت، یکی بساز
      if (!currentHistory) {
        currentHistory = await tx.workHistory.create({
          data: {
            employeeId: id,
            position: existing.position || 'نامشخص',
            department: existing.department || 'نامشخص',
            startDate: existing.hireDate ? new Date(existing.hireDate) : new Date(),
            endDate: null,
            isCurrent: true,
            source: 'SYSTEM',
            description: ''
          }
        })
      }

      // 2. بستن سابقه جاری
      await tx.workHistory.update({
        where: { id: currentHistory.id },
        data: {
          endDate: new Date(),
          isCurrent: false,
          description: reason 
            ? `${currentHistory.description || ''} - غیرفعال شد: ${reason}`.trim()
            : `${currentHistory.description || ''} - غیرفعال شد`.trim()
        }
      })

      // 3. غیرفعال کردن کارمند
      await tx.employee.update({
        where: { id },
        data: {
          status: 'inactive',
          exitReason: exitReason || 'other', 
        },
      })

      // 4. غیرفعال کردن کاربر مرتبط
      if (existing.user) {
        await tx.user.update({
          where: { id: existing.user.id },
          data: { isActive: false },
        })
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'کارمند با موفقیت غیرفعال شد',
      employee: { id, status: 'inactive' }
    })
  } catch (error) {
    console.error('Disable employee error:', error)
    return NextResponse.json({ error: 'خطا در غیرفعال کردن کارمند' }, { status: 500 })
  }
}