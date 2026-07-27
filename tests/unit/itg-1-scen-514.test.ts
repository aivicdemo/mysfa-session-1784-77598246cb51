import { reconcileDealStatusAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-514
  test('商談ステータスが「失注」のとき、請求書との照合は実施されない', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentId: 'doc-123' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share/doc-123' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/invoice-456' }),
      verifyPayment: jest.fn().mockResolvedValue({ status: 'completed' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ transactionId: 'txn-789', status: 'settled' }),
    };

    const dealRecord = {
      dealId: 'deal-001',
      dealName: 'テスト商談-失注',
      customerId: 'customer-001',
      customerName: 'テスト顧客A',
      amount: 100000,
      previousStatus: '提案中',
      currentStatus: '失注',
      invoiceId: null,
      invoiceStatus: null,
      invoiceIssuedDate: null,
    };

    const result = reconcileDealStatusAndInvoice(
      dealRecord,
      mockDocumentStorageAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.reconciliationExecuted).toBe(false);
    expect(result.statusChangeAllowed).toBe(true);
    expect(result.dealStatus).toBe('失注');
    expect(result.discrepancyDetected).toBe(false);
    expect(result.discrepancyMessages).toEqual([]);
    expect(result.userNotificationMessage).toBeNull();

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});