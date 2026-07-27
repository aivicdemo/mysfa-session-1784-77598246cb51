import { validateInvoiceData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-813
  test("請求対象データ妥当性検証機能 - 請求明細に負数の金額を含むとき、該当データを不承認と判定する", () => {
    const invoiceData = {
      customerId: "CUST-001",
      customerName: "テスト顧客",
      invoiceAmount: 40000,
      invoiceDetails: [
        {
          lineNumber: 1,
          productId: "PROD-A",
          productName: "商品A",
          quantity: 1,
          unitPrice: 50000,
          lineAmount: 50000,
        },
        {
          lineNumber: 2,
          productId: "PROD-B",
          productName: "商品B",
          quantity: 1,
          unitPrice: -30000,
          lineAmount: -30000,
        },
        {
          lineNumber: 3,
          productId: "PROD-C",
          productName: "商品C",
          quantity: 1,
          unitPrice: 20000,
          lineAmount: 20000,
        },
      ],
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

    const result = validateInvoiceData(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.isValid).toBe(false);
    expect(result.validationStatus).toBe("validation failed");
    expect(result.errorMessage).toMatch(/請求明細に負数の金額/);
    expect(result.errorMessage).toMatch(/行番号：2/);
    expect(result.errorMessage).toMatch(/-30000/);
    expect(result.approvalStatus).toBe("excluded");

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});