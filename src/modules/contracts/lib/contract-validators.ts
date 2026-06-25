import { z } from 'zod'

export const contractCreateSchema = z.object({
  employeeId: z.string().min(1),
  type: z.enum(['official', 'contractual', 'probation', 'temporary']),
  startDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/),
  endDate: z.string().optional().nullable(),
  amount: z.coerce.number().min(0).optional(),
  status: z.enum(['active', 'expired', 'terminated', 'draft']).default('draft'),
  content: z.string().optional(),
  variables: z.record(z.any()).optional(),
})