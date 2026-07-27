import {
  reconcileDealStatusAndInvoiceData,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-746
  test("[error] 商談ステータス・請求データ照合機能 - 商談ステータスが空の場合、照合は失敗する", () => {
    const dealId = "DEAL-001";
    const dealRecord = {
      dealId: dealId,
      status: null,
      amount: 0,
      customerId: "CUST-001",
    };

    const invoiceRecord = {
      dealId: dealId,
      invoiceAmount: 100000,
      invoiceDate: "2024-01-15",
      invoiceId: "INV-001",
    };

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

    const reconciliationLog: Array<{
      dealId: string;
      reconciliationStatus: string;
      failureReason: string;
      timestamp: string;
    }> = [];

    const result = reconcileDealStatusAndInvoiceData(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      reconciliationLog
    );

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("DEAL_STATUS_EMPTY");
    expect(result.errorMessage).toMatch(/商談ステータス/);

    expect(dealRecord).toEqual({
      dealId: dealId,
      status: "照合失敗",
      amount: 0,
      customerId: "CUST-001",
    });

    expect(reconciliationLog).toHaveLength(1);
    expect(reconciliationLog[0]).toEqual({
      dealId: dealId,
      reconciliationStatus: "照合失敗",
      failureReason: "商談ステータスが空",
      timestamp: expect.any(String),
    });

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.generateShareLink).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.deleteDocument).not.toHaveBeenCalled();

    expect(
      mockNotificationServiceAdapter.sendQuoteNotification
    ).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendOrderNotification
    ).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.getDeliveryStatus
    ).not.toHaveBeenCalled();

    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.verifyPayment).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.getTransactionStatus).not.toHaveBeenCalled();
  });
});