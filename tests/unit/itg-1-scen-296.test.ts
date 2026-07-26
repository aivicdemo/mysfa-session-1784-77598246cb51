import { approveInvestmentDecision } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-296
  test("投資判断承認ロジック - 経営者が設定したROI閾値・回収期間・リスク許容度の基準に対して、試算結果が合致する場合に承認判定される", () => {
    // 経営者が設定した基準値
    const criteria = {
      roiThreshold: 150,
      recoveryPeriodMonths: 24,
      riskToleranceLevel: 3,
    };

    // 投資案件の試算結果（基準値以内）
    const trialResult = {
      roi: 145,
      recoveryPeriodMonths: 18,
      riskValue: 2,
    };

    const result = approveInvestmentDecision(criteria, trialResult);

    expect(result.status).toBe("承認");
    expect(result.roiMatch).toBe(true);
    expect(result.recoveryPeriodMatch).toBe(true);
    expect(result.riskToleranceMatch).toBe(true);
    expect(result.approved).toBe(true);
  });

  // 試算結果がROI閾値を超える場合
  test("試算結果がROI閾値を超える場合は不承認", () => {
    const criteria = {
      roiThreshold: 150,
      recoveryPeriodMonths: 24,
      riskToleranceLevel: 3,
    };

    const trialResult = {
      roi: 155,
      recoveryPeriodMonths: 18,
      riskValue: 2,
    };

    const result = approveInvestmentDecision(criteria, trialResult);

    expect(result.status).toBe("不承認");
    expect(result.roiMatch).toBe(false);
    expect(result.approved).toBe(false);
  });

  // 試算結果が回収期間を超える場合
  test("試算結果が回収期間を超える場合は不承認", () => {
    const criteria = {
      roiThreshold: 150,
      recoveryPeriodMonths: 24,
      riskToleranceLevel: 3,
    };

    const trialResult = {
      roi: 145,
      recoveryPeriodMonths: 26,
      riskValue: 2,
    };

    const result = approveInvestmentDecision(criteria, trialResult);

    expect(result.status).toBe("不承認");
    expect(result.recoveryPeriodMatch).toBe(false);
    expect(result.approved).toBe(false);
  });

  // 試算結果がリスク許容度を超える場合
  test("試算結果がリスク許容度を超える場合は不承認", () => {
    const criteria = {
      roiThreshold: 150,
      recoveryPeriodMonths: 24,
      riskToleranceLevel: 3,
    };

    const trialResult = {
      roi: 145,
      recoveryPeriodMonths: 18,
      riskValue: 4,
    };

    const result = approveInvestmentDecision(criteria, trialResult);

    expect(result.status).toBe("不承認");
    expect(result.riskToleranceMatch).toBe(false);
    expect(result.approved).toBe(false);
  });

  // すべての基準値に対して試算結果が境界値で一致する場合
  test("試算結果がすべての基準値と正確に一致する場合は承認", () => {
    const criteria = {
      roiThreshold: 150,
      recoveryPeriodMonths: 24,
      riskToleranceLevel: 3,
    };

    const trialResult = {
      roi: 150,
      recoveryPeriodMonths: 24,
      riskValue: 3,
    };

    const result = approveInvestmentDecision(criteria, trialResult);

    expect(result.status).toBe("承認");
    expect(result.roiMatch).toBe(true);
    expect(result.recoveryPeriodMatch).toBe(true);
    expect(result.riskToleranceMatch).toBe(true);
    expect(result.approved).toBe(true);
  });

  // 複数の基準を同時に超える場合
  test("複数の基準値を同時に超える場合は不承認", () => {
    const criteria = {
      roiThreshold: 150,
      recoveryPeriodMonths: 24,
      riskToleranceLevel: 3,
    };

    const trialResult = {
      roi: 160,
      recoveryPeriodMonths: 30,
      riskValue: 5,
    };

    const result = approveInvestmentDecision(criteria, trialResult);

    expect(result.status).toBe("不承認");
    expect(result.roiMatch).toBe(false);
    expect(result.recoveryPeriodMatch).toBe(false);
    expect(result.riskToleranceMatch).toBe(false);
    expect(result.approved).toBe(false);
  });

  // 基準値がnullまたはundefinedの場合はエラー
  test("基準値が不正な場合はエラーを発生させる", () => {
    const invalidCriteria = {
      roiThreshold: null,
      recoveryPeriodMonths: 24,
      riskToleranceLevel: 3,
    };

    const trialResult = {
      roi: 145,
      recoveryPeriodMonths: 18,
      riskValue: 2,
    };

    expect(() =>
      approveInvestmentDecision(invalidCriteria as any, trialResult)
    ).toThrow(/ROI閾値/);
  });

  // 試算結果が不正な場合はエラー
  test("試算結果が不正な場合はエラーを発生させる", () => {
    const criteria = {
      roiThreshold: 150,
      recoveryPeriodMonths: 24,
      riskToleranceLevel: 3,
    };

    const invalidTrialResult = {
      roi: undefined,
      recoveryPeriodMonths: 18,
      riskValue: 2,
    };

    expect(() =>
      approveInvestmentDecision(criteria, invalidTrialResult as any)
    ).toThrow(/試算結果/);
  });
});