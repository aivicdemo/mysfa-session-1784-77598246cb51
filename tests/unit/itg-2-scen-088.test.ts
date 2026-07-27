import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  issueOrderDocument,
  getIssuanceHistory,
} from '../../src/logic/it-1784969823049-2-1-2';

const fetchMock = require('jest-fetch-mock');

describe('顧客向けポータル - 商談情報参照機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  // SCEN-088
  test('帳票発行時の発行日時自動付与と発行履歴記録 - 注文書の発行履歴に帳票タイプが正確に記録される', async () => {
    // Arrange
    const customerId = 'CUST-001';
    const orderId = 'ORD-2024-001';
    const orderNumber = 'OD20240115001';
    const customerName = '株式会社テスト';
    const documentType = '注文書';
    const issuanceTimestamp = new Date('2024-01-15T11:00:00Z');

    const orderData = {
      orderId,
      orderNumber,
      customerId,
      customerName,
      items: [
        {
          productName: '商品A',
          quantity: 10,
          unitPrice: 1000,
          subtotal: 10000,
        },
        {
          productName: '商品B',
          quantity: 5,
          unitPrice: 2000,
          subtotal: 10000,
        },
      ],
      totalAmount: 20000,
      issuanceDateTime: issuanceTimestamp.toISOString(),
    };

    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-2024-001',
        fileUrl: 'https://storage.example.com/doc-2024-001.pdf',
        uploadedAt: issuanceTimestamp.toISOString(),
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/access-token-xyz',
        expiresAt: new Date(issuanceTimestamp.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const notificationServiceAdapterStub = {
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-2024-001',
        deliveredAt: issuanceTimestamp.toISOString(),
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
      }),
    };

    // Act
    const issueResult = await issueOrderDocument(
      orderData,
      documentStorageAdapterStub,
      notificationServiceAdapterStub
    );

    const historyResult = await getIssuanceHistory(
      customerId,
      documentStorageAdapterStub
    );

    // Assert
    expect(issueResult).toEqual({
      success: true,
      documentId: 'DOC-2024-001',
      message: '注文書が正常に発行されました',
    });

    expect(historyResult.records).toHaveLength(1);
    const latestRecord = historyResult.records[0];

    expect(latestRecord.documentType).toBe('注文書');
    expect(latestRecord.issuanceDateTime).toBe('2024-01-15T11:00:00Z');
    expect(latestRecord.fileName).toBe('OD20240115001_注文書.pdf');
    expect(latestRecord.customerName).toBe('株式会社テスト');
    expect(latestRecord.orderNumber).toBe('OD20240115001');
    expect(latestRecord.documentId).toBe('DOC-2024-001');

    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledTimes(1);
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId,
        orderNumber,
        customerId,
        customerName,
        totalAmount: 20000,
        documentType: '注文書',
      })
    );

    expect(notificationServiceAdapterStub.sendOrderNotification).toHaveBeenCalledTimes(1);
    expect(notificationServiceAdapterStub.sendOrderNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: '株式会社テスト',
        orderNumber: 'OD20240115001',
      })
    );
  });
});