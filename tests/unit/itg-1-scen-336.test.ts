import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-336
  test('月次決算レポート生成機能 - 開始日時が終了日時より後である場合、エラーが発生する', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const startDateTime = new Date('2024-01-31T23:59:59Z');
    const endDateTime = new Date('2024-01-01T00:00:00Z');

    const reportGenerationParams = {
      startDateTime,
      endDateTime,
      documentStorageAdapter: mockDocumentStorageAdapter,
    };

    expect(() => {
      generateMonthlyRevenueReport(reportGenerationParams);
    }).toThrow(/開始日時/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.generateShareLink).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.deleteDocument).not.toHaveBeenCalled();
  });
});