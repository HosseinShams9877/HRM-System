import { z } from 'zod'

// ---- Leave Validation ----
export const leaveCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  type: z.string().min(1, 'نوع مرخصی الزامی است'),
  startDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر'),
  endDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر'),
  totalDays: z.number().int().positive('تعداد روز باید مثبت باشد'),
  reason: z.string().optional(),
})

// ---- Mission Validation ----
export const missionCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  title: z.string().min(2, 'عنوان ماموریت الزامی است'),
  destination: z.string().optional(),
  startDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر'),
  endDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر'),
  totalDays: z.number().int().positive('تعداد روز باید مثبت باشد'),
})

// ---- Login Validation ----
export const loginSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(4, 'رمز عبور باید حداقل ۴ کاراکتر باشد'),
})

// ---- Contract Validation ----
export const contractCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  type: z.enum(['official', 'contractual', 'probation', 'temporary'], { errorMap: () => ({ message: 'نوع قرارداد نامعتبر است' }) }),
  startDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر'),
  endDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر').optional().or(z.literal('')),
  amount: z.coerce.number().min(0, 'مبلغ باید مثبت باشد').optional(),
  status: z.enum(['active', 'expired', 'terminated', 'draft']).default('active'),
  description: z.string().optional(),
})

// ---- Attendance Validation ----
export const attendanceCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  date: z.string().min(1, 'تاریخ الزامی است'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'mission', 'leave', 'early_leave']).optional().default('present'),
})



// ---- Loan Validation ----
export const loanCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  type: z.string().min(1, 'نوع وام الزامی است'),
  amount: z.coerce.number().positive('مبلغ وام باید مثبت باشد'),
  installments: z.coerce.number().int().min(1, 'تعداد اقساط باید حداقل ۱ باشد'),
  reason: z.string().optional(),
})

// ---- Reward Validation ----
export const rewardCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  type: z.string().min(1, 'نوع پاداش الزامی است'),
  title: z.string().min(2, 'عنوان پاداش الزامی است'),
  amount: z.coerce.number().min(0, 'مبلغ باید مثبت باشد').optional(),
  reason: z.string().optional(),
})

// ---- Appointment Validation ----
export const appointmentCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  positionId: z.string().min(1, 'انتخاب پست الزامی است'),
  type: z.enum(['primary', 'concurrent', 'acting'], { errorMap: () => ({ message: 'نوع حکم نامعتبر است' }) }),
  decreeNumber: z.string().optional(),
  decreeDate: z.string().optional(),
  startDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر').optional().or(z.literal('')),
  endDate: z.string().optional(),
})

// ---- Position Validation ----
export const positionCreateSchema = z.object({
  title: z.string().min(2, 'عنوان پست الزامی است'),
  code: z.string().min(1, 'کد پست الزامی است'),
  departmentId: z.string().optional(),
  headcount: z.coerce.number().int().min(1, 'تعداد نفرات باید حداقل ۱ باشد').optional(),
  minSalary: z.coerce.number().min(0).optional(),
  maxSalary: z.coerce.number().min(0).optional(),
})

// ---- Department Validation ----
export const departmentCreateSchema = z.object({
  name: z.string().min(2, 'نام دپارتمان الزامی است'),
  code: z.string().min(1, 'کد دپارتمان الزامی است'),
  managerId: z.string().optional(),
  parentId: z.string().optional(),
})

// ---- Holiday Validation ----
export const holidayCreateSchema = z.object({
  title: z.string().min(2, 'عنوان تعطیلی الزامی است'),
  date: z.string().min(1, 'تاریخ الزامی است'),
  type: z.enum(['national', 'religious', 'organizational']).optional(),
  isRecurring: z.boolean().optional(),
})

// ---- Recruitment Validation ----
export const recruitmentCreateSchema = z.object({
  title: z.string().min(2, 'عنوان موقعیت الزامی است'),
  department: z.string().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  deadline: z.string().optional(),
})


// ---- Regulation Validation ----
export const regulationCreateSchema = z.object({
  title: z.string().min(2, 'عنوان آیین‌نامه الزامی است'),
  content: z.string().min(5, 'محتوای آیین‌نامه الزامی است'),
  category: z.string().optional(),
  version: z.string().optional(),
})

// ---- Onboarding Validation ----
export const onboardingCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  tasks: z.string().optional(), // JSON string
  notes: z.string().optional(),
})

// ---- Offboarding Validation ----
export const offboardingCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  reason: z.string().min(2, 'دلیل ترک کار الزامی است'),
  lastDay: z.string().optional(),
  tasks: z.string().optional(), // JSON string
  notes: z.string().optional(),
})

// ---- Shift Assignment Validation ----
export const shiftAssignmentCreateSchema = z.object({
  employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
  shiftId: z.string().min(1, 'انتخاب شیفت الزامی است'),
  startDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر'),
  endDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر').optional().or(z.literal('')),
})

// ---- Helper to validate with Zod and return formatted errors ----
export function validateWithZod<T>(schema: z.ZodType<T>, data: unknown): 
  { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors: Record<string, string> = {}
  const errorIssues = result.error.issues || result.error.errors || []
  errorIssues.forEach(err => {
    const field = err.path.join('.')
    if (!errors[field]) {
      errors[field] = err.message
    }
  })
  
  return { success: false, errors }
}
