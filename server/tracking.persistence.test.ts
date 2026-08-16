import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { orderItems, orders } from "../drizzle/schema";
import { createPendingOrder, getDb, getOrderForTracking, regenerateTrackingToken } from "./db";

describe("tracking lookup persistence", () => {
  it("returns safe shipment details only for the matching order token", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for this integration test");
    const created = await createPendingOrder({ items: [{ productId: 1, quantity: 1 }], customerEmail: "tracking-test@example.com", paymentMethod: "cod" });
    try {
      const match = await getOrderForTracking({ orderId: created.orderId, trackingToken: created.invoiceToken });
      expect(match?.id).toBe(created.orderId);
      expect(match?.paymentMethod).toBe("cod");
      expect(match?.items).toHaveLength(1);
      expect(match).not.toHaveProperty("customerEmail");
      await expect(getOrderForTracking({ orderId: created.orderId, trackingToken: "wrong-tracking-token-000000000000" })).resolves.toBeNull();
      const regenerated = await regenerateTrackingToken({ orderId: created.orderId, trackingToken: created.invoiceToken });
      expect(regenerated?.invoiceToken).toHaveLength(32);
      expect(regenerated?.invoiceToken).not.toBe(created.invoiceToken);
      expect(regenerated?.invoiceTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(await getOrderForTracking({ orderId: created.orderId, trackingToken: created.invoiceToken })).toBeNull();
      expect((await getOrderForTracking({ orderId: created.orderId, trackingToken: regenerated!.invoiceToken }))?.id).toBe(created.orderId);
      expect(await regenerateTrackingToken({ orderId: created.orderId, trackingToken: "wrong-tracking-token-000000000000" })).toBeNull();
      await db.update(orders).set({ invoiceTokenExpiresAt: new Date(Date.now() - 1000) }).where(eq(orders.id, created.orderId));
      expect(await getOrderForTracking({ orderId: created.orderId, trackingToken: regenerated!.invoiceToken })).toBeNull();
      expect(await regenerateTrackingToken({ orderId: created.orderId, trackingToken: regenerated!.invoiceToken })).toBeNull();
    } finally {
      await db.delete(orderItems).where(eq(orderItems.orderId, created.orderId));
      await db.delete(orders).where(eq(orders.id, created.orderId));
    }
  }, 15_000);
});
