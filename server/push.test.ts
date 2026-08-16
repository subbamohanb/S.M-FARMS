import { describe, expect, it } from "vitest";
import { isExpoPushToken } from "./push";

describe("Expo push token validation", () => {
  it("accepts Expo token formats", () => {
    expect(isExpoPushToken("ExponentPushToken[abc123]")) .toBe(true);
    expect(isExpoPushToken("ExpoPushToken[abc123]")) .toBe(true);
  });

  it("rejects arbitrary strings", () => {
    expect(isExpoPushToken("not-a-push-token")).toBe(false);
    expect(isExpoPushToken("")).toBe(false);
  });
});
