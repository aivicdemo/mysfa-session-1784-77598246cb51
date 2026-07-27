import { detectInvoiceStatusMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-737
  test('商談ステータスが「失注」で請求書が発行されている場合、照合ズレが検出される', () => {
    // テストデータ: 商談レコード
    const dealRecord = {
      dealId: 'DEAL-001',
      customerName: 'テスト顧客A',
      amount: 100000,
      status: 'LOST',
    };

    // テストデータ: 請求書レコード
    const invoiceRecord = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      amount: 100000,
      issuedDate: '2024-01-15',
    };

    // DocumentStorageAdapterのスタブ化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-001',
        storageUrl: 'https://example.com/docs/DOC-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/DOC-001',
        expiresAt: '2024-01-22',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterのスタブ化
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-001',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-002',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        deliveryStatus: 'delivered',
        openedAt: '2024-01-15T12:30:00Z',
      }),
    };

    // 照合機能を実行
    const mismatchResult = detectInvoiceStatusMismatch(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // 期待結果の検証
    expect(mismatchResult).toEqual({
      detected: true,
      errorType: 'ステータス矛盾',
      targetDealId: 'DEAL-001',
      errorDetail: '失注ステータスの商談に請求書が存在します。商談ID: DEAL-001、請求金額: 100,000円',
      resolutionStatus: '未解決',
      timestamp: expect.any(String),
    });

    // 照合ズレが検出されたことを確認
    expect(mismatchResult.detected).toBe(true);
    expect(mismatchResult.errorType).toBe('ステータス矛盾');
    expect(mismatchResult.targetDealId).toBe('DEAL-001');
    expect(mismatchResult.resolutionStatus).toBe('未解決');
  });
});