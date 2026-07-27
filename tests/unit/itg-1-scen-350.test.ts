import { describe, test, expect } from '@jest/globals';
import { searchSalesResultsByPeriod } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-350
  test('月次決算レポート生成機能 - 売上実績テーブルから対象期間のレコードを検索するとき、検索結果が複数件である', () => {
    const testData = [
      {
        id: 'sales_001',
        salesDate: new Date('2024-01-15T00:00:00Z'),
        amount: 100000,
        salesPersonName: '太郎',
      },
      {
        id: 'sales_002',
        salesDate: new Date('2024-01-20T00:00:00Z'),
        amount: 150000,
        salesPersonName: '花子',
      },
      {
        id: 'sales_003',
        salesDate: new Date('2024-02-10T00:00:00Z'),
        amount: 200000,
        salesPersonName: '太郎',
      },
    ];

    const searchParams = {
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-31T23:59:59Z'),
    };

    const result = searchSalesResultsByPeriod(testData, searchParams);

    expect(result.totalCount).toBe(2);
    expect(result.records).toHaveLength(2);
    expect(result.records[0]).toEqual({
      id: 'sales_001',
      salesDate: new Date('2024-01-15T00:00:00Z'),
      amount: 100000,
      salesPersonName: '太郎',
    });
    expect(result.records[1]).toEqual({
      id: 'sales_002',
      salesDate: new Date('2024-01-20T00:00:00Z'),
      amount: 150000,
      salesPersonName: '花子',
    });
  });
});