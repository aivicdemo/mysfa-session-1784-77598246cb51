import { verifyPaymentAndUpdateInvoice } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-1016
  test("GMO Payment Gateway連携 - verifyPaymentが予期しない応答形式を返した場合、不正な決済ステータスで請求書が更新されない", () => {
    const invoiceId = "INV-20240415-001";
    const customerId = "CUST-001";
    const invoiceAmount = 150000;

    const initialInvoice = {
      id: invoiceId,
      customerId: customerId,
      amount: invoiceAmount,
      status: "未払い" as const,
      issueDate: "2024-04-15T09:00:00Z",
      dueDate: "2024-05-15T23:59:59Z",
    };

    const mockPaymentGateway = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "TXN-20240415-9999",
        // 必須フィールド 'paymentStatus' が欠落した不正な応答
        amount: invoiceAmount,
        timestamp: "2024-04-15T10:30:00Z",
      }),
      getTransactionStatus: jest.fn(),
    };

    const mockDatabase = {
      getInvoiceById: jest.fn().mockResolvedValue(initialInvoice),
      updateInvoiceStatus: jest.fn(),
      recordTransactionStatus: jest.fn(),
    };

    const mockLogger = {
      error: jest.fn(),
      info: jest.fn(),
    };

    return verifyPaymentAndUpdateInvoice(
      invoiceId,
      mockPaymentGateway,
      mockDatabase,
      mockLogger
    ).then((result) => {
      expect(mockPaymentGateway.verifyPayment).toHaveBeenCalledWith(invoiceId);

      expect(mockDatabase.getInvoiceById).toHaveBeenCalledWith(invoiceId);

      expect(mockDatabase.updateInvoiceStatus).not.toHaveBeenCalled();

      expect(mockDatabase.recordTransactionStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId: invoiceId,
          status: "エラー",
          errorReason: expect.stringMatching(/応答形式/),
        })
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringMatching(/verifyPaymentからの応答形式が不正です/)
      );

      expect(result.invoiceStatus).toBe("未払い");
      expect(result.transactionStatus).toBe("エラー");
    });
  });
});