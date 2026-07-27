import { aggregateMonthlySalesByDeal } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-148
  test('当月商談金額集計機能 - 商談の明細行が1件のとき商談金額がその明細行金額と一致する', () => {
    const targetMonth = '2024-01-01';
    const dealData = {
      dealId: 'DEAL001',
      dealName: 'テスト商談A',
      dealStatus: '進行中',
      createdDate: '2024-01-15T10:00:00Z',
      lineItems: [
        {
          lineItemId: 'LINE001',
          amount: 500000,
        },
      ],
    };

    const result = aggregateMonthlySalesByDeal([dealData], targetMonth);

    expect(result.totalAmount).toBe(500000);
    expect(result.dealCount).toBe(1);
    expect(result.deals[0].dealId).toBe('DEAL001');
    expect(result.deals[0].dealName).toBe('テスト商談A');
    expect(result.deals[0].dealStatus).toBe('進行中');
    expect(result.deals[0].aggregatedAmount).toBe(500000);
  });
});