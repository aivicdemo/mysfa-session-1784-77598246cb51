import { extractMonthlyReportData } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-125
  test('[normal] 月次報告期限到来を確認するアクティビティが完了の場合、データ抽出が実行される', () => {
    // Arrange: テストデータを準備
    const today = new Date('2024-01-15T00:00:00Z');
    const monthlyDeadlineDate = new Date('2024-01-10T00:00:00Z');

    const dealRecord = {
      dealId: 'DEAL-001',
      customerId: 'CUST-A001',
      dealName: 'テスト案件',
      amount: 1500000,
      monthlyReportDeadline: monthlyDeadlineDate,
      status: 'open',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    const confirmationActivity = {
      activityId: 'ACTIVITY-CONFIRM-001',
      dealId: 'DEAL-001',
      activityType: '月次報告期限到来確認',
      status: '完了',
      completedAt: new Date('2024-01-15T09:00:00Z'),
    };

    const extractedDealsData = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A001',
        dealName: 'テスト案件',
        amount: 1500000,
        monthlyReportDeadline: monthlyDeadlineDate,
        status: 'open',
      },
    ];

    // Mock: DocumentStorageAdapter.uploadDocument のスタブ
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'FILE-DOC-20240115-001',
        uploadStatus: 'success',
        uploadedAt: '2024-01-15T09:30:00Z',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // Mock: NotificationServiceAdapter.sendInvoiceNotification のスタブ
    const mockNotificationService = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-20240115-001',
        deliveryStatus: 'sent',
        sentAt: '2024-01-15T09:31:00Z',
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    // Act: 月次報告期限・データ抽出処理を実行
    const result = extractMonthlyReportData({
      currentDate: today,
      dealRecord,
      confirmationActivity,
      documentStorageAdapter: mockDocumentStorage,
      notificationServiceAdapter: mockNotificationService,
    });

    // Assert: 抽出処理の実行ステータスを確認
    expect(result.executionStatus).toBe('completed');
    expect(result.executionTimestamp).toBeDefined();

    // Assert: DocumentStorageAdapter.uploadDocument が正常に呼び出されたことを確認
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith({
      documentType: 'monthly_report_data',
      documentContent: expect.objectContaining({
        deals: extractedDealsData,
        extractionPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
        },
      }),
      fileName: expect.stringMatching(/monthly_report_.*\.pdf/),
    });

    // Assert: 返された結果が uploadDocument のレスポンスを含んでいることを確認
    expect(result.uploadedFileId).toBe('FILE-DOC-20240115-001');
    expect(result.uploadStatus).toBe('success');

    // Assert: 抽出対象の営業案件データが抽出済み状態に遷移していることを確認
    expect(result.extractedDealsCount).toBe(1);
    expect(result.extractedDeals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: 'DEAL-001',
          customerId: 'CUST-A001',
          dealName: 'テスト案件',
          amount: 1500000,
        }),
      ])
    );

    // Assert: 抽出処理が正常に完了し、NotificationServiceAdapter が通知を送信したことを確認
    expect(result.notificationSent).toBe(true);
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalled();
  });
});