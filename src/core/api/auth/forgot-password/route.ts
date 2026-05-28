import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/auth/forgot-password — درخواست کد بازیابی (ارسال SMS)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mobile } = body

    if (!mobile) {
      return NextResponse.json(
        { error: 'شماره موبایل الزامی است' },
        { status: 400 }
      )
    }

    // نرمال‌سازی شماره موبایل
    let normalizedMobile = mobile.replace(/\s/g, '')
    if (normalizedMobile.startsWith('98')) normalizedMobile = '0' + normalizedMobile.slice(2)
    if (!normalizedMobile.startsWith('0')) normalizedMobile = '0' + normalizedMobile

    // اعتبارسنجی فرمت
    if (!/^09[0-9]{9}$/.test(normalizedMobile)) {
      return NextResponse.json(
        { error: 'فرمت شماره موبایل صحیح نیست' },
        { status: 400 }
      )
    }

    // بررسی وجود کاربر با این شماره موبایل
    const user = await db.user.findUnique({
      where: { mobile: normalizedMobile }
    })

    if (!user || !user.isActive) {
      // به دلایل امنیتی پیام یکسان برمی‌گردانیم
      return NextResponse.json({
        success: true,
        message: 'اگر این شماره در سیستم ثبت شده باشد، کد بازیابی ارسال خواهد شد',
      })
    }

    // ادمین‌ها نمی‌توانند از این روش استفاده کنند
    if (user.role === 'admin') {
      return NextResponse.json({
        success: true,
        message: 'اگر این شماره در سیستم ثبت شده باشد، کد بازیابی ارسال خواهد شد',
      })
    }

    // حذف کدهای قبلی استفاده نشده
    await db.passwordReset.deleteMany({
      where: { userId: user.id, isUsed: false }
    })

    // تولید کد تأیید ۵ رقمی
    const code = String(Math.floor(10000 + Math.random() * 90000))

    // ذخیره کد در دیتابیس (انقضا: ۵ دقیقه)
    await db.passwordReset.create({
      data: {
        userId: user.id,
        mobile: normalizedMobile,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }
    })

    // ═══════════════════════════════════════════
    // ارسال واقعی SMS (در محیط تولید)
    // فعلاً کد در پاسخ برمی‌گردد (تست)
    // ═══════════════════════════════════════════
    // در محیط تولید باید از سرویس SMS استفاده شود:
    // await sendSMS(normalizedMobile, `کد بازیابی رمز عبور شما: ${code}`)

    return NextResponse.json({
      success: true,
      message: 'کد بازیابی ارسال شد',
      // ⚠️ فقط در محیط تست — در تولید حذف شود
      _debugCode: process.env.NODE_ENV === 'development' ? code : undefined,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'خطا در ارسال کد بازیابی' },
      { status: 500 }
    )
  }
}

// PUT /api/auth/forgot-password — تأیید کد و تغییر رمز عبور
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { mobile, code, newPassword } = body

    if (!mobile || !code || !newPassword) {
      return NextResponse.json(
        { error: 'شماره موبایل، کد تأیید و رمز عبور جدید الزامی است' },
        { status: 400 }
      )
    }

    // نرمال‌سازی شماره موبایل
    let normalizedMobile = mobile.replace(/\s/g, '')
    if (normalizedMobile.startsWith('98')) normalizedMobile = '0' + normalizedMobile.slice(2)
    if (!normalizedMobile.startsWith('0')) normalizedMobile = '0' + normalizedMobile

    // اعتبارسنجی رمز جدید
    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد' },
        { status: 400 }
      )
    }

    // بررسی کاربر
    const user = await db.user.findUnique({
      where: { mobile: normalizedMobile }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این شماره موبایل یافت نشد' },
        { status: 404 }
      )
    }

    // جستجوی کد فعال
    const resetRecord = await db.passwordReset.findFirst({
      where: {
        userId: user.id,
        mobile: normalizedMobile,
        code,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'کد تأیید نامعتبر یا منقضی شده است' },
        { status: 400 }
      )
    }

    // علامت‌گذاری کد به عنوان استفاده شده
    await db.passwordReset.update({
      where: { id: resetRecord.id },
      data: { isUsed: true },
    })

    // تغییر رمز عبور
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        isFirstLogin: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر کرد. لطفاً با رمز عبور جدید وارد شوید.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'خطا در تغییر رمز عبور' },
      { status: 500 }
    )
  }
}
