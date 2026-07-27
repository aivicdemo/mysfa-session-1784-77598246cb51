import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import type {
  Deal,
  Invoice,
  AmountMismatchDetectionResult,
} from "../../src/logic/it-1784969823049-1-1-1";
import {
  detectAmountMismatch,
} from "../../src/logic/it-1784969823049-1-1-1";

interface DocumentStorageAdapterStub {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface NotificationServiceAdapterStub {
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
  sendAmountMismatchAlert: jest.Mock;
}

interface PaymentGatewayAdapterStub {
  generatePaymentLink: jest.Mock;
  verifyPayment: jest.Mock;
  getTransactionStatus: jest.Mock;
}

describe("商談ステータスと請求データの紐付けと金額ズレ検出", () => {
  let documentStorageAdapterStub: DocumentStorageAdapterStub;
  let notificationServiceAdapterStub: NotificationServiceAdapterStub;
  let paymentGatewayAdapterStub: PaymentGatewayAdapterStub;

  beforeEach(() => {
    documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "doc-stub-001",
        url: "https://drive.example.com/stub",
      }),
      generateShareLink: jest
        .fn()
        .mockResolvedValue({
          shareLink: "https://drive.example.com/share/stub",
          expiresAt: "2024-12-31T23:59:59Z",
        }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ sent: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: "delivered" }),
      sendAmountMismatchAlert: jest.fn().mockResolvedValue({ sent: true }),
    };

    paymentGatewayAdapterStub = {
      generatePaymentLink: jest
        .fn()
        .mockResolvedValue({ paymentLink: "https://payment.example.com/stub" }),
      verifyPayment: jest
        .fn()
        .mockResolvedValue({ verified: true, transactionId: "tx-stub-001" }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: "completed" }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-278
  test("商談ステータスが『受注』に更新されたとき、請求金額が商談金額と完全に一致する場合、金額ズレは検出されない", async () => {
    const dealId = "DEAL-001";
    const invoiceId = "INV-001";
    const dealAmount = 1000000;
    const invoiceAmount = 1000000;

    const deal: Deal = {
      dealId: dealId,
      dealAmount: dealAmount,
      status: "受注",
      customerId: "CUST-001",
      createdAt: new Date("2024-01-15T10:00:00Z"),
      updatedAt: new Date("2024-01-15T11:00:00Z"),
    };

    const invoice: Invoice = {
      invoiceId: invoiceId,
      dealId: dealId,
      invoiceAmount: invoiceAmount,
      status: "下書き",
      issuedAt: new Date("2024-01-15T11:05:00Z"),
    };

    const result: AmountMismatchDetectionResult = await detectAmountMismatch(
      deal,
      invoice,
      {
        documentStorageAdapter: documentStorageAdapterStub,
        notificationServiceAdapter: notificationServiceAdapterStub,
        paymentGatewayAdapter: paymentGatewayAdapterStub,
      }
    );

    expect(result.hasMismatch).toBe(false);
    expect(result.mismatchAmount).toBe(0);
    expect(result.alertMessage).toBeNull();
    expect(result.mismatchDetectedFlag).toBe(false);
    expect(notificationServiceAdapterStub.sendAmountMismatchAlert).not.toHaveBeenCalled();
  });
});