import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-654
  test('売上実績IDが空のとき、バリデーションエラーが発生する', async () => {
    const { reconcileSalesAndInvoice } = await import('../../src/logic/it-1-3');

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const emptyPerformanceId = '';

    const result = reconcileSalesAndInvoice(
      emptyPerformanceId,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result).toHaveProperty('errorCode', 'SALES_PERFORMANCE_ID_REQUIRED');
    expect(result).toHaveProperty('message');
    expect(result.message).toMatch(/売上実績ID/);
    expect(result).toHaveProperty('statusCode', 400);

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