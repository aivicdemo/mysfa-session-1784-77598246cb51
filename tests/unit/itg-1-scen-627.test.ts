import { checkStatusInvoiceMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-627
  test('商談ステータスが「受注」で請求書発行日が商談クローズ日より早いとき、マイナスのズレと検出される', () => {
    // テストデータ準備：商談レコード
    const dealRecord = {
      dealId: 'DEAL-001',
      status: '受注',
      closeDate: new Date('2024-01-15'),
      amount: 1000000,
    };

    // テストデータ準備：請求書レコード
    const invoiceRecord = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      issueDate: new Date('2024-01-10'),
      amount: 1000000,
    };

    // DocumentStorageAdapterをモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'file-001',
        url: 'https://storage.example.com/file-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/file-001',
        expiresAt: new Date('2024-02-15'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterをモック化
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-001' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-002' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-003' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered' }),
    };

    // 自動照合・ズレ検出機能のエントリーポイントを実行
    const result = checkStatusInvoiceMismatch(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // 期待結果の検証
    expect(result.hasMismatch).toBe(true);
    expect(result.mismatchType).toBe('NEGATIVE_SKEW');
    expect(result.skewDays).toBe(-5);
    expect(result.dealId).toBe('DEAL-001');
    expect(result.dealStatus).toBe('受注');
    expect(result.invoiceIssueDate).toEqual(new Date('2024-01-10'));
    expect(result.dealCloseDate).toEqual(new Date('2024-01-15'));

    // ズレ情報がシステム内部の照合ログテーブルに記録されることを確認
    expect(result.reconciliationLogId).toBeDefined();
    expect(result.reconciliationLogId).toMatch(/^LOG-/);

    // 既に請求書が発行済みのため、sendInvoiceNotificationは呼び出されないことを確認
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
  });
});