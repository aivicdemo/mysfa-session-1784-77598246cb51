import { issueQuote } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  test("SCEN-051: 帳票発行時の発行日時自動付与と発行履歴記録 - 帳票IDが欠けている入力で見積書を発行しようとしたときは例外が発生する", () => {
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

    const quoteInput = {
      documentId: "",
      customerId: "CUST-001",
      customerName: "テスト顧客",
      amount: 100000,
      taxRate: 0.1,
      dueDate: "2024-02-15",
      description: "テスト見積",
    };

    expect(() =>
      issueQuote(
        quoteInput,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter
      )
    ).toThrow(/帳票ID/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendQuoteNotification
    ).not.toHaveBeenCalled();
  });
});