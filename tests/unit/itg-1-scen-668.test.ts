import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { linkDealStatusToInvoice } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;
  let mockPaymentGatewayAdapter: any;
  let mockDatabase: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'doc-12345',
        url: 'https://example.com/docs/doc-12345',
      }),
    };

    mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ messageId: 'msg-67890' }),
    };

    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentUrl: 'https://payment.example.com/pay-abc123',
        expiresAt: new Date('2024-02-15T23:59:59Z'),
      }),
    };

    mockDatabase = {
      saveInvoice: jest.fn().mockResolvedValue({ invoiceId: 'inv-999' }),
      getInvoicesByDealId: jest.fn().mockResolvedValue([]),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-668
  test('商談ステータスが『失注』のとき、請求書の紐付けは行われない', async () => {
    const dealRecord = {
      customerId: 'cust-001',
      dealId: 'deal-555',
      amount: 500000,
      dealStatus: '失注',
      dealDate: new Date('2024-01-15T00:00:00Z'),
      dealDetails: [
        {
          itemName: 'サービスA',
          quantity: 1,
          unitPrice: 500000,
        },
      ],
    };

    const invoiceData = {
      customerId: dealRecord.customerId,
      dealId: dealRecord.dealId,
      amount: dealRecord.amount,
      invoiceDate: new Date('2024-01-20T09:00:00Z'),
      dueDate: new Date('2024-02-20T23:59:59Z'),
      details: dealRecord.dealDetails,
    };

    const result = await linkDealStatusToInvoice(
      dealRecord,
      invoiceData,
      mockDatabase,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.invoiceCreated).toBe(false);
    expect(mockDatabase.saveInvoice).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(
      mockPaymentGatewayAdapter.generatePaymentLink
    ).not.toHaveBeenCalled();

    const savedInvoices = await mockDatabase.getInvoicesByDealId(
      dealRecord.dealId
    );
    expect(savedInvoices).toEqual([]);
  });
});