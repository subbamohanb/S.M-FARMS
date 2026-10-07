import { describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { orderItems, orders } from "../drizzle/schema";
import { createPendingOrder, getCustomerTransactionHistory, getDb } from "./db";

describe("transactions history persistence", () => {
  it("returns matching attempts only after an order-and-contact anchor and masks payment IDs", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for this integration test");

    const first = await createPendingOrder({
      items: [{ productId: 1, quantity: 1 }],
      customerEmail: "history@example.com",
      customerPhone: "+91 9000000000",
    });
    const second = await createPendingOrder({
      items: [{ productId: 1, quantity: 1 }],
      customerEmail: "history@example.com",
      customerPhone: "+91 9000000000",
    });

    try {
      await db.update(orders).set({ status: "paid", razorpayPaymentId: "pay_history_secret" }).where(eq(orders.id, first.orderId));
      await db.update(orders).set({ status: "failed" }).where(eq(orders.id, second.orderId));

      const history = await getCustomerTransactionHistory({ orderId: first.orderId, contact: "history@example.com" });
      expect(history).toHaveLength(2);
      expect(history.some((row) => row.status === "paid")).toBe(true);
      expect(history.find((row) => row.id === first.orderId)?.razorpayPaymentId).toBe("••••••secret");

      const mismatch = await getCustomerTransactionHistory({ orderId: 999999999, contact: "history@example.com" });
      expect(mismatch).toEqual([]);
    } finally {
      await db.delete(orderItems).where(and(eq(orderItems.orderId, first.orderId)));
      await db.delete(orderItems).where(and(eq(orderItems.orderId, second.orderId)));
      await db.delete(orders).where(eq(orders.id, first.orderId));
      await db.delete(orders).where(eq(orders.id, second.orderId));
    }
  }, 15_000);
});
