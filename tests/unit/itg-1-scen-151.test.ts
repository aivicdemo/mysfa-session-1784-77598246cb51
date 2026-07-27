import { aggregateMonthlyDealAmount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-151
  test('当月商談金額集計機能 - 明細行の金額が負数の場合も合算に含まれる', () => {
    const dealDetails = [
      {
        detailId: 'detail-001',
        amount: 500000,
      },
      {
        detailId: 'detail-002',
        amount: -200000,
      },
      {
        detailId: 'detail-003',
        amount: 150000,
      },
    ];

    const result = aggregateMonthlyDealAmount(dealDetails);

    expect(result.totalAmount).toBe(450000);
  });
});