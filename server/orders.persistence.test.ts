import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { orderItems, orders } from "../drizzle/schema";
import { createPendingOrder, getDb } from "./db";

describe("orders persistence", () => {
  it("persists a pending order with aggregated item quantities and server totals", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for this integration test");

    const result = await createPendingOrder({
      items: [{ productId: 1, quantity: 1 }, { productId: 1, quantity: 2 }],
      customerName: "Checkout Test",
      paymentMethod: "cod",
    });

    try {
      const savedOrder = await db.select().from(orders).where(eq(orders.id, result.orderId)).limit(1);
      const savedItems = await db.select().from(orderItems).where(eq(orderItems.orderId, result.orderId));

      expect(savedOrder[0]?.status).toBe("pending");
      expect(savedOrder[0]?.paymentMethod).toBe("cod");
      expect(savedOrder[0]?.amountInr).toBe(result.amountInr);
      expect(savedItems).toHaveLength(1);
      expect(savedItems[0]?.quantity).toBe(3);
      expect(savedItems[0]?.lineTotalInr).toBe(result.amountInr);
    } finally {
      await db.delete(orderItems).where(eq(orderItems.orderId, result.orderId));
      await db.delete(orders).where(eq(orders.id, result.orderId));
    }
  }, 15_000);
});
