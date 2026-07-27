import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-908: [error] 請求書承認検証機能 - 見積の金額と請求書の金額が不一致のとき検証が不合格になる
  test('見積金額と請求書金額が不一致の場合、検証エラーが返される', () => {
    const quoteData = {
      quoteId: 'QT-2024-001',
      customerName: '株式会社テスト',
      amount: 100000,
      lineItems: [
        {
          itemName: 'システム開発',
          quantity: 1,
          unitPrice: 100000,
        },
      ],
      status: 'confirmed',
    };

    const invoiceData = {
      invoiceId: 'INV-2024-001',
      quoteId: 'QT-2024-001',
      customerName: '株式会社テスト',
      amount: 120000,
      lineItems: [
        {
          itemName: 'システム開発',
          quantity: 1,
          unitPrice: 120000,
        },
      ],
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: 'file-123' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ status: 'sent' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ status: 'sent' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ status: 'sent' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true }),
    };

    const result = validateInvoiceApproval(
      invoiceData,
      quoteData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(result.isApproved).toBe(false);
    expect(result.validationStatus).toBe('validation_failed');
    expect(result.errorMessage).toMatch(/請求書金額/);
    expect(result.errorMessage).toMatch(/見積書金額/);
    expect(result.errorMessage).toMatch(/一致/);
    expect(result.invoiceStatus).toBe('validation_failed');
  });
});