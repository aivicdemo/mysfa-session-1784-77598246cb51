import { validateInvoice } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-889
  test("請求書に複数の異なる通貨が混在している場合、検証が不合格になる", () => {
    const invoiceWithMultipleCurrencies = {
      invoiceId: "INV-2024-001",
      customerId: "CUST-001",
      customerName: "テスト顧客",
      invoiceDate: "2024-01-15",
      dueDate: "2024-02-15",
      lineItems: [
        {
          lineItemId: "LINE-001",
          description: "商品A",
          quantity: 1,
          unitPrice: 100.0,
          currency: "USD",
          subtotal: 100.0,
        },
        {
          lineItemId: "LINE-002",
          description: "商品B",
          quantity: 1,
          unitPrice: 10000,
          currency: "JPY",
          subtotal: 10000,
        },
      ],
      totalAmount: 10100.0,
      status: "PENDING_APPROVAL",
    };

    const validationResult = validateInvoice(invoiceWithMultipleCurrencies);

    expect(validationResult.status).toBe("FAILED");
    expect(validationResult.errorCode).toBe("MULTIPLE_CURRENCIES_NOT_ALLOWED");
    expect(validationResult.errorMessage).toContain(
      "請求書内に複数の異なる通貨が混在しています"
    );
    expect(validationResult.errorMessage).toContain(
      "単一の通貨に統一してください"
    );
    expect(validationResult.errorMessage).toContain("USD");
    expect(validationResult.errorMessage).toContain("JPY");
    expect(validationResult.isApprovalAllowed).toBe(false);
  });
});