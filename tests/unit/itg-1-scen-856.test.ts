import { describe, test, expect, beforeEach } from '@jest/globals';
import { InvoiceApprovalValidator } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  let validator: InvoiceApprovalValidator;
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;
  let mockPaymentGatewayAdapter: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    validator = new InvoiceApprovalValidator(
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );
  });

  // SCEN-856
  test('請求書が発行済み状態での検証でステータスが正確に判定される', () => {
    const invoiceRecord = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-12345',
      customerName: '株式会社テストコーポレーション',
      amount: 500000,
      issuedDate: '2024-04-15T09:00:00Z',
      status: 'ISSUED',
      lineItems: [
        {
          itemId: 'ITEM-001',
          description: 'コンサルティングサービス',
          quantity: 10,
          unitPrice: 50000,
          lineTotal: 500000,
        },
      ],
    };

    const validationResult = validator.validateInvoiceStatus(invoiceRecord);

    expect(validationResult.status).toBe('ISSUED');
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual([]);
    expect(invoiceRecord.status).toBe('ISSUED');

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.generateShareLink).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.deleteDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendQuoteNotification).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendOrderNotification).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.getDeliveryStatus).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.verifyPayment).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.getTransactionStatus).not.toHaveBeenCalled();
  });
});