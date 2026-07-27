import { fetchPurchaseHistoryWithPeriod } from "../../src/logic/it-1";

describe("顧客レコード過去購買履歴表示機能", () => {
  // SCEN-380
  test("対象期間の終了日がNullの場合、エラーが発生する", () => {
    const customerId = "CUST-001";
    const periodStartDate = "2024-01-01";
    const periodEndDate = null;

    expect(() =>
      fetchPurchaseHistoryWithPeriod(customerId, periodStartDate, periodEndDate)
    ).toThrow(/終了日/);
  });
});