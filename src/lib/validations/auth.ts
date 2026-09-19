// ============================================================
// GAS™ MVP — Auth Validation Schemas (Zod)
// ============================================================

import { z } from "zod"

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name is too long")
    .trim(),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long")
    .toLowerCase()
    .trim(),
  password: passwordSchema,
  confirmPassword: z.string(),
  referralCode: z
    .string()
    .regex(/^GAS-[A-Z0-9]{6}$/, "Invalid referral code format (e.g. GAS-ABC123)")
    .optional()
    .or(z.literal("")),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
