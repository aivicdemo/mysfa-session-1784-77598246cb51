import { aggregateMonthlySalesTotal } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-130
  test('当月売上集計機能 - 商談金額が小数を含むときも正確に合算される', () => {
    // 準備: テストデータとして、小数を含む商談レコードを作成
    const deal_1 = {
      deal_id: 'D001',
      amount: 1000.50,
      status: '受注',
      deal_date: new Date('2024-01-15T09:00:00Z'),
    };

    const deal_2 = {
      deal_id: 'D002',
      amount: 2500.75,
      status: '受注',
      deal_date: new Date('2024-01-20T10:30:00Z'),
    };

    const deal_3 = {
      deal_id: 'D003',
      amount: 500.25,
      status: '受注',
      deal_date: new Date('2024-01-25T14:15:00Z'),
    };

    const deals = [deal_1, deal_2, deal_3];
    const target_month = new Date('2024-01-01T00:00:00Z');

    // 実行: 集計機能を実行
    const aggregation_result = aggregateMonthlySalesTotal(deals, target_month);

    // 検証: 合計金額が小数点第2位までの精度で正確に計算されている
    const expected_total_amount = 4001.50;
    expect(aggregation_result.total_amount).toBe(expected_total_amount);
    expect(aggregation_result.deal_count).toBe(3);
    expect(aggregation_result.aggregation_month).toEqual(target_month);
  });
});