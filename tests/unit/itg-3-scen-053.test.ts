import { defineMigrationPlan } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("段階的移行計画の定義・検証機能", () => {
  test("SCEN-053: 移行フェーズ・マイルストーン・リスク要因・対応策が完全に定義される", () => {
    // Setup: 移行計画の入力データを構築
    const migrationInput = {
      organizationId: "org-12345",
      projectName: "Salesforce_to_CustomSystem_Migration",
      startDate: new Date("2024-06-01T00:00:00Z"),
      expectedCompletionDate: new Date("2024-12-31T23:59:59Z"),
      phases: [
        {
          phaseId: "phase-1",
          phaseName: "準備段階",
          phaseStartDate: new Date("2024-06-01T00:00:00Z"),
          phaseEndDate: new Date("2024-07-31T23:59:59Z"),
          phaseObjective: "移行要件定義・体制構築・基盤設計",
          milestones: [
            {
              milestoneId: "ms-1-1",
              milestoneName: "移行要件定義完了",
              targetDate: new Date("2024-06-15T23:59:59Z"),
              completionCriteria: "機能要件書・非機能要件書が承認された"
            },
            {
              milestoneId: "ms-1-2",
              milestoneName: "移行体制確立",
              targetDate: new Date("2024-06-22T23:59:59Z"),
              completionCriteria: "PMO・開発チーム・テストチームが確定"
            },
            {
              milestoneId: "ms-1-3",
              milestoneName: "システム基本設計完了",
              targetDate: new Date("2024-07-15T23:59:59Z"),
              completionCriteria: "基本設計書が完成・顧客承認済み"
            }
          ]
        },
        {
          phaseId: "phase-2",
          phaseName: "実装段階",
          phaseStartDate: new Date("2024-08-01T00:00:00Z"),
          phaseEndDate: new Date("2024-10-31T23:59:59Z"),
          phaseObjective: "システム構築・データ移行・統合テスト",
          milestones: [
            {
              milestoneId: "ms-2-1",
              milestoneName: "コア機能実装完了",
              targetDate: new Date("2024-08-31T23:59:59Z"),
              completionCriteria: "全スプリント完了・ユニットテスト合格"
            },
            {
              milestoneId: "ms-2-2",
              milestoneName: "データ移行スクリプト実装完了",
              targetDate: new Date("2024-09-15T23:59:59Z"),
              completionCriteria: "マッピング仕様書完成・試験移行実施"
            },
            {
              milestoneId: "ms-2-3",
              milestoneName: "統合テスト開始",
              targetDate: new Date("2024-09-30T23:59:59Z"),
              completionCriteria: "テスト環境構築完了・テスト仕様書承認"
            }
          ]
        },
        {
          phaseId: "phase-3",
          phaseName: "運用段階",
          phaseStartDate: new Date("2024-11-01T00:00:00Z"),
          phaseEndDate: new Date("2024-12-31T23:59:59Z"),
          phaseObjective: "本番移行・ユーザー教育・安定運用",
          milestones: [
            {
              milestoneId: "ms-3-1",
              milestoneName: "ユーザー受け入れテスト完了",
              targetDate: new Date("2024-11-15T23:59:59Z"),
              completionCriteria: "UAT合格率100%達成・Sign-Off取得"
            },
            {
              milestoneId: "ms-3-2",
              milestoneName: "本番環境へのデータ移行",
              targetDate: new Date("2024-12-01T23:59:59Z"),
              completionCriteria: "全データ移行完了・照合完了率100%"
            },
            {
              milestoneId: "ms-3-3",
              milestoneName: "Salesforceライセンス廃止完了",
              targetDate: new Date("2024-12-31T23:59:59Z"),
              completionCriteria: "全ユーザーが新システムへ移行・ライセンス解約"
            }
          ]
        }
      ],
      riskFactors: [
        {
          riskId: "risk-001",
          riskName: "データ品質問題",
          riskDescription: "Salesforceから移行するデータに不整合や重複が存在する可能性",
          riskSeverity: "high",
          mitigationStrategy: "データクレンジング工程を追加し、移行前に全データを検証",
          contingencyPlan: "段階的移行で一部データから開始し、品質確認後に全体移行へ切り替え"
        },
        {
          riskId: "risk-002",
          riskName: "ユーザー採用の遅延",
          riskDescription: "営業チームが新システムへの移行に抵抗し、採用率が低下する可能性",
          riskSeverity: "high",
          mitigationStrategy: "事前の充実した研修・マニュアル整備・インセンティブ設計",
          contingencyPlan: "段階的ロールアウトで早期利用者向けサポートを手厚くする"
        },
        {
          riskId: "risk-003",
          riskName: "統合テスト期間の延長",
          riskDescription: "予期しない機能不具合により、統合テスト期間が延長する可能性",
          riskSeverity: "medium",
          mitigationStrategy: "早期のシステム統合テスト・自動テスト体制の構築",
          contingencyPlan: "本番移行スケジュールを2週間延長可能とする予備期間を設定"
        },
        {
          riskId: "risk-004",
          riskName: "パフォーマンス問題",
          riskDescription: "新システムのレスポンスがSalesforceより遅く、業務効率が低下する可能性",
          riskSeverity: "medium",
          mitigationStrategy: "負荷テスト実施・キャッシング戦略導入・インフラスケーリング計画",
          contingencyPlan: "パフォーマンス改善フェーズを別途設定し、段階的な最適化を実施"
        },
        {
          riskId: "risk-005",
          riskName: "セキュリティ脅威",
          riskDescription: "移行中のデータ漏洩やシステムへの不正アクセスが発生する可能性",
          riskSeverity: "critical",
          mitigationStrategy: "セキュリティ監査実施・暗号化・ネットワークセグメンテーション",
          contingencyPlan: "セキュリティ事故対応チームを編成・保険加入・インシデント対応計画"
        }
      ]
    };

    // Execute: 移行計画の定義・検証を実行
    const result = defineMigrationPlan(migrationInput);

    // Assert: 結果検証
    // 1. 検証ステータスが成功であること
    expect(result.validationStatus).toBe("OK");

    // 2. 移行フェーズが3つ以上定義されていることを確認
    expect(result.phases).toHaveLength(3);
    expect(result.phases[0].phaseName).toBe("準備段階");
    expect(result.phases[1].phaseName).toBe("実装段階");
    expect(result.phases[2].phaseName).toBe("運用段階");

    // 3. 各フェーズに時系列の日付が設定されていることを確認
    expect(new Date(result.phases[0].phaseStartDate).getTime()).toBeLessThan(
      new Date(result.phases[1].phaseStartDate).getTime()
    );
    expect(new Date(result.phases[1].phaseStartDate).getTime()).toBeLessThan(
      new Date(result.phases[2].phaseStartDate).getTime()
    );

    // 4. 各フェーズにマイルストーンが複数設定されていることを確認
    expect(result.phases[0].milestones.length).toBeGreaterThanOrEqual(3);
    expect(result.phases[1].milestones.length).toBeGreaterThanOrEqual(3);
    expect(result.phases[2].milestones.length).toBeGreaterThanOrEqual(3);

    // 5. 第1フェーズのマイルストーン詳細を検証
    expect(result.phases[0].milestones[0].milestoneName).toBe(
      "移行要件定義完了"
    );
    expect(result.phases[0].milestones[0].completionCriteria).toBe(
      "機能要件書・非機能要件書が承認された"
    );
    expect(result.phases[0].milestones[1].milestoneName).toBe("移行体制確立");
    expect(result.phases[0].milestones[2].milestoneName).toBe(
      "システム基本設計完了"
    );

    // 6. 第2フェーズのマイルストーン詳細を検証
    expect(result.phases[1].milestones[0].milestoneName).toBe(
      "コア機能実装完了"
    );
    expect(result.phases[1].milestones[1].milestoneName).toBe(
      "データ移行スクリプト実装完了"
    );
    expect(result.phases[1].milestones[2].milestoneName).toBe(
      "統合テスト開始"
    );

    // 7. 第3フェーズのマイルストーン詳細を検証
    expect(result.phases[2].milestones[0].milestoneName).toBe(
      "ユーザー受け入れテスト完了"
    );
    expect(result.phases[2].milestones[1].milestoneName).toBe(
      "本番環境へのデータ移行"
    );
    expect(result.phases[2].milestones[2].milestoneName).toBe(
      "Salesforceライセンス廃止完了"
    );

    // 8. リスク要因が5個以上登録されていることを確認
    expect(result.riskFactors.length).toBeGreaterThanOrEqual(5);

    // 9. 各リスク要因の詳細を検証
    expect(result.riskFactors[0].riskName).toBe("データ品質問題");
    expect(result.riskFactors[0].riskSeverity).toBe("high");
    expect(result.riskFactors[0].mitigationStrategy).toContain(
      "データクレンジング"
    );
    expect(result.riskFactors[0].contingencyPlan).toContain("段階的移行");

    expect(result.riskFactors[1].riskName).toBe("ユーザー採用の遅延");
    expect(result.riskFactors[1].riskSeverity).toBe("high");

    expect(result.riskFactors[2].riskName).toBe("統合テスト期間の延長");
    expect(result.riskFactors[2].riskSeverity).toBe("medium");

    expect(result.riskFactors[3].riskName).toBe("パフォーマンス問題");
    expect(result.riskFactors[3].riskSeverity).toBe("medium");

    expect(result.riskFactors[4].riskName).toBe("セキュリティ脅威");
    expect(result.riskFactors[4].riskSeverity).toBe("critical");

    // 10. すべてのリスク要因に対応策が定義されていることを確認
    result.riskFactors.forEach((risk) => {
      expect(risk.mitigationStrategy).toBeDefined();
      expect(risk.mitigationStrategy.length).toBeGreaterThan(0);
      expect(risk.contingencyPlan).toBeDefined();
      expect(risk.contingencyPlan.length).toBeGreaterThan(0);
    });

    // 11. マイルストーンの日付が正順であることを確認
    result.phases.forEach((phase) => {
      phase.milestones.forEach((milestone, index) => {
        if (index > 0) {
          expect(
            new Date(phase.milestones[index - 1].targetDate).getTime()
          ).toBeLessThanOrEqual(new Date(milestone.targetDate).getTime());
        }
      });
    });

    // 12. 移行計画の概要ドキュメント生成可能性を確認
    expect(result.documentGenerationAvailable).toBe(true);
    expect(result.documentUrl).toBeDefined();
    expect(result.documentUrl.length).toBeGreaterThan(0);

    // 13. 移行計画サマリーを検証
    expect(result.summary).toBeDefined();
    expect(result.summary.totalPhases).toBe(3);
    expect(result.summary.totalMilestones).toBeGreaterThanOrEqual(9);
    expect(result.summary.totalRiskFactors).toBeGreaterThanOrEqual(5);
    expect(result.summary.criticalRiskCount).toBe(1);
    expect(result.summary.highRiskCount).toBe(2);
    expect(result.summary.mediumRiskCount).toBe(2);

    // 14. 全体的な検証結果が完了状態であることを確認
    expect(result.completionStatus).toBe("完了");
    expect(result.isReadyForExecution).toBe(true);
  });
});