import { describe, expect, it } from "vitest";
import { verifyRazorpayPaymentSignature } from "./razorpay";

describe("Razorpay payment verification", () => {
  it("rejects an invalid payment signature without changing order state", () => {
    expect(verifyRazorpayPaymentSignature({ orderId: "order_test", paymentId: "pay_test", signature: "invalid" })).toBe(false);
  });
});
