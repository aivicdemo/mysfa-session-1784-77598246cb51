import { describe, test, expect } from "@jest/globals";
import { calculateAnnualMaintenanceCost } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能", () => {
  // SCEN-035
  test("年間保守運用コスト算出機能 - 人月単価がマイナス値の場合にエラーが発生する", () => {
    const negativeUnitCost = -50000;
    const operationMonths = 12;

    expect(() => {
      calculateAnnualMaintenanceCost({
        unitCostPerPersonMonth: negativeUnitCost,
        operationMonths: operationMonths,
      });
    }).toThrow(/人月単価/);
  });
});