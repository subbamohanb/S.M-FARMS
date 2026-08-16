import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { orderItems, orders } from "../drizzle/schema";
import { createPendingOrder, getCodInvoice, getDb } from "./db";

describe("COD invoice persistence", () => {
  it("returns a validated invoice for the matching token and rejects a mismatched token", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for this integration test");
    const result = await createPendingOrder({ items: [{ productId: 1, quantity: 1 }], customerName: "Invoice Test", paymentMethod: "cod" });
    try {
      expect(result.invoiceToken).toHaveLength(32);
      const invoice = await getCodInvoice({ orderId: result.orderId, invoiceToken: result.invoiceToken });
      expect(invoice?.paymentMethod).toBe("cod");
      expect(invoice?.amountInr).toBe(result.amountInr);
      expect(invoice?.items).toHaveLength(1);
      expect(await getCodInvoice({ orderId: result.orderId, invoiceToken: "wrong-token-that-must-not-match" })).toBeNull();
    } finally {
      await db.delete(orderItems).where(eq(orderItems.orderId, result.orderId));
      await db.delete(orders).where(eq(orders.id, result.orderId));
    }
  }, 15_000);
});
