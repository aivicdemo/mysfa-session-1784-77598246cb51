import {
  detectInvoiceAmountDiscrepancies,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-538: [edge] 金額ズレが許容範囲の上限を1円超えるとき、警告ズレとして検出される
  test("金額ズレが許容範囲上限を1円超過したとき警告ズレとして検出される", () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-001",
        url: "https://storage.example.com/doc-001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://share.example.com/doc-001",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest
        .fn()
        .mockResolvedValue({ notificationId: "notif-001", sent: true }),
      sendOrderNotification: jest
        .fn()
        .mockResolvedValue({ notificationId: "notif-002", sent: true }),
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ notificationId: "notif-003", sent: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        deliveryStatus: "delivered",
        openedAt: new Date("2024-01-15T12:00:00Z"),
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "pl-001",
        paymentUrl: "https://payment.example.com/pl-001",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "txn-001",
        verified: true,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: "completed",
        amount: 1000001,
      }),
    };

    const dealRecord = {
      dealId: "deal-001",
      dealAmount: 1000000,
      status: "受注確定",
      customerId: "customer-001",
      createdAt: new Date("2024-01-01T10:00:00Z"),
    };

    const invoiceRecord = {
      invoiceId: "invoice-001",
      invoiceAmount: 1000001,
      dealId: "deal-001",
      issuedAt: new Date("2024-01-15T11:00:00Z"),
      dueDate: new Date("2024-02-15T11:00:00Z"),
    };

    const toleranceRangeUpperLimit = 999;
    const amountDifference = invoiceRecord.invoiceAmount - dealRecord.dealAmount;

    const result = detectInvoiceAmountDiscrepancies(
      [dealRecord],
      [invoiceRecord],
      {
        documentStorageAdapter: mockDocumentStorageAdapter,
        notificationServiceAdapter: mockNotificationServiceAdapter,
        paymentGatewayAdapter: mockPaymentGatewayAdapter,
        toleranceRangeUpperLimit,
      }
    );

    expect(result).toEqual({
      discrepancies: [
        {
          dealId: "deal-001",
          invoiceId: "invoice-001",
          dealAmount: 1000000,
          invoiceAmount: 1000001,
          discrepancyAmount: 1,
          discrepancyClassification: "警告ズレ",
          toleranceUpperLimit: 999,
          isExceeded: true,
          detectedAt: expect.any(Date),
        },
      ],
      alertQueueEntries: [
        {
          alertId: expect.any(String),
          dealId: "deal-001",
          invoiceId: "invoice-001",
          alertType: "警告ズレ",
          discrepancyAmount: 1,
          createdAt: expect.any(Date),
          status: "pending",
        },
      ],
    });

    expect(result.discrepancies[0].discrepancyClassification).toBe("警告ズレ");
    expect(result.discrepancies[0].discrepancyAmount).toBe(1);
    expect(result.discrepancies[0].isExceeded).toBe(true);
    expect(result.alertQueueEntries).toHaveLength(1);
    expect(result.alertQueueEntries[0].alertType).toBe("警告ズレ");
  });
});