import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { matchSalesAndInvoiceData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-930
  test("売上実績レコードに商談IDが未設定の場合、請求書との紐付けに失敗する", () => {
    // テスト用の売上実績レコード（商談IDが null）
    const sales_record = {
      sales_id: "SALES-001",
      customer_id: "CUST-A",
      deal_id: null, // 商談IDが未設定
      amount: 100000,
      record_date: "2024-01-15",
      status: "recorded",
    };

    // テスト用の請求書レコード
    const invoice_record = {
      invoice_id: "INV-2024-001",
      customer_id: "CUST-A",
      invoice_number: "2024-001",
      amount: 100000,
      issue_date: "2024-01-15",
      status: "issued",
    };

    // 照合処理を実行
    const result = matchSalesAndInvoiceData(sales_record, invoice_record);

    // 期待結果: 紐付け失敗ステータスで記録される
    expect(result.match_status).toBe("紐付け失敗");

    // 期待結果: エラー理由として商談IDが未設定のメッセージが出力される
    expect(result.error_reason).toMatch(/商談ID/);

    // 期待結果: 該当レコードペアは未照合状態のまま保持される
    expect(result.is_matched).toBe(false);

    // 期待結果: ログメッセージが記録される
    expect(result.log_message).toMatch(/商談IDが未設定/);
  });
});