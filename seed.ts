import { db } from './src/core/lib/db'
import * as jalaali from 'jalaali-js'

async function seed() {
  console.log('🌱 شروع seed دیتا...')

  // ---- Departments ----
  console.log('  🏢 ایجاد دپارتمان‌ها...')
  const departments = [
    { name: 'منابع انسانی', code: 'DEPT-HR' },
    { name: 'فناوری اطلاعات', code: 'DEPT-IT' },
    { name: 'مالی', code: 'DEPT-FIN' },
    { name: 'بازرگانی', code: 'DEPT-COM' },
    { name: 'اداری', code: 'DEPT-ADM' },
    { name: 'بهداشت و ایمنی', code: 'DEPT-HSE' },
    { name: 'لجستیک', code: 'DEPT-LOG' },
  ]
  const deptRecords: { id: string; name: string; code: string }[] = []
  for (const dept of departments) {
    const record = await db.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    })
    deptRecords.push(record)
  }

  // ---- Positions ----
  console.log('  💼 ایجاد پست‌های سازمانی...')
  const positions = [
    { title: 'مدیر منابع انسانی', code: 'POS-HR-001', level: 'ارشد', jobGrade: 'A1', departmentId: deptRecords[0].id, minSalary: 40000000, maxSalary: 65000000, headcount: 1, description: 'مدیریت کلیه امور منابع انسانی سازمان', requirements: 'حداقل ۱۰ سال سابقه کار مرتبط، تسلط بر قوانین کار' },
    { title: 'کارشناس حقوق', code: 'POS-HR-002', level: 'میانره', jobGrade: 'B1', departmentId: deptRecords[0].id, minSalary: 20000000, maxSalary: 35000000, headcount: 2, description: 'انجام امور حقوقی و قراردادها', requirements: 'مدرک کارشناسی حقوق، آشنایی با قوانین کار و تامین اجتماعی' },
    { title: 'کارشناس آموزش', code: 'POS-HR-003', level: 'میانره', jobGrade: 'B1', departmentId: deptRecords[0].id, minSalary: 18000000, maxSalary: 30000000, headcount: 1, description: 'برنامه‌ریزی و اجرای دوره‌های آموزشی', requirements: 'تجربه در آموزش بزرگسالان' },
    { title: 'توسعه‌دهنده ارشد', code: 'POS-IT-001', level: 'ارشد', jobGrade: 'A2', departmentId: deptRecords[1].id, minSalary: 35000000, maxSalary: 60000000, headcount: 2, description: 'توسعه و نگهداری سیستم‌های نرم‌افزاری', requirements: 'حداقل ۵ سال تجربه، تسلط بر React و Node.js' },
    { title: 'طراح UI/UX', code: 'POS-IT-002', level: 'میانره', jobGrade: 'B2', departmentId: deptRecords[1].id, minSalary: 22000000, maxSalary: 38000000, headcount: 1, description: 'طراحی رابط کاربری و تجربه کاربری', requirements: 'تسلط بر Figma، دانش UX Research' },
    { title: 'کارشناس شبکه', code: 'POS-IT-003', level: 'میانره', jobGrade: 'B1', departmentId: deptRecords[1].id, minSalary: 20000000, maxSalary: 32000000, headcount: 2, description: 'مدیریت و نگهداری زیرساخت شبکه', requirements: 'مدارک CCNA/CCNP، تجربه شبکه‌های سازمانی' },
    { title: 'حسابدار', code: 'POS-FIN-001', level: 'میانره', jobGrade: 'B1', departmentId: deptRecords[2].id, minSalary: 18000000, maxSalary: 30000000, headcount: 2, description: 'انجام امور حسابداری و مالی', requirements: 'مدرک حسابداری، آشنایی با نرم‌افزارهای مالی' },
    { title: 'مدیر فروش', code: 'POS-COM-001', level: 'ارشد', jobGrade: 'A2', departmentId: deptRecords[3].id, minSalary: 30000000, maxSalary: 55000000, headcount: 1, description: 'مدیریت تیم فروش و توسعه بازار', requirements: 'حداقل ۷ سال تجربه فروش، مهارت مذاکره' },
    { title: 'کارشناس بازاریابی', code: 'POS-COM-002', level: 'مبتدی', jobGrade: 'C1', departmentId: deptRecords[3].id, minSalary: 15000000, maxSalary: 25000000, headcount: 2, description: 'طراحی و اجرای کمپین‌های بازاریابی', requirements: 'آشنایی با دیجیتال مارکتینگ' },
    { title: 'منشی مدیریت', code: 'POS-ADM-001', level: 'مبتدی', jobGrade: 'C2', departmentId: deptRecords[4].id, minSalary: 12000000, maxSalary: 20000000, headcount: 1, description: 'امور دفتری و منشی‌گری', requirements: 'مهارت‌های ارتباطی و سازماندهی' },
    { title: 'پرستار', code: 'POS-HSE-001', level: 'میانره', jobGrade: 'B2', departmentId: deptRecords[5].id, minSalary: 18000000, maxSalary: 28000000, headcount: 1, description: 'ارائه خدمات بهداشتی و درمانی', requirements: 'مدرک پرستاری، مجوز فعالیت' },
    { title: 'راننده', code: 'POS-LOG-001', level: 'مبتدی', jobGrade: 'C2', departmentId: deptRecords[6].id, minSalary: 12000000, maxSalary: 18000000, headcount: 2, description: 'رانندگی و حمل‌ونقل سازمانی', requirements: 'گواهینامه سنگین، سابقه کار' },
  ]
  const posRecords: { id: string; title: string; code: string }[] = []
  for (const pos of positions) {
    const record = await db.position.upsert({
      where: { code: pos.code },
      update: {},
      create: pos,
    })
    posRecords.push(record)
  }

  // ---- Employees ----
  const employees = [
    { firstName: 'محمد', lastName: 'احمدی', nationalCode: '0012345678', personnelCode: 'P-1001', position: 'مدیر منابع انسانی', department: 'منابع انسانی', status: 'active', hireDate: '1398/01/01', birthDate: '1365/05/12', marriageDate: '1392/07/20', email: 'm.ahmadi@co.ir', phone: '09121234567' },
    { firstName: 'زهرا', lastName: 'محمدی', nationalCode: '0023456789', personnelCode: 'P-1002', position: 'کارشناس حقوق', department: 'منابع انسانی', status: 'active', hireDate: '1399/03/15', birthDate: '1370/08/25', marriageDate: '1395/04/10', email: 'z.mohammadi@co.ir', phone: '09122345678' },
    { firstName: 'علی', lastName: 'حسینی', nationalCode: '0034567890', personnelCode: 'P-1003', position: 'توسعه‌دهنده ارشد', department: 'فناوری اطلاعات', status: 'active', hireDate: '1400/06/01', birthDate: '1372/03/08', marriageDate: '1398/11/15', email: 'a.hosseini@co.ir', phone: '09123456789' },
    { firstName: 'فاطمه', lastName: 'کریمی', nationalCode: '0045678901', personnelCode: 'P-1004', position: 'حسابدار', department: 'مالی', status: 'active', hireDate: '1400/09/20', birthDate: '1374/01/30', marriageDate: '1400/02/05', email: 'f.karimi@co.ir', phone: '09124567890' },
    { firstName: 'رضا', lastName: 'رضایی', nationalCode: '0056789012', personnelCode: 'P-1005', position: 'مدیر فروش', department: 'بازرگانی', status: 'active', hireDate: '1397/04/10', birthDate: '1368/11/22', marriageDate: '1394/06/18', email: 'r.rezaei@co.ir', phone: '09125678901' },
    { firstName: 'مریم', lastName: 'سعیدی', nationalCode: '0067890123', personnelCode: 'P-1006', position: 'طراح UI/UX', department: 'فناوری اطلاعات', status: 'active', hireDate: '1401/02/01', birthDate: '1375/06/14', marriageDate: '1401/09/25', email: 'm.saeedi@co.ir', phone: '09126789012' },
    { firstName: 'حسن', lastName: 'نوری', nationalCode: '0078901234', personnelCode: 'P-1007', position: 'کارشناس شبکه', department: 'فناوری اطلاعات', status: 'active', hireDate: '1401/07/15', birthDate: '1373/09/03', marriageDate: '1399/05/20', email: 'h.nouri@co.ir', phone: '09127890123' },
    { firstName: 'سارا', lastName: 'امینی', nationalCode: '0089012345', personnelCode: 'P-1008', position: 'منشی مدیریت', department: 'اداری', status: 'active', hireDate: '1402/01/01', birthDate: '1377/12/08', marriageDate: null, email: 's.amini@co.ir', phone: '09128901234' },
    { firstName: 'امیر', lastName: 'عباسی', nationalCode: '0090123456', personnelCode: 'P-1009', position: 'کارشناس بازاریابی', department: 'بازرگانی', status: 'active', hireDate: '1402/04/20', birthDate: '1376/04/17', marriageDate: '1403/01/10', email: 'a.abbasi@co.ir', phone: '09129012345' },
    { firstName: 'نازنین', lastName: 'جعفری', nationalCode: '0001234567', personnelCode: 'P-1010', position: 'پرستار', department: 'بهداشت و ایمنی', status: 'active', hireDate: '1401/11/01', birthDate: '1371/07/22', marriageDate: '1396/08/30', email: 'n.jafari@co.ir', phone: '09120123456' },
    { firstName: 'مهدی', lastName: 'صادقی', nationalCode: '0012345670', personnelCode: 'P-1011', position: 'راننده', department: 'لجستیک', status: 'active', hireDate: '1400/03/10', birthDate: '1366/02/19', marriageDate: '1393/04/15', email: 'm.sadeghi@co.ir', phone: '09121234560' },
    { firstName: 'الهام', lastName: 'توکلی', nationalCode: '0023456780', personnelCode: 'P-1012', position: 'کارشناس آموزش', department: 'منابع انسانی', status: 'active', hireDate: '1402/06/01', birthDate: '1374/10/05', marriageDate: null, email: 'e.tavakoli@co.ir', phone: '09122345670' },
  ]

  console.log('  👥 ایجاد کارکنان...')
  for (const emp of employees) {
    await db.employee.upsert({
      where: { personnelCode: emp.personnelCode },
      update: {},
      create: emp,
    })
  }

  // ---- Attendance (7 days) ----
  console.log('  📊 ایجاد رکوردهای حضور...')
  const allEmployees = await db.employee.findMany()
  
  const today = new Date()
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const d = new Date(today)
    d.setDate(d.getDate() - dayOffset)
    const { jy, jm, jd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const dateStr = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
    
    for (const emp of allEmployees) {
      const rand = Math.random()
      let status = 'present'
      let checkIn = '08:00'
      let checkOut = '17:00'
      let workHours = 9
      let overtime = 0
      
      if (dayOffset === 0) {
        // Today - more variation
        if (rand < 0.08) { status = 'absent'; checkIn = null; checkOut = null; workHours = 0 }
        else if (rand < 0.18) { status = 'late'; checkIn = '09:15'; workHours = 7.75 }
        else if (rand < 0.26) { status = 'leave'; checkIn = null; checkOut = null; workHours = 0 }
        else if (rand < 0.32) { status = 'mission'; checkIn = null; checkOut = null; workHours = 0 }
        else { 
          overtime = Math.random() > 0.8 ? Math.round((Math.random() * 3 + 1) * 10) / 10 : 0
          if (overtime > 3) overtime = 3.5
        }
      } else {
        if (rand < 0.05) { status = 'absent'; checkIn = null; checkOut = null; workHours = 0 }
        else if (rand < 0.12) { status = 'late'; checkIn = '09:30'; workHours = 7.5 }
        else if (rand < 0.18) { status = 'leave'; checkIn = null; checkOut = null; workHours = 0 }
        else if (rand < 0.22) { status = 'mission'; checkIn = null; checkOut = null; workHours = 0 }
      }
      
      await db.attendance.upsert({
        where: { employeeId_date: { employeeId: emp.id, date: dateStr } },
        update: {},
        create: { employeeId: emp.id, date: dateStr, status, checkIn, checkOut, workHours, overtime },
      })
    }
  }

  // ---- Leaves (pending) ----
  console.log('  📅 ایجاد مرخصی‌ها...')
  const { jy: cy, jm: cm, jd: cd } = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate())
  const currentMonthStr = `${cy}/${String(cm).padStart(2, '0')}`
  
  const leaveTypes = ['استحقاقی', 'استعلاجی', 'بدون حقوق', 'ازدواج', 'فوت']
  for (let i = 0; i < 5; i++) {
    const emp = allEmployees[i % allEmployees.length]
    await db.leave.create({
      data: {
        employeeId: emp.id,
        type: leaveTypes[i % leaveTypes.length],
        startDate: `${currentMonthStr}/${String(cd + i).padStart(2, '0')}`,
        endDate: `${currentMonthStr}/${String(cd + i + 1).padStart(2, '0')}`,
        totalDays: i === 0 ? 1 : 2,
        reason: i === 0 ? 'بیماری' : i === 1 ? 'امور شخصی' : 'استراحت',
        status: i < 3 ? 'pending' : i < 4 ? 'approved' : 'rejected',
      }
    })
  }

  // ---- Missions (pending) ----
  console.log('  🗺️ ایجاد ماموریت‌ها...')
  for (let i = 0; i < 3; i++) {
    const emp = allEmployees[(i + 2) % allEmployees.length]
    await db.mission.create({
      data: {
        employeeId: emp.id,
        title: i === 0 ? 'ماموریت اصفهان' : i === 1 ? 'ماموریت مشهد' : 'ماموریت شیراز',
        destination: i === 0 ? 'اصفهان' : i === 1 ? 'مشهد' : 'شیراز',
        startDate: `${currentMonthStr}/${String(cd + i + 2).padStart(2, '0')}`,
        endDate: `${currentMonthStr}/${String(cd + i + 4).padStart(2, '0')}`,
        totalDays: 2,
        status: i < 2 ? 'pending' : 'approved',
      }
    })
  }

  // ---- PaySlips (دینامیک با آیتم‌های حقوقی) ----
  console.log('  💰 ایجاد فیش حقوقی...')

  // Get payroll items for the current year
  const payrollItems = await db.payrollItem.findMany({ where: { year: cy, isActive: true }, orderBy: { sortOrder: 'asc' } })

  for (const emp of allEmployees) {
    const baseSalary = 25000000 + Math.floor(Math.random() * 30000000)
    const slipItems: { title: string; category: string; amount: number; payrollItemId: string | null; sortOrder: number }[] = []
    let totalAllowances = 0
    let totalDeductions = 0
    let insurableAmount = baseSalary

    // محاسبه آیتم‌های مزایا (ثابت)
    for (const item of payrollItems.filter(i => i.category === 'allowance' && i.calculationType === 'fixed')) {
      let amount = item.value
      // حق اولاد فقط برای متأهل
      if (item.code === 'CHILD_ALLOWANCE') {
        amount = emp.maritalStatus === 'married' ? (emp.childrenCount || 0) * item.value : 0
      }
      if (item.code === 'MARITAL_ALLOWANCE') {
        amount = emp.maritalStatus === 'married' ? item.value : 0
      }
      if (amount > 0) {
        totalAllowances += amount
        if (item.isInsurable) insurableAmount += amount
        slipItems.push({ title: item.title, category: 'allowance', amount, payrollItemId: item.id, sortOrder: item.sortOrder })
      }
    }

    // محاسبه بیمه
    const settings = await db.payrollSetting.findUnique({ where: { year: cy } })
    const insuranceRate = settings?.insuranceRate || 7
    const ceilingDaily = (settings?.minDailyWage || 5541850) * (settings?.insuranceCeilingMultiplier || 7)
    const ceilingMonthly = ceilingDaily * 30
    const insurableCapped = Math.min(insurableAmount, ceilingMonthly)
    const insuranceAmount = Math.round(insurableCapped * insuranceRate / 100)

    // محاسبه مالیات پلکانی (ماهانه)
    const grossSalary = baseSalary + totalAllowances
    const taxableIncome = grossSalary - insuranceAmount
    const annualTaxable = taxableIncome * 12
    const brackets = await db.taxBracket.findMany({ where: { year: cy }, orderBy: { orderNum: 'asc' } })
    let annualTax = 0
    let remaining = annualTaxable
    for (const bracket of brackets) {
      const bracketMax = bracket.maxAmount > 0 ? bracket.maxAmount : Infinity
      const bracketWidth = bracketMax - bracket.minAmount
      if (remaining <= 0) break
      const taxableInBracket = Math.min(remaining, bracketWidth)
      annualTax += Math.round(taxableInBracket * bracket.rate / 100)
      remaining -= taxableInBracket
    }
    const taxAmount = Math.round(annualTax / 12)

    totalDeductions = insuranceAmount + taxAmount

    // افزودن آیتم‌های کسورات
    const insuranceItem = payrollItems.find(it => it.code === 'INSURANCE_EMPLOYEE')
    if (insuranceItem && insuranceAmount > 0) {
      slipItems.push({ title: insuranceItem.title, category: 'deduction', amount: insuranceAmount, payrollItemId: insuranceItem.id, sortOrder: insuranceItem.sortOrder })
    }
    const taxItem = payrollItems.find(it => it.code === 'TAX')
    if (taxItem && taxAmount > 0) {
      slipItems.push({ title: taxItem.title, category: 'deduction', amount: taxAmount, payrollItemId: taxItem.id, sortOrder: taxItem.sortOrder })
    }

    const netSalary = grossSalary - totalDeductions

    // ایجاد فیش با آیتم‌های دینامیک
    const existingSlip = await db.paySlip.findUnique({
      where: { employeeId_year_month: { employeeId: emp.id, year: cy, month: cm } }
    })
    if (!existingSlip) {
      await db.paySlip.create({
        data: {
          employeeId: emp.id,
          year: cy,
          month: cm,
          baseSalary,
          totalAllowances,
          totalDeductions,
          grossSalary,
          netSalary,
          workDays: 30,
          overtimeHours: 0,
          status: 'paid',
          items: {
            create: slipItems,
          },
        }
      })
    }
  }

  // ---- Contracts ----
  console.log('  📄 ایجاد قراردادها...')
  for (const emp of allEmployees) {
    await db.contract.create({
      data: {
        employeeId: emp.id,
        type: Math.random() > 0.5 ? 'قرارداد' : 'حکم کارگزینی',
        title: Math.random() > 0.5 ? 'قرارداد کار رسمی' : 'حکم کارگزینی',
        startDate: emp.hireDate,
        endDate: Math.random() > 0.7 ? null : `${cy + 1}/${String(cm).padStart(2, '0')}/${String(cd).padStart(2, '0')}`,
        status: 'active',
      }
    })
  }

  // ---- Performances ----
  console.log('  📈 ایجاد ارزیابی عملکرد...')
  for (const emp of allEmployees) {
    const target = 3.5 + Math.random()
    const score = target + (Math.random() - 0.5) * 2
    await db.performance.create({
      data: {
        employeeId: emp.id,
        period: `${cy}/Q1`,
        score: Math.round(Math.max(1, Math.min(5, score)) * 10) / 10,
        target: Math.round(target * 10) / 10,
        kpi1: Math.round((2 + Math.random() * 3) * 10) / 10,
        kpi2: Math.round((2 + Math.random() * 3) * 10) / 10,
        kpi3: Math.round((2 + Math.random() * 3) * 10) / 10,
        status: 'completed',
      }
    })
  }

  // ---- Loan Requests ----
  console.log('  🏦 ایجاد درخواست وام...')
  for (let i = 0; i < 2; i++) {
    const emp = allEmployees[(i + 3) % allEmployees.length]
    await db.loanRequest.create({
      data: {
        employeeId: emp.id,
        type: i === 0 ? 'وام' : 'مساعده',
        amount: i === 0 ? 50000000 : 15000000,
        reason: i === 0 ? 'خرید خودرو' : 'هزینه درمان',
        status: 'pending',
        installments: i === 0 ? 24 : 6,
      }
    })
  }

  // ---- Recruitment ----
  console.log('  🤝 ایجاد آگهی استخدام...')
  const depts = ['فناوری اطلاعات', 'بازرگانی', 'مالی']
  for (let i = 0; i < 3; i++) {
    await db.recruitment.create({
      data: {
        title: i === 0 ? 'استخدام برنامه‌نویس ارشد' : i === 1 ? 'استخدام کارشناس فروش' : 'استخدام حسابدار',
        department: depts[i],
        position: i === 0 ? 'برنامه‌نویس ارشد' : i === 1 ? 'کارشناس فروش' : 'حسابدار',
        status: 'open',
        applicants: Math.floor(Math.random() * 30) + 5,
      }
    })
  }

  // ---- Onboarding ----
  console.log('  🚀 ایجاد فرآیند ورود...')
  const newEmp = allEmployees[allEmployees.length - 1]
  await db.onboarding.create({
    data: {
      employeeId: newEmp.id,
      tasks: JSON.stringify(['تکمیل مدارک', 'معرفی به تیم', 'دسترسی سیستم', 'آموزش ایمنی']),
      progress: 60,
      status: 'in_progress',
      startDate: `${cy}/${String(cm).padStart(2, '0')}/01`,
    }
  })

  // ---- Offboarding ----
  console.log('  🚪 ایجاد فرآیند خروج...')
  const offEmp = allEmployees[4]
  await db.offboarding.create({
    data: {
      employeeId: offEmp.id,
      reason: 'استعفا',
      tasks: JSON.stringify(['تحویل تجهیزات', 'تسویه حساب', 'ابطال دسترسی‌ها']),
      progress: 30,
      status: 'in_progress',
      lastDate: `${cy}/${String(cm).padStart(2, '0')}/29`,
    }
  })

  // ---- Appointments (انتصابات) ----
  console.log('  📋 ایجاد انتصابات...')
  const appointmentMapping = [
    { empIdx: 0, posIdx: 0, type: 'اصلی', decreeNumber: 'H-1398/001' },
    { empIdx: 1, posIdx: 1, type: 'اصلی', decreeNumber: 'H-1399/015' },
    { empIdx: 2, posIdx: 3, type: 'اصلی', decreeNumber: 'H-1400/045' },
    { empIdx: 3, posIdx: 6, type: 'اصلی', decreeNumber: 'H-1400/078' },
    { empIdx: 4, posIdx: 7, type: 'اصلی', decreeNumber: 'H-1397/023' },
    { empIdx: 5, posIdx: 4, type: 'اصلی', decreeNumber: 'H-1401/012' },
    { empIdx: 6, posIdx: 5, type: 'اصلی', decreeNumber: 'H-1401/056' },
    { empIdx: 7, posIdx: 9, type: 'اصلی', decreeNumber: 'H-1402/003' },
    { empIdx: 8, posIdx: 8, type: 'اصلی', decreeNumber: 'H-1402/034' },
    { empIdx: 9, posIdx: 10, type: 'اصلی', decreeNumber: 'H-1401/089' },
    { empIdx: 10, posIdx: 11, type: 'اصلی', decreeNumber: 'H-1400/102' },
    { empIdx: 11, posIdx: 2, type: 'اصلی', decreeNumber: 'H-1402/067' },
  ]
  for (const apt of appointmentMapping) {
    const emp = allEmployees[apt.empIdx]
    const pos = posRecords[apt.posIdx]
    if (emp && pos) {
      await db.appointment.create({
        data: {
          employeeId: emp.id,
          positionId: pos.id,
          type: apt.type,
          startDate: emp.hireDate,
          decreeNumber: apt.decreeNumber,
          status: 'active',
        }
      })
    }
  }

  console.log('✅ Seed کامل شد!')
  console.log(`  - ${allEmployees.length} کارمند`)
  console.log(`  - رکوردهای حضور ۷ روز`)
  console.log(`  - ۵ مرخصی / ۳ ماموریت`)
  console.log(`  - فیش حقوقی ماه جاری`)
  console.log(`  - قراردادها و احکام`)
  console.log(`  - ارزیابی عملکرد`)
  console.log(`  - ۲ درخواست وام`)
  console.log(`  - ۳ آگهی استخدام`)
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
