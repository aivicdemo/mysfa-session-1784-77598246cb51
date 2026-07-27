import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-177
  test('顧客別商談進捗集計機能 - 失注ステータスの商談件数が0件のとき、その件数が0として集計される', () => {
    const customerId = 'CUST-001';
    const deals = [
      {
        dealId: 'DEAL-001',
        customerId: customerId,
        status: '進行中',
        amount: 100000,
      },
      {
        dealId: 'DEAL-002',
        customerId: customerId,
        status: '進行中',
        amount: 150000,
      },
      {
        dealId: 'DEAL-003',
        customerId: customerId,
        status: '進行中',
        amount: 200000,
      },
      {
        dealId: 'DEAL-004',
        customerId: customerId,
        status: '成約',
        amount: 500000,
      },
      {
        dealId: 'DEAL-005',
        customerId: customerId,
        status: '成約',
        amount: 300000,
      },
    ];

    const result = aggregateDealProgressByCustomer(customerId, deals);

    expect(result).toEqual({
      customerId: customerId,
      progressSummary: {
        '進行中': {
          count: 3,
          totalAmount: 450000,
        },
        '成約': {
          count: 2,
          totalAmount: 800000,
        },
        '失注': {
          count: 0,
          totalAmount: 0,
        },
      },
    });
  });
});