import { aggregateMonthlyDealAmount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-149
  test('当月商談金額集計機能 - 商談の明細行が複数件のとき商談金額がすべての明細行金額の合算になる', () => {
    const dealId = 'DL001';
    const dealLineItems = [
      {
        dealId: dealId,
        lineItemId: 'LI001',
        amount: 100000,
      },
      {
        dealId: dealId,
        lineItemId: 'LI002',
        amount: 250000,
      },
      {
        dealId: dealId,
        lineItemId: 'LI003',
        amount: 150000,
      },
    ];

    const result = aggregateMonthlyDealAmount(dealLineItems);

    expect(result).toEqual({
      dealId: dealId,
      totalAmount: 500000,
    });
  });
});