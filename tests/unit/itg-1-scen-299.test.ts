import { approveInvestmentDecision } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-299: [edge] 投資判断承認ロジック - リスク許容度が閾値と完全に一致する境界ケースで、承認判定の結果が一貫して決定される
  test("should return consistent approval decision when risk tolerance exactly matches system threshold", () => {
    // 前提: システム設定のリスク許容度閾値を定義
    const SYSTEM_RISK_THRESHOLD = 0.75;
    const riskToleranceAtThreshold = 0.75;

    // テスト対象の投資案件データ
    const investmentProposal = {
      proposalId: "INV-2024-001",
      initialConstructionCost: 5000000, // 500万円
      annualMaintenanceCost: 1000000, // 100万円
      salesforceAnnualLicenseCost: 2000000, // 200万円
      roi: 1.8, // 180%
      paybackPeriodMonths: 18,
      riskLevel: 0.75, // リスク許容度がシステム閾値と一致
    };

    // 1回目の実行
    const firstResult = approveInvestmentDecision(investmentProposal);

    // 2回目の実行（同じ条件）
    const secondResult = approveInvestmentDecision(investmentProposal);

    // 3回目の実行（同じ条件）
    const thirdResult = approveInvestmentDecision(investmentProposal);

    // 4回目の実行（同じ条件）
    const fourthResult = approveInvestmentDecision(investmentProposal);

    // 1回目と2回目の結果が一致することを検証
    expect(firstResult.approved).toBe(secondResult.approved);
    expect(firstResult.approved).toBe(thirdResult.approved);
    expect(firstResult.approved).toBe(fourthResult.approved);

    // 複数回の実行でも同一の承認判定結果を返すことを検証
    expect(firstResult).toEqual(secondResult);
    expect(secondResult).toEqual(thirdResult);
    expect(thirdResult).toEqual(fourthResult);

    // リスク許容度が閾値と完全に一致する場合、承認決定が行われることを確認
    expect(firstResult.approved).toBe(true);
    expect(firstResult.riskToleranceMatched).toBe(true);
    expect(firstResult.riskLevel).toBe(riskToleranceAtThreshold);
    expect(firstResult.decision).toBe("APPROVED");
  });
});