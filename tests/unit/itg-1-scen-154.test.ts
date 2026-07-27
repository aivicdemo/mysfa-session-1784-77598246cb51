import { aggregateMonthlySalesMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-154
  test('当月集計結果の入力検証 - 商談レコードがnullのとき集計関数が例外を発生させる', () => {
    const nullDealRecords = null;

    expect(() => {
      aggregateMonthlySalesMetrics(nullDealRecords);
    }).toThrow(/商談/);
  });
});