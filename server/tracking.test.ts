import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("customer order tracking", () => {
  it("returns no order for an unmatched order and token pair", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.tracking.lookup({ orderId: 999999, trackingToken: "tracking-token-000000000000" })).resolves.toBeNull();
  });

  it("rejects invalid lookup inputs", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.tracking.lookup({ orderId: 0, trackingToken: "tracking-token-000000000000" })).rejects.toThrow();
  });
});
