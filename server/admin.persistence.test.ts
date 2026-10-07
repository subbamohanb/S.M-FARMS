import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { orderItems, orders, products } from "../drizzle/schema";
import { createPendingOrder, getDb, updateAdminOrder, updateAdminProductInventory } from "./db";

describe("admin operations persistence", () => {
  it("updates an order fulfillment status and preserves the change", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for this integration test");
    const created = await createPendingOrder({ items: [{ productId: 1, quantity: 1 }] });

    try {
      const updated = await updateAdminOrder({ orderId: created.orderId, status: "paid", fulfillmentStatus: "packed", carrier: "Test Carrier", trackingNumber: "TEST-123" });
      expect(updated?.status).toBe("paid");
      expect(updated?.fulfillmentStatus).toBe("packed");
      expect(updated?.carrier).toBe("Test Carrier");
      expect(updated?.trackingNumber).toBe("TEST-123");
    } finally {
      await db.delete(orderItems).where(eq(orderItems.orderId, created.orderId));
      await db.delete(orders).where(eq(orders.id, created.orderId));
    }
  }, 15_000);

  it("updates inventory and restores the original values", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for this integration test");
    const original = (await db.select().from(products).where(eq(products.id, 1)).limit(1))[0];
    if (!original) throw new Error("Expected seeded product 1");

    try {
      const updated = await updateAdminProductInventory({ productId: original.id, stockQuantity: original.stockQuantity + 3, reorderLevel: original.reorderLevel + 1 });
      expect(updated?.stockQuantity).toBe(original.stockQuantity + 3);
      expect(updated?.reorderLevel).toBe(original.reorderLevel + 1);
    } finally {
      await db.update(products).set({ stockQuantity: original.stockQuantity, reorderLevel: original.reorderLevel, isActive: original.isActive }).where(eq(products.id, original.id));
    }
  }, 15_000);
});
