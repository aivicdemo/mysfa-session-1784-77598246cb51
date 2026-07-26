import { calculateAnnualSavings } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-312
  test("Salesforceライセンス年間費用と自社システム年間運用コストから正確な年間削減額が算出される", () => {
    const salesforceAnnualCost = 5000000; // 500万円
    const ownSystemAnnualCost = 3000000; // 300万円
    const expectedAnnualSavings = 2000000; // 200万円

    const result = calculateAnnualSavings({
      salesforceAnnualCost,
      ownSystemAnnualCost,
    });

    expect(result).toBe(expectedAnnualSavings);
  });
});