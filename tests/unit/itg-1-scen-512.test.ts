import {
  detectDealInvoiceDiscrepancy,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-512
  test("商談ステータスが「受注」で複数の請求書がある場合、合計金額が商談金額と異なるとき、ズレが検出される", () => {
    // Arrange
    const dealId = "DEAL-001";
    const customerId = "CUST-001";
    const dealStatus = "受注";
    const dealAmount = 1000000;

    const invoices = [
      {
        invoiceId: "INV-001",
        dealId: dealId,
        customerId: customerId,
        amount: 400000,
        issuedDate: "2024-01-15",
        status: "発行済み",
      },
      {
        invoiceId: "INV-002",
        dealId: dealId,
        customerId: customerId,
        amount: 350000,
        issuedDate: "2024-01-16",
        status: "発行済み",
      },
      {
        invoiceId: "INV-003",
        dealId: dealId,
        customerId: customerId,
        amount: 200000,
        issuedDate: "2024-01-17",
        status: "発行済み",
      },
    ];

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-001",
        url: "https://storage.example.com/doc-001",
        uploadedAt: "2024-01-15T10:00:00Z",
      }),
      generateShareLink: jest
        .fn()
        .mockResolvedValue({ shareLink: "https://share.example.com/link-001" }),
      deleteDocument: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest
        .fn()
        .mockResolvedValue({ notificationId: "NOTIF-001", status: "sent" }),
      sendOrderNotification: jest
        .fn()
        .mockResolvedValue({ notificationId: "NOTIF-002", status: "sent" }),
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ notificationId: "NOTIF-003", status: "sent" }),
      getDeliveryStatus: jest
        .fn()
        .mockResolvedValue({ deliveryStatus: "delivered", openedAt: null }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "LINK-001",
        url: "https://payment.example.com/link-001",
        expiresAt: "2024-02-15T10:00:00Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "TXN-001",
        status: "completed",
        verifiedAt: "2024-01-20T10:00:00Z",
      }),
      getTransactionStatus: jest
        .fn()
        .mockResolvedValue({ transactionId: "TXN-001", status: "pending" }),
    };

    const deal = {
      dealId: dealId,
      customerId: customerId,
      status: dealStatus,
      amount: dealAmount,
      createdAt: "2024-01-10T09:00:00Z",
      invoiceIds: ["INV-001", "INV-002", "INV-003"],
    };

    // Act
    const result = detectDealInvoiceDiscrepancy(
      deal,
      invoices,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert
    expect(result.discrepancyDetected).toBe(true);
    expect(result.discrepancyStatus).toBe("ズレあり");
    expect(result.dealAmount).toBe(1000000);
    expect(result.invoiceTotalAmount).toBe(950000);
    expect(result.discrepancyAmount).toBe(50000);
    expect(result.discrepancyType).toBe(
      "請求書合計金額が商談金額より少ない"
    );
    expect(result.invoiceList).toHaveLength(3);
    expect(result.invoiceList[0].invoiceId).toBe("INV-001");
    expect(result.invoiceList[0].amount).toBe(400000);
    expect(result.invoiceList[1].invoiceId).toBe("INV-002");
    expect(result.invoiceList[1].amount).toBe(350000);
    expect(result.invoiceList[2].invoiceId).toBe("INV-003");
    expect(result.invoiceList[2].amount).toBe(200000);
    expect(result.warningMessage).toBeDefined();
    expect(result.warningMessage.length).toBeGreaterThan(0);
    expect(result.warningMessage).toContain("ズレ");
  });
});