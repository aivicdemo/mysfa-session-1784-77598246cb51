import {
  verifyDealAndInvoiceAlignment,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-286: [edge] 商談ステータスと請求データの紐付け・可視化 - 商談金額が最大規模の金額のとき、請求書との金額比較が正常に実行される
  test("商談金額が999999999円のとき、請求金額との比較が正確に実行され、金額一致状態で正常判定される", () => {
    const dealAmount = 999999999;
    const invoiceAmount = 999999999;
    const expectedDifference = 0;

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue("doc_id_123"),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.example.com/share/abc123",
      }),
      deleteDocument: jest.fn().mockResolvedValue(undefined),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest
        .fn()
        .mockResolvedValue({ status: "delivered" }),
      sendOrderNotification: jest
        .fn()
        .mockResolvedValue({ status: "delivered" }),
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ status: "delivered" }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ opened: true }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: "https://payment.example.com/pay/xyz789",
        transactionId: "txn_999",
      }),
      verifyPayment: jest
        .fn()
        .mockResolvedValue({ verified: true, paidAmount: invoiceAmount }),
      getTransactionStatus: jest
        .fn()
        .mockResolvedValue({ status: "completed" }),
    };

    const dealRecord = {
      dealId: "deal_edge_999999999",
      customerId: "cust_large_deal",
      dealAmount: dealAmount,
      dealStatus: "成約",
      dealDate: new Date("2024-04-15T10:00:00Z"),
    };

    const invoiceRecord = {
      invoiceId: "inv_edge_999999999",
      dealId: "deal_edge_999999999",
      customerId: "cust_large_deal",
      invoiceAmount: invoiceAmount,
      invoiceStatus: "発行済み",
      invoiceDate: new Date("2024-04-15T11:00:00Z"),
    };

    const result = verifyDealAndInvoiceAlignment(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result).toEqual({
      alignmentStatus: "正常",
      dealAmount: 999999999,
      invoiceAmount: 999999999,
      differencAmount: expectedDifference,
      matchMessage: "金額一致：差額 0円",
      isAligned: true,
      overflowDetected: false,
      roundingErrorDetected: false,
    });

    expect(result.dealAmount).toBe(999999999);
    expect(result.invoiceAmount).toBe(999999999);
    expect(result.differencAmount).toBe(0);
    expect(result.alignmentStatus).toBe("正常");
    expect(result.isAligned).toBe(true);
    expect(result.overflowDetected).toBe(false);
    expect(result.roundingErrorDetected).toBe(false);
  });
});