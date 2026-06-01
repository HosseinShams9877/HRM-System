import { z } from 'zod'
// ---- Employee Validation ----
export const employeeCreateSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  nationalCode: z.string().regex(/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد'),
  personnelCode: z.string().min(1, 'کد پرسنلی الزامی است'),
  email: z.string().email('ایمیل نامعتبر است').optional().or(z.literal('')),
  phone: z.string().regex(/^09\d{9}$/, 'شماره تلفن نامعتبر است').optional().or(z.literal('')),
  birthDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی: 1370/05/12').optional().or(z.literal('')),
  birthPlace: z.string().optional(),
  fatherName: z.string().optional(),
  gender: z.enum(['male', 'female']).optional().or(z.literal('')),
  birthCertificateNo: z.string().optional(),
  issuePlace: z.string().optional(),        
  secondaryPhone: z.string().optional(),   
  contractMonths: z.coerce.number().int().min(0).optional(),
  maritalStatus: z.enum(['single', 'married']).optional().or(z.literal('')),
  marriageDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/).optional().or(z.literal('')),
  childrenCount: z.coerce.number().int().min(0).default(0),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional().or(z.literal('')),
  medicalInfo: z.string().optional(),
  address: z.string().optional(),
  homePhone: z.string().optional(),
  education: z.enum(['دیپلم', 'کاردانی', 'کارشناسی', 'کارشناسی ارشد', 'دکتری']).optional().or(z.literal('')),
  fieldOfStudy: z.string().optional(),
  university: z.string().optional(),
  militaryStatus: z.enum(['done', 'exempt', 'deferred']).optional().or(z.literal('')),
  hireDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی: 1400/01/01'),
  status: z.enum(['active', 'inactive', 'suspended', 'probation']).default('active'),
  contractType: z.enum(['official', 'contractual', 'probation', 'temporary']).optional().or(z.literal('')),
  probationEnd: z.string().optional(),
  postalCode: z.string().optional().or(z.literal('')),
  position: z.string().optional(),
  department: z.string().optional(),
  jobGrade: z.string().optional(),
  
  workLocation: z.string().optional(),
  accessCardNo: z.string().optional(),
  userRole: z.enum(['admin', 'hr_manager', 'department_manager', 'employee']).default('employee'),
})
  
  export const employeeUpdateSchema = employeeCreateSchema.partial().extend({
    id: z.string(),
  })
  