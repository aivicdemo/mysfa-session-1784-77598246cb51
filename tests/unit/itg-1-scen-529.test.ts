import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { reconcileInvoiceWithDeal } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-529
  it('商談クローズ日と請求書発行日が異なる月にあるとき、正常に日付ズレが計算される', () => {
    // テストデータ準備: 商談レコード（クローズ日: 2024-01-31）
    const dealRecord = {
      id: 'deal-001',
      customerId: 'customer-001',
      dealName: 'Enterprise Contract',
      status: 'closed',
      closedDate: new Date('2024-01-31T00:00:00Z'),
      amount: 500000,
      details: [
        {
          itemId: 'item-001',
          itemName: 'Product A',
          quantity: 1,
          unitPrice: 500000,
        },
      ],
    };

    // テストデータ準備: 請求書レコード（発行日: 2024-02-01）
    const invoiceRecord = {
      id: 'invoice-001',
      dealId: 'deal-001',
      customerId: 'customer-001',
      invoiceDate: new Date('2024-02-01T00:00:00Z'),
      amount: 500000,
      details: [
        {
          itemId: 'item-001',
          itemName: 'Product A',
          quantity: 1,
          unitPrice: 500000,
        },
      ],
    };

    // DocumentStorageAdapter のモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'file-doc-001',
        fileName: 'invoice-001.pdf',
        url: 'https://storage.example.com/invoice-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/invoice-001',
        expirationTime: new Date('2024-02-15T00:00:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({
        success: true,
      }),
    };

    // NotificationServiceAdapter のモック化
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-quote-001',
        deliveryStatus: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-order-001',
        deliveryStatus: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-invoice-001',
        deliveryStatus: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        messageId: 'msg-invoice-001',
        deliveryStatus: 'delivered',
        openedAt: new Date('2024-02-02T10:30:00Z'),
      }),
    };

    // 日付ズレ検出機能の照合処理を実行
    const reconciliationResult = reconcileInvoiceWithDeal(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // 戻り値のズレ検出結果を検証
    expect(reconciliationResult).toBeDefined();

    // (1) ズレ検出フラグが true であることを確認
    expect(reconciliationResult.isDateMismatch).toBe(true);

    // (2) ズレのカテゴリが「異なる月」であることを確認
    expect(reconciliationResult.mismatchCategory).toBe('different_months');

    // (3) ズレ日数が 1 日であることを確認
    expect(reconciliationResult.daysDifference).toBe(1);

    // (4) 商談クローズ日と請求書発行日が明示的に記録されていることを確認
    expect(reconciliationResult.dealClosedDate).toEqual(new Date('2024-01-31T00:00:00Z'));
    expect(reconciliationResult.invoiceIssuedDate).toEqual(new Date('2024-02-01T00:00:00Z'));

    // (5) ズレの詳細メッセージに「商談と請求書の日付が異なる月にあります」という趣旨の文言が含まれることを確認
    expect(reconciliationResult.mismatchMessage).toMatch(/異なる月/);
    expect(reconciliationResult.mismatchMessage).toMatch(/商談/);
    expect(reconciliationResult.mismatchMessage).toMatch(/請求書/);

    // 追加検証: モックが正常に呼び出されたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
  });
});