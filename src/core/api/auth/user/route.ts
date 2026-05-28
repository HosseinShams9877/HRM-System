import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/auth/users — لیست تمام کاربران (فقط ادمین)
export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nationalCode: true,
            phone: true,
            department: true,
            position: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // افزودن isFirstLogin و passwordChangedAt به خروجی
    const enrichedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      mobile: u.mobile,
      role: u.role,
      isActive: u.isActive,
      isFirstLogin: u.isFirstLogin,
      passwordChangedAt: u.passwordChangedAt,
      lastLogin: u.lastLogin,
      employeeId: u.employeeId,
      employee: u.employee,
    }))

    return NextResponse.json({ users: enrichedUsers })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست کاربران' }, { status: 500 })
  }
}

// POST /api/auth/users — ایجاد اکانت کارمند توسط ادمین (اتوماتیک با موبایل و کد ملی)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { employeeId, mobile, role, isActive } = body

    if (!employeeId || !mobile || !role) {
      return NextResponse.json(
        { error: 'شناسه کارمند، شماره موبایل و نقش الزامی است' },
        { status: 400 }
      )
    }

    // بررسی وجود کارمند
    const employee = await db.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })
    }

    // نرمال‌سازی موبایل
    let normalizedMobile = mobile.replace(/\s/g, '')
    if (normalizedMobile.startsWith('98')) normalizedMobile = '0' + normalizedMobile.slice(2)
    if (!normalizedMobile.startsWith('0')) normalizedMobile = '0' + normalizedMobile

    // بررسی تکرار موبایل
    const existingMobile = await db.user.findUnique({ where: { mobile: normalizedMobile } })
    if (existingMobile) {
      return NextResponse.json({ error: 'این شماره موبایل قبلاً ثبت شده است' }, { status: 400 })
    }

    // بررسی تکرار اتصال کارمند
    const existingEmployee = await db.user.findUnique({ where: { employeeId } })
    if (existingEmployee) {
      return NextResponse.json({ error: 'این کارمند قبلاً اکانت دارد' }, { status: 400 })
    }

    // رمز عبور = هش کد ملی (اتوماتیک)
    const password = await bcrypt.hash(employee.nationalCode, 10)

    const user = await db.user.create({
      data: {
        mobile: normalizedMobile,
        password,
        role,
        isActive: isActive !== false,
        employeeId,
        isFirstLogin: true, // کارمند باید بعد از اولین ورود رمز را تغییر دهد
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            nationalCode: true,
            phone: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `اکانت برای ${employee.firstName} ${employee.lastName} ایجاد شد — نام کاربری: ${normalizedMobile} — رمز عبور: کد ملی`,
      user: {
        id: user.id,
        mobile: user.mobile,
        role: user.role,
        isActive: user.isActive,
        name: `${user.employee?.firstName} ${user.employee?.lastName}`,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد اکانت کارمند' }, { status: 500 })
  }
}

// PUT /api/auth/users — بروزرسانی اکانت (تغییر نقش/وضعیت/بازنشانی رمز)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, role, isActive, resetPassword, mobile } = body

    if (!userId) {
      return NextResponse.json({ error: 'شناسه کاربر الزامی است' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { employee: { select: { nationalCode: true, firstName: true, lastName: true } } }
    })

    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    if (mobile) {
      let normalizedMobile = mobile.replace(/\s/g, '')
      if (normalizedMobile.startsWith('98')) normalizedMobile = '0' + normalizedMobile.slice(2)
      if (!normalizedMobile.startsWith('0')) normalizedMobile = '0' + normalizedMobile
      updateData.mobile = normalizedMobile
    }

    // بازنشانی رمز عبور به کد ملی
    if (resetPassword && user.employee?.nationalCode) {
      updateData.password = await bcrypt.hash(user.employee.nationalCode, 10)
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: resetPassword
        ? `رمز عبور ${user.employee?.firstName} به کد ملی بازنشانی شد`
        : 'اطلاعات کاربر بروزرسانی شد',
      user: { id: updated.id, mobile: updated.mobile, role: updated.role, isActive: updated.isActive },
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی کاربر' }, { status: 500 })
  }
}

// DELETE /api/auth/users — حذف اکانت کارمند
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'شناسه کاربر الزامی است' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 })
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'امکان حذف ادمین وجود ندارد' }, { status: 400 })
    }

    await db.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true, message: 'اکانت کاربر حذف شد' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'خطا در حذف کاربر' }, { status: 500 })
  }
}
