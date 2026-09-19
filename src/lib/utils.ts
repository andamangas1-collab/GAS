// ============================================================
// GAS™ MVP — Shared Utilities
// ============================================================

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { randomBytes } from "crypto"

// ---- Tailwind class helper ---------------------------------
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---- Referral Code Generation ------------------------------
const REFERRAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

export function generateReferralCode(): string {
  const bytes = randomBytes(6)
  let suffix = ""
  for (let i = 0; i < bytes.length; i++) {
    suffix += REFERRAL_CHARS[bytes[i] % REFERRAL_CHARS.length]
  }
  return `GAS-${suffix}`
}

// ---- Slug Generation ---------------------------------------
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// ---- Pagination Helper -------------------------------------
export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit = 20
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? String(defaultLimit), 10)))
  return { page, limit, skip: (page - 1) * limit }
}

// ---- Currency Formatting -----------------------------------
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(num)
}

// ---- Date Formatting ----------------------------------------
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ---- String Helpers ----------------------------------------
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength - 3)}...`
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  const masked = local.length > 2
    ? `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}`
    : `${local[0]}*`
  return `${masked}@${domain}`
}

// ---- Validation Helpers ------------------------------------
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ""))
}

// ---- Object Helpers ----------------------------------------
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result as Omit<T, K>
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) result[key] = obj[key]
  }
  return result
}
