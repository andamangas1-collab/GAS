// ============================================================
// GAS™ MVP — User / Profile Validation Schemas (Zod)
// ============================================================

import { z } from "zod"

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50)
    .trim(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50)
    .trim(),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
})

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED", "BLOCKED"]),
  reason: z.string().max(500).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>
