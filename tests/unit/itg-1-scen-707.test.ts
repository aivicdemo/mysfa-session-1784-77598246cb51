import { routeStagedResponses } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-707
  test('営業担当者割り当てがない案件の場合、対応指示は実行されない', () => {
    // Arrange
    const caseData = {
      caseId: 'TEST-707',
      customerName: 'テスト顧客A',
      status: '照合完了',
      assignedSalesRep: null,
    };

    const systemLogs: string[] = [];

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

    const mockLogger = {
      info: (message: string) => {
        systemLogs.push(message);
      },
    };

    // Act
    const result = routeStagedResponses(
      caseData,
      mockNotificationServiceAdapter,
      mockDocumentStorageAdapter,
      mockLogger,
    );

    // Assert
    expect(result.status).toBe('照合完了');
    expect(result.instructionExecuted).toBe(false);
    expect(systemLogs).toContainEqual(
      expect.stringContaining('営業担当者が割り当てられていないため対応指示をスキップしました'),
    );
    expect(systemLogs).toContainEqual(
      expect.stringContaining('TEST-707'),
    );
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
  });
});