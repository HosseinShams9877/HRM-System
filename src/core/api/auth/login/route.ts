import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, mobile, password, loginType } = body

    // ═══════════════════════════════════════════
    // حالت ۱: ورود ادمین با ایمیل + رمز عبور
    // ═══════════════════════════════════════════
    if (loginType === 'admin' || email) {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'ایمیل و رمز عبور الزامی است' },
          { status: 400 }
        )
      }

      const user = await db.user.findUnique({
        where: { email },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
              position: true,
              avatar: true,
            }
          }
        }
      })

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: 'ایمیل یا رمز عبور اشتباه است' },
          { status: 401 }
        )
      }

      // فقط ادمین اجازه ورود با ایمیل دارد
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'فقط مدیر سیستم با ایمیل وارد می‌شود. کارمندان از شماره موبایل استفاده می‌کنند.' },
          { status: 401 }
        )
      }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'ایمیل یا رمز عبور اشتباه است' },
          { status: 401 }
        )
      }

      // بروزرسانی آخرین ورود
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })

      const sessionData = {
        userId: user.id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        employeeId: user.employeeId,
        name: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : 'مدیر سیستم',
        department: user.employee?.department || null,
        position: user.employee?.position || null,
      }

      const response = NextResponse.json({
        success: true,
        isFirstLogin: user.isFirstLogin,
        user: {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          employeeId: user.employeeId,
          name: sessionData.name,
          department: sessionData.department,
          position: sessionData.position,
        }
      })

      response.cookies.set('hr-session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      return response
    }

    // ═══════════════════════════════════════════
    // حالت ۲: ورود کارمند با شماره موبایل + کد ملی
    // ═══════════════════════════════════════════
    if (loginType === 'employee' || mobile) {
      if (!mobile || !password) {
        return NextResponse.json(
          { error: 'شماره موبایل و کد ملی الزامی است' },
          { status: 400 }
        )
      }

      // نرمال‌سازی شماره موبایل
      let normalizedMobile = mobile.replace(/\s/g, '')
      if (normalizedMobile.startsWith('98')) {
        normalizedMobile = '0' + normalizedMobile.slice(2)
      }
      if (!normalizedMobile.startsWith('0')) {
        normalizedMobile = '0' + normalizedMobile
      }

      const user = await db.user.findUnique({
        where: { mobile: normalizedMobile },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
              position: true,
              avatar: true,
              nationalCode: true,
            }
          }
        }
      })

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: 'شماره موبایل یا کد ملی اشتباه است' },
          { status: 401 }
        )
      }

      // ادمین‌ها فقط با ایمیل وارد می‌شوند
      if (user.role === 'admin') {
        return NextResponse.json(
          { error: 'مدیر سیستم باید از بخش ورود ادمین استفاده کند.' },
          { status: 401 }
        )
      }

      // بررسی رمز عبور (کد ملی هش شده یا رمز تغییر یافته)
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'شماره موبایل یا رمز عبور اشتباه است' },
          { status: 401 }
        )
      }

      // بروزرسانی آخرین ورود
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })

      const sessionData = {
        userId: user.id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        employeeId: user.employeeId,
        name: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : '',
        department: user.employee?.department || null,
        position: user.employee?.position || null,
      }

      const response = NextResponse.json({
        success: true,
        isFirstLogin: user.isFirstLogin,
        user: {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          employeeId: user.employeeId,
          name: sessionData.name,
          department: sessionData.department,
          position: sessionData.position,
        }
      })

      response.cookies.set('hr-session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { error: 'اطلاعات ورود ناقص است' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'خطای سرور در ورود به سیستم' },
      { status: 500 }
    )
  }
}
