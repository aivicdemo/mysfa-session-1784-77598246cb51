import { reconcileDealStatusWithInvoices } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-718
  test("同じ案件が未請求と遅延の両方に該当する場合、重大度の高い分類が優先される", () => {
    // Arrange: テスト対象の案件レコードを準備
    const dealId = "DEAL-001";
    const dealName = "顧客A向けシステム導入";
    const dealStatus = "クローズ済み（成約）";

    // 紐付く請求書レコード：①未請求、②遅延
    const invoices = [
      {
        invoiceId: "INV-001",
        status: "未請求",
        invoiceDate: null,
        dueDate: new Date("2024-02-15").toISOString(),
        amount: 1000000,
      },
      {
        invoiceId: "INV-002",
        status: "遅延",
        invoiceDate: new Date("2024-01-20").toISOString(),
        dueDate: new Date("2024-02-10").toISOString(),
        amount: 500000,
        paymentDate: null,
      },
    ];

    const deal = {
      dealId,
      dealName,
      status: dealStatus,
    };

    // Act: ステータス照合ロジックを呼び出し
    const reconciliationResult = reconcileDealStatusWithInvoices(deal, invoices);

    // Assert: 統合ステータスが『遅延』で、重大度が『高』となることを確認
    expect(reconciliationResult.consolidatedStatus).toBe("遅延");
    expect(reconciliationResult.severityLevel).toBe("高");
    expect(reconciliationResult.dealId).toBe("DEAL-001");
    expect(reconciliationResult.invoiceStatuses).toContain("未請求");
    expect(reconciliationResult.invoiceStatuses).toContain("遅延");
  });
});