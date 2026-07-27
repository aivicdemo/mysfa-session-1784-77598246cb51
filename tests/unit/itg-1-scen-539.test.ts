import { detectDuplicateInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-539
  test('同一の商談に対して複数の請求書が重複データとして含まれるとき、重複が検出される', () => {
    // Arrange: テストデータ準備
    const dealId = 'DEAL-001';
    const invoiceData = [
      {
        invoiceId: 'INV-001',
        dealId: dealId,
        amount: 100000,
        status: 'unpublished',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        invoiceId: 'INV-002',
        dealId: dealId,
        amount: 100000,
        status: 'unpublished',
        createdAt: new Date('2024-01-15T10:05:00Z'),
      },
    ];

    // スタブ: DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-123',
        shareLink: 'https://drive.google.com/file/d/abc123/view',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/file/d/abc123/view',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // スタブ: NotificationServiceAdapter
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ sent: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: new Date('2024-01-15T11:00:00Z'),
      }),
    };

    // Act: 重複検出処理を実行
    const detectionResult = detectDuplicateInvoices(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // Assert: 期待結果を検証
    expect(detectionResult).toBeDefined();
    expect(detectionResult.duplicateType).toBe('multiple_invoices_same_deal');
    expect(detectionResult.dealId).toBe('DEAL-001');
    expect(detectionResult.duplicateInvoiceIds).toEqual(['INV-001', 'INV-002']);
    expect(detectionResult.status).toBe('DETECTED');
    expect(detectionResult.detectedAt).toBeInstanceOf(Date);
    expect(detectionResult.duplicateInvoiceIds.length).toBe(2);
  });
});