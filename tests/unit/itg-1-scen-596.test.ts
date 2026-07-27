import { generateInvoiceFromDeal } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-596
  test("商談ステータスが『完了』の場合、請求書を生成する", async () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-20240115-001",
        cloudStoragePath: "gs://invoice-storage/DOC-20240115-001.pdf",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        emailId: "EMAIL-20240115-001",
        deliveryStatus: "送信完了",
      }),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkUrl: "https://payment.example.com/pay/INV-20240115-001",
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const dealRecord = {
      dealId: "DEAL-001",
      customerName: "テスト顧客A",
      dealAmount: 100000,
      dealStatus: "完了",
      items: [
        {
          productName: "商品A",
          quantity: 2,
          unitPrice: 50000,
        },
      ],
      customerEmail: "customer-a@example.com",
      generatedAt: new Date("2024-01-15T11:00:00Z"),
    };

    const result = await generateInvoiceFromDeal(
      dealRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.invoiceStatus).toBe("生成完了");
    expect(result.linkedDealId).toBe("DEAL-001");
    expect(result.invoicePdf).toEqual({
      dealId: "DEAL-001",
      dealAmount: 100000,
      items: [
        {
          productName: "商品A",
          quantity: 2,
          unitPrice: 50000,
        },
      ],
      customerName: "テスト顧客A",
      generatedAt: new Date("2024-01-15T11:00:00Z"),
    });

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: "DEAL-001",
        dealAmount: 100000,
        customerName: "テスト顧客A",
      })
    );
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: expect.any(String),
        amount: 100000,
      })
    );
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(
      1
    );

    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: "customer-a@example.com",
        invoiceId: expect.any(String),
      })
    );
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledTimes(1);

    expect(result.recordCreatedAt).toEqual(new Date("2024-01-15T11:00:00Z"));
    expect(typeof result.invoiceId).toBe("string");
  });
});