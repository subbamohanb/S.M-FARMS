import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PaymentRecoveryPrompt } from "../client/src/components/PaymentRecoveryPrompt";
import OrderConfirmation from "../client/src/pages/OrderConfirmation";

describe("COD customer experience", () => {
  it("renders an explicit switch-to-COD recovery action", () => {
    const markup = renderToStaticMarkup(<PaymentRecoveryPrompt onSwitchToCod={vi.fn()} />);
    expect(markup).toContain("Online payment could not be loaded.");
    expect(markup).toContain("Use Cash on Delivery");
  });

  it("renders a safe empty confirmation state when no session order exists", () => {
    expect(renderToStaticMarkup(<OrderConfirmation />)).toContain("No recent COD order.");
  });
});
