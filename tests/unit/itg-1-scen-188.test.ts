import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-188
  test('顧客別商談進捗集計機能 - 交渉中ステータスの商談が複数件のとき、合計金額が正確に集計される', () => {
    const customerId = 'CUST001';
    const deals = [
      {
        dealId: 'DEAL001',
        customerId: customerId,
        amount: 500000,
        status: '交渉中'
      },
      {
        dealId: 'DEAL002',
        customerId: customerId,
        amount: 750000,
        status: '交渉中'
      },
      {
        dealId: 'DEAL003',
        customerId: customerId,
        amount: 300000,
        status: '交渉中'
      }
    ];

    const result = aggregateDealProgressByCustomer(customerId, deals);

    expect(result.customerId).toBe(customerId);
    expect(result.statusBreakdown).toBeDefined();

    const negotiatingDeals = result.statusBreakdown.find(
      (breakdown) => breakdown.status === '交渉中'
    );

    expect(negotiatingDeals).toBeDefined();
    expect(negotiatingDeals?.count).toBe(3);
    expect(negotiatingDeals?.totalAmount).toBe(1550000);
  });
});