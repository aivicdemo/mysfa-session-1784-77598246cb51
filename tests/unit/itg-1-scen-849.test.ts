import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { validateAndApproveInvoice } from '../../src/logic/it-1-1';

// Mock adapters
interface DocumentStorageAdapter {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface NotificationServiceAdapter {
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
}

interface PaymentGatewayAdapter {
  generatePaymentLink: jest.Mock;
  verifyPayment: jest.Mock;
  getTransactionStatus: jest.Mock;
}

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  let mockDocumentStorageAdapter: DocumentStorageAdapter;
  let mockNotificationServiceAdapter: NotificationServiceAdapter;
  let mockPaymentGatewayAdapter: PaymentGatewayAdapter;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'doc_12345',
        fileName: 'invoice_INV001.pdf',
        uploadedAt: '2024-01-15T10:30:00Z',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/file/d/doc_12345/view?usp=sharing',
        expiresAt: '2024-01-22T10:30:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({
        success: true,
      }),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_001',
        sentAt: '2024-01-15T10:31:00Z',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_002',
        sentAt: '2024-01-15T10:31:30Z',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_003',
        sentAt: '2024-01-15T10:32:00Z',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
        openedAt: '2024-01-15T11:00:00Z',
      }),
    };

    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentUrl: 'https://payment.gmo.jp/payment/INV001',
        transactionId: 'txn_abc123def456',
        expiresAt: '2024-02-15T23:59:59Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        status: 'completed',
        amount: 50000,
        transactionId: 'txn_abc123def456',
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'completed',
        amount: 50000,
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-849
  it('請求書承認検証機能 - 請求明細が1件のとき検証が合格する', async () => {
    const invoiceData = {
      invoiceId: 'INV001',
      customerId: 'CUST_0001',
      customerName: '株式会社サンプル',
      customerEmail: 'contact@sample-corp.jp',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      totalAmount: 50000,
      invoiceStatus: 'draft',
      lineItems: [
        {
          lineItemId: 'ITEM_001',
          productName: 'ソフトウェアライセンス（年間）',
          quantity: 1,
          unitPrice: 50000,
          lineAmount: 50000,
        },
      ],
    };

    const validationResult = await validateAndApproveInvoice(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(validationResult.validationStatus).toBe('合格');
    expect(validationResult.errorMessages).toEqual([]);
    expect(validationResult.approvalStatus).toBe('承認済み');
    expect(validationResult.invoiceStatus).toBe('approved');
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV001',
      })
    );
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV001',
        customerEmail: 'contact@sample-corp.jp',
      })
    );
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV001',
        amount: 50000,
      })
    );
  });
});