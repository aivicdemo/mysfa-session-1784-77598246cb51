import { generateEstimate, generateOrder, generateInvoice } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-169
  test("複数の請求明細行がある場合、すべての明細が帳票に漏れなく反映される", () => {
    const invoiceLineItems = [
      {
        lineId: 1,
        productName: "ソフトウェアライセンス A",
        quantity: 10,
        unitPrice: 5000,
        taxRate: 0.1,
      },
      {
        lineId: 2,
        productName: "サポート・保守サービス",
        quantity: 3,
        unitPrice: 15000,
        taxRate: 0.1,
      },
      {
        lineId: 3,
        productName: "カスタマイズ開発",
        quantity: 1,
        unitPrice: 200000,
        taxRate: 0.1,
      },
      {
        lineId: 4,
        productName: "導入研修",
        quantity: 5,
        unitPrice: 8000,
        taxRate: 0.1,
      },
      {
        lineId: 5,
        productName: "データ移行サービス",
        quantity: 2,
        unitPrice: 50000,
        taxRate: 0.1,
      },
    ];

    const dealData = {
      dealId: "DEAL-20240115-001",
      customerId: "CUST-00001",
      customerName: "営業テスト株式会社",
      totalAmount: 0,
      dealStatus: "成約",
      createdDate: new Date("2024-01-15T10:00:00Z"),
      invoiceLineItems,
    };

    const subtotalByLine = invoiceLineItems.map((line) => {
      const lineSubtotal = line.quantity * line.unitPrice;
      const lineTax = lineSubtotal * line.taxRate;
      return {
        lineId: line.lineId,
        subtotal: lineSubtotal,
        taxAmount: lineTax,
        totalWithTax: lineSubtotal + lineTax,
      };
    });

    const totalSubtotal = subtotalByLine.reduce(
      (sum, line) => sum + line.subtotal,
      0
    );
    const totalTaxAmount = subtotalByLine.reduce(
      (sum, line) => sum + line.taxAmount,
      0
    );
    const grandTotal = totalSubtotal + totalTaxAmount;

    dealData.totalAmount = grandTotal;

    const estimate = generateEstimate(dealData);

    expect(estimate).toBeDefined();
    expect(estimate.dealId).toBe("DEAL-20240115-001");
    expect(estimate.customerName).toBe("営業テスト株式会社");
    expect(estimate.lineItems).toHaveLength(5);
    expect(estimate.lineItems[0]).toEqual(
      expect.objectContaining({
        lineId: 1,
        productName: "ソフトウェアライセンス A",
        quantity: 10,
        unitPrice: 5000,
        taxRate: 0.1,
      })
    );
    expect(estimate.lineItems[1]).toEqual(
      expect.objectContaining({
        lineId: 2,
        productName: "サポート・保守サービス",
        quantity: 3,
        unitPrice: 15000,
        taxRate: 0.1,
      })
    );
    expect(estimate.lineItems[2]).toEqual(
      expect.objectContaining({
        lineId: 3,
        productName: "カスタマイズ開発",
        quantity: 1,
        unitPrice: 200000,
        taxRate: 0.1,
      })
    );
    expect(estimate.lineItems[3]).toEqual(
      expect.objectContaining({
        lineId: 4,
        productName: "導入研修",
        quantity: 5,
        unitPrice: 8000,
        taxRate: 0.1,
      })
    );
    expect(estimate.lineItems[4]).toEqual(
      expect.objectContaining({
        lineId: 5,
        productName: "データ移行サービス",
        quantity: 2,
        unitPrice: 50000,
        taxRate: 0.1,
      })
    );

    expect(estimate.subtotal).toBe(totalSubtotal);
    expect(estimate.taxAmount).toBe(totalTaxAmount);
    expect(estimate.totalAmount).toBe(grandTotal);

    const order = generateOrder(estimate);

    expect(order).toBeDefined();
    expect(order.dealId).toBe("DEAL-20240115-001");
    expect(order.customerName).toBe("営業テスト株式会社");
    expect(order.lineItems).toHaveLength(5);
    expect(order.lineItems[0]).toEqual(
      expect.objectContaining({
        lineId: 1,
        productName: "ソフトウェアライセンス A",
        quantity: 10,
        unitPrice: 5000,
      })
    );
    expect(order.lineItems[1]).toEqual(
      expect.objectContaining({
        lineId: 2,
        productName: "サポート・保守サービス",
        quantity: 3,
        unitPrice: 15000,
      })
    );
    expect(order.lineItems[2]).toEqual(
      expect.objectContaining({
        lineId: 3,
        productName: "カスタマイズ開発",
        quantity: 1,
        unitPrice: 200000,
      })
    );
    expect(order.lineItems[3]).toEqual(
      expect.objectContaining({
        lineId: 4,
        productName: "導入研修",
        quantity: 5,
        unitPrice: 8000,
      })
    );
    expect(order.lineItems[4]).toEqual(
      expect.objectContaining({
        lineId: 5,
        productName: "データ移行サービス",
        quantity: 2,
        unitPrice: 50000,
      })
    );
    expect(order.subtotal).toBe(totalSubtotal);
    expect(order.totalAmount).toBe(grandTotal);

    const invoice = generateInvoice(order);

    expect(invoice).toBeDefined();
    expect(invoice.dealId).toBe("DEAL-20240115-001");
    expect(invoice.customerName).toBe("営業テスト株式会社");
    expect(invoice.lineItems).toHaveLength(5);
    expect(invoice.lineItems[0]).toEqual(
      expect.objectContaining({
        lineId: 1,
        productName: "ソフトウェアライセンス A",
        quantity: 10,
        unitPrice: 5000,
      })
    );
    expect(invoice.lineItems[1]).toEqual(
      expect.objectContaining({
        lineId: 2,
        productName: "サポート・保守サービス",
        quantity: 3,
        unitPrice: 15000,
      })
    );
    expect(invoice.lineItems[2]).toEqual(
      expect.objectContaining({
        lineId: 3,
        productName: "カスタマイズ開発",
        quantity: 1,
        unitPrice: 200000,
      })
    );
    expect(invoice.lineItems[3]).toEqual(
      expect.objectContaining({
        lineId: 4,
        productName: "導入研修",
        quantity: 5,
        unitPrice: 8000,
      })
    );
    expect(invoice.lineItems[4]).toEqual(
      expect.objectContaining({
        lineId: 5,
        productName: "データ移行サービス",
        quantity: 2,
        unitPrice: 50000,
      })
    );
    expect(invoice.subtotal).toBe(totalSubtotal);
    expect(invoice.taxAmount).toBe(totalTaxAmount);
    expect(invoice.totalAmount).toBe(grandTotal);

    const line1Subtotal = 10 * 5000;
    const line2Subtotal = 3 * 15000;
    const line3Subtotal = 1 * 200000;
    const line4Subtotal = 5 * 8000;
    const line5Subtotal = 2 * 50000;

    const expectedSubtotal =
      line1Subtotal +
      line2Subtotal +
      line3Subtotal +
      line4Subtotal +
      line5Subtotal;
    const expectedTaxAmount = expectedSubtotal * 0.1;
    const expectedGrandTotal = expectedSubtotal + expectedTaxAmount;

    expect(invoice.totalAmount).toBe(expectedGrandTotal);
  });
});