import { describe, test, expect, beforeEach } from '@jest/globals';
import * as logicModule from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let documentStorageAdapterStub: any;
  let notificationServiceAdapterStub: any;
  let paymentGatewayAdapterStub: any;
  let salesforceMetadataDataSourceStub: any;
  let licenseAlertNotificationServiceStub: any;

  beforeEach(() => {
    documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: 'test-file-id' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ sent: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true }),
    };

    paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/pay123' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
    };

    salesforceMetadataDataSourceStub = {
      fetchLicenseUsers: jest.fn().mockResolvedValue([]),
      fetchEditionDetails: jest.fn().mockResolvedValue([]),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue([]),
      fetchAnnualCostData: jest.fn().mockResolvedValue([]),
    };

    licenseAlertNotificationServiceStub = {
      sendLicenseOverageAlert: jest.fn().mockResolvedValue({ sent: true }),
      sendUnusedUserAlert: jest.fn().mockResolvedValue({ sent: true }),
      sendCostForecastAlert: jest.fn().mockResolvedValue({ sent: true }),
    };
  });

  // SCEN-719: [error] ステータス照合ロジック - 商談ステータスが空の場合、照合は実行されない
  test('should skip reconciliation and return skipped indicator when deal status is null', async () => {
    const dealWithNullStatus = {
      id: 'deal-001',
      customerId: 'cust-001',
      status: null,
      amount: 100000,
      invoiceIssuedDate: new Date('2024-04-15T00:00:00Z'),
      expectedInvoiceDate: new Date('2024-04-15T00:00:00Z'),
    };

    const result = await logicModule.reconcileDealStatusWithInvoiceStatus(
      dealWithNullStatus,
      documentStorageAdapterStub,
      notificationServiceAdapterStub,
      paymentGatewayAdapterStub,
      salesforceMetadataDataSourceStub,
      licenseAlertNotificationServiceStub
    );

    expect(result).toEqual({
      skipped: true,
      reason: 'status is empty',
    });

    expect(documentStorageAdapterStub.uploadDocument).not.toHaveBeenCalled();
    expect(documentStorageAdapterStub.generateShareLink).not.toHaveBeenCalled();
    expect(documentStorageAdapterStub.deleteDocument).not.toHaveBeenCalled();

    expect(notificationServiceAdapterStub.sendQuoteNotification).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.sendOrderNotification).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.getDeliveryStatus).not.toHaveBeenCalled();

    expect(paymentGatewayAdapterStub.generatePaymentLink).not.toHaveBeenCalled();
    expect(paymentGatewayAdapterStub.verifyPayment).not.toHaveBeenCalled();
    expect(paymentGatewayAdapterStub.getTransactionStatus).not.toHaveBeenCalled();

    expect(salesforceMetadataDataSourceStub.fetchLicenseUsers).not.toHaveBeenCalled();
    expect(salesforceMetadataDataSourceStub.fetchEditionDetails).not.toHaveBeenCalled();
    expect(salesforceMetadataDataSourceStub.fetchFeatureUsageMetrics).not.toHaveBeenCalled();
    expect(salesforceMetadataDataSourceStub.fetchAnnualCostData).not.toHaveBeenCalled();

    expect(licenseAlertNotificationServiceStub.sendLicenseOverageAlert).not.toHaveBeenCalled();
    expect(licenseAlertNotificationServiceStub.sendUnusedUserAlert).not.toHaveBeenCalled();
    expect(licenseAlertNotificationServiceStub.sendCostForecastAlert).not.toHaveBeenCalled();
  });
});