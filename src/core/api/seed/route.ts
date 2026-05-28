import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/seed — مقداردهی اولیه (قابل دسترسی از مرورگر)
export async function GET(req: NextRequest) {
  return seedAll(req)
}

// POST /api/seed — مقداردهی اولیه تمام جداول دیتابیس با داده‌های نمونه
export async function POST(req: NextRequest) {
  return seedAll(req)
}

async function seedAll(req: NextRequest) {
  try {
    const results: Record<string, number> = {}

    // ═══════════════════════════════════════════════════
    // ۱. دپارتمان‌ها
    // ═══════════════════════════════════════════════════
    const existingDepts = await db.department.count()
    if (existingDepts === 0) {
      const departments = [
        { name: 'مدیریت', code: 'DEPT-MGMT' },
        { name: 'منابع انسانی', code: 'DEPT-HR' },
        { name: 'مالی و حسابداری', code: 'DEPT-FIN' },
        { name: 'فناوری اطلاعات', code: 'DEPT-IT' },
        { name: 'بازرگانی و فروش', code: 'DEPT-SALES' },
        { name: 'تولید', code: 'DEPT-PROD' },
        { name: 'بازاریابی', code: 'DEPT-MKT' },
        { name: 'پشتیبانی', code: 'DEPT-SUPPORT' },
        { name: 'تحقیق و توسعه', code: 'DEPT-RD' },
        { name: 'حقوقی', code: 'DEPT-LEGAL' },
      ]
      for (const dept of departments) {
        await db.department.create({ data: dept })
      }
      results.departments = departments.length
    } else {
      results.departments = existingDepts
    }

    // ═══════════════════════════════════════════════════
    // ۲. پست‌های سازمانی
    // ═══════════════════════════════════════════════════
    const existingPositions = await db.position.count()
    if (existingPositions === 0) {
      const depts = await db.department.findMany()
      const deptMap = Object.fromEntries(depts.map(d => [d.code, d.id]))

      const positions = [
        { title: 'مدیرعامل', code: 'POS-CEO', level: 'ارشد', departmentId: deptMap['DEPT-MGMT'], jobGrade: 'A1', minSalary: 200000000, maxSalary: 500000000, headcount: 1, description: 'بالاترین مقام اجرایی سازمان' },
        { title: 'مدیر منابع انسانی', code: 'POS-HR-MGR', level: 'ارشد', departmentId: deptMap['DEPT-HR'], jobGrade: 'A2', minSalary: 150000000, maxSalary: 300000000, headcount: 1, description: 'مدیریت امور پرسنلی و منابع انسانی' },
        { title: 'کارشناس منابع انسانی', code: 'POS-HR-EXP', level: 'میانه', departmentId: deptMap['DEPT-HR'], jobGrade: 'B1', minSalary: 80000000, maxSalary: 150000000, headcount: 3, description: 'انجام امور کارگزینی و حقوق و دستمزد' },
        { title: 'مدیر مالی', code: 'POS-FIN-MGR', level: 'ارشد', departmentId: deptMap['DEPT-FIN'], jobGrade: 'A2', minSalary: 150000000, maxSalary: 300000000, headcount: 1, description: 'مدیریت امور مالی و حسابداری' },
        { title: 'حسابدار', code: 'POS-FIN-ACC', level: 'میانه', departmentId: deptMap['DEPT-FIN'], jobGrade: 'B2', minSalary: 70000000, maxSalary: 130000000, headcount: 2, description: 'امور حسابداری و مالی' },
        { title: 'مدیر فناوری اطلاعات', code: 'POS-IT-MGR', level: 'ارشد', departmentId: deptMap['DEPT-IT'], jobGrade: 'A2', minSalary: 160000000, maxSalary: 320000000, headcount: 1, description: 'مدیریت زیرساخت‌ها و تیم فنی' },
        { title: 'برنامه‌نویس ارشد', code: 'POS-IT-SENIOR', level: 'ارشد', departmentId: deptMap['DEPT-IT'], jobGrade: 'B1', minSalary: 100000000, maxSalary: 200000000, headcount: 4, description: 'توسعه نرم‌افزار و سیستم‌ها' },
        { title: 'برنامه‌نویس', code: 'POS-IT-DEV', level: 'میانه', departmentId: deptMap['DEPT-IT'], jobGrade: 'B2', minSalary: 70000000, maxSalary: 120000000, headcount: 6, description: 'کدنویسی و توسعه نرم‌افزار' },
        { title: 'مدیر فروش', code: 'POS-SALES-MGR', level: 'ارشد', departmentId: deptMap['DEPT-SALES'], jobGrade: 'A2', minSalary: 130000000, maxSalary: 280000000, headcount: 1, description: 'مدیریت تیم فروش' },
        { title: 'کارشناس فروش', code: 'POS-SALES-EXP', level: 'میانه', departmentId: deptMap['DEPT-SALES'], jobGrade: 'B2', minSalary: 60000000, maxSalary: 110000000, headcount: 5, description: 'فروش و ارتباط با مشتریان' },
        { title: 'مدیر تولید', code: 'POS-PROD-MGR', level: 'ارشد', departmentId: deptMap['DEPT-PROD'], jobGrade: 'A2', minSalary: 140000000, maxSalary: 290000000, headcount: 1, description: 'مدیریت خط تولید' },
        { title: 'اپراتور تولید', code: 'POS-PROD-OP', level: 'مبتدی', departmentId: deptMap['DEPT-PROD'], jobGrade: 'C1', minSalary: 50000000, maxSalary: 90000000, headcount: 10, description: 'کار خط تولید' },
        { title: 'کارشناس بازاریابی', code: 'POS-MKT-EXP', level: 'میانه', departmentId: deptMap['DEPT-MKT'], jobGrade: 'B2', minSalary: 70000000, maxSalary: 130000000, headcount: 3, description: 'برنامه‌ریزی و اجرای کمپین‌های بازاریابی' },
        { title: 'کارشناس پشتیبانی', code: 'POS-SUPPORT-EXP', level: 'مبتدی', departmentId: deptMap['DEPT-SUPPORT'], jobGrade: 'C1', minSalary: 50000000, maxSalary: 90000000, headcount: 4, description: 'پاسخگویی به مشتریان' },
        { title: 'پژوهشگر', code: 'POS-RD-RES', level: 'ارشد', departmentId: deptMap['DEPT-RD'], jobGrade: 'B1', minSalary: 90000000, maxSalary: 180000000, headcount: 3, description: 'تحقیق و توسعه محصولات جدید' },
        { title: 'مشاور حقوقی', code: 'POS-LEGAL-ADV', level: 'ارشد', departmentId: deptMap['DEPT-LEGAL'], jobGrade: 'B1', minSalary: 100000000, maxSalary: 200000000, headcount: 2, description: 'مشاوره حقوقی و قراردادها' },
      ]
      for (const pos of positions) {
        await db.position.create({ data: pos })
      }
      results.positions = positions.length
    } else {
      results.positions = existingPositions
    }

    // ═══════════════════════════════════════════════════
    // ۳. کارکنان (اگر کمتر از ۱۰ نفر است)
    // ═══════════════════════════════════════════════════
    const existingEmps = await db.employee.count()
    if (existingEmps < 10) {
      const employees = [
        { firstName: 'محمد', lastName: 'احمدی', nationalCode: '0012345678', personnelCode: 'P-1001', email: 'm.ahmadi@company.ir', phone: '09121234567', birthDate: '1365/03/15', birthPlace: 'تهران', gender: 'male', maritalStatus: 'married', marriageDate: '1390/06/20', childrenCount: 2, bloodType: 'A+', address: 'تهران، خیابان ولیعصر، پلاک ۱۰۰', homePhone: '02188776655', education: 'کارشناسی ارشد', fieldOfStudy: 'مدیریت منابع انسانی', university: 'دانشگاه تهران', militaryStatus: 'done', hireDate: '1395/01/01', status: 'active', contractType: 'official', position: 'مدیر منابع انسانی', department: 'منابع انسانی', jobGrade: 'A2' },
        { firstName: 'زهرا', lastName: 'محمدی', nationalCode: '0023456789', personnelCode: 'P-1002', email: 'z.mohammadi@company.ir', phone: '09129876543', birthDate: '1370/07/22', birthPlace: 'اصفهان', gender: 'female', maritalStatus: 'single', childrenCount: 0, bloodType: 'B+', address: 'تهران، سعادت‌آباد', homePhone: '02122334455', education: 'کارشناسی', fieldOfStudy: 'حسابداری', university: 'دانشگاه شهید بهشتی', militaryStatus: 'exempt', hireDate: '1398/04/01', status: 'active', contractType: 'official', position: 'حسابدار', department: 'مالی و حسابداری', jobGrade: 'B2' },
        { firstName: 'علی', lastName: 'رضایی', nationalCode: '0034567890', personnelCode: 'P-1003', email: 'a.rezaei@company.ir', phone: '09123456789', birthDate: '1368/11/05', birthPlace: 'شیراز', gender: 'male', maritalStatus: 'married', marriageDate: '1395/09/10', childrenCount: 1, bloodType: 'O+', address: 'تهران، جردن', homePhone: '02133445566', education: 'کارشناسی ارشد', fieldOfStudy: 'مهندسی نرم‌افزار', university: 'دانشگاه شریف', militaryStatus: 'done', hireDate: '1396/07/01', status: 'active', contractType: 'official', position: 'برنامه‌نویس ارشد', department: 'فناوری اطلاعات', jobGrade: 'B1' },
        { firstName: 'مریم', lastName: 'حسینی', nationalCode: '0045678901', personnelCode: 'P-1004', email: 'm.hosseini@company.ir', phone: '09135556677', birthDate: '1372/01/18', birthPlace: 'تبریز', gender: 'female', maritalStatus: 'married', marriageDate: '1398/02/14', childrenCount: 1, bloodType: 'AB+', address: 'تهران، پاسداران', homePhone: '02144556677', education: 'کارشناسی', fieldOfStudy: 'مدیریت بازرگانی', university: 'دانشگاه علامه طباطبایی', militaryStatus: 'exempt', hireDate: '1399/01/15', status: 'active', contractType: 'official', position: 'کارشناس فروش', department: 'بازرگانی و فروش', jobGrade: 'B2' },
        { firstName: 'حسن', lastName: 'کریمی', nationalCode: '0056789012', personnelCode: 'P-1005', email: 'h.karimi@company.ir', phone: '09147778899', birthDate: '1375/05/30', birthPlace: 'مشهد', gender: 'male', maritalStatus: 'single', childrenCount: 0, bloodType: 'A-', address: 'تهران، پزشکی', homePhone: '02155667788', education: 'کارشناسی', fieldOfStudy: 'کامپیوتر', university: 'دانشگاه صنعتی امیرکبیر', militaryStatus: 'done', hireDate: '1400/03/01', status: 'active', contractType: 'contractual', position: 'برنامه‌نویس', department: 'فناوری اطلاعات', jobGrade: 'B2' },
        { firstName: 'فاطمه', lastName: 'نوری', nationalCode: '0067890123', personnelCode: 'P-1006', email: 'f.noori@company.ir', phone: '09159990011', birthDate: '1373/09/12', birthPlace: 'کرج', gender: 'female', maritalStatus: 'married', marriageDate: '1397/11/25', childrenCount: 2, bloodType: 'B-', address: 'کرج، فردیس', homePhone: '02633445566', education: 'کارشناسی ارشد', fieldOfStudy: 'روانشناسی صنعتی', university: 'دانشگاه تربیت مدرس', militaryStatus: 'exempt', hireDate: '1397/06/01', status: 'active', contractType: 'official', position: 'کارشناس منابع انسانی', department: 'منابع انسانی', jobGrade: 'B1' },
        { firstName: 'رضا', lastName: 'عباسی', nationalCode: '0078901234', personnelCode: 'P-1007', email: 'r.abbasi@company.ir', phone: '09161112233', birthDate: '1360/12/01', birthPlace: 'تهران', gender: 'male', maritalStatus: 'married', marriageDate: '1385/03/15', childrenCount: 3, bloodType: 'O-', address: 'تهران، تجریش', homePhone: '02166778899', education: 'دکتری', fieldOfStudy: 'مدیریت استراتژیک', university: 'دانشگاه تهران', militaryStatus: 'done', hireDate: '1388/01/01', status: 'active', contractType: 'official', position: 'مدیرعامل', department: 'مدیریت', jobGrade: 'A1' },
        { firstName: 'سارا', lastName: 'طاهری', nationalCode: '0089012345', personnelCode: 'P-1008', email: 's.taheri@company.ir', phone: '09173334455', birthDate: '1371/04/08', birthPlace: 'اهواز', gender: 'female', maritalStatus: 'single', childrenCount: 0, bloodType: 'A+', address: 'تهران، ونک', homePhone: '02177889900', education: 'کارشناسی', fieldOfStudy: ' grafیک و طراحی', university: 'دانشگاه هنر', militaryStatus: 'exempt', hireDate: '1401/02/01', status: 'active', contractType: 'contractual', position: 'کارشناس بازاریابی', department: 'بازاریابی', jobGrade: 'B2' },
        { firstName: 'امیر', lastName: 'قاسمی', nationalCode: '0090123456', personnelCode: 'P-1009', email: 'a.ghasemi@company.ir', phone: '09185556677', birthDate: '1367/08/25', birthPlace: 'رشت', gender: 'male', maritalStatus: 'married', marriageDate: '1394/07/01', childrenCount: 2, bloodType: 'B+', address: 'تهران، ستارخان', homePhone: '02188990011', education: 'کارشناسی ارشد', fieldOfStudy: 'مهندسی صنایع', university: 'دانشگاه صنعتی شریف', militaryStatus: 'done', hireDate: '1394/04/01', status: 'active', contractType: 'official', position: 'مدیر تولید', department: 'تولید', jobGrade: 'A2' },
        { firstName: 'نرگس', lastName: 'صادقی', nationalCode: '0101234567', personnelCode: 'P-1010', email: 'n.sadeghi@company.ir', phone: '09197778899', birthDate: '1374/06/14', birthPlace: 'همدان', gender: 'female', maritalStatus: 'single', childrenCount: 0, bloodType: 'AB-', address: 'تهران، گیشا', homePhone: '02199001122', education: 'کارشناسی', fieldOfStudy: 'حقوق', university: 'دانشگاه قم', militaryStatus: 'exempt', hireDate: '1402/01/01', status: 'probation', contractType: 'probation', position: 'مشاور حقوقی', department: 'حقوقی', jobGrade: 'B1', probationEnd: '1402/04/01' },
        { firstName: 'مهدی', lastName: 'جعفری', nationalCode: '0112345678', personnelCode: 'P-1011', email: 'm.jafari@company.ir', phone: '09201112233', birthDate: '1376/02/20', birthPlace: 'یزد', gender: 'male', maritalStatus: 'single', childrenCount: 0, bloodType: 'O+', address: 'تهران، پیروزی', homePhone: '02111223344', education: 'کارشناسی', fieldOfStudy: 'الکترونیک', university: 'دانشگاه علم و صنعت', militaryStatus: 'done', hireDate: '1401/07/01', status: 'active', contractType: 'contractual', position: 'اپراتور تولید', department: 'تولید', jobGrade: 'C1' },
        { firstName: 'لیلا', lastName: 'رحیمی', nationalCode: '0123456789', personnelCode: 'P-1012', email: 'l.rahimi@company.ir', phone: '09213334455', birthDate: '1369/10/03', birthPlace: 'کرمانشاه', gender: 'female', maritalStatus: 'married', marriageDate: '1396/05/18', childrenCount: 1, bloodType: 'A+', address: 'تهران، شهرک غرب', homePhone: '02122334411', education: 'کارشناسی ارشد', fieldOfStudy: 'مالی و بانکداری', university: 'دانشگاه خوارزمی', militaryStatus: 'exempt', hireDate: '1396/09/01', status: 'active', contractType: 'official', position: 'مدیر مالی', department: 'مالی و حسابداری', jobGrade: 'A2' },
        { firstName: 'پویا', lastName: 'میرزایی', nationalCode: '0134567890', personnelCode: 'P-1013', email: 'p.mirzaei@company.ir', phone: '09225556677', birthDate: '1366/04/17', birthPlace: 'ساری', gender: 'male', maritalStatus: 'married', marriageDate: '1393/12/05', childrenCount: 2, bloodType: 'B+', address: 'تهران، هروی', homePhone: '02133445511', education: 'کارشناسی ارشد', fieldOfStudy: 'شبکه و امنیت', university: 'دانشگاه امیرکبیر', militaryStatus: 'done', hireDate: '1393/03/01', status: 'active', contractType: 'official', position: 'مدیر فناوری اطلاعات', department: 'فناوری اطلاعات', jobGrade: 'A2' },
        { firstName: 'الهام', lastName: 'بهرامی', nationalCode: '0145678901', personnelCode: 'P-1014', email: 'e.bahrami@company.ir', phone: '09237778899', birthDate: '1378/08/09', birthPlace: 'زنجان', gender: 'female', maritalStatus: 'single', childrenCount: 0, bloodType: 'O+', address: 'تهران، جوان‌شهر', homePhone: '02144556611', education: 'کارشناسی', fieldOfStudy: 'مدیریت بازرگانی', university: 'دانشگاه آزاد', militaryStatus: 'exempt', hireDate: '1403/01/01', status: 'probation', contractType: 'probation', position: 'کارشناس پشتیبانی', department: 'پشتیبانی', jobGrade: 'C1', probationEnd: '1403/04/01' },
        { firstName: 'کیان', lastName: 'عبادی', nationalCode: '0156789012', personnelCode: 'P-1015', email: 'k.ebadi@company.ir', phone: '09249990011', birthDate: '1373/03/28', birthPlace: 'بندرعباس', gender: 'male', maritalStatus: 'married', marriageDate: '1400/01/10', childrenCount: 1, bloodType: 'A-', address: 'تهران، شریعتی', homePhone: '02155667711', education: 'دکتری', fieldOfStudy: 'هوش مصنوعی', university: 'دانشگاه شریف', militaryStatus: 'done', hireDate: '1399/09/01', status: 'active', contractType: 'official', position: 'پژوهشگر', department: 'تحقیق و توسعه', jobGrade: 'B1' },
      ]
      // دریافت کدهای ملی و پرسنلی موجود
      const existingCodes = await db.employee.findMany({ select: { nationalCode: true, personnelCode: true } })
      const existingNationalCodes = new Set(existingCodes.map(e => e.nationalCode))
      const existingPersonnelCodes = new Set(existingCodes.map(e => e.personnelCode))

      for (const emp of employees) {
        // بررسی عدم تکرار کد ملی و پرسنلی
        if (existingNationalCodes.has(emp.nationalCode) || existingPersonnelCodes.has(emp.personnelCode)) {
          continue
        }
        await db.employee.create({ data: emp })
        existingNationalCodes.add(emp.nationalCode)
        existingPersonnelCodes.add(emp.personnelCode)
      }
      results.employees = employees.length
    } else {
      results.employees = existingEmps
    }

    // ═══════════════════════════════════════════════════
    // ۴. شیفت‌های کاری و برنامه‌ها
    // ═══════════════════════════════════════════════════
    const existingShifts = await db.workShift.count()
    if (existingShifts === 0) {
      const shifts = [
        { name: 'شیفت اداری', code: 'SH-OFFICE', color: '#10b981', description: 'شیفت اداری صبح — شنبه تا چهارشنبه' },
        { name: 'شیفت صبح', code: 'SH-MORNING', color: '#3b82f6', description: 'شیفت صبح — ۶ تا ۱۴' },
        { name: 'شیفت عصر', code: 'SH-AFTERNOON', color: '#f59e0b', description: 'شیفت عصر — ۱۴ تا ۲۲' },
        { name: 'شیفت شب', code: 'SH-NIGHT', color: '#8b5cf6', description: 'شیفت شب — ۲۲ تا ۶' },
        { name: 'شیفت چرخشی', code: 'SH-ROTATING', color: '#ef4444', description: 'شیفت چرخشی صبح/عصر/شب' },
      ]
      const shiftRecords = []
      for (const shift of shifts) {
        shiftRecords.push(await db.workShift.create({ data: shift }))
      }

      // برنامه شیفت اداری
      const officeShift = shiftRecords[0]
      const dayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
      for (let dow = 0; dow < 7; dow++) {
        await db.shiftSchedule.create({
          data: {
            shiftId: officeShift.id,
            dayOfWeek: dow,
            dayName: dayNames[dow],
            isWorkingDay: dow < 5, // شنبه تا چهارشنبه
            startTime: dow < 5 ? '08:00' : '00:00',
            endTime: dow < 5 ? '17:00' : '00:00',
            breakStart: dow < 5 ? '12:00' : null,
            breakEnd: dow < 5 ? '13:00' : null,
            lateThreshold: dow < 5 ? '08:15' : null,
            earlyLeaveThreshold: dow < 5 ? '16:45' : null,
            minWorkHours: dow < 5 ? 8 : 0,
          }
        })
      }

      results.shifts = shifts.length
    } else {
      results.shifts = existingShifts
    }

    // ═══════════════════════════════════════════════════
    // ۵. انتصاب‌ها
    // ═══════════════════════════════════════════════════
    const existingAppointments = await db.appointment.count()
    if (existingAppointments === 0) {
      const allEmployees = await db.employee.findMany()
      const allPositions = await db.position.findMany()

      for (const emp of allEmployees) {
        // یافتن پست مرتبط
        const matchingPosition = allPositions.find(p =>
          p.title === emp.position || p.department?.includes(emp.department || '')
        ) || allPositions[0]

        if (matchingPosition) {
          await db.appointment.create({
            data: {
              employeeId: emp.id,
              positionId: matchingPosition.id,
              type: emp.contractType === 'official' ? 'اصلی' : 'موقت',
              startDate: emp.hireDate,
              status: 'active',
              decreeNumber: `H-${emp.hireDate.replace(/\//g, '')}/${Math.floor(Math.random() * 999) + 1}`,
            }
          })
        }
      }
      results.appointments = allEmployees.length
    } else {
      results.appointments = existingAppointments
    }

    // ═══════════════════════════════════════════════════
    // ۶. قراردادها
    // ═══════════════════════════════════════════════════
    const existingContracts = await db.contract.count()
    if (existingContracts === 0) {
      const allEmployees = await db.employee.findMany({ include: { appointments: { take: 1 } } })

      for (const emp of allEmployees) {
        const pos = emp.appointments?.[0]?.position
        const amount = pos?.maxSalary || 100000000
        await db.contract.create({
          data: {
            employeeId: emp.id,
            type: emp.contractType === 'official' ? 'حکم کارگزینی' : 'قرارداد',
            contractNumber: `C-${emp.personnelCode}`,
            title: `${emp.contractType === 'official' ? 'حکم کارگزینی' : 'قرارداد کاری'} — ${emp.firstName} ${emp.lastName}`,
            startDate: emp.hireDate,
            amount,
            department: emp.department,
            status: 'active',
          }
        })
      }
      results.contracts = allEmployees.length
    } else {
      results.contracts = existingContracts
    }

    // ═══════════════════════════════════════════════════
    // ۷. شیفت‌انتساب کارکنان
    // ═══════════════════════════════════════════════════
    const existingShiftAssign = await db.employeeShiftAssignment.count()
    if (existingShiftAssign === 0) {
      const allEmployees = await db.employee.findMany()
      const officeShift = await db.workShift.findFirst({ where: { code: 'SH-OFFICE' } })
      const morningShift = await db.workShift.findFirst({ where: { code: 'SH-MORNING' } })

      if (officeShift && morningShift) {
        for (let i = 0; i < allEmployees.length; i++) {
          const emp = allEmployees[i]
          await db.employeeShiftAssignment.create({
            data: {
              employeeId: emp.id,
              shiftId: i % 3 === 0 ? morningShift.id : officeShift.id,
              startDate: emp.hireDate,
              isDefault: true,
              status: 'active',
            }
          })
        }
        results.shiftAssignments = allEmployees.length
      }
    } else {
      results.shiftAssignments = existingShiftAssign
    }

    // ═══════════════════════════════════════════════════
    // ۸. حضور و غیاب (ماه جاری)
    // ═══════════════════════════════════════════════════
    const existingAttendance = await db.attendance.count()
    if (existingAttendance === 0) {
      const allEmployees = await db.employee.findMany()
      const today = new Date()
      const statuses = ['present', 'present', 'present', 'present', 'late', 'absent', 'mission', 'leave']

      for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
        const d = new Date(today)
        d.setDate(d.getDate() - dayOffset)
        const jalaali = await import('jalaali-js')
        const { jy, jm, jd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
        const dateStr = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`

        const officeShift = await db.workShift.findFirst({ where: { code: 'SH-OFFICE' } })

        for (const emp of allEmployees) {
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          const checkIn = status === 'absent' || status === 'leave' ? null :
            (status === 'late' ? `08:${20 + Math.floor(Math.random() * 30)}` : `08:${String(Math.floor(Math.random() * 10)).padStart(2, '0')}`)
          const checkOut = status === 'absent' || status === 'leave' ? null :
            `17:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}`
          const workHours = checkIn && checkOut ? 8 + (Math.random() > 0.7 ? Math.random() * 2 : 0) : null
          const overtime = workHours && workHours > 8 ? Math.round((workHours - 8) * 10) / 10 : null

          await db.attendance.create({
            data: {
              employeeId: emp.id,
              date: dateStr,
              checkIn,
              checkOut,
              status,
              workHours: workHours ? Math.round(workHours * 10) / 10 : null,
              overtime,
              shiftId: officeShift?.id,
            }
          })
        }
      }
      results.attendance = allEmployees.length * 10
    } else {
      results.attendance = existingAttendance
    }

    // ═══════════════════════════════════════════════════
    // ۹. مرخصی‌ها
    // ═══════════════════════════════════════════════════
    const existingLeaves = await db.leave.count()
    if (existingLeaves === 0) {
      const allEmployees = await db.employee.findMany()
      const leaveTypes = ['استحقاقی', 'استعلاجی', 'بدون حقوق', 'ازدواج']
      const leaveData = [
        { empIdx: 0, type: 'استحقاقی', days: 3, status: 'approved' },
        { empIdx: 2, type: 'استعلاجی', days: 2, status: 'approved' },
        { empIdx: 4, type: 'بدون حقوق', days: 5, status: 'approved' },
        { empIdx: 6, type: 'استحقاقی', days: 1, status: 'pending' },
        { empIdx: 8, type: 'استحقاقی', days: 2, status: 'pending' },
        { empIdx: 10, type: 'ازدواج', days: 7, status: 'approved' },
      ]
      for (const leave of leaveData) {
        if (leave.empIdx < allEmployees.length) {
          await db.leave.create({
            data: {
              employeeId: allEmployees[leave.empIdx].id,
              type: leave.type,
              startDate: '1405/01/05',
              endDate: `1405/01/${String(5 + leave.days).padStart(2, '0')}`,
              totalDays: leave.days,
              reason: `مرخصی ${leave.type}`,
              status: leave.status,
            }
          })
        }
      }
      results.leaves = leaveData.length
    } else {
      results.leaves = existingLeaves
    }

    // ═══════════════════════════════════════════════════
    // ۱۰. ماموریت‌ها
    // ═══════════════════════════════════════════════════
    const existingMissions = await db.mission.count()
    if (existingMissions === 0) {
      const allEmployees = await db.employee.findMany()
      const missionData = [
        { empIdx: 1, title: 'ماموریت بازدید از شعبه اصفهان', dest: 'اصفهان', days: 2, status: 'approved' },
        { empIdx: 3, title: 'ماموریت نمایشگاه بین‌المللی', dest: 'تهران', days: 3, status: 'approved' },
        { empIdx: 7, title: 'ماموریت نصب سیستم مشتری', dest: 'شیراز', days: 1, status: 'pending' },
      ]
      for (const m of missionData) {
        if (m.empIdx < allEmployees.length) {
          await db.mission.create({
            data: {
              employeeId: allEmployees[m.empIdx].id,
              title: m.title,
              destination: m.dest,
              startDate: '1405/01/10',
              endDate: `1405/01/${String(10 + m.days).padStart(2, '0')}`,
              totalDays: m.days,
              status: m.status,
            }
          })
        }
      }
      results.missions = missionData.length
    } else {
      results.missions = existingMissions
    }

    // ═══════════════════════════════════════════════════
    // ۱۱. تعطیلات
    // ═══════════════════════════════════════════════════
    const existingHolidays = await db.holiday.count()
    if (existingHolidays === 0) {
      const holidays = [
        { title: 'عید نوروز', date: '1405/01/01', type: 'official', isRecurring: true, description: 'تعطیلی رسمی نوروز' },
        { title: 'عید نوروز (ادامه)', date: '1405/01/02-1405/01/04', type: 'official', isRecurring: true, description: 'تعطیلی رسمی نوروز — روزهای دوم تا چهارم' },
        { title: 'روز جمهوری اسلامی', date: '1405/01/12', type: 'official', isRecurring: true },
        { title: 'روز طبیعت (سیزده‌به‌در)', date: '1405/01/13', type: 'official', isRecurring: true },
        { title: 'رحلت امام خمینی', date: '1405/03/14', type: 'official', isRecurring: true },
        { title: 'قیام ۱۵ خرداد', date: '1405/03/15', type: 'official', isRecurring: true },
        { title: 'عید فطر', date: '1405/03/22', type: 'official', isRecurring: false },
        { title: 'عید قربان', date: '1405/06/10', type: 'official', isRecurring: false },
        { title: 'عید غدیر', date: '1405/06/18', type: 'official', isRecurring: false },
        { title: 'تاسوعا', date: '1405/09/09', type: 'official', isRecurring: false },
        { title: 'عاشورا', date: '1405/09/10', type: 'official', isRecurring: false },
        { title: 'پیروزی انقلاب اسلامی', date: '1405/11/22', type: 'official', isRecurring: true },
        { title: 'ملی شدن صنعت نفت', date: '1405/12/29', type: 'official', isRecurring: true },
        { title: 'تعطیلی توافقی', date: '1405/02/15', type: 'agreed', isRecurring: false },
      ]
      for (const h of holidays) {
        await db.holiday.create({ data: h })
      }
      results.holidays = holidays.length
    } else {
      results.holidays = existingHolidays
    }

    // ═══════════════════════════════════════════════════
    // ۱۲. اطلاعیه‌ها
    // ═══════════════════════════════════════════════════
    const existingAnnouncements = await db.announcement.count()
    if (existingAnnouncements === 0) {
      const announcements = [
        { title: 'اطلاعیه پرداخت حقوق اسفند ماه', content: 'حقوق و مزایای اسفند ماه تا تاریخ ۱۴۰۵/۱۲/۲۹ به حساب کارکنان واریز خواهد شد. در صورت بروز هرگونه مشکل با واحد منابع انسانی تماس بگیرید.', priority: 'high', targetAudience: 'all', publishDate: '1405/12/25' },
        { title: 'آزمایش سرطان سینه رایگان', content: 'آزمایش رایگان سرطان سینه برای کارکنان خانم در تاریخ ۱۴۰۵/۰۲/۱۵ برگزار می‌شود. خواهشمندیم برای هماهنگی با واحد منابع انسانی تماس بگیرید.', priority: 'normal', targetAudience: 'employees', publishDate: '1405/02/10' },
        { title: 'تغییر ساعات کاری رمضان', content: 'به مناسبت ماه مبارک رمضان، ساعات کاری از ۹ صبح تا ۱۴:۳۰ تغییر می‌یابد. این تغییر از ابتدای ماه رمضان لغایت پایان آن اعمال خواهد شد.', priority: 'urgent', targetAudience: 'all', publishDate: '1405/02/01' },
        { title: 'جشن سالگرد تأسیس شرکت', content: 'جشن سالگرد تأسیس شرکت در تاریخ ۱۴۰۵/۰۴/۱۵ در سالن همایش‌ها برگزار خواهد شد. حضور همه همکاران باعث افتخار ماست.', priority: 'low', targetAudience: 'all', publishDate: '1405/04/01' },
        { title: 'دوره آموزشی ایمنی محل کار', content: 'دوره آموزشی ایمنی و بهداشت محل کار برای کارکنان واحد تولید در تاریخ ۱۴۰۵/۰۳/۲۰ برگزار می‌شود. حضور الزامی است.', priority: 'high', targetAudience: 'department', department: 'تولید', publishDate: '1405/03/15' },
      ]
      for (const a of announcements) {
        await db.announcement.create({ data: a })
      }
      results.announcements = announcements.length
    } else {
      results.announcements = existingAnnouncements
    }

    // ═══════════════════════════════════════════════════
    // ۱۳. آیین‌نامه‌ها
    // ═══════════════════════════════════════════════════
    const existingRegulations = await db.regulation.count()
    if (existingRegulations === 0) {
      const regulations = [
        { title: 'آیین‌نامه انضباطی کارکنان', content: 'این آیین‌نامه شامل مقررات انضباطی، تخلفات و مجازات‌های مربوطه برای تمامی کارکنان شرکت می‌باشد. هرگونه تخلف از مقررات بر اساس این آیین‌نامه رسیدگی خواهد شد.', category: 'حقوق', version: '2.1', publishDate: '1404/01/01' },
        { title: 'آیین‌نامه مرخصی‌ها', content: 'آیین‌نامه مرخصی‌ها شامل شرایط و نحوه استفاده از انواع مرخصی‌ها شامل استحقاقی، استعلاجی، بدون حقوق، ازدواج و فوت می‌باشد.', category: 'حقوق', version: '1.5', publishDate: '1404/03/01' },
        { title: 'آیین‌نامه استخدام', content: 'مقررات و شرایط استخدام نیروی جدید شامل آگهی، مصاحبه، آزمایشگاهی و دوره آزمایشی در این آیین‌نامه مشخص شده است.', category: 'استخدام', version: '3.0', publishDate: '1403/06/01' },
        { title: 'آیین‌نامه ایمنی و بهداشت', content: 'الزامات ایمنی و بهداشت محیط کار شامل تجهیزات حفاظتی، راهنمای اطفاء حریق و اقدامات اضطراری در این سند تدوین شده است.', category: 'ایمنی', version: '2.0', publishDate: '1404/01/15' },
        { title: 'آیین‌نامه آموزش کارکنان', content: 'شرایط و ضوابط مربوط به آموزش‌های داخل و خارج از سازمان شامل هزینه‌ها، تعهدنامه و ارزیابی اثربخشی آموزش.', category: 'آموزش', version: '1.2', publishDate: '1404/05/01' },
        { title: 'آیین‌نامه حضور و غیاب', content: 'ساعات کاری، سقف تاخیر مجاز، نحوه ثبت تردد و برخورد با غیبت‌های غیرموجه در این آیین‌نامه مشخص شده است.', category: 'حضورغیاب', version: '2.3', publishDate: '1404/02/01' },
      ]
      for (const r of regulations) {
        await db.regulation.create({ data: r })
      }
      results.regulations = regulations.length
    } else {
      results.regulations = existingRegulations
    }

    // ═══════════════════════════════════════════════════
    // ۱۴. ارزیابی عملکرد
    // ═══════════════════════════════════════════════════
    const existingPerf = await db.performance.count()
    if (existingPerf === 0) {
      const allEmployees = await db.employee.findMany()
      for (const emp of allEmployees) {
        await db.performance.create({
          data: {
            employeeId: emp.id,
            period: '1405/Q1',
            score: Math.round((2.5 + Math.random() * 2.5) * 10) / 10,
            target: 3,
            status: 'completed',
            comments: 'ارزیابی عملکرد سه‌ماهه اول سال ۱۴۰۵',
          }
        })
      }
      results.performances = allEmployees.length
    } else {
      results.performances = existingPerf
    }

    // ═══════════════════════════════════════════════════
    // ۱۵. وام و مساعده
    // ═══════════════════════════════════════════════════
    const existingLoans = await db.loanRequest.count()
    if (existingLoans === 0) {
      const allEmployees = await db.employee.findMany()
      const loanData = [
        { empIdx: 0, type: 'وام', amount: 200000000, installments: 24, status: 'approved', reason: 'خرید خودرو' },
        { empIdx: 2, type: 'مساعده', amount: 50000000, installments: 6, status: 'approved', reason: 'هزینه درمان' },
        { empIdx: 5, type: 'وام', amount: 150000000, installments: 18, status: 'pending', reason: 'تعمیرات منزل' },
        { empIdx: 8, type: 'مساعده', amount: 30000000, installments: 3, status: 'approved', reason: 'مساعده ضروری' },
      ]
      for (const l of loanData) {
        if (l.empIdx < allEmployees.length) {
          await db.loanRequest.create({
            data: {
              employeeId: allEmployees[l.empIdx].id,
              type: l.type,
              amount: l.amount,
              installments: l.installments,
              reason: l.reason,
              status: l.status,
            }
          })
        }
      }
      results.loans = loanData.length
    } else {
      results.loans = existingLoans
    }

    // ═══════════════════════════════════════════════════
    // ۱۶. آموزش‌ها
    // ═══════════════════════════════════════════════════
    const existingTraining = await db.training.count()
    if (existingTraining === 0) {
      const allEmployees = await db.employee.findMany()
      const trainings = [
        { title: 'دوره مدیریت پروژه (PMP)', instructor: 'دکتر رضایی', startDate: '1405/02/01', endDate: '1405/02/15', location: 'سالن آموزش شرکت', status: 'completed', empIdxs: [0, 2, 8, 12] },
        { title: 'دوره ایمنی و بهداشت حرفه‌ای', instructor: 'مهندس صالحی', startDate: '1405/03/01', endDate: '1405/03/03', location: 'واحد تولید', status: 'completed', empIdxs: [8, 10] },
        { title: 'دوره مهارت‌های ارتباطی', instructor: 'زهرا احمدی', startDate: '1405/04/15', endDate: null, location: 'سالن همایش', status: 'in_progress', empIdxs: [3, 5, 7, 13] },
        { title: 'آموزش نرم‌افزار ERP', instructor: 'شرکت فناوران', startDate: '1405/05/01', endDate: null, location: 'اتاق IT', status: 'planned', empIdxs: [0, 1, 4, 6] },
      ]
      let trainingCount = 0
      for (const t of trainings) {
        const training = await db.training.create({
          data: {
            title: t.title,
            instructor: t.instructor,
            startDate: t.startDate,
            endDate: t.endDate,
            location: t.location,
            status: t.status,
          }
        })
        for (const idx of t.empIdxs) {
          if (idx < allEmployees.length) {
            await db.trainingParticipant.create({
              data: {
                trainingId: training.id,
                employeeId: allEmployees[idx].id,
                status: t.status === 'completed' ? 'completed' : 'registered',
                score: t.status === 'completed' ? Math.round((14 + Math.random() * 6) * 10) / 10 : null,
              }
            })
          }
        }
        trainingCount++
      }
      results.trainings = trainingCount
    } else {
      results.trainings = existingTraining
    }

    // ═══════════════════════════════════════════════════
    // ۱۷. پاداش‌ها
    // ═══════════════════════════════════════════════════
    const existingRewards = await db.reward.count()
    if (existingRewards === 0) {
      const allEmployees = await db.employee.findMany()
      const rewardData = [
        { empIdx: 0, type: 'نقدی', title: 'پاداش کاربر برتر ماه', amount: 10000000, reason: 'عملکرد ممتاز', date: '1405/01/30' },
        { empIdx: 2, type: 'تقدیر', title: 'تقدیر از زحمات', amount: null, reason: 'تحویل به‌موقع پروژه', date: '1405/02/15' },
        { empIdx: 6, type: 'نقدی', title: 'پاداش سالانه', amount: 50000000, reason: 'سابقه طولانی', date: '1405/12/29' },
      ]
      for (const r of rewardData) {
        if (r.empIdx < allEmployees.length) {
          await db.reward.create({
            data: {
              employeeId: allEmployees[r.empIdx].id,
              type: r.type,
              title: r.title,
              amount: r.amount,
              reason: r.reason,
              date: r.date,
            }
          })
        }
      }
      results.rewards = rewardData.length
    } else {
      results.rewards = existingRewards
    }

    // ═══════════════════════════════════════════════════
    // ۱۸. آنبوردینگ و آفبوردینگ
    // ═══════════════════════════════════════════════════
    const existingOnboard = await db.onboarding.count()
    if (existingOnboard === 0) {
      const probationEmployees = await db.employee.findMany({ where: { status: 'probation' } })
      for (const emp of probationEmployees) {
        await db.onboarding.create({
          data: {
            employeeId: emp.id,
            tasks: JSON.stringify(['تکمیل فرم‌های استخدامی', 'معرفی به تیم', 'دسترسی سیستم', 'آموزش ایمنی', 'معرفی قوانین شرکت']),
            progress: Math.floor(Math.random() * 60) + 20,
            status: 'in_progress',
            startDate: emp.hireDate,
          }
        })
      }
      results.onboarding = probationEmployees.length
    } else {
      results.onboarding = existingOnboard
    }

    // ═══════════════════════════════════════════════════
    // ۱۹. استخدام‌ها
    // ═══════════════════════════════════════════════════
    const existingRecruit = await db.recruitment.count()
    if (existingRecruit === 0) {
      const recruitments = [
        { title: 'استخدام برنامه‌نویس ارشد پایتون', department: 'فناوری اطلاعات', position: 'برنامه‌نویس ارشد', status: 'interviewing', applicants: 12 },
        { title: 'استخدام کارشناس منابع انسانی', department: 'منابع انسانی', position: 'کارشناس منابع انسانی', status: 'open', applicants: 8 },
        { title: 'استخدام مدیر فروش', department: 'بازرگانی و فروش', position: 'مدیر فروش', status: 'offered', applicants: 5 },
        { title: 'استخدام اپراتور تولید', department: 'تولید', position: 'اپراتور تولید', status: 'hired', applicants: 20 },
      ]
      for (const r of recruitments) {
        await db.recruitment.create({ data: r })
      }
      results.recruitments = recruitments.length
    } else {
      results.recruitments = existingRecruit
    }

    // ═══════════════════════════════════════════════════
    // ۲۰. کاربران سیستم (احراز هویت)
    //   ادمین: ایمیل + رمز عبور
    //   کارمندان: موبایل + کد ملی (اتوماتیک)
    // ═══════════════════════════════════════════════════
    const existingUsers = await db.user.count()
    if (existingUsers === 0) {
      // ۱. ادمین — ورود با ایمیل + رمز عبور
      const adminPassword = await bcrypt.hash('123456', 10)
      await db.user.create({
        data: {
          email: 'admin@company.ir',
          password: adminPassword,
          role: 'admin',
          isActive: true,
        }
      })

      // ۲. کارمندان — ورود با موبایل + کد ملی
      const employees = await db.employee.findMany({ orderBy: { createdAt: 'asc' }, take: 15 })
      const roleMap: Record<number, string> = {
        0: 'hr_manager',   // محمد احمدی
        5: 'hr_manager',   // فاطمه نوری
        11: 'manager',     // لیلا رحیمی
        12: 'manager',     // پویا میرزایی
        3: 'manager',      // مریم حسینی
      }

      let createdUsers = 1 // 1 = admin
      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i]
        if (!emp.phone || !emp.nationalCode) continue

        let mobile = emp.phone.replace(/\s/g, '')
        if (mobile.startsWith('98')) mobile = '0' + mobile.slice(2)
        if (!mobile.startsWith('0')) mobile = '0' + mobile

        const password = await bcrypt.hash(emp.nationalCode, 10)
        const role = roleMap[i] || 'employee'

        await db.user.create({
          data: {
            mobile,
            password,
            role,
            isActive: true,
            employeeId: emp.id,
          }
        })
        createdUsers++
      }
      results.users = createdUsers
    } else {
      results.users = existingUsers
    }

    return NextResponse.json({
      success: true,
      message: 'داده‌های نمونه با موفقیت ایجاد شد',
      results,
    }, { status: 201 })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد داده‌های نمونه', details: String(error) },
      { status: 500 }
    )
  }
}
