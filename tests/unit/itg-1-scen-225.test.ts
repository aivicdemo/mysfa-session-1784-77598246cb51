import { validateMigrationPlan } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-225: システム移行計画策定 - リスク要因が定義されていない移行計画が不完全として検出される", () => {
    // 前提: 営業管理システムにログイン済みで、システム移行計画策定画面が表示されている状態
    // 発生条件: 移行計画の基本情報、スケジュール定義は入力されたが、リスク要因が空のまま保存ボタンをクリック
    // 期待結果: リスク要因が定義されていないことを示すエラーが throw される

    const incompleteplan_with_empty_risk_factors = {
      plan_name: "Salesforce to 自社システム移行計画",
      planned_start_date: "2024-06-01",
      planned_end_date: "2024-08-31",
      migration_phases: [
        {
          phase_number: 1,
          phase_name: "データ抽出・マッピング",
          start_date: "2024-06-01",
          end_date: "2024-06-15",
          milestone: "データマッピング定義完了",
        },
        {
          phase_number: 2,
          phase_name: "システム構築・テスト",
          start_date: "2024-06-16",
          end_date: "2024-07-31",
          milestone: "UAT完了",
        },
        {
          phase_number: 3,
          phase_name: "本番移行・運用開始",
          start_date: "2024-08-01",
          end_date: "2024-08-31",
          milestone: "本番環境稼働",
        },
      ],
      risk_factors: [],
      mitigation_strategies: [],
      contingency_plans: [],
    };

    // リスク要因が空配列の場合、エラーが throw される
    expect(() =>
      validateMigrationPlan(incompleteplan_with_empty_risk_factors)
    ).toThrow(/リスク要因/);
  });
});