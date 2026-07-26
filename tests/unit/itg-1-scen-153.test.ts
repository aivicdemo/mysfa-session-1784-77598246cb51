import { detectDelayedCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-153: [error] 商談ステータス・請求データ紐付け照合機能 - 商談ステータスが『完了』で請求書発行日が売上計上予定日より遅い場合、遅延案件として検出される
  test("商談ステータスが『完了』で請求書発行日が売上計上予定日より遅い場合、遅延案件として検出される", () => {
    // Arrange: テストデータの準備
    const dealId = "DEAL-001";
    const customerId = "CUST-001";
    const dealStatus = "完了";
    const dealAmount = 1000000;
    const plannedRevenueDateStr = "2024-01-15T00:00:00Z";
    const invoiceIssueDateStr = "2024-01-20T00:00:00Z";
    const plannedRevenueDate = new Date(plannedRevenueDateStr);
    const invoiceIssueDate = new Date(invoiceIssueDateStr);

    const deal = {
      dealId: dealId,
      customerId: customerId,
      status: dealStatus,
      amount: dealAmount,
      plannedRevenueDate: plannedRevenueDate,
    };

    const invoice = {
      invoiceId: "INV-001",
      dealId: dealId,
      customerId: customerId,
      issueDate: invoiceIssueDate,
      amount: dealAmount,
    };

    const deals = [deal];
    const invoices = [invoice];

    // Act: 遅延案件検出機能を実行
    const result = detectDelayedCases(deals, invoices);

    // Assert: 期待結果の検証
    // 1. 結果が遅延案件を検出したか
    expect(result.delayedCases).toBeDefined();
    expect(result.delayedCases.length).toBe(1);

    // 2. 検出された遅延案件の詳細を検証
    const detectedCase = result.delayedCases[0];
    expect(detectedCase.dealId).toBe(dealId);
    expect(detectedCase.customerId).toBe(customerId);
    expect(detectedCase.status).toBe("完了");
    expect(detectedCase.amount).toBe(dealAmount);

    // 3. 売上計上予定日と請求書発行日の差分を検証
    const delayDays = Math.floor(
      (invoiceIssueDate.getTime() - plannedRevenueDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    expect(delayDays).toBe(5);
    expect(detectedCase.delayDays).toBe(5);

    // 4. 遅延フラグが立てられているか
    expect(detectedCase.isDelayed).toBe(true);

    // 5. 計上予定日と請求発行日が正確に紐付いているか
    expect(detectedCase.plannedRevenueDate).toEqual(plannedRevenueDate);
    expect(detectedCase.invoiceIssueDate).toEqual(invoiceIssueDate);

    // 6. 照合結果レポートの統計情報を検証
    expect(result.totalDeals).toBe(1);
    expect(result.delayedCount).toBe(1);
    expect(result.onTimeCount).toBe(0);
    expect(result.totalDelayDays).toBe(5);

    // 7. エラーハンドリング: 結果にエラーが発生していないか
    expect(result.hasError).toBe(false);
    expect(result.errorMessage).toBeUndefined();
  });
});