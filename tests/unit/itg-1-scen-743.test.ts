import { reconcileDealAndInvoiceData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-743
  test("[normal] 複数の商談レコード（3件）に対してバッチ照合を実行し、すべてのレコードで商談ステータスと請求額が一致", async () => {
    const deals = [
      {
        dealId: "D001",
        status: "成約",
        amount: 150000,
        invoiceDate: "2024-01-15",
      },
      {
        dealId: "D002",
        status: "成約",
        amount: 280000,
        invoiceDate: "2024-01-20",
      },
      {
        dealId: "D003",
        status: "成約",
        amount: 95000,
        invoiceDate: "2024-01-25",
      },
    ];

    const invoices = [
      { dealId: "D001", amount: 150000, status: "未入金" },
      { dealId: "D002", amount: 280000, status: "未入金" },
      { dealId: "D003", amount: 95000, status: "未入金" },
    ];

    const result = await reconcileDealAndInvoiceData(deals, invoices);

    expect(result.totalProcessed).toBe(3);
    expect(result.successCount).toBe(3);
    expect(result.failureCount).toBe(0);

    expect(result.reconciliationResults).toHaveLength(3);

    expect(result.reconciliationResults[0]).toEqual({
      dealId: "D001",
      dealStatus: "成約",
      dealAmount: 150000,
      invoiceAmount: 150000,
      reconciliationStatus: "ステータス一致・請求額一致",
      isMatched: true,
    });

    expect(result.reconciliationResults[1]).toEqual({
      dealId: "D002",
      dealStatus: "成約",
      dealAmount: 280000,
      invoiceAmount: 280000,
      reconciliationStatus: "ステータス一致・請求額一致",
      isMatched: true,
    });

    expect(result.reconciliationResults[2]).toEqual({
      dealId: "D003",
      dealStatus: "成約",
      dealAmount: 95000,
      invoiceAmount: 95000,
      reconciliationStatus: "ステータス一致・請求額一致",
      isMatched: true,
    });

    expect(result.executionLog).toBeDefined();
    expect(result.executionLog.targetCount).toBe(3);
    expect(result.executionLog.successCount).toBe(3);
    expect(result.executionLog.failureCount).toBe(0);
    expect(result.executionLog.executedAt).toBeDefined();
  });
});