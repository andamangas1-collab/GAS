// ============================================================
// GAS™ MVP — Product Validation Schemas (Zod)
// ============================================================

import { z } from "zod"

export const productRawSchema = z.object({
  name: z.string().min(2, "Product name is required").max(255).trim(),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000).trim(),
  category: z.string().min(1, "Category is required").max(100).trim(),
  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(999999.99, "Price is too high"),
  imageUrl: z.string().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "EXPIRED"]).default("DRAFT"),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  commissionType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  commissionValue: z.coerce
    .number()
    .positive("Commission must be greater than 0"),
})

export const createProductSchema = productRawSchema
  .refine((data) => {
    if (data.commissionType === "PERCENTAGE" && data.commissionValue > 100) {
      return false
    }
    return true
  }, {
    message: "Percentage commission cannot exceed 100%",
    path: ["commissionValue"],
  })
  .refine((data) => {
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate
    }
    return true
  }, {
    message: "End date must be after start date",
    path: ["endDate"],
  })

export const updateProductSchema = productRawSchema.partial().refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate
  }
  return true
}, {
  message: "End date must be after start date",
  path: ["endDate"],
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
