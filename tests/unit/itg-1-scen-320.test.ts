import { calculateAverageROI } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-320
  test("ROI試算・投資判断支援機能 - 3年間の総投資額から年平均ROIが正確に算出される", () => {
    // 入力値の準備
    const initialInvestment = 1000000; // 初期投資額: 100万円
    const yearlyInvestments = [500000, 300000, 200000]; // 年度投資額: 1年目50万円、2年目30万円、3年目20万円
    const yearlyProfits = [400000, 600000, 800000]; // 各年度利益: 1年目40万円、2年目60万円、3年目80万円

    // 期待値の計算
    // 3年間の総投資額: 初期投資100万 + 50万 + 30万 + 20万 = 200万円
    const expectedTotalInvestment = 2000000;

    // 3年間の総利益: 40万 + 60万 + 80万 = 180万円
    const expectedTotalProfit = 1800000;

    // 年平均ROI = (総利益 / 総投資額) × 100 = (180万 / 200万) × 100 = 90%
    const expectedAverageROI = 90;

    // 実行
    const result = calculateAverageROI({
      initialInvestment,
      yearlyInvestments,
      yearlyProfits,
    });

    // 検証
    expect(result.totalInvestment).toBe(expectedTotalInvestment);
    expect(result.totalProfit).toBe(expectedTotalProfit);
    expect(result.averageROI).toBe(expectedAverageROI);
  });
});