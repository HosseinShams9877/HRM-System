import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { validateWithZod, attendanceCreateSchema } from '@/core/lib/validators'
import { parsePagination, createPaginationMeta } from '@/core/lib/pagination'
import { cookies } from 'next/headers' 
// روز هفته شمسی: شنبه=0, ..., جمعه=6
function getShamsiDayOfWeek(dateStr: string): number {
  // تبدیل ساده: فرض می‌کنیم تاریخ شمسی معتبر است
  // روز هفته میلادی → روز هفته شمسی (جمعه=6 در هر دو)
  const parts = dateStr.split('/').map(Number)
  if (parts.length !== 3) return 0
  // استفاده از jalaali-js برای تبدیل دقیق
  try {
    const jalaali = require('jalaali-js')
    const miladi = jalaali.toGregorian(parts[0], parts[1], parts[2])
    const d = new Date(miladi.gy, miladi.gm - 1, miladi.gd)
    // میلادی: 0=Sun, 1=Mon, ..., 6=Sat → شمسی: شنبه=0
    const jsDay = d.getDay()
    // تبدیل: Sat→0, Sun→1, Mon→2, ..., Fri→6
    return jsDay === 6 ? 0 : jsDay + 1
  } catch {
    return 0
  }
}

// GET /api/attendance — لیست حضور و غیاب
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('hr-session')
    let currentUser = null
    if (sessionCookie) {
      try {
        currentUser = JSON.parse(sessionCookie.value)
      } catch (e) {
        console.error('Failed to parse session cookie:', e)
      }
    }
    
    console.log('🔍 currentUser from cookie:', currentUser)
    if (!currentUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || ''
    const status = searchParams.get('status') || ''
    const department = searchParams.get('department') || ''
    const search = searchParams.get('search') || ''
    const { skip, take, page, limit } = parsePagination(searchParams)

    // Build where clause with proper AND+OR syntax
    const andConditions: Record<string, unknown>[] = []

    // ✅ اگر کارمند عادی است، فقط خودش را ببیند
    if (currentUser.role === 'employee') {
      andConditions.push({ employeeId: currentUser.employeeId })
    }

    if (date) andConditions.push({ date })
    if (status) andConditions.push({ status })
    if (department) andConditions.push({ employee: { department } })
    if (search) {
      andConditions.push({
        OR: [
          { employee: { firstName: { contains: search } } },
          { employee: { lastName: { contains: search } } },
          { employee: { personnelCode: { contains: search } } },
        ],
      })
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {}

    // Compute stats from all matching records
    const allRecords = await db.attendance.findMany({
      where,
      select: { status: true },
    })

    const stats = {
      total: allRecords.length,
      present: allRecords.filter(r => r.status === 'present').length,
      absent: allRecords.filter(r => r.status === 'absent').length,
      late: allRecords.filter(r => r.status === 'late').length,
      leave: allRecords.filter(r => r.status === 'leave').length,
      mission: allRecords.filter(r => r.status === 'mission').length,
      earlyLeave: allRecords.filter(r => r.status === 'early_leave').length,
    }

    const total = allRecords.length

    const records = await db.attendance.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true, avatar: true, department: true, position: true } },
        shift: { select: { id: true, name: true, code: true, color: true } },
      },
      orderBy: [{ date: 'desc' }, { employee: { firstName: 'asc' } }],
      take,
      skip,
    })

    return NextResponse.json({
      data: records,
      pagination: createPaginationMeta(page, limit, total),
      stats,
    })
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json({ error: 'خطا در دریافت لیست حضور' }, { status: 500 })
  }
}

