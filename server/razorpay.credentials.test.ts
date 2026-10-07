import { describe, expect, it } from "vitest";

describe("Razorpay credentials", () => {
  it("authenticates against the read-only payments endpoint without creating a charge", async () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required");
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/payments?count=1", {
      headers: { Authorization: `Basic ${auth}` },
    });

    expect(response.status).toBe(200);
  }, 15_000);
});
