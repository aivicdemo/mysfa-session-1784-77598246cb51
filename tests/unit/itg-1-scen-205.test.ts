import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-205
  test('指定期間外の商談成約データは抽出されない', () => {
    const extractionCondition = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      status: '成約',
    };

    const dealRecords = [
      {
        id: 'deal_001',
        contractDate: new Date('2023-12-15'),
        status: '成約',
        amount: 100000,
        customerId: 'cust_001',
      },
      {
        id: 'deal_002',
        contractDate: new Date('2024-01-10'),
        status: '成約',
        amount: 250000,
        customerId: 'cust_002',
      },
      {
        id: 'deal_003',
        contractDate: new Date('2024-03-25'),
        status: '成約',
        amount: 180000,
        customerId: 'cust_003',
      },
      {
        id: 'deal_004',
        contractDate: new Date('2024-04-01'),
        status: '成約',
        amount: 320000,
        customerId: 'cust_004',
      },
    ];

    const result = extractBillingTargetData(dealRecords, extractionCondition);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('deal_002');
    expect(result[0].contractDate).toEqual(new Date('2024-01-10'));
    expect(result[0].amount).toBe(250000);
    expect(result[1].id).toBe('deal_003');
    expect(result[1].contractDate).toEqual(new Date('2024-03-25'));
    expect(result[1].amount).toBe(180000);

    const extractedIds = result.map((record) => record.id);
    expect(extractedIds).not.toContain('deal_001');
    expect(extractedIds).not.toContain('deal_004');
  });
});