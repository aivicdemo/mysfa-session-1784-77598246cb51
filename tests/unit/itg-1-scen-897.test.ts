import { validateInvoiceDetails } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-897
  test("請求書承認検証機能 - 請求書明細の説明文が0文字のとき検証が不合格になる", () => {
    const invoiceWithEmptyDescription = {
      id: "INV-001",
      customerId: "CUST-001",
      dealId: "DEAL-001",
      invoiceDate: new Date("2024-01-15T10:00:00Z"),
      dueDate: new Date("2024-02-15T10:00:00Z"),
      totalAmount: 10000,
      details: [
        {
          lineId: "LINE-001",
          productName: "商品A",
          quantity: 1,
          unitPrice: 10000,
          description: "",
        },
      ],
    };

    const result = validateInvoiceDetails(invoiceWithEmptyDescription);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: expect.stringContaining("description"),
        message: expect.stringMatching(/説明文/),
      })
    );
  });
});