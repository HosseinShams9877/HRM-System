import { z } from 'zod'
// ---- Training Validation ----
export const trainingCreateSchema = z.object({
    title: z.string().min(2, 'عنوان دوره الزامی است'),
    instructor: z.string().optional(),
    startDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر').optional().or(z.literal('')),
    endDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ شمسی نامعتبر').optional().or(z.literal('')),
    capacity: z.coerce.number().int().min(1, 'ظرفیت باید حداقل ۱ نفر باشد').optional(),
    description: z.string().optional(),
  })