import { detectDelayedInvoices } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-213
  test("請求予定日が未来日の案件は遅延案件から除外される", () => {
    // Arrange
    const currentDate = new Date("2024-01-15T10:00:00Z");
    const futureInvoiceDueDate = new Date("2024-02-14T23:59:59Z"); // 30日後

    const dealRecord = {
      deal_id: "DEAL-001",
      customer_name: "テスト顧客",
      status: "契約済み",
      amount: 100000,
      invoice_due_date: futureInvoiceDueDate.toISOString(),
      invoice_issued_date: null,
      invoice_status: "未発行",
    };

    const deals = [dealRecord];

    // Act
    const delayedInvoices = detectDelayedInvoices(deals, currentDate);

    // Assert
    // 請求予定日が未来日なので遅延案件リストに含まれない
    expect(delayedInvoices).toEqual([]);
    expect(delayedInvoices.length).toBe(0);
  });
});