import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'

// POST /api/auth/change-password — تغییر رمز عبور و/یا شماره موبایل
export async function POST(req: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword, newMobile } = body

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        employee: { select: { nationalCode: true, firstName: true, lastName: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    // ═══════════════════════════════════════════
    // تغییر رمز عبور
    // ═══════════════════════════════════════════
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'رمز عبور فعلی الزامی است' },
          { status: 400 }
        )
      }

      // بررسی رمز عبور فعلی
      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'رمز عبور فعلی اشتباه است' },
          { status: 400 }
        )
      }

      // بررسی طول رمز جدید
      if (newPassword.length < 4) {
        return NextResponse.json(
          { error: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد' },
          { status: 400 }
        )
      }

      // رمز جدید نباید مثل قدیمی باشد
      const isSamePassword = await bcrypt.compare(newPassword, user.password)
      if (isSamePassword) {
        return NextResponse.json(
          { error: 'رمز عبور جدید نباید با رمز فعلی یکسان باشد' },
          { status: 400 }
        )
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
      updateData.passwordChangedAt = new Date()
      updateData.isFirstLogin = false
    }

    // ═══════════════════════════════════════════
    // تغییر شماره موبایل (فقط کارمندان)
    // ═══════════════════════════════════════════
    if (newMobile) {
      // ادمین‌ها شماره موبایل را از طریق ایمیل وارد می‌شوند
      if (userRole === 'admin') {
        return NextResponse.json(
          { error: 'مدیر سیستم شماره موبایل را نمی‌تواند تغییر دهد' },
          { status: 400 }
        )
      }

      // نرمال‌سازی شماره موبایل
      let normalizedMobile = newMobile.replace(/\s/g, '')
      if (normalizedMobile.startsWith('98')) normalizedMobile = '0' + normalizedMobile.slice(2)
      if (!normalizedMobile.startsWith('0')) normalizedMobile = '0' + normalizedMobile

      // اعتبارسنجی فرمت
      if (!/^09[0-9]{9}$/.test(normalizedMobile)) {
        return NextResponse.json(
          { error: 'فرمت شماره موبایل صحیح نیست (مثال: 09121234567)' },
          { status: 400 }
        )
      }

      // بررسی تکرار نبودن شماره
      if (normalizedMobile !== user.mobile) {
        const existingMobile = await db.user.findUnique({
          where: { mobile: normalizedMobile }
        })
        if (existingMobile) {
          return NextResponse.json(
            { error: 'این شماره موبایل قبلاً توسط کاربر دیگری ثبت شده است' },
            { status: 400 }
          )
        }
        updateData.mobile = normalizedMobile
      }
    }

    // اگر هیچ تغییری نیست
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'هیچ تغییری برای اعمال مشخص نشده است' },
        { status: 400 }
      )
    }

    // بروزرسانی کاربر
    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        employee: { select: { firstName: true, lastName: true, department: true, position: true } }
      }
    })

    // بروزرسانی سشن کوکی
    const sessionData = {
      userId: updated.id,
      email: updated.email,
      mobile: updated.mobile,
      role: updated.role,
      employeeId: updated.employeeId,
      name: updated.employee ? `${updated.employee.firstName} ${updated.employee.lastName}` : '',
      department: updated.employee?.department || null,
      position: updated.employee?.position || null,
    }

    const response = NextResponse.json({
      success: true,
      message: 'اطلاعات با موفقیت بروزرسانی شد',
      isFirstLogin: updated.isFirstLogin,
      mobile: updated.mobile,
    })

    response.cookies.set('hr-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'خطا در بروزرسانی اطلاعات' },
      { status: 500 }
    )
  }
}
