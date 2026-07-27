import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  reconcileDealStatusWithInvoiceData,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;
  let mockPaymentGatewayAdapter: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };
  });

  // SCEN-745
  test("商談レコードIDが欠落している場合、照合は失敗する", () => {
    const dealRecordWithMissingId = {
      dealRecordId: null,
      dealStatus: "won",
      dealAmount: 500000,
      expectedBillingDate: "2024-04-15T00:00:00Z",
    };

    const invoiceData = {
      invoiceId: "INV-2024-001",
      invoiceAmount: 500000,
      invoiceIssuedDate: "2024-04-15T00:00:00Z",
      invoiceStatus: "issued",
    };

    expect(() => {
      reconcileDealStatusWithInvoiceData(
        dealRecordWithMissingId,
        invoiceData,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      );
    }).toThrow(/dealRecordId/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});