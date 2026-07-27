import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { reconcileAndRouteDealStatusWithInvoices } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-703: [edge] 段階的対応ルーティング機能 - 照合結果が確定後、営業担当者への対応指示対象案件が0件の場合、対応指示ステップは実行されない
  test("照合結果確定後、対応指示対象案件が0件のとき対応指示ステップは実行されない", () => {
    // 初期化: 照合結果データベースをリセット
    const reconciliation_records = [];
    const action_instruction_trigger_spy = jest.fn();
    const system_logger_spy = jest.fn();

    // 照合プロセスを実行し、照合結果を『確定』状態に遷移
    // 前提: 全ての商談が既に請求書発行済み（対応指示対象外）
    const completed_deals = [
      {
        deal_id: "D001",
        customer_id: "C001",
        status: "受注",
        amount: 100000,
        planned_invoice_date: new Date("2024-01-15T00:00:00Z"),
        invoice_issued_date: new Date("2024-01-15T10:00:00Z"),
        invoice_amount: 100000,
      },
      {
        deal_id: "D002",
        customer_id: "C002",
        status: "完了",
        amount: 200000,
        planned_invoice_date: new Date("2024-01-20T00:00:00Z"),
        invoice_issued_date: new Date("2024-01-20T11:00:00Z"),
        invoice_amount: 200000,
      },
    ];

    const action_instruction_targets = [];

    // 照合確定後、対応指示対象の案件一覧を検索
    const result = reconcileAndRouteDealStatusWithInvoices(
      completed_deals,
      action_instruction_targets,
      {
        onActionInstructionTriggered: action_instruction_trigger_spy,
        onSystemLog: system_logger_spy,
      }
    );

    // 取得した案件一覧が空（件数0件）であることをアサート
    expect(result.action_instruction_target_count).toBe(0);
    expect(result.action_instruction_targets).toEqual([]);

    // 対応指示ステップの実行トリガーが呼び出されていないことを確認
    expect(action_instruction_trigger_spy).not.toHaveBeenCalled();

    // システムログに対応指示ステップの実行記録が存在しないことを検証
    const system_logs = system_logger_spy.mock.calls;
    const action_instruction_step_logs = system_logs.filter((call) =>
      call[0]?.includes?.("対応指示ステップ")
    );
    expect(action_instruction_step_logs).toHaveLength(0);

    // 照合結果ステータスが『確定』であることを確認
    expect(result.reconciliation_status).toBe("確定");
  });
});