import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { updateDealStatusToContractAndGenerateSalesRecord } from '../../src/logic/it-1-3';

// Mock adapters
const mockNotificationServiceAdapter = {
  sendQuoteNotification: jest.fn(),
  sendOrderNotification: jest.fn(),
  sendInvoiceNotification: jest.fn(),
  getDeliveryStatus: jest.fn(),
};

const mockDocumentStorageAdapter = {
  uploadDocument: jest.fn(),
  generateShareLink: jest.fn(),
  deleteDocument: jest.fn(),
};

const mockPaymentGatewayAdapter = {
  generatePaymentLink: jest.fn(),
  verifyPayment: jest.fn(),
  getTransactionStatus: jest.fn(),
};

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationServiceAdapter.sendInvoiceNotification.mockResolvedValue({ success: true });
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValue({ documentId: 'doc-123', url: 'https://storage.example.com/doc-123' });
    mockPaymentGatewayAdapter.generatePaymentLink.mockResolvedValue({ paymentLink: 'https://payment.example.com/link-123' });
  });

  // SCEN-223
  test('商談ステータスを成約に変更した場合、売上実績レコードが自動で生成される', async () => {
    const dealId = 'deal-001';
    const customerId = 'customer-A';
    const dealName = 'テスト商談';
    const customerName = 'テスト顧客A';
    const dealAmount = 1000000;
    const dealDate = new Date('2024-01-15T00:00:00Z');
    const currentSystemTime = new Date('2024-01-15T10:30:00Z');

    const testDeal = {
      id: dealId,
      name: dealName,
      customerId: customerId,
      customerName: customerName,
      amount: dealAmount,
      status: '提案中',
      dealDate: dealDate,
      createdAt: new Date('2024-01-10T00:00:00Z'),
      updatedAt: new Date('2024-01-10T00:00:00Z'),
    };

    const salesRecordStore: Array<{
      id: string;
      dealId: string;
      customerId: string;
      salesAmount: number;
      salesDate: Date;
      status: string;
      createdAt: Date;
    }> = [];

    const result = await updateDealStatusToContractAndGenerateSalesRecord(
      testDeal,
      '成約',
      {
        notificationService: mockNotificationServiceAdapter,
        documentStorage: mockDocumentStorageAdapter,
        paymentGateway: mockPaymentGatewayAdapter,
      },
      {
        getCurrentTime: () => currentSystemTime,
        saveSalesRecord: (record) => {
          const newRecord = {
            id: `sales-${Date.now()}`,
            dealId: record.dealId,
            customerId: record.customerId,
            salesAmount: record.salesAmount,
            salesDate: record.salesDate,
            status: record.status,
            createdAt: record.createdAt,
          };
          salesRecordStore.push(newRecord);
          return newRecord;
        },
      }
    );

    expect(result.dealStatus).toBe('成約');
    expect(result.salesRecordGenerated).toBe(true);

    expect(salesRecordStore).toHaveLength(1);
    const generatedSalesRecord = salesRecordStore[0];

    expect(generatedSalesRecord.dealId).toBe(dealId);
    expect(generatedSalesRecord.customerId).toBe(customerId);
    expect(generatedSalesRecord.salesAmount).toBe(1000000);
    expect(generatedSalesRecord.salesDate).toEqual(currentSystemTime);
    expect(generatedSalesRecord.status).toBe('確定');

    const timeDifferenceMs = generatedSalesRecord.createdAt.getTime() - currentSystemTime.getTime();
    expect(Math.abs(timeDifferenceMs)).toBeLessThanOrEqual(5000);

    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();
  });
});