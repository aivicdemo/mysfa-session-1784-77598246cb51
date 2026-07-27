import { describe, test, expect, beforeEach, jest } from "@jest/globals";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-696: [edge] 段階的対応ルーティング機能 - 照合結果が確定後、営業管理者への報告対象案件が0件の場合、報告ステップは実行されない
  test("照合結果確定後、報告対象案件が0件のときはNotificationServiceAdapterの呼び出しが記録されない", async () => {
    // ===== Import & Setup =====
    const {
      reconcileAndRouteWorkflow,
    } = await import("../../src/logic/it-1784969823049-1-1-1");

    // ===== Mock Setup =====
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn(),
    };

    // ===== Initial State: 照合対象案件データをセットアップ =====
    // 照合ロジックを通した結果、報告対象（営業管理者への報告が必要）案件が0件となるシナリオ
    // (例: 全案件が既に請求書発行済み & ステータス整合 → 未請求案件・遅延案件が0件)
    const reconciliationData = {
      reconciliation_id: "recon_001",
      reconciliation_date: "2024-04-15T10:00:00Z",
      deal_records: [
        {
          deal_id: "deal_001",
          customer_id: "cust_001",
          status: "completed",
          amount: 100000,
          invoice_issued_date: "2024-04-10T09:00:00Z",
          invoice_status: "issued",
          expected_billing_date: "2024-04-10T09:00:00Z",
        },
        {
          deal_id: "deal_002",
          customer_id: "cust_002",
          status: "completed",
          amount: 200000,
          invoice_issued_date: "2024-04-11T14:00:00Z",
          invoice_status: "issued",
          expected_billing_date: "2024-04-11T14:00:00Z",
        },
      ],
    };

    // ===== Execute: 照合ロジックを実行 & 照合結果を確定ステータスへ遷移 =====
    const workflowResult = await reconcileAndRouteWorkflow(
      reconciliationData,
      mockNotificationServiceAdapter
    );

    // ===== Verify: 照合結果が『確定』ステータスであることを確認 =====
    expect(workflowResult.reconciliation_status).toBe("confirmed");

    // ===== Verify: 報告対象案件をフィルタリング & 件数が0件であることを確認 =====
    const unreported_deals = workflowResult.unverified_deals;
    expect(unreported_deals.length).toBe(0);

    // ===== Verify: ゲートウェイ条件（件数 > 0）を評価 =====
    const should_execute_notification_step = unreported_deals.length > 0;
    expect(should_execute_notification_step).toBe(false);

    // ===== Verify: NotificationServiceAdapterへのメール送信メソッドが呼び出されないことをスパイで検証 =====
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification.mock.calls.length
    ).toBe(0);

    // ===== Verify: ワークフロー実行ログから『報告ステップをスキップ』の記録を確認 =====
    expect(workflowResult.workflow_log).toContain("skip_notification_step");
    expect(workflowResult.workflow_log).toContain(
      "notification_target_count_zero"
    );

    // ===== Verify: ワークフローが次のステップまたは完了状態へ遷移したことを確認 =====
    expect(workflowResult.workflow_state).toBe("completed");
  });
});