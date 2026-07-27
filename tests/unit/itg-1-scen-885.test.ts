import { describe, it, expect, beforeEach } from '@jest/globals';
import { validateAndApproveInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-885
  it('should reject invoice validation when discount rate exceeds 100%', () => {
    // Arrange
    const invoiceData = {
      invoiceId: 'INV-20240115-001',
      customerId: 'CUST-001',
      customerName: '株式会社テスト太郎',
      invoiceAmount: 100000,
      discountRate: 150,
      status: 'pending_approval',
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-123',
        url: 'https://example.com/doc-123',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/abc123',
      }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-456',
        status: 'sent',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({}),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'link-789',
        paymentUrl: 'https://payment.example.com/link-789',
      }),
      verifyPayment: jest.fn().mockResolvedValue({}),
      getTransactionStatus: jest.fn().mockResolvedValue({}),
    };

    // Act & Assert
    expect(() =>
      validateAndApproveInvoice(
        invoiceData,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      )
    ).toThrow(/割引率/);

    // Verify that external services were not called
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});