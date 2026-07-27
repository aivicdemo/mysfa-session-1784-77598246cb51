import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-769
  test('請求対象データ抽出機能 - 金額条件が上限値ちょうどのとき、該当データが抽出される', () => {
    const billingDataset = [
      {
        id: 'deal_001',
        customer_id: 'cust_a',
        amount: 100000,
        status: 'won',
        deal_date: '2024-01-15',
      },
      {
        id: 'deal_002',
        customer_id: 'cust_b',
        amount: 150000,
        status: 'won',
        deal_date: '2024-01-16',
      },
      {
        id: 'deal_003',
        customer_id: 'cust_c',
        amount: 150001,
        status: 'won',
        deal_date: '2024-01-17',
      },
    ];

    const extractionCondition = {
      max_amount: 150000,
      operator: 'lte',
    };

    const result = extractBillingTargetData(billingDataset, extractionCondition);

    expect(result).toEqual([
      {
        id: 'deal_001',
        customer_id: 'cust_a',
        amount: 100000,
        status: 'won',
        deal_date: '2024-01-15',
      },
      {
        id: 'deal_002',
        customer_id: 'cust_b',
        amount: 150000,
        status: 'won',
        deal_date: '2024-01-16',
      },
    ]);
    expect(result).toHaveLength(2);
    expect(result.every((item) => item.amount <= 150000)).toBe(true);
  });
});