import { describe, test, expect, beforeEach, jest } from "@jest/globals";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-953: [normal] 売上実績・請求状況照合機能 - 移行前後で売上実績に対応する請求書が複数件の場合、全件の照合が実行される
  test("売上実績に対応する複数件の請求書が全件検索・照合され、合計金額が一致することを確認", async () => {
    // ============================================================
    // 前提条件の整備
    // ============================================================
    const sales_id = "SALES-001";
    const customer_name = "顧客A";
    const sales_amount = 300000;
    const sales_recorded_date = new Date("2024-04-15T10:00:00Z");

    const invoice_1_id = "INV-001";
    const invoice_1_amount = 100000;
    const invoice_1_issue_date = new Date("2024-04-16T09:00:00Z");

    const invoice_2_id = "INV-002";
    const invoice_2_amount = 100000;
    const invoice_2_issue_date = new Date("2024-04-17T09:00:00Z");

    const invoice_3_id = "INV-003";
    const invoice_3_amount = 100000;
    const invoice_3_issue_date = new Date("2024-04-18T09:00:00Z");

    // テストデータ: 売上実績レコード
    const sales_record = {
      sales_id,
      customer_name,
      amount: sales_amount,
      recorded_date: sales_recorded_date.toISOString(),
      status: "completed",
    };

    // テストデータ: 請求書レコード3件
    const invoices = [
      {
        invoice_id: invoice_1_id,
        sales_id,
        customer_name,
        amount: invoice_1_amount,
        issue_date: invoice_1_issue_date.toISOString(),
        status: "issued",
        is_reconciled: false,
        reconciliation_status: null,
        reconciliation_datetime: null,
      },
      {
        invoice_id: invoice_2_id,
        sales_id,
        customer_name,
        amount: invoice_2_amount,
        issue_date: invoice_2_issue_date.toISOString(),
        status: "issued",
        is_reconciled: false,
        reconciliation_status: null,
        reconciliation_datetime: null,
      },
      {
        invoice_id: invoice_3_id,
        sales_id,
        customer_name,
        amount: invoice_3_amount,
        issue_date: invoice_3_issue_date.toISOString(),
        status: "issued",
        is_reconciled: false,
        reconciliation_status: null,
        reconciliation_datetime: null,
      },
    ];

    // ============================================================
    // モック関数・適応オブジェクトの定義
    // ============================================================
    const mock_database = {
      getSalesRecord: jest.fn().mockResolvedValue(sales_record),
      getInvoicesBySalesId: jest.fn().mockResolvedValue(invoices),
      updateInvoiceReconciliation: jest.fn().mockResolvedValue(undefined),
      logSystemActivity: jest.fn().mockResolvedValue(undefined),
    };

    // ============================================================
    // 対象関数のインポート
    // ============================================================
    const { reconcileSalesWithInvoices } = await import(
      "../../src/logic/it-1784969823049-1-1-1"
    );

    // ============================================================
    // テスト実行
    // ============================================================
    const reconciliation_datetime = new Date("2024-04-20T10:00:00Z");

    const result = await reconcileSalesWithInvoices(
      sales_id,
      mock_database,
      reconciliation_datetime
    );

    // ============================================================
    // 期待結果の検証
    // ============================================================

    // (1) 売上実績が正しく取得されたことを確認
    expect(mock_database.getSalesRecord).toHaveBeenCalledWith(sales_id);

    // (2) 該当売上実績に紐付く請求書の全件検索が実行されたことを確認
    expect(mock_database.getInvoicesBySalesId).toHaveBeenCalledWith(sales_id);

    // (3) 照合対象の請求書が3件であることを確認
    expect(result.matched_invoices).toHaveLength(3);

    // (4) 各請求書が正しく検出されたことを確認
    expect(result.matched_invoices).toContainEqual(
      expect.objectContaining({
        invoice_id: invoice_1_id,
        amount: invoice_1_amount,
      })
    );
    expect(result.matched_invoices).toContainEqual(
      expect.objectContaining({
        invoice_id: invoice_2_id,
        amount: invoice_2_amount,
      })
    );
    expect(result.matched_invoices).toContainEqual(
      expect.objectContaining({
        invoice_id: invoice_3_id,
        amount: invoice_3_amount,
      })
    );

    // (5) 合計請求額が売上実績の金額と一致することを確認
    const total_invoice_amount = result.matched_invoices.reduce(
      (sum: number, inv: { amount: number }) => sum + inv.amount,
      0
    );
    expect(total_invoice_amount).toBe(sales_amount);
    expect(total_invoice_amount).toBe(300000);

    // (6) 照合ステータスが『完全一致』として記録されていることを確認
    expect(result.reconciliation_result_status).toBe("完全一致");

    // (7) 各請求書に対して照合済みフラグが立てられていることを確認
    expect(result.matched_invoices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          is_reconciled: true,
        }),
        expect.objectContaining({
          is_reconciled: true,
        }),
        expect.objectContaining({
          is_reconciled: true,
        }),
      ])
    );

    // (8) 各請求書に照合日時が記録されていることを確認
    result.matched_invoices.forEach((invoice: { reconciliation_datetime: string | null }) => {
      expect(invoice.reconciliation_datetime).not.toBeNull();
      expect(typeof invoice.reconciliation_datetime).toBe("string");
    });

    // (9) updateInvoiceReconciliation が3件全て呼び出されたことを確認
    expect(mock_database.updateInvoiceReconciliation).toHaveBeenCalledTimes(3);

    // (10) 各請求書について updateInvoiceReconciliation が正しく呼び出されたことを確認
    expect(mock_database.updateInvoiceReconciliation).toHaveBeenCalledWith(
      invoice_1_id,
      true,
      "完全一致",
      reconciliation_datetime.toISOString()
    );
    expect(mock_database.updateInvoiceReconciliation).toHaveBeenCalledWith(
      invoice_2_id,
      true,
      "完全一致",
      reconciliation_datetime.toISOString()
    );
    expect(mock_database.updateInvoiceReconciliation).toHaveBeenCalledWith(
      invoice_3_id,
      true,
      "完全一致",
      reconciliation_datetime.toISOString()
    );

    // (11) システムログに3件全ての請求書の照合処理が記録されたことを確認
    expect(mock_database.logSystemActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action_type: "reconciliation_executed",
        sales_id,
        invoice_count: 3,
      })
    );

    // (12) 照合完了日時が正しく記録されていることを確認
    expect(result.reconciliation_completed_datetime).toBe(
      reconciliation_datetime.toISOString()
    );

    // (13) 最終的な照合結果オブジェクトの構造を確認
    expect(result).toEqual(
      expect.objectContaining({
        sales_id,
        matched_invoice_count: 3,
        total_invoice_amount: 300000,
        sales_amount: 300000,
        reconciliation_result_status: "完全一致",
      })
    );
  });
});