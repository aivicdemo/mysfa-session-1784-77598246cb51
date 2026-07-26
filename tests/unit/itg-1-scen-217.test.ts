import { validateInvoiceAmountDifference } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-217
  test("顧客請求内容照合検証 - 請求金額が期待値との差異が許容範囲を超過したとき異常フラグが立てられる", () => {
    const expectedAmount = 100000;
    const actualAmount = 105100;
    const tolerancePercentage = 5;

    const result = validateInvoiceAmountDifference({
      expectedAmount,
      actualAmount,
      tolerancePercentage,
    });

    const expectedDifference = actualAmount - expectedAmount;
    const toleranceAmount = expectedAmount * (tolerancePercentage / 100);

    expect(result.anomalyFlag).toBe(true);
    expect(result.differenceCurrency).toBe(5100);
    expect(result.isWithinTolerance).toBe(false);
    expect(result.errorMessage).toMatch(/許容範囲/);
    expect(result.differencePercentage).toBe(5.1);
  });
});