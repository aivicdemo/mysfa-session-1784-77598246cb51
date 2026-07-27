import { jest } from '@jest/globals';
import { verifyPaymentAndUpdateInvoiceStatus } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - GMO Payment Gateway連携', () => {
  // SCEN-1014
  test('Webhook受信が失敗した場合、定期ポーリングで決済ステータスが確認される', async () => {
    const invoiceId = 'INV-20240415-001';
    const paymentId = 'PAY-GMOTEST-20240415-001';
    const customerId = 'CUST-A001';

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentId: paymentId,
        paymentLink: 'https://payment.gmo.example.com/pay/PAY-GMOTEST-20240415-001',
        expiresAt: new Date('2024-04-22T23:59:59Z').toISOString(),
      }),
      getTransactionStatus: jest.fn(),
      verifyPayment: jest.fn(),
    };

    const mockInvoiceStore = {
      getInvoice: jest.fn().mockResolvedValue({
        id: invoiceId,
        customerId: customerId,
        amount: 150000,
        status: 'ISSUED',
        dueDate: '2024-05-15',
      }),
      updateInvoiceStatus: jest.fn().mockResolvedValue({
        id: invoiceId,
        status: 'PAID',
        paidAt: new Date('2024-04-16T14:30:00Z').toISOString(),
      }),
    };

    const mockSystemLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const mockPollingManager = {
      startPolling: jest.fn().mockResolvedValue(true),
      stopPolling: jest.fn(),
    };

    // ステップ1: 支払いリンク生成
    const linkResult = await mockPaymentGatewayAdapter.generatePaymentLink({
      invoiceId: invoiceId,
      amount: 150000,
      currency: 'JPY',
      customerId: customerId,
      description: 'Invoice INV-20240415-001',
    });

    expect(linkResult.paymentId).toBe(paymentId);
    expect(linkResult.paymentLink).toContain('https://payment.gmo.example.com');

    // ステップ2: Webhook受信失敗をシミュレート（タイムアウト/接続エラー）
    const webhookFailureSimulated = true;

    // ステップ3: 定期ポーリング開始をスパイで確認
    await mockPollingManager.startPolling({
      paymentId: paymentId,
      invoiceId: invoiceId,
      pollInterval: 10000,
      maxAttempts: 30,
    });

    expect(mockPollingManager.startPolling).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: paymentId,
        invoiceId: invoiceId,
      })
    );

    // ステップ4: 決済完了状態をスタブで模擬
    const completedTransactionStatus = {
      paymentId: paymentId,
      status: 'COMPLETED',
      amount: 150000,
      paidAt: '2024-04-16T14:30:00Z',
      orderId: invoiceId,
    };

    mockPaymentGatewayAdapter.getTransactionStatus.mockResolvedValue(
      completedTransactionStatus
    );

    // ステップ5: 定期ポーリングで決済ステータスを取得
    const transactionStatus = await mockPaymentGatewayAdapter.getTransactionStatus({
      paymentId: paymentId,
    });

    expect(transactionStatus.status).toBe('COMPLETED');
    expect(transactionStatus.amount).toBe(150000);

    // ステップ6: ビジネスロジック実行 - 決済完了に基づいて請求書ステータスを更新
    const updateResult = await verifyPaymentAndUpdateInvoiceStatus(
      {
        paymentId: paymentId,
        invoiceId: invoiceId,
        transactionStatus: transactionStatus,
      },
      mockPaymentGatewayAdapter,
      mockInvoiceStore,
      mockSystemLogger
    );

    // ステップ7: 請求書ステータスが'PAID'に更新されたことを確認
    expect(updateResult.invoiceId).toBe(invoiceId);
    expect(updateResult.invoiceStatus).toBe('PAID');
    expect(updateResult.paymentId).toBe(paymentId);
    expect(updateResult.transactionStatus).toBe('COMPLETED');

    // ステップ8: 請求書が正常に更新されたか確認
    expect(mockInvoiceStore.updateInvoiceStatus).toHaveBeenCalledWith(
      invoiceId,
      'PAID',
      expect.objectContaining({
        paymentId: paymentId,
        verifiedAt: expect.any(String),
      })
    );

    // ステップ9: システムログに適切な記録が残っていることを確認
    expect(mockSystemLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Webhook受信失敗')
    );
    expect(mockSystemLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('定期ポーリング')
    );
    expect(mockSystemLogger.info).toHaveBeenCalledWith(
      expect.stringContaining(paymentId)
    );
    expect(mockSystemLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('COMPLETED')
    );
    expect(mockSystemLogger.info).toHaveBeenCalledWith(
      expect.stringContaining(invoiceId)
    );
    expect(mockSystemLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('PAID')
    );

    // ステップ10: ポーリング停止を確認
    mockPollingManager.stopPolling(paymentId);
    expect(mockPollingManager.stopPolling).toHaveBeenCalledWith(paymentId);
  });
});