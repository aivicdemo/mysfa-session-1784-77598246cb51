import { getTransactionStatusWithPolling } from '../../src/logic/it-1784969823049-2-1-2';

describe('GMO Payment Gateway連携 - 定期ポーリング機能', () => {
  // SCEN-174
  test('Webhook受信が失敗した場合、定期ポーリングで決済ステータスが確認される', async () => {
    const invoiceId = 'INV-2024-001';
    const customerId = 'CUST-5678';
    const paymentAmount = 150000;
    const transactionId = 'TXN-GMO-9876543';
    const pollingIntervalMs = 1000;
    const maxPollingAttempts = 5;

    let getTransactionStatusCallCount = 0;
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkUrl: 'https://payment.gmo.com/link/abc123',
        transactionId: transactionId,
        expiresAt: new Date('2024-12-31T23:59:59Z').toISOString(),
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn().mockImplementation(async (txnId: string) => {
        getTransactionStatusCallCount += 1;
        if (getTransactionStatusCallCount === 1) {
          return {
            transactionId: txnId,
            status: 'completed',
            paidAmount: paymentAmount,
            paidAt: new Date('2024-01-15T12:30:45Z').toISOString(),
          };
        }
        return {
          transactionId: txnId,
          status: 'completed',
          paidAmount: paymentAmount,
          paidAt: new Date('2024-01-15T12:30:45Z').toISOString(),
        };
      }),
    };

    const mockAuditLogAdapter = {
      logPaymentEvent: jest.fn().mockResolvedValue({ eventId: 'EVT-LOG-001' }),
      queryPaymentEvents: jest.fn(),
    };

    const result = await getTransactionStatusWithPolling(
      {
        invoiceId: invoiceId,
        customerId: customerId,
        paymentAmount: paymentAmount,
        transactionId: transactionId,
      },
      {
        paymentGateway: mockPaymentGatewayAdapter,
        auditLog: mockAuditLogAdapter,
      },
      {
        pollingIntervalMs: pollingIntervalMs,
        maxPollingAttempts: maxPollingAttempts,
      }
    );

    expect(result.invoiceStatus).toBe('paid');
    expect(result.transactionId).toBe(transactionId);
    expect(result.finalPaymentStatus).toBe('completed');
    expect(result.paidAmount).toBe(paymentAmount);
    expect(result.paidAt).toBe(new Date('2024-01-15T12:30:45Z').toISOString());

    expect(mockPaymentGatewayAdapter.getTransactionStatus).toHaveBeenCalledWith(transactionId);
    expect(mockPaymentGatewayAdapter.getTransactionStatus).toHaveBeenCalledTimes(1);

    expect(mockAuditLogAdapter.logPaymentEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: invoiceId,
        transactionId: transactionId,
        eventType: 'POLLING_STATUS_UPDATE',
        previousStatus: expect.any(String),
        newStatus: 'paid',
        paidAmount: paymentAmount,
        pollingAttemptNumber: 1,
        eventTimestamp: expect.any(String),
      })
    );

    expect(mockAuditLogAdapter.logPaymentEvent).toHaveBeenCalledTimes(1);
  });
});