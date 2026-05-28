import { z } from 'zod'


// ---- Performance Validation ----
export const performanceCreateSchema = z.object({
    employeeId: z.string().min(1, 'انتخاب کارمند الزامی است'),
    period: z.string().min(1, 'دوره ارزیابی الزامی است'),
    score: z.coerce.number().min(0).max(100, 'نمره باید بین ۰ تا ۱۰۰ باشد'),
    kpis: z.string().optional(), // JSON string
    notes: z.string().optional(),
  })
  