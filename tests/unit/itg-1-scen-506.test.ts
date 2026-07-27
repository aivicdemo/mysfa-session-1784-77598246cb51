import { detectDealInvoiceMismatch } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-506
  test("商談ステータスが「受注」で請求書金額が商談金額より10万円多いとき、金額ズレが検出される", () => {
    const dealRecord = {
      dealId: "DEAL-506",
      status: "受注",
      amount: 1000000,
      customerName: "テスト顧客A",
    };

    const invoiceRecord = {
      invoiceId: "INV-506",
      relatedDealId: "DEAL-506",
      invoiceAmount: 1100000,
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ success: true }),
      generateShareLink: jest.fn().mockResolvedValue({
        success: true,
        shareLink: "https://example.com/share/INV-506",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest
        .fn()
        .mockResolvedValue({ success: true, messageId: "msg-001" }),
      sendOrderNotification: jest
        .fn()
        .mockResolvedValue({ success: true, messageId: "msg-002" }),
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ success: true, messageId: "msg-003" }),
      getDeliveryStatus: jest
        .fn()
        .mockResolvedValue({ delivered: true, opened: false }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        success: true,
        paymentLink: "https://payment.example.com/link/INV-506",
      }),
      verifyPayment: jest.fn().mockResolvedValue({ paid: false }),
      getTransactionStatus: jest
        .fn()
        .mockResolvedValue({ status: "pending" }),
    };

    const detectionTime = new Date("2024-01-15T14:30:00Z");

    const result = detectDealInvoiceMismatch(
      dealRecord,
      invoiceRecord,
      {
        documentStorage: mockDocumentStorageAdapter,
        notificationService: mockNotificationServiceAdapter,
        paymentGateway: mockPaymentGatewayAdapter,
      },
      detectionTime
    );

    expect(result).toEqual({
      detected: true,
      mismatchType: "金額不一致",
      dealId: "DEAL-506",
      invoiceId: "INV-506",
      dealAmount: 1000000,
      invoiceAmount: 1100000,
      discrepancyAmount: 100000,
      discrepancyDirection: "請求書が過大",
      detectionTime: detectionTime,
      status: "未解決",
    });

    expect(result.detected).toBe(true);
    expect(result.mismatchType).toBe("金額不一致");
    expect(result.dealId).toBe("DEAL-506");
    expect(result.invoiceId).toBe("INV-506");
    expect(result.dealAmount).toBe(1000000);
    expect(result.invoiceAmount).toBe(1100000);
    expect(result.discrepancyAmount).toBe(100000);
    expect(result.discrepancyDirection).toBe("請求書が過大");
    expect(result.status).toBe("未解決");
  });
});