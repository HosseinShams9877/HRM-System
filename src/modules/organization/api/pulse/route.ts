import { NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import * as jalaali from 'jalaali-js'

// GET /api/organization/pulse — نبض سازمان: نمای سلامت و پویایی سازمان
export async function GET() {
  try {
    const today = new Date()
    const { jy, jm, jd } = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate())
    const todayStr = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`

    // ===== ۱. آمار نیروها =====
    const totalEmployees = await db.employee.count({ where: { status: 'active' } })
    const newHiresThisMonth = await db.employee.count({
      where: {
        status: 'active',
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
    })

    // خروجی‌ها (آفبوردینگ‌های تکمیل شده این ماه)
    const offboardingsThisMonth = await db.offboarding.count({
      where: {
        status: 'completed',
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
    })

    // ===== ۲. آمار حضور امروز =====
    const todayAttendance = await db.attendance.findMany({ where: { date: todayStr } })
    const presentToday = todayAttendance.filter(a => a.status === 'present').length
    const lateToday = todayAttendance.filter(a => a.status === 'late').length
    const leaveToday = todayAttendance.filter(a => a.status === 'leave').length
    const missionToday = todayAttendance.filter(a => a.status === 'mission').length
    const absentToday = Math.max(0, totalEmployees - presentToday - lateToday - leaveToday - missionToday)
    const attendanceRate = totalEmployees > 0 ? Math.round(((presentToday + lateToday) / totalEmployees) * 100) : 0

    // ===== ۳. روند حضور ۳۰ روز =====
    const attendanceTrend30 = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const { jy: y, jm: m, jd: dd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
      const dateStr = `${y}/${String(m).padStart(2, '0')}/${String(dd).padStart(2, '0')}`
      const dayAtt = await db.attendance.findMany({ where: { date: dateStr } })
      const dayPresent = dayAtt.filter(a => a.status === 'present' || a.status === 'late').length
      const rate = totalEmployees > 0 ? Math.round((dayPresent / totalEmployees) * 100) : 0
      attendanceTrend30.push({ date: dateStr, rate, present: dayPresent })
    }

    // ===== ۴. آمار پست‌های سازمانی =====
    const totalPositions = await db.position.count()
    const activePositions = await db.position.count({ where: { status: 'active' } })
    const filledAppointments = await db.appointment.count({ where: { status: 'active' } })
    const totalHeadcount = await db.position.aggregate({ _sum: { headcount: true } })
    const positionFillRate = (totalHeadcount._sum.headcount || 0) > 0
      ? Math.round((filledAppointments / totalHeadcount._sum.headcount!) * 100)
      : 0

    // ===== ۵. دپارتمان‌ها =====
    const departments = await db.department.findMany({
      include: {
        positions: {
          include: {
            appointments: { where: { status: 'active' } },
          },
        },
      },
    })
    const employees = await db.employee.findMany({
      where: { status: 'active' },
      select: { department: true },
    })
    const employeeCountByDept = new Map<string, number>()
    for (const emp of employees) {
      if (emp.department) {
        employeeCountByDept.set(emp.department, (employeeCountByDept.get(emp.department) || 0) + 1)
      }
    }

    const deptHealth = departments.map(dept => {
      const empCount = employeeCountByDept.get(dept.name) || 0
      const headcount = dept.positions.reduce((s, p) => s + p.headcount, 0)
      const filled = dept.positions.reduce((s, p) => s + p.appointments.length, 0)
      const fillRate = headcount > 0 ? Math.round((filled / headcount) * 100) : 0

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        employeeCount: empCount,
        totalPositions: dept.positions.length,
        headcount,
        filled,
        fillRate,
      }
    })

    // ===== ۶. درخواست‌های در انتظار =====
    const pendingLeaves = await db.leave.count({ where: { status: 'pending' } })
    const pendingMissions = await db.mission.count({ where: { status: 'pending' } })
    const pendingLoans = await db.loanRequest.count({ where: { status: 'pending' } })

    // ===== ۷. قراردادهای در حال انقضا =====
    const expiringContracts = await db.contract.count({
      where: {
        status: 'active',
        endDate: { not: null },
      },
    })

    // ===== ۸. ارزیابی عملکرد =====
    const performances = await db.performance.findMany({
      where: { status: 'completed' },
    })
    const avgScore = performances.length > 0
      ? Math.round((performances.reduce((s, p) => s + p.score, 0) / performances.length) * 10) / 10
      : 0

    // ===== ۹. استخدام =====
    const openRecruitments = await db.recruitment.count({ where: { status: 'open' } })

    // ===== ۱۰. آموزش =====
    const activeTraining = await db.training.count({ where: { status: 'in_progress' } })

    // ===== نمره سلامت سازمان =====
    const healthScore = Math.round(
      (attendanceRate * 0.3) +
      (positionFillRate * 0.2) +
      (avgScore >= 70 ? 100 : (avgScore / 70) * 100) * 0.2 +
      (expiringContracts === 0 ? 100 : Math.max(0, 100 - expiringContracts * 10)) * 0.15 +
      ((pendingLeaves + pendingMissions + pendingLoans) === 0 ? 100 : Math.max(0, 100 - (pendingLeaves + pendingMissions + pendingLoans) * 5)) * 0.15
    )

    // ===== نمره پویایی سازمان =====
    const dynamismScore = Math.min(100, Math.round(
      (newHiresThisMonth > 0 ? 50 : 0) +
      (openRecruitments > 0 ? 25 : 0) +
      (activeTraining > 0 ? 25 : 0)
    ))

    return NextResponse.json({
      healthScore,
      dynamismScore,
      employees: {
        total: totalEmployees,
        newHiresThisMonth,
        offboardingsThisMonth,
        turnoverRate: totalEmployees > 0
          ? Math.round((offboardingsThisMonth / totalEmployees) * 1000) / 10
          : 0,
      },
      attendance: {
        present: presentToday,
        late: lateToday,
        leave: leaveToday,
        mission: missionToday,
        absent: absentToday,
        rate: attendanceRate,
        trend: attendanceTrend30,
      },
      positions: {
        total: totalPositions,
        active: activePositions,
        filled: filledAppointments,
        totalHeadcount: totalHeadcount._sum.headcount || 0,
        fillRate: positionFillRate,
      },
      departments: deptHealth,
      pending: {
        leaves: pendingLeaves,
        missions: pendingMissions,
        loans: pendingLoans,
        expiringContracts,
      },
      performance: {
        avgScore,
        completedCount: performances.length,
      },
      recruitment: {
        openPositions: openRecruitments,
      },
      training: {
        activeCourses: activeTraining,
      },
    })
  } catch (error) {
    console.error('Organization pulse API error:', error)
    return NextResponse.json({ error: 'خطا در دریافت نبض سازمان' }, { status: 500 })
  }
}
