import { describe, expect, it } from "vitest";
import { createCodInvoicePdf } from "../client/src/lib/invoicePdf";

describe("COD invoice PDF", () => {
  it("creates a PDF payload with the validated order summary", async () => {
    const bytes = await createCodInvoicePdf({
      id: 4102,
      status: "pending",
      paymentMethod: "cod",
      fulfillmentStatus: "pending",
      amountInr: 798,
      customerName: "S.M FARMS customer",
      createdAt: new Date("2026-08-17T10:00:00Z"),
      items: [{ productName: "NeemShield Botanical Concentrate", unitPriceInr: 399, quantity: 2, lineTotalInr: 798 }],
    });
    expect(bytes.length).toBeGreaterThan(500);
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe("%PDF-");
  });
});
