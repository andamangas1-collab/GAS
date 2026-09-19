import { prisma } from "@/lib/prisma"
import { CommissionStatus, CommissionType, Prisma } from "@prisma/client"

export interface CommissionCalculationResult {
  amount: number
  ruleId: string | null
  ruleName: string
  ruleType: CommissionType
  ruleValue: number
  validationDays: number
  isEligible: boolean
  ineligibilityReason?: string
}

export interface CalculateCommissionInput {
  orderAmount: number
  productId?: string
  campaignId?: string
  tx?: Prisma.TransactionClient
}

export interface QualifyCommissionInput {
  orderId: string
  referralId: string
  referrerId: string
  buyerId: string
  orderAmount: number
  productId?: string
  campaignId?: string
  tx?: Prisma.TransactionClient
}

export interface ApproveCommissionInput {
  commissionId: string
  adminId: string
  adminNote?: string
  tx?: Prisma.TransactionClient
}

export interface RejectCommissionInput {
  commissionId: string
  adminId: string
  reason: string
  adminNote?: string
  tx?: Prisma.TransactionClient
}

export interface CancelCommissionInput {
  commissionId: string
  adminId?: string
  reason: string
  tx?: Prisma.TransactionClient
}

export interface MarkCommissionPaidInput {
  commissionId: string
  adminId: string
  payoutReference?: string
  adminNote?: string
  tx?: Prisma.TransactionClient
}

export interface HandleRefundInput {
  orderId: string
  adminId?: string
  reason?: string
  tx?: Prisma.TransactionClient
}

export class CommissionService {
  /**
   * 1. calculateCommission()
   * Resolves hierarchy: Product Rule -> Campaign Rule -> Global Fallback Rule.
   * Enforces minimum order amount thresholds.
   */
  async calculateCommission(
    input: CalculateCommissionInput
  ): Promise<CommissionCalculationResult> {
    const client = input.tx || prisma
    const { orderAmount, productId, campaignId } = input

    let selectedRule = null

    // 1. Check Product-Specific Active Rule
    if (productId) {
      selectedRule = await client.commissionRule.findFirst({
        where: { productId, isActive: true },
        orderBy: { createdAt: "desc" },
      })
    }

    // 2. Fallback to Campaign-Specific Active Rule
    if (!selectedRule && campaignId) {
      selectedRule = await client.commissionRule.findFirst({
        where: { campaignId, isActive: true },
        orderBy: { createdAt: "desc" },
      })
    }

    // 3. Fallback to Global Active Rule (where productId is null and campaignId is null)
    if (!selectedRule) {
      selectedRule = await client.commissionRule.findFirst({
        where: { productId: null, campaignId: null, isActive: true },
        orderBy: { createdAt: "desc" },
      })
    }

    // Fallback default: 10% Percentage rule if no database rule exists
    const ruleType = selectedRule ? selectedRule.type : CommissionType.PERCENTAGE
    const ruleValue = selectedRule ? Number(selectedRule.value) : 10.0
    const ruleName = selectedRule ? selectedRule.name : "Default Platform Commission (10%)"
    const ruleId = selectedRule ? selectedRule.id : null
    const validationDays = selectedRule ? selectedRule.validationDays : 30
    const minOrderAmount = selectedRule?.minOrderAmount ? Number(selectedRule.minOrderAmount) : null

    // Check minimum order amount requirement
    if (minOrderAmount !== null && orderAmount < minOrderAmount) {
      return {
        amount: 0,
        ruleId,
        ruleName,
        ruleType,
        ruleValue,
        validationDays,
        isEligible: false,
        ineligibilityReason: `Order total (₹${orderAmount}) is below minimum requirement of ₹${minOrderAmount}`,
      }
    }

    // Calculate amount
    let calculatedAmount = 0
    if (ruleType === CommissionType.PERCENTAGE) {
      calculatedAmount = (orderAmount * ruleValue) / 100
    } else {
      // FIXED commission
      calculatedAmount = ruleValue
    }

    // Round to 2 decimal places
    const finalAmount = Math.round(calculatedAmount * 100) / 100

    return {
      amount: finalAmount,
      ruleId,
      ruleName,
      ruleType,
      ruleValue,
      validationDays,
      isEligible: true,
    }
  }

