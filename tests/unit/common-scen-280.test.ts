import { calculateAnnualMaintenanceCost } from "../../src/logic/common";

describe("共通", () => {
  // SCEN-280
  test("年間保守運用コスト算出機能 - 人月単価と運用工数から年間保守運用コストが正確に算出される", () => {
    const monthlyUnitPrice = 500000;
    const operationMonths = 12;
    const expectedAnnualCost = 6000000;

    const result = calculateAnnualMaintenanceCost(
      monthlyUnitPrice,
      operationMonths
    );

    expect(result).toBe(expectedAnnualCost);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(0);
  });
});