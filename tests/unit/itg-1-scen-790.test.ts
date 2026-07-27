import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-790
  test('月末日を含む期間で抽出するとき、月末データが正しく抽出される', async () => {
    // Arrange
    const startDate = new Date('2024-01-31T00:00:00Z');
    const endDate = new Date('2024-02-29T23:59:59Z');

    const salesRecordA = {
      id: 'sales_001',
      date: new Date('2024-01-31T10:00:00Z'),
      amount: 100000,
      status: '請求対象',
    };

    const salesRecordB = {
      id: 'sales_002',
      date: new Date('2024-02-01T10:00:00Z'),
      amount: 50000,
      status: '請求対象',
    };

    const salesRecordC = {
      id: 'sales_003',
      date: new Date('2024-02-29T10:00:00Z'),
      amount: 75000,
      status: '請求対象',
    };

    const salesRecordD = {
      id: 'sales_004',
      date: new Date('2024-03-01T10:00:00Z'),
      amount: 60000,
      status: '請求対象',
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentId: 'doc_001' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/doc_001' }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered' }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/invoice_001' }),
      verifyPayment: jest.fn().mockResolvedValue({}),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
    };

    // Act
    const result = await extractBillingTargetData(
      {
        startDate,
        endDate,
        statusFilter: '請求対象',
        salesRecords: [salesRecordA, salesRecordB, salesRecordC, salesRecordD],
      },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('sales_001');
    expect(result[0].date).toEqual(new Date('2024-01-31T10:00:00Z'));
    expect(result[0].amount).toBe(100000);
    expect(result[1].id).toBe('sales_002');
    expect(result[1].date).toEqual(new Date('2024-02-01T10:00:00Z'));
    expect(result[1].amount).toBe(50000);
    expect(result[2].id).toBe('sales_003');
    expect(result[2].date).toEqual(new Date('2024-02-29T10:00:00Z'));
    expect(result[2].amount).toBe(75000);

    expect(result.some(record => record.id === 'sales_004')).toBe(false);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});