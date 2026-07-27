import { detectUnbilledCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-544: 対象となる商談が0件のとき空の『未請求案件』リストが返される", async () => {
    // Arrange
    const targetPeriodDays = 30;
    const cutoffDate = new Date("2024-04-01T00:00:00Z");
    const periodStart = new Date(
      cutoffDate.getTime() - targetPeriodDays * 24 * 60 * 60 * 1000
    );
    const periodEnd = cutoffDate;

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
      listInvoiceDocuments: jest.fn().mockResolvedValue([]),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockDealRecords: any[] = [];

    // Act
    const result = await detectUnbilledCases(
      mockDealRecords,
      periodStart,
      periodEnd,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // Assert
    expect(result).toEqual([]);
    expect(mockDocumentStorageAdapter.listInvoiceDocuments).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
  });
});