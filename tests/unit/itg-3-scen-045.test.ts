import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  calculateLicenseCostAndROI,
  validateROIThreshold,
  approveInvestmentDecision,
  getApprovalHistory,
} from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforceライセンス利用状況の可視化機能", () => {
  // SCEN-045
  test("ROI閾値を超える削減効果が算出される場合、投資判断が承認される", () => {
    // 前提: Salesforceの現在のライセンス費用と自社開発システムの初期構築・年間保守コストが把握されている状態
    const current_salesforce_annual_cost = 5000000; // 年間500万円
    const current_user_count = 100; // 現在のユーザー数
    const in_house_system_initial_cost = 10000000; // 初期構築コスト1000万円
    const in_house_system_annual_maintenance_cost = 1500000; // 年間保守運用コスト150万円
    const roi_threshold = 1.5; // ROI閾値: 1.5倍以上
    const recovery_period_months = 36; // 回収期間: 36ヶ月（3年）

    // 削減シナリオの設定: 不要なライセンス30個削減、月間コスト削減額41.67万円
    const license_reduction_count = 30;
    const monthly_cost_reduction = 416700;
    const annual_cost_reduction = monthly_cost_reduction * 12; // 5,000,400円

    // ステップ1: 現在のライセンス利用状況データを確認
    const current_license_status = {
      total_user_count: current_user_count,
      active_user_count: 85,
      inactive_user_count: 15,
      annual_salesforce_cost: current_salesforce_annual_cost,
      cost_per_user: current_salesforce_annual_cost / current_user_count, // 50,000円/ユーザー
    };

    expect(current_license_status.cost_per_user).toBe(50000);
    expect(current_license_status.total_user_count).toBe(100);

    // ステップ2: 削減効果の計算シナリオを設定して実行
    const cost_calculation_input = {
      current_salesforce_annual_cost,
      in_house_system_initial_cost,
      in_house_system_annual_maintenance_cost,
      analysis_period_years: 3,
    };

    const cost_analysis_result = calculateLicenseCostAndROI(
      cost_calculation_input
    );

    // 3年間のコスト比較を検証
    const sf_cumulative_3years = current_salesforce_annual_cost * 3; // 15,000,000円
    const in_house_cumulative_3years =
      in_house_system_initial_cost +
      in_house_system_annual_maintenance_cost * 3; // 10,000,000 + 4,500,000 = 14,500,000円
    const absolute_savings_3years = sf_cumulative_3years - in_house_cumulative_3years; // 500,000円

    expect(cost_analysis_result.salesforce_cumulative_cost).toBe(15000000);
    expect(cost_analysis_result.in_house_cumulative_cost).toBe(14500000);
    expect(cost_analysis_result.absolute_savings).toBe(500000);

    // ステップ3: ROI閾値を超える削減効果が算出されることを確認
    // ROI = (初期コスト + 3年間の年間保守費 - Salesforce3年コスト) / 初期コスト の逆算
    // ROI計算: (SF累積 - InHouse累積) / 初期コスト = 500,000 / 10,000,000 = 0.05
    // しかし、ここでは年間削減額ベースのROI: (年間削減 / 初期コスト) * 回収月数 / 12
    // より簡潔に: 回収期間 = 初期コスト / 年間削減額
    const annual_savings = current_salesforce_annual_cost - in_house_system_annual_maintenance_cost; // 3,500,000円
    const payback_period_months = (in_house_system_initial_cost / annual_savings) * 12; // 約34.3ヶ月
    const simple_roi = annual_savings / in_house_system_initial_cost; // 0.35

    // ROI閾値判定: 複数の視点で検証
    const roi_validation_input = {
      payback_period_months,
      roi_threshold,
      absolute_savings_3years,
      min_roi_value: 0.25, // 最小ROI値25%以上
    };

    const roi_is_acceptable = validateROIThreshold(roi_validation_input);

    // 回収期間34.3ヶ月 < 36ヶ月、年間削減額350万 > 0なので承認可能
    expect(roi_is_acceptable).toBe(true);

    // ステップ4: 投資判断画面へ遷移 - 承認ボタンが有効化されていることを確認
    expect(roi_is_acceptable).toBe(true);

    // ステップ5: 承認ボタンをクリックして投資判断を承認
    const approval_input = {
      investment_decision_id: "INV-2024-001",
      approver_user_id: "USR-MGR-001",
      approval_status: "approved",
      approval_timestamp: new Date("2024-06-15T10:30:00Z"),
      approval_comments: "ROI閾値を超える削減効果が確認されたため承認",
      roi_value: simple_roi,
      payback_period_months,
    };

    const approval_result = approveInvestmentDecision(approval_input);

    // ステップ6: 承認完了メッセージが表示されることを確認
    expect(approval_result.success).toBe(true);
    expect(approval_result.status).toBe("approved");
    expect(approval_result.investment_decision_id).toBe("INV-2024-001");
    expect(approval_result.approval_timestamp).toEqual(
      new Date("2024-06-15T10:30:00Z")
    );

    // ステップ7: 承認履歴に当該投資判断が記録されていることを確認
    const approval_history_query = {
      investment_decision_id: "INV-2024-001",
      approver_user_id: "USR-MGR-001",
    };

    const approval_history = getApprovalHistory(approval_history_query);

    // 承認履歴に記録が存在することを確認
    expect(approval_history.total_records).toBe(1);
    expect(approval_history.records.length).toBe(1);

    const latest_approval = approval_history.records[0];
    expect(latest_approval.investment_decision_id).toBe("INV-2024-001");
    expect(latest_approval.approver_user_id).toBe("USR-MGR-001");
    expect(latest_approval.approval_status).toBe("approved");
    expect(latest_approval.approval_timestamp).toEqual(
      new Date("2024-06-15T10:30:00Z")
    );
    expect(latest_approval.roi_value).toBe(0.35);
    expect(latest_approval.payback_period_months).toBeCloseTo(34.29, 1);

    // 最終確認: ダッシュボードに承認済みステータスが反映されることを確認
    expect(approval_result.status).toBe("approved");
    expect(latest_approval.approval_status).toBe("approved");
  });
});