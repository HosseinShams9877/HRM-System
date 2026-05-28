
// ---- Announcement Validation ----
export const announcementCreateSchema = z.object({
    title: z.string().min(2, 'عنوان اطلاعیه الزامی است'),
    content: z.string().min(5, 'محتوای اطلاعیه الزامی است'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    targetAudience: z.string().optional(),
    category: z.string().optional(),
  })