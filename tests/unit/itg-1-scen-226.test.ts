import { activateMigrationPlan } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-226
  test("[normal] システム移行計画策定 - 各フェーズの完了判定基準と遅延時の代替案が定義されて移行計画が有効化される", () => {
    const migrationPlan = {
      planName: "Salesforce→自社システム移行計画",
      migrationStartDate: new Date("2024-06-01T00:00:00Z"),
      migrationCompletionTargetDate: new Date("2024-12-31T23:59:59Z"),
      phases: [
        {
          phaseNumber: 1,
          phaseName: "データ準備",
          completionCriteria: "全データの検証完了",
          delayAlternative: "並行作業体制の構築",
        },
        {
          phaseNumber: 2,
          phaseName: "システム構築",
          completionCriteria: "全機能の単体テスト完了",
          delayAlternative: "外部ベンダーの追加投入",
        },
        {
          phaseNumber: 3,
          phaseName: "本番運用開始",
          completionCriteria: "ユーザー受け入れテスト合格",
          delayAlternative: "フェーズ2の並行運用延長",
        },
      ],
      status: "draft",
    };

    const result = activateMigrationPlan(migrationPlan);

    expect(result.status).toBe("active");
    expect(result.planName).toBe("Salesforce→自社システム移行計画");
    expect(result.migrationStartDate).toEqual(new Date("2024-06-01T00:00:00Z"));
    expect(result.migrationCompletionTargetDate).toEqual(
      new Date("2024-12-31T23:59:59Z")
    );
    expect(result.phases).toHaveLength(3);

    expect(result.phases[0]).toEqual({
      phaseNumber: 1,
      phaseName: "データ準備",
      completionCriteria: "全データの検証完了",
      delayAlternative: "並行作業体制の構築",
    });

    expect(result.phases[1]).toEqual({
      phaseNumber: 2,
      phaseName: "システム構築",
      completionCriteria: "全機能の単体テスト完了",
      delayAlternative: "外部ベンダーの追加投入",
    });

    expect(result.phases[2]).toEqual({
      phaseNumber: 3,
      phaseName: "本番運用開始",
      completionCriteria: "ユーザー受け入れテスト合格",
      delayAlternative: "フェーズ2の並行運用延長",
    });

    expect(result.phases.every((phase) => phase.completionCriteria.length > 0))
      .toBe(true);
    expect(result.phases.every((phase) => phase.delayAlternative.length > 0))
      .toBe(true);

    expect(result).toHaveProperty("activationTimestamp");
  });
});