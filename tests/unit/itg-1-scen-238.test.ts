import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  updateDealStatusAndLinkInvoiceData,
  DealStatusUpdateInput,
  DealStatusUpdateResult,
} from "../../src/logic/it-1-2";

const mockDocumentStorageAdapter = {
  uploadDocument: jest.fn(),
  generateShareLink: jest.fn(),
  deleteDocument: jest.fn(),
};

const mockNotificationServiceAdapter = {
  sendQuoteNotification: jest.fn(),
  sendOrderNotification: jest.fn(),
  sendInvoiceNotification: jest.fn(),
  getDeliveryStatus: jest.fn(),
};

const mockPaymentGatewayAdapter = {
  generatePaymentLink: jest.fn(),
  verifyPayment: jest.fn(),
  getTransactionStatus: jest.fn(),
};

describe("商談ステータスと請求データの紐付け・可視化", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-238
  test("商談ステータスを成約に変更する際、請求データ紐付けで請求書ステータスが『発行待ち』で初期化される", async () => {
    const dealId = "DEAL-001";
    const customerId = "CUST-001";
    const dealAmount = 150000;
    const dealDescription = "商品A 3個、商品B 2個";

    const assumedShareLinkResponse = {
      shareLink:
        "https://drive.google.com/file/d/abc123xyz789/view?usp=sharing",
      expiresAt: "2024-02-15T23:59:59Z",
    };

    const assumedPaymentLinkResponse = {
      paymentLink: "https://payment.example.com/gmo/invoice/INV-001",
      transactionId: "TXN-20240115-001",
      expiresAt: "2024-02-15T23:59:59Z",
    };

    const assumedEmailResponse = {
      messageId: "msg-20240115-001",
      deliveryStatus: "sent",
    };

    mockDocumentStorageAdapter.generateShareLink.mockResolvedValue(
      assumedShareLinkResponse
    );
    mockPaymentGatewayAdapter.generatePaymentLink.mockResolvedValue(
      assumedPaymentLinkResponse
    );
    mockNotificationServiceAdapter.sendInvoiceNotification.mockResolvedValue(
      assumedEmailResponse
    );

    const updateInput: DealStatusUpdateInput = {
      dealId: dealId,
      customerId: customerId,
      newStatus: "成約",
      dealAmount: dealAmount,
      dealDescription: dealDescription,
      customerEmail: "customer@example.com",
      customerName: "テスト顧客",
    };

    const result: DealStatusUpdateResult = await updateDealStatusAndLinkInvoiceData(
      updateInput,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.dealStatus).toBe("成約");
    expect(result.invoiceStatus).toBe("発行待ち");
    expect(result.invoiceId).toBeDefined();
    expect(result.invoiceId).toMatch(/^INV-/);

    expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: result.invoiceId,
      })
    );

    expect(
      mockPaymentGatewayAdapter.generatePaymentLink
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: result.invoiceId,
        invoiceAmount: dealAmount,
      })
    );

    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: "customer@example.com",
        invoiceId: result.invoiceId,
        invoiceAmount: dealAmount,
        paymentLink: assumedPaymentLinkResponse.paymentLink,
        shareLink: assumedShareLinkResponse.shareLink,
      })
    );

    expect(result.paymentLink).toBe(
      assumedPaymentLinkResponse.paymentLink
    );
    expect(result.shareLink).toBe(
      assumedShareLinkResponse.shareLink
    );
    expect(result.emailDeliveryStatus).toBe("sent");
  });
});