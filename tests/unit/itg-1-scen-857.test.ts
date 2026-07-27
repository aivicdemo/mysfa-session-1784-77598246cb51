import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
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
  });

  // SCEN-857
  test('should validate invoice in draft status and return correct status determination without calling external adapters', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      status: 'DRAFT',
      customerId: 'CUST001',
      amount: 10000,
      invoiceDate: '2024-01-15',
      items: [
        {
          itemId: 'ITEM-001',
          description: 'Product A',
          quantity: 1,
          unitPrice: 10000,
          subtotal: 10000,
        },
      ],
      customerInfo: {
        customerId: 'CUST001',
        customerName: 'Test Customer',
        email: 'customer@example.com',
        address: '123 Business St',
      },
    };

    const validationResult = validateInvoiceForApproval(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
    );

    expect(validationResult.status).toBe('DRAFT');
    expect(validationResult.statusCode).toBe('STATUS_DRAFT');
    expect(validationResult.validationStatus).toBe('VALID_FOR_DRAFT');
    expect(validationResult.message).toBe('下書き状態では承認・発行できません');

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(0);
    expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalledTimes(0);
    expect(mockDocumentStorageAdapter.deleteDocument).toHaveBeenCalledTimes(0);

    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledTimes(0);
    expect(mockNotificationServiceAdapter.sendOrderNotification).toHaveBeenCalledTimes(0);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(0);
    expect(mockNotificationServiceAdapter.getDeliveryStatus).toHaveBeenCalledTimes(0);

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(0);
    expect(mockPaymentGatewayAdapter.verifyPayment).toHaveBeenCalledTimes(0);
    expect(mockPaymentGatewayAdapter.getTransactionStatus).toHaveBeenCalledTimes(0);
  });
});