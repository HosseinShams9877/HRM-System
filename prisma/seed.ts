import { PrismaClient } from '@prisma/client'
import { SYSTEM_FORMULAS } from '../src/modules/payroll/constants'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()



const DAYS_OF_WEEK = [
  { value: 0, label: 'شنبه' },
  { value: 1, label: 'یکشنبه' },
  { value: 2, label: 'دوشنبه' },
  { value: 3, label: 'سه‌شنبه' },
  { value: 4, label: 'چهارشنبه' },
  { value: 5, label: 'پنجشنبه' },
  { value: 6, label: 'جمعه' },
]

async function main() {
  console.log('🌱 شروع seed...')

  

  // ==== دپارتمان‌ها ====
  const departments = await Promise.all([
    prisma.department.upsert({ where: { code: 'HR' }, update: {}, create: { name: 'منابع انسانی', code: 'HR' } }),
    prisma.department.upsert({ where: { code: 'FIN' }, update: {}, create: { name: 'مالی و حسابداری', code: 'FIN' } }),
    prisma.department.upsert({ where: { code: 'IT' }, update: {}, create: { name: 'فناوری اطلاعات', code: 'IT' } }),
    prisma.department.upsert({ where: { code: 'SALES' }, update: {}, create: { name: 'فروش و بازاریابی', code: 'SALES' } }),
    prisma.department.upsert({ where: { code: 'OPS' }, update: {}, create: { name: 'عملیات', code: 'OPS' } }),
    prisma.department.upsert({ where: { code: 'PROD' }, update: {}, create: { name: 'تولید', code: 'PROD' } }),
  ])
  console.log(`✅ ${departments.length} دپارتمان`)

  // ==== پست‌های سازمانی ====
  const positions = await Promise.all([
    prisma.position.upsert({ where: { code: 'POS-001' }, update: {}, create: { title: 'مدیر منابع انسانی', code: 'POS-001', level: 'ارشد', departmentId: departments[0].id, jobGrade: 'A1', minSalary: 30000000, maxSalary: 60000000, headcount: 1 } }),
    prisma.position.upsert({ where: { code: 'POS-002' }, update: {}, create: { title: 'کارشناس حقوق', code: 'POS-002', level: 'میانره', departmentId: departments[0].id, jobGrade: 'A2', minSalary: 18000000, maxSalary: 35000000, headcount: 3 } }),
    prisma.position.upsert({ where: { code: 'POS-003' }, update: {}, create: { title: 'مدیر مالی', code: 'POS-003', level: 'ارشد', departmentId: departments[1].id, jobGrade: 'A1', minSalary: 35000000, maxSalary: 70000000, headcount: 1 } }),
    prisma.position.upsert({ where: { code: 'POS-004' }, update: {}, create: { title: 'برنامه‌نویس ارشد', code: 'POS-004', level: 'ارشد', departmentId: departments[2].id, jobGrade: 'B1', minSalary: 25000000, maxSalary: 55000000, headcount: 5 } }),
    prisma.position.upsert({ where: { code: 'POS-005' }, update: {}, create: { title: 'مدیر فروش', code: 'POS-005', level: 'ارشد', departmentId: departments[3].id, jobGrade: 'A1', minSalary: 28000000, maxSalary: 60000000, headcount: 1 } }),
    prisma.position.upsert({ where: { code: 'POS-006' }, update: {}, create: { title: 'اپراتور تولید', code: 'POS-006', level: 'مبتدی', departmentId: departments[5].id, jobGrade: 'C1', minSalary: 12000000, maxSalary: 22000000, headcount: 20 } }),
    prisma.position.upsert({ where: { code: 'POS-007' }, update: {}, create: { title: 'کارشناس فروش', code: 'POS-007', level: 'میانره', departmentId: departments[3].id, jobGrade: 'B2', minSalary: 16000000, maxSalary: 30000000, headcount: 8 } }),
    prisma.position.upsert({ where: { code: 'POS-008' }, update: {}, create: { title: 'تکنسین شبکه', code: 'POS-008', level: 'میانره', departmentId: departments[2].id, jobGrade: 'B2', minSalary: 18000000, maxSalary: 35000000, headcount: 3 } }),
  ])
  console.log(`✅ ${positions.length} پست سازمانی`)

  // ==== کارکنان ====
  const employeesData = [
    { firstName: 'محمد', lastName: 'احمدی', nationalCode: '0012345678', personnelCode: 'P-1001', department: 'منابع انسانی', position: 'مدیر منابع انسانی', hireDate: '1395/01/15', gender: 'male', maritalStatus: 'married', childrenCount: 2, education: 'کارشناسی ارشد', fieldOfStudy: 'مدیریت منابع انسانی', contractType: 'official' },
    { firstName: 'زهرا', lastName: 'محمدی', nationalCode: '0023456789', personnelCode: 'P-1002', department: 'منابع انسانی', position: 'کارشناس حقوق', hireDate: '1398/06/01', gender: 'female', maritalStatus: 'single', education: 'کارشناسی', fieldOfStudy: 'حقوق', contractType: 'official' },
    { firstName: 'علی', lastName: 'رضایی', nationalCode: '0034567890', personnelCode: 'P-1003', department: 'فناوری اطلاعات', position: 'برنامه‌نویس ارشد', hireDate: '1397/03/10', gender: 'male', maritalStatus: 'married', childrenCount: 3, education: 'کارشناسی ارشد', fieldOfStudy: 'مهندسی نرم‌افزار', contractType: 'official' },
    { firstName: 'مریم', lastName: 'حسینی', nationalCode: '0045678901', personnelCode: 'P-1004', department: 'مالی و حسابداری', position: 'مدیر مالی', hireDate: '1396/09/20', gender: 'female', maritalStatus: 'married', education: 'کارشناسی ارشد', fieldOfStudy: 'حسابداری', contractType: 'official' },
    { firstName: 'حسین', lastName: 'کریمی', nationalCode: '0056789012', personnelCode: 'P-1005', department: 'فروش و بازاریابی', position: 'مدیر فروش', hireDate: '1399/01/01', gender: 'male', maritalStatus: 'married', childrenCount: 1, education: 'کارشناسی ارشد', fieldOfStudy: 'مدیریت بازرگانی', contractType: 'official' },
    { firstName: 'فاطمه', lastName: 'عباسی', nationalCode: '0067890123', personnelCode: 'P-1006', department: 'فروش و بازاریابی', position: 'کارشناس فروش', hireDate: '1400/04/15', gender: 'female', maritalStatus: 'single', education: 'کارشناسی', fieldOfStudy: 'مدیریت بازرگانی', contractType: 'contractual' },
    { firstName: 'رضا', lastName: 'تقوی', nationalCode: '0078901234', personnelCode: 'P-1007', department: 'تولید', position: 'اپراتور تولید', hireDate: '1401/07/01', gender: 'male', maritalStatus: 'married', childrenCount: 2, education: 'دیپلم', fieldOfStudy: 'فنی حرفه‌ای', contractType: 'contractual' },
    { firstName: 'سارا', lastName: 'نوری', nationalCode: '0089012345', personnelCode: 'P-1008', department: 'فناوری اطلاعات', position: 'تکنسین شبکه', hireDate: '1400/02/10', gender: 'female', maritalStatus: 'single', education: 'کارشناسی', fieldOfStudy: 'فناوری اطلاعات', contractType: 'official' },
    { firstName: 'امیر', lastName: 'صادقی', nationalCode: '0090123456', personnelCode: 'P-1009', department: 'تولید', position: 'اپراتور تولید', hireDate: '1402/01/15', gender: 'male', maritalStatus: 'single', education: 'دیپلم', fieldOfStudy: 'الکترونیک', contractType: 'contractual', status: 'probation', probationEnd: '1402/04/15' },
    { firstName: 'نرگس', lastName: 'امیری', nationalCode: '0101234567', personnelCode: 'P-1010', department: 'منابع انسانی', position: 'کارشناس حقوق', hireDate: '1401/06/01', gender: 'female', maritalStatus: 'married', education: 'کارشناسی', fieldOfStudy: 'حقوق', contractType: 'contractual' },
  ]

  for (const emp of employeesData) {
    await prisma.employee.upsert({
      where: { personnelCode: emp.personnelCode },
      update: {},
      create: emp,
    })
  }
  const employees = await prisma.employee.findMany()
  console.log(`✅ ${employees.length} کارمند`)
  // ============================================
  // اضافه کردن کاربران برای لاگین
  // ============================================
  
  // پیدا کردن کارمند با کد ملی 0012345678 (محمد احمدی)
  const employeeForUser = employees.find(e => e.nationalCode === '0012345678') || employees[0]
  
  // کاربر شماره 1: کارمند عادی (با موبایل)
  // رمز عبور = کد ملی 1234567890
  const hashedEmployeePassword = await bcrypt.hash('1234567890', 10)
await prisma.user.upsert({
  where: { mobile: '09121234567' },
  update: {},
  create: {
    mobile: '09121234567',
    password: hashedEmployeePassword,  // هش شده
    role: 'employee',
    employeeId: employeeForUser.id,
    isActive: true,
    isFirstLogin: false,
  },
})

// کاربر شماره 2: ادمین
const hashedAdminPassword = await bcrypt.hash('123456', 10)
await prisma.user.upsert({
  where: { email: 'admin@company.ir' },
  update: {},
  create: {
    email: 'admin@company.ir',
    password: hashedAdminPassword,  // هش شده
    role: 'admin',
    employeeId: null,
    isActive: true,
    isFirstLogin: false,
  },
})
  console.log(`✅ کاربر ادمین با ایمیل admin@company.ir و رمز 123456`)
  console.log(`✅ 2 کاربر برای لاگین اضافه شد`)
  

  // ==== شیفت‌های کاری ====
  // 1. شیفت صبح (اداری)
  const morningShift = await prisma.workShift.upsert({
    where: { code: 'SH-MRN' },
    update: {},
    create: {
      name: 'شیفت صبح',
      code: 'SH-MRN',
      color: '#10b981',
      description: 'شیفت صبح اداری - شنبه تا چهارشنبه ۸ تا ۱۷، پنجشنبه ۸ تا ۱۳',
      isActive: true,
      schedules: {
        create: [
          { dayOfWeek: 0, dayName: 'شنبه', isWorkingDay: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', lateThreshold: '08:15', earlyLeaveThreshold: '16:45', minWorkHours: 8 },
          { dayOfWeek: 1, dayName: 'یکشنبه', isWorkingDay: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', lateThreshold: '08:15', earlyLeaveThreshold: '16:45', minWorkHours: 8 },
          { dayOfWeek: 2, dayName: 'دوشنبه', isWorkingDay: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', lateThreshold: '08:15', earlyLeaveThreshold: '16:45', minWorkHours: 8 },
          { dayOfWeek: 3, dayName: 'سه‌شنبه', isWorkingDay: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', lateThreshold: '08:15', earlyLeaveThreshold: '16:45', minWorkHours: 8 },
          { dayOfWeek: 4, dayName: 'چهارشنبه', isWorkingDay: true, startTime: '08:00', endTime: '14:00', breakStart: null, breakEnd: null, lateThreshold: '08:15', earlyLeaveThreshold: '13:45', minWorkHours: 6 },
          { dayOfWeek: 5, dayName: 'پنجشنبه', isWorkingDay: false, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', lateThreshold: null, earlyLeaveThreshold: null, minWorkHours: 8 },
          { dayOfWeek: 6, dayName: 'جمعه', isWorkingDay: false, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', lateThreshold: null, earlyLeaveThreshold: null, minWorkHours: 8 },
        ],
      },
    },
  })
  console.log('✅ شیفت صبح')

  // 2. شیفت شب
  const nightShift = await prisma.workShift.upsert({
    where: { code: 'SH-NIT' },
    update: {},
    create: {
      name: 'شیفت شب',
      code: 'SH-NIT',
      color: '#8b5cf6',
      description: 'شیفت شب تولید - شنبه تا چهارشنبه ۲۲ تا ۶ صبح، پنجشنبه تعطیل',
      isActive: true,
      schedules: {
        create: [
          { dayOfWeek: 0, dayName: 'شنبه', isWorkingDay: true, startTime: '22:00', endTime: '06:00', breakStart: '02:00', breakEnd: '02:30', lateThreshold: '22:15', earlyLeaveThreshold: '05:45', minWorkHours: 8 },
          { dayOfWeek: 1, dayName: 'یکشنبه', isWorkingDay: true, startTime: '22:00', endTime: '06:00', breakStart: '02:00', breakEnd: '02:30', lateThreshold: '22:15', earlyLeaveThreshold: '05:45', minWorkHours: 8 },
          { dayOfWeek: 2, dayName: 'دوشنبه', isWorkingDay: true, startTime: '22:00', endTime: '06:00', breakStart: '02:00', breakEnd: '02:30', lateThreshold: '22:15', earlyLeaveThreshold: '05:45', minWorkHours: 8 },
          { dayOfWeek: 3, dayName: 'سه‌شنبه', isWorkingDay: true, startTime: '22:00', endTime: '06:00', breakStart: '02:00', breakEnd: '02:30', lateThreshold: '22:15', earlyLeaveThreshold: '05:45', minWorkHours: 8 },
          { dayOfWeek: 4, dayName: 'چهارشنبه', isWorkingDay: true, startTime: '22:00', endTime: '06:00', breakStart: '02:00', breakEnd: '02:30', lateThreshold: '22:15', earlyLeaveThreshold: '05:45', minWorkHours: 8 },
          { dayOfWeek: 5, dayName: 'پنجشنبه', isWorkingDay: false, startTime: '22:00', endTime: '06:00', breakStart: null, breakEnd: null, lateThreshold: null, earlyLeaveThreshold: null, minWorkHours: 8 },
          { dayOfWeek: 6, dayName: 'جمعه', isWorkingDay: false, startTime: '22:00', endTime: '06:00', breakStart: null, breakEnd: null, lateThreshold: null, earlyLeaveThreshold: null, minWorkHours: 8 },
        ],
      },
    },
  })
  console.log('✅ شیفت شب')

  // 3. شیفت تعاملی (انعطاف‌پذیر)
  const flexShift = await prisma.workShift.upsert({
    where: { code: 'SH-FLX' },
    update: {},
    create: {
      name: 'شیفت تعاملی',
      code: 'SH-FLX',
      color: '#f59e0b',
      description: 'شیفت انعطاف‌پذیر - ساعت ورود و خروج متفاوت هر روز، حداقل ۴۰ ساعت هفتگی',
      isActive: true,
      schedules: {
        create: [
          { dayOfWeek: 0, dayName: 'شنبه', isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00', lateThreshold: '09:30', earlyLeaveThreshold: '17:30', minWorkHours: 8 },
          { dayOfWeek: 1, dayName: 'یکشنبه', isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00', lateThreshold: '09:30', earlyLeaveThreshold: '17:30', minWorkHours: 8 },
          { dayOfWeek: 2, dayName: 'دوشنبه', isWorkingDay: true, startTime: '08:30', endTime: '17:30', breakStart: '12:30', breakEnd: '13:30', lateThreshold: '09:00', earlyLeaveThreshold: '17:00', minWorkHours: 8 },
          { dayOfWeek: 3, dayName: 'سه‌شنبه', isWorkingDay: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00', lateThreshold: '10:30', earlyLeaveThreshold: '18:30', minWorkHours: 8 },
          { dayOfWeek: 4, dayName: 'چهارشنبه', isWorkingDay: true, startTime: '09:00', endTime: '15:00', breakStart: null, breakEnd: null, lateThreshold: '09:30', earlyLeaveThreshold: '14:30', minWorkHours: 6 },
          { dayOfWeek: 5, dayName: 'پنجشنبه', isWorkingDay: true, startTime: '10:00', endTime: '14:00', breakStart: null, breakEnd: null, lateThreshold: '10:30', earlyLeaveThreshold: '13:30', minWorkHours: 4 },
          { dayOfWeek: 6, dayName: 'جمعه', isWorkingDay: false, startTime: '09:00', endTime: '18:00', breakStart: null, breakEnd: null, lateThreshold: null, earlyLeaveThreshold: null, minWorkHours: 8 },
        ],
      },
    },
  })
  console.log('✅ شیفت تعاملی')

  // ==== انتساب شیفت به کارکنان ====
  const morningEmps = employees.filter(e => ['منابع انسانی', 'مالی و حسابداری', 'فروش و بازاریابی'].includes(e.department || ''))
  const nightEmps = employees.filter(e => e.department === 'تولید')
  const flexEmps = employees.filter(e => e.department === 'فناوری اطلاعات')

  for (const emp of morningEmps) {
    await prisma.employeeShiftAssignment.upsert({
      where: { employeeId_startDate_shiftId: { employeeId: emp.id, startDate: '1405/01/01', shiftId: morningShift.id } },
      update: {},
      create: { employeeId: emp.id, shiftId: morningShift.id, startDate: '1405/01/01', isDefault: true, status: 'active' },
    })
  }
  for (const emp of nightEmps) {
    await prisma.employeeShiftAssignment.upsert({
      where: { employeeId_startDate_shiftId: { employeeId: emp.id, startDate: '1405/01/01', shiftId: nightShift.id } },
      update: {},
      create: { employeeId: emp.id, shiftId: nightShift.id, startDate: '1405/01/01', isDefault: true, status: 'active' },
    })
  }
  for (const emp of flexEmps) {
    await prisma.employeeShiftAssignment.upsert({
      where: { employeeId_startDate_shiftId: { employeeId: emp.id, startDate: '1405/01/01', shiftId: flexShift.id } },
      update: {},
      create: { employeeId: emp.id, shiftId: flexShift.id, startDate: '1405/01/01', isDefault: true, status: 'active' },
    })
  }
  console.log('✅ انتساب شیفت‌ها')

  // ==== تعطیلات ====
  const holidays = [
    { title: 'نوروز', date: '1405/01/01', type: 'official', isRecurring: true, description: 'جشن نوروز' },
    { title: 'عید نوروز', date: '1405/01/02', type: 'official', isRecurring: true, description: 'تعطیلات نوروز - روز دوم' },
    { title: 'عید نوروز', date: '1405/01/03', type: 'official', isRecurring: true, description: 'تعطیلات نوروز - روز سوم' },
    { title: 'عید نوروز', date: '1405/01/04', type: 'official', isRecurring: true, description: 'تعطیلات نوروز - روز چهارم' },
    { title: 'روز طبیعت', date: '1405/01/13', type: 'official', isRecurring: true, description: 'سیزده‌بدر' },
    { title: 'روز جمهوری اسلامی', date: '1405/01/12', type: 'official', isRecurring: true, description: '۱۲ فروردین' },
    { title: 'عید سعید فطر', date: '1405/02/01', type: 'official', isRecurring: false, description: 'عید فطر ۱۴۰۵' },
    { title: 'عید سعید فطر', date: '1405/02/02', type: 'official', isRecurring: false, description: 'عید فطر - روز دوم' },
    { title: 'شهادت امام خمینی', date: '1405/03/14', type: 'official', isRecurring: true, description: '۱۴ خرداد' },
    { title: 'قیام ۱۵ خرداد', date: '1405/03/15', type: 'official', isRecurring: true, description: '۱۵ خرداد' },
    { title: 'عید سعید قربان', date: '1405/06/10', type: 'official', isRecurring: false, description: 'عید قربان ۱۴۰۵' },
    { title: 'عید سعید غدیر', date: '1405/06/18', type: 'official', isRecurring: false, description: 'عید غدیر ۱۴۰۵' },
    { title: 'تاسوعا', date: '1405/07/09', type: 'official', isRecurring: false, description: 'تاسوعای حسینی ۱۴۰۵' },
    { title: 'عاشورا', date: '1405/07/10', type: 'official', isRecurring: false, description: 'عاشورای حسینی ۱۴۰۵' },
    { title: 'تعطیلی توافقی سالگرد شرکت', date: '1405/05/15', type: 'agreed', isRecurring: false, description: 'تعطیلی توافقی به مناسبت سالگرد تأسیس شرکت' },
    { title: 'تعطیلی توافقی نیمه شعبان', date: '1405/08/15', type: 'agreed', isRecurring: false, description: 'تعطیلی توافقی' },
  ]

  for (const h of holidays) {
    await prisma.holiday.create({ data: h })
  }
  console.log(`✅ ${holidays.length} تعطیلات`)

  // ==== قراردادها ====
  const contractsData = [
    { employeeId: employees[0].id, type: 'حکم کارگزینی', title: 'حکم کارگزینی - مدیر منابع انسانی', startDate: '1395/01/15', endDate: null, amount: 55000000, department: 'منابع انسانی', contractNumber: 'H-1395/001', status: 'active' },
    { employeeId: employees[1].id, type: 'قرارداد', title: 'قرارداد استخدامی کارشناس حقوق', startDate: '1403/06/01', endDate: '1405/06/01', amount: 28000000, department: 'منابع انسانی', contractNumber: 'C-1403/015', status: 'active' },
    { employeeId: employees[2].id, type: 'حکم کارگزینی', title: 'حکم کارگزینی - برنامه‌نویس ارشد', startDate: '1397/03/10', endDate: null, amount: 45000000, department: 'فناوری اطلاعات', contractNumber: 'H-1397/008', status: 'active' },
    { employeeId: employees[3].id, type: 'حکم تغییر سمت', title: 'حکم تغییر سمت از معاون مالی به مدیر مالی', startDate: '1402/09/01', endDate: null, amount: 60000000, department: 'مالی و حسابداری', contractNumber: 'H-1402/012', status: 'active' },
    { employeeId: employees[4].id, type: 'حکم انتقال', title: 'حکم انتقال از شعبه اصفهان به تهران', startDate: '1403/01/01', endDate: null, amount: 42000000, department: 'فروش و بازاریابی', contractNumber: 'H-1403/003', status: 'active' },
    { employeeId: employees[5].id, type: 'قرارداد', title: 'قرارداد پیمانی کارشناس فروش', startDate: '1404/04/15', endDate: '1405/04/15', amount: 22000000, department: 'فروش و بازاریابی', contractNumber: 'C-1404/023', status: 'active' },
    { employeeId: employees[6].id, type: 'قرارداد', title: 'قرارداد کارگری اپراتور تولید', startDate: '1404/07/01', endDate: '1405/07/01', amount: 16000000, department: 'تولید', contractNumber: 'C-1404/030', status: 'active' },
    { employeeId: employees[7].id, type: 'قرارداد', title: 'قرارداد تکنسین شبکه', startDate: '1403/02/10', endDate: '1405/02/10', amount: 28000000, department: 'فناوری اطلاعات', contractNumber: 'C-1403/008', status: 'active' },
    { employeeId: employees[8].id, type: 'قرارداد', title: 'قرارداد آزمایشی اپراتور تولید', startDate: '1402/01/15', endDate: '1402/04/15', amount: 14000000, department: 'تولید', contractNumber: 'C-1402/005', status: 'active' },
    { employeeId: employees[9].id, type: 'قرارداد', title: 'قرارداد کارشناس حقوق', startDate: '1404/06/01', endDate: '1405/06/01', amount: 24000000, department: 'منابع انسانی', contractNumber: 'C-1404/018', status: 'active' },
  ]

  for (const c of contractsData) {
    await prisma.contract.create({ data: c })
  }
  console.log(`✅ ${contractsData.length} قرارداد/حکم`)

  // ==== انتصاب‌ها ====
  const appointmentsData = [
    { employeeId: employees[0].id, positionId: positions[0].id, type: 'اصلی', startDate: '1395/01/15', status: 'active', decreeNumber: 'H-1395/001' },
    { employeeId: employees[1].id, positionId: positions[1].id, type: 'اصلی', startDate: '1398/06/01', status: 'active', decreeNumber: 'H-1398/015' },
    { employeeId: employees[2].id, positionId: positions[3].id, type: 'اصلی', startDate: '1397/03/10', status: 'active', decreeNumber: 'H-1397/008' },
    { employeeId: employees[3].id, positionId: positions[2].id, type: 'اصلی', startDate: '1396/09/20', status: 'active', decreeNumber: 'H-1396/012' },
    { employeeId: employees[4].id, positionId: positions[4].id, type: 'اصلی', startDate: '1399/01/01', status: 'active', decreeNumber: 'H-1399/003' },
    { employeeId: employees[5].id, positionId: positions[6].id, type: 'اصلی', startDate: '1400/04/15', status: 'active', decreeNumber: 'H-1400/023' },
    { employeeId: employees[6].id, positionId: positions[5].id, type: 'اصلی', startDate: '1401/07/01', status: 'active', decreeNumber: 'H-1401/030' },
    { employeeId: employees[7].id, positionId: positions[7].id, type: 'اصلی', startDate: '1400/02/10', status: 'active', decreeNumber: 'H-1400/008' },
    { employeeId: employees[9].id, positionId: positions[1].id, type: 'اصلی', startDate: '1401/06/01', status: 'active', decreeNumber: 'H-1401/018' },
  ]

  for (const a of appointmentsData) {
    await prisma.appointment.create({ data: a })
  }
  console.log(`✅ ${appointmentsData.length} انتصاب`)

  // ==== حضور و غیاب نمونه ====
  const today = '1405/01/15'
  const attendanceData = employees.map((emp, i) => ({
    employeeId: emp.id,
    date: today,
    checkIn: i % 3 === 0 ? '08:30' : i % 3 === 1 ? '08:05' : null,
    checkOut: i % 3 === 0 ? '17:15' : i % 3 === 1 ? '17:00' : null,
    status: i % 5 === 0 ? 'late' : i % 7 === 0 ? 'absent' : i % 3 === 2 ? 'leave' : 'present',
    workHours: i % 3 === 2 ? null : 8.5,
    shiftId: i < 4 ? morningShift.id : i < 6 ? flexShift.id : nightShift.id,
  }))

  for (const a of attendanceData) {
    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: a.employeeId, date: a.date } },
      update: {},
      create: a,
    })
  }
  console.log(`✅ ${attendanceData.length} رکورد حضور`)

  // ============================================
// تنظیمات حقوقی ۱۴۰۵ (دینامیک)
// ============================================

const YEAR = 1405

// ==== تنظیمات سیستمی ====
await prisma.payrollSetting.upsert({
  where: { year: YEAR },
  update: {},
  create: {
    year: YEAR,
    minDailyWage: 5541850,           // حداقل دستمزد روزانه (ریال)
    insuranceRate: 7,                 // نرخ بیمه سهم کارمند %
    employerInsRate: 23,              // نرخ بیمه سهم کارفرما %
    insuranceCeilingMultiplier: 7,    // ضریب سقف بیمه
    overtimeMultiplier: 1.4,          // ضریب اضافه‌کاری
    nightShiftMultiplier: 1.15,       // ضریب شب‌کاری نوبتی
    mixedNightMultiplier: 1.35,       // ضریب شب‌کاری مختلط
    fridayWorkMultiplier: 1.4,        // ضریب جمعه‌کاری
    holidayWorkMultiplier: 1.4,       // ضریب تعطیل‌کاری
    eidiMinDays: 60,                  // حداقل روز عیدی
    eidiMaxDays: 90,                  // حداکثر روز عیدی
    taxExemptAmount: 3333333,        // معافیت مالیاتی ماهانه (تومان)
    workHoursPerDay: 8,
    workDaysPerMonth: 30,
    // ✅ اضافه کردن سنوات
    sanavatRate: 3,                   // نرخ سنوات (۳٪)
    sanavatMaxYears: 30,              // حداکثر سال سابقه مشمول
  },
})
console.log('✅ تنظیمات حقوقی ۱۴۰۵')

  // ==== آیتم‌های حقوقی (مزایا) ====
  // ⚠️ کدها (code) بین seed.ts و API seed route باید یکسان باشند
  const allowanceItems = [
    { title: 'حق مسکن', code: 'HOUSING', category: 'allowance', calculationType: 'fixed', value: 30000000, isInsurable: false, isTaxable: true, isEditable: true, isSystem: false, sortOrder: 1, year: YEAR, description: 'حق مسکن ماهانه ۱۴۰۵' },
    { title: 'بن خواربار', code: 'FOOD', category: 'allowance', calculationType: 'fixed', value: 22000000, isInsurable: false, isTaxable: true, isEditable: true, isSystem: false, sortOrder: 2, year: YEAR, description: 'بن خواربار کارگری ۱۴۰۵ — غیرمشمول بیمه' },
    { title: 'حق اولاد', code: 'CHILD_ALLOWANCE', category: 'allowance', calculationType: 'formula', value: 16625550, isInsurable: false, isTaxable: true, isEditable: true, isSystem: false, sortOrder: 3, year: YEAR, description: 'حق اولاد = مبلغ هر فرزند × تعداد فرزندان (فقط متأهل) — سال ۱۴۰۵' },
    { title: 'حق عائله‌مندی', code: 'MARITAL_ALLOWANCE', category: 'allowance', calculationType: 'fixed', value: 5000000, isInsurable: false, isTaxable: true, isEditable: true, isSystem: false, sortOrder: 4, year: YEAR, description: 'حق عائله‌مندی (حق تأهل) ۱۴۰۵ — غیرمشمول بیمه' },
    { title: 'اضافه‌کاری', code: 'OVERTIME', category: 'allowance', calculationType: 'formula', value: 0, isInsurable: true, isTaxable: true, isEditable: false, isSystem: true, sortOrder: 5, year: YEAR, description: 'اضافه‌کاری = ساعتی حقوق پایه × ضریب اضافه‌کاری × ساعات اضافه‌کاری' },
    { title: 'شب‌کاری نوبتی', code: 'NIGHT_SHIFT', category: 'allowance', calculationType: 'formula', value: 0, isInsurable: true, isTaxable: true, isEditable: false, isSystem: true, sortOrder: 6, year: YEAR, description: 'شب‌کاری = ساعتی حقوق پایه × ضریب شب‌کاری × ساعات شب‌کاری' },
    { title: 'شب‌کاری مختلط', code: 'MIXED_NIGHT_SHIFT', category: 'allowance', calculationType: 'formula', value: 0, isInsurable: true, isTaxable: true, isEditable: false, isSystem: true, sortOrder: 7, year: YEAR, description: 'ضریب ۳۵% اضافه بر مزد ساعتی' },
    { title: 'جمعه‌کاری', code: 'FRIDAY_WORK', category: 'allowance', calculationType: 'formula', value: 0, isInsurable: true, isTaxable: true, isEditable: false, isSystem: true, sortOrder: 8, year: YEAR, description: 'جمعه‌کاری = ساعتی حقوق پایه × ضریب جمعه‌کاری × ساعات جمعه‌کاری' },
    { title: 'تعطیل‌کاری', code: 'HOLIDAY_WORK', category: 'allowance', calculationType: 'formula', value: 0, isInsurable: true, isTaxable: true, isEditable: false, isSystem: true, sortOrder: 9, year: YEAR, description: 'تعطیل‌کاری = ساعتی حقوق پایه × ضریب تعطیل‌کاری × ساعات تعطیل‌کاری' },
    { title: 'حق مأموریت', code: 'MISSION_ALLOWANCE', category: 'allowance', calculationType: 'formula', value: 0, isInsurable: false, isTaxable: true, isEditable: true, isSystem: false, sortOrder: 10, year: YEAR, description: 'حق ماموریت = حقوق روزانه × روزهای ماموریت تأییدشده' },
    { title: 'سنوات', code: 'SANAVAT', category: 'allowance', calculationType: 'formula', value: 0, isInsurable: false, isTaxable: true, isEditable: false, isSystem: true, sortOrder: 11, year: YEAR, description: 'سنوات = نرخ سنوات × حقوق پایه × سال سابقه کار' },
    { title: 'عیدی', code: 'EIDI', category: 'allowance', calculationType: 'formula', value: 0, isInsurable: false, isTaxable: true, isEditable: false, isSystem: true, sortOrder: 12, year: YEAR, description: 'عیدی = حقوق پایه × روزهای عیدی (بین حداقل و حداکثر)' },
    { title: 'پاداش عملکرد', code: 'PERFORMANCE_BONUS', category: 'allowance', calculationType: 'formula', value: 0, isInsurable: false, isTaxable: true, isEditable: true, isSystem: false, sortOrder: 13, year: YEAR, description: 'پاداش عملکرد = نمره ارزیابی × مبلغ پایه' },
  ]

  // ==== آیتم‌های حقوقی (کسورات) ====
  const deductionItems = [
    { title: 'بیمه تأمین اجتماعی (سهم کارمند)', code: 'INSURANCE_EMPLOYEE', category: 'deduction', calculationType: 'formula', value: 0, isInsurable: false, isTaxable: false, isEditable: false, isSystem: true, sortOrder: 1, year: YEAR, description: 'بیمه سهم کارمند = نرخ بیمه × مبلغ مشمول بیمه (با سقف)' },
    { title: 'مالیات بر درآمد حقوق', code: 'TAX', category: 'deduction', calculationType: 'formula', value: 0, isInsurable: false, isTaxable: false, isEditable: false, isSystem: true, sortOrder: 2, year: YEAR, description: 'مالیات تصاعدی بر اساس پله‌های مالیاتی' },
    { title: 'کسر مرخصی بدون حقوق', code: 'UNPAID_LEAVE', category: 'deduction', calculationType: 'formula', value: 0, isInsurable: false, isTaxable: false, isEditable: false, isSystem: true, sortOrder: 3, year: YEAR, description: 'کسر روزهای بدون حقوق = حقوق روزانه × تعداد روزها' },
    { title: 'قسط وام', code: 'LOAN_INSTALLMENT', category: 'deduction', calculationType: 'formula', value: 0, isInsurable: false, isTaxable: false, isEditable: true, isSystem: false, sortOrder: 4, year: YEAR, description: 'قسط وام/مساعده فعال = مبلغ وام / تعداد اقساط' },
  ]

  for (const item of [...allowanceItems, ...deductionItems]) {
    await prisma.payrollItem.upsert({
      where: { code: item.code },
      update: { ...item, year: YEAR },
      create: item,
    })
  }
  console.log(`✅ ${allowanceItems.length + deductionItems.length} آیتم حقوقی دینامیک`)

  // ==== فرمول‌های محاسباتی سیستمی ====
  // مپینگ کد آیتم حقوقی → کد فرمول (استاندارد شده — یکسان با API seed)
  const itemCodeToFormulaCode: Record<string, string> = {
    CHILD_ALLOWANCE: 'family_per_child',
    OVERTIME: 'overtime_hours',
    NIGHT_SHIFT: 'night_shift_hours',
    MIXED_NIGHT_SHIFT: 'mixed_night_hours',
    FRIDAY_WORK: 'friday_work_hours',
    HOLIDAY_WORK: 'holiday_hours',
    MISSION_ALLOWANCE: 'mission_days',
    INSURANCE_EMPLOYEE: 'insurance_employee',
    TAX: 'tax_progressive',
    UNPAID_LEAVE: 'unpaid_leave_days',
    LOAN_INSTALLMENT: 'loan_installment',
    SANAVAT: 'sanavat',
    EIDI: 'eidi',
    PERFORMANCE_BONUS: 'performance_bonus',
  }

  const createdFormulas: Record<string, string> = {} // formulaCode → formulaId

  for (const def of SYSTEM_FORMULAS) {
    const existing = await prisma.salaryFormula.findFirst({
      where: { code: def.code, year: YEAR },
    })
    if (existing) {
      createdFormulas[def.code] = existing.id
      continue
    }
    const formula = await prisma.salaryFormula.create({
      data: {
        code: def.code,
        name: def.name,
        description: def.description,
        expression: def.expression,
        year: YEAR,
        isActive: true,
        variables: {
          create: def.variables.map(v => ({
            varName: v.varName,
            sourceType: v.sourceType,
            sourceId: v.sourceId,
            label: v.label,
          })),
        },
      },
    })
    createdFormulas[def.code] = formula.id
  }
  console.log(`✅ ${Object.keys(createdFormulas).length} فرمول محاسباتی`)

  // ==== اتصال آیتم‌های حقوقی به فرمول‌ها از طریق formulaId ====
  let linkedCount = 0
  for (const [itemCode, formulaCode] of Object.entries(itemCodeToFormulaCode)) {
    const formulaId = createdFormulas[formulaCode]
    if (!formulaId) continue
    const result = await prisma.payrollItem.updateMany({
      where: { code: itemCode, year: YEAR },
      data: { formulaId },
    })
    linkedCount += result.count
  }
  console.log(`✅ ${linkedCount} اتصال فرمول ↔ آیتم حقوقی`)

  // ==== پله‌های مالیاتی ۱۴۰۵ (سالانه — یکسان با API seed) ====
  const taxBrackets = [
    { year: YEAR, orderNum: 1, minAmount: 0, maxAmount: 40000000, rate: 0 },
    { year: YEAR, orderNum: 2, minAmount: 40000000, maxAmount: 100000000, rate: 10 },
    { year: YEAR, orderNum: 3, minAmount: 100000000, maxAmount: 200000000, rate: 15 },
    { year: YEAR, orderNum: 4, minAmount: 200000000, maxAmount: 400000000, rate: 20 },
    { year: YEAR, orderNum: 5, minAmount: 400000000, maxAmount: 0, rate: 30 },
  ]

  for (const tb of taxBrackets) {
    await prisma.taxBracket.upsert({
      where: { year_orderNum: { year: tb.year, orderNum: tb.orderNum } },
      update: {},
      create: tb,
    })
  }
  console.log(`✅ ${taxBrackets.length} پله مالیاتی`)

  // ==== فیش حقوقی نمونه (با آیتم‌های دینامیک) ====
  const settings = await prisma.payrollSetting.findUnique({ where: { year: YEAR } })!
  const activeItems = await prisma.payrollItem.findMany({ where: { year: YEAR, isActive: true }, orderBy: { sortOrder: 'asc' } })

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    const baseSalary = [55000000, 28000000, 45000000, 60000000, 42000000, 22000000, 16000000, 28000000, 14000000, 24000000][i] || 20000000

    // محاسبه آیتم‌های مزایا
    const slipItems: { title: string; category: string; amount: number; payrollItemId: string | null; sortOrder: number }[] = []
    let totalAllowances = 0
    let totalDeductions = 0
    let insurableAmount = baseSalary // حقوق پایه همیشه مشمول بیمه

    for (const item of activeItems) {
      let amount = 0

      if (item.category === 'allowance') {
        if (item.calculationType === 'fixed') {
          amount = item.value
        } else if (item.calculationType === 'formula' && item.formulaId) {
          // آیتم‌های فرمولی — از موتور فرمول دینامیک محاسبه می‌شوند
          // در seed فقط حق اولاد محاسبه ساده می‌کنیم
          const linkedFormula = Object.entries(itemCodeToFormulaCode).find(([code]) => code === item.code)
          if (linkedFormula && linkedFormula[1] === 'family_per_child') {
            amount = emp.maritalStatus === 'married' ? (emp.childrenCount || 0) * item.value : 0
          } else {
            amount = 0 // بقیه فرمول‌ها از حضور و غیاب / موتور فرمول محاسبه می‌شوند
          }
        } else if (item.calculationType === 'formula') {
          amount = 0 // آیتم فرمولی بدون formulaId — از موتور فرمول محاسبه می‌شود
        }
        if (amount > 0) {
          totalAllowances += amount
          if (item.isInsurable) insurableAmount += amount
          slipItems.push({ title: item.title, category: 'allowance', amount, payrollItemId: item.id, sortOrder: item.sortOrder })
        }
      }
    }

    // محاسبه بیمه
    const insuranceRate = settings?.insuranceRate || 7
    const ceilingDaily = (settings?.minDailyWage || 5541850) * (settings?.insuranceCeilingMultiplier || 7)
    const ceilingMonthly = ceilingDaily * 30
    const insurableCapped = Math.min(insurableAmount, ceilingMonthly)
    const insuranceAmount = Math.round(insurableCapped * insuranceRate / 100)

    // حقوق مشمول مالیات = حقوق ناخالص - بیمه
    const grossSalary = baseSalary + totalAllowances
    const taxableIncome = grossSalary - insuranceAmount

    // محاسبه مالیات پلکانی
    const brackets = await prisma.taxBracket.findMany({ where: { year: YEAR }, orderBy: { orderNum: 'asc' } })
    let taxAmount = 0
    let remaining = taxableIncome
    for (const bracket of brackets) {
      const bracketMax = bracket.maxAmount > 0 ? bracket.maxAmount : Infinity
      const bracketWidth = bracketMax - bracket.minAmount
      if (remaining <= 0) break
      const taxableInBracket = Math.min(remaining, bracketWidth)
      taxAmount += Math.round(taxableInBracket * bracket.rate / 100)
      remaining -= taxableInBracket
    }

    totalDeductions = insuranceAmount + taxAmount

    // افزودن آیتم‌های کسورات
    const insuranceItem = activeItems.find(it => it.code === 'INSURANCE_EMPLOYEE')
    if (insuranceItem && insuranceAmount > 0) {
      slipItems.push({ title: insuranceItem.title, category: 'deduction', amount: insuranceAmount, payrollItemId: insuranceItem.id, sortOrder: insuranceItem.sortOrder })
    }
    const taxItem = activeItems.find(it => it.code === 'TAX')
    if (taxItem && taxAmount > 0) {
      slipItems.push({ title: taxItem.title, category: 'deduction', amount: taxAmount, payrollItemId: taxItem.id, sortOrder: taxItem.sortOrder })
    }

    const netSalary = grossSalary - totalDeductions

    await prisma.paySlip.upsert({
      where: { employeeId_year_month: { employeeId: emp.id, year: YEAR, month: 1 } },
      update: {},
      create: {
        employeeId: emp.id,
        year: YEAR,
        month: 1,
        baseSalary,
        totalAllowances,
        totalDeductions,
        grossSalary,
        netSalary,
        workDays: 30,
        overtimeHours: 0,
        status: i < 3 ? 'paid' : i < 6 ? 'confirmed' : 'draft',
        items: {
          create: slipItems,
        },
      },
    })
  }
  console.log(`✅ ${employees.length} فیش حقوقی دینامیک`)

  console.log('🎉 seed با موفقیت تمام شد!')
}

main()
  .catch((e) => {
    console.error('❌ خطا در seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
