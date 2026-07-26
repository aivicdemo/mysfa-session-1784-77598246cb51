import { validateMonthlyReportDataConsistency } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-134
  test("月次営業成績報告書の売上・請求データ検証 - 報告書の件数とシステム元データの件数が一致しない場合、差分が特定され差し戻し対象となる", () => {
    // 月次営業成績報告書（営業担当者が手動入力したデータ）
    const monthlyReport = {
      report_id: "RPT-2024-04-001",
      reporting_period: "2024-04",
      sales_count: 10,
      sales_amount: 1500000,
      invoice_count: 5,
      invoice_amount: 1200000,
      status: "pending_validation",
      submitted_at: "2024-05-01T10:00:00Z",
    };

    // システム元データ（営業管理システムから抽出した実際のデータ）
    const systemMasterData = {
      total_sales_records: 15,
      total_sales_amount: 1800000,
      total_invoice_records: 8,
      total_invoice_amount: 1350000,
    };

    // 検証結果
    const validationResult = validateMonthlyReportDataConsistency(
      monthlyReport,
      systemMasterData
    );

    // 売上件数の差分: 15 - 10 = 5
    // 請求件数の差分: 8 - 5 = 3
    // いずれも差分がプラスなので、報告書が過少報告していることを意味する

    expect(validationResult.is_consistent).toBe(false);
    expect(validationResult.status).toBe("reject_and_return");

    expect(validationResult.discrepancies).toEqual([
      {
        field: "sales_count",
        report_value: 10,
        system_value: 15,
        difference: 5,
        discrepancy_type: "shortage_in_report",
      },
      {
        field: "invoice_count",
        report_value: 5,
        system_value: 8,
        difference: 3,
        discrepancy_type: "shortage_in_report",
      },
    ]);

    expect(validationResult.summary).toBe(
      "売上件数の差分：+5件、請求件数の差分：+3件"
    );

    // 差し戻し対象リストに登録される
    expect(validationResult.rejection_reason).toBe(
      "報告書の売上・請求件数がシステム元データと一致しません。確認後、修正版を再提出してください。"
    );

    expect(validationResult.requires_resubmission).toBe(true);
    expect(validationResult.can_be_listed_in_rejection_queue).toBe(true);
  });
});