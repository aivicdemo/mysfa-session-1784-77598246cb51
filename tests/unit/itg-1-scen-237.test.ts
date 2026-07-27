import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { linkInvoiceDataToClosedDeal } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  let documentStorageAdapterStub: any;
  let notificationServiceAdapterStub: any;
  let paymentGatewayAdapterStub: any;

  beforeEach(() => {
    documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        success: true,
        documentId: "DOC-237-001",
        storagePath: "gs://bucket/invoice/DOC-237-001.pdf",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        success: true,
        shareLink:
          "https://drive.google.com/file/d/1abc123/view?usp=sharing",
        expiresAt: "2025-02-14T23:59:59Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    notificationServiceAdapterStub = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        success: true,
        messageId: "MSG-237-001",
        sentAt: "2025-01-15T09:00:00Z",
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({ success: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: null,
      }),
    };

    paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        success: true,
        paymentLinkId: "LINK-237-001",
        paymentUrl: "https://payment.gmo.com/link/LINK-237-001",
        expiresAt: "2025-02-14T23:59:59Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        success: true,
        transactionId: "TXN-237-001",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: "pending",
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("SCEN-237: 商談ステータスを成約に変更する際、請求データ紐付けで請求書支払期限が営業ルール通りに計算される", async () => {
    const currentDate = new Date("2025-01-15T00:00:00Z");
    const expectedPaymentDueDate = new Date("2025-02-14T23:59:59Z");

    const testCustomer = {
      customerId: "CUST-001",
      customerName: "テスト太郎",
      paymentTermsDays: 30,
      email: "test.taro@example.com",
    };

    const testDeal = {
      dealId: "DEAL-237",
      dealName: "テスト商談",
      customerId: testCustomer.customerId,
      amount: 100000,
      currentStatus: "提案中",
      newStatus: "成約",
      createdAt: "2025-01-15T09:00:00Z",
    };

    const result = await linkInvoiceDataToClosedDeal(
      testDeal,
      testCustomer,
      currentDate,
      documentStorageAdapterStub,
      notificationServiceAdapterStub,
      paymentGatewayAdapterStub
    );

    expect(result.dealId).toBe("DEAL-237");
    expect(result.dealStatus).toBe("成約");
    expect(result.invoiceGenerated).toBe(true);
    expect(result.invoiceId).toBeDefined();
    expect(result.customerId).toBe("CUST-001");
    expect(result.invoiceAmount).toBe(100000);
    expect(result.paymentDueDate).toEqual(expectedPaymentDueDate);
    expect(result.paymentTermsDays).toBe(30);

    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledTimes(1);
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: expect.any(String),
        dealId: "DEAL-237",
        customerId: "CUST-001",
        amount: 100000,
        paymentDueDate: expectedPaymentDueDate,
      })
    );

    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalledTimes(
      1
    );
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: expect.any(String),
        customerEmail: "test.taro@example.com",
        customerName: "テスト太郎",
        amount: 100000,
        paymentDueDate: expectedPaymentDueDate,
      })
    );

    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: expect.any(String),
        customerId: "CUST-001",
        amount: 100000,
        currency: "JPY",
      })
    );

    expect(result.documentStoragePath).toBe(
      "gs://bucket/invoice/DOC-237-001.pdf"
    );
    expect(result.paymentLinkId).toBe("LINK-237-001");
    expect(result.paymentUrl).toBe("https://payment.gmo.com/link/LINK-237-001");
  });
});