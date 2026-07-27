import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

// SCEN-348
describe('月次決算レポート生成機能 - 売上実績検索時に0件を返すケース', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('対象期間内に売上実績レコードが存在しない場合、検索結果0件として正常に処理される', () => {
    const targetStartDate = new Date('2024-01-01T00:00:00Z');
    const targetEndDate = new Date('2024-01-31T23:59:59Z');
    const emptyRevenueRecords: any[] = [];

    const mockRevenueDataSource = {
      searchRevenueRecords: jest.fn().mockReturnValue(emptyRevenueRecords),
    };

    const result = generateMonthlyRevenueReport({
      startDate: targetStartDate,
      endDate: targetEndDate,
      revenueDataSource: mockRevenueDataSource,
    });

    expect(mockRevenueDataSource.searchRevenueRecords).toHaveBeenCalledWith({
      startDate: targetStartDate,
      endDate: targetEndDate,
    });

    expect(result.recordCount).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.status).toBe('no_records_found');
    expect(result.message).toBe('対象期間内の売上実績はありません');
    expect(result.records).toEqual([]);
  });
});