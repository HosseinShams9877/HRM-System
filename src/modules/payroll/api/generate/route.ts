import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { computeFormula, buildFormulaContext, type FormulaDefinition } from '../../constants'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { getShamsiDayOfWeek, isNightShift, calculateMonthOverlap } from '@/core/lib/shamsi'

// POST /api/payroll/generate — تولید خودکار فیش حقوقی برای کارکنان فعال
// تمام محاسبات بر اساس آیتم‌های دینامیک و فرمول‌های پویا انجام می‌شود
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'payroll:generate')) {
      return NextResponse.json({ error: 'شما اجازه تولید فیش حقوقی را ندارید' }, { status: 403 })
    }

    const body = await req.json()

    if (!body.year || !body.month) {
      return NextResponse.json({ error: 'سال و ماه الزامی است' }, { status: 400 })
    }

    const year = parseInt(String(body.year))
    const month = parseInt(String(body.month))

    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'ماه باید بین ۱ تا ۱۲ باشد' }, { status: 400 })
    }

    // ─── دریافت تنظیمات حقوقی سال ───
    const setting = await db.payrollSetting.findUnique({ where: { year } })
    if (!setting) {
      return NextResponse.json(
        { error: `تنظیمات حقوقی سال ${year} تعریف نشده است. ابتدا از بخش تنظیمات، داده‌های سال را وارد کنید.` },
        { status: 400 }
      )
    }

    // ─── دریافت آیتم‌های حقوقی فعال سال ───
    const payrollItems = await db.payrollItem.findMany({
      where: { year, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { formula: { include: { variables: true } } },
    })

    if (payrollItems.length === 0) {
      return NextResponse.json(
        { error: `آیتم حقوقی برای سال ${year} تعریف نشده است. ابتدا از بخش تنظیمات آیتم‌ها را تعریف کنید.` },
        { status: 400 }
      )
    }

    // ─── دریافت پله‌های مالیاتی ───
    const taxBrackets = await db.taxBracket.findMany({
      where: { year },
      orderBy: { orderNum: 'asc' },
    })

    // ─── دریافت فرمول‌های دینامیک سال ───
    const dynamicFormulas = await db.salaryFormula.findMany({
      where: { year, isActive: true },
      include: { variables: true },
    })
    // مپ بر اساس id — اصلی‌ترین روش اتصال از طریق formulaId
    const formulaMapById = new Map<string, FormulaDefinition>()
    for (const f of dynamicFormulas) {
      const def: FormulaDefinition = {
        id: f.id,
        code: f.code,
        name: f.name,
        expression: f.expression,
        year: f.year,
        variables: f.variables.map(v => ({
          varName: v.varName,
          sourceType: v.sourceType,
          sourceId: v.sourceId,
          label: v.label,
        })),
      }
      formulaMapById.set(f.id, def)
    }

    // ─── دریافت کارکنان فعال ───
    const employees = await db.employee.findMany({
      where: { status: 'active' },
      include: {
        contracts: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        appointments: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { position: true },
        },
        loanRequests: {
          where: { status: 'approved' },
        },
        performances: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (employees.length === 0) {
      return NextResponse.json({ error: 'هیچ کارمند فعالی یافت نشد' }, { status: 404 })
    }

    // ─── دریافت فیش‌های حقوقی موجود برای این ماه ───
    const existingSlips = await db.paySlip.findMany({
      where: { year, month },
      select: { employeeId: true },
    })
    const existingEmployeeIds = new Set(existingSlips.map(s => s.employeeId))

    // پیشوند ماه شمسی
    const monthStr = String(month).padStart(2, '0')
    const monthPrefix = `${year}/${monthStr}/`

    let generated = 0
    let skipped = 0
    const errors: string[] = []

    for (const employee of employees) {
      if (existingEmployeeIds.has(employee.id)) {
        skipped++
        continue
      }

      try {
        // ═══════════════════════════════════════
        // محاسبه حقوق پایه (دینامیک — از قرارداد/پست/پیش‌فرض)
        // ═══════════════════════════════════════
        let baseSalary = setting.baseSalaryDefault

        // اولویت ۱: آخرین قرارداد فعال
        if (employee.contracts && employee.contracts.length > 0 && employee.contracts[0].amount) {
          baseSalary = employee.contracts[0].amount
        }
        // اولویت ۲: پست سازمانی
        else if (employee.appointments && employee.appointments.length > 0) {
          const position = employee.appointments[0].position
          if (position?.maxSalary) {
            baseSalary = position.maxSalary
          }
        }

        // ═══════════════════════════════════════
        // محاسبه ساعات اضافه‌کاری، شب‌کاری، جمعه‌کاری از حاضر و غیاب
        // ═══════════════════════════════════════
        const attendanceRecords = await db.attendance.findMany({
          where: {
            employeeId: employee.id,
            date: { startsWith: monthPrefix },
          },
          include: { shift: { include: { schedules: true } } },
        })

        let totalOvertimeHours = 0
        let totalNightShiftHours = 0
        let totalFridayWorkHours = 0
        let totalHolidayWorkHours = 0

        // دریافت تعطیلات رسمی ماه جاری
        const holidays = await db.holiday.findMany({
          where: {
            OR: [
              { type: 'رسمی' },
            ],
          },
        })
        const holidayDates = new Set(
          holidays
            .map(h => h.date)
            .filter(d => d && d.startsWith(monthPrefix))
        )

        for (const rec of attendanceRecords) {
          if (rec.overtime) totalOvertimeHours += rec.overtime
          if (rec.shiftId && rec.shift) {
            const dayOfWeek = getShamsiDayOfWeek(rec.date)
            const schedule = rec.shift.schedules.find((s: { dayOfWeek: number }) => s.dayOfWeek === dayOfWeek)
            if (schedule) {
              if (isNightShift(schedule.startTime, schedule.endTime)) {
                if (rec.workHours) totalNightShiftHours += rec.workHours
              }
            }
          }
          // جمعه‌کاری
          if (getShamsiDayOfWeek(rec.date) === 6 && rec.workHours) {
            totalFridayWorkHours += rec.workHours
          }
          // تعطیل‌کاری (روزهای تعطیل رسمی غیر از جمعه)
          if (holidayDates.has(rec.date) && getShamsiDayOfWeek(rec.date) !== 6 && rec.workHours) {
            totalHolidayWorkHours += rec.workHours
          }
        }

        // ═══════════════════════════════════════
        // محاسبه روزهای مرخصی بدون حقوق
        // ═══════════════════════════════════════
        const unpaidLeaves = await db.leave.findMany({
          where: {
            employeeId: employee.id,
            type: 'بدون حقوق',
            status: 'approved',
          },
        })

        let unpaidLeaveDays = 0
        for (const leave of unpaidLeaves) {
          unpaidLeaveDays += calculateMonthOverlap(
            leave.startDate,
            leave.endDate,
            year,
            month
          )
        }

        // ═══════════════════════════════════════
        // محاسبه روزهای ماموریت
        // ═══════════════════════════════════════
        const missions = await db.mission.findMany({
          where: {
            employeeId: employee.id,
            status: 'approved',
          },
        })

        let missionDays = 0
        for (const mission of missions) {
          missionDays += calculateMonthOverlap(
            mission.startDate,
            mission.endDate,
            year,
            month
          )
        }

        // ═══════════════════════════════════════
        // محاسبه سنوات کارمند
        // ═══════════════════════════════════════
        const hireYear = parseInt(employee.hireDate.split('/')[0])
        const yearsOfService = Math.max(0, year - hireYear)

        // ═══════════════════════════════════════
        // محاسبه وام‌های فعال
        // ═══════════════════════════════════════
        let totalLoanInstallment = 0
        const activeLoans = employee.loanRequests.filter(
          (l: { status: string }) => l.status === 'approved'
        )
        for (const loan of activeLoans) {
          if (loan.installments && loan.installments > 0) {
            totalLoanInstallment += Math.round(loan.amount / loan.installments)
          }
        }

        // ═══════════════════════════════════════
        // نمره عملکرد
        // ═══════════════════════════════════════
        const performanceScore = employee.performances?.[0]?.score || 0

        // ═══════════════════════════════════════
        // محاسبه آیتم‌های حقوقی (دینامیک)
        // ═══════════════════════════════════════
        const slipItems: {
          title: string
          category: string
          amount: number
          payrollItemId: string | null
          sortOrder: number
        }[] = []

        let totalAllowances = 0
        let totalDeductions = 0
        let insurableAmount = 0

        // ضرایب و نرخ‌ها از تنظیمات
        const workHoursPerDay = setting.workHoursPerDay
        const workDaysPerMonth = setting.workDaysPerMonth
        const hourlyRate = baseSalary / (workDaysPerMonth * workHoursPerDay)
        const dailyRate = baseSalary / workDaysPerMonth

        // سقف بیمه
        const insuranceCeiling = setting.minDailyWage * workDaysPerMonth * setting.insuranceCeilingMultiplier

        // ابتدا آیتم‌های غیر فرمولی، سپس فرمولی (چون فرمول‌ها به subtotalها وابسته‌اند)
        const nonFormulaItems = payrollItems.filter(i => i.calculationType !== 'formula')
        // فرمول‌های مزایا قبل از کسورات پردازش می‌شوند (چون بیمه و مالیات به مجموع مزایا وابسته‌اند)
        const formulaAllowanceItems = payrollItems.filter(i => i.calculationType === 'formula' && i.category === 'allowance')
        const formulaDeductionItems = payrollItems.filter(i => i.calculationType === 'formula' && i.category === 'deduction')

        // ─── آیتم‌های ثابت و درصدی ───
        for (const item of nonFormulaItems) {
          let amount = 0

          if (item.calculationType === 'fixed') {
            amount = item.value
          } else if (item.calculationType === 'percentage') {
            amount = Math.round(baseSalary * item.value / 100)
          }

          slipItems.push({
            title: item.title,
            category: item.category,
            amount,
            payrollItemId: item.id,
            sortOrder: item.sortOrder,
          })

          if (item.category === 'allowance') {
            totalAllowances += amount
            if (item.isInsurable) insurableAmount += amount
          } else {
            totalDeductions += amount
          }
        }

        // مبلغ مشمول بیمه = حقوق پایه + مزایای مشمول بیمه
        insurableAmount += baseSalary
        const cappedInsurable = Math.min(insurableAmount, insuranceCeiling)

        // ─── آیتم‌های فرمولی مزایا (دینامیک) — قبل از کسورات پردازش می‌شوند ───
        for (const item of formulaAllowanceItems) {
          let amount = 0

          // اتصال از طریق formulaId (FK relation) — تنها روش رسمی
          let formulaDef: FormulaDefinition | undefined
          if (item.formulaId && formulaMapById.has(item.formulaId)) {
            formulaDef = formulaMapById.get(item.formulaId)!
          }

          if (formulaDef) {
            try {

              // ساخت بافت محاسبه با داده‌های حضور و غیاب
              const ctx = await buildFormulaContext({
                employee,
                year,
                month,
                baseSalary,
                workDays: workDaysPerMonth - unpaidLeaveDays,
                overtimeHours: totalOvertimeHours,
                setting,
                taxBrackets,
                preCalculatedItems: slipItems.map(si => ({
                  code: si.payrollItemId
                    ? (payrollItems.find(pi => pi.id === si.payrollItemId)?.code || '')
                    : '',
                  amount: si.amount,
                  isInsurable: si.payrollItemId
                    ? (payrollItems.find(pi => pi.id === si.payrollItemId)?.isInsurable || false)
                    : false,
                  category: si.category,
                })),
                attendanceData: {
                  nightShiftHours: totalNightShiftHours,
                  fridayWorkHours: totalFridayWorkHours,
                  holidayWorkHours: totalHolidayWorkHours,
                  missionDays,
                  unpaidLeaveDays,
                  totalLoanInstallment,
                  performanceScore,
                  yearsOfService,
                  // برای حق اولاد: مبلغ هر فرزند از value آیتم حقوقی خوانده شود
                  childAmount: formulaDef?.code === 'family_per_child' ? item.value : undefined,
                },
              })

              // محاسبه با موتور فرمول دینامیک
              amount = await computeFormula(formulaDef, ctx)
            } catch (formulaError) {
              console.warn(`خطا در محاسبه فرمول دینامیک ${item.formulaId}:`, formulaError)
              // در صورت خطا، مبلغ صفر
              amount = 0
            }
          } else {
            // فرمول دینامیک یافت نشد — هشدار و استفاده از value پیش‌فرض
            if (item.formulaId) {
              console.warn(`فرمول دینامیک برای آیتم "${item.title}" (formulaId: ${item.formulaId}) یافت نشد.`)
            } else {
              console.warn(`آیتم فرمولی "${item.title}" بدون formulaId است. لطفاً از مهاجرت استفاده کنید.`)
            }
            amount = item.value || 0
          }

          // اگر مبلغ صفر است و آیتم فرمولی اختیاری، آیتم را اضافه نکن
          const formulaCode = formulaDef?.code
          if (amount === 0 && formulaCode && !['insurance_employee', 'tax_progressive'].includes(formulaCode)) {
            continue
          }

          slipItems.push({
            title: item.title,
            category: item.category,
            amount,
            payrollItemId: item.id,
            sortOrder: item.sortOrder,
          })

          if (item.category === 'allowance') {
            totalAllowances += amount
            if (item.isInsurable) insurableAmount += amount
          } else {
            totalDeductions += amount
          }
        }

        // به‌روزرسانی مبلغ مشمول بیمه بعد از محاسبه مزایای فرمولی
        const updatedCappedInsurable = Math.min(insurableAmount, insuranceCeiling)

        // ─── آیتم‌های فرمولی کسورات (دینامیک) — بعد از مزایا پردازش می‌شوند ───
        for (const item of formulaDeductionItems) {
          let amount = 0

          // اتصال از طریق formulaId (FK relation) — تنها روش رسمی
          let formulaDef: FormulaDefinition | undefined
          if (item.formulaId && formulaMapById.has(item.formulaId)) {
            formulaDef = formulaMapById.get(item.formulaId)!
          }

          if (formulaDef) {
            try {

              // ساخت بافت محاسبه با داده‌های حضور و غیاب
              const ctx = await buildFormulaContext({
                employee,
                year,
                month,
                baseSalary,
                workDays: workDaysPerMonth - unpaidLeaveDays,
                overtimeHours: totalOvertimeHours,
                setting,
                taxBrackets,
                preCalculatedItems: slipItems.map(si => ({
                  code: si.payrollItemId
                    ? (payrollItems.find(pi => pi.id === si.payrollItemId)?.code || '')
                    : '',
                  amount: si.amount,
                  isInsurable: si.payrollItemId
                    ? (payrollItems.find(pi => pi.id === si.payrollItemId)?.isInsurable || false)
                    : false,
                  category: si.category,
                })),
                attendanceData: {
                  nightShiftHours: totalNightShiftHours,
                  fridayWorkHours: totalFridayWorkHours,
                  holidayWorkHours: totalHolidayWorkHours,
                  missionDays,
                  unpaidLeaveDays,
                  totalLoanInstallment,
                  performanceScore,
                  yearsOfService,
                  childAmount: formulaDef?.code === 'family_per_child' ? item.value : undefined,
                },
              })

              // محاسبه با موتور فرمول دینامیک
              amount = await computeFormula(formulaDef, ctx)
            } catch (formulaError) {
              console.warn(`خطا در محاسبه فرمول دینامیک ${item.formulaId}:`, formulaError)
              // در صورت خطا، مبلغ صفر
              amount = 0
            }
          } else {
            // فرمول دینامیک یافت نشد — هشدار و استفاده از value پیش‌فرض
            if (item.formulaId) {
              console.warn(`فرمول دینامیک برای آیتم "${item.title}" (formulaId: ${item.formulaId}) یافت نشد.`)
            } else {
              console.warn(`آیتم فرمولی "${item.title}" بدون formulaId است. لطفاً از مهاجرت استفاده کنید.`)
            }
            amount = item.value || 0
          }

          // اگر مبلغ صفر است و آیتم فرمولی اختیاری، آیتم را اضافه نکن
          const formulaCode = formulaDef?.code
          if (amount === 0 && formulaCode && !['insurance_employee', 'tax_progressive'].includes(formulaCode)) {
            continue
          }

          slipItems.push({
            title: item.title,
            category: item.category,
            amount,
            payrollItemId: item.id,
            sortOrder: item.sortOrder,
          })

          if (item.category === 'allowance') {
            totalAllowances += amount
          } else {
            totalDeductions += amount
          }
        }

        // ═══════════════════════════════════════
        // محاسبات نهایی
        // ═══════════════════════════════════════
        const grossSalary = baseSalary + totalAllowances
        const netSalary = grossSalary - totalDeductions
        const workDays = Math.max(0, workDaysPerMonth - unpaidLeaveDays)

        // ═══════════════════════════════════════
        // ایجاد فیش حقوقی
        // ═══════════════════════════════════════
        const paySlip = await db.paySlip.create({
          data: {
            employeeId: employee.id,
            year,
            month,
            baseSalary,
            totalAllowances,
            totalDeductions,
            grossSalary,
            netSalary,
            workDays,
            overtimeHours: totalOvertimeHours,
            status: 'draft',
            items: {
              create: slipItems,
            },
          },
          include: {
            items: true,
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                personnelCode: true,
                department: true,
                position: true,
              },
            },
          },
        })

        generated++
      } catch (empError) {
        console.error(`Error generating slip for employee ${employee.id}:`, empError)
        errors.push(`خطا در تولید فیش ${employee.firstName} ${employee.lastName}`)
      }
    }

    return NextResponse.json({
      generated,
      skipped,
      totalEmployees: employees.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Generate payslips error:', error)
    return NextResponse.json({ error: 'خطا در تولید فیش‌های حقوقی' }, { status: 500 })
  }
}


