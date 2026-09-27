import { COOKIE_NAME } from "@shared/const";
import { attachRazorpayOrderId, createPendingOrder, getAdminDashboardData, getAllProducts,   getCustomerTransactionHistory,
  getOrderForTracking,
  getCodInvoice, getProductsByBusiness, markOrderPaid, regenerateTrackingToken, registerPushToken, updateAdminOrder, updateAdminProductInventory } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { createRazorpayOrder, verifyRazorpayPaymentSignature } from "./razorpay";
import { isExpoPushToken, sendOrderStatusNotification } from "./push";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const checkoutInput = z.object({
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive().max(99) })).min(1).max(100),
  customerName: z.string().trim().max(160).optional(),
  customerEmail: z.string().trim().email().max(320).optional(),
  customerPhone: z.string().trim().max(32).optional(),
  paymentMethod: z.enum(["razorpay", "cod"]).default("razorpay"),
});

const adminOrderInput = z.object({
  orderId: z.number().int().positive(),
  status: z.enum(["pending", "paid", "failed", "cancelled"]).optional(),
  fulfillmentStatus: z.enum(["pending", "processing", "packed", "shipped", "delivered", "cancelled"]).optional(),
  trackingNumber: z.string().trim().max(120).nullable().optional(),
  carrier: z.string().trim().max(80).nullable().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  products: router({
    all: publicProcedure.query(() => getAllProducts()),
    byBusiness: publicProcedure
      .input(z.object({ business: z.enum(["agri", "dairy"]) }))
      .query(({ input }) => getProductsByBusiness(input.business)),
  }),
  orders: router({
    createPending: publicProcedure.input(checkoutInput).mutation(({ input }) => createPendingOrder(input)),
    verifyPayment: publicProcedure.input(z.object({ localOrderId: z.number().int().positive(), razorpayOrderId: z.string().min(1), razorpayPaymentId: z.string().min(1), razorpaySignature: z.string().min(1) })).mutation(async ({ input }) => {
      if (!verifyRazorpayPaymentSignature({ orderId: input.razorpayOrderId, paymentId: input.razorpayPaymentId, signature: input.razorpaySignature })) throw new TRPCError({ code: "BAD_REQUEST", message: "Payment signature could not be verified" });
      const updated = await markOrderPaid(input.localOrderId, input.razorpayPaymentId);
      return { success: true as const, order: updated[0] };
    }),
    checkout: publicProcedure.input(checkoutInput).mutation(async ({ input }) => {
      const pending = await createPendingOrder(input);
      if (input.paymentMethod === "cod") {
        return { mode: "cod" as const, localOrderId: pending.orderId, amountInr: pending.amountInr, items: pending.items, invoiceToken: pending.invoiceToken, invoiceTokenExpiresAt: pending.invoiceTokenExpiresAt };
      }
      try {
        const razorpay = await createRazorpayOrder({ amountInr: pending.amountInr, receipt: `smf_${pending.orderId}` });
        await attachRazorpayOrderId(pending.orderId, razorpay.id);
        return { mode: "razorpay" as const, localOrderId: pending.orderId, razorpayOrderId: razorpay.id, amount: razorpay.amount, currency: razorpay.currency, keyId: process.env.RAZORPAY_KEY_ID ?? "" };
      } catch (error) {
        console.warn("[Checkout] Razorpay unavailable; keeping local pending order", error instanceof Error ? error.message : error);
        return { mode: "fallback" as const, localOrderId: pending.orderId, amountInr: pending.amountInr };
      }
    }),
    createRazorpay: publicProcedure.input(checkoutInput).mutation(async ({ input }) => {
      const pending = await createPendingOrder(input);
      const razorpay = await createRazorpayOrder({ amountInr: pending.amountInr, receipt: `smf_${pending.orderId}` });
      await attachRazorpayOrderId(pending.orderId, razorpay.id);
      return {
        localOrderId: pending.orderId,
        razorpayOrderId: razorpay.id,
        amount: razorpay.amount,
        currency: razorpay.currency,
        keyId: process.env.RAZORPAY_KEY_ID ?? "",
      };
    }),
  }),
  notifications: router({
    registerToken: publicProcedure.input(z.object({ token: z.string().trim().min(1).max(255), platform: z.enum(["android", "ios", "web"]), customerEmail: z.string().trim().email().max(320).optional(), customerPhone: z.string().trim().max(32).optional() })).mutation(({ input }) => {
      if (!isExpoPushToken(input.token)) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid Expo push token" });
      return registerPushToken(input);
    }),
  }),
  tracking: router({
    lookup: publicProcedure.input(z.object({ orderId: z.number().int().positive(), trackingToken: z.string().trim().min(20).max(64) })).query(({ input }) => getOrderForTracking(input)),
    regenerate: publicProcedure.input(z.object({ orderId: z.number().int().positive(), trackingToken: z.string().trim().min(20).max(64) })).mutation(({ input }) => regenerateTrackingToken(input)),
  }),
  transactions: router({
    history: publicProcedure.input(z.object({ orderId: z.number().int().positive(), contact: z.string().trim().min(5).max(320) })).query(({ input }) => getCustomerTransactionHistory(input)),
  }),
  invoices: router({
    getCod: publicProcedure.input(z.object({ orderId: z.number().int().positive(), invoiceToken: z.string().trim().min(20).max(64) })).query(({ input }) => getCodInvoice(input)),
  }),
  admin: router({
    dashboard: adminProcedure.query(() => getAdminDashboardData()),
    updateOrder: adminProcedure.input(adminOrderInput).mutation(async ({ input }) => {
      const updated = await updateAdminOrder(input);
      if (updated) void sendOrderStatusNotification(updated);
      return updated;
    }),
    updateInventory: adminProcedure.input(z.object({ productId: z.number().int().positive(), stockQuantity: z.number().int().min(0), reorderLevel: z.number().int().min(0), isActive: z.boolean().optional() })).mutation(({ input }) => updateAdminProductInventory(input)),
    accessCheck: adminProcedure.query(() => ({ allowed: true as const })),
  }),
});

export type AppRouter = typeof appRouter;
