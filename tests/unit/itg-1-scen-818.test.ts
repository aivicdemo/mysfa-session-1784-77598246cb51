import { validateInvoiceTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-818
  test("請求対象データ妥当性検証機能 - 請求期日が明日以降のとき、該当データを承認対象と判定する", () => {
    const today = new Date("2024-01-15T00:00:00Z");
    const tomorrowOrLater = new Date("2024-01-16T00:00:00Z");

    const invoiceTargetData = {
      invoice_id: "INV-001",
      customer_id: "CUST-123",
      customer_name: "テスト株式会社",
      invoice_amount: 100000,
      invoice_date: new Date("2024-01-15T10:00:00Z"),
      due_date: tomorrowOrLater,
      line_items: [
        {
          product_id: "PROD-A",
          product_name: "商品A",
          quantity: 10,
          unit_price: 10000,
        },
      ],
    };

    const result = validateInvoiceTargetData(invoiceTargetData, today);

    expect(result.validation_status).toBe("承認対象");
    expect(result.is_approvable).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});