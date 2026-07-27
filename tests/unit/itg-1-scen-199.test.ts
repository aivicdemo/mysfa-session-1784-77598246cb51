import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-199
  test('顧客IDフィールドが欠落している商談が含まれるとき、エラーまたは除外される', () => {
    const deals = [
      {
        dealId: 'DEAL-A',
        customerId: 'CUST-001',
        amount: 100000,
        stage: '提案中',
      },
      {
        dealId: 'DEAL-B',
        customerId: null,
        amount: 50000,
        stage: '初期接触',
      },
      {
        dealId: 'DEAL-C',
        customerId: 'CUST-002',
        amount: 75000,
        stage: '交渉中',
      },
    ];

    const result = aggregateDealProgressByCustomer(deals);

    expect(result).toEqual({
      aggregatedData: [
        {
          customerId: 'CUST-001',
          dealCount: 1,
          totalAmount: 100000,
          stageBreakdown: {
            '提案中': { count: 1, amount: 100000 },
          },
        },
        {
          customerId: 'CUST-002',
          dealCount: 1,
          totalAmount: 75000,
          stageBreakdown: {
            '交渉中': { count: 1, amount: 75000 },
          },
        },
      ],
      warnings: [
        {
          message: '顧客IDが未設定の商談が含まれています。集計対象外として処理されました。',
          excludedDealIds: ['DEAL-B'],
        },
      ],
    });
  });
});