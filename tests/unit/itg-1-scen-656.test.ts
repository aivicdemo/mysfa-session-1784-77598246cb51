import { validateSalesPerformanceAmount } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-656
  test("売上実績の金額が空のとき、バリデーションエラーが発生する", () => {
    const invalidSalesPerformanceRecord = {
      customer_name: "株式会社テスト",
      sales_date: "2024-01-15",
      invoice_number: "INV-2024-001",
      amount: undefined,
    };

    expect(() =>
      validateSalesPerformanceAmount(invalidSalesPerformanceRecord)
    ).toThrow(/金額/);
  });
});