  /**
   * 2. qualifyCommission()
   * Evaluates order qualification, prevents duplicates, checks anti-self-referral,
   * creates PENDING commission record and logs audit trail.
   */
  async qualifyCommission(input: QualifyCommissionInput) {
    const client = input.tx || prisma

    // 1. Anti-Self-Referral Enforcement
    if (input.referrerId === input.buyerId) {
      // Flag referral as rejected self-referral
      await client.referral.update({
        where: { id: input.referralId },
        data: {
          status: "REJECTED",
          isSelfReferral: true,
          isFlagged: true,
          flagReason: "Self-referral commission qualification rejected",
        },
      })
      throw new Error("Self-referral detected: commission qualification rejected")
    }

    // 2. Prevent Duplicate Commission Creation
    const existingCommission = await client.commission.findFirst({
      where: {
        orderId: input.orderId,
        referralId: input.referralId,
      },
    })

    if (existingCommission) {
      return {
        isDuplicate: true,
        commission: existingCommission,
        message: "Commission record already exists for this order and referral",
      }
    }

    // 3. Calculate Commission
    const calc = await this.calculateCommission({
      orderAmount: input.orderAmount,
      productId: input.productId,
      campaignId: input.campaignId,
      tx: client,
    })

    if (!calc.isEligible || calc.amount <= 0) {
      return {
        isDuplicate: false,
        commission: null,
        message: calc.ineligibilityReason || "Commission calculated to zero",
      }
    }

    // 4. Create Commission with PENDING status
    const commission = await client.commission.create({
      data: {
        userId: input.referrerId,
        referralId: input.referralId,
        orderId: input.orderId,
        amount: calc.amount,
        status: CommissionStatus.PENDING,
        adminNote: `Generated by ${calc.ruleName} (${calc.ruleType} ${calc.ruleValue}) - Validation lock: ${calc.validationDays} days`,
      },
    })

    // 5. Transition Referral status to QUALIFIED
    await client.referral.update({
      where: { id: input.referralId },
      data: {
        status: "QUALIFIED",
        purchasedAt: new Date(),
        qualifiedAt: new Date(),
        orderId: input.orderId,
      },
    })

    // 6. Award +20 Recognition Points to Referrer
    await client.recognitionPoint.create({
      data: {
        userId: input.referrerId,
        points: 20,
        action: "REFERRAL_SUCCESSFUL",
        referenceId: input.referralId,
        note: `Points awarded for qualifying referral order #${input.orderId.slice(-6)}`,
      },
    })

    // 7. Dispatch in-app notification
    await client.notification.create({
      data: {
        userId: input.referrerId,
        type: "COMMISSION_PENDING",
        title: "Commission Pending Validation!",
        message: `You earned ₹${calc.amount.toFixed(2)} in commission for Order #${input.orderId.slice(-6)}. It is currently in the validation period.`,
        data: {
          orderId: input.orderId,
          amount: calc.amount,
          commissionId: commission.id,
        },
      },
    })

    // 8. Write immutable audit log
    await client.auditLog.create({
      data: {
        userId: input.referrerId,
        action: "COMMISSION_QUALIFIED",
        resource: "Commission",
        resourceId: commission.id,
        newValues: {
          amount: calc.amount,
          orderId: input.orderId,
          referralId: input.referralId,
          rule: calc.ruleName,
          status: CommissionStatus.PENDING,
        },
      },
    })

    return {
      isDuplicate: false,
      commission,
      calculation: calc,
    }
  }

  /**
   * 3. approveCommission()
   * Authorizes a pending commission after validation period. Transitions to APPROVED.
   */
  async approveCommission(input: ApproveCommissionInput) {
    const client = input.tx || prisma

    const commission = await client.commission.findUnique({
      where: { id: input.commissionId },
    })

    if (!commission) {
      throw new Error("Commission not found")
    }

    if (commission.status !== CommissionStatus.PENDING) {
      throw new Error(`Cannot approve commission with status: ${commission.status}`)
    }

    const updated = await client.commission.update({
      where: { id: input.commissionId },
      data: {
        status: CommissionStatus.APPROVED,
        approvedAt: new Date(),
        adminNote: input.adminNote || commission.adminNote,
      },
    })

    // Notify affiliate
    await client.notification.create({
      data: {
        userId: commission.userId,
        type: "COMMISSION_APPROVED",
        title: "Commission Approved!",
        message: `Your commission of ₹${commission.amount} for Order #${commission.orderId.slice(-6)} has been approved and is eligible for payout.`,
        data: { commissionId: commission.id, amount: Number(commission.amount) },
      },
    })

    // Log audit trail
    await client.auditLog.create({
      data: {
        userId: input.adminId,
        action: "APPROVE_COMMISSION",
        resource: "Commission",
        resourceId: commission.id,
        oldValues: { status: commission.status },
        newValues: { status: CommissionStatus.APPROVED, adminNote: input.adminNote },
      },
    })

    return updated
  }

