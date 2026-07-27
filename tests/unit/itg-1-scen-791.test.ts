import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-791
  test('月初日を含む期間で抽出するとき、月初データが正しく抽出される', () => {
    const extractionStartDate = new Date('2024-01-01T00:00:00Z');
    const extractionEndDate = new Date('2024-01-15T23:59:59Z');

    const testData = [
      {
        salesDate: new Date('2024-01-01T00:00:00Z'),
        amount: 10000,
        id: 'record_001',
      },
      {
        salesDate: new Date('2024-01-02T00:00:00Z'),
        amount: 20000,
        id: 'record_002',
      },
      {
        salesDate: new Date('2023-12-31T00:00:00Z'),
        amount: 5000,
        id: 'record_003',
      },
      {
        salesDate: new Date('2024-01-16T00:00:00Z'),
        amount: 15000,
        id: 'record_004',
      },
    ];

    const result = extractBillingTargetData({
      startDate: extractionStartDate,
      endDate: extractionEndDate,
      sourceData: testData,
    });

    expect(result).toHaveLength(2);
    expect(result[0].salesDate).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(result[0].amount).toBe(10000);
    expect(result[0].id).toBe('record_001');
    expect(result[1].salesDate).toEqual(new Date('2024-01-02T00:00:00Z'));
    expect(result[1].amount).toBe(20000);
    expect(result[1].id).toBe('record_002');
  });
});