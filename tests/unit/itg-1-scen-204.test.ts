import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-204
  test('抽出条件による請求対象データの絞り込み機能 - 抽出条件の金額範囲外のデータは除外される', () => {
    const mockDealRecords = [
      {
        dealId: 'DEAL001',
        customerId: 'CUST001',
        amount: 150000,
        status: 'won',
        invoiceIssuedDate: '2024-04-15',
      },
      {
        dealId: 'DEAL002',
        customerId: 'CUST002',
        amount: 300000,
        status: 'won',
        invoiceIssuedDate: '2024-04-16',
      },
      {
        dealId: 'DEAL003',
        customerId: 'CUST003',
        amount: 500000,
        status: 'won',
        invoiceIssuedDate: '2024-04-17',
      },
      {
        dealId: 'DEAL004',
        customerId: 'CUST004',
        amount: 99999,
        status: 'won',
        invoiceIssuedDate: '2024-04-18',
      },
      {
        dealId: 'DEAL005',
        customerId: 'CUST005',
        amount: 500001,
        status: 'won',
        invoiceIssuedDate: '2024-04-19',
      },
      {
        dealId: 'DEAL006',
        customerId: 'CUST006',
        amount: 250000,
        status: 'won',
        invoiceIssuedDate: '2024-04-20',
      },
    ];

    const extractionCondition = {
      minAmount: 100000,
      maxAmount: 500000,
      period: { startDate: '2024-04-01', endDate: '2024-04-30' },
      customerSegment: 'all',
    };

    const result = extractBillingTargetData(mockDealRecords, extractionCondition);

    expect(result).toHaveLength(4);
    expect(result.every((record) => record.amount >= 100000 && record.amount <= 500000)).toBe(
      true
    );
    expect(result.map((record) => record.dealId)).toEqual([
      'DEAL001',
      'DEAL002',
      'DEAL003',
      'DEAL006',
    ]);

    const dealIdsWithAmountOutOfRange = mockDealRecords
      .filter((record) => record.amount < 100000 || record.amount > 500000)
      .map((record) => record.dealId);
    expect(result.map((record) => record.dealId)).not.toEqual(
      expect.arrayContaining(dealIdsWithAmountOutOfRange)
    );

    result.forEach((record) => {
      expect(record.amount).toBeGreaterThanOrEqual(100000);
      expect(record.amount).toBeLessThanOrEqual(500000);
    });
  });
});