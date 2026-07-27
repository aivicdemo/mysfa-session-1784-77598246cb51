import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { verifyAndApproveInvoice } from '../../src/logic/it-1-1';

// Mock adapters
const mockDocumentStorageAdapter = {
  uploadDocument: jest.fn(),
  generateShareLink: jest.fn(),
  deleteDocument: jest.fn(),
};

const mockNotificationServiceAdapter = {
  sendQuoteNotification: jest.fn(),
  sendOrderNotification: jest.fn(),
  sendInvoiceNotification: jest.fn(),
  getDeliveryStatus: jest.fn(),
};

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-860
  test('請求書承認検証機能 - 顧客のメールアドレスが請求書に正確に反映される', async () => {
    // 準備: テスト用の顧客データ
    const customerData = {
      customerId: 'CUST-001',
      customerName: 'テスト株式会社',
      emailAddress: 'invoice@test-company.jp',
    };

    // 請求書の基本情報
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      invoiceDate: '2024-01-15',
      invoiceAmount: 150000,
      customerId: customerData.customerId,
      lineItems: [
        {
          itemId: 'ITEM-001',
          itemName: 'コンサルティングサービス',
          quantity: 1,
          unitPrice: 100000,
          totalPrice: 100000,
        },
        {
          itemId: 'ITEM-002',
          itemName: 'サポート費用',
          quantity: 1,
          unitPrice: 50000,
          totalPrice: 50000,
        },
      ],
    };

    // DocumentStorageAdapter のスタブが正常に応答
    const assumedPdfContent = {
      invoiceId: invoiceData.invoiceId,
      invoiceDate: invoiceData.invoiceDate,
      invoiceAmount: invoiceData.invoiceAmount,
      customerName: customerData.customerName,
      customerEmailAddress: customerData.emailAddress,
      lineItems: invoiceData.lineItems,
    };

    const assumedDocumentUrl = 'https://storage.example.com/invoices/INV-2024-001.pdf';
    const assumedShareLink = 'https://share.example.com/inv-2024-001-temp-link';

    mockDocumentStorageAdapter.uploadDocument.mockResolvedValue({
      documentUrl: assumedDocumentUrl,
      documentId: 'DOC-INV-2024-001',
    });

    mockDocumentStorageAdapter.generateShareLink.mockResolvedValue({
      shareLink: assumedShareLink,
      expirationTime: '2024-01-22T11:00:00Z',
    });

    // NotificationServiceAdapter のスタブが正常に応答
    mockNotificationServiceAdapter.sendInvoiceNotification.mockResolvedValue({
      notificationId: 'NOTIF-INV-2024-001',
      sentAt: '2024-01-15T11:30:00Z',
      deliveryStatus: 'sent',
    });

    // 実行: 請求書生成と承認ワークフロー
    const result = await verifyAndApproveInvoice(
      customerData,
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
    );

    // 検証 1: 請求書 PDF 内に顧客メールアドレスが記載されている
    expect(result.generatedInvoice.customerEmailAddress).toBe(
      customerData.emailAddress,
    );

    // 検証 2: 生成された請求書の内容が正確に反映されている
    expect(result.generatedInvoice.customerId).toBe(customerData.customerId);
    expect(result.generatedInvoice.customerName).toBe(customerData.customerName);
    expect(result.generatedInvoice.invoiceAmount).toBe(invoiceData.invoiceAmount);
    expect(result.generatedInvoice.lineItems).toEqual(invoiceData.lineItems);

    // 検証 3: DocumentStorageAdapter が正しく呼び出されている
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: invoiceData.invoiceId,
        customerEmailAddress: customerData.emailAddress,
      }),
    );

    expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: 'DOC-INV-2024-001',
      }),
    );

    // 検証 4: NotificationServiceAdapter の sendInvoiceNotification が呼び出されている
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();

    // 検証 5: sendInvoiceNotification の呼び出し時に受信者メールアドレスが正確に指定されている
    const sendInvoiceNotificationCall =
      mockNotificationServiceAdapter.sendInvoiceNotification.mock.calls[0][0];
    expect(sendInvoiceNotificationCall.recipientEmailAddress).toBe(
      customerData.emailAddress,
    );

    // 検証 6: 通知対象の請求書 ID が正確に指定されている
    expect(sendInvoiceNotificationCall.invoiceId).toBe(invoiceData.invoiceId);

    // 検証 7: 承認状態が正確に設定されている
    expect(result.approvalStatus).toBe('approved');

    // 検証 8: 通知送信が成功している
    expect(result.notificationSent).toBe(true);
    expect(result.notificationId).toBe('NOTIF-INV-2024-001');

    // 検証 9: 顧客メールアドレスが一貫して正確に反映されている全体フロー
    expect(result.generatedInvoice.customerEmailAddress).toBe(
      sendInvoiceNotificationCall.recipientEmailAddress,
    );
  });
});