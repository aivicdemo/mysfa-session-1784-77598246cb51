import { generateInvoiceFromUnbilledDeal } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-216
  test("未請求案件から商談レコードの顧客情報・金額・明細を自動抽出して請求書が生成される", () => {
    // Arrange: 未請求の商談レコード
    const unbilledDeal = {
      dealId: "DEAL-2024-001",
      customerId: "CUST-12345",
      customerName: "株式会社サンプル",
      customerCode: "SC001",
      dealAmount: 1500000,
      dealStatus: "受注",
      dealDate: "2024-01-15",
      dueDate: "2024-02-15",
      lineItems: [
        {
          lineId: "LINE-001",
          productId: "PROD-A",
          productName: "サーバーライセンス",
          quantity: 5,
          unitPrice: 200000,
          totalPrice: 1000000,
          taxRate: 0.1,
        },
        {
          lineId: "LINE-002",
          productId: "PROD-B",
          productName: "サポートサービス",
          quantity: 1,
          unitPrice: 500000,
          totalPrice: 500000,
          taxRate: 0.1,
        },
      ],
      billingStatus: "未請求",
    };

    // Act: 請求書を自動生成
    const generatedInvoice = generateInvoiceFromUnbilledDeal(unbilledDeal);

    // Assert: 顧客情報が正しく抽出されていること
    expect(generatedInvoice.customerId).toBe("CUST-12345");
    expect(generatedInvoice.customerName).toBe("株式会社サンプル");
    expect(generatedInvoice.customerCode).toBe("SC001");

    // Assert: 金額が正しく抽出されていること
    expect(generatedInvoice.subtotalAmount).toBe(1500000);
    expect(generatedInvoice.taxAmount).toBe(150000); // 1500000 * 0.1
    expect(generatedInvoice.totalAmount).toBe(1650000); // 1500000 + 150000

    // Assert: 明細行がすべて正しく抽出されていること
    expect(generatedInvoice.lineItems).toHaveLength(2);

    expect(generatedInvoice.lineItems[0].productId).toBe("PROD-A");
    expect(generatedInvoice.lineItems[0].productName).toBe("サーバーライセンス");
    expect(generatedInvoice.lineItems[0].quantity).toBe(5);
    expect(generatedInvoice.lineItems[0].unitPrice).toBe(200000);
    expect(generatedInvoice.lineItems[0].totalPrice).toBe(1000000);

    expect(generatedInvoice.lineItems[1].productId).toBe("PROD-B");
    expect(generatedInvoice.lineItems[1].productName).toBe("サポートサービス");
    expect(generatedInvoice.lineItems[1].quantity).toBe(1);
    expect(generatedInvoice.lineItems[1].unitPrice).toBe(500000);
    expect(generatedInvoice.lineItems[1].totalPrice).toBe(500000);

    // Assert: ステータスが「下書き」であること
    expect(generatedInvoice.invoiceStatus).toBe("下書き");

    // Assert: 請求書IDが生成されていること
    expect(generatedInvoice.invoiceId).toBeTruthy();

    // Assert: 出典の商談IDが紐付いていること
    expect(generatedInvoice.referredDealId).toBe("DEAL-2024-001");

    // Assert: 生成日時が正しくセットされていること
    expect(generatedInvoice.generatedAt).toBeTruthy();
  });
});