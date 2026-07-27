import { detectInvoiceDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-530: 商談クローズ日と請求書発行日が異なる年にあるとき、正常に日付ズレが計算される', () => {
    // Arrange
    const dealRecord = {
      dealId: 'DEAL-2024-001',
      status: 'クローズ',
      closeDate: new Date('2023-12-31T00:00:00Z'),
    };

    const invoiceRecord = {
      invoiceId: 'INV-2024-001',
      issueDate: new Date('2024-01-15T00:00:00Z'),
      status: '発行済み',
    };

    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-12345',
        url: 'https://storage.example.com/INV-2024-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/abc123',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-001',
        delivered: true,
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-002',
        delivered: true,
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-003',
        delivered: true,
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
        opened: true,
      }),
    };

    // Act
    const result = detectInvoiceDiscrepancy(
      dealRecord,
      invoiceRecord,
      documentStorageAdapterStub,
      notificationServiceAdapterStub
    );

    // Assert
    expect(result.discrepancyDetected).toBe(true);
    expect(result.discrepancyType).toBe('異なる年度');
    expect(result.closeDate).toEqual(new Date('2023-12-31T00:00:00Z'));
    expect(result.invoiceIssueDate).toEqual(new Date('2024-01-15T00:00:00Z'));
    expect(result.dateDifferenceDays).toBe(15);
    expect(result.fiscalYearDifference).toEqual({
      closeYear: 2023,
      invoiceYear: 2024,
    });
    expect(result.warningStatus).toBe('日付ズレあり');
    expect(result.recommendedAction).toBe(
      '請求書発行日が商談クローズ年度と異なります。請求書の発行日付を確認してください'
    );
  });
});