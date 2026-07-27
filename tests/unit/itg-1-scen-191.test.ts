import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-191
  test('顧客別商談進捗集計機能 - 受注ステータスの商談が複数件のとき、合計金額が正確に集計される', () => {
    const customerId = 'CUST001';
    const deals = [
      {
        id: 'DEAL001',
        customerId,
        status: '受注',
        amount: 500000,
      },
      {
        id: 'DEAL002',
        customerId,
        status: '受注',
        amount: 300000,
      },
      {
        id: 'DEAL003',
        customerId,
        status: '受注',
        amount: 200000,
      },
    ];

    const result = aggregateDealProgressByCustomer(deals);

    expect(result).toEqual({
      customerId,
      progressSummary: {
        '受注': {
          count: 3,
          totalAmount: 1000000,
        },
      },
    });
  });
});