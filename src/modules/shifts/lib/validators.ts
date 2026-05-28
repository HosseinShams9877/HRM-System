import { z } from 'zod'
// ---- Shift Validation ----
export const shiftCreateSchema = z.object({
    name: z.string().min(2, 'نام شیفت الزامی است'),
    code: z.string().min(1, 'کد شیفت الزامی است'),
    color: z.string().optional(),
  })
  