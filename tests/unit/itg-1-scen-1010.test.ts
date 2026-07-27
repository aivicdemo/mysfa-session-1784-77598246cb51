import { verifyPaymentAndUpdateInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-1010
  test('GMO Payment Gateway連携 - verifyPaymentが成功応答を受けた場合、支払い完了が確認され請求書ステータスが更新される', async () => {
    const invoiceId = 'INV-20240115-001';
    const expectedTransactionId = 'TXN-12345';
    const expectedAmount = 100000;
    const expectedCurrency = 'JPY';
    const expectedCompletedAt = '2024-01-15T10:30:00Z';

    const mockPaymentGatewayAdapter = {
      verifyPayment: jest.fn().mockResolvedValue({
        success: true,
        transactionId: expectedTransactionId,
        amount: expectedAmount,
        currency: expectedCurrency,
        completedAt: expectedCompletedAt,
      }),
    };

    const initialInvoice = {
      id: invoiceId,
      customerId: 'CUST-12345',
      amount: expectedAmount,
      currency: expectedCurrency,
      status: '支払い待機中',
      transactionId: null,
      paymentCompletedAt: null,
    };

    const result = await verifyPaymentAndUpdateInvoice(
      initialInvoice,
      expectedTransactionId,
      mockPaymentGatewayAdapter
    );

    expect(result.status).toBe('支払い完了');
    expect(result.transactionId).toBe(expectedTransactionId);
    expect(result.amount).toBe(expectedAmount);
    expect(result.currency).toBe(expectedCurrency);
    expect(result.paymentCompletedAt).toBe(expectedCompletedAt);
    expect(mockPaymentGatewayAdapter.verifyPayment).toHaveBeenCalledWith(
      expectedTransactionId
    );
  });
});