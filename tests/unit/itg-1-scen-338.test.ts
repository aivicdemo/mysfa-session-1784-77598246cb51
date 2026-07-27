import { generateMonthlyDecisionReportIfRecordsNull } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-338
  test('月次決算レポート生成機能 - 商談レコード配列が空（null）のとき、エラーが発生する', () => {
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

    const mockSalesforceMetadataDataSource = {
      fetchLicenseUsers: jest.fn(),
      fetchEditionDetails: jest.fn(),
      fetchFeatureUsageMetrics: jest.fn(),
      fetchAnnualCostData: jest.fn(),
    };

    const mockLicenseAlertNotificationService = {
      sendLicenseOverageAlert: jest.fn(),
      sendUnusedUserAlert: jest.fn(),
      sendCostForecastAlert: jest.fn(),
    };

    expect(() =>
      generateMonthlyDecisionReportIfRecordsNull(
        null,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter,
        mockSalesforceMetadataDataSource,
        mockLicenseAlertNotificationService
      )
    ).toThrow(/商談レコード|商談データ/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendQuoteNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
    expect(mockSalesforceMetadataDataSource.fetchLicenseUsers).not.toHaveBeenCalled();
    expect(mockLicenseAlertNotificationService.sendLicenseOverageAlert).not.toHaveBeenCalled();
  });
});