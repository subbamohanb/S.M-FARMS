import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CheckoutPaymentButton } from "../client/src/components/CheckoutPaymentButton";
import { PaymentMethodSelector } from "../client/src/components/PaymentMethodSelector";

describe("checkout payment button", () => {
  it("renders a disabled secure-checkout spinner while initializing", () => {
    const markup = renderToStaticMarkup(<CheckoutPaymentButton isPreparing={false} isInitializing={true} isVerifying={false} onClick={vi.fn()} />);
    expect(markup).toContain("disabled");
    expect(markup).toContain("Loading secure checkout");
    expect(markup).toContain("animate-spin");
  });

  it("uses the same busy behavior for verification and preparation", () => {
    const preparing = renderToStaticMarkup(<CheckoutPaymentButton isPreparing={true} isInitializing={false} isVerifying={false} onClick={vi.fn()} />);
    const verifying = renderToStaticMarkup(<CheckoutPaymentButton isPreparing={false} isInitializing={false} isVerifying={true} onClick={vi.fn()} />);
    expect(preparing).toContain("disabled");
    expect(preparing).toContain("Preparing checkout");
    expect(verifying).toContain("disabled");
    expect(verifying).toContain("Verifying payment");
  });
});

describe("payment method selector", () => {
  it("renders online payment and Cash on Delivery choices", () => {
    const markup = renderToStaticMarkup(<PaymentMethodSelector value="cod" onChange={vi.fn()} />);
    expect(markup).toContain("Pay online");
    expect(markup).toContain("Cash on Delivery");
    expect(markup).toContain("Pay when your order arrives");
    expect(markup).toContain('value="cod"');
  });
});
