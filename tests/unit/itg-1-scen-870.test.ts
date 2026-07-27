import {
  validateInvoiceApproval,
} from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-870
  test('請求書承認検証機能 - 請求書の発行日が年をまたぐ場合、検証が正確に実行される', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'doc_2024_12_31_001',
        url: 'https://storage.example.com/invoices/2024/doc_2024_12_31_001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/abc123',
        expiresAt: new Date('2025-01-07T23:59:59Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_quote_001',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_order_001',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_invoice_2024_12_31',
        status: 'sent',
        deliveredAt: new Date('2024-12-31T15:30:00Z'),
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: new Date('2024-12-31T16:45:00Z'),
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/inv_2024_12_31_001',
        expiresAt: new Date('2025-01-31T23:59:59Z'),
        transactionId: 'txn_2024_12_31_001',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        verified: true,
        amount: 100000,
        transactionId: 'txn_2024_12_31_001',
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'pending',
        amount: 100000,
      }),
    };

    const invoice2024_12_31 = {
      invoiceId: 'INV_2024_12_31_001',
      customerId: 'CUST_001',
      customerName: '株式会社テスト顧客',
      customerEmail: 'customer@example.com',
      issuedDate: new Date('2024-12-31T09:00:00Z'),
      periodStartDate: new Date('2024-12-01T00:00:00Z'),
      periodEndDate: new Date('2024-12-31T23:59:59Z'),
      invoiceAmount: 100000,
      currency: 'JPY',
      lineItems: [
        {
          itemId: 'ITEM_001',
          description: 'サービス提供（2024年12月）',
          quantity: 1,
          unitPrice: 100000,
          taxRate: 0.1,
          totalAmount: 110000,
        },
      ],
      status: 'pending_approval',
      createdAt: new Date('2024-12-31T08:30:00Z'),
      updatedAt: new Date('2024-12-31T08:30:00Z'),
    };

    const validationResult2024_12_31 = validateInvoiceApproval(
      invoice2024_12_31,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(validationResult2024_12_31.validationStatus).toBe('passed');
    expect(validationResult2024_12_31.issuedDateRecognition).toBe(
      'year_end_date'
    );
    expect(validationResult2024_12_31.periodConsistency).toBe('consistent');
    expect(validationResult2024_12_31.fiscalYear).toBe(2024);
    expect(validationResult2024_12_31.fiscalMonth).toBe(12);
    expect(validationResult2024_12_31.dateFormatValidation).toBe(true);
    expect(validationResult2024_12_31.periodMismatchError).toBe(null);
    expect(validationResult2024_12_31.yearDetectionError).toBe(null);
    expect(validationResult2024_12_31.internalLogTimestamp).toBeDefined();
    expect(
      validationResult2024_12_31.internalLogTimestamp.getFullYear()
    ).toBe(2024);
    expect(validationResult2024_12_31.internalLogTimestamp.getMonth()).toBe(11);
    expect(validationResult2024_12_31.internalLogTimestamp.getDate()).toBe(31);
    expect(validationResult2024_12_31.periodCalculationResult).toEqual({
      startDate: new Date('2024-12-01T00:00:00Z'),
      endDate: new Date('2024-12-31T23:59:59Z'),
      durationDays: 31,
      isValid: true,
    });

    mockDocumentStorageAdapter.uploadDocument.mockClear();
    mockNotificationServiceAdapter.sendInvoiceNotification.mockClear();
    mockPaymentGatewayAdapter.generatePaymentLink.mockClear();

    const invoice2025_01_01 = {
      invoiceId: 'INV_2025_01_01_001',
      customerId: 'CUST_002',
      customerName: '株式会社新規顧客',
      customerEmail: 'newcustomer@example.com',
      issuedDate: new Date('2025-01-01T09:00:00Z'),
      periodStartDate: new Date('2025-01-01T00:00:00Z'),
      periodEndDate: new Date('2025-01-31T23:59:59Z'),
      invoiceAmount: 150000,
      currency: 'JPY',
      lineItems: [
        {
          itemId: 'ITEM_002',
          description: 'サービス提供（2025年1月）',
          quantity: 1,
          unitPrice: 150000,
          taxRate: 0.1,
          totalAmount: 165000,
        },
      ],
      status: 'pending_approval',
      createdAt: new Date('2025-01-01T08:30:00Z'),
      updatedAt: new Date('2025-01-01T08:30:00Z'),
    };

    const validationResult2025_01_01 = validateInvoiceApproval(
      invoice2025_01_01,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(validationResult2025_01_01.validationStatus).toBe('passed');
    expect(validationResult2025_01_01.issuedDateRecognition).toBe(
      'year_start_date'
    );
    expect(validationResult2025_01_01.periodConsistency).toBe('consistent');
    expect(validationResult2025_01_01.fiscalYear).toBe(2025);
    expect(validationResult2025_01_01.fiscalMonth).toBe(1);
    expect(validationResult2025_01_01.dateFormatValidation).toBe(true);
    expect(validationResult2025_01_01.periodMismatchError).toBe(null);
    expect(validationResult2025_01_01.yearDetectionError).toBe(null);
    expect(validationResult2025_01_01.internalLogTimestamp).toBeDefined();
    expect(
      validationResult2025_01_01.internalLogTimestamp.getFullYear()
    ).toBe(2025);
    expect(validationResult2025_01_01.internalLogTimestamp.getMonth()).toBe(0);
    expect(validationResult2025_01_01.internalLogTimestamp.getDate()).toBe(1);
    expect(validationResult2025_01_01.periodCalculationResult).toEqual({
      startDate: new Date('2025-01-01T00:00:00Z'),
      endDate: new Date('2025-01-31T23:59:59Z'),
      durationDays: 31,
      isValid: true,
    });

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalled();
    expect(
      mockPaymentGatewayAdapter.generatePaymentLink
    ).toHaveBeenCalled();
  });
});