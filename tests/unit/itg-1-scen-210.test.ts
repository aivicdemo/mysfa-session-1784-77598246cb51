import { validateInvoiceTargetData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-210
  test("請求対象データ妥当性検証 - 顧客IDが重複する複数の請求対象データが重複として検出される", () => {
    const invoiceTargetData = [
      {
        customerId: "CUST-001",
        customerName: "顧客A",
        invoiceAmount: 100000,
        invoiceDate: "2024-04-15",
        dealStatus: "受注",
      },
      {
        customerId: "CUST-001",
        customerName: "顧客A",
        invoiceAmount: 150000,
        invoiceDate: "2024-04-16",
        dealStatus: "受注",
      },
      {
        customerId: "CUST-002",
        customerName: "顧客B",
        invoiceAmount: 200000,
        invoiceDate: "2024-04-17",
        dealStatus: "完了",
      },
    ];

    expect(() => validateInvoiceTargetData(invoiceTargetData)).toThrow(
      /重複/
    );

    try {
      validateInvoiceTargetData(invoiceTargetData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toMatch(/CUST-001/);
        expect(error.message).toMatch(/2/);
      }
    }
  });
});