import { calculateMonthlyProgressRate } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-141
  test("当月進捗率計算機能 - 進捗率計算で割り切れない値のとき小数点以下が発生する", () => {
    // テスト入力: 当月の目標売上を100万円、現在の売上を33万円に設定
    const targetSalesAmount = 1000000;
    const currentSalesAmount = 330000;

    // 進捗率計算関数を呼び出し、結果の値と型を取得
    const progressRate = calculateMonthlyProgressRate(
      currentSalesAmount,
      targetSalesAmount
    );

    // 返却された進捗率の値を検証
    // 期待値: 33.33333333333333（またはそれに準ずる精度）
    const expectedProgressRate = 33.33333333333333;
    const tolerance = 1e-10;

    expect(typeof progressRate).toBe("number");
    expect(Math.abs(progressRate - expectedProgressRate)).toBeLessThanOrEqual(
      tolerance
    );

    // 返却された進捗率の小数点以下の桁数を確認
    // 小数部が保持されていることを確認
    const hasDecimalPart = progressRate % 1 !== 0;
    expect(hasDecimalPart).toBe(true);
  });
});