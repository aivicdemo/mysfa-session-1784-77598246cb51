import { issuedInvoice } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能 - 帳票発行・履歴管理", () => {
  // SCEN-043
  test("請求書を顧客に発行したとき、発行日時が自動付与され、発行履歴が記録される", () => {
    const invoiceIssueTime = new Date("2024-01-15T14:30:00Z");
    const invoiceData = {
      invoiceId: "INV-2024-001",
      customerId: "CUST-12345",
      customerName: "株式会社テスト",
      amount: 150000,
      invoiceStatus: "draft",
      invoiceContent: "システム開発費用"
    };

    const result = issuedInvoice(
      invoiceData,
      invoiceIssueTime
    );

    expect(result.invoiceId).toBe("INV-2024-001");
    expect(result.customerId).toBe("CUST-12345");
    expect(result.customerName).toBe("株式会社テスト");
    expect(result.amount).toBe(150000);
    expect(result.issuedAt).toEqual(new Date("2024-01-15T14:30:00Z"));
    expect(result.invoiceStatus).toBe("issued");
    expect(result.invoiceContent).toBe("システム開発費用");

    expect(result.history).toBeDefined();
    expect(result.history.length).toBe(1);
    expect(result.history[0]).toEqual({
      historyId: expect.any(String),
      invoiceId: "INV-2024-001",
      customerId: "CUST-12345",
      customerName: "株式会社テスト",
      amount: 150000,
      issuedAt: new Date("2024-01-15T14:30:00Z"),
      invoiceStatus: "issued",
      recordedAt: expect.any(Date)
    });

    expect(result.history[0].issuedAt).toEqual(
      new Date("2024-01-15T14:30:00Z")
    );
    expect(result.history[0].customerName).toBe("株式会社テスト");
    expect(result.history[0].amount).toBe(150000);
  });
});