// POST /api/attendance — ثبت تردد (ورود/خروج) با تشخیص هوشمند تاخیر
export async function POST(req: NextRequest) {
  try {
    // ✅ اضافه کنید: گرفتن کاربر فعلی
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('hr-session')
    let currentUser = null
    if (sessionCookie) {
      try {
        currentUser = JSON.parse(sessionCookie.value)
      } catch (e) {
        console.error('Failed to parse session cookie:', e)
      }
    }
    
    console.log('🔍 currentUser from cookie (POST):', currentUser)
        if (!currentUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const body = await req.json()

    console.log('🔍 API DEBUG:')
    console.log('  currentUser.employeeId:', currentUser.employeeId)
    console.log('  body.employeeId:', body.employeeId)
    console.log('  currentUser.role:', currentUser.role)

    // ✅ اگر کارمند عادی است، فقط می‌تواند برای خودش ثبت کند
    let targetEmployeeId = body.employeeId
    if (currentUser.role === 'employee') {
      targetEmployeeId = currentUser.employeeId
      if (body.employeeId && body.employeeId !== targetEmployeeId) {
        return NextResponse.json(
          { error: 'شما فقط می‌توانید تردد خودتان را ثبت کنید' },
          { status: 403 }
        )
      }
    }

    if (!targetEmployeeId) {
      return NextResponse.json(
        { error: 'شناسه کارمند نامعتبر است' },
        { status: 400 }
      )
    }

    const validation = validateWithZod(attendanceCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است', details: validation.errors }, { status: 400 })
    }
    const validatedData = validation.data

    // ===== تشخیص هوشمند وضعیت بر اساس شیفت =====
    let computedStatus = body.status || 'present'
    let computedWorkHours = body.workHours || null
    let computedOvertime = body.overtime || null
    let shiftId = body.shiftId || null

    // گرفتن شیفت فعال کارمند
    const assignment = await db.employeeShiftAssignment.findFirst({
      where: {
        employeeId: targetEmployeeId,
        status: 'active',
      },
      include: {
        shift: {
          include: { schedules: true },
        },
      },
      orderBy: { startDate: 'desc' },
    })

    if (assignment?.shift) {
      shiftId = assignment.shift.id

      // روز هفته
      const dayOfWeek = getShamsiDayOfWeek(body.date)
      const schedule = assignment.shift.schedules.find(s => s.dayOfWeek === dayOfWeek)

      if (schedule) {
        // ===== تشخیص تاخیر هوشمند =====
        if (body.checkIn && schedule.lateThreshold) {
          const [cinH, cinM] = (body.checkIn as string).split(':').map(Number)
          const [lateH, lateM] = schedule.lateThreshold.split(':').map(Number)
          const checkInMinutes = cinH * 60 + cinM
          const lateMinutes = lateH * 60 + lateM

          if (checkInMinutes > lateMinutes && computedStatus === 'present') {
            computedStatus = 'late'
          }
        }

        // ===== تشخیص خروج زودرس =====
        if (body.checkOut && schedule.earlyLeaveThreshold) {
          const [coutH, coutM] = (body.checkOut as string).split(':').map(Number)
          const [earlyH, earlyM] = schedule.earlyLeaveThreshold.split(':').map(Number)
          const checkOutMinutes = coutH * 60 + coutM
          const earlyMinutes = earlyH * 60 + earlyM

          if (checkOutMinutes < earlyMinutes && computedStatus !== 'late') {
            computedStatus = 'early_leave'
          }
        }

        // ===== محاسبه کارکرد بر اساس شیفت =====
        // کارکرد واقعی
        if (body.checkIn && body.checkOut) {
          const [cinH, cinM] = (body.checkIn as string).split(':').map(Number)
          const [coutH, coutM] = (body.checkOut as string).split(':').map(Number)

          let totalMinutes = (coutH * 60 + coutM) - (cinH * 60 + cinM)

          // کم کردن زمان استراحت
          if (schedule.breakStart && schedule.breakEnd) {
            const [bsH, bsM] = schedule.breakStart.split(':').map(Number)
            const [beH, beM] = schedule.breakEnd.split(':').map(Number)
            const breakStartMin = bsH * 60 + bsM
            const breakEndMin = beH * 60 + beM

            // اگر استراحت در بازه کاری بوده
            if (breakStartMin >= (cinH * 60 + cinM) && breakEndMin <= (coutH * 60 + coutM)) {
              totalMinutes -= (breakEndMin - breakStartMin)
            }
          }

          computedWorkHours = Math.round((totalMinutes / 60) * 100) / 100

          // اضافه‌کاری: بیشتر از حداقل کارکرد شیفت
          if (computedWorkHours > schedule.minWorkHours) {
            computedOvertime = Math.round((computedWorkHours - schedule.minWorkHours) * 100) / 100
          } else {
            computedOvertime = 0
          }
        }
      }
    }

    // ثبت یا بروزرسانی رکورد حضور
    const record = await db.attendance.upsert({
      where: { employeeId_date: { employeeId: targetEmployeeId, date: body.date } },
      update: {
        checkIn: body.checkIn || undefined,
        checkOut: body.checkOut || undefined,
        status: computedStatus,
        workHours: computedWorkHours,
        overtime: computedOvertime,
        shiftId: shiftId,
      },
      create: {
        employeeId: targetEmployeeId,
        date: body.date,
        checkIn: body.checkIn || null,
        checkOut: body.checkOut || null,
        status: computedStatus,
        workHours: computedWorkHours,
        overtime: computedOvertime,
        shiftId: shiftId,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true } },
        shift: { select: { id: true, name: true, code: true, color: true } },
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Create attendance error:', error)
    return NextResponse.json({ error: 'خطا در ثبت تردد' }, { status: 500 })
  }
}