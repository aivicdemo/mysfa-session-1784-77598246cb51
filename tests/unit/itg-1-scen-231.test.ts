import { updateDealStatusToClosedWithInvoiceGeneration } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  test('SCEN-231: 商談ステータスを成約に変更した場合、GoogleDriveAPIで請求書PDF生成が失敗してもステータス更新は成功し、代替処理に切り替わる', async () => {
    // テストデータの準備
    const dealId = 'DEAL-001';
    const customerName = 'テスト太郎';
    const dealAmount = 100000;
    const currentStatus = '提案';
    const targetStatus = '成約';

    // モック: DocumentStorageAdapter - uploadDocument がエラーを返す
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockRejectedValueOnce(
        new Error('Network timeout')
      ),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // モック: NotificationServiceAdapter - sendInvoiceNotification が正常動作
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        deliveryStatus: 'sent',
        sentAt: '2024-01-15T11:00:00Z',
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    // モック: PaymentGatewayAdapter - generatePaymentLink が正常動作
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/link/12345',
        transactionId: 'TXN-12345',
        expiresAt: '2024-02-15T11:00:00Z',
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // 入力データ
    const dealInput = {
      dealId,
      customerName,
      amount: dealAmount,
      currentStatus,
      targetStatus,
      customerEmail: 'test.taro@example.com',
      invoiceDetails: {
        description: 'Software License - Annual',
        quantity: 1,
        unitPrice: dealAmount,
      },
    };

    // 関数を実行
    const result = await updateDealStatusToClosedWithInvoiceGeneration(
      dealInput,
      {
        documentStorageAdapter: mockDocumentStorageAdapter,
        notificationServiceAdapter: mockNotificationServiceAdapter,
        paymentGatewayAdapter: mockPaymentGatewayAdapter,
      }
    );

    // 期待結果: 商談ステータスが「成約」に正常に更新されている
    expect(result.dealStatus).toBe('成約');
    expect(result.dealId).toBe('DEAL-001');

    // 期待結果: DocumentStorageAdapter の uploadDocument が呼び出され、エラーが発生している
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();

    // 期待結果: 再試行ロジックが実行され、最大3回の試行が行われている
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);

    // 期待結果: 代替処理が実行され、PDFがシステム内部の一時フォルダに保存されている
    expect(result.fallbackPdfPath).toBeDefined();
    expect(result.fallbackPdfPath).toMatch(/^\/tmp\/fallback-invoice-.+\.pdf$/);

    // 期待結果: ユーザーへの警告メッセージが返却されている
    expect(result.userMessage).toBe(
      '文書の保存に失敗しました。システム管理者に連絡してください'
    );

    // 期待結果: NotificationServiceAdapter の sendInvoiceNotification が正常に実行されている
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: 'test.taro@example.com',
        dealId: 'DEAL-001',
        amount: dealAmount,
      })
    );
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(1);

    // 期待結果: PaymentGatewayAdapter の generatePaymentLink が正常に実行されている
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: 'DEAL-001',
        amount: dealAmount,
      })
    );
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(result.paymentLink).toBe('https://payment.example.com/link/12345');

    // 期待結果: 処理が正常に完了し、管理画面からのダウンロードが可能な状態になっている
    expect(result.isManualDownloadAvailable).toBe(true);
  });
});