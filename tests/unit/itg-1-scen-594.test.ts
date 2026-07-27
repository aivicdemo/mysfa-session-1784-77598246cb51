import { generateInvoice } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-594
  test("請求対象金額が未設定の場合、請求書生成が失敗する", () => {
    const mockDeal = {
      id: "deal-001",
      name: "テスト商談",
      stage: "成約",
      customer: "テスト顧客",
      invoiceAmount: null,
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

    expect(() =>
      generateInvoice(
        mockDeal,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      )
    ).toThrow(/金額/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(
      mockPaymentGatewayAdapter.generatePaymentLink
    ).not.toHaveBeenCalled();
  });
});