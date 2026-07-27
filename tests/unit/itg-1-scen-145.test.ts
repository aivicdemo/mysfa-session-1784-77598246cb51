import { classifyDealsByStatus } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-145: [error] 当月商談ステータス分類機能 - ステータスがnullまたは未定義の商談がある場合、集計結果に含まれない
  test('should exclude deals with null or undefined status from aggregation results', () => {
    const testDeals = [
      {
        id: 'deal_001',
        customerId: 'cust_001',
        status: '交渉中',
        amount: 500000,
        closedDate: '2024-01-15',
      },
      {
        id: 'deal_002',
        customerId: 'cust_002',
        status: null,
        amount: 300000,
        closedDate: '2024-01-20',
      },
      {
        id: 'deal_003',
        customerId: 'cust_003',
        status: undefined,
        amount: 200000,
        closedDate: '2024-01-25',
      },
    ];

    const result = classifyDealsByStatus(testDeals);

    expect(result.totalCount).toBe(1);
    expect(result.deals).toHaveLength(1);
    expect(result.deals[0].id).toBe('deal_001');
    expect(result.deals[0].status).toBe('交渉中');
    expect(result.statusBreakdown).toEqual({
      '交渉中': {
        count: 1,
        totalAmount: 500000,
      },
    });
  });
});