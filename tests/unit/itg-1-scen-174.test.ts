import { generateInvoiceFromUnbilledDeal } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-174
  test("未請求案件から顧客情報・金額・明細を自動抽出し請求書が正しく生成される", () => {
    const unbilledDealInput = {
      dealId: "DEAL-00123",
      dealStatus: "成約",
      customerId: "CUST-00045",
      customerName: "株式会社テスト商社",
      customerAddress: "東京都渋谷区道玄坂1-2-3",
      customerPhone: "03-XXXX-XXXX",
      dealAmount: 550000,
      taxAmount: 50000,
      totalAmount: 600000,
      lineItems: [
        {
          itemId: "ITEM-001",
          productName: "サーバーライセンス",
          quantity: 2,
          unitPrice: 200000,
          lineAmount: 400000,
        },
        {
          itemId: "ITEM-002",
          productName: "サポート契約（1年）",
          quantity: 1,
          unitPrice: 150000,
          lineAmount: 150000,
        },
      ],
      invoiceGenerationDate: new Date("2024-04-15T09:00:00Z"),
    };

    const generatedInvoice = generateInvoiceFromUnbilledDeal(unbilledDealInput);

    expect(generatedInvoice).toBeDefined();
    expect(generatedInvoice.invoiceId).toBeDefined();
    expect(generatedInvoice.invoiceStatus).toBe("確定");
    expect(generatedInvoice.dealId).toBe("DEAL-00123");
    expect(generatedInvoice.dealStatus).toBe("請求済み");
    expect(generatedInvoice.customerId).toBe("CUST-00045");
    expect(generatedInvoice.customerName).toBe("株式会社テスト商社");
    expect(generatedInvoice.customerAddress).toBe("東京都渋谷区道玄坂1-2-3");
    expect(generatedInvoice.customerPhone).toBe("03-XXXX-XXXX");
    expect(generatedInvoice.subtotal).toBe(550000);
    expect(generatedInvoice.taxAmount).toBe(50000);
    expect(generatedInvoice.totalAmount).toBe(600000);

    expect(generatedInvoice.lineItems).toHaveLength(2);
    expect(generatedInvoice.lineItems[0]).toEqual({
      itemId: "ITEM-001",
      productName: "サーバーライセンス",
      quantity: 2,
      unitPrice: 200000,
      lineAmount: 400000,
    });
    expect(generatedInvoice.lineItems[1]).toEqual({
      itemId: "ITEM-002",
      productName: "サポート契約（1年）",
      quantity: 1,
      unitPrice: 150000,
      lineAmount: 150000,
    });

    expect(generatedInvoice.pdfOutputGenerated).toBe(true);
    expect(generatedInvoice.pdfContent).toBeDefined();
    expect(generatedInvoice.pdfContent.length).toBeGreaterThan(0);

    const pdfValidation = generatedInvoice.pdfContent.includes(
      "株式会社テスト商社"
    ) &&
      generatedInvoice.pdfContent.includes("600000") &&
      generatedInvoice.pdfContent.includes("サーバーライセンス");

    expect(pdfValidation).toBe(true);

    expect(generatedInvoice.createdAt).toBeDefined();
    expect(new Date(generatedInvoice.createdAt).toISOString()).toEqual(
      new Date("2024-04-15T09:00:00Z").toISOString()
    );
  });
});