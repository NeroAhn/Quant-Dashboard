import { describe, it, expect } from "vitest";
import { calculateRS, calculateMA50Dist, calculateDrawdown } from "./engine";

describe("calculateRS", () => {
  it("returns correct RS for normal inputs", () => {
    expect(calculateRS(10, 5)).toBe(200);
  });

  it("returns 100 when S&P change is 0 (D-09 division-by-zero guard)", () => {
    expect(calculateRS(5, 0)).toBe(100);
  });

  it("handles negative ticker change correctly", () => {
    expect(calculateRS(-3, 2)).toBe(-150);
  });
});

describe("calculateMA50Dist", () => {
  it("returns correct distance for normal inputs", () => {
    expect(calculateMA50Dist(105, 100)).toBe(5.0);
  });

  it("returns 0 when MA50 is 0 (safe guard)", () => {
    expect(calculateMA50Dist(100, 0)).toBe(0);
  });
});

describe("calculateDrawdown", () => {
  it("returns correct drawdown for normal inputs", () => {
    expect(calculateDrawdown(90, 100)).toBe(-10.0);
  });

  it("returns 0 when current price equals 52-week high", () => {
    expect(calculateDrawdown(100, 100)).toBe(0);
  });

  it("returns 0 when 52-week high is 0 (safe guard)", () => {
    expect(calculateDrawdown(100, 0)).toBe(0);
  });
});