  /**
   * 4. rejectCommission()
   * Rejects a commission due to policy or verification issue. Transitions to REJECTED.
   */
  async rejectCommission(input: RejectCommissionInput) {
    const client = input.tx || prisma

    const commission = await client.commission.findUnique({
      where: { id: input.commissionId },
    })

    if (!commission) {
      throw new Error("Commission not found")
    }

    if (commission.status === CommissionStatus.PAID) {
      throw new Error("Cannot reject an already disbursed commission")
    }

    const updated = await client.commission.update({
      where: { id: input.commissionId },
      data: {
        status: CommissionStatus.REJECTED,
        rejectedAt: new Date(),
        rejectReason: input.reason,
        adminNote: input.adminNote || commission.adminNote,
      },
    })

    // Log audit trail
    await client.auditLog.create({
      data: {
        userId: input.adminId,
        action: "REJECT_COMMISSION",
        resource: "Commission",
        resourceId: commission.id,
        oldValues: { status: commission.status },
        newValues: {
          status: CommissionStatus.REJECTED,
          rejectReason: input.reason,
          adminNote: input.adminNote,
        },
      },
    })

    return updated
  }

  /**
   * 5. cancelCommission()
   * Cancels commission when order is cancelled before fulfillment or during lock period.
   */
  async cancelCommission(input: CancelCommissionInput) {
    const client = input.tx || prisma

    const commission = await client.commission.findUnique({
      where: { id: input.commissionId },
    })

    if (!commission) {
      throw new Error("Commission not found")
    }

    if (commission.status === CommissionStatus.PAID) {
      throw new Error("Cannot cancel an already paid commission")
    }

    const updated = await client.commission.update({
      where: { id: input.commissionId },
      data: {
        status: CommissionStatus.CANCELLED,
        adminNote: `Cancelled: ${input.reason}`,
      },
    })

    // Log audit trail
    await client.auditLog.create({
      data: {
        userId: input.adminId || null,
        action: "CANCEL_COMMISSION",
        resource: "Commission",
        resourceId: commission.id,
        oldValues: { status: commission.status },
        newValues: { status: CommissionStatus.CANCELLED, reason: input.reason },
      },
    })

    return updated
  }

  /**
   * 6. markCommissionPaid()
   * Records payout disbursement reference and transitions status to PAID.
   */
  async markCommissionPaid(input: MarkCommissionPaidInput) {
    const client = input.tx || prisma

    const commission = await client.commission.findUnique({
      where: { id: input.commissionId },
    })

    if (!commission) {
      throw new Error("Commission not found")
    }

    if (commission.status !== CommissionStatus.APPROVED) {
      throw new Error(`Commission must be APPROVED before payout. Current status: ${commission.status}`)
    }

    const updated = await client.commission.update({
      where: { id: input.commissionId },
      data: {
        status: CommissionStatus.PAID,
        paidAt: new Date(),
        adminNote: input.payoutReference
          ? `Payout UTR/Ref: ${input.payoutReference}. ${input.adminNote || ""}`.trim()
          : input.adminNote || commission.adminNote,
      },
    })

    // Notify affiliate
    await client.notification.create({
      data: {
        userId: commission.userId,
        type: "COMMISSION_PAID",
        title: "Commission Payout Disbursed!",
        message: `Your payout of ₹${commission.amount} has been processed.`,
        data: {
          commissionId: commission.id,
          amount: Number(commission.amount),
          payoutReference: input.payoutReference,
        },
      },
    })

    // Log audit trail
    await client.auditLog.create({
      data: {
        userId: input.adminId,
        action: "DISBURSE_COMMISSION",
        resource: "Commission",
        resourceId: commission.id,
        oldValues: { status: CommissionStatus.APPROVED },
        newValues: {
          status: CommissionStatus.PAID,
          payoutReference: input.payoutReference,
          adminNote: input.adminNote,
        },
      },
    })

    return updated
  }

  /**
   * 7. handleRefund()
   * Automatically revokes / cancels commission when order is refunded.
   */
  async handleRefund(input: HandleRefundInput) {
    const client = input.tx || prisma

    const commissions = await client.commission.findMany({
      where: {
        orderId: input.orderId,
        status: { in: [CommissionStatus.PENDING, CommissionStatus.APPROVED] },
      },
    })

    const results = []
    for (const comm of commissions) {
      const res = await this.cancelCommission({
        commissionId: comm.id,
        adminId: input.adminId,
        reason: input.reason || "Order was refunded/returned",
        tx: client,
      })
      results.push(res)
    }

    return results
  }
}

export const commissionService = new CommissionService()
