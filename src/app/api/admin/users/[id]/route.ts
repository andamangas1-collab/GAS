import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateUserSchema = z.object({
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED", "BLOCKED"]).optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  adminNote: z.string().optional(),
})

// PATCH /api/admin/users/[id] - Update user account status or role
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const { id } = params
    const body = await req.json()
    const validated = updateUserSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Protection: Admins cannot modify own account status to prevent lockout
    if (session.user.id === id && validated.data.status && validated.data.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot suspend or block your own active administrative account" },
        { status: 400 }
      )
    }

    // Role modification requires SUPER_ADMIN
    if (validated.data.role && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only Super Administrators can modify user roles" },
        { status: 403 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.user.update({
        where: { id },
        data: {
          status: validated.data.status || undefined,
          role: validated.data.role || undefined,
        },
      })

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_USER_STATUS",
          resource: "User",
          resourceId: targetUser.id,
          oldValues: {
            status: targetUser.status,
            role: targetUser.role,
          },
          newValues: {
            status: validated.data.status || targetUser.status,
            role: validated.data.role || targetUser.role,
            adminNote: validated.data.adminNote,
          },
        },
      })

      return res
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error("[API_ADMIN_USER_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
