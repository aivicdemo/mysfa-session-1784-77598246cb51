import { evaluateMigrationReadiness } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-301
  test("導入研修準備完了判定機能 - マニュアル理解度が基準未満の場合、移行準備完了判定がされない", () => {
    const trainingAssessmentData = {
      researcherId: "EMP001",
      manualComprehensionScore: 55,
      manualComprehensionThreshold: 60,
      systemOperationProficiencyScore: 75,
      systemOperationProficiencyThreshold: 60,
      trainingCompletionRate: 100,
      trainingCompletionThreshold: 80,
    };

    const result = evaluateMigrationReadiness(trainingAssessmentData);

    expect(result.migrationReadinessStatus).toBe("incomplete");
    expect(result.manualComprehensionScore).toBe(55);
    expect(result.manualComprehensionThreshold).toBe(60);
    expect(result.manualComprehensionMeetsStandard).toBe(false);
    expect(result.systemOperationProficiencyMeetsStandard).toBe(true);
    expect(result.trainingCompletionRateMeetsStandard).toBe(true);
    expect(result.requiredRetrainingItems).toContain("manual_comprehension");
    expect(result.completionDecision).toBe("retraining_required");
  });
});