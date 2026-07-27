import {
  detectDealStatusAndInvoiceDiscrepancies,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-734: [normal] 商談ステータス・請求データ照合機能 - 商談ステータスが「受注」で請求書が未発行の場合、照合ズレが検出される
  test("商談ステータスが受注で請求書が未発行の場合、照合ズレが検出される", () => {
    // Arrange
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

    const dealId = "DEAL-20240415-001";
    const customerName = "テスト顧客A";
    const dealAmount = 100000;
    const dealStatus = "受注";
    const invoiceStatus = "未発行";

    const inputData = {
      dealId: dealId,
      customerName: customerName,
      dealAmount: dealAmount,
      dealStatus: dealStatus,
      invoiceStatus: invoiceStatus,
      documentStorageAdapter: mockDocumentStorageAdapter,
      notificationServiceAdapter: mockNotificationServiceAdapter,
    };

    // Act
    const result = detectDealStatusAndInvoiceDiscrepancies(inputData);

    // Assert
    expect(result).toEqual({
      dealId: dealId,
      customerName: customerName,
      dealStatus: dealStatus,
      invoiceStatus: invoiceStatus,
      discrepancyDetected: true,
      discrepancyType: "ズレ検出",
      discrepancyDescription:
        "商談ステータスが「受注」ですが、請求書がまだ発行されていません",
      recommendedAction: "請求書を発行してください",
    });

    // DocumentStorageAdapterのモック呼び出しが照合処理中に新たに記録されていないことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.generateShareLink).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.deleteDocument).not.toHaveBeenCalled();

    // NotificationServiceAdapterのモック呼び出しが照合処理中に新たに記録されていないことを確認
    expect(
      mockNotificationServiceAdapter.sendQuoteNotification
    ).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendOrderNotification
    ).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.getDeliveryStatus
    ).not.toHaveBeenCalled();
  });
});