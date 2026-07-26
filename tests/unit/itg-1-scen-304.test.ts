import { definePhasesMilestonesAndRisks } from "../../src/logic/it-1-3";

describe("段階的移行計画策定機能 - 移行フェーズ・マイルストーン・リスク要因・対応策の定義", () => {
  // SCEN-304
  test("移行計画書に移行フェーズ、マイルストーン、リスク要因、対応策が明確に記載されること", () => {
    const input = {
      projectName: "Salesforce→自社システム移行プロジェクト",
      targetScope: {
        divisions: ["営業部", "企画部"],
        systems: ["営業管理システム", "顧客ポータル"],
        userCount: 150,
      },
      phases: [
        {
          phaseId: "phase_1",
          phaseName: "準備フェーズ",
          description: "移行の基盤整備と要件定義",
          scheduledStartDate: "2024-02-01",
          scheduledEndDate: "2024-03-31",
          owner: "プロジェクトマネージャー",
          milestones: [
            {
              milestoneId: "m_1_1",
              milestoneName: "要件定義完了",
              targetDate: "2024-02-28",
            },
            {
              milestoneId: "m_1_2",
              milestoneName: "移行テスト環境構築完了",
              targetDate: "2024-03-15",
            },
          ],
        },
        {
          phaseId: "phase_2",
          phaseName: "実装フェーズ",
          description: "自社システム本体の開発とカスタマイズ実装",
          scheduledStartDate: "2024-04-01",
          scheduledEndDate: "2024-07-31",
          owner: "開発チームリーダー",
          milestones: [
            {
              milestoneId: "m_2_1",
              milestoneName: "設計書承認",
              targetDate: "2024-04-15",
            },
            {
              milestoneId: "m_2_2",
              milestoneName: "テスト開始",
              targetDate: "2024-06-01",
            },
          ],
        },
        {
          phaseId: "phase_3",
          phaseName: "本番移行フェーズ",
          description: "本番環境への移行とカットオーバー実行",
          scheduledStartDate: "2024-08-01",
          scheduledEndDate: "2024-08-31",
          owner: "移行チームリーダー",
          milestones: [
            {
              milestoneId: "m_3_1",
              milestoneName: "本番稼働日",
              targetDate: "2024-08-15",
            },
          ],
        },
        {
          phaseId: "phase_4",
          phaseName: "安定化フェーズ",
          description: "本番運用後の安定性確認と問題解決",
          scheduledStartDate: "2024-09-01",
          scheduledEndDate: "2024-10-31",
          owner: "運用チームリーダー",
          milestones: [
            {
              milestoneId: "m_4_1",
              milestoneName: "安定化確認完了",
              targetDate: "2024-09-30",
            },
          ],
        },
      ],
      risks: [
        {
          riskId: "risk_1",
          riskName: "データ品質問題",
          description: "Salesforce から移行するデータの重複・欠落が発生する可能性",
          severity: "高",
          likelihood: "中",
          countermeasures: [
            {
              countermeasureId: "cm_1_1",
              countermeasureName: "事前データクレンジング",
              description:
                "移行前にデータ検証・クレンジング作業を実施し、品質基準をクリア",
              owner: "データ品質管理チーム",
              deadline: "2024-03-31",
            },
          ],
        },
        {
          riskId: "risk_2",
          riskName: "ユーザー教育不足",
          description:
            "営業チームが新システム操作に習熟せず、本番稼働後に業務支障が生じる",
          severity: "高",
          likelihood: "高",
          countermeasures: [
            {
              countermeasureId: "cm_2_1",
              countermeasureName: "研修プログラム実施",
              description:
                "全営業ユーザーを対象に段階的な操作研修を実施、理解度テスト実施",
              owner: "人材育成部門",
              deadline: "2024-07-31",
            },
          ],
        },
        {
          riskId: "risk_3",
          riskName: "システム連携障害",
          description:
            "自社システムと既存業務システムの連携に問題が発生し、データ連動が失敗する",
          severity: "中",
          likelihood: "中",
          countermeasures: [
            {
              countermeasureId: "cm_3_1",
              countermeasureName: "テスト環境構築",
              description:
                "本番環境と同等のテスト環境を先行構築し、連携テストを多段階実施",
              owner: "システムインテグレーションチーム",
              deadline: "2024-04-30",
            },
          ],
        },
      ],
    };

    const result = definePhasesMilestonesAndRisks(input);

    // 出力形式の検証：必須フィールド
    expect(result).toHaveProperty("projectName");
    expect(result).toHaveProperty("targetScope");
    expect(result).toHaveProperty("phases");
    expect(result).toHaveProperty("risks");
    expect(result).toHaveProperty("generatedAt");

    // プロジェクト名の検証
    expect(result.projectName).toBe("Salesforce→自社システム移行プロジェクト");

    // 移行対象範囲の検証
    expect(result.targetScope.divisions).toEqual(["営業部", "企画部"]);
    expect(result.targetScope.systems).toEqual([
      "営業管理システム",
      "顧客ポータル",
    ]);
    expect(result.targetScope.userCount).toBe(150);

    // フェーズ定義の検証（4フェーズすべてが記載）
    expect(result.phases).toHaveLength(4);
    expect(result.phases[0].phaseName).toBe("準備フェーズ");
    expect(result.phases[1].phaseName).toBe("実装フェーズ");
    expect(result.phases[2].phaseName).toBe("本番移行フェーズ");
    expect(result.phases[3].phaseName).toBe("安定化フェーズ");

    // 各フェーズの詳細情報の検証
    expect(result.phases[0]).toHaveProperty("description");
    expect(result.phases[0]).toHaveProperty("scheduledStartDate");
    expect(result.phases[0]).toHaveProperty("scheduledEndDate");
    expect(result.phases[0]).toHaveProperty("owner");
    expect(result.phases[0].description).toBe("移行の基盤整備と要件定義");
    expect(result.phases[0].owner).toBe("プロジェクトマネージャー");

    // マイルストーン定義の検証（準備フェーズに2個、実装フェーズに2個）
    expect(result.phases[0].milestones).toHaveLength(2);
    expect(result.phases[0].milestones[0].milestoneName).toBe("要件定義完了");
    expect(result.phases[0].milestones[0].targetDate).toBe("2024-02-28");
    expect(result.phases[0].milestones[1].milestoneName).toBe(
      "移行テスト環境構築完了"
    );
    expect(result.phases[0].milestones[1].targetDate).toBe("2024-03-15");

    expect(result.phases[1].milestones).toHaveLength(2);
    expect(result.phases[1].milestones[0].milestoneName).toBe("設計書承認");
    expect(result.phases[1].milestones[1].milestoneName).toBe("テスト開始");

    expect(result.phases[2].milestones).toHaveLength(1);
    expect(result.phases[2].milestones[0].milestoneName).toBe("本番稼働日");
    expect(result.phases[2].milestones[0].targetDate).toBe("2024-08-15");

    expect(result.phases[3].milestones).toHaveLength(1);
    expect(result.phases[3].milestones[0].milestoneName).toBe("安定化確認完了");

    // リスク要因の検証（3個）
    expect(result.risks).toHaveLength(3);

    // リスク1：データ品質問題
    expect(result.risks[0].riskName).toBe("データ品質問題");
    expect(result.risks[0].description).toBe(
      "Salesforce から移行するデータの重複・欠落が発生する可能性"
    );
    expect(result.risks[0].severity).toBe("高");
    expect(result.risks[0].likelihood).toBe("中");
    expect(result.risks[0].countermeasures).toHaveLength(1);
    expect(result.risks[0].countermeasures[0].countermeasureName).toBe(
      "事前データクレンジング"
    );
    expect(result.risks[0].countermeasures[0].description).toBe(
      "移行前にデータ検証・クレンジング作業を実施し、品質基準をクリア"
    );
    expect(result.risks[0].countermeasures[0].owner).toBe(
      "データ品質管理チーム"
    );
    expect(result.risks[0].countermeasures[0].deadline).toBe("2024-03-31");

    // リスク2：ユーザー教育不足
    expect(result.risks[1].riskName).toBe("ユーザー教育不足");
    expect(result.risks[1].severity).toBe("高");
    expect(result.risks[1].likelihood).toBe("高");
    expect(result.risks[1].countermeasures).toHaveLength(1);
    expect(result.risks[1].countermeasures[0].countermeasureName).toBe(
      "研修プログラム実施"
    );
    expect(result.risks[1].countermeasures[0].description).toBe(
      "全営業ユーザーを対象に段階的な操作研修を実施、理解度テスト実施"
    );
    expect(result.risks[1].countermeasures[0].owner).toBe("人材育成部門");
    expect(result.risks[1].countermeasures[0].deadline).toBe("2024-07-31");

    // リスク3：システム連携障害
    expect(result.risks[2].riskName).toBe("システム連携障害");
    expect(result.risks[2].severity).toBe("中");
    expect(result.risks[2].likelihood).toBe("中");
    expect(result.risks[2].countermeasures).toHaveLength(1);
    expect(result.risks[2].countermeasures[0].countermeasureName).toBe(
      "テスト環境構築"
    );
    expect(result.risks[2].countermeasures[0].owner).toBe(
      "システムインテグレーションチーム"
    );
    expect(result.risks[2].countermeasures[0].deadline).toBe("2024-04-30");

    // 生成日時の検証（ISO 8601 形式であること）
    expect(result.generatedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // 移行計画書フォーマット出力の検証
    expect(result).toHaveProperty("documentFormat");
    expect(["PDF", "Excel"]).toContain(result.documentFormat);

    // 各フェーズ間のスケジュール整合性検証
    expect(result.phases[0].scheduledEndDate).toBeLessThanOrEqual(
      result.phases[1].scheduledStartDate
    );
    expect(result.phases[1].scheduledEndDate).toBeLessThanOrEqual(
      result.phases[2].scheduledStartDate
    );
    expect(result.phases[2].scheduledEndDate).toBeLessThanOrEqual(
      result.phases[3].scheduledStartDate
    );

    // マイルストーン日付がフェーズ範囲内に収まっていることを検証
    result.phases.forEach((phase) => {
      phase.milestones.forEach((milestone) => {
        expect(milestone.targetDate).toBeGreaterThanOrEqual(
          phase.scheduledStartDate
        );
        expect(milestone.targetDate).toBeLessThanOrEqual(
          phase.scheduledEndDate
        );
      });
    });

    // 対応策期限が対象フェーズ期間内に収まっていることを検証
    result.risks.forEach((risk) => {
      risk.countermeasures.forEach((countermeasure) => {
        // 対応策期限が全フェーズの終了日以前であること
        const allPhasesEndDate = result.phases[result.phases.length - 1]
          .scheduledEndDate;
        expect(countermeasure.deadline).toBeLessThanOrEqual(allPhasesEndDate);
      });
    });
  });
});