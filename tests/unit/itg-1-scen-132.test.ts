import { aggregateMonthlyContractCount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-132: [edge] 当月受注件数集計機能 - ステータスが受注の商談が0件のとき受注件数0として集計される
  test('should return 0 contracted deals count when no deals with contract status exist in current month', () => {
    const current_month_deals = [];
    
    const result = aggregateMonthlyContractCount(current_month_deals);
    
    expect(result).toEqual({
      contracted_count: 0,
      total_deals_evaluated: 0,
      processing_completed: true
    });
  });
});