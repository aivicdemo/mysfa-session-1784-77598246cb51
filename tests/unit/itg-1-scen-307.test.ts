import { generateMigrationPlan } from "../../src/logic/it-1-3";

describe("段階的移行計画策定機能", () => {
  test("SCEN-307: マイルストーン件数が境界値の時に計画が正しく生成される", () => {
    // ===== 最小値1件の場合 =====
    const minMilestoneInput = {
      milestones: [
        {
          phaseNumber: 1,
          phaseName: "Salesforce→自社システム移行準備",
          migrationItems: ["ユーザーマスタ移行", "顧客マスタ移行"],
          dueDate: new Date("2024-04-30"),
        },
      ],
    };

    const minPlanResult = generateMigrationPlan(minMilestoneInput);

    expect(minPlanResult).toBeDefined();
    expect(minPlanResult.milestones).toHaveLength(1);
    expect(minPlanResult.milestones[0].phaseNumber).toBe(1);
    expect(minPlanResult.milestones[0].phaseName).toBe(
      "Salesforce→自社システム移行準備"
    );
    expect(minPlanResult.milestones[0].migrationItems).toHaveLength(2);
    expect(minPlanResult.milestones[0].dueDate).toEqual(
      new Date("2024-04-30")
    );
    expect(minPlanResult.status).toBe("generated");

    // ===== 最大値N件の場合 =====
    const maxMilestoneInput = {
      milestones: [
        {
          phaseNumber: 1,
          phaseName: "移行準備フェーズ",
          migrationItems: [
            "ユーザーマスタ移行",
            "顧客マスタ移行",
            "権限設定準備",
          ],
          dueDate: new Date("2024-04-30"),
        },
        {
          phaseNumber: 2,
          phaseName: "商談データ移行フェーズ",
          migrationItems: ["商談レコード移行", "活動記録移行"],
          dueDate: new Date("2024-05-31"),
        },
        {
          phaseNumber: 3,
          phaseName: "請求データ移行フェーズ",
          migrationItems: ["請求書レコード移行", "請求明細移行"],
          dueDate: new Date("2024-06-30"),
        },
        {
          phaseNumber: 4,
          phaseName: "運用開始準備フェーズ",
          migrationItems: ["並行運用テスト", "チームトレーニング完了"],
          dueDate: new Date("2024-07-31"),
        },
      ],
    };

    const maxPlanResult = generateMigrationPlan(maxMilestoneInput);

    expect(maxPlanResult).toBeDefined();
    expect(maxPlanResult.milestones).toHaveLength(4);
    expect(maxPlanResult.milestones[0].phaseNumber).toBe(1);
    expect(maxPlanResult.milestones[1].phaseNumber).toBe(2);
    expect(maxPlanResult.milestones[2].phaseNumber).toBe(3);
    expect(maxPlanResult.milestones[3].phaseNumber).toBe(4);

    // 期限の依存関係を検証
    expect(maxPlanResult.milestones[0].dueDate).toEqual(
      new Date("2024-04-30")
    );
    expect(maxPlanResult.milestones[1].dueDate).toEqual(
      new Date("2024-05-31")
    );
    expect(maxPlanResult.milestones[2].dueDate).toEqual(
      new Date("2024-06-30")
    );
    expect(maxPlanResult.milestones[3].dueDate).toEqual(
      new Date("2024-07-31")
    );

    // 各マイルストーンの段階割り当てを検証
    expect(maxPlanResult.milestones.every((m) => m.phaseNumber > 0)).toBe(
      true
    );
    expect(
      maxPlanResult.milestones.every((m) => m.migrationItems.length > 0)
    ).toBe(true);

    expect(maxPlanResult.status).toBe("generated");

    // ===== 境界値外：0件以下 =====
    const invalidMinInput = {
      milestones: [],
    };

    expect(() => generateMigrationPlan(invalidMinInput)).toThrow(
      /マイルストーン/
    );

    // ===== 境界値外：N件超過 =====
    const invalidMaxInput = {
      milestones: Array.from({ length: 11 }, (_, i) => ({
        phaseNumber: i + 1,
        phaseName: `Phase ${i + 1}`,
        migrationItems: ["Item1"],
        dueDate: new Date(`2024-${String(i + 4).padStart(2, "0")}-30`),
      })),
    };

    expect(() => generateMigrationPlan(invalidMaxInput)).toThrow(
      /マイルストーン/
    );
  });
});