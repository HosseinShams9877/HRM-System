import { NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import * as jalaali from 'jalaali-js'
import { getSessionUser } from '@/core/lib/auth'

export async function GET() {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const role = sessionUser.role
    const employeeId = sessionUser.employeeId
    const isEmployee = role === 'employee'

    const today = new Date()
    const { jy, jm, jd } = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate())
    const todayStr = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
    const currentMonth = jm
    const currentYear = jy

    // محاسبه هفته‌های ۷ روز قبل
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      const { jy: y, jm: m, jd: dd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
      return `${y}/${String(m).padStart(2, '0')}/${String(dd).padStart(2, '0')}`
    })

    // ---- Batch 1: Independent queries in parallel ----
    const [
      totalEmployees,
      todayAttendance,
      pendingLeaves,
      pendingMissions,
      pendingLoans,
      pendingContracts,
      activeRecruitments,
      activeOffboardings,
      weekAttendance,
      performances,
    ] = await Promise.all([
      // Total employees (برای کارمند = 1)
      isEmployee ? Promise.resolve(1) : db.employee.count({ where: { status: 'active' } }),

      // Today's attendance
      db.attendance.findMany({ 
        where: { 
          date: todayStr, 
          ...(isEmployee && { employeeId }) 
        }, 
        include: { employee: { select: { firstName: true, lastName: true } } } 
      }),

      // Pending counts
      db.leave.count({ where: isEmployee ? { status: 'pending', employeeId } : { status: 'pending' } }),
      db.mission.count({ where: isEmployee ? { status: 'pending', employeeId } : { status: 'pending' } }),
      db.loanRequest.count({ where: isEmployee ? { status: 'pending', employeeId } : { status: 'pending' } }),
      db.contract.count({ where: isEmployee ? { status: 'active', endDate: { not: null }, employeeId } : { status: 'active', endDate: { not: null } } }),

      // Recruitment & offboarding (برای کارمند = 0)
      isEmployee ? Promise.resolve(0) : db.recruitment.count({ where: { status: 'open' } }),
      isEmployee ? Promise.resolve(0) : db.offboarding.count({ where: { status: 'in_progress' } }),

      // 7-day attendance trend
      db.attendance.findMany({
        where: {
          date: { in: weekDates },
          ...(isEmployee && { employeeId })
        }
      }),

      // Performance data for KPI (برای کارمند فقط خودش)
      db.performance.findMany({
        where: { 
          status: 'completed',
          ...(isEmployee && { employeeId })
        },
        include: { employee: true }
      }),
    ])

    // ---- Process today's attendance ----
    const presentToday = todayAttendance.filter(a => a.status === 'present').length
    const lateToday = todayAttendance.filter(a => a.status === 'late').length
    const leaveToday = todayAttendance.filter(a => a.status === 'leave').length
    const missionToday = todayAttendance.filter(a => a.status === 'mission').length
    const absentToday = Math.max(0, totalEmployees - presentToday - lateToday - leaveToday - missionToday)
    const noCheckIn = todayAttendance.filter(a => !a.checkIn).length
    const overtimeExceeded = todayAttendance.filter(a => (a.overtime || 0) > 3).length

    // ---- People names per status ----
    const presentNames = todayAttendance
      .filter(a => a.status === 'present')
      .map(a => ({ id: a.employeeId, name: `${(a as any).employee?.firstName || ''} ${(a as any).employee?.lastName || ''}`.trim() }))

    // برای کارمند، غایب‌ها فقط خودشه اگر غایب باشه
    let absentNames: { id: string; name: string }[] = []
    if (isEmployee) {
      const hasAttendance = todayAttendance.length > 0
      if (!hasAttendance) {
        const employee = await db.employee.findUnique({
          where: { id: employeeId },
          select: { id: true, firstName: true, lastName: true }
        })
        if (employee) {
          absentNames = [{ id: employee.id, name: `${employee.firstName} ${employee.lastName}` }]
        }
      }
    } else {
      const absentEmployeeIds = new Set(todayAttendance.map(a => a.employeeId))
      const absentEmployees = await db.employee.findMany({
        where: { status: 'active', id: { notIn: [...absentEmployeeIds] } },
        select: { id: true, firstName: true, lastName: true },
      })
      absentNames = absentEmployees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))
    }

    const lateNames = todayAttendance
      .filter(a => a.status === 'late')
      .map(a => ({ id: a.employeeId, name: `${(a as any).employee?.firstName || ''} ${(a as any).employee?.lastName || ''}`.trim() }))

    const leaveNames = todayAttendance
      .filter(a => a.status === 'leave')
      .map(a => ({ id: a.employeeId, name: `${(a as any).employee?.firstName || ''} ${(a as any).employee?.lastName || ''}`.trim() }))

    const missionNames = todayAttendance
      .filter(a => a.status === 'mission')
      .map(a => ({ id: a.employeeId, name: `${(a as any).employee?.firstName || ''} ${(a as any).employee?.lastName || ''}`.trim() }))

    // ---- Batch 2: Queries that depend on previous results ----
    const [paySlips, expiringContracts] = await Promise.all([
      // Pay slips for current month
      db.paySlip.findMany({
        where: { year: currentYear, month: currentMonth }
      }),
      // Expiring contracts (برای کارمند فقط قرارداد خودش)
      db.contract.findMany({
        where: { 
          status: 'active', 
          endDate: { not: null },
          ...(isEmployee && { employeeId })
        },
        include: { employee: true },
        take: isEmployee ? undefined : 5,
      }),
    ])

    const monthlySalary = paySlips.reduce((sum, p) => sum + (p.netSalary || 0), 0)

    // Insurance calculation
    const slipIds = paySlips.map(p => p.id)
    let monthlyInsurance = 0
    if (slipIds.length > 0) {
      const insuranceItems = await db.paySlipItem.findMany({
        where: {
          paySlipId: { in: slipIds },
          category: 'deduction',
          payrollItem: {
            formula: { code: 'insurance_employee' },
          },
        },
      })
      monthlyInsurance = insuranceItems.reduce((sum, item) => sum + (item.amount || 0), 0)
    }

    // ---- Birthdays & anniversaries (برای کارمند فقط خودش) ----
    const monthPrefix1 = `/${String(currentMonth).padStart(2, '0')}/`
    const [birthdaysThisMonth, marriageAnniversaries] = await Promise.all([
      db.employee.findMany({
        where: {
          status: 'active',
          birthDate: { contains: monthPrefix1 },
          ...(isEmployee && { id: employeeId })
        },
        select: { id: true, firstName: true, lastName: true, birthDate: true }
      }),
      db.employee.findMany({
        where: {
          status: 'active',
          marriageDate: { contains: monthPrefix1 },
          ...(isEmployee && { id: employeeId })
        },
        select: { id: true, firstName: true, lastName: true, marriageDate: true }
      }),
    ])

    // ---- Process 7-day trend ----
    const weekTrend = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const { jy: y, jm: m, jd: dd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
      const dateStr = `${y}/${String(m).padStart(2, '0')}/${String(dd).padStart(2, '0')}`
      const dayRecords = weekAttendance.filter(a => a.date === dateStr)
      const dayPresent = dayRecords.filter(a => a.status === 'present' || a.status === 'late').length
      const rate = totalEmployees > 0 ? Math.round((dayPresent / totalEmployees) * 100) : 0
      weekTrend.push({ date: dateStr, rate })
    }

    // ---- Process KPI data ----
    const deptKpi: Record<string, { actual: number; target: number; count: number }> = {}
    performances.forEach(p => {
      const dept = p.employee.department || 'بدون دپارتمان'
      if (!deptKpi[dept]) deptKpi[dept] = { actual: 0, target: 0, count: 0 }
      deptKpi[dept].actual += p.score
      deptKpi[dept].target += p.target
      deptKpi[dept].count++
    })

    const kpiData = Object.entries(deptKpi).map(([dept, data]) => ({
      department: dept,
      actual: Math.round((data.actual / data.count) * 10) / 10,
      target: Math.round((data.target / data.count) * 10) / 10,
      gap: Math.round(((data.actual / data.count) - (data.target / data.count)) * 10) / 10,
    }))

    return NextResponse.json({
      stats: {
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        leaveToday,
        missionToday,
        noCheckIn,
        overtimeExceeded,
        monthlySalary,
        monthlyInsurance,
      },
      people: {
        present: presentNames,
        absent: absentNames,
        late: lateNames,
        leave: leaveNames,
        mission: missionNames,
      },
      pending: {
        leaves: pendingLeaves,
        missions: pendingMissions,
        loans: pendingLoans,
        contracts: pendingContracts,
      },
      alerts: {
        expiringContracts: expiringContracts.map(c => ({
          id: c.id,
          title: c.title,
          employeeName: `${c.employee.firstName} ${c.employee.lastName}`,
          endDate: c.endDate,
        })),
        birthdays: birthdaysThisMonth.map(e => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          date: e.birthDate,
        })),
        marriageAnniversaries: marriageAnniversaries.map(e => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          date: e.marriageDate,
        })),
      },
      kpi: kpiData,
      recruitment: {
        active: activeRecruitments,
        offboarding: activeOffboardings,
      },
      attendanceTrend: weekTrend,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'خطا در بارگذاری اطلاعات داشبورد' }, { status: 500 })
  }
}