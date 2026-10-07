import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { orderItems, orders } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { createPendingOrder, getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("payment-ready checkout flow", () => {
  it("returns a safe fallback or public-only Razorpay configuration without charging", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for this integration test");
    const result = await appRouter.createCaller(context()).orders.checkout({ items: [{ productId: 1, quantity: 1 }] });
    expect(["fallback", "razorpay"]).toContain(result.mode);
    if (result.mode === "fallback") expect(result).not.toHaveProperty("keySecret");
    if (result.mode === "razorpay") {
      expect(result.keyId).not.toContain("secret");
      expect(result).not.toHaveProperty("keySecret");
    }
    await db.delete(orderItems).where(eq(orderItems.orderId, result.localOrderId));
    await db.delete(orders).where(eq(orders.id, result.localOrderId));
  }, 20_000);

  it("verifies a valid signature and rejects an invalid signature without charging", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for this integration test");
    const created = await createPendingOrder({ items: [{ productId: 1, quantity: 1 }] });
    const razorpayOrderId = `order_local_${created.orderId}`;
    const razorpayPaymentId = `pay_local_${created.orderId}`;
    const signature = crypto.createHmac("sha256", ENV.razorpayKeySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
    try {
      const caller = appRouter.createCaller(context());
      const verified = await caller.orders.verifyPayment({ localOrderId: created.orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature: signature });
      expect(verified.success).toBe(true);
      expect(verified.order?.status).toBe("paid");
      await expect(caller.orders.verifyPayment({ localOrderId: created.orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature: "invalid" })).rejects.toThrow();
    } finally {
      await db.delete(orderItems).where(eq(orderItems.orderId, created.orderId));
      await db.delete(orders).where(eq(orders.id, created.orderId));
    }
  }, 20_000);
});
