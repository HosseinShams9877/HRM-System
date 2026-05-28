import { NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import * as jalaali from 'jalaali-js'

export async function GET() {
  try {
    const today = new Date()
    const { jy, jm, jd } = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate())
    const todayStr = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`

    const totalEmployees = await db.employee.count({ where: { status: 'active' } })

    // 7-day trend dates
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      const { jy: y, jm: m, jd: dd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
      return `${y}/${String(m).padStart(2, '0')}/${String(dd).padStart(2, '0')}`
    })

    const [weekAttendance, todayAttendance] = await Promise.all([
      db.attendance.findMany({
        where: { date: { in: dates } },
        include: { employee: { select: { firstName: true, lastName: true } } },
      }),
      db.attendance.findMany({
        where: { date: todayStr },
        include: { employee: { select: { firstName: true, lastName: true, department: true } } },
      }),
    ])

    // Process 7-day trend
    const trend = dates.map(dateStr => {
      const dayRecords = weekAttendance.filter(a => a.date === dateStr)
      const present = dayRecords.filter(a => a.status === 'present' || a.status === 'late').length
      return {
        date: dateStr,
        rate: totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0,
        present,
        absent: totalEmployees - present,
        total: totalEmployees,
      }
    })

    // Process today's summary
    const summary = {
      total: totalEmployees,
      present: todayAttendance.filter(a => a.status === 'present').length,
      late: todayAttendance.filter(a => a.status === 'late').length,
      leave: todayAttendance.filter(a => a.status === 'leave').length,
      mission: todayAttendance.filter(a => a.status === 'mission').length,
      absent: Math.max(0, totalEmployees - todayAttendance.filter(a => ['present', 'late', 'leave', 'mission'].includes(a.status)).length),
    }

    return NextResponse.json({ trend, summary, todayRecords: todayAttendance })
  } catch (error) {
    console.error('Attendance stats error:', error)
    return NextResponse.json({ error: 'خطا در دریافت آمار حضور' }, { status: 500 })
  }
}
