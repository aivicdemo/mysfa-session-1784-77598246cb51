import { validateInvoiceContent } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-216
  test("顧客請求内容照合検証 - 請求金額・明細・税額が全て期待値と一致した場合に検証完了と判定される", () => {
    const invoiceData = {
      customerId: "CUST-001",
      invoiceMonth: "2024-04",
      invoiceAmount: 100000,
      invoiceDetails: [
        {
          itemId: "ITEM-A",
          itemName: "商品A",
          quantity: 10,
          unitPrice: 5000,
          lineAmount: 50000,
        },
        {
          itemId: "ITEM-B",
          itemName: "商品B",
          quantity: 10,
          unitPrice: 5000,
          lineAmount: 50000,
        },
      ],
      taxAmount: 10000,
      totalAmount: 110000,
      taxRate: 0.1,
    };

    const expectedInvoiceAmount = 100000;
    const expectedLineItems = [
      {
        itemId: "ITEM-A",
        itemName: "商品A",
        quantity: 10,
        unitPrice: 5000,
        lineAmount: 50000,
      },
      {
        itemId: "ITEM-B",
        itemName: "商品B",
        quantity: 10,
        unitPrice: 5000,
        lineAmount: 50000,
      },
    ];
    const expectedTaxAmount = 10000;
    const expectedTotalAmount = 110000;
    const expectedVerificationStatus = "検証完了";

    const result = validateInvoiceContent(invoiceData);

    expect(result.invoiceAmount).toBe(expectedInvoiceAmount);
    expect(result.invoiceDetails).toEqual(expectedLineItems);
    expect(result.taxAmount).toBe(expectedTaxAmount);
    expect(result.totalAmount).toBe(expectedTotalAmount);
    expect(result.verificationStatus).toBe(expectedVerificationStatus);
    expect(result.verificationCompletedAt).toBeDefined();
    expect(result.verificationMessage).toBe(
      "請求内容の検証が完了しました。"
    );
  });
});