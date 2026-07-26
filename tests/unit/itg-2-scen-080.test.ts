import { extractAndFormatDocument } from "../../src/logic/it-1784969823049-2-1-2";

describe("帳票データ抽出・反映機能 - 出力形式ルール適用検証", () => {
  // SCEN-080
  test("見積・注文・請求書ごとの出力形式ルールが正しく適用される", () => {
    const quotationData = {
      documentType: "quotation",
      documentId: "QT-2024-001",
      customerId: "CUST-100",
      customerName: "テスト顧客A株式会社",
      customerAddress: "東京都渋谷区1-2-3",
      issueDate: "2024-01-15",
      validUntilDate: "2024-02-15",
      lineItems: [
        {
          itemId: "ITEM-001",
          itemName: "ソフトウェアライセンス",
          quantity: 10,
          unitPrice: 50000,
          subtotal: 500000,
        },
        {
          itemId: "ITEM-002",
          itemName: "導入支援サービス",
          quantity: 1,
          unitPrice: 100000,
          subtotal: 100000,
        },
      ],
      subtotalAmount: 600000,
      taxRate: 0.1,
      taxAmount: 60000,
      totalAmount: 660000,
    };

    const quotationResult = extractAndFormatDocument(quotationData);

    expect(quotationResult.documentType).toBe("quotation");
    expect(quotationResult.formatRuleApplied).toBe("quotation_format_rule_v1");
    expect(quotationResult.headerPresent).toBe(true);
    expect(quotationResult.footerPresent).toBe(true);
    expect(quotationResult.fontFamily).toBe("Arial");
    expect(quotationResult.fontSize).toBe(11);
    expect(quotationResult.pageMarginTopMm).toBe(20);
    expect(quotationResult.pageMarginBottomMm).toBe(20);
    expect(quotationResult.pageMarginLeftMm).toBe(15);
    expect(quotationResult.pageMarginRightMm).toBe(15);
    expect(quotationResult.lineItemCount).toBe(2);
    expect(quotationResult.totalAmount).toBe(660000);
    expect(quotationResult.logoPositionX).toBe(20);
    expect(quotationResult.logoPositionY).toBe(10);
    expect(quotationResult.validityPeriodDisplayed).toBe(true);

    const orderData = {
      documentType: "order",
      documentId: "ORD-2024-001",
      customerId: "CUST-100",
      customerName: "テスト顧客A株式会社",
      customerAddress: "東京都渋谷区1-2-3",
      issueDate: "2024-01-16",
      deliveryDate: "2024-02-01",
      lineItems: [
        {
          itemId: "ITEM-001",
          itemName: "ソフトウェアライセンス",
          quantity: 10,
          unitPrice: 50000,
          subtotal: 500000,
        },
        {
          itemId: "ITEM-002",
          itemName: "導入支援サービス",
          quantity: 1,
          unitPrice: 100000,
          subtotal: 100000,
        },
      ],
      subtotalAmount: 600000,
      taxRate: 0.1,
      taxAmount: 60000,
      totalAmount: 660000,
    };

    const orderResult = extractAndFormatDocument(orderData);

    expect(orderResult.documentType).toBe("order");
    expect(orderResult.formatRuleApplied).toBe("order_format_rule_v1");
    expect(orderResult.headerPresent).toBe(true);
    expect(orderResult.footerPresent).toBe(true);
    expect(orderResult.fontFamily).toBe("Calibri");
    expect(orderResult.fontSize).toBe(10);
    expect(orderResult.pageMarginTopMm).toBe(25);
    expect(orderResult.pageMarginBottomMm).toBe(25);
    expect(orderResult.pageMarginLeftMm).toBe(18);
    expect(orderResult.pageMarginRightMm).toBe(18);
    expect(orderResult.lineItemCount).toBe(2);
    expect(orderResult.totalAmount).toBe(660000);
    expect(orderResult.logoPositionX).toBe(25);
    expect(orderResult.logoPositionY).toBe(15);
    expect(orderResult.deliveryDateDisplayed).toBe(true);

    const invoiceData = {
      documentType: "invoice",
      documentId: "INV-2024-001",
      customerId: "CUST-100",
      customerName: "テスト顧客A株式会社",
      customerAddress: "東京都渋谷区1-2-3",
      issueDate: "2024-01-17",
      dueDate: "2024-02-17",
      lineItems: [
        {
          itemId: "ITEM-001",
          itemName: "ソフトウェアライセンス",
          quantity: 10,
          unitPrice: 50000,
          subtotal: 500000,
        },
        {
          itemId: "ITEM-002",
          itemName: "導入支援サービス",
          quantity: 1,
          unitPrice: 100000,
          subtotal: 100000,
        },
      ],
      subtotalAmount: 600000,
      taxRate: 0.1,
      taxAmount: 60000,
      totalAmount: 660000,
    };

    const invoiceResult = extractAndFormatDocument(invoiceData);

    expect(invoiceResult.documentType).toBe("invoice");
    expect(invoiceResult.formatRuleApplied).toBe("invoice_format_rule_v1");
    expect(invoiceResult.headerPresent).toBe(true);
    expect(invoiceResult.footerPresent).toBe(true);
    expect(invoiceResult.fontFamily).toBe("Times New Roman");
    expect(invoiceResult.fontSize).toBe(12);
    expect(invoiceResult.pageMarginTopMm).toBe(30);
    expect(invoiceResult.pageMarginBottomMm).toBe(30);
    expect(invoiceResult.pageMarginLeftMm).toBe(20);
    expect(invoiceResult.pageMarginRightMm).toBe(20);
    expect(invoiceResult.lineItemCount).toBe(2);
    expect(invoiceResult.totalAmount).toBe(660000);
    expect(invoiceResult.logoPositionX).toBe(30);
    expect(invoiceResult.logoPositionY).toBe(20);
    expect(invoiceResult.dueDateDisplayed).toBe(true);
    expect(invoiceResult.paymentTermsDisplayed).toBe(true);

    expect(quotationResult.formatRuleApplied).not.toBe(
      orderResult.formatRuleApplied
    );
    expect(quotationResult.formatRuleApplied).not.toBe(
      invoiceResult.formatRuleApplied
    );
    expect(orderResult.formatRuleApplied).not.toBe(
      invoiceResult.formatRuleApplied
    );

    expect(quotationResult.fontSize).not.toBe(orderResult.fontSize);
    expect(quotationResult.fontSize).not.toBe(invoiceResult.fontSize);
    expect(orderResult.fontSize).not.toBe(invoiceResult.fontSize);

    expect(quotationResult.fontFamily).not.toBe(orderResult.fontFamily);
    expect(quotationResult.fontFamily).not.toBe(invoiceResult.fontFamily);
    expect(orderResult.fontFamily).not.toBe(invoiceResult.fontFamily);

    expect(quotationResult.pageMarginTopMm).not.toBe(orderResult.pageMarginTopMm);
    expect(quotationResult.pageMarginTopMm).not.toBe(
      invoiceResult.pageMarginTopMm
    );
    expect(orderResult.pageMarginTopMm).not.toBe(invoiceResult.pageMarginTopMm);

    expect(quotationResult.validityPeriodDisplayed).toBe(true);
    expect(orderResult.deliveryDateDisplayed).toBe(true);
    expect(invoiceResult.dueDateDisplayed).toBe(true);
    expect(invoiceResult.paymentTermsDisplayed).toBe(true);

    expect(quotationResult.validityPeriodDisplayed).not.toBe(
      orderResult.deliveryDateDisplayed
    );
    expect(orderResult.deliveryDateDisplayed).not.toBe(
      invoiceResult.dueDateDisplayed
    );
  });
});