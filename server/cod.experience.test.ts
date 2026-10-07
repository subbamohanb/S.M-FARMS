import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { PaymentRecoveryPrompt } from "../client/src/components/PaymentRecoveryPrompt";

const confirmationSource = readFileSync(new URL("../client/src/pages/OrderConfirmation.tsx", import.meta.url), "utf8");
const checkoutSources = ["Home", "Shop", "AgriFarm", "DairyFarm"].map((page) => readFileSync(new URL(`../client/src/pages/${page}.tsx`, import.meta.url), "utf8"));

describe("COD customer experience", () => {
  it("renders and activates the switch-to-COD recovery action", () => {
    const onSwitchToCod = vi.fn();
    const markup = renderToStaticMarkup(createElement(PaymentRecoveryPrompt, { onSwitchToCod }));
    expect(markup).toContain("Online payment could not be loaded.");
    expect(markup).toContain("Use Cash on Delivery");
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => { renderer = TestRenderer.create(createElement(PaymentRecoveryPrompt, { onSwitchToCod })); });
    const codButton = renderer!.root.findAllByType("button").find((button) => String(button.props.children).includes("Use Cash on Delivery"));
    expect(codButton).toBeDefined();
    act(() => { codButton?.props.onClick(); });
    expect(onSwitchToCod).toHaveBeenCalledTimes(1);
  });

  it("contains the success animation and confirmation summary markers", () => {
    expect(confirmationSource).toContain("animate-in zoom-in");
    expect(confirmationSource).toContain("Confirmation summary");
    expect(confirmationSource).toContain("Amount due on delivery");
  });

  it("surfaces a COD fallback from every storefront Razorpay failure callback", () => {
    for (const source of checkoutSources) {
      expect(source).toContain("Razorpay reported a payment error");
      expect(source).toContain("setPaymentMethod(\"cod\")");
    }
  });
});
