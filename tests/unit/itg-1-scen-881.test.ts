import { verifyInvoiceWithDiscount } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求書承認検証機能', () => {
  // SCEN-881
  test('割引が適用されている場合、割引額が正確に反映される', () => {
    // 準備：請求書データ
    const invoiceData = {
      invoiceId: 'INV-20240415-001',
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      invoiceDate: '2024-04-15',
      dueDate: '2024-05-15',
      lineItems: [
        {
          productId: 'PROD-A',
          productName: '商品A',
          unitPrice: 10000,
          quantity: 2,
          amount: 20000,
        },
        {
          productId: 'PROD-B',
          productName: '商品B',
          unitPrice: 5000,
          quantity: 1,
          amount: 5000,
        },
      ],
      subtotal: 25000,
      discountType: '定率割引',
      discountRate: 20,
      discountAmount: 5000,
      totalAfterDiscount: 20000,
      status: '承認待ち',
    };

    // モック化：DocumentStorageAdapter
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-20240415-001',
        fileUrl: 'https://drive.google.com/file/d/mock-file-id/view',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/file/d/mock-file-id/view?usp=sharing',
        expiresAt: '2024-04-22T00:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // モック化：NotificationServiceAdapter
    const mockNotificationService = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-001',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-002',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: '2024-04-15T14:30:00Z',
      }),
    };

    // テスト実行
    const result = verifyInvoiceWithDiscount(
      invoiceData,
      mockDocumentStorage,
      mockNotificationService,
    );

    // アサーション：割引計算の検証
    expect(result.subtotal).toBe(25000);
    expect(result.discountAmount).toBe(5000);
    expect(result.totalAfterDiscount).toBe(20000);
    expect(result.discountRate).toBe(20);

    // アサーション：割引額の計算式検証
    const expectedDiscountAmount = 25000 * (20 / 100);
    expect(result.discountAmount).toBe(expectedDiscountAmount);

    // アサーション：割引後合計の検証
    const expectedTotalAfterDiscount = 25000 - 5000;
    expect(result.totalAfterDiscount).toBe(expectedTotalAfterDiscount);

    // アサーション：DocumentStorageAdapter.uploadDocument が呼び出されたことを確認
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-20240415-001',
        customerId: 'CUST-001',
        subtotal: 25000,
        discountAmount: 5000,
        totalAfterDiscount: 20000,
      }),
    );

    // アサーション：NotificationServiceAdapter.sendInvoiceNotification が呼び出されたことを確認
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-20240415-001',
        customerEmail: expect.any(String),
        totalAfterDiscount: 20000,
      }),
    );

    // アサーション：請求書ステータスが「承認済み」に更新されていることを確認
    expect(result.status).toBe('承認済み');

    // アサーション：ドキュメント ID が生成されていることを確認
    expect(result.documentId).toBe('DOC-20240415-001');

    // アサーション：PDF URL が設定されていることを確認
    expect(result.fileUrl).toMatch(/^https:\/\/drive\.google\.com/);
  });
});