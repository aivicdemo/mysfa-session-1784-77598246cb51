import { classifyDealsByStatus } from '../../src/logic/it-1';

describe('顧客別商談進捗分類機能', () => {
  // SCEN-120
  test('同一ステータス内の複数商談の合計金額が正確に計算される', () => {
    const customer_id = 'CUST001';
    const deals = [
      {
        deal_id: 'DEAL001',
        customer_id: 'CUST001',
        status: '交渉中',
        amount: 1000000,
      },
      {
        deal_id: 'DEAL002',
        customer_id: 'CUST001',
        status: '交渉中',
        amount: 2500000,
      },
      {
        deal_id: 'DEAL003',
        customer_id: 'CUST001',
        status: '交渉中',
        amount: 1500000,
      },
      {
        deal_id: 'DEAL004',
        customer_id: 'CUST001',
        status: '初期接触',
        amount: 800000,
      },
      {
        deal_id: 'DEAL005',
        customer_id: 'CUST001',
        status: '受注',
        amount: 5000000,
      },
    ];

    const result = classifyDealsByStatus(customer_id, deals);

    expect(result).toEqual({
      customer_id: 'CUST001',
      status_groups: [
        {
          status: '初期接触',
          deal_count: 1,
          total_amount: 800000,
          deals: [
            {
              deal_id: 'DEAL004',
              amount: 800000,
            },
          ],
        },
        {
          status: '交渉中',
          deal_count: 3,
          total_amount: 5000000,
          deals: [
            {
              deal_id: 'DEAL001',
              amount: 1000000,
            },
            {
              deal_id: 'DEAL002',
              amount: 2500000,
            },
            {
              deal_id: 'DEAL003',
              amount: 1500000,
            },
          ],
        },
        {
          status: '受注',
          deal_count: 1,
          total_amount: 5000000,
          deals: [
            {
              deal_id: 'DEAL005',
              amount: 5000000,
            },
          ],
        },
      ],
    });

    const negotiation_group = result.status_groups.find(
      (group) => group.status === '交渉中'
    );
    expect(negotiation_group).toBeDefined();
    expect(negotiation_group!.deal_count).toBe(3);
    expect(negotiation_group!.total_amount).toBe(5000000);
  });

  test('小数点以下の金額を含む複数商談の合計が誤差なく計算される', () => {
    const customer_id = 'CUST002';
    const deals = [
      {
        deal_id: 'DEAL101',
        customer_id: 'CUST002',
        status: '提案中',
        amount: 1234567.89,
      },
      {
        deal_id: 'DEAL102',
        customer_id: 'CUST002',
        status: '提案中',
        amount: 2345678.11,
      },
      {
        deal_id: 'DEAL103',
        customer_id: 'CUST002',
        status: '提案中',
        amount: 3456789.00,
      },
    ];

    const result = classifyDealsByStatus(customer_id, deals);

    const proposal_group = result.status_groups.find(
      (group) => group.status === '提案中'
    );
    expect(proposal_group).toBeDefined();
    expect(proposal_group!.deal_count).toBe(3);
    expect(proposal_group!.total_amount).toBeCloseTo(7037035, 0);
  });

  test('空の商談リストで状態が正しくハンドルされる', () => {
    const customer_id = 'CUST003';
    const deals: Array<{
      deal_id: string;
      customer_id: string;
      status: string;
      amount: number;
    }> = [];

    const result = classifyDealsByStatus(customer_id, deals);

    expect(result).toEqual({
      customer_id: 'CUST003',
      status_groups: [],
    });
  });

  test('異なる顧客IDの商談は除外される', () => {
    const customer_id = 'CUST004';
    const deals = [
      {
        deal_id: 'DEAL201',
        customer_id: 'CUST004',
        status: '失注',
        amount: 1000000,
      },
      {
        deal_id: 'DEAL202',
        customer_id: 'CUST005',
        status: '失注',
        amount: 2000000,
      },
      {
        deal_id: 'DEAL203',
        customer_id: 'CUST004',
        status: '失注',
        amount: 3000000,
      },
    ];

    const result = classifyDealsByStatus(customer_id, deals);

    expect(result.status_groups.length).toBe(1);
    const failure_group = result.status_groups[0];
    expect(failure_group.status).toBe('失注');
    expect(failure_group.deal_count).toBe(2);
    expect(failure_group.total_amount).toBe(4000000);
  });
});