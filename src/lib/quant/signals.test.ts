import { describe, it, expect } from "vitest";
import { getDecisionAction } from "./signals";

describe("getDecisionAction", () => {
  it("ASIG-02: Trim takes priority over Buy (rs=135, ma50Dist=15, UP)", () => {
    expect(getDecisionAction(135, 15, "UP")).toBe("Trim");
  });

  it("ASIG-01: Buy when rs>110, ma50Dist<5, revision=UP", () => {
    expect(getDecisionAction(115, 3, "UP")).toBe("Buy");
  });

  it("ASIG-01: Hold when revision is not UP (rs=115, ma50Dist=3, NEUTRAL)", () => {
    expect(getDecisionAction(115, 3, "NEUTRAL")).toBe("Hold");
  });

  it("ASIG-03 D-08 OR: Wait when RS < 90 only (rs=85, NEUTRAL)", () => {
    expect(getDecisionAction(85, 3, "NEUTRAL")).toBe("Wait");
  });

  it("ASIG-03 D-08 OR: Wait when revision=DOWN only (rs=105)", () => {
    expect(getDecisionAction(105, 3, "DOWN")).toBe("Wait");
  });

  it("ASIG-04: Hold for neutral conditions (rs=105, ma50Dist=8, NEUTRAL)", () => {
    expect(getDecisionAction(105, 8, "NEUTRAL")).toBe("Hold");
  });

  it("QENG-04: Epsilon boundary - Buy at rs=110.0000000001, ma50Dist=4.9999999999, UP", () => {
    expect(getDecisionAction(110.0000000001, 4.9999999999, "UP")).toBe("Buy");
  });

  it("Boundary: rs=90 exactly is Hold, not Wait (strict lt)", () => {
    expect(getDecisionAction(90, 5, "NEUTRAL")).toBe("Hold");
  });
});
