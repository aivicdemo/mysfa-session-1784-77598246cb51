import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { reconcileDealAndInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-515: [normal] 商談ステータスが「保留」のとき、請求書との照合は実施されない
  it('商談ステータスが保留の場合、請求書への処理は実行されない', () => {
    // Arrange
    const deal = {
      dealId: 'DEAL-12345',
      status: '保留',
      customerId: 'CUST-001',
      amount: 500000,
    };

    const invoice = {
      invoiceId: 'INV-67890',
      customerId: 'CUST-001',
      issuedDate: new Date('2024-01-15T09:00:00Z'),
      status: '未発行',
      amount: 500000,
      lastUpdatedAt: new Date('2024-01-15T09:00:00Z'),
    };

    const mockDocumentStorage = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationService = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    // Act
    const result = reconcileDealAndInvoiceStatus(
      deal,
      invoice,
      mockDocumentStorage,
      mockNotificationService
    );

    // Assert
    expect(mockDocumentStorage.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationService.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(result.invoiceStatus).toBe('未発行');
    expect(result.lastUpdatedAt).toEqual(new Date('2024-01-15T09:00:00Z'));
    expect(result.processingExecuted).toBe(false);
  });
});