import { reconcileSalesAndInvoiceData } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求データ照合機能 - 請求書レコードに請求日が未設定の場合", () => {
  test("SCEN-929: 請求日が未設定のため照合不可として処理される", () => {
    // テストデータ準備
    const salesRecord = {
      sales_id: "S001",
      customer_id: "C001",
      sales_date: new Date("2024-01-15"),
      amount: 100000,
    };

    const invoiceRecord = {
      invoice_id: "INV-001",
      customer_id: "C001",
      invoice_date: null, // 請求日が未設定
      amount: 100000,
    };

    const reconciliationLog = [];

    // 照合処理実行
    const result = reconcileSalesAndInvoiceData(
      salesRecord,
      invoiceRecord,
      reconciliationLog
    );

    // 期待結果(1): 照合結果ステータスが「照合不可」
    expect(result.reconciliation_status).toBe("照合不可");

    // 期待結果(2): エラー理由に「請求日が未設定」と明記
    expect(result.error_reason).toBe("請求日が未設定");

    // 期待結果(3): 売上実績と請求書が「未照合」のまま
    expect(result.sales_reconciliation_status).toBe("未照合");
    expect(result.invoice_reconciliation_status).toBe("未照合");

    // 期待結果(4): システムログに指定されたメッセージが出力
    expect(reconciliationLog).toContainEqual(
      expect.objectContaining({
        message: expect.stringMatching(/invoice_date/),
        error_type: expect.stringMatching(/InvoiceReconciliationError/),
      })
    );
  });
});