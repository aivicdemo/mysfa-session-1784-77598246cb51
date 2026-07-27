import { aggregateDealMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-155: [normal] 当月集計結果の入力検証 - 商談レコードが空配列のとき集計関数が正常に処理される
  test('商談レコードが空配列のとき、集計関数は業務上妥当なゼロ値で初期化されたオブジェクトを返す', () => {
    const emptyDeals = [];

    const result = aggregateDealMetrics(emptyDeals);

    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(typeof result).toBe('object');

    expect(result.dealCount).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.averageDealSize).toBe(0);
    expect(typeof result.closureRate).toBe('number');
    expect(result.closureRate).toBe(0);
    expect(typeof result.lossRate).toBe('number');
    expect(result.lossRate).toBe(0);
    expect(Number.isNaN(result.averageDealSize)).toBe(false);
  });
});