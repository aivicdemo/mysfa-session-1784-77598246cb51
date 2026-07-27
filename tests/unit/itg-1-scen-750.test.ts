import { ReconciliationService } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-750
  test('同じ照合ロジックを2回実行した場合、同じ結果が得られる', async () => {
    // テストデータの準備
    const testDealData = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      status: '契約済み',
      amount: 100000,
      dealDate: '2024-01-15',
    };

    const testInvoiceData = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      amount: 100000,
      status: '未請求',
      createdAt: '2024-01-15T10:00:00Z',
    };

    // 外部サービスアダプターのスタブ定義
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'file-001',
        url: 'https://example.com/document/file-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/link-001',
        expiresAt: '2024-02-15T10:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-001' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-002' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-003' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: '2024-01-15T11:00:00Z',
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/pay-001',
        expiresAt: '2024-02-15T10:00:00Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'txn-001',
        status: 'completed',
        amount: 100000,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: 'txn-001',
        status: 'completed',
        amount: 100000,
        completedAt: '2024-01-15T12:00:00Z',
      }),
    };

    const mockSalesforceMetadataDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue({
        users: [
          {
            userId: 'user-001',
            edition: 'Professional',
            status: 'active',
          },
        ],
      }),
      fetchEditionDetails: jest.fn().mockResolvedValue({
        editions: [
          {
            name: 'Professional',
            contractCount: 10,
            usageCount: 8,
          },
        ],
      }),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue({
        features: [
          {
            name: 'API Calls',
            usage: 50000,
            limit: 100000,
          },
        ],
      }),
      fetchAnnualCostData: jest.fn().mockResolvedValue({
        annualCost: 1200000,
        renewalDate: '2024-12-31',
      }),
    };

    const mockLicenseAlertNotificationService = {
      sendLicenseOverageAlert: jest.fn().mockResolvedValue({ notificationId: 'notif-001' }),
      sendUnusedUserAlert: jest.fn().mockResolvedValue({ notificationId: 'notif-002' }),
      sendCostForecastAlert: jest.fn().mockResolvedValue({ notificationId: 'notif-003' }),
    };

    // 1回目の照合実行
    const reconciliationService = new ReconciliationService(
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockSalesforceMetadataDataSource,
      mockLicenseAlertNotificationService
    );

    const result1 = await reconciliationService.reconcileDealAndInvoice(
      testDealData,
      testInvoiceData
    );

    // テストデータベースの巻き戻し（トランザクションロールバック）
    // 実装上、同じテストデータを使用して次の実行を準備
    const rolledBackDealData = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      status: '契約済み',
      amount: 100000,
      dealDate: '2024-01-15',
    };

    const rolledBackInvoiceData = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      amount: 100000,
      status: '未請求',
      createdAt: '2024-01-15T10:00:00Z',
    };

    // スタブの状態を1回目と同じに復元
    mockDocumentStorageAdapter.uploadDocument.mockClear();
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValue({
      fileId: 'file-001',
      url: 'https://example.com/document/file-001',
    });

    mockNotificationServiceAdapter.sendInvoiceNotification.mockClear();
    mockNotificationServiceAdapter.sendInvoiceNotification.mockResolvedValue({
      messageId: 'msg-003',
    });

    mockPaymentGatewayAdapter.generatePaymentLink.mockClear();
    mockPaymentGatewayAdapter.generatePaymentLink.mockResolvedValue({
      paymentLink: 'https://payment.example.com/pay-001',
      expiresAt: '2024-02-15T10:00:00Z',
    });

    mockSalesforceMetadataDataSource.fetchLicenseUsers.mockClear();
    mockSalesforceMetadataDataSource.fetchLicenseUsers.mockResolvedValue({
      users: [
        {
          userId: 'user-001',
          edition: 'Professional',
          status: 'active',
        },
      ],
    });

    mockLicenseAlertNotificationService.sendLicenseOverageAlert.mockClear();
    mockLicenseAlertNotificationService.sendLicenseOverageAlert.mockResolvedValue({
      notificationId: 'notif-001',
    });

    // 2回目の照合実行
    const result2 = await reconciliationService.reconcileDealAndInvoice(
      rolledBackDealData,
      rolledBackInvoiceData
    );

    // タイムスタンプを除くすべてのプロパティが一致するか検証
    expect(result1.status).toBe(result2.status);
    expect(result1.discrepancies).toEqual(result2.discrepancies);
    expect(result1.reconciliationScore).toBe(result2.reconciliationScore);
    expect(result1.dealId).toBe(result2.dealId);
    expect(result1.invoiceId).toBe(result2.invoiceId);
    expect(result1.customerId).toBe(result2.customerId);
    expect(result1.matchedAmount).toBe(result2.matchedAmount);
    expect(result1.dealAmount).toBe(result2.dealAmount);
    expect(result1.invoiceAmount).toBe(result2.invoiceAmount);
  });
});