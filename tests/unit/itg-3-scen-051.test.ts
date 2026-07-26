import { evaluateTrainingCompletionReadiness } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能（導入研修・運用マニュアル整備完了判定）", () => {
  // SCEN-051: [error] 導入研修・運用マニュアル整備完了判定機能 - 完了判定に必要な指標が欠落している場合、エラーが発生する
  test("完了判定に必要な指標が欠落している場合、エラーメッセージが表示される", () => {
    // 正常なデータセット：研修実施率、マニュアル理解度、システム操作習熟度がすべて存在
    const validReadinessData = {
      trainingCompletionRate: 0.95,
      manualComprehensionScore: 0.88,
      systemOperationProficiencyScore: 0.92,
      deploymentPhase: "pre_cutover"
    };

    // テスト1: すべての指標が揃っている場合は完了判定が成功する
    const validResult = evaluateTrainingCompletionReadiness(validReadinessData);
    expect(validResult).toEqual({
      status: "ready",
      isReadyForCutover: true,
      readinessScore: 0.917,
      missingIndicators: [],
      evaluationTimestamp: expect.any(String)
    });

    // テスト2: 研修実施率が欠落している場合
    const missingTrainingRate = {
      trainingCompletionRate: undefined,
      manualComprehensionScore: 0.88,
      systemOperationProficiencyScore: 0.92,
      deploymentPhase: "pre_cutover"
    };
    expect(() => evaluateTrainingCompletionReadiness(missingTrainingRate)).toThrow(/研修実施率/);

    // テスト3: マニュアル理解度が欠落している場合
    const missingManualScore = {
      trainingCompletionRate: 0.95,
      manualComprehensionScore: undefined,
      systemOperationProficiencyScore: 0.92,
      deploymentPhase: "pre_cutover"
    };
    expect(() => evaluateTrainingCompletionReadiness(missingManualScore)).toThrow(/マニュアル理解度/);

    // テスト4: システム操作習熟度が欠落している場合
    const missingProficiencyScore = {
      trainingCompletionRate: 0.95,
      manualComprehensionScore: 0.88,
      systemOperationProficiencyScore: undefined,
      deploymentPhase: "pre_cutover"
    };
    expect(() => evaluateTrainingCompletionReadiness(missingProficiencyScore)).toThrow(/操作習熟度/);

    // テスト5: 複数の指標が欠落している場合（研修実施率とマニュアル理解度）
    const multipleIndicatorsMissing = {
      trainingCompletionRate: undefined,
      manualComprehensionScore: undefined,
      systemOperationProficiencyScore: 0.92,
      deploymentPhase: "pre_cutover"
    };
    expect(() => evaluateTrainingCompletionReadiness(multipleIndicatorsMissing)).toThrow(/研修実施率/);

    // テスト6: すべての指標が欠落している場合
    const allIndicatorsMissing = {
      trainingCompletionRate: undefined,
      manualComprehensionScore: undefined,
      systemOperationProficiencyScore: undefined,
      deploymentPhase: "pre_cutover"
    };
    expect(() => evaluateTrainingCompletionReadiness(allIndicatorsMissing)).toThrow(/研修実施率/);

    // テスト7: 指標値がnullの場合
    const nullTrainingRate = {
      trainingCompletionRate: null,
      manualComprehensionScore: 0.88,
      systemOperationProficiencyScore: 0.92,
      deploymentPhase: "pre_cutover"
    };
    expect(() => evaluateTrainingCompletionReadiness(nullTrainingRate as any)).toThrow(/研修実施率/);

    // テスト8: 指標値が0未満の場合（不正な値）
    const negativeTrainingRate = {
      trainingCompletionRate: -0.1,
      manualComprehensionScore: 0.88,
      systemOperationProficiencyScore: 0.92,
      deploymentPhase: "pre_cutover"
    };
    expect(() => evaluateTrainingCompletionReadiness(negativeTrainingRate)).toThrow(/研修実施率/);

    // テスト9: 指標値が1を超える場合（不正な値）
    const exceedingManualScore = {
      trainingCompletionRate: 0.95,
      manualComprehensionScore: 1.5,
      systemOperationProficiencyScore: 0.92,
      deploymentPhase: "pre_cutover"
    };
    expect(() => evaluateTrainingCompletionReadiness(exceedingManualScore)).toThrow(/マニュアル理解度/);

    // テスト10: 境界値テスト - すべての指標が最小合格値（0.85）の場合
    const minimumValidReadiness = {
      trainingCompletionRate: 0.85,
      manualComprehensionScore: 0.85,
      systemOperationProficiencyScore: 0.85,
      deploymentPhase: "pre_cutover"
    };
    const minimumResult = evaluateTrainingCompletionReadiness(minimumValidReadiness);
    expect(minimumResult.status).toBe("ready");
    expect(minimumResult.readinessScore).toBe(0.85);

    // テスト11: 境界値テスト - 1つの指標が合格値未満（0.84）の場合
    const belowMinimumTrainingRate = {
      trainingCompletionRate: 0.84,
      manualComprehensionScore: 0.85,
      systemOperationProficiencyScore: 0.85,
      deploymentPhase: "pre_cutover"
    };
    const belowMinimumResult = evaluateTrainingCompletionReadiness(belowMinimumTrainingRate);
    expect(belowMinimumResult.status).toBe("not_ready");
    expect(belowMinimumResult.isReadyForCutover).toBe(false);
  });